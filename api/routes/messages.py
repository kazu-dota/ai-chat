"""
メッセージ関連のAPIエンドポイント
"""
from flask import Blueprint, request, jsonify
from models import message as message_model
from models import thread as thread_model
from services.gemini_service import gemini_service

messages_bp = Blueprint('messages', __name__)


@messages_bp.route('/threads/<thread_id>/messages', methods=['GET'])
def get_messages(thread_id):
    """
    特定スレッドのメッセージ一覧を取得

    Args:
        thread_id (str): スレッドID

    Returns:
        JSON: メッセージリスト
    """
    try:
        # スレッドの存在確認
        thread = thread_model.get_thread_by_id(thread_id)
        if not thread:
            return jsonify({'error': 'Thread not found'}), 404

        messages = message_model.get_messages_by_thread(thread_id)
        return jsonify({'messages': messages}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@messages_bp.route('/threads/<thread_id>/messages', methods=['POST'])
def send_message(thread_id):
    """
    メッセージを送信し、AI応答を取得

    Args:
        thread_id (str): スレッドID

    Request Body:
        {
            "content": "ユーザーのメッセージ"
        }

    Returns:
        JSON: ユーザーメッセージとAI応答
    """
    try:
        # スレッドの存在確認
        thread = thread_model.get_thread_by_id(thread_id)
        if not thread:
            return jsonify({'error': 'Thread not found'}), 404

        # リクエストボディの検証
        data = request.get_json()
        if not data or 'content' not in data:
            return jsonify({'error': 'Content is required'}), 400

        user_content = data['content'].strip()
        if not user_content:
            return jsonify({'error': 'Content cannot be empty'}), 400

        # ユーザーメッセージを保存
        user_message = message_model.create_message(
            thread_id=thread_id,
            role='user',
            content=user_content
        )

        # 会話履歴を取得
        conversation_history = message_model.get_conversation_history(thread_id)

        # AI応答を生成
        try:
            ai_response = gemini_service.generate_response(conversation_history)
        except Exception as ai_error:
            # AI応答生成に失敗した場合でもユーザーメッセージは保存済み
            return jsonify({
                'error': 'AI応答の生成に失敗しました',
                'details': str(ai_error),
                'user_message': user_message
            }), 500

        # AI応答を保存
        assistant_message = message_model.create_message(
            thread_id=thread_id,
            role='assistant',
            content=ai_response
        )

        # スレッドの更新日時を更新
        thread_model.update_thread(thread_id)

        return jsonify({
            'user_message': user_message,
            'assistant_message': assistant_message
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@messages_bp.route('/messages/<message_id>', methods=['DELETE'])
def delete_message(message_id):
    """
    特定のメッセージを削除

    Args:
        message_id (str): メッセージID

    Returns:
        JSON: 削除結果
    """
    try:
        success = message_model.delete_message(message_id)

        if not success:
            return jsonify({'error': 'Message not found'}), 404

        return jsonify({'message': 'Message deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
