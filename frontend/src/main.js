import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Create the Vue application instance,
// use the router, and mount it to the #app element in index.html
createApp(App).use(router).mount('#app')
