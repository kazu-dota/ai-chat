# デプロイ前チェックリスト

## ✅ 完了した設定

### 1. Vercel設定ファイル
- [x] `vercel.json` - モノレポ構成のビルド設定
- [x] `frontend/package.json` - vercel-buildスクリプト追加
- [x] `api/index.py` - Serverless Functions対応済み

### 2. 環境変数設定
- [x] `frontend/.env` - ローカル開発用
- [x] `frontend/.env.production` - 本番環境用（API URL: /api）
- [x] `frontend/.env.example` - テンプレート
- [x] `api/.env.example` - テンプレート

### 3. CORS設定
- [x] `api/config.py` - Vercelドメイン対応
  - `http://localhost:5173` - ローカル開発
  - `http://localhost:3000` - ローカル開発（代替）
  - `https://*.vercel.app` - Vercel全デプロイメント
  - 環境変数 `FRONTEND_URL` でカスタムドメイン追加可能

### 4. .gitignore設定
- [x] ルート `.gitignore` - 環境変数、ビルド成果物など
- [x] `frontend/.gitignore` - Node関連、テスト結果など
- [x] `.env.production` は除外（公開情報のみ含むため）

### 5. ドキュメント
- [x] `DEPLOY.md` - 詳細なデプロイ手順
- [x] `DEPLOYMENT_CHECKLIST.md` - このファイル

### 6. ビルド確認
- [x] フロントエンドビルド成功確認（`npm run build`）

## 📋 デプロイ前の準備

### Vercelで設定する環境変数

以下の環境変数をVercelダッシュボードまたはCLIで設定する必要があります：

| Variable | Environment | 取得方法 |
|----------|-------------|---------|
| `MONGODB_URI` | Production, Preview | MongoDB Atlasの接続文字列 |
| `GEMINI_API_KEY` | Production, Preview | Google AI Studioで生成 |

### MongoDB Atlas設定

- [ ] ネットワークアクセス: 0.0.0.0/0（すべてのIP許可）
- [ ] データベースユーザー: 読み書き権限あり
- [ ] 接続文字列をコピー済み

### Gemini API設定

- [ ] 有料プランへのアップグレード（推奨）
- [ ] APIキーをコピー済み
- [ ] クォータ確認（推奨: 有料版）

## 🚀 デプロイ手順（概要）

```bash
# 1. GitHub リポジトリにプッシュ
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Vercel CLIでデプロイ
vercel --prod

# 3. 環境変数を設定
vercel env add MONGODB_URI production
vercel env add GEMINI_API_KEY production

# 4. 再デプロイ
vercel --prod
```

詳細は `DEPLOY.md` を参照してください。

## 🧪 デプロイ後の動作確認

- [ ] ホーム画面が表示される
- [ ] 新規会話を作成できる
- [ ] メッセージを送信できる
- [ ] AI応答が返ってくる（Gemini API連携確認）
- [ ] 会話履歴が保存される（MongoDB連携確認）
- [ ] スレッド切り替えができる
- [ ] スレッド削除ができる
- [ ] Markdownが正しく表示される
- [ ] コードブロックがハイライトされる

## 📁 ファイル構成（確認用）

```
ai-chat/
├── vercel.json                  # Vercelビルド設定
├── .gitignore                   # Git除外設定
├── DEPLOY.md                    # デプロイガイド
├── DEPLOYMENT_CHECKLIST.md      # このファイル
│
├── frontend/
│   ├── package.json            # vercel-build スクリプト含む
│   ├── .env                    # ローカル用（Git除外）
│   ├── .env.production         # 本番用（コミット可）
│   ├── .env.example            # テンプレート
│   ├── .gitignore
│   └── src/
│       └── services/
│           └── api.js          # VITE_API_BASE_URL使用
│
└── api/
    ├── index.py                # Serverless Functions エントリーポイント
    ├── config.py               # CORS、環境変数設定
    ├── .env                    # ローカル用（Git除外）
    ├── .env.example            # テンプレート
    └── requirements.txt        # Python依存関係
```

## 🔧 重要な設定内容

### vercel.json
```json
{
  "builds": [
    { "src": "frontend/package.json", "use": "@vercel/static-build" },
    { "src": "api/index.py", "use": "@vercel/python" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "api/index.py" },
    { "src": "/(.*)", "dest": "frontend/dist/$1" }
  ]
}
```

### frontend/.env.production
```
VITE_API_BASE_URL=/api
```

### api/config.py（抜粋）
```python
GEMINI_MODEL = 'models/gemini-2.5-flash-lite'
CORS_ORIGINS = [
    'http://localhost:5173',
    'https://*.vercel.app',
]
```

## 📊 現在のステータス

- **アプリケーション**: ✅ 動作確認済み（ローカル環境）
- **テスト**: 29/35 合格（82.9%）
- **ビルド**: ✅ 成功
- **デプロイ設定**: ✅ 完了
- **次のステップ**: GitHub → Vercel デプロイ

---

最終更新: 2025-12-31
