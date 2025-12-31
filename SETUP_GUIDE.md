# 外部サービスセットアップガイド

このガイドでは、MongoDB AtlasとGoogle Gemini APIの設定方法を説明します。

## 1. MongoDB Atlas のセットアップ

### 1.1 アカウント作成

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) にアクセス
2. 「Start Free」をクリック
3. Googleアカウントまたはメールアドレスでサインアップ

### 1.2 クラスタの作成

1. ログイン後、「Build a Database」をクリック
2. **FREE**（M0 Sandbox）プランを選択
3. クラウドプロバイダーとリージョンを選択
   - Provider: AWS（推奨）
   - Region: 日本に近いリージョン（例: Tokyo ap-northeast-1）
4. Cluster Name: 任意の名前（例: `ai-chat-cluster`）
5. 「Create」をクリック

### 1.3 データベースユーザーの作成

1. 「Security」→「Database Access」に移動
2. 「Add New Database User」をクリック
3. 認証方法: **Password**を選択
4. ユーザー名とパスワードを設定
   - Username: 例 `admin`
   - Password: 強力なパスワードを生成（保存しておく）
5. Database User Privileges: **Read and write to any database**を選択
6. 「Add User」をクリック

### 1.4 ネットワークアクセスの設定

1. 「Security」→「Network Access」に移動
2. 「Add IP Address」をクリック
3. 開発環境用:
   - 「Allow Access from Anywhere」をクリック
   - IP Address: `0.0.0.0/0` が自動入力される
   - **注意**: 本番環境では特定のIPのみ許可することを推奨
4. 「Confirm」をクリック

### 1.5 接続文字列（URI）の取得

1. 「Database」に戻る
2. クラスタの「Connect」ボタンをクリック
3. 「Drivers」を選択
4. Driver: **Python**、Version: 最新版を選択
5. 接続文字列をコピー
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. `<username>`と`<password>`を実際の値に置き換える
7. データベース名を追加（例: `/ai-chat`）
   ```
   mongodb+srv://admin:yourpassword@cluster0.xxxxx.mongodb.net/ai-chat?retryWrites=true&w=majority
   ```
8. この文字列を安全に保存

### 1.6 データベースとコレクションの作成（オプション）

1. 「Database」→「Browse Collections」
2. 「Add My Own Data」をクリック
3. Database name: `ai-chat`
4. Collection name: `threads`
5. 「Create」をクリック

**注意**: アプリケーションが自動的にコレクションを作成するため、この手順はオプションです。

---

## 2. Google Gemini API のセットアップ

### 2.1 Google AI Studio へのアクセス

1. [Google AI Studio](https://makersuite.google.com/app/apikey) にアクセス
2. Googleアカウントでログイン

### 2.2 APIキーの作成

1. 「Get API Key」または「Create API Key」をクリック
2. 新しいプロジェクトを作成するか、既存のプロジェクトを選択
   - 新規作成の場合: 「Create API key in new project」をクリック
3. APIキーが生成されたら、**コピー**して安全に保存
   ```
   例: AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q
   ```

### 2.3 APIキーの確認

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを選択
3. 「APIs & Services」→「Credentials」で作成したキーを確認できます

### 2.4 料金について

- Gemini APIには無料枠があります
- 詳細は [料金ページ](https://ai.google.dev/pricing) を確認
- 無料枠:
  - Gemini 1.5 Flash: 1分あたり15リクエスト、1日あたり1,500リクエスト
  - Gemini 1.5 Pro: 1分あたり2リクエスト、1日あたり50リクエスト

---

## 3. 環境変数の設定

### 3.1 バックエンド用の.envファイル作成

`api/.env`ファイルを作成し、以下の内容を記述：

```env
# MongoDB Atlas接続URI
MONGODB_URI=mongodb+srv://admin:yourpassword@cluster0.xxxxx.mongodb.net/ai-chat?retryWrites=true&w=majority

# Google Gemini APIキー
GEMINI_API_KEY=AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q

# Flask環境設定
FLASK_ENV=development
```

**重要**:
- 実際の値に置き換えてください
- このファイルは`.gitignore`に含まれているため、Gitにコミットされません
- パスワードやAPIキーを絶対に公開リポジトリにプッシュしないでください

### 3.2 .env.exampleファイルの作成

チーム共有用のテンプレートファイル `api/.env.example` を作成：

```env
# MongoDB Atlas接続URI
MONGODB_URI=your_mongodb_connection_string_here

# Google Gemini APIキー
GEMINI_API_KEY=your_gemini_api_key_here

# Flask環境設定
FLASK_ENV=development
```

---

## 4. Python環境のセットアップ（uv使用）

### 4.1 uvのインストール

uvは高速なPythonパッケージ管理ツールです。

**macOS/Linux:**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Windows:**
```powershell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

インストール確認：
```bash
uv --version
```

### 4.2 プロジェクトのセットアップ

```bash
cd api

# Pythonバージョンを指定してインストール（推奨: 3.11以上）
uv python install 3.11

# 依存パッケージをインストール
uv sync
```

これにより、`.venv`ディレクトリが自動的に作成され、依存関係がインストールされます。

### 4.3 uvコマンドでの実行

uvを使用すると、仮想環境を手動でアクティベートする必要がありません：

```bash
# Pythonスクリプトを実行
uv run python index.py

# パッケージを追加
uv add <package-name>

# 開発用パッケージを追加
uv add --dev <package-name>
```

## 5. 接続テスト

### 5.1 MongoDB接続テスト

`api/test_mongodb.py`を作成して接続テスト：

```python
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGODB_URI = os.getenv('MONGODB_URI')

try:
    client = MongoClient(MONGODB_URI)
    # データベース一覧を取得
    print("接続成功！")
    print("データベース一覧:", client.list_database_names())
    client.close()
except Exception as e:
    print("接続失敗:", e)
```

実行：
```bash
cd api
uv run python test_mongodb.py
```

### 5.2 Gemini API接続テスト

`api/test_gemini.py`を作成して接続テスト：

```python
import google.generativeai as genai
from dotenv import load_dotenv
import os

load_dotenv()

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=GEMINI_API_KEY)

try:
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("こんにちは")
    print("接続成功！")
    print("応答:", response.text)
except Exception as e:
    print("接続失敗:", e)
```

実行：
```bash
cd api
uv run python test_gemini.py
```

---

## 6. トラブルシューティング

### MongoDB接続エラー

**エラー**: `ServerSelectionTimeoutError`

**解決策**:
1. ネットワークアクセス設定で、自分のIPアドレスが許可されているか確認
2. URIの`<username>`と`<password>`が正しく置き換えられているか確認
3. パスワードに特殊文字が含まれる場合、URLエンコードが必要
   - 例: `p@ssword` → `p%40ssword`

**エラー**: `Authentication failed`

**解決策**:
1. ユーザー名とパスワードが正しいか確認
2. データベースユーザーの権限を確認

### Gemini API エラー

**エラー**: `Invalid API key`

**解決策**:
1. APIキーが正しくコピーされているか確認
2. APIキーの前後にスペースがないか確認
3. Google AI Studioで新しいキーを再生成

**エラー**: `Quota exceeded`

**解決策**:
1. 無料枠の上限に達している可能性
2. [料金ページ](https://ai.google.dev/pricing)で使用状況を確認
3. リクエスト数を制限するか、有料プランへのアップグレードを検討

---

## 6. セキュリティのベストプラクティス

1. **APIキーの管理**
   - 環境変数で管理し、コードに直接記述しない
   - `.env`ファイルを`.gitignore`に追加
   - チーム共有時は`.env.example`を使用

2. **MongoDB接続**
   - 本番環境ではネットワークアクセスを特定IPに制限
   - 強力なパスワードを使用
   - 定期的にパスワードを変更

3. **APIキーのローテーション**
   - 定期的にAPIキーを再生成
   - 漏洩した場合は即座に無効化

4. **Vercelへのデプロイ時**
   - Vercelの環境変数機能を使用
   - ローカルの`.env`ファイルはデプロイしない

---

## 7. 次のステップ

外部サービスのセットアップが完了したら、以下に進んでください：

1. [TODO.md](TODO.md) の Phase 2（バックエンド基盤構築）
2. 必要なPythonパッケージのインストール
3. Flaskアプリケーションの実装

---

## 参考リンク

- [MongoDB Atlas ドキュメント](https://www.mongodb.com/docs/atlas/)
- [Google Gemini API ドキュメント](https://ai.google.dev/docs)
- [PyMongo ドキュメント](https://pymongo.readthedocs.io/)
- [python-dotenv ドキュメント](https://pypi.org/project/python-dotenv/)

---

**作成日**: 2025-12-30
