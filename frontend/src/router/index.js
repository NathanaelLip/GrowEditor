import { createRouter, createWebHistory } from 'vue-router'
import Editor from '../views/Editor.vue'

// Define the application's routes
const routes = [
  {
    path: '/',
    name: 'Editor',
    component: Editor, // The component to render for the root path
  },
  // You can add more routes here later, e.g.:
  // {
  //   path: '/about',
  //   name: 'About',
  //   component: () => import('../views/About.vue'),
  // },
]

// Create the router instance
const router = createRouter({
  // Use HTML5 history mode for clean URLs (no #)
  history: createWebHistory(),
  routes,
})

export default router
