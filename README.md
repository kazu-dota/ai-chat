# AIチャットボット

Vue.js + Flask + MongoDB + Google Gemini APIを使用した社内向けAIチャットボットアプリケーション

## 📋 目次

- [機能](#機能)
- [技術スタック](#技術スタック)
- [クイックスタート](#クイックスタート)
- [開発](#開発)
- [テスト](#テスト)
- [デプロイ](#デプロイ)
- [ドキュメント](#ドキュメント)

## ✨ 機能

- ✅ 会話履歴の保存・表示
- ✅ 複数スレッドの管理
- ✅ Markdownレンダリング
- ✅ コードのシンタックスハイライト
- ✅ リアルタイムチャット
- ✅ レスポンシブデザイン

## 🚀 技術スタック

### フロントエンド
- Vue.js 3
- Vite
- Pinia（状態管理）
- Vue Router
- Axios
- Marked（Markdown）
- Highlight.js（コードハイライト）

### バックエンド
- Flask（Python）
- PyMongo（MongoDB ODM）
- Google Gemini API
- Flask-CORS

### データベース
- MongoDB Atlas

### デプロイ
- Vercel

## 🎯 クイックスタート

### 前提条件

- Node.js 18以上
- Python 3.9以上
- MongoDB Atlas アカウント
- Google Gemini API キー

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd ai-chat
```

### 2. 依存関係のインストール

```bash
make install
# または
make install-frontend  # フロントエンドのみ
make install-backend   # バックエンドのみ
```

### 3. 環境変数の設定

#### フロントエンド

```bash
cd frontend
cp .env.example .env
```

`.env` を編集：
```
VITE_API_BASE_URL=http://localhost:5001/api
```

#### バックエンド

```bash
cd api
cp .env.example .env
```

`.env` を編集：
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-chat
GEMINI_API_KEY=your_gemini_api_key
FLASK_ENV=development
DEBUG=True
```

### 4. 開発サーバーの起動

```bash
make dev
```

- フロントエンド: http://localhost:5173
- バックエンド: http://localhost:5001

## 🛠️ 開発

### Makefile コマンド

```bash
make help               # 全コマンドを表示
make dev                # フロントエンド + バックエンドを同時起動
make dev-frontend       # フロントエンドのみ起動
make dev-backend        # バックエンドのみ起動
make test               # E2Eテスト実行
make test-ui            # UIモードでテスト
make build              # 本番用ビルド
make clean              # ビルド成果物を削除
```

### 個別コマンド

#### フロントエンド

```bash
cd frontend
npm run dev             # 開発サーバー起動
npm run build           # ビルド
npm run preview         # ビルドをプレビュー
npm run test            # Playwrightテスト
npm run test:ui         # UIモードでテスト
```

#### バックエンド

```bash
cd api
python index.py         # 開発サーバー起動（ポート5001）
```

## 🧪 テスト

### E2Eテスト（Playwright）

```bash
make test               # 全テスト実行
make test-ui            # UIモードで実行
make test-debug         # デバッグモード
make test-report        # レポート表示
```

### テストステータス

- **合格**: 29/35 (82.9%)
- **主要機能**: すべて動作確認済み

## 🚀 デプロイ

### Vercelへのデプロイ

#### 1. Vercel CLIのインストール

```bash
npm install -g vercel
```

#### 2. ログイン

```bash
make vercel-login
# または
vercel login
```

#### 3. デプロイ

```bash
make deploy
# または
vercel --prod
```

#### 4. 環境変数の設定

Vercelダッシュボードで設定：

| 変数名 | 値 |
|--------|-----|
| `MONGODB_URI` | MongoDB Atlas接続文字列 |
| `GEMINI_API_KEY` | Google Gemini APIキー |

または、CLI経由：

```bash
make vercel-env
# または
vercel env add MONGODB_URI production
vercel env add GEMINI_API_KEY production
```

#### 5. 再デプロイ

環境変数設定後、再度デプロイ：

```bash
make deploy
```

## 📚 ドキュメント

- **CLAUDE.md** - 詳細な技術仕様書
- **DEPLOY.md** - デプロイ手順とトラブルシューティング
- **DEPLOYMENT_CHECKLIST.md** - デプロイ前チェックリスト
- **README_DEPLOYMENT.md** - デプロイクイックスタート
- **TODO.md** - 開発ロードマップ
- **SETUP_GUIDE.md** - セットアップガイド

## 📁 プロジェクト構成

```
ai-chat/
├── frontend/           # Vue.jsフロントエンド
│   ├── src/
│   │   ├── components/ # Vueコンポーネント
│   │   ├── stores/     # Piniaストア
│   │   ├── services/   # API通信
│   │   └── views/      # ページコンポーネント
│   └── tests/          # E2Eテスト
│
├── api/                # Flaskバックエンド
│   ├── routes/         # APIルート
│   ├── models/         # データモデル
│   ├── services/       # ビジネスロジック
│   └── index.py        # エントリーポイント
│
├── vercel.json         # Vercel設定
├── Makefile            # タスクランナー
└── README.md           # このファイル
```

## 🔧 トラブルシューティング

### ポート5001が使用中

```bash
# macOSのAirPlayレシーバーを無効化
システム設定 → 一般 → AirDropとHandoff → AirPlayレシーバー → オフ
```

### MongoDB接続エラー

- MongoDB AtlasのネットワークアクセスでIPアドレスを許可
- 接続文字列が正しいか確認
- ユーザー権限を確認

### Gemini APIエラー

- APIキーが有効か確認
- クォータ制限を確認（有料プラン推奨）
- `api/config.py`でモデル設定を確認

## 📊 ステータス

- **開発**: ✅ 完了
- **テスト**: ✅ 29/35 合格（82.9%）
- **ビルド**: ✅ 成功
- **デプロイ設定**: ✅ 完了
- **本番デプロイ**: 準備完了

## 📝 ライセンス

未定

---

**最終更新**: 2025-12-31
