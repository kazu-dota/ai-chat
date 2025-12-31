# AIチャットボット開発 実行計画

**プロジェクト名**: AIチャットボット（社内向け汎用対話システム）
**作成日**: 2025-12-30
**最終更新**: 2025-12-31

---

## 進捗状況

- [x] Phase 1: 環境セットアップ
- [x] Phase 2: バックエンド基盤構築
- [x] Phase 3: フロントエンド基盤構築
- [ ] Phase 4: コア機能実装
- [ ] Phase 5: 統合とテスト
- [ ] Phase 6: デプロイと本番化

---

## Phase 1: 環境セットアップ

### 1.1 プロジェクト初期化
- [x] プロジェクトディレクトリ作成（`ai-chat/`）
- [x] Gitリポジトリ初期化
  ```bash
  git init
  ```
- [x] `.gitignore`ファイル作成
  - `node_modules/`
  - `venv/`
  - `.env`
  - `__pycache__/`
  - `.DS_Store`
- [x] READMEファイル作成

### 1.2 外部サービスのセットアップ
- [x] MongoDB Atlas アカウント作成（ユーザーが手動で実施）
  - [x] 無料クラスタ作成
  - [x] データベースユーザー作成
  - [x] ネットワークアクセス設定（0.0.0.0/0）
  - [x] 接続URI取得
- [x] Google Gemini API キー取得（ユーザーが手動で実施）
  - [x] Google AI Studioにアクセス
  - [x] APIキー作成
  - [x] キーを安全に保存
- [ ] GitHubリポジトリ作成（デプロイ用）
  - [ ] リポジトリ作成
  - [ ] ローカルとリモートを連携

### 1.3 ディレクトリ構造作成
- [x] プロジェクト構造を作成
  ```
  ai-chat/
  ├── api/              # Flaskバックエンド
  ├── frontend/         # Vue.jsフロントエンド
  ├── CLAUDE.md         # 仕様書
  ├── TODO.md           # このファイル
  ├── README.md
  └── vercel.json       # Vercel設定
  ```

---

## Phase 2: バックエンド基盤構築

### 2.1 Flask プロジェクトセットアップ
- [x] `api/`ディレクトリ作成
- [ ] uvのインストール（初回のみ）
  ```bash
  # macOS/Linux
  curl -LsSf https://astral.sh/uv/install.sh | sh
  # Windows
  powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
  ```
- [ ] Python環境と依存パッケージのインストール
  ```bash
  cd api
  uv python install 3.11  # Python 3.11をインストール
  uv sync                 # pyproject.tomlから依存関係をインストール
  ```
- [x] `pyproject.toml`作成（uv用）
- [x] `requirements.txt`作成（互換性のため残す）

### 2.2 ディレクトリ構造作成
- [x] バックエンドのディレクトリ構造作成
  ```
  api/
  ├── __init__.py
  ├── index.py              # エントリーポイント
  ├── config.py             # 設定
  ├── routes/
  │   ├── __init__.py
  │   ├── threads.py
  │   └── messages.py
  ├── models/
  │   ├── __init__.py
  │   ├── thread.py
  │   └── message.py
  ├── services/
  │   ├── __init__.py
  │   ├── db_service.py
  │   └── gemini_service.py
  └── requirements.txt
  ```

### 2.3 環境変数設定
- [ ] `api/.env`ファイル作成（ユーザーが手動で実施）
  ```
  MONGODB_URI=mongodb+srv://...
  GEMINI_API_KEY=your_api_key
  FLASK_ENV=development
  ```
- [x] `.env`を`.gitignore`に追加済み確認

### 2.4 基本設定ファイル作成
- [x] `api/config.py`作成
  - 環境変数の読み込み
  - 設定クラスの定義
- [x] `api/__init__.py`作成（パッケージ化）

### 2.5 データベース接続実装
- [x] `api/services/db_service.py`作成
  - MongoDB接続関数
  - データベース/コレクション取得関数
  - 接続テスト関数
- [ ] MongoDB接続テスト実行（環境変数設定後）

### 2.6 Gemini API統合
- [x] `api/services/gemini_service.py`作成
  - Gemini APIクライアント初期化
  - メッセージ送信関数
  - エラーハンドリング
- [ ] Gemini API接続テスト実行（環境変数設定後）

### 2.7 データモデル実装
- [x] `api/models/thread.py`作成
  - `create_thread()` - スレッド作成
  - `get_threads()` - スレッド一覧取得
  - `get_thread_by_id()` - スレッド取得
  - `delete_thread()` - スレッド削除
- [x] `api/models/message.py`作成
  - `create_message()` - メッセージ作成
  - `get_messages_by_thread()` - スレッド別メッセージ取得
  - `delete_messages_by_thread()` - スレッド削除時のメッセージ削除

### 2.8 APIルート実装
- [x] `api/routes/threads.py`作成
  - `GET /api/threads` - スレッド一覧
  - `POST /api/threads` - スレッド作成
  - `DELETE /api/threads/<id>` - スレッド削除
- [x] `api/routes/messages.py`作成
  - `GET /api/threads/<id>/messages` - メッセージ一覧
  - `POST /api/threads/<id>/messages` - メッセージ送信＋AI応答

### 2.9 Flaskアプリケーション作成
- [x] `api/index.py`作成
  - Flaskアプリ初期化
  - CORS設定
  - ルート登録
  - ヘルスチェックエンドポイント（`GET /api/health`）
  - Vercel Serverless Functions対応

### 2.10 バックエンド動作確認
- [ ] ローカルサーバー起動（環境変数設定後）
  ```bash
  cd api
  uv run python index.py
  ```
- [ ] APIエンドポイントテスト（Postman/curl）
  - [ ] `GET /api/health` - ヘルスチェック
  - [ ] `POST /api/threads` - スレッド作成
  - [ ] `GET /api/threads` - スレッド一覧
  - [ ] `POST /api/threads/<id>/messages` - メッセージ送信
  - [ ] `GET /api/threads/<id>/messages` - メッセージ取得
  - [ ] `DELETE /api/threads/<id>` - スレッド削除

---

## Phase 3: フロントエンド基盤構築

### 3.1 Vue.js プロジェクトセットアップ
- [x] Node.js/npmインストール確認
- [x] Vue.jsプロジェクト作成（Vite使用）
  ```bash
  npm create vite@latest frontend -- --template vue
  ```
- [x] プロジェクトディレクトリに移動してインストール
  ```bash
  cd frontend
  npm install
  ```

### 3.2 必要なパッケージインストール
- [x] Vue Router、Pinia、Axios（API通信）
  ```bash
  npm install vue-router@4 pinia axios
  ```
- [x] Markdown関連
  ```bash
  npm install marked dompurify
  ```
- [x] シンタックスハイライト
  ```bash
  npm install highlight.js
  ```

### 3.3 ディレクトリ構造整理
- [x] `frontend/src/`以下の構造作成
  ```
  src/
  ├── assets/
  ├── components/
  │   ├── ChatMessage.vue
  │   ├── ChatInput.vue
  │   ├── ThreadList.vue
  │   ├── MarkdownRenderer.vue
  │   └── CodeBlock.vue
  ├── views/
  │   └── ChatView.vue
  ├── stores/
  │   ├── threadStore.js
  │   └── messageStore.js
  ├── services/
  │   └── api.js
  ├── router/
  │   └── index.js
  ├── App.vue
  └── main.js
  ```

### 3.4 API通信設定
- [x] `frontend/src/services/api.js`作成
  - Axiosインスタンス作成
  - ベースURL設定（開発: `http://localhost:5001`）
  - API関数定義
    - `getThreads()`
    - `createThread(title)`
    - `deleteThread(threadId)`
    - `getMessages(threadId)`
    - `sendMessage(threadId, content)`

### 3.5 状態管理（Pinia）実装
- [x] `frontend/src/stores/threadStore.js`作成
  - State: `threads`, `currentThreadId`, `loading`, `error`
  - Getters: `currentThread`, `hasThreads`, `sortedThreads`
  - Actions:
    - `fetchThreads()`
    - `createThread(title)`
    - `updateThread(threadId, title)`
    - `deleteThread(threadId)`
    - `setCurrentThread(threadId)`
- [x] `frontend/src/stores/messageStore.js`作成
  - State: `messages`, `loading`, `sending`, `error`
  - Getters: `hasMessages`, `sortedMessages`, `latestMessage`
  - Actions:
    - `fetchMessages(threadId)`
    - `sendMessage(threadId, content)`
    - `deleteMessage(messageId)`
    - `clearMessages()`

### 3.6 コンポーネント実装
- [x] `CodeBlock.vue` - コードブロックのシンタックスハイライト
- [x] `MarkdownRenderer.vue` - Markdownレンダリング
- [x] `ChatMessage.vue` - メッセージ表示
- [x] `ChatInput.vue` - メッセージ入力フォーム
- [x] `ThreadList.vue` - スレッド一覧
- [x] `ChatView.vue` - メインチャット画面

### 3.7 ルーティング設定
- [x] `frontend/src/router/index.js`作成
  - `/` - ChatView（デフォルト）
  - `/thread/:threadId` - 特定スレッドのチャット画面

### 3.8 App.vue更新
- [x] router-viewの統合
- [x] グローバルスタイル適用

### 3.9 環境変数設定
- [x] `.env`ファイル作成（`VITE_API_BASE_URL`設定）
- [x] `.env.example`ファイル作成

---

## Phase 4: コア機能実装

### 4.1 基本コンポーネント作成

#### 4.1.1 ThreadList.vue
- [ ] コンポーネント作成
  - [ ] スレッド一覧表示
  - [ ] 新規スレッド作成ボタン
  - [ ] スレッド選択機能
  - [ ] スレッド削除ボタン
  - [ ] 作成日時表示

#### 4.1.2 ChatMessage.vue
- [ ] コンポーネント作成
  - [ ] ユーザー/アシスタントメッセージの区別
  - [ ] メッセージ本文表示
  - [ ] タイムスタンプ表示
  - [ ] MarkdownRenderer統合
  - [ ] スタイリング（吹き出し形式など）

#### 4.1.3 ChatInput.vue
- [ ] コンポーネント作成
  - [ ] テキストエリア
  - [ ] 送信ボタン
  - [ ] Enterキーで送信（Shift+Enterで改行）
  - [ ] ローディング状態表示
  - [ ] 送信中は入力無効化

#### 4.1.4 MarkdownRenderer.vue
- [ ] コンポーネント作成
  - [ ] `marked`でMarkdown変換
  - [ ] `dompurify`でサニタイズ
  - [ ] CodeBlock検出と分離
  - [ ] HTML出力

#### 4.1.5 CodeBlock.vue
- [ ] コンポーネント作成
  - [ ] `highlight.js`でシンタックスハイライト
  - [ ] 言語検出
  - [ ] コピーボタン（オプション）
  - [ ] スタイリング

### 4.2 メイン画面実装
- [ ] `frontend/src/views/ChatView.vue`作成
  - [ ] 2カラムレイアウト
    - 左: ThreadList
    - 右: メッセージ表示エリア + ChatInput
  - [ ] レスポンシブデザイン（モバイル対応）
  - [ ] メッセージの自動スクロール（最新メッセージへ）
  - [ ] 空状態の処理（スレッド未選択時）

### 4.3 ルーティング設定
- [ ] `frontend/src/router/index.js`設定
  - [ ] `/` - ChatView（デフォルト）
  - [ ] 必要に応じて他のルート追加

### 4.4 App.vueの調整
- [ ] グローバルスタイル適用
- [ ] ヘッダー/フッター（必要に応じて）
- [ ] エラーハンドリング

### 4.5 スタイリング
- [ ] グローバルCSS作成（`assets/main.css`）
- [ ] 各コンポーネントのスタイル調整
- [ ] レスポンシブデザイン確認
- [ ] ダークモード対応（オプション）

---

## Phase 5: 統合とテスト

### 5.1 ローカル統合テスト
- [ ] バックエンドサーバー起動（`python api/index.py`）
- [ ] フロントエンドサーバー起動（`npm run dev`）
- [ ] CORS設定確認
- [ ] エンドツーエンドテスト
  - [ ] スレッド作成
  - [ ] メッセージ送信
  - [ ] AI応答受信
  - [ ] Markdown表示
  - [ ] コードハイライト
  - [ ] スレッド切り替え
  - [ ] スレッド削除

### 5.2 エラーハンドリング
- [ ] フロントエンド
  - [ ] API通信エラーのトースト/アラート表示
  - [ ] ローディング状態の適切な管理
  - [ ] ネットワークエラー時のリトライ機能
- [ ] バックエンド
  - [ ] 適切なHTTPステータスコード返却
  - [ ] エラーメッセージのJSON形式統一
  - [ ] ログ出力

### 5.3 パフォーマンス確認
- [ ] 長い会話履歴での動作確認
- [ ] 複数スレッドでの動作確認
- [ ] Gemini APIレスポンス時間確認
- [ ] 必要に応じて最適化

### 5.4 ブラウザ互換性確認
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### 5.5 モバイル対応確認
- [ ] レスポンシブデザインの動作確認
- [ ] タッチ操作の確認

---

## Phase 6: デプロイと本番化

### 6.1 Vercel設定ファイル作成
- [ ] プロジェクトルートに`vercel.json`作成
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

### 6.2 フロントエンドビルド設定
- [ ] `frontend/package.json`の`scripts`確認
  ```json
  {
    "scripts": {
      "build": "vite build",
      "vercel-build": "npm run build"
    }
  }
  ```
- [ ] 環境変数対応
  - [ ] `.env.production`作成
  - [ ] API URLを本番環境に設定

### 6.3 バックエンドのVercel対応
- [ ] `api/index.py`でVercel Serverless Functions対応確認
  - [ ] アプリインスタンスのエクスポート
  ```python
  app = Flask(__name__)
  # ... 設定とルート ...

  # Vercel用
  if __name__ != "__main__":
      # Serverless環境用
      pass
  ```

### 6.4 GitHubへプッシュ
- [ ] 全ての変更をコミット
  ```bash
  git add .
  git commit -m "Initial implementation"
  git push origin main
  ```

### 6.5 Vercelデプロイ
- [ ] Vercel CLIインストール
  ```bash
  npm i -g vercel
  ```
- [ ] Vercelログイン
  ```bash
  vercel login
  ```
- [ ] 初回デプロイ
  ```bash
  vercel
  ```
- [ ] 環境変数設定（Vercelダッシュボードまたは CLI）
  - [ ] `MONGODB_URI`
  - [ ] `GEMINI_API_KEY`
- [ ] 本番デプロイ
  ```bash
  vercel --prod
  ```

### 6.6 本番環境テスト
- [ ] デプロイされたURLにアクセス
- [ ] 全機能の動作確認
  - [ ] スレッド作成
  - [ ] メッセージ送受信
  - [ ] Markdown/コード表示
  - [ ] スレッド削除
- [ ] パフォーマンス確認
- [ ] エラーログ確認

### 6.7 ドキュメント更新
- [ ] README.mdに以下を追加
  - [ ] プロジェクト説明
  - [ ] セットアップ手順
  - [ ] デプロイ手順
  - [ ] 使用技術
  - [ ] ライセンス
- [ ] CLAUDE.mdの更新（必要に応じて）

### 6.8 監視とメンテナンス
- [ ] MongoDB Atlasのモニタリング設定
- [ ] Vercelのログ確認方法確認
- [ ] バックアップ戦略検討
- [ ] 定期的なデータクリーンアップ計画

---

## 追加タスク（オプション）

### テスト実装
- [ ] バックエンド単体テスト（pytest）
  - [ ] データモデルのテスト
  - [ ] APIエンドポイントのテスト
- [ ] フロントエンド単体テスト（Vitest）
  - [ ] コンポーネントのテスト
  - [ ] Storeのテスト
- [ ] E2Eテスト（Playwright/Cypress）

### 機能拡張
- [ ] ストリーミングレスポンス対応
- [ ] ファイルアップロード機能
- [ ] メッセージ編集・削除機能
- [ ] 会話のエクスポート機能（JSON/Markdown）
- [ ] ダークモード切り替え
- [ ] ユーザー設定（モデル選択など）

### セキュリティ強化
- [ ] レート制限実装（Flask-Limiter）
- [ ] 入力バリデーション強化
- [ ] CSRF対策
- [ ] MongoDB接続のIP制限（本番環境）

### パフォーマンス最適化
- [ ] メッセージのページネーション
- [ ] 仮想スクロール実装
- [ ] キャッシュ戦略
- [ ] 画像最適化

---

## トラブルシューティングチェックリスト

### 開発中に問題が発生したら
- [ ] `.env`ファイルが正しく設定されているか
- [ ] MongoDB Atlasへの接続が可能か
- [ ] Gemini APIキーが有効か
- [ ] CORS設定が正しいか
- [ ] ポート競合がないか（5000, 5173など）
- [ ] パッケージが正しくインストールされているか
- [ ] エラーログを確認

### デプロイ時に問題が発生したら
- [ ] `vercel.json`の設定が正しいか
- [ ] 環境変数がVercelに設定されているか
- [ ] ビルドログにエラーがないか
- [ ] MongoDB AtlasのネットワークアクセスがVercelのIPを許可しているか
- [ ] フロントエンドのAPI URLが本番URLを指しているか

---

## 完了基準

全てのフェーズが完了し、以下が達成されたら開発完了：

- [x] ローカル環境で正常に動作
- [x] 全ての必須機能が実装されている
- [x] Vercelに正常にデプロイされている
- [x] 本番環境で全機能が動作
- [x] ドキュメントが最新状態
- [x] エラーハンドリングが適切に実装されている
- [x] レスポンシブデザインが機能している

---

## 備考

- 各タスクは上から順番に実行することを推奨
- 問題が発生した場合は、CLAUDE.mdの「トラブルシューティング」セクションを参照
- 定期的にGitコミットを行い、進捗を保存すること
- テストは開発と並行して実施することを推奨

---

**次のステップ**: Phase 1の環境セットアップから開始してください！
