import { createRouter, createWebHashHistory } from 'vue-router'

import Home from '../views/Home.vue'
import Resume from '../views/Resume.vue'
import Dynamics from '../views/Dynamics.vue'
import PostDetail from '../views/PostDetail.vue'
import Works from '../views/Works.vue'
import WorkDetail from '../views/WorkDetail.vue'
import AIChat from '../views/AIChat.vue'
import NotFound from '../views/NotFound.vue'

// 展示站路由：仅包含对外公开页面，不含任何后台入口。
const routes = [
  { path: '/', name: 'home', component: Home, meta: { title: '首页' } },
  { path: '/resume', name: 'resume', component: Resume, meta: { title: '简历' } },
  { path: '/dynamics', name: 'dynamics', component: Dynamics, meta: { title: '动态' } },
  { path: '/dynamics/:id', name: 'post', component: PostDetail, meta: { title: '笔记' } },
  { path: '/works', name: 'works', component: Works, meta: { title: '作品' } },
  { path: '/works/:id', name: 'work', component: WorkDetail, meta: { title: '作品详情' } },
  { path: '/ai', name: 'ai', component: AIChat, meta: { title: 'AI 应用' } },
  { path: '/:pathMatch(.*)*', name: 'notfound', component: NotFound }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
