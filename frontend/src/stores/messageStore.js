/**
 * メッセージ管理用Piniaストア
 * メッセージの取得・送信・削除を管理
 */
import { defineStore } from 'pinia'
import { messagesApi } from '../services/api'

export const useMessageStore = defineStore('message', {
  state: () => ({
    messages: [],
    loading: false,
    sending: false,
    error: null
  }),

  getters: {
    /**
     * メッセージが存在するかどうか
     */
    hasMessages: (state) => {
      return state.messages.length > 0
    },

    /**
     * 時系列順にソートされたメッセージ一覧
     */
    sortedMessages: (state) => {
      return [...state.messages].sort((a, b) => {
        return new Date(a.created_at) - new Date(b.created_at)
      })
    },

    /**
     * 最新のメッセージを取得
     */
    latestMessage: (state) => {
      if (state.messages.length === 0) return null
      return state.messages[state.messages.length - 1]
    }
  },

  actions: {
    /**
     * 特定スレッドのメッセージ一覧を取得
     * @param {string} threadId - スレッドID
     */
    async fetchMessages(threadId) {
      if (!threadId) {
        this.messages = []
        return
      }

      this.loading = true
      this.error = null
      try {
        const response = await messagesApi.getMessages(threadId)
        this.messages = response.data.messages
      } catch (error) {
        this.error = 'メッセージの取得に失敗しました'
        console.error('Failed to fetch messages:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * メッセージを送信してAIの応答を取得
     * @param {string} threadId - スレッドID
     * @param {string} content - メッセージ内容
     */
    async sendMessage(threadId, content) {
      if (!threadId || !content.trim()) {
        throw new Error('スレッドIDとメッセージ内容は必須です')
      }

      this.sending = true
      this.error = null
      try {
        const response = await messagesApi.sendMessage(threadId, content)
        const { user_message, assistant_message } = response.data

        // ユーザーメッセージとAI応答をストアに追加
        this.messages.push(user_message)
        this.messages.push(assistant_message)

        return { user_message, assistant_message }
      } catch (error) {
        this.error = 'メッセージの送信に失敗しました'
        console.error('Failed to send message:', error)
        throw error
      } finally {
        this.sending = false
      }
    },

    /**
     * メッセージを削除
     * @param {string} messageId - メッセージID
     */
    async deleteMessage(messageId) {
      this.loading = true
      this.error = null
      try {
        await messagesApi.deleteMessage(messageId)
        this.messages = this.messages.filter(m => m.id !== messageId)
      } catch (error) {
        this.error = 'メッセージの削除に失敗しました'
        console.error('Failed to delete message:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * メッセージをクリア（スレッド切り替え時など）
     */
    clearMessages() {
      this.messages = []
      this.error = null
    },

    /**
     * エラーをクリア
     */
    clearError() {
      this.error = null
    },

    /**
     * 楽観的UIのためにローカルメッセージを追加
     * （送信前にUIに表示する用）
     * @param {object} message - メッセージオブジェクト
     */
    addOptimisticMessage(message) {
      this.messages.push({
        ...message,
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString()
      })
    },

    /**
     * 一時メッセージを削除（エラー時など）
     * @param {string} tempId - 一時ID
     */
    removeOptimisticMessage(tempId) {
      this.messages = this.messages.filter(m => m.id !== tempId)
    }
  }
})
