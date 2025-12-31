.PHONY: help install dev test build deploy clean

# デフォルトターゲット: ヘルプを表示
help:
	@echo "AIチャットボット - 利用可能なコマンド"
	@echo ""
	@echo "セットアップ:"
	@echo "  make install          - 全依存関係をインストール"
	@echo "  make install-frontend - フロントエンド依存関係をインストール"
	@echo "  make install-backend  - バックエンド依存関係をインストール"
	@echo ""
	@echo "開発:"
	@echo "  make dev              - フロントエンドとバックエンドを同時起動"
	@echo "  make dev-frontend     - フロントエンド開発サーバー起動"
	@echo "  make dev-backend      - バックエンド開発サーバー起動"
	@echo ""
	@echo "テスト:"
	@echo "  make test             - E2Eテストを実行"
	@echo "  make test-ui          - Playwright UIモードでテスト"
	@echo "  make test-debug       - デバッグモードでテスト"
	@echo "  make test-report      - テストレポートを表示"
	@echo ""
	@echo "ビルド:"
	@echo "  make build            - 本番用ビルド"
	@echo "  make preview          - ビルドをプレビュー"
	@echo ""
	@echo "デプロイ:"
	@echo "  make deploy           - Vercelに本番デプロイ"
	@echo "  make deploy-preview   - Vercelにプレビューデプロイ"
	@echo ""
	@echo "クリーンアップ:"
	@echo "  make clean            - ビルド成果物とキャッシュを削除"
	@echo "  make clean-all        - node_modules, venv含めて全削除"

# インストール
install: install-frontend install-backend
	@echo "✅ 全依存関係のインストールが完了しました"

install-frontend:
	@echo "📦 フロントエンド依存関係をインストール中..."
	cd frontend && npm install

install-backend:
	@echo "📦 バックエンド依存関係をインストール中..."
	cd api && pip install -r requirements.txt

# 開発サーバー
dev:
	@echo "🚀 開発サーバーを起動します..."
	@echo "フロントエンド: http://localhost:5173"
	@echo "バックエンド: http://localhost:5001"
	@echo ""
	@echo "Ctrl+C で両方のサーバーを停止できます"
	@echo ""
	@make -j2 dev-frontend-silent dev-backend-silent

dev-frontend:
	@echo "🎨 フロントエンド開発サーバー起動中..."
	cd frontend && npm run dev

dev-frontend-silent:
	@cd frontend && npm run dev

dev-backend:
	@echo "⚙️  バックエンド開発サーバー起動中..."
	cd api && python index.py

dev-backend-silent:
	@cd api && python index.py

# テスト
test:
	@echo "🧪 E2Eテストを実行中..."
	cd frontend && npm run test

test-ui:
	@echo "🧪 Playwright UIモードでテスト実行中..."
	cd frontend && npm run test:ui

test-debug:
	@echo "🐛 デバッグモードでテスト実行中..."
	cd frontend && npm run test:debug

test-report:
	@echo "📊 テストレポートを表示中..."
	cd frontend && npm run test:report

# ビルド
build:
	@echo "🏗️  本番用ビルド実行中..."
	cd frontend && npm run build
	@echo "✅ ビルドが完了しました: frontend/dist/"

preview:
	@echo "👀 ビルドをプレビュー中..."
	cd frontend && npm run preview

# デプロイ
deploy:
	@echo "🚀 Vercelに本番デプロイ中..."
	vercel --prod

deploy-preview:
	@echo "🚀 Vercelにプレビューデプロイ中..."
	vercel

# クリーンアップ
clean:
	@echo "🧹 ビルド成果物とキャッシュを削除中..."
	rm -rf frontend/dist
	rm -rf frontend/node_modules/.vite
	rm -rf frontend/test-results
	rm -rf frontend/playwright-report
	rm -rf frontend/playwright/.cache
	rm -rf api/__pycache__
	rm -rf api/**/__pycache__
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	@echo "✅ クリーンアップ完了"

clean-all: clean
	@echo "🧹 全依存関係を削除中..."
	rm -rf frontend/node_modules
	rm -rf api/venv
	rm -rf api/.venv
	@echo "✅ 完全クリーンアップ完了"

# ユーティリティ
check-env:
	@echo "🔍 環境設定を確認中..."
	@if [ ! -f frontend/.env ]; then \
		echo "⚠️  frontend/.env が見つかりません"; \
		echo "   frontend/.env.example をコピーして .env を作成してください"; \
	else \
		echo "✅ frontend/.env が存在します"; \
	fi
	@if [ ! -f api/.env ]; then \
		echo "⚠️  api/.env が見つかりません"; \
		echo "   api/.env.example をコピーして .env を作成してください"; \
	else \
		echo "✅ api/.env が存在します"; \
	fi

setup: check-env install
	@echo ""
	@echo "✅ セットアップが完了しました！"
	@echo ""
	@echo "次のステップ:"
	@echo "  1. 環境変数ファイル (.env) を確認・設定"
	@echo "  2. make dev で開発サーバーを起動"
	@echo ""

# Git関連
git-status:
	@git status

git-add-all:
	@git add .
	@git status

# Vercel関連
vercel-login:
	@vercel login

vercel-env:
	@echo "環境変数を設定します..."
	@echo "MONGODB_URI を設定:"
	@vercel env add MONGODB_URI production
	@echo "GEMINI_API_KEY を設定:"
	@vercel env add GEMINI_API_KEY production
