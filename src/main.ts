import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import { initTheme } from './utils/theme'

// 初始化主题
initTheme()

createApp(App).use(router).use(ElementPlus).mount('#app')
