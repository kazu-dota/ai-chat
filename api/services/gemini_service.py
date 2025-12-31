"""
Google Gemini API連携サービス
AIチャット機能を提供
"""
from google import genai
from google.genai import types
from config import config


class GeminiService:
    """Gemini APIを管理するクラス"""

    def __init__(self):
        """Gemini APIの初期化"""
        self.client = genai.Client(api_key=config.GEMINI_API_KEY)
        self.model_id = config.GEMINI_MODEL
        print(f"Gemini APIを初期化しました: {self.model_id}")

    def generate_response(self, messages):
        """
        会話履歴を元にAIの応答を生成

        Args:
            messages (list): 会話履歴
                [
                    {'role': 'user', 'content': 'こんにちは'},
                    {'role': 'assistant', 'content': 'こんにちは！'}
                ]

        Returns:
            str: AIの応答テキスト
        """
        try:
            # 会話履歴を構築（全メッセージを含む）
            contents = []
            for msg in messages:
                role = 'user' if msg['role'] == 'user' else 'model'
                contents.append(types.Content(
                    role=role,
                    parts=[types.Part(text=msg['content'])]
                ))

            # AI応答を生成
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=contents
            )

            return response.text

        except Exception as e:
            print(f"Gemini API エラー: {e}")
            raise Exception(f"AI応答の生成に失敗しました: {str(e)}")

    def generate_simple_response(self, prompt):
        """
        シンプルな1回限りの応答を生成

        Args:
            prompt (str): ユーザーの入力

        Returns:
            str: AIの応答テキスト
        """
        try:
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=prompt
            )
            return response.text
        except Exception as e:
            print(f"Gemini API エラー: {e}")
            raise Exception(f"AI応答の生成に失敗しました: {str(e)}")

    def list_available_models(self):
        """
        利用可能なモデルの一覧を取得

        Returns:
            list: モデル名のリスト
        """
        try:
            models = []
            for model in self.client.models.list():
                models.append(model.name)
            return models
        except Exception as e:
            print(f"モデル一覧取得エラー: {e}")
            return []

    def test_connection(self):
        """
        接続テスト

        Returns:
            dict: テスト結果
        """
        try:
            response = self.generate_simple_response("こんにちは")
            return {
                'status': 'success',
                'message': 'Gemini API接続成功',
                'response': response
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Gemini API接続失敗: {str(e)}'
            }


# シングルトンインスタンス
gemini_service = GeminiService()
