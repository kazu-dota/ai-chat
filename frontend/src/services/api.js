/**
 * API通信サービス
 * バックエンドAPIとの通信を管理
 */
import axios from 'axios'

// APIのベースURL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'

// Axiosインスタンスの作成
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30秒
})

// レスポンスインターセプター（エラーハンドリング）
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

/**
 * スレッド関連API
 */
export const threadsApi = {
  /**
   * スレッド一覧を取得
   */
  getThreads() {
    return apiClient.get('/threads')
  },

  /**
   * 新規スレッドを作成
   * @param {string} title - スレッドのタイトル
   */
  createThread(title = '新しい会話') {
    return apiClient.post('/threads', { title })
  },

  /**
   * スレッドを取得
   * @param {string} threadId - スレッドID
   */
  getThread(threadId) {
    return apiClient.get(`/threads/${threadId}`)
  },

  /**
   * スレッドを更新
   * @param {string} threadId - スレッドID
   * @param {string} title - 新しいタイトル
   */
  updateThread(threadId, title) {
    return apiClient.put(`/threads/${threadId}`, { title })
  },

  /**
   * スレッドを削除
   * @param {string} threadId - スレッドID
   */
  deleteThread(threadId) {
    return apiClient.delete(`/threads/${threadId}`)
  }
}

/**
 * メッセージ関連API
 */
export const messagesApi = {
  /**
   * スレッドのメッセージ一覧を取得
   * @param {string} threadId - スレッドID
   */
  getMessages(threadId) {
    return apiClient.get(`/threads/${threadId}/messages`)
  },

  /**
   * メッセージを送信
   * @param {string} threadId - スレッドID
   * @param {string} content - メッセージ内容
   */
  sendMessage(threadId, content) {
    return apiClient.post(`/threads/${threadId}/messages`, { content })
  },

  /**
   * メッセージを削除
   * @param {string} messageId - メッセージID
   */
  deleteMessage(messageId) {
    return apiClient.delete(`/messages/${messageId}`)
  }
}

/**
 * ヘルスチェックAPI
 */
export const healthApi = {
  /**
   * サーバーの稼働状況を確認
   */
  check() {
    return apiClient.get('/health')
  }
}

export default apiClient
