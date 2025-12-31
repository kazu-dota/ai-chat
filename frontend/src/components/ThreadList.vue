<template>
  <div class="thread-list">
    <div class="thread-list-header">
      <h2 class="thread-list-title">会話履歴</h2>
      <button @click="createNewThread" class="new-thread-button" :disabled="loading">
        <span class="icon">➕</span>
        新規会話
      </button>
    </div>

    <div v-if="loading && threads.length === 0" class="loading-state">
      読み込み中...
    </div>

    <div v-else-if="threads.length === 0" class="empty-state">
      <p>会話がありません</p>
      <p class="empty-hint">新規会話を作成して始めましょう</p>
    </div>

    <div v-else class="thread-list-items">
      <div
        v-for="thread in sortedThreads"
        :key="thread.id"
        class="thread-item"
        :class="{ active: thread.id === currentThreadId }"
        @click="selectThread(thread.id)"
      >
        <div class="thread-item-content">
          <div class="thread-title">{{ thread.title }}</div>
          <div class="thread-time">{{ formatDate(thread.updated_at) }}</div>
        </div>
        <button
          @click.stop="confirmDelete(thread.id)"
          class="delete-button"
          title="削除"
        >
          🗑️
        </button>
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- 削除確認モーダル -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content" @click.stop>
        <h3>会話の削除</h3>
        <p>この会話を削除してもよろしいですか？</p>
        <p class="warning">この操作は取り消せません。</p>
        <div class="modal-actions">
          <button @click="cancelDelete" class="button-secondary">
            キャンセル
          </button>
          <button @click="executeDelete" class="button-danger">
            削除する
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  threads: {
    type: Array,
    required: true
  },
  currentThreadId: {
    type: String,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['create', 'select', 'delete'])

const showDeleteModal = ref(false)
const threadToDelete = ref(null)

const sortedThreads = computed(() => {
  return [...props.threads].sort((a, b) => {
    return new Date(b.updated_at) - new Date(a.updated_at)
  })
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'たった今'
  if (diffMins < 60) return `${diffMins}分前`
  if (diffHours < 24) return `${diffHours}時間前`
  if (diffDays < 7) return `${diffDays}日前`

  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const createNewThread = () => {
  emit('create')
}

const selectThread = (threadId) => {
  emit('select', threadId)
}

const confirmDelete = (threadId) => {
  threadToDelete.value = threadId
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  threadToDelete.value = null
}

const executeDelete = () => {
  if (threadToDelete.value) {
    emit('delete', threadToDelete.value)
  }
  cancelDelete()
}
</script>

<style scoped>
.thread-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f6f8fa;
  border-right: 1px solid #e1e4e8;
}

.thread-list-header {
  padding: 1rem;
  border-bottom: 1px solid #e1e4e8;
  background: #ffffff;
}

.thread-list-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
}

.new-thread-button {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.new-thread-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.new-thread-button:disabled {
  background: #d0d7de;
  cursor: not-allowed;
}

.icon {
  font-size: 1rem;
}

.thread-list-items {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.thread-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: #ffffff;
  border: 1px solid #e1e4e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.thread-item:hover {
  border-color: #d0d7de;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.thread-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
}

.thread-item-content {
  flex: 1;
  min-width: 0;
}

.thread-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.thread-time {
  font-size: 0.75rem;
  opacity: 0.8;
}

.thread-item.active .thread-time {
  opacity: 0.9;
}

.delete-button {
  padding: 0.25rem 0.5rem;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  font-size: 1rem;
}

.thread-item:hover .delete-button {
  opacity: 0.6;
}

.delete-button:hover {
  opacity: 1 !important;
  background: rgba(207, 19, 34, 0.1);
}

.thread-item.active .delete-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.loading-state,
.empty-state {
  padding: 2rem;
  text-align: center;
  color: #6a737d;
}

.empty-hint {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.error-message {
  margin: 1rem;
  padding: 0.75rem;
  background: #fff1f0;
  border: 1px solid #ffccc7;
  border-radius: 6px;
  color: #cf1322;
  font-size: 0.875rem;
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
  max-width: 400px;
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

.modal-content p {
  margin: 0.5rem 0;
  color: #6a737d;
}

.warning {
  color: #cf1322;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
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

.button-danger {
  background: #cf1322;
  color: white;
}

.button-danger:hover {
  background: #a8071a;
}

@media (max-width: 768px) {
  .thread-list-header {
    padding: 0.75rem;
  }

  .thread-list-title {
    font-size: 1.125rem;
  }

  .thread-item {
    padding: 0.625rem;
  }
}
</style>
