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
        phase_desc = "ЭТАП 1: СКРИНИНГ (карточки 1-8)"
        instructions = """Определи основную проблему:
- Какая основная эмоция: тревога/грусть/злость/стыд?
- Насколько сильно это мешает жизни?
- Как давно это началось?

Сгенерируй 8 вопросов БЕЗ инсайтов."""
    elif current_count < 16:
        phase = "triggers"
        phase_desc = "ЭТАП 2: ТРИГГЕРЫ (карточки 9-16)"
        instructions = """Ищем триггеры на основе ответов пользователя:
- Связано ли с людьми? (партнёр, родители, коллеги)
- Связано ли с местом? (работа, дом, транспорт)
- Есть ли временной паттерн? (утро/вечер, выходные)
- Есть ли физические факторы? (недосып, голод)

После 8 вопросов добавь ОДИН короткий инсайт (максимум 2 предложения):
- Определи главный триггер: "Судя по ответам, чаще всего это происходит [когда/где]"
- Переход: "Разберём твою реакцию"

Сгенерируй 9 карточек: 8 вопросов + 1 инсайт"""
    elif current_count < 26:
        phase = "cognition"
        phase_desc = "ЭТАП 3: МЫСЛИ И РЕАКЦИИ (карточки 17-26)"
        instructions = """Исследуем мысли и поведение:
- Какие мысли возникают в момент триггера?
- Есть ли катастрофизация?
- Как ты реагируешь? (избегаешь, замираешь)
- Это помогает или усугубляет?

После 9 вопросов добавь инсайт (максимум 2 предложения):
- Опиши паттерн: "Ты думаешь [X] и реагируешь [Y]"
- Переход: "Поищем ресурсы"

Сгенерируй 10 карточек: 9 вопросов + 1 инсайт"""
    elif current_count < 36:
        phase = "resources"
        phase_desc = "ЭТАП 4: РЕСУРСЫ (карточки 27-36)"
        instructions = """Ищем ресурсы:
- Есть ли поддержка?
- Что помогало раньше?
- Готов пробовать новое?
- Есть ли время для себя?

После 9 вопросов добавь инсайт (максимум 2 предложения):
- "У тебя уже есть [ресурс]"
- "Составим план"

Сгенерируй 10 карточек: 9 вопросов + 1 инсайт"""
    else:
        phase = "action"
        phase_desc = "ЭТАП 5: ПЛАН (карточки 37+)"
        instructions = """Создаём план:
- Готов попробовать одно изменение?
- Сделаешь паузу при триггере?
- Можешь попросить поддержки?

После 8 вопросов добавь ФИНАЛЬНЫЙ инсайт (максимум 3 предложения):
- Краткий путь: проблема → триггер → реакция
- Конкретный план на неделю
- "Ты уже сделал шаг"

Сгенерируй 9 карточек: 8 вопросов + 1 инсайт"""

    user_prompt = f"""Ты опытный психотерапевт. Проводишь структурированную мини-сессию через карточки.

{phase_desc}
Текущая карточка: {current_count + 1}

{instructions}

ФОРМАТ КАРТОЧЕК:
1. Обычная карточка-вопрос:
{{"id": X, "type": "question", "question": "Текст вопроса?", "category": "{phase}"}}

2. Карточка-инсайт (промежуточная сводка):
{{"id": X, "type": "insight", "question": "Заголовок", "insight": "Краткий текст 1-3 предложения", "category": "Сводка: {phase}"}}

ПРАВИЛА:
- Вопросы короткие, на "ты", без "пожалуйста"
- Только ДА/НЕТ формат
- Адаптируй под ответы пользователя из истории
- Инсайты ОЧЕНЬ короткие (1-3 предложения максимум), тёплым тоном

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
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "Ты опытный психотерапевт. Отвечай только валидным JSON без markdown форматирования."},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7
        )
        
        output_text = response.choices[0].message.content
        if not output_text:
            raise ValueError("No output from model")
        
        # Remove markdown code blocks if present
        output_text = output_text.strip()
        if output_text.startswith('```'):
            lines = output_text.split('\n')
            output_text = '\n'.join(lines[1:-1]) if len(lines) > 2 else output_text
        
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