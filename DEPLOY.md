# デプロイガイド

## Vercelへのデプロイ手順

### 前提条件

- GitHubアカウント
- Vercelアカウント
- MongoDB Atlas（設定済み）
- Gemini API キー（取得済み）

### 1. GitHubリポジトリの準備

```bash
# Gitリポジトリを初期化（まだの場合）
git init

# すべてのファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit: AI Chat App ready for deployment"

# GitHubリポジトリを作成し、リモートを追加
# GitHubで新しいリポジトリを作成してから：
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 2. Vercel CLI のインストール

```bash
npm install -g vercel
```

### 3. Vercelにログイン

```bash
vercel login
```

ブラウザが開き、Vercelアカウントでログインします。

### 4. プロジェクトのデプロイ

#### プレビューデプロイ（テスト用）

```bash
vercel
```

プロンプトに従って設定：
- Set up and deploy? → Yes
- Which scope? → あなたのアカウントを選択
- Link to existing project? → No
- What's your project's name? → ai-chat（または任意の名前）
- In which directory is your code located? → ./

#### 本番環境にデプロイ

```bash
vercel --prod
```

### 5. 環境変数の設定

Vercelダッシュボード（https://vercel.com）で：

1. プロジェクトを選択
2. Settings → Environment Variables
3. 以下の環境変数を追加：

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://...` | Production, Preview |
| `GEMINI_API_KEY` | `your_api_key` | Production, Preview |

または、CLI経由で設定：

```bash
vercel env add MONGODB_URI production
# 値を入力

vercel env add GEMINI_API_KEY production
# 値を入力
```

### 6. 再デプロイ

環境変数を設定した後、再度デプロイ：

```bash
vercel --prod
```

### 7. 動作確認

デプロイが完了すると、URLが表示されます：
```
https://ai-chat-xxxx.vercel.app
```

ブラウザで開いて動作確認：
- [ ] ホーム画面が表示される
- [ ] 新規会話が作成できる
- [ ] メッセージが送信できる
- [ ] AI応答が返ってくる
- [ ] スレッド切り替えができる
- [ ] Markdownが正しくレンダリングされる

## トラブルシューティング

### ビルドエラー

**エラー**: `Cannot find module 'vite'`
**解決**: package.json の依存関係を確認
```bash
cd frontend
npm install
```

### APIエラー（500 Internal Server Error）

**原因**: 環境変数が設定されていない
**解決**: Vercelダッシュボードで環境変数を確認・再設定

### CORSエラー

**原因**: フロントエンドのドメインが許可されていない
**解決**: `api/config.py`のCORS_ORIGINSに本番URLを追加（既に`*.vercel.app`が含まれているはず）

### MongoDB接続エラー

**原因**: MongoDB AtlasのネットワークアクセスでVercelのIPが許可されていない
**解決**: MongoDB Atlasで「0.0.0.0/0」（すべてのIPを許可）を設定

## ローカルでのビルドテスト

デプロイ前にローカルでビルドをテストできます：

```bash
# フロントエンドのビルド
cd frontend
npm run build
npm run preview

# バックエンドのテスト
cd ../api
python -m pytest  # テストがある場合
```

## 継続的デプロイ（CD）

GitHubにプッシュすると自動的にVercelがデプロイを実行します：

```bash
git add .
git commit -m "Update feature"
git push origin main
```

- `main`ブランチ → 本番環境に自動デプロイ
- その他のブランチ → プレビュー環境に自動デプロイ

## カスタムドメインの設定（オプション）

Vercelダッシュボードで：
1. プロジェクト → Settings → Domains
2. カスタムドメインを追加
3. DNSレコードを設定（指示に従う）

## モニタリング

### Vercel Analytics
- Vercelダッシュボードで Analytics タブを確認
- トラフィック、パフォーマンス、エラー率を監視

### ログの確認
```bash
vercel logs [deployment-url]
```

## ロールバック

問題が発生した場合、以前のデプロイにロールバック：
1. Vercelダッシュボード → Deployments
2. 正常に動作していたデプロイを選択
3. 「Promote to Production」をクリック

## セキュリティチェックリスト

- [ ] `.env`ファイルが`.gitignore`に含まれている
- [ ] GitHubに秘密情報がコミットされていない
- [ ] MongoDB Atlasのユーザー権限が適切に設定されている
- [ ] Gemini APIキーが環境変数として設定されている
- [ ] CORS設定が本番環境に対応している

## パフォーマンス最適化（オプション）

- Vercel Edge Functions の利用
- 画像最適化（next/image的なもの）
- キャッシュ戦略の実装
- CDNの活用（Vercelは自動）

---

作成日: 2025-12-31
最終更新: 2025-12-31
