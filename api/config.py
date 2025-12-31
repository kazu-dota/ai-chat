"""
アプリケーション設定モジュール
環境変数の読み込みと設定管理
"""
import os
from dotenv import load_dotenv

# .envファイルから環境変数を読み込む
load_dotenv()


class Config:
    """アプリケーション設定クラス"""

    # MongoDB設定
    MONGODB_URI = os.getenv('MONGODB_URI')
    if not MONGODB_URI:
        print("⚠️  WARNING: MONGODB_URI環境変数が設定されていません")
        # Vercel環境でのデバッグのため、一時的にエラーを無効化
        # raise ValueError("MONGODB_URI環境変数が設定されていません")

    # Gemini API設定
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    if not GEMINI_API_KEY:
        print("⚠️  WARNING: GEMINI_API_KEY環境変数が設定されていません")
        # Vercel環境でのデバッグのため、一時的にエラーを無効化
        # raise ValueError("GEMINI_API_KEY環境変数が設定されていません")

    # Flask設定
    FLASK_ENV = os.getenv('FLASK_ENV', 'production')
    DEBUG = FLASK_ENV == 'development'

    # データベース名
    DB_NAME = 'ai-chat'

    # コレクション名
    THREADS_COLLECTION = 'threads'
    MESSAGES_COLLECTION = 'messages'

    # Gemini モデル設定（無料枠）
    # 推奨: models/gemini-2.5-flash-lite (軽量・高クォータ), models/gemini-2.5-flash (最新)
    GEMINI_MODEL = 'models/gemini-2.5-flash-lite'

    # CORS設定
    # 開発環境とVercel本番環境の両方をサポート
    CORS_ORIGINS = [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://*.vercel.app',  # Vercelプレビューデプロイメント
    ]
    # 本番環境では環境変数からオリジンを追加可能
    custom_origin = os.getenv('FRONTEND_URL')
    if custom_origin:
        CORS_ORIGINS.append(custom_origin)


# 設定インスタンスをエクスポート
config = Config()
