/**
 * スレッド管理用Piniaストア
 * スレッド一覧の取得・作成・更新・削除を管理
 */
import { defineStore } from 'pinia'
import { threadsApi } from '../services/api'

export const useThreadStore = defineStore('thread', {
  state: () => ({
    threads: [],
    currentThreadId: null,
    loading: false,
    error: null
  }),

  getters: {
    /**
     * 現在選択中のスレッドを取得
     */
    currentThread: (state) => {
      return state.threads.find(t => t.id === state.currentThreadId) || null
    },

    /**
     * スレッドが存在するかどうか
     */
    hasThreads: (state) => {
      return state.threads.length > 0
    },

    /**
     * 更新日時でソートされたスレッド一覧
     */
    sortedThreads: (state) => {
      return [...state.threads].sort((a, b) => {
        return new Date(b.updated_at) - new Date(a.updated_at)
      })
    }
  },

  actions: {
    /**
     * スレッド一覧を取得
     */
    async fetchThreads() {
      this.loading = true
      this.error = null
      try {
        const response = await threadsApi.getThreads()
        this.threads = response.data.threads
      } catch (error) {
        this.error = 'スレッド一覧の取得に失敗しました'
        console.error('Failed to fetch threads:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 新規スレッドを作成
     * @param {string} title - スレッドのタイトル
     */
    async createThread(title = '新しい会話') {
      this.loading = true
      this.error = null
      try {
        const response = await threadsApi.createThread(title)
        const newThread = response.data
        this.threads.push(newThread)
        this.currentThreadId = newThread.id
        return newThread
      } catch (error) {
        this.error = 'スレッドの作成に失敗しました'
        console.error('Failed to create thread:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * スレッドを更新
     * @param {string} threadId - スレッドID
     * @param {string} title - 新しいタイトル
     */
    async updateThread(threadId, title) {
      this.loading = true
      this.error = null
      try {
        const response = await threadsApi.updateThread(threadId, title)
        const updatedThread = response.data
        const index = this.threads.findIndex(t => t.id === threadId)
        if (index !== -1) {
          this.threads[index] = updatedThread
        }
        return updatedThread
      } catch (error) {
        this.error = 'スレッドの更新に失敗しました'
        console.error('Failed to update thread:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * スレッドを削除
     * @param {string} threadId - スレッドID
     */
    async deleteThread(threadId) {
      this.loading = true
      this.error = null
      try {
        await threadsApi.deleteThread(threadId)
        this.threads = this.threads.filter(t => t.id !== threadId)
        if (this.currentThreadId === threadId) {
          this.currentThreadId = null
        }
      } catch (error) {
        this.error = 'スレッドの削除に失敗しました'
        console.error('Failed to delete thread:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 現在のスレッドを設定
     * @param {string} threadId - スレッドID
     */
    setCurrentThread(threadId) {
      this.currentThreadId = threadId
    },

    /**
     * エラーをクリア
     */
    clearError() {
      this.error = null
    }
  }
})
