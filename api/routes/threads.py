"""
スレッド関連のAPIエンドポイント
"""
from flask import Blueprint, request, jsonify
from models import thread as thread_model
from models import message as message_model

threads_bp = Blueprint('threads', __name__)


@threads_bp.route('/threads', methods=['GET'])
def get_threads():
    """
    スレッド一覧を取得

    Returns:
        JSON: スレッドリスト
    """
    try:
        threads = thread_model.get_threads()
        return jsonify({'threads': threads}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@threads_bp.route('/threads', methods=['POST'])
def create_thread():
    """
    新規スレッドを作成

    Request Body:
        {
            "title": "会話のタイトル"  (optional)
        }

    Returns:
        JSON: 作成されたスレッド
    """
    try:
        data = request.get_json() or {}
        title = data.get('title', '新しい会話')

        thread = thread_model.create_thread(title)
        return jsonify(thread), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@threads_bp.route('/threads/<thread_id>', methods=['GET'])
def get_thread(thread_id):
    """
    特定のスレッドを取得

    Args:
        thread_id (str): スレッドID

    Returns:
        JSON: スレッド
    """
    try:
        thread = thread_model.get_thread_by_id(thread_id)
        if not thread:
            return jsonify({'error': 'Thread not found'}), 404

        return jsonify(thread), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@threads_bp.route('/threads/<thread_id>', methods=['PUT'])
def update_thread(thread_id):
    """
    スレッドを更新

    Args:
        thread_id (str): スレッドID

    Request Body:
        {
            "title": "新しいタイトル"
        }

    Returns:
        JSON: 更新されたスレッド
    """
    try:
        data = request.get_json()
        if not data or 'title' not in data:
            return jsonify({'error': 'Title is required'}), 400

        thread = thread_model.update_thread(thread_id, data['title'])
        if not thread:
            return jsonify({'error': 'Thread not found'}), 404

        return jsonify(thread), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@threads_bp.route('/threads/<thread_id>', methods=['DELETE'])
def delete_thread(thread_id):
    """
    スレッドを削除（関連メッセージも削除）

    Args:
        thread_id (str): スレッドID

    Returns:
        JSON: 削除結果
    """
    try:
        # 関連メッセージを削除
        deleted_messages = message_model.delete_messages_by_thread(thread_id)

        # スレッドを削除
        success = thread_model.delete_thread(thread_id)

        if not success:
            return jsonify({'error': 'Thread not found'}), 404

        return jsonify({
            'message': 'Thread deleted successfully',
            'deleted_messages': deleted_messages
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
