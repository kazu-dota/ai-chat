"""
Flaskアプリケーションのメインエントリーポイント
"""
import sys
import os

# Vercel環境でのパス設定
if 'VERCEL' in os.environ:
    # Vercel環境ではapi/ディレクトリをPYTHONPATHに追加
    api_dir = os.path.dirname(os.path.abspath(__file__))
    if api_dir not in sys.path:
        sys.path.insert(0, api_dir)

from flask import Flask, jsonify
from flask_cors import CORS
from config import config
from services.db_service import db_service
# 一時的に無効化してデバッグ
# from routes.threads import threads_bp
# from routes.messages import messages_bp

# Flaskアプリケーションの作成
app = Flask(__name__)

# CORS設定（フロントエンドからのアクセスを許可）
CORS(app, resources={
    r"/api/*": {
        "origins": config.CORS_ORIGINS,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})


# データベース接続
@app.before_request
def before_request():
    """リクエスト前にデータベース接続を確認"""
    if db_service.db is None:
        db_service.connect()


# ルートの登録
# 一時的に無効化してデバッグ
# app.register_blueprint(threads_bp, url_prefix='/api')
# app.register_blueprint(messages_bp, url_prefix='/api')


# シンプルなテストエンドポイント
@app.route('/api/test', methods=['GET'])
def test():
    """最もシンプルなテストエンドポイント"""
    import os
    return jsonify({
        'message': 'API is working!',
        'vercel': os.getenv('VERCEL', 'not set'),
        'mongodb_uri_exists': bool(os.getenv('MONGODB_URI')),
        'gemini_key_exists': bool(os.getenv('GEMINI_API_KEY'))
    })

# ヘルスチェックエンドポイント
@app.route('/api/health', methods=['GET'])
def health_check():
    """
    サーバーの稼働状況を確認

    Returns:
        JSON: ステータス情報
    """
    import os
    db_status = 'connected' if db_service.db is not None else 'disconnected'

    # 環境変数の存在確認（値は表示しない）
    env_check = {
        'MONGODB_URI': 'set' if os.getenv('MONGODB_URI') else 'missing',
        'GEMINI_API_KEY': 'set' if os.getenv('GEMINI_API_KEY') else 'missing',
        'VERCEL': 'true' if os.getenv('VERCEL') else 'false'
    }

    return jsonify({
        'status': 'ok',
        'database': db_status,
        'environment_variables': env_check,
        'environment': config.FLASK_ENV
    }), 200


# ルートエンドポイント
@app.route('/', methods=['GET'])
def index():
    """
    ルートエンドポイント

    Returns:
        JSON: API情報
    """
    return jsonify({
        'name': 'AI Chatbot API',
        'version': '1.0.0',
        'endpoints': {
            'health': '/api/health',
            'threads': '/api/threads',
            'messages': '/api/threads/<thread_id>/messages'
        }
    }), 200


# エラーハンドラー
@app.errorhandler(404)
def not_found(error):
    """404エラーハンドラー"""
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    """500エラーハンドラー"""
    return jsonify({'error': 'Internal server error'}), 500


# Vercel Serverless Functions用
# Vercel環境では、appインスタンスをエクスポートするだけで動作します
# ローカル環境では、以下のコードで直接起動します

if __name__ == '__main__':
    # ローカル開発サーバーの起動
    print("=" * 50)
    print("AI Chatbot API Server")
    print("=" * 50)
    print(f"Environment: {config.FLASK_ENV}")
    print(f"Debug Mode: {config.DEBUG}")
    print("=" * 50)

    # データベース接続
    if db_service.connect():
        print("✓ MongoDB接続成功")
    else:
        print("✗ MongoDB接続失敗")
        print("環境変数を確認してください")

    print("=" * 50)
    print("Server running on http://localhost:5001")
    print("Health Check: http://localhost:5001/api/health")
    print("=" * 50)

    app.run(
        host='0.0.0.0',
        port=5001,
        debug=config.DEBUG
    )
