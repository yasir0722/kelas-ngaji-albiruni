import { createRouter, createWebHistory } from 'vue-router'
import ParentView from '../components/ParentView.vue'
import AdminView from '../components/AdminView.vue'

const routes = [
  {
    path: '/',
    name: 'Parent',
    component: ParentView
  },
  {
    path: '/admin',
    name: 'Admin', 
    component: AdminView
  }
]

const router = createRouter({
  history: createWebHistory('/kelas-ngaji-albiruni/'),
  routes
})

export default router
