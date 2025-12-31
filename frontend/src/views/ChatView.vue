<template>
  <div class="chat-view">
    <!-- サイドバー: スレッド一覧 -->
    <aside class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
      <ThreadList
        :threads="threadStore.threads"
        :current-thread-id="threadStore.currentThreadId"
        :loading="threadStore.loading"
        :error="threadStore.error"
        @create="handleCreateThread"
        @select="handleSelectThread"
        @delete="handleDeleteThread"
      />
    </aside>

    <!-- メインエリア: チャット -->
    <main class="main-content">
      <!-- ヘッダー -->
      <header class="chat-header">
        <button @click="toggleSidebar" class="sidebar-toggle">
          ☰
        </button>
        <h1 class="chat-title">
          {{ threadStore.currentThread?.title || 'AIチャット' }}
        </h1>
        <button
          v-if="threadStore.currentThread"
          @click="showEditModal = true"
          class="edit-title-button"
          title="タイトルを編集"
        >
          ✏️
        </button>
      </header>

      <!-- メッセージエリア -->
      <div class="messages-container" ref="messagesContainer">
        <div v-if="!threadStore.currentThreadId" class="welcome-screen">
          <div class="welcome-icon">💬</div>
          <h2>AIチャットへようこそ</h2>
          <p>新しい会話を始めるか、左側から過去の会話を選択してください。</p>
        </div>

        <div v-else-if="messageStore.loading && !messageStore.hasMessages" class="loading-messages">
          メッセージを読み込んでいます...
        </div>

        <div v-else-if="!messageStore.hasMessages" class="empty-messages">
          <p>まだメッセージがありません</p>
          <p class="hint">下のフォームからメッセージを送信してみましょう</p>
        </div>

        <div v-else class="messages-list">
          <ChatMessage
            v-for="message in messageStore.sortedMessages"
            :key="message.id"
            :message="message"
          />
        </div>
      </div>

      <!-- 入力エリア -->
      <div class="input-area">
        <ChatInput
          :disabled="!threadStore.currentThreadId"
          :loading="messageStore.sending"
          :error="messageStore.error"
          @submit="handleSendMessage"
          @clear-error="messageStore.clearError"
        />
      </div>
    </main>

    <!-- タイトル編集モーダル -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <h3>タイトルを編集</h3>
        <input
          v-model="editingTitle"
          type="text"
          class="title-input"
          placeholder="会話のタイトル"
          @keydown.enter="saveTitle"
        />
        <div class="modal-actions">
          <button @click="closeEditModal" class="button-secondary">
            キャンセル
          </button>
          <button @click="saveTitle" class="button-primary">
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useThreadStore } from '../stores/threadStore'
import { useMessageStore } from '../stores/messageStore'
import ThreadList from '../components/ThreadList.vue'
import ChatMessage from '../components/ChatMessage.vue'
import ChatInput from '../components/ChatInput.vue'

const route = useRoute()
const router = useRouter()
const threadStore = useThreadStore()
const messageStore = useMessageStore()

const sidebarOpen = ref(false)
const showEditModal = ref(false)
const editingTitle = ref('')
const messagesContainer = ref(null)

// 初期化
onMounted(async () => {
  try {
    // スレッド一覧を取得
    await threadStore.fetchThreads()

    // URLにスレッドIDがある場合は選択
    if (route.params.threadId) {
      threadStore.setCurrentThread(route.params.threadId)
      await messageStore.fetchMessages(route.params.threadId)
    }
  } catch (error) {
    console.error('Initialization error:', error)
  }
})

// スレッド変更時にメッセージを取得
watch(
  () => threadStore.currentThreadId,
  async (newThreadId) => {
    if (newThreadId) {
      try {
        await messageStore.fetchMessages(newThreadId)
        scrollToBottom()
      } catch (error) {
        console.error('Failed to fetch messages:', error)
      }
    } else {
      messageStore.clearMessages()
    }
  }
)

// メッセージ追加時に自動スクロール
watch(
  () => messageStore.messages.length,
  () => {
    nextTick(() => {
      scrollToBottom()
    })
  }
)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleCreateThread = async () => {
  try {
    const newThread = await threadStore.createThread()
    router.push(`/thread/${newThread.id}`)
    sidebarOpen.value = false
  } catch (error) {
    console.error('Failed to create thread:', error)
  }
}

const handleSelectThread = async (threadId) => {
  threadStore.setCurrentThread(threadId)
  router.push(`/thread/${threadId}`)
  sidebarOpen.value = false
}

const handleDeleteThread = async (threadId) => {
  try {
    await threadStore.deleteThread(threadId)
    if (threadStore.currentThreadId === threadId) {
      router.push('/')
    }
  } catch (error) {
    console.error('Failed to delete thread:', error)
  }
}

const handleSendMessage = async (content) => {
  if (!threadStore.currentThreadId) {
    // スレッドがない場合は新規作成
    await handleCreateThread()
  }

  try {
    await messageStore.sendMessage(threadStore.currentThreadId, content)
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  editingTitle.value = ''
}

const saveTitle = async () => {
  if (!editingTitle.value.trim()) return

  try {
    await threadStore.updateThread(
      threadStore.currentThreadId,
      editingTitle.value
    )
    closeEditModal()
  } catch (error) {
    console.error('Failed to update title:', error)
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// タイトル編集モーダルを開く際に現在のタイトルをセット
watch(showEditModal, (isOpen) => {
  if (isOpen && threadStore.currentThread) {
    editingTitle.value = threadStore.currentThread.title
  }
})
</script>

<style scoped>
.chat-view {
  display: flex;
  height: 100vh;
  background: #f6f8fa;
}

/* サイドバー */
.sidebar {
  width: 300px;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: #ffffff;
}

/* ヘッダー */
.chat-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #e1e4e8;
  background: #ffffff;
}

.sidebar-toggle {
  display: none;
  padding: 0.5rem;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s;
}

.sidebar-toggle:hover {
  background: #f6f8fa;
}

.chat-title {
  flex: 1;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.edit-title-button {
  padding: 0.5rem;
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s;
}

.edit-title-button:hover {
  background: #f6f8fa;
}

/* メッセージエリア */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.welcome-screen,
.loading-messages,
.empty-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #6a737d;
}

.welcome-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.welcome-screen h2 {
  margin: 0 0 1rem 0;
  color: #1a1a1a;
}

.hint {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.messages-list {
  max-width: 900px;
  margin: 0 auto;
}

/* 入力エリア */
.input-area {
  border-top: 1px solid #e1e4e8;
}

/* モーダル */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-content h3 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
}

.title-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  margin-bottom: 1rem;
}

.title-input:focus {
  outline: none;
  border-color: #0969da;
  box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.1);
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
}

.modal-actions button {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.button-secondary {
  background: #f6f8fa;
  color: #1a1a1a;
  border: 1px solid #d0d7de;
}

.button-secondary:hover {
  background: #e1e4e8;
}

.button-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.button-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* レスポンシブデザイン */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
    transform: translateX(-100%);
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  }

  .sidebar-open {
    transform: translateX(0);
  }

  .sidebar-toggle {
    display: block;
  }

  .messages-container {
    padding: 1rem;
  }

  .messages-list {
    max-width: 100%;
  }
}
</style>
