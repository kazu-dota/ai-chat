"""
Gemini APIのモデル詳細とクォータ制限を確認
"""
from google import genai
from config import config

def check_model_details():
    """モデルの詳細情報とクォータ制限を確認"""
    client = genai.Client(api_key=config.GEMINI_API_KEY)

    print("=" * 60)
    print("Gemini モデル詳細情報")
    print("=" * 60)

    # 使用中のモデル
    current_model = config.GEMINI_MODEL
    print(f"\n現在使用中のモデル: {current_model}\n")

    try:
        # Flash-Lite モデルの詳細
        flash_lite = client.models.get(model='models/gemini-2.5-flash-lite')
        print("【Gemini 2.5 Flash-Lite】")
        print(f"  表示名: {flash_lite.display_name if hasattr(flash_lite, 'display_name') else 'N/A'}")
        print(f"  説明: {flash_lite.description if hasattr(flash_lite, 'description') else 'N/A'}")

        # サポートされているメソッドやレート制限情報があれば表示
        if hasattr(flash_lite, 'supported_generation_methods'):
            print(f"  サポートされているメソッド: {flash_lite.supported_generation_methods}")

        if hasattr(flash_lite, 'rate_limit'):
            print(f"  レート制限: {flash_lite.rate_limit}")

        print()

        # 比較用に Flash モデルの詳細も取得
        flash = client.models.get(model='models/gemini-2.5-flash')
        print("【Gemini 2.5 Flash（比較用）】")
        print(f"  表示名: {flash.display_name if hasattr(flash, 'display_name') else 'N/A'}")
        print(f"  説明: {flash.description if hasattr(flash, 'description') else 'N/A'}")

        if hasattr(flash, 'supported_generation_methods'):
            print(f"  サポートされているメソッド: {flash.supported_generation_methods}")

        if hasattr(flash, 'rate_limit'):
            print(f"  レート制限: {flash.rate_limit}")

    except Exception as e:
        print(f"エラー: {e}")

    print("\n" + "=" * 60)
    print("注意:")
    print("  - 無料枠の共通制限: 20 requests/day, 5 requests/minute")
    print("  - Flash-Liteは軽量モデルだが、クォータは同じ可能性が高い")
    print("  - テストを順次実行（1 worker）に設定済み")
    print("=" * 60)

if __name__ == '__main__':
    check_model_details()
