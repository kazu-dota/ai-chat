"""
MongoDB接続サービス
データベースへの接続とコレクション取得を管理
"""
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from config import config


class DatabaseService:
    """MongoDB接続を管理するクラス"""

    def __init__(self):
        self.client = None
        self.db = None

    def connect(self):
        """MongoDBへの接続を確立"""
        try:
            self.client = MongoClient(
                config.MONGODB_URI,
                serverSelectionTimeoutMS=5000  # 5秒でタイムアウト
            )
            # 接続テスト
            self.client.admin.command('ping')
            self.db = self.client[config.DB_NAME]
            print(f"MongoDB接続成功: {config.DB_NAME}")
            return True
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            print(f"MongoDB接続失敗: {e}")
            return False

    def get_collection(self, collection_name):
        """
        指定されたコレクションを取得

        Args:
            collection_name (str): コレクション名

        Returns:
            Collection: MongoDBコレクション
        """
        if self.db is None:
            self.connect()
        return self.db[collection_name]

    def get_threads_collection(self):
        """threadsコレクションを取得"""
        return self.get_collection(config.THREADS_COLLECTION)

    def get_messages_collection(self):
        """messagesコレクションを取得"""
        return self.get_collection(config.MESSAGES_COLLECTION)

    def close(self):
        """データベース接続を閉じる"""
        if self.client:
            self.client.close()
            print("MongoDB接続を閉じました")

    def test_connection(self):
        """
        接続テスト

        Returns:
            dict: テスト結果
        """
        try:
            if self.connect():
                databases = self.client.list_database_names()
                return {
                    'status': 'success',
                    'message': 'MongoDB接続成功',
                    'databases': databases
                }
            else:
                return {
                    'status': 'error',
                    'message': 'MongoDB接続失敗'
                }
        except Exception as e:
            return {
                'status': 'error',
                'message': f'エラー: {str(e)}'
            }


# シングルトンインスタンス
db_service = DatabaseService()
