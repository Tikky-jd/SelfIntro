<script setup>
import { ref } from 'vue'
import { uploadFile } from '../api/upload'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '文件' }
})
const emit = defineEmits(['update:modelValue', 'uploaded'])

const uploading = ref(false)
const error = ref('')

async function onFile(e) {
  const file = e.target.files[0]
  if (!file) return
  error.value = ''
  uploading.value = true
  try {
    const url = await uploadFile(file)
    emit('update:modelValue', url)
    emit('uploaded', url)
  } catch (err) {
    error.value = '上传失败：' + (err.response?.data?.message || err.message)
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <div class="field">
    <label>{{ label }}</label>
    <input type="file" accept="image/*,video/*" @change="onFile" :disabled="uploading" />
    <p v-if="uploading" class="muted" style="font-size:.82rem;margin:6px 0 0">上传中…</p>
    <p v-if="error" style="color:#dc2626;font-size:.82rem;margin:6px 0 0">{{ error }}</p>
    <div v-if="modelValue" style="margin-top:8px">
      <img v-if="!modelValue.match(/\.(mp4|webm|ogg)$/i)" :src="modelValue" alt="预览"
           style="max-height:140px;border-radius:8px;border:1px solid var(--border)" />
      <video v-else :src="modelValue" controls style="max-height:160px;border-radius:8px"></video>
      <div class="muted" style="font-size:.78rem;word-break:break-all;margin-top:4px">{{ modelValue }}</div>
    </div>
  </div>
</template>
