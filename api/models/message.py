"""
メッセージモデル
会話メッセージのCRUD操作を提供
"""
from datetime import datetime
from bson import ObjectId
from services.db_service import db_service


def create_message(thread_id, role, content):
    """
    新規メッセージを作成

    Args:
        thread_id (str): スレッドID
        role (str): 'user' または 'assistant'
        content (str): メッセージ内容

    Returns:
        dict: 作成されたメッセージ
    """
    collection = db_service.get_messages_collection()

    message = {
        'thread_id': ObjectId(thread_id),
        'role': role,
        'content': content,
        'created_at': datetime.utcnow()
    }

    result = collection.insert_one(message)
    message['_id'] = result.inserted_id

    return _format_message(message)


def get_messages_by_thread(thread_id):
    """
    特定スレッドの全メッセージを取得（作成日時の昇順）

    Args:
        thread_id (str): スレッドID

    Returns:
        list: メッセージのリスト
    """
    collection = db_service.get_messages_collection()

    try:
        messages = collection.find(
            {'thread_id': ObjectId(thread_id)}
        ).sort('created_at', 1)

        return [_format_message(msg) for msg in messages]
    except Exception as e:
        print(f"メッセージ取得エラー: {e}")
        return []


def get_conversation_history(thread_id):
    """
    会話履歴をAI API用のフォーマットで取得

    Args:
        thread_id (str): スレッドID

    Returns:
        list: AI API用の会話履歴
            [
                {'role': 'user', 'content': 'こんにちは'},
                {'role': 'assistant', 'content': 'こんにちは！'}
            ]
    """
    messages = get_messages_by_thread(thread_id)

    return [
        {
            'role': msg['role'],
            'content': msg['content']
        }
        for msg in messages
    ]


def delete_messages_by_thread(thread_id):
    """
    特定スレッドの全メッセージを削除

    Args:
        thread_id (str): スレッドID

    Returns:
        int: 削除されたメッセージ数
    """
    collection = db_service.get_messages_collection()

    try:
        result = collection.delete_many({'thread_id': ObjectId(thread_id)})
        return result.deleted_count
    except Exception as e:
        print(f"メッセージ削除エラー: {e}")
        return 0


def delete_message(message_id):
    """
    特定のメッセージを削除

    Args:
        message_id (str): メッセージID

    Returns:
        bool: 削除成功したか
    """
    collection = db_service.get_messages_collection()

    try:
        result = collection.delete_one({'_id': ObjectId(message_id)})
        return result.deleted_count > 0
    except Exception as e:
        print(f"メッセージ削除エラー: {e}")
        return False


def _format_message(message):
    """
    メッセージをフロントエンド用にフォーマット

    Args:
        message (dict): MongoDBのメッセージドキュメント

    Returns:
        dict: フォーマットされたメッセージ
    """
    if not message:
        return None

    return {
        'id': str(message['_id']),
        'thread_id': str(message['thread_id']),
        'role': message['role'],
        'content': message['content'],
        'created_at': message['created_at'].isoformat()
    }
