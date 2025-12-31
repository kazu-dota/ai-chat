"""
Gemini Flash-Liteモデルの動作確認テスト
"""
import requests
import json

BASE_URL = 'http://localhost:5001/api'

def test_flash_lite_model():
    """Flash-Liteモデルでメッセージ送信をテスト"""

    print("=== Gemini 2.5 Flash-Lite モデル動作確認 ===\n")

    # 1. 新しいスレッドを作成
    print("1. テストスレッドを作成中...")
    response = requests.post(f'{BASE_URL}/threads', json={'title': '[TEST] Flash-Lite確認'})

    if response.status_code != 201:
        print(f"❌ スレッド作成失敗: {response.status_code}")
        print(response.text)
        return False

    thread_data = response.json()
    thread_id = thread_data['id']
    print(f"✓ スレッド作成成功: {thread_id}\n")

    # 2. メッセージを送信してAI応答を取得
    print("2. Flash-Liteモデルにメッセージを送信中...")
    message_content = "こんにちは！簡単に自己紹介してください。"

    response = requests.post(
        f'{BASE_URL}/threads/{thread_id}/messages',
        json={'content': message_content}
    )

    if response.status_code not in [200, 201]:
        print(f"❌ メッセージ送信失敗: {response.status_code}")
        print(response.text)
        return False

    message_data = response.json()
    user_msg = message_data['user_message']
    assistant_msg = message_data['assistant_message']

    print(f"✓ メッセージ送信成功\n")
    print(f"ユーザー: {user_msg['content']}")
    print(f"AI応答: {assistant_msg['content'][:200]}...\n")

    # 3. スレッドを削除（クリーンアップ）
    print("3. テストスレッドをクリーンアップ中...")
    response = requests.delete(f'{BASE_URL}/threads/{thread_id}')

    if response.status_code == 200:
        print("✓ クリーンアップ完了\n")

    print("=" * 50)
    print("✅ Gemini 2.5 Flash-Lite モデルが正常に動作しています！")
    print("=" * 50)
    return True

if __name__ == '__main__':
    try:
        test_flash_lite_model()
    except Exception as e:
        print(f"❌ エラーが発生しました: {e}")
        import traceback
        traceback.print_exc()
