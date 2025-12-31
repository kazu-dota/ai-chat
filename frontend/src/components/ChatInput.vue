<template>
  <div class="chat-input-container">
    <form @submit.prevent="handleSubmit" class="chat-input-form">
      <textarea
        v-model="inputText"
        @keydown.enter.exact.prevent="handleSubmit"
        @keydown.enter.shift.exact="handleNewLine"
        placeholder="メッセージを入力... (Shift+Enterで改行)"
        class="chat-input"
        :disabled="disabled || loading"
        rows="1"
        ref="textareaRef"
      />
      <button
        type="submit"
        class="send-button"
        :disabled="!canSend"
        :class="{ loading }"
      >
        <span v-if="!loading">送信</span>
        <span v-else class="loading-spinner">⏳</span>
      </button>
    </form>
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
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

const emit = defineEmits(['submit', 'clear-error'])

const inputText = ref('')
const textareaRef = ref(null)

const canSend = computed(() => {
  return inputText.value.trim().length > 0 && !props.disabled && !props.loading
})

const handleSubmit = () => {
  if (!canSend.value) return

  const message = inputText.value.trim()
  if (message) {
    emit('submit', message)
    inputText.value = ''
    resetTextareaHeight()
  }
}

const handleNewLine = () => {
  inputText.value += '\n'
}

const resetTextareaHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }
}

// テキストエリアの高さを自動調整
watch(inputText, async () => {
  await nextTick()
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = `${textareaRef.value.scrollHeight}px`
  }
})

// エラーが発生したときにクリア
watch(() => props.error, (newError) => {
  if (newError) {
    setTimeout(() => {
      emit('clear-error')
    }, 5000)
  }
})
</script>

<style scoped>
.chat-input-container {
  border-top: 1px solid #e1e4e8;
  background: #ffffff;
  padding: 1rem;
}

.chat-input-form {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
}

.chat-input {
  flex: 1;
  min-height: 44px;
  max-height: 200px;
  padding: 0.75rem 1rem;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  line-height: 1.5;
  resize: none;
  overflow-y: auto;
  transition: border-color 0.2s;
}

.chat-input:focus {
  outline: none;
  border-color: #0969da;
  box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.1);
}

.chat-input:disabled {
  background: #f6f8fa;
  color: #6a737d;
  cursor: not-allowed;
}

.send-button {
  flex-shrink: 0;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 80px;
}

.send-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.send-button:active:not(:disabled) {
  transform: translateY(0);
}

.send-button:disabled {
  background: #d0d7de;
  cursor: not-allowed;
  transform: none;
}

.send-button.loading {
  background: #6a737d;
}

.loading-spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: #fff1f0;
  border: 1px solid #ffccc7;
  border-radius: 6px;
  color: #cf1322;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .chat-input-container {
    padding: 0.75rem;
  }

  .chat-input-form {
    gap: 0.5rem;
  }

  .send-button {
    padding: 0.75rem 1rem;
    min-width: 60px;
  }
}
</style>
