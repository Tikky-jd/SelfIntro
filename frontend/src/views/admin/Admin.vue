<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { getProfile, updateProfile } from '../../api/profile'
import { listPosts, createPost, updatePost, deletePost } from '../../api/posts'
import { listWorks, createWork, updateWork, deleteWork } from '../../api/works'
import UploadInput from '../../components/UploadInput.vue'

const auth = useAuthStore()
const router = useRouter()

const tab = ref('profile')
const toast = ref('')
let toastTimer = null
function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (toast.value = ''), 2500)
}

const CATS = [
  { value: 'EDUCATION', label: '教育经历' },
  { value: 'EXPERIENCE', label: '工作经历' },
  { value: 'PROJECT', label: '项目经历' },
  { value: 'SKILL', label: '技能' },
  { value: 'CERT', label: '证书' }
]
const catLabel = (v) => CATS.find((c) => c.value === v)?.label || v

/* ---------------- Profile ---------------- */
const profileForm = reactive({
  id: 1,
  name: '', headline: '', avatarUrl: '', email: '', phone: '', location: '', about: '',
  socials: [],
  resumeItems: []
})
const profileLoaded = ref(false)

function loadProfile(p) {
  profileForm.id = p.id || 1
  profileForm.name = p.name || ''
  profileForm.headline = p.headline || ''
  profileForm.avatarUrl = p.avatarUrl || ''
  profileForm.email = p.email || ''
  profileForm.phone = p.phone || ''
  profileForm.location = p.location || ''
  profileForm.about = p.about || ''
  profileForm.socials = (p.socials || []).map((s) => ({ label: s.label || '', url: s.url || '' }))
  profileForm.resumeItems = (p.resumeItems || []).map((it) => ({
    id: it.id, category: it.category, title: it.title || '', org: it.org || '',
    description: it.description || '', startYear: it.startYear || '', endYear: it.endYear || '',
    sortOrder: it.sortOrder || 0
  }))
  profileLoaded.value = true
}

function addSocial() { profileForm.socials.push({ label: '', url: '' }) }
function removeSocial(i) { profileForm.socials.splice(i, 1) }
function addResume() {
  profileForm.resumeItems.push({
    category: 'EXPERIENCE', title: '', org: '', description: '', startYear: '', endYear: '', sortOrder: 0
  })
}
function removeResume(i) { profileForm.resumeItems.splice(i, 1) }

async function saveProfile() {
  try {
    const data = JSON.parse(JSON.stringify(profileForm))
    const saved = await updateProfile(data)
    loadProfile(saved)
    showToast('资料已保存')
  } catch (e) {
    showToast('保存失败：' + (e.response?.data?.message || e.message))
  }
}

/* ---------------- Posts ---------------- */
const posts = ref([])
const postForm = reactive({
  id: null, title: '', summary: '', content: '', coverUrl: '', images: [], tagsText: ''
})
const editingPost = ref(false)

function resetPostForm() {
  Object.assign(postForm, { id: null, title: '', summary: '', content: '', coverUrl: '', images: [], tagsText: '' })
  editingPost.value = false
}
function editPost(p) {
  Object.assign(postForm, {
    id: p.id, title: p.title, summary: p.summary || '', content: p.content || '',
    coverUrl: p.coverUrl || '', images: [...(p.images || [])], tagsText: (p.tags || []).join(', ')
  })
  editingPost.value = true
  tab.value = 'post'
}
function addPostImage(url) { postForm.images.push(url) }
function removePostImage(i) { postForm.images.splice(i, 1) }

async function savePost() {
  try {
    const payload = {
      title: postForm.title,
      summary: postForm.summary,
      content: postForm.content,
      coverUrl: postForm.coverUrl,
      images: postForm.images,
      tags: postForm.tagsText.split(/[,，]/).map((t) => t.trim()).filter(Boolean)
    }
    if (postForm.id) {
      await updatePost(postForm.id, payload)
    } else {
      await createPost(payload)
    }
    resetPostForm()
    posts.value = (await listPosts(0, 100)).content || []
    showToast('笔记已保存')
  } catch (e) {
    showToast('保存失败：' + (e.response?.data?.message || e.message))
  }
}
async function removePost(id) {
  if (!confirm('确定删除这篇笔记？')) return
  try {
    await deletePost(id)
    posts.value = posts.value.filter((p) => p.id !== id)
    showToast('已删除')
  } catch (e) {
    showToast('删除失败：' + (e.response?.data?.message || e.message))
  }
}

/* ---------------- Works ---------------- */
const works = ref([])
const workForm = reactive({
  id: null, title: '', description: '', mediaType: 'IMAGE', url: '', coverUrl: ''
})
const editingWork = ref(false)

function resetWorkForm() {
  Object.assign(workForm, { id: null, title: '', description: '', mediaType: 'IMAGE', url: '', coverUrl: '' })
  editingWork.value = false
}
function editWork(w) {
  Object.assign(workForm, {
    id: w.id, title: w.title, description: w.description || '',
    mediaType: w.mediaType, url: w.url, coverUrl: w.coverUrl || ''
  })
  editingWork.value = true
  tab.value = 'work'
}
async function saveWork() {
  try {
    const payload = {
      title: workForm.title, description: workForm.description,
      mediaType: workForm.mediaType, url: workForm.url, coverUrl: workForm.coverUrl
    }
    if (workForm.id) {
      await updateWork(workForm.id, payload)
    } else {
      await createWork(payload)
    }
    resetWorkForm()
    works.value = await listWorks()
    showToast('作品已保存')
  } catch (e) {
    showToast('保存失败：' + (e.response?.data?.message || e.message))
  }
}
async function removeWork(id) {
  if (!confirm('确定删除该作品？')) return
  try {
    await deleteWork(id)
    works.value = works.value.filter((w) => w.id !== id)
    showToast('已删除')
  } catch (e) {
    showToast('删除失败：' + (e.response?.data?.message || e.message))
  }
}

/* ---------------- Init ---------------- */
onMounted(async () => {
  try {
    const [p, postsResp, w] = await Promise.all([getProfile(), listPosts(0, 100), listWorks()])
    loadProfile(p)
    posts.value = postsResp.content || []
    works.value = w || []
  } catch (e) {
    showToast('加载失败：' + (e.response?.data?.message || e.message))
  }
})

function logout() {
  auth.logout()
  router.push('/admin/login')
}
</script>

<template>
  <div class="container">
    <div class="admin-layout">
      <aside class="admin-side">
        <div style="font-weight:800;margin-bottom:12px">管理后台</div>
        <a :class="{ active: tab === 'profile' }" @click="tab = 'profile'">个人资料</a>
        <a :class="{ active: tab === 'post' }" @click="tab = 'post'">图文笔记</a>
        <a :class="{ active: tab === 'work' }" @click="tab = 'work'">作品管理</a>
        <hr style="border:none;border-top:1px solid var(--border);margin:16px 0" />
        <a @click="logout">退出登录</a>
        <router-link to="/" target="_blank">查看网站 ↗</router-link>
      </aside>

      <section>
        <!-- Profile -->
        <div v-if="tab === 'profile'">
          <h2 class="section-title">个人资料</h2>
          <p class="section-sub">编辑首页与简历页展示的信息</p>
          <div v-if="!profileLoaded" class="spinner"></div>
          <div v-else>
            <div class="row">
              <div class="field">
                <label>姓名</label>
                <input v-model="profileForm.name" />
              </div>
              <div class="field">
                <label>标题 / 一句话介绍</label>
                <input v-model="profileForm.headline" />
              </div>
            </div>
            <div class="row">
              <div class="field">
                <label>邮箱</label>
                <input v-model="profileForm.email" />
              </div>
              <div class="field">
                <label>电话</label>
                <input v-model="profileForm.phone" />
              </div>
              <div class="field">
                <label>所在地</label>
                <input v-model="profileForm.location" />
              </div>
            </div>
            <UploadInput v-model="profileForm.avatarUrl" label="头像图片" />
            <div class="field">
              <label>个人简介（支持 Markdown）</label>
              <textarea v-model="profileForm.about" style="min-height:120px"></textarea>
            </div>

            <h3 style="margin-top:24px">社交链接</h3>
            <div v-for="(s, i) in profileForm.socials" :key="i" class="repeat-row">
              <input v-model="s.label" placeholder="名称，如 GitHub" />
              <input v-model="s.url" placeholder="链接 URL" />
              <button class="btn btn-danger btn-sm" @click="removeSocial(i)">×</button>
            </div>
            <button class="btn btn-ghost btn-sm" @click="addSocial">+ 添加链接</button>

            <h3 style="margin-top:24px">简历条目</h3>
            <div v-for="(it, i) in profileForm.resumeItems" :key="i" class="card" style="padding:14px;margin-bottom:12px">
              <div class="repeat-row">
                <select v-model="it.category">
                  <option v-for="c in CATS" :key="c.value" :value="c.value">{{ c.label }}</option>
                </select>
                <input v-model="it.title" placeholder="标题" />
                <input v-model="it.org" placeholder="机构 / 公司" />
                <button class="btn btn-danger btn-sm" @click="removeResume(i)">×</button>
              </div>
              <div class="row">
                <input v-model="it.startYear" placeholder="开始年份" />
                <input v-model="it.endYear" placeholder="结束年份 / Present" />
              </div>
              <div class="field" style="margin-top:8px">
                <textarea v-model="it.description" :placeholder="it.category === 'SKILL' ? '技能，用逗号分隔' : '描述'"></textarea>
              </div>
            </div>
            <button class="btn btn-ghost btn-sm" @click="addResume">+ 添加条目</button>

            <div style="margin-top:24px">
              <button class="btn btn-primary" @click="saveProfile">保存资料</button>
            </div>
          </div>
        </div>

        <!-- Posts -->
        <div v-if="tab === 'post'">
          <h2 class="section-title">图文笔记</h2>
          <p class="section-sub">发布动态 / 笔记，支持 Markdown 与多图</p>

          <div class="card" style="padding:18px;margin-bottom:24px">
            <h3>{{ editingPost ? '编辑笔记' : '新建笔记' }}</h3>
            <div class="field">
              <label>标题</label>
              <input v-model="postForm.title" />
            </div>
            <div class="field">
              <label>摘要</label>
              <input v-model="postForm.summary" placeholder="列表页显示的简短描述" />
            </div>
            <div class="field">
              <label>正文（Markdown）</label>
              <textarea v-model="postForm.content" style="min-height:200px"></textarea>
            </div>
            <UploadInput v-model="postForm.coverUrl" label="封面图" />
            <div class="field">
              <label>图片（可上传多张，也可手动填 URL）</label>
              <div class="grid grid-3" style="gap:10px">
                <div v-for="(img, i) in postForm.images" :key="i" style="position:relative">
                  <img :src="img" style="width:100%;border-radius:8px;border:1px solid var(--border)" />
                  <button class="btn btn-danger btn-sm" style="position:absolute;top:4px;right:4px"
                          @click="removePostImage(i)">×</button>
                </div>
              </div>
              <UploadInput @uploaded="addPostImage" label="上传图片（自动追加）" />
            </div>
            <div class="field">
              <label>标签（逗号分隔）</label>
              <input v-model="postForm.tagsText" placeholder="示例, 笔记" />
            </div>
            <div style="display:flex;gap:10px">
              <button class="btn btn-primary" @click="savePost">保存笔记</button>
              <button class="btn btn-ghost" @click="resetPostForm" v-if="editingPost">取消编辑</button>
            </div>
          </div>

          <h3>已有笔记（{{ posts.length }}）</h3>
          <div v-if="!posts.length" class="muted">还没有笔记。</div>
          <div v-for="p in posts" :key="p.id" class="card" style="padding:14px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:12px">
            <div>
              <strong>{{ p.title }}</strong>
              <div class="muted" style="font-size:.82rem">{{ p.summary }}</div>
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-ghost btn-sm" @click="editPost(p)">编辑</button>
              <button class="btn btn-danger btn-sm" @click="removePost(p.id)">删除</button>
            </div>
          </div>
        </div>

        <!-- Works -->
        <div v-if="tab === 'work'">
          <h2 class="section-title">作品管理</h2>
          <p class="section-sub">上传图片 / 视频作品</p>

          <div class="card" style="padding:18px;margin-bottom:24px">
            <h3>{{ editingWork ? '编辑作品' : '新建作品' }}</h3>
            <div class="row">
              <div class="field">
                <label>标题</label>
                <input v-model="workForm.title" />
              </div>
              <div class="field">
                <label>类型</label>
                <select v-model="workForm.mediaType">
                  <option value="IMAGE">图片</option>
                  <option value="VIDEO">视频</option>
                </select>
              </div>
            </div>
            <div class="field">
              <label>描述</label>
              <textarea v-model="workForm.description"></textarea>
            </div>
            <UploadInput v-model="workForm.url" :label="workForm.mediaType === 'VIDEO' ? '视频文件' : '图片文件'" />
            <div class="field">
              <label>媒体 URL（也可手动粘贴，如外链 / 第三方地址）</label>
              <input v-model="workForm.url" placeholder="https://..." />
            </div>
            <UploadInput v-model="workForm.coverUrl" label="封面图（视频建议设置）" />
            <div style="display:flex;gap:10px">
              <button class="btn btn-primary" @click="saveWork">保存作品</button>
              <button class="btn btn-ghost" @click="resetWorkForm" v-if="editingWork">取消编辑</button>
            </div>
          </div>

          <h3>已有作品（{{ works.length }}）</h3>
          <div v-if="!works.length" class="muted">还没有作品。</div>
          <div v-for="w in works" :key="w.id" class="card" style="padding:14px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:12px">
            <div>
              <strong>{{ w.title }}</strong>
              <span class="badge" :class="{ video: w.mediaType === 'VIDEO' }">{{ w.mediaType === 'VIDEO' ? '视频' : '图片' }}</span>
            </div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-ghost btn-sm" @click="editWork(w)">编辑</button>
              <button class="btn btn-danger btn-sm" @click="removeWork(w.id)">删除</button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </div>
</template>
