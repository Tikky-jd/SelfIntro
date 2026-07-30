import http from './http'

export function listPosts(page = 0, size = 20) {
  return http.get('/posts', { params: { page, size } }).then((r) => r.data)
}

export function getPost(id) {
  return http.get(`/posts/${id}`).then((r) => r.data)
}

export function createPost(data) {
  return http.post('/posts', data).then((r) => r.data)
}

export function updatePost(id, data) {
  return http.put(`/posts/${id}`, data).then((r) => r.data)
}

export function deletePost(id) {
  return http.delete(`/posts/${id}`).then((r) => r.data)
}
