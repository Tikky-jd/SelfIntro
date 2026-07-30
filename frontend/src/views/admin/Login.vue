<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(username.value, password.value)
    router.push(route.query.redirect || '/admin')
  } catch (e) {
    error.value = '登录失败：' + (e.response?.data?.message || e.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container" style="max-width:420px;padding:80px 20px">
    <div class="card" style="padding:30px">
      <h1 style="font-size:1.4rem">管理员登录</h1>
      <p class="muted" style="margin-bottom:20px">登录后可管理作品、笔记与资料</p>
      <div v-if="error" class="banner">{{ error }}</div>
      <div class="field">
        <label>用户名</label>
        <input v-model="username" autocomplete="username" placeholder="admin" />
      </div>
      <div class="field">
        <label>密码</label>
        <input v-model="password" type="password" autocomplete="current-password"
               @keyup.enter="submit" placeholder="••••••" />
      </div>
      <button class="btn btn-primary" style="width:100%" :disabled="loading" @click="submit">
        {{ loading ? '登录中…' : '登录' }}
      </button>
      <p class="muted" style="font-size:.8rem;margin-top:14px">
        默认账号 admin / admin123，请在部署时通过环境变量修改。
      </p>
    </div>
  </div>
</template>
