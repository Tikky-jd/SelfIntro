// 纯静态站：内容直接来自构建时写入的 /data/*.json，无需任何后端。
const BASE = import.meta.env.BASE_URL || '/'

// 没有封面的动态统一回退到这张设计好的默认封面
const DEFAULT_POST_COVER = `${BASE}uploads/default-post-cover.svg`

async function loadStatic(name) {
  const res = await fetch(`${BASE}data/${name}.json`, { cache: 'no-cache' })
  if (!res.ok) throw new Error('static not found')
  return res.json()
}

function fillDefaultCover(list) {
  return list.map((p) => (p.coverUrl ? p : { ...p, coverUrl: DEFAULT_POST_COVER }))
}

export async function getProfileContent() {
  return loadStatic('profile')
}

export async function getPostsContent() {
  const list = await loadStatic('posts')
  return fillDefaultCover(list)
}

export async function getPostContent(id) {
  const all = await loadStatic('posts')
  const f = all.find((p) => String(p.id) === String(id))
  if (!f) throw new Error('not found')
  return f.coverUrl ? f : { ...f, coverUrl: DEFAULT_POST_COVER }
}

export async function getWorksContent() {
  return loadStatic('works')
}

export async function getWorkContent(id) {
  const all = await loadStatic('works')
  const f = all.find((w) => String(w.id) === String(id))
  if (!f) throw new Error('not found')
  return f
}
