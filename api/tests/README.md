# APIテストガイド

## テストの概要

このディレクトリには、AIチャットボットAPIの自動テストが含まれています。

### テストの種類

1. **ヘルスチェックテスト** (`TestHealthCheck`)
   - APIサーバーの稼働状況確認

2. **スレッド関連テスト** (`TestThreads`)
   - スレッドの作成
   - スレッド一覧の取得
   - スレッドの更新
   - スレッドの削除

3. **メッセージ関連テスト** (`TestMessages`)
   - メッセージ送信とAI応答
   - メッセージ一覧の取得
   - 会話履歴の保持

4. **統合テスト** (`TestIntegration`)
   - 完全な会話フローのテスト

## 事前準備

### 1. 開発用パッケージのインストール

```bash
cd api
uv sync --dev
```

### 2. 環境変数の設定

`.env`ファイルが正しく設定されていることを確認:

```
MONGODB_URI=mongodb+srv://...
GEMINI_API_KEY=your_api_key
FLASK_ENV=development
```

### 3. サーバーの起動

テストを実行する前に、別のターミナルでサーバーを起動してください:

```bash
uv run python index.py
```

## テストの実行

### 全テストを実行

```bash
uv run pytest
```

### 詳細な出力で実行

```bash
uv run pytest -v
```

### 特定のテストクラスのみ実行

```bash
# ヘルスチェックテストのみ
uv run pytest tests/test_api.py::TestHealthCheck

# スレッド関連テストのみ
uv run pytest tests/test_api.py::TestThreads

# メッセージ関連テストのみ
uv run pytest tests/test_api.py::TestMessages

# 統合テストのみ
uv run pytest tests/test_api.py::TestIntegration
```

### 特定のテスト関数のみ実行

```bash
uv run pytest tests/test_api.py::TestMessages::test_send_message_and_get_ai_response
```

### カバレッジ付きで実行

```bash
uv run pytest --cov=. --cov-report=html
```

## テスト結果の見方

### 成功例

```
tests/test_api.py::TestHealthCheck::test_health_check PASSED
tests/test_api.py::TestThreads::test_create_thread PASSED
...
======================== 15 passed in 5.23s ========================
```

### 失敗例

```
tests/test_api.py::TestThreads::test_create_thread FAILED

=============================== FAILURES ================================
___________________ TestThreads.test_create_thread ____________________

    def test_create_thread(self, client):
>       assert response.status_code == 201
E       assert 500 == 201

tests/test_api.py:45: AssertionError
```

## 注意事項

1. **実際のデータベースを使用**
   - テストは実際のMongoDB Atlasに接続します
   - テストデータが残る可能性があります
   - 必要に応じて手動でクリーンアップしてください

2. **AI APIの使用**
   - テストでGemini APIを実際に呼び出します
   - API使用量が増える可能性があります

3. **テストの順序**
   - テストは独立して実行されます
   - 順序に依存しないように設計されています

## トラブルシューティング

### "Connection refused" エラー

サーバーが起動していない可能性があります:

```bash
uv run python index.py
```

### "Module not found" エラー

パッケージが不足している可能性があります:

```bash
uv sync --dev
```

### テストが失敗する

1. `.env`ファイルの確認
2. MongoDB Atlasへの接続確認
3. Gemini APIキーの確認
4. サーバーが正常に起動しているか確認
