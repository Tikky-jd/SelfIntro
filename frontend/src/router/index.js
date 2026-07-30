import { createRouter, createWebHashHistory } from 'vue-router'

import Home from '../views/Home.vue'
import Resume from '../views/Resume.vue'
import Dynamics from '../views/Dynamics.vue'
import PostDetail from '../views/PostDetail.vue'
import Works from '../views/Works.vue'
import WorkDetail from '../views/WorkDetail.vue'
import Login from '../views/admin/Login.vue'
import Admin from '../views/admin/Admin.vue'
import NotFound from '../views/NotFound.vue'

const routes = [
  { path: '/', name: 'home', component: Home, meta: { title: '首页' } },
  { path: '/resume', name: 'resume', component: Resume, meta: { title: '简历' } },
  { path: '/dynamics', name: 'dynamics', component: Dynamics, meta: { title: '动态' } },
  { path: '/dynamics/:id', name: 'post', component: PostDetail, meta: { title: '笔记' } },
  { path: '/works', name: 'works', component: Works, meta: { title: '作品' } },
  { path: '/works/:id', name: 'work', component: WorkDetail, meta: { title: '作品详情' } },
  { path: '/admin/login', name: 'login', component: Login, meta: { public: true } },
  { path: '/admin', name: 'admin', component: Admin, meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', name: 'notfound', component: NotFound }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'login' && token) {
    return { name: 'admin' }
  }
  return true
})

export default router
