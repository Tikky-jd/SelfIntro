<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const open = ref(false)
function toggle() {
  open.value = !open.value
}
function close() {
  open.value = false
}
</script>

<template>
  <header class="navbar">
    <div class="container inner">
      <router-link to="/" class="brand" @click="close">Self<span>Intro</span></router-link>
      <button class="btn btn-ghost btn-sm nav-toggle" @click="toggle">菜单</button>
      <nav class="nav-links" :class="{ open }">
        <router-link to="/" @click="close">首页</router-link>
        <router-link to="/resume" @click="close">简历</router-link>
        <router-link to="/dynamics" @click="close">动态</router-link>
        <router-link to="/works" @click="close">作品</router-link>
        <router-link v-if="auth.isAuthenticated" to="/admin" @click="close">后台</router-link>
        <router-link v-else to="/admin/login" @click="close">登录</router-link>
      </nav>
    </div>
  </header>
</template>
