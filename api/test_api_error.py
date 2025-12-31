"""
APIエラーの詳細を確認するテスト
"""
import requests
import json

BASE_URL = 'http://localhost:5001/api'

def test_message_send():
    """メッセージ送信のエラー詳細を確認"""

    print("=== API エラーテスト ===\n")

    # 1. スレッドを作成
    print("1. テストスレッド作成...")
    response = requests.post(f'{BASE_URL}/threads', json={'title': '[ERROR_TEST]'})
    thread_id = response.json()['id']
    print(f"✓ スレッドID: {thread_id}\n")

    # 2. メッセージを送信して詳細なエラーを取得
    print("2. メッセージ送信...")
    try:
        response = requests.post(
            f'{BASE_URL}/threads/{thread_id}/messages',
            json={'content': 'テストメッセージ'}
        )

        print(f"ステータスコード: {response.status_code}")
        print(f"レスポンス: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")

    except Exception as e:
        print(f"エラー: {e}")
        print(f"レスポンステキスト: {response.text}")

    # 3. クリーンアップ
    requests.delete(f'{BASE_URL}/threads/{thread_id}')

if __name__ == '__main__':
    test_message_send()
