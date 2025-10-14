import { createRouter, createWebHistory } from 'vue-router'
import Editor from '../views/Editor.vue'

// Define the application's routes
const routes = [
  {
    path: '/',
    name: 'Editor',
    component: Editor,
  },
]

// Create the router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
