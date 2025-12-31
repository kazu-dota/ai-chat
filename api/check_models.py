"""
Gemini APIで利用可能なモデルをリストアップするスクリプト
"""
from google import genai
from config import config

def list_available_models():
    """利用可能なモデル一覧を表示"""
    client = genai.Client(api_key=config.GEMINI_API_KEY)

    print("=== 利用可能なGeminiモデル ===\n")

    models = client.models.list()

    flash_lite_models = []
    other_models = []

    for model in models:
        model_info = f"名前: {model.name}"
        if hasattr(model, 'display_name'):
            model_info += f" | 表示名: {model.display_name}"

        # Flash-Liteモデルを特定
        if 'flash-lite' in model.name.lower() or 'flash-8b' in model.name.lower():
            flash_lite_models.append(model_info)
        else:
            other_models.append(model_info)

    if flash_lite_models:
        print("【Flash-Lite / 軽量モデル】")
        for info in flash_lite_models:
            print(f"  {info}")
        print()

    print("【その他のモデル】")
    for info in other_models[:10]:  # 最初の10件のみ表示
        print(f"  {info}")

    if len(other_models) > 10:
        print(f"  ... and {len(other_models) - 10} more models")

if __name__ == '__main__':
    try:
        list_available_models()
    except Exception as e:
        print(f"エラー: {e}")
