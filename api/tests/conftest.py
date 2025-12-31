"""
pytest設定とフィクスチャ
"""
import pytest
import sys
import os

# apiディレクトリをパスに追加
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from index import app as flask_app
from services.db_service import db_service


@pytest.fixture
def app():
    """Flaskアプリケーションのフィクスチャ"""
    flask_app.config.update({
        'TESTING': True,
    })

    # データベース接続を確立
    db_service.connect()

    yield flask_app

    # クリーンアップは不要（テスト後にデータを残す）


@pytest.fixture
def client(app):
    """テストクライアントのフィクスチャ"""
    return app.test_client()


@pytest.fixture
def runner(app):
    """CLIランナーのフィクスチャ"""
    return app.test_cli_runner()
