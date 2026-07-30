import http from './http'

export function listWorks() {
  return http.get('/works').then((r) => r.data)
}

export function getWork(id) {
  return http.get(`/works/${id}`).then((r) => r.data)
}

export function createWork(data) {
  return http.post('/works', data).then((r) => r.data)
}

export function updateWork(id, data) {
  return http.put(`/works/${id}`, data).then((r) => r.data)
}

export function deleteWork(id) {
  return http.delete(`/works/${id}`).then((r) => r.data)
}
