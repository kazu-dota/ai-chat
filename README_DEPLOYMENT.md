# AIチャットボット - デプロイ準備完了

## 📦 デプロイ準備状況

すべてのデプロイ設定が完了しました。以下の手順でVercelにデプロイできます。

## 🎯 クイックスタート

### 1. Vercel CLIのインストール

```bash
npm install -g vercel
```

### 2. デプロイ実行

```bash
# プロジェクトルートで実行
vercel --prod
```

### 3. 環境変数の設定

Vercelダッシュボード（https://vercel.com）で以下を設定：

- `MONGODB_URI`: MongoDB Atlasの接続文字列
- `GEMINI_API_KEY`: Google Gemini APIキー

または、CLI経由：

```bash
vercel env add MONGODB_URI production
vercel env add GEMINI_API_KEY production
```

### 4. 再デプロイ

環境変数設定後、再度デプロイ：

```bash
vercel --prod
```

## 📋 設定済みファイル

### Vercel設定
- ✅ `vercel.json` - ビルド・ルーティング設定
- ✅ `frontend/package.json` - vercel-buildスクリプト
- ✅ `api/requirements.txt` - Python依存関係

### 環境変数
- ✅ `frontend/.env.production` - 本番API URL（/api）
- ✅ `frontend/.env.example` - フロントエンド環境変数テンプレート
- ✅ `api/.env.example` - バックエンド環境変数テンプレート

### セキュリティ
- ✅ `.gitignore` - 秘密情報の除外設定
- ✅ `api/config.py` - CORS設定（Vercel対応）

## 🔍 デプロイ構成

```
Vercel デプロイメント
│
├── フロントエンド (@vercel/static-build)
│   └── frontend/dist/* → https://your-app.vercel.app/*
│
└── バックエンド (@vercel/python)
    └── api/index.py → https://your-app.vercel.app/api/*
```

## 🧪 ビルドテスト（ローカル）

デプロイ前に以下でビルドをテストできます：

```bash
cd frontend
npm run build
npm run preview
```

## 📚 詳細ドキュメント

- **DEPLOY.md** - 詳細なデプロイ手順とトラブルシューティング
- **DEPLOYMENT_CHECKLIST.md** - デプロイ前チェックリスト
- **CLAUDE.md** - プロジェクト仕様書

## ⚙️ 技術スタック

- **フロントエンド**: Vue 3 + Vite + Pinia
- **バックエンド**: Flask (Python)
- **データベース**: MongoDB Atlas
- **AI**: Google Gemini 2.5 Flash-Lite
- **デプロイ**: Vercel

## 🚀 次のステップ

1. GitHubリポジトリにプッシュ（任意）
2. Vercel CLIでデプロイ
3. 環境変数を設定
4. デプロイ完了URL（https://your-app.vercel.app）で動作確認

---

**作成日**: 2025-12-31  
**ステータス**: デプロイ準備完了 ✅

## 🛠️ Makefile コマンド

プロジェクトには便利なMakefileが用意されています。

### 初回セットアップ
```bash
make setup              # 環境確認 + 依存関係インストール
```

### 開発
```bash
make dev                # フロントエンド + バックエンドを同時起動
make dev-frontend       # フロントエンドのみ起動
make dev-backend        # バックエンドのみ起動
```

### テスト
```bash
make test               # E2Eテスト実行
make test-ui            # UIモードでテスト
make test-report        # テストレポート表示
```

### ビルド
```bash
make build              # 本番用ビルド
make preview            # ビルドをプレビュー
```

### デプロイ
```bash
make vercel-login       # Vercelにログイン
make vercel-env         # 環境変数を設定
make deploy             # 本番デプロイ
make deploy-preview     # プレビューデプロイ
```

### その他
```bash
make help               # 全コマンドを表示
make clean              # ビルド成果物を削除
make check-env          # 環境変数ファイルを確認
```
