import { defineStore } from 'pinia'
import { login as apiLogin } from '../api/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    username: localStorage.getItem('username') || ''
  }),
  getters: {
    isAuthenticated: (s) => !!s.token
  },
  actions: {
    async login(username, password) {
      const res = await apiLogin(username, password)
      this.token = res.token
      this.username = res.username
      localStorage.setItem('token', res.token)
      localStorage.setItem('username', res.username)
    },
    logout() {
      this.token = ''
      this.username = ''
      localStorage.removeItem('token')
      localStorage.removeItem('username')
    }
  }
})
