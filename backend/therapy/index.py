import json
import os
from typing import Dict, Any, List
from openai import OpenAI
from pydantic import BaseModel, Field

class TherapyRequest(BaseModel):
    history: List[Dict[str, Any]] = Field(default_factory=list)
    current_count: int = Field(default=0)

class Card(BaseModel):
    id: int
    question: str
    category: str

class CardsResponse(BaseModel):
    cards: List[Card]

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Генерирует терапевтические карточки с вопросами на основе истории ответов пользователя
    Args: event с httpMethod, body (history, current_count); context с request_id
    Returns: HTTP response с массивом карточек
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    therapy_req = TherapyRequest(**body_data)
    
    api_key = os.environ.get('OPENAI_API_KEY')
    proxy_url = os.environ.get('HTTP_PROXY_URL')
    
    if not api_key:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'OpenAI API key not configured'})
        }
    
    client_kwargs = {'api_key': api_key}
    if proxy_url:
        import httpx
        client_kwargs['http_client'] = httpx.Client(proxy=proxy_url)
    
    client = OpenAI(**client_kwargs)
    
    user_prompt = """Ты опытный психотерапевт, работающий по методу CBT (когнитивно-поведенческой терапии). 
Твоя цель - провести мини-сессию через карточки с вопросами ДА/НЕТ.

СТРУКТУРА ТЕРАПЕВТИЧЕСКОЙ СЕССИИ (следуй строго):

ЭТАП 1 (карточки 1-5): СКРИНИНГ И ВЫЯВЛЕНИЕ ПРОБЛЕМЫ
- Определи основную эмоцию: тревога, грусть, злость, стыд?
- Выясни, когда началось и как сильно влияет на жизнь
- Категория: "screening"

ЭТАП 2 (карточки 6-10): АНАЛИЗ ТРИГГЕРОВ
- Что запускает это состояние? (люди, места, ситуации)
- Есть ли паттерн? (время суток, определённые дни)
- Категория: "triggers"

ЭТАП 3 (карточки 11-15): КОГНИТИВНАЯ ЧАСТЬ
- Какие автоматические мысли возникают?
- Есть ли катастрофизация или чёрно-белое мышление?
- Категория: "cognition"

ЭТАП 4 (карточки 16-20): ПОВЕДЕНЧЕСКИЕ ПАТТЕРНЫ
- Как ты реагируешь на триггер? (избегание, борьба, замирание)
- Что помогает/не помогает справляться?
- Категория: "behavior"

ЭТАП 5 (карточки 21-25): РЕСУРСЫ И ПРАКТИКИ
- Есть ли поддержка, хобби, техники релаксации?
- Готов ли пробовать новое?
- Категория: "resources"

ЭТАП 6 (карточки 26+): ЗАВЕРШЕНИЕ И ПЛАН
- Вопросы-утверждения для закрепления инсайтов
- Конкретные действия на ближайшие дни
- Категория: "action"

ПРАВИЛА:
- Вопросы короткие, на "ты", простым языком
- Только ДА/НЕТ формат (свайп влево=НЕТ, вправо=ДА)
- Адаптируй следующие вопросы под ответы пользователя
- Категория показывает этап терапии

Сгенерируй РОВНО 10 карточек в формате JSON:
{
  "cards": [
    {"id": 0, "question": "текст вопроса", "category": "screening"},
    ...
  ]
}"""
    
    if therapy_req.history:
        history_text = "\n".join([
            f"Q: {item['question']} | A: {'ДА' if item['answer'] else 'НЕТ'}"
            for item in therapy_req.history
        ])
        user_prompt = f"""Ты опытный терапевт-психолог. Твоя задача - через серию вопросов ДА/НЕТ определить источник тревоги или боли человека и помочь ему разобраться.

Правила генерации вопросов:
1. Вопросы должны быть короткими, понятными, на русском языке
2. Только ДА/НЕТ формат (человек свайпает влево=НЕТ, вправо=ДА)
3. Анализируй историю ответов и задавай целевые вопросы
4. После 15-20 вопросов переходи к практикам и советам
5. Категории: "diagnostic" (диагностика), "clarification" (уточнение), "practice" (практика)

История ответов пользователя:
{history_text}

На основе этой истории сгенерируй следующие 10 вопросов в формате JSON:
{{
  "cards": [
    {{"id": 0, "question": "текст вопроса", "category": "diagnostic"}},
    ...
  ]
}}"""
    
    try:
        response = client.responses.create(
            model="gpt-5-nano",
            input=user_prompt,
            reasoning={"effort": "low"},
            text={"format": {"type": "text"}}
        )
        
        output_items = response.output
        if not output_items:
            raise ValueError("No output from model")
        
        # Find the message item (not reasoning)
        message_item = None
        for item in output_items:
            if hasattr(item, 'type') and item.type == 'message':
                message_item = item
                break
        
        if not message_item:
            raise ValueError("No message in output")
        
        # Extract text from message content
        if hasattr(message_item, 'content') and message_item.content:
            text_content = message_item.content[0]
            output_text = text_content.text if hasattr(text_content, 'text') else str(text_content)
        else:
            raise ValueError("No content in message")
        
        result = json.loads(output_text)
        cards = result.get('cards', [])
        
        for i, card in enumerate(cards):
            card['id'] = therapy_req.current_count + i
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'cards': cards})
        }
        
    except Exception as e:
        error_details = {
            'error': str(e),
            'error_type': type(e).__name__,
            'response_debug': str(response.model_dump()) if 'response' in locals() else 'No response',
            'output_debug': str(response.output) if 'response' in locals() and hasattr(response, 'output') else 'No output'
        }
        
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(error_details)
        }