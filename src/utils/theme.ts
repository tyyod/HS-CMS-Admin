import { ref, watch } from 'vue'

// 主题类型
export type ThemeMode = 'light' | 'dark'

// 主题状态
const themeMode = ref<ThemeMode>('light')

// 从本地存储获取主题设置
const storedTheme = localStorage.getItem('theme-mode') as ThemeMode
if (storedTheme && ['light', 'dark'].includes(storedTheme)) {
  themeMode.value = storedTheme
}

// 监听主题变化并保存到本地存储
watch(themeMode, (newTheme) => {
  localStorage.setItem('theme-mode', newTheme)
  applyTheme(newTheme)
})

// 应用主题
export function applyTheme(theme: ThemeMode) {
  const html = document.documentElement
  const body = document.body
  
  if (theme === 'dark') {
    html.classList.add('dark')
    body.style.backgroundColor = '#1a1a1a'
    body.style.color = '#ffffff'
  } else {
    html.classList.remove('dark')
    body.style.backgroundColor = '#ffffff'
    body.style.color = '#333333'
  }
}

// 切换主题
export function toggleTheme() {
  themeMode.value = themeMode.value === 'light' ? 'dark' : 'light'
}

// 获取当前主题
export function getCurrentTheme(): ThemeMode {
  return themeMode.value
}

// 设置主题
export function setTheme(theme: ThemeMode) {
  themeMode.value = theme
}

// 初始化主题
export function initTheme() {
  applyTheme(themeMode.value)
}

// 导出主题状态
export { themeMode }
