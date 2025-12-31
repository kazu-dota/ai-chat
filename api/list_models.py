"""
利用可能なGemini APIモデルの一覧を表示
"""
from services.gemini_service import gemini_service

print("=" * 60)
print("利用可能なGemini APIモデル")
print("=" * 60)

models = gemini_service.list_available_models()

if models:
    print(f"\n合計 {len(models)} モデルが利用可能です:\n")
    for i, model in enumerate(models, 1):
        print(f"{i}. {model}")

    # 無料枠のモデルをハイライト
    print("\n" + "=" * 60)
    print("推奨モデル（無料枠）:")
    print("=" * 60)
    free_models = [m for m in models if 'flash' in m.lower()]
    for model in free_models:
        print(f"  • {model}")
else:
    print("エラー: モデルの一覧を取得できませんでした")
    print("環境変数とAPIキーを確認してください")
