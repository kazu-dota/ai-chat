"""
APIエンドポイントの統合テスト
"""
import json
import pytest


class TestHealthCheck:
    """ヘルスチェックAPIのテスト"""

    def test_health_check(self, client):
        """ヘルスチェックが正常に動作すること"""
        response = client.get('/api/health')
        assert response.status_code == 200

        data = json.loads(response.data)
        assert data['status'] == 'ok'
        assert 'database' in data
        assert 'environment' in data


class TestThreads:
    """スレッド関連APIのテスト"""

    def test_create_thread(self, client):
        """スレッドを作成できること"""
        response = client.post(
            '/api/threads',
            data=json.dumps({'title': 'テストスレッド'}),
            content_type='application/json'
        )
        assert response.status_code == 201

        data = json.loads(response.data)
        assert 'id' in data
        assert data['title'] == 'テストスレッド'
        assert 'created_at' in data
        assert 'updated_at' in data

    def test_create_thread_default_title(self, client):
        """タイトルなしでスレッドを作成できること"""
        response = client.post(
            '/api/threads',
            data=json.dumps({}),
            content_type='application/json'
        )
        assert response.status_code == 201

        data = json.loads(response.data)
        assert data['title'] == '新しい会話'

    def test_get_threads(self, client):
        """スレッド一覧を取得できること"""
        # まずスレッドを作成
        client.post(
            '/api/threads',
            data=json.dumps({'title': '一覧テスト'}),
            content_type='application/json'
        )

        # 一覧を取得
        response = client.get('/api/threads')
        assert response.status_code == 200

        data = json.loads(response.data)
        assert 'threads' in data
        assert isinstance(data['threads'], list)
        assert len(data['threads']) > 0

    def test_get_thread_by_id(self, client):
        """IDでスレッドを取得できること"""
        # スレッド作成
        create_response = client.post(
            '/api/threads',
            data=json.dumps({'title': 'ID取得テスト'}),
            content_type='application/json'
        )
        thread_id = json.loads(create_response.data)['id']

        # ID指定で取得
        response = client.get(f'/api/threads/{thread_id}')
        assert response.status_code == 200

        data = json.loads(response.data)
        assert data['id'] == thread_id
        assert data['title'] == 'ID取得テスト'

    def test_get_nonexistent_thread(self, client):
        """存在しないスレッドを取得すると404が返ること"""
        response = client.get('/api/threads/000000000000000000000000')
        assert response.status_code == 404

    def test_update_thread(self, client):
        """スレッドのタイトルを更新できること"""
        # スレッド作成
        create_response = client.post(
            '/api/threads',
            data=json.dumps({'title': '更新前'}),
            content_type='application/json'
        )
        thread_id = json.loads(create_response.data)['id']

        # タイトル更新
        response = client.put(
            f'/api/threads/{thread_id}',
            data=json.dumps({'title': '更新後'}),
            content_type='application/json'
        )
        assert response.status_code == 200

        data = json.loads(response.data)
        assert data['title'] == '更新後'

    def test_delete_thread(self, client):
        """スレッドを削除できること"""
        # スレッド作成
        create_response = client.post(
            '/api/threads',
            data=json.dumps({'title': '削除テスト'}),
            content_type='application/json'
        )
        thread_id = json.loads(create_response.data)['id']

        # 削除
        response = client.delete(f'/api/threads/{thread_id}')
        assert response.status_code == 200

        data = json.loads(response.data)
        assert 'message' in data

        # 削除後に取得すると404
        get_response = client.get(f'/api/threads/{thread_id}')
        assert get_response.status_code == 404


class TestMessages:
    """メッセージ関連APIのテスト"""

    def test_send_message_and_get_ai_response(self, client):
        """メッセージを送信してAI応答を受け取れること"""
        # スレッド作成
        create_response = client.post(
            '/api/threads',
            data=json.dumps({'title': 'AIテスト'}),
            content_type='application/json'
        )
        thread_id = json.loads(create_response.data)['id']

        # メッセージ送信
        response = client.post(
            f'/api/threads/{thread_id}/messages',
            data=json.dumps({'content': 'こんにちは'}),
            content_type='application/json'
        )
        assert response.status_code == 201

        data = json.loads(response.data)
        assert 'user_message' in data
        assert 'assistant_message' in data

        # ユーザーメッセージの確認
        user_msg = data['user_message']
        assert user_msg['role'] == 'user'
        assert user_msg['content'] == 'こんにちは'

        # AI応答の確認
        assistant_msg = data['assistant_message']
        assert assistant_msg['role'] == 'assistant'
        assert len(assistant_msg['content']) > 0

    def test_get_messages(self, client):
        """メッセージ一覧を取得できること"""
        # スレッド作成
        create_response = client.post(
            '/api/threads',
            data=json.dumps({'title': 'メッセージ一覧テスト'}),
            content_type='application/json'
        )
        thread_id = json.loads(create_response.data)['id']

        # メッセージ送信
        client.post(
            f'/api/threads/{thread_id}/messages',
            data=json.dumps({'content': 'テストメッセージ'}),
            content_type='application/json'
        )

        # メッセージ一覧取得
        response = client.get(f'/api/threads/{thread_id}/messages')
        assert response.status_code == 200

        data = json.loads(response.data)
        assert 'messages' in data
        assert isinstance(data['messages'], list)
        assert len(data['messages']) == 2  # user + assistant

    def test_send_message_to_nonexistent_thread(self, client):
        """存在しないスレッドにメッセージを送信すると404が返ること"""
        response = client.post(
            '/api/threads/000000000000000000000000/messages',
            data=json.dumps({'content': 'テスト'}),
            content_type='application/json'
        )
        assert response.status_code == 404

    def test_send_empty_message(self, client):
        """空のメッセージを送信すると400が返ること"""
        # スレッド作成
        create_response = client.post(
            '/api/threads',
            data=json.dumps({'title': '空メッセージテスト'}),
            content_type='application/json'
        )
        thread_id = json.loads(create_response.data)['id']

        # 空メッセージ送信
        response = client.post(
            f'/api/threads/{thread_id}/messages',
            data=json.dumps({'content': ''}),
            content_type='application/json'
        )
        assert response.status_code == 400

    def test_conversation_history(self, client):
        """会話履歴が正しく保持されること"""
        # スレッド作成
        create_response = client.post(
            '/api/threads',
            data=json.dumps({'title': '会話履歴テスト'}),
            content_type='application/json'
        )
        thread_id = json.loads(create_response.data)['id']

        # 複数のメッセージを送信
        messages_to_send = [
            '私の名前は太郎です',
            '私の名前を覚えていますか？'
        ]

        for content in messages_to_send:
            client.post(
                f'/api/threads/{thread_id}/messages',
                data=json.dumps({'content': content}),
                content_type='application/json'
            )

        # メッセージ一覧を取得
        response = client.get(f'/api/threads/{thread_id}/messages')
        data = json.loads(response.data)

        # 4つのメッセージがあることを確認（user, assistant, user, assistant）
        assert len(data['messages']) == 4

        # 順序が正しいことを確認
        assert data['messages'][0]['role'] == 'user'
        assert data['messages'][1]['role'] == 'assistant'
        assert data['messages'][2]['role'] == 'user'
        assert data['messages'][3]['role'] == 'assistant'


class TestIntegration:
    """統合テスト"""

    def test_full_conversation_flow(self, client):
        """完全な会話フローが動作すること"""
        # 1. スレッド作成
        create_response = client.post(
            '/api/threads',
            data=json.dumps({'title': '統合テスト'}),
            content_type='application/json'
        )
        assert create_response.status_code == 201
        thread_id = json.loads(create_response.data)['id']

        # 2. メッセージ送信
        msg_response = client.post(
            f'/api/threads/{thread_id}/messages',
            data=json.dumps({'content': 'Pythonとは何ですか？'}),
            content_type='application/json'
        )
        assert msg_response.status_code == 201

        # 3. メッセージ一覧取得
        list_response = client.get(f'/api/threads/{thread_id}/messages')
        assert list_response.status_code == 200
        messages = json.loads(list_response.data)['messages']
        assert len(messages) == 2

        # 4. スレッド一覧に表示されることを確認
        threads_response = client.get('/api/threads')
        threads = json.loads(threads_response.data)['threads']
        thread_ids = [t['id'] for t in threads]
        assert thread_id in thread_ids

        # 5. スレッド削除
        delete_response = client.delete(f'/api/threads/{thread_id}')
        assert delete_response.status_code == 200

        # 6. 削除後は取得できないことを確認
        get_response = client.get(f'/api/threads/{thread_id}')
        assert get_response.status_code == 404
