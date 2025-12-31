"""
スレッドモデル
会話スレッドのCRUD操作を提供
"""
from datetime import datetime
from bson import ObjectId
from services.db_service import db_service


def create_thread(title="新しい会話"):
    """
    新規スレッドを作成

    Args:
        title (str): スレッドのタイトル

    Returns:
        dict: 作成されたスレッド
    """
    collection = db_service.get_threads_collection()

    thread = {
        'title': title,
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }

    result = collection.insert_one(thread)
    thread['_id'] = result.inserted_id

    return _format_thread(thread)


def get_threads():
    """
    全スレッドを取得（更新日時の降順）

    Returns:
        list: スレッドのリスト
    """
    collection = db_service.get_threads_collection()
    threads = collection.find().sort('updated_at', -1)

    return [_format_thread(thread) for thread in threads]


def get_thread_by_id(thread_id):
    """
    IDでスレッドを取得

    Args:
        thread_id (str): スレッドID

    Returns:
        dict: スレッド、存在しない場合はNone
    """
    collection = db_service.get_threads_collection()

    try:
        thread = collection.find_one({'_id': ObjectId(thread_id)})
        return _format_thread(thread) if thread else None
    except Exception as e:
        print(f"スレッド取得エラー: {e}")
        return None


def update_thread(thread_id, title=None):
    """
    スレッドを更新

    Args:
        thread_id (str): スレッドID
        title (str, optional): 新しいタイトル

    Returns:
        dict: 更新されたスレッド、失敗時はNone
    """
    collection = db_service.get_threads_collection()

    update_data = {'updated_at': datetime.utcnow()}
    if title:
        update_data['title'] = title

    try:
        result = collection.find_one_and_update(
            {'_id': ObjectId(thread_id)},
            {'$set': update_data},
            return_document=True
        )
        return _format_thread(result) if result else None
    except Exception as e:
        print(f"スレッド更新エラー: {e}")
        return None


def delete_thread(thread_id):
    """
    スレッドを削除

    Args:
        thread_id (str): スレッドID

    Returns:
        bool: 削除成功したか
    """
    collection = db_service.get_threads_collection()

    try:
        result = collection.delete_one({'_id': ObjectId(thread_id)})
        return result.deleted_count > 0
    except Exception as e:
        print(f"スレッド削除エラー: {e}")
        return False


def _format_thread(thread):
    """
    スレッドをフロントエンド用にフォーマット

    Args:
        thread (dict): MongoDBのスレッドドキュメント

    Returns:
        dict: フォーマットされたスレッド
    """
    if not thread:
        return None

    return {
        'id': str(thread['_id']),
        'title': thread['title'],
        'created_at': thread['created_at'].isoformat(),
        'updated_at': thread['updated_at'].isoformat()
    }
