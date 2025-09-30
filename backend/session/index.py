import json
import os
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
import psycopg2
from psycopg2.extras import RealDictCursor

class SessionData(BaseModel):
    client_id: str
    history: list = Field(default_factory=list)
    current_index: int = 0
    cards: list = Field(default_factory=list)

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise ValueError('DATABASE_URL not configured')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управление сессиями терапии - сохранение и загрузка истории ответов пользователя
    Args: event с httpMethod (GET/POST/DELETE), queryStringParameters (client_id), body (session_data)
    Returns: HTTP response с данными сессии или статусом операции
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {})
            client_id = params.get('client_id')
            
            if not client_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'client_id required'})
                }
            
            cursor.execute(
                "SELECT client_id, history, current_index, cards FROM therapy_sessions WHERE client_id = %s",
                (client_id,)
            )
            row = cursor.fetchone()
            
            if row:
                session = SessionData(
                    client_id=row['client_id'],
                    history=json.loads(row['history']) if isinstance(row['history'], str) else row['history'],
                    current_index=row['current_index'],
                    cards=json.loads(row['cards']) if isinstance(row['cards'], str) else row['cards']
                )
            else:
                session = SessionData(client_id=client_id)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps(session.model_dump())
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            session = SessionData(**body_data)
            
            cursor.execute("""
                INSERT INTO therapy_sessions (client_id, history, current_index, cards, updated_at)
                VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT (client_id) 
                DO UPDATE SET 
                    history = EXCLUDED.history,
                    current_index = EXCLUDED.current_index,
                    cards = EXCLUDED.cards,
                    updated_at = CURRENT_TIMESTAMP
            """, (
                session.client_id,
                json.dumps(session.history),
                session.current_index,
                json.dumps(session.cards)
            ))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'success': True})
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters', {})
            client_id = params.get('client_id')
            
            if not client_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'client_id required'})
                }
            
            cursor.execute("DELETE FROM therapy_sessions WHERE client_id = %s", (client_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({'success': True})
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Method not allowed'})
            }
    
    finally:
        cursor.close()
        conn.close()