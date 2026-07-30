import http from './http'

/** Upload a file and resolve with the stored URL. */
export function uploadFile(file) {
  const form = new FormData()
  form.append('file', file)
  return http
    .post('/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data.url)
}
