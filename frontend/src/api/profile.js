import http from './http'

export function getProfile() {
  return http.get('/profile').then((r) => r.data)
}

export function updateProfile(data) {
  return http.put('/profile', data).then((r) => r.data)
}
