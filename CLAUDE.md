# AIチャットボット仕様書

## プロジェクト概要

社内メンバー向けの汎用的な対話が可能なAIチャットボットアプリケーション。Google Gemini APIを使用し、会話履歴の保存や複数スレッドの管理、Markdown/コード表示に対応。

## 技術スタック

### フロントエンド
- **フレームワーク**: Vue.js 3
- **UIライブラリ**: 未定（Vuetify、Element Plus、または素のCSS）
- **状態管理**: Pinia（推奨）またはVuex
- **HTTPクライアント**: Axios
- **Markdown/コードレンダリング**:
  - `marked` または `markdown-it`（Markdown変換）
  - `highlight.js` または `prism.js`（シンタックスハイライト）

### バックエンド
- **フレームワーク**: Flask (Python)
- **ODM**: PyMongo（MongoDBクライアント）
- **AI API**: Google Gemini API
- **環境変数管理**: python-dotenv

### データベース
- **種類**: MongoDB
- **ホスティング**: MongoDB Atlas（クラウド）推奨

### デプロイ
- **プラットフォーム**: Vercel
  - フロントエンド: Vercel Static Hosting
  - バックエンド: Vercel Serverless Functions（Pythonサポート）

### 開発ツール
- **パッケージマネージャ**:
  - フロントエンド: npm または yarn
  - バックエンド: pip
- **バージョン管理**: Git

---

## システムアーキテクチャ

```
┌─────────────────────┐
│   Vue.js Frontend   │
│  (Vercel Hosting)   │
└──────────┬──────────┘
           │ HTTP/REST API
           ▼
┌─────────────────────┐
│   Flask Backend     │
│ (Vercel Serverless) │
└──────────┬──────────┘
           │
           ├─────────────────┐
           │                 │
           ▼                 ▼
┌──────────────────┐  ┌──────────────────┐
│  MongoDB Atlas   │  │  Gemini API      │
│  (Database)      │  │  (Google)        │
└──────────────────┘  └──────────────────┘
```

---

## 機能要件

### 必須機能

1. **会話履歴の保存・表示**
   - ユーザーとAIのメッセージをMongoDBに保存
   - 過去の会話を時系列で表示

2. **複数の会話スレッド管理**
   - 新規スレッドの作成
   - スレッド一覧の表示
   - スレッド間の切り替え
   - スレッドの削除

3. **Markdownレンダリング**
   - AIの応答内のMarkdown記法を正しく表示
   - 見出し、リスト、リンク、画像などに対応

4. **コードのシンタックスハイライト**
   - コードブロックの検出
   - 言語別の色分け表示
   - コピーボタン（オプション）

5. **リアルタイムチャット**
   - メッセージ送信
   - AIからの応答受信
   - ローディング状態の表示

### オプション機能（将来拡張）
- メッセージの編集・削除
- ファイルアップロード
- ストリーミングレスポンス
- ダークモード

---

## データモデル（MongoDB）

### Collection: `threads`
会話スレッドの情報を管理

```json
{
  "_id": "ObjectId",
  "title": "会話のタイトル",
  "created_at": "2025-12-30T10:00:00Z",
  "updated_at": "2025-12-30T10:30:00Z"
}
```

### Collection: `messages`
個別メッセージの情報を管理

```json
{
  "_id": "ObjectId",
  "thread_id": "ObjectId (threads._id参照)",
  "role": "user | assistant",
  "content": "メッセージ本文",
  "created_at": "2025-12-30T10:00:00Z"
}
```

### インデックス
- `messages.thread_id`: スレッド別メッセージ取得を高速化
- `threads.updated_at`: スレッド一覧のソート用

---

## API設計（REST API）

### ベースURL
- 開発環境: `http://localhost:5000/api`
- 本番環境: `https://your-app.vercel.app/api`

### エンドポイント一覧

#### 1. スレッド管理

**GET /api/threads**
- 説明: スレッド一覧を取得
- レスポンス:
```json
{
  "threads": [
    {
      "id": "thread_id",
      "title": "会話タイトル",
      "created_at": "2025-12-30T10:00:00Z",
      "updated_at": "2025-12-30T10:30:00Z"
    }
  ]
}
```

**POST /api/threads**
- 説明: 新規スレッド作成
- リクエストボディ:
```json
{
  "title": "新しい会話"
}
```
- レスポンス:
```json
{
  "id": "new_thread_id",
  "title": "新しい会話",
  "created_at": "2025-12-30T10:00:00Z"
}
```

**DELETE /api/threads/:thread_id**
- 説明: スレッド削除（関連メッセージも削除）
- レスポンス:
```json
{
  "message": "Thread deleted successfully"
}
```

#### 2. メッセージ管理

**GET /api/threads/:thread_id/messages**
- 説明: 特定スレッドのメッセージ一覧を取得
- レスポンス:
```json
{
  "messages": [
    {
      "id": "message_id",
      "role": "user",
      "content": "こんにちは",
      "created_at": "2025-12-30T10:00:00Z"
    },
    {
      "id": "message_id_2",
      "role": "assistant",
      "content": "こんにちは！何かお手伝いできることはありますか？",
      "created_at": "2025-12-30T10:00:05Z"
    }
  ]
}
```

**POST /api/threads/:thread_id/messages**
- 説明: メッセージ送信とAI応答の取得
- リクエストボディ:
```json
{
  "content": "ユーザーのメッセージ"
}
```
- レスポンス:
```json
{
  "user_message": {
    "id": "message_id",
    "role": "user",
    "content": "ユーザーのメッセージ",
    "created_at": "2025-12-30T10:00:00Z"
  },
  "assistant_message": {
    "id": "message_id_2",
    "role": "assistant",
    "content": "AIの応答",
    "created_at": "2025-12-30T10:00:05Z"
  }
}
```

#### 3. ヘルスチェック

**GET /api/health**
- 説明: サーバーの稼働状況確認
- レスポンス:
```json
{
  "status": "ok",
  "database": "connected"
}
```

---

## フロントエンド構成（Vue.js）

### ディレクトリ構造

```
frontend/
├── public/
├── src/
│   ├── assets/          # 静的ファイル（CSS、画像など）
│   ├── components/      # 再利用可能コンポーネント
│   │   ├── ChatMessage.vue      # メッセージ表示コンポーネント
│   │   ├── ChatInput.vue        # メッセージ入力フォーム
│   │   ├── ThreadList.vue       # スレッド一覧
│   │   ├── MarkdownRenderer.vue # Markdown表示
│   │   └── CodeBlock.vue        # コードハイライト
│   ├── views/           # ページコンポーネント
│   │   └── ChatView.vue         # メインチャット画面
│   ├── stores/          # Pinia Store
│   │   ├── threadStore.js       # スレッド管理
│   │   └── messageStore.js      # メッセージ管理
│   ├── services/        # API通信
│   │   └── api.js               # Axios設定とAPI関数
│   ├── App.vue
│   └── main.js
├── package.json
└── vite.config.js (or vue.config.js)
```

### 主要コンポーネント

#### ChatMessage.vue
- ユーザー/AIのメッセージを表示
- Markdown/コードのレンダリング
- メッセージのスタイリング

#### ChatInput.vue
- テキスト入力フォーム
- 送信ボタン
- ローディング状態の管理

#### ThreadList.vue
- スレッド一覧表示
- 新規スレッド作成ボタン
- スレッド選択・削除機能

### 状態管理（Pinia）

#### threadStore
- スレッド一覧の取得・管理
- 現在選択中のスレッド
- スレッドの作成・削除

#### messageStore
- メッセージ一覧の取得・管理
- メッセージの送信
- ローディング状態

---

## バックエンド構成（Flask）

### ディレクトリ構造

```
backend/
├── api/
│   ├── __init__.py
│   ├── index.py              # Vercel Serverless用エントリーポイント
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── threads.py        # スレッド関連エンドポイント
│   │   └── messages.py       # メッセージ関連エンドポイント
│   ├── models/
│   │   ├── __init__.py
│   │   ├── thread.py         # Threadモデル
│   │   └── message.py        # Messageモデル
│   ├── services/
│   │   ├── __init__.py
│   │   ├── gemini_service.py # Gemini API連携
│   │   └── db_service.py     # MongoDB接続
│   └── config.py             # 設定ファイル
├── requirements.txt
└── vercel.json               # Vercel設定
```

### 主要モジュール

#### api/index.py
- Flaskアプリケーションの初期化
- ルート登録
- CORS設定
- Vercel Serverless Functions対応

#### services/gemini_service.py
- Google Gemini APIとの通信
- プロンプト管理
- エラーハンドリング

#### services/db_service.py
- MongoDBへの接続
- データベース操作の抽象化

#### models/
- MongoDBドキュメントの操作ロジック
- CRUD操作の実装

### 環境変数

`.env`ファイルまたはVercelの環境変数設定で管理:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
GEMINI_API_KEY=your_gemini_api_key
FLASK_ENV=development
```

---

## 開発環境セットアップ

### 1. MongoDB Atlasのセットアップ

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)でアカウント作成
2. 無料クラスタを作成
3. データベースユーザーを作成
4. ネットワークアクセスを設定（0.0.0.0/0で全IP許可）
5. 接続文字列（URI）を取得

### 2. Gemini APIキーの取得

1. [Google AI Studio](https://makersuite.google.com/app/apikey)にアクセス
2. APIキーを作成
3. キーをコピーして保存

### 3. バックエンドのセットアップ

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windowsの場合: venv\Scripts\activate
pip install -r requirements.txt

# .envファイルを作成
echo "MONGODB_URI=your_mongodb_uri" > .env
echo "GEMINI_API_KEY=your_gemini_api_key" >> .env

# ローカルサーバー起動
python api/index.py
```

### 4. フロントエンドのセットアップ

```bash
cd frontend
npm install

# 開発サーバー起動
npm run dev
```

### 5. 動作確認

- フロントエンド: http://localhost:5173（Viteの場合）
- バックエンド: http://localhost:5000

---

## デプロイ手順（Vercel）

### 前提条件
- GitHubリポジトリにコードをプッシュ
- Vercelアカウントを作成

### 1. プロジェクト構造

Vercelでモノレポ構成をデプロイする場合：

```
ai-chat/
├── frontend/        # Vue.jsアプリ
├── api/             # Flask API (Serverless Functions)
└── vercel.json      # Vercel設定
```

### 2. vercel.json設定例

プロジェクトルートに配置:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "frontend/dist"
      }
    },
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/index.py"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/dist/$1"
    }
  ]
}
```

### 3. Vercelへのデプロイ

```bash
# Vercel CLIをインストール
npm i -g vercel

# ログイン
vercel login

# デプロイ
vercel

# 本番デプロイ
vercel --prod
```

### 4. 環境変数の設定

Vercelダッシュボードで以下を設定:
- `MONGODB_URI`
- `GEMINI_API_KEY`

または CLI経由:

```bash
vercel env add MONGODB_URI
vercel env add GEMINI_API_KEY
```

### 5. フロントエンドのビルド設定

`frontend/package.json`に追加:

```json
{
  "scripts": {
    "build": "vite build",
    "vercel-build": "npm run build"
  }
}
```

---

## セキュリティ考慮事項

1. **APIキーの管理**
   - 環境変数で管理し、コードにハードコーディングしない
   - `.env`ファイルを`.gitignore`に追加

2. **CORS設定**
   - 本番環境では特定のオリジンのみ許可
   - Flask-CORSで設定

3. **入力バリデーション**
   - ユーザー入力のサニタイズ
   - MongoDBインジェクション対策

4. **レート制限**
   - Gemini APIの呼び出し回数制限
   - 将来的にFlask-Limiterの導入を検討

5. **MongoDB接続**
   - MongoDB Atlasのネットワークアクセス制限
   - 本番環境では特定IPのみ許可を推奨

---

## パフォーマンス最適化

1. **フロントエンド**
   - コンポーネントの遅延読み込み
   - 仮想スクロール（長い会話履歴）
   - メッセージのページネーション

2. **バックエンド**
   - MongoDBのインデックス活用
   - Gemini APIのレスポンスキャッシュ（オプション）
   - 非同期処理の活用

3. **データベース**
   - 適切なインデックス設計
   - 不要な古いスレッド/メッセージの定期削除

---

## テスト戦略

### フロントエンド
- **単体テスト**: Vitest + Vue Test Utils
- **E2Eテスト**: Playwright または Cypress

### バックエンド
- **単体テスト**: pytest
- **APIテスト**: pytest + requests

### テストカバレッジ目標
- フロントエンド: 70%以上
- バックエンド: 80%以上

---

## 開発ロードマップ

### Phase 1: MVP（最小viable製品）
- [ ] MongoDB接続とデータモデル実装
- [ ] Flask APIの基本エンドポイント実装
- [ ] Vue.jsの基本UI実装
- [ ] Gemini API統合
- [ ] 基本的な会話機能

### Phase 2: コア機能
- [ ] 会話履歴の保存・表示
- [ ] 複数スレッド管理
- [ ] Markdownレンダリング
- [ ] コードハイライト

### Phase 3: UI/UX改善
- [ ] レスポンシブデザイン
- [ ] ローディングアニメーション
- [ ] エラーハンドリング改善
- [ ] ダークモード（オプション）

### Phase 4: デプロイ
- [ ] Vercel設定
- [ ] 環境変数設定
- [ ] 本番デプロイ
- [ ] 動作確認

### Phase 5: 拡張機能（将来）
- [ ] ストリーミングレスポンス
- [ ] ファイルアップロード
- [ ] メッセージ編集・削除
- [ ] エクスポート機能

---

## トラブルシューティング

### よくある問題

1. **MongoDB接続エラー**
   - URIが正しいか確認
   - ネットワークアクセス設定を確認
   - データベースユーザーの権限を確認

2. **Gemini APIエラー**
   - APIキーが有効か確認
   - レート制限に達していないか確認
   - リクエスト形式が正しいか確認

3. **CORSエラー**
   - Flask-CORSが正しく設定されているか確認
   - フロントエンドのAPI URLが正しいか確認

4. **Vercelデプロイエラー**
   - `vercel.json`の設定を確認
   - 環境変数が設定されているか確認
   - ビルドログを確認

---

## 参考資料

- [Vue.js公式ドキュメント](https://vuejs.org/)
- [Flask公式ドキュメント](https://flask.palletsprojects.com/)
- [MongoDB公式ドキュメント](https://www.mongodb.com/docs/)
- [Google Gemini APIドキュメント](https://ai.google.dev/docs)
- [Vercelドキュメント](https://vercel.com/docs)
- [Vercel Python Runtime](https://vercel.com/docs/functions/serverless-functions/runtimes/python)

---

## ライセンス

未定（プロジェクト要件に応じて設定）

---

## 作成日

2025-12-30

---

## 更新履歴

- 2025-12-30: 初版作成
