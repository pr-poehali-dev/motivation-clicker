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
    type: str = 'question'
    insight: str = None

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
    
    # Определяем текущий этап на основе количества карточек
    current_count = therapy_req.current_count
    
    if current_count == 0:
        phase = "screening"
        phase_desc = "ЭТАП 1: СКРИНИНГ (карточки 1-5)"
        instructions = """Определи основную проблему:
- Какая основная эмоция: тревога/грусть/злость/стыд?
- Насколько сильно это мешает жизни?
- Как давно это началось?

После 5 вопросов добавь карточку-инсайт (type: "insight") с промежуточной сводкой:
- Суммируй выявленную эмоцию и интенсивность
- Покажи эмпатию: "Я вижу, что тебе сейчас тяжело..."
- Обозначь направление: "Давай разберёмся, что запускает это состояние"

Сгенерируй 6 карточек: 5 вопросов + 1 инсайт"""
    elif current_count < 12:
        phase = "triggers"
        phase_desc = "ЭТАП 2: ТРИГГЕРЫ (карточки 6-12)"
        instructions = """Ищем триггеры на основе ответов пользователя:
- Связано ли с людьми? (партнёр, родители, коллеги)
- Связано ли с местом? (работа, дом, транспорт)
- Есть ли временной паттерн? (утро/вечер, выходные)
- Есть ли физические факторы? (недосып, голод)

После 6 вопросов добавь инсайт:
- Определи главный триггер из ответов
- Покажи закономерность: "Похоже, это происходит когда..."
- Переход: "Теперь разберём, как ты на это реагируешь"

Сгенерируй 7 карточек: 6 вопросов + 1 инсайт"""
    elif current_count < 20:
        phase = "cognition"
        phase_desc = "ЭТАП 3: МЫСЛИ И УБЕЖДЕНИЯ (карточки 13-20)"
        instructions = """Исследуем автоматические мысли:
- Какие мысли возникают в момент триггера?
- Есть ли катастрофизация? ("Всё пропало", "Я никогда...")
- Есть ли чёрно-белое мышление? ("Всегда/никогда")
- Ты веришь в эти мысли на 100%?

После 7 вопросов добавь инсайт:
- Покажи иррациональные убеждения из ответов
- Мягко оспорь: "Эта мысль правда или просто привычка?"
- Переход: "Посмотрим, как это влияет на твои действия"

Сгенерируй 8 карточек: 7 вопросов + 1 инсайт"""
    elif current_count < 28:
        phase = "behavior"
        phase_desc = "ЭТАП 4: ПОВЕДЕНЧЕСКИЕ РЕАКЦИИ (карточки 21-28)"
        instructions = """Анализируем поведение:
- Как ты реагируешь? (избегаешь, замираешь, нападаешь)
- Это помогает или усугубляет?
- Ты замечал этот паттерн раньше?
- Хочешь изменить реакцию?

После 7 вопросов добавь инсайт:
- Опиши поведенческий паттерн: "Ты используешь стратегию [X]"
- Объясни последствия: "Краткосрочно помогает, но долгосрочно..."
- Переход: "Найдём ресурсы для изменения"

Сгенерируй 8 карточек: 7 вопросов + 1 инсайт"""
    elif current_count < 36:
        phase = "resources"
        phase_desc = "ЭТАП 5: РЕСУРСЫ И ПОДДЕРЖКА (карточки 29-36)"
        instructions = """Ищем ресурсы:
- Есть ли поддержка? (друзья, семья, терапевт)
- Что помогало раньше? (спорт, творчество, природа)
- Готов пробовать новое? (дыхание, медитация, journaling)
- Есть ли время для себя?

После 7 вопросов добавь инсайт:
- Перечисли найденные ресурсы
- Поддержи: "У тебя уже есть инструменты!"
- Переход: "Составим план действий"

Сгенерируй 8 карточек: 7 вопросов + 1 инсайт"""
    else:
        phase = "action"
        phase_desc = "ЭТАП 6: ПЛАН ДЕЙСТВИЙ (карточки 37+)"
        instructions = """Создаём конкретный план:
- Готов попробовать одно маленькое изменение?
- Если почувствуешь триггер, сделаешь паузу?
- Можешь попросить поддержки?
- Вернёшься через неделю проверить прогресс?

После 6-8 вопросов добавь ФИНАЛЬНУЮ сводку (type: "insight"):
- Суммируй весь путь: проблема → триггеры → мысли → реакции → ресурсы
- Дай конкретный план на неделю
- Мотивируй: "Ты уже сделал первый шаг, осознав паттерн"
- Предложи вернуться

Сгенерируй 8-10 карточек с финальной сводкой"""

    user_prompt = f"""Ты опытный психотерапевт. Проводишь структурированную мини-сессию через карточки.

{phase_desc}
Текущая карточка: {current_count + 1}

{instructions}

ФОРМАТ КАРТОЧЕК:
1. Обычная карточка-вопрос:
{{"id": X, "type": "question", "question": "Текст вопроса?", "category": "{phase}"}}

2. Карточка-инсайт (промежуточная сводка):
{{"id": X, "type": "insight", "question": "Заголовок", "insight": "Полный текст сводки на 3-5 предложений", "category": "Сводка: {phase}"}}

ПРАВИЛА:
- Вопросы короткие, на "ты", без "пожалуйста"
- Только ДА/НЕТ формат
- Адаптируй под ответы пользователя из истории
- Инсайты пиши тёплым, поддерживающим тоном

Верни JSON:
{{
  "cards": [...]
}}"""
    
    if therapy_req.history:
        history_text = "\n".join([
            f"Q: {item['question']} | A: {'ДА' if item['answer'] else 'НЕТ'}"
            for item in therapy_req.history
        ])
        user_prompt += f"\n\nИСТОРИЯ ОТВЕТОВ ПОЛЬЗОВАТЕЛЯ:\n{history_text}\n\nАдаптируй вопросы под эти ответы, ищи глубину и закономерности."
    
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