<template>
  <el-container class="admin-container">
    <!-- 顶部导航栏 -->
    <el-header class="navbar">
      <el-row justify="space-between" align="middle" class="navbar-row">
        <el-col :span="12">
          <div class="navbar-left">
            <el-icon class="logo-icon" size="36">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="18" r="16" fill="#409EFF"/>
                <text x="10" y="26" font-size="18" font-family="Arial, sans-serif" fill="#fff" font-weight="bold">H</text>
              </svg>
            </el-icon>
            <span class="navbar-title">三角猫CMS</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="navbar-right">
            <!-- 主题切换按钮 -->
            <el-button 
              :icon="themeMode === 'dark' ? Sunny : Moon" 
              circle 
              @click="toggleTheme"
              class="theme-toggle"
              :title="themeMode === 'dark' ? '切换到浅色模式' : '切换到暗黑模式'"
            />
            
            <!-- 用户信息 -->
            <el-dropdown v-if="userInfo.nickName" trigger="click" @command="handleUserMenu" class="user-dropdown">
              <div class="user-button">
                <el-avatar :size="32" class="user-avatar">
                  <Icon size="32" color="#409EFF"><UserAvatarFilledAlt /></Icon>
                </el-avatar>
                <span class="user-info">{{ userInfo.nickName }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">用户信息</el-dropdown-item>
                  <el-dropdown-item command="changePwd">修改密码</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-col>
      </el-row>
    </el-header>

    <!-- 主体布局 -->
    <el-container class="main-layout">
      <!-- 侧边栏 -->
      <el-aside width="220px" class="sidebar">
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          background-color="transparent"
          text-color="var(--text-primary)"
          active-text-color="#409EFF"
          router
        >
          <template v-for="menuItem in menuItems" :key="menuItem.index">
            <el-menu-item 
              v-if="!menuItem.children"
              :index="menuItem.index" 
              class="menu-item"
            >
              <el-icon class="menu-icon">
                <component :is="menuItem.icon" />
              </el-icon>
              <span>{{ menuItem.title }}</span>
            </el-menu-item>
            
            <el-sub-menu 
              v-if="menuItem.children"
              :index="menuItem.index"
            >
              <template #title>
                <el-icon class="menu-icon">
                  <component :is="menuItem.icon" />
                </el-icon>
                <span>{{ menuItem.title }}</span>
              </template>
              <el-menu-item 
                v-for="child in menuItem.children" 
                :key="child.index"
                :index="child.index"
                class="menu-item-child"
              >
                <el-icon class="menu-icon">
                  <component :is="child.icon" />
                </el-icon>
                <span>{{ child.title }}</span>
              </el-menu-item>
            </el-sub-menu>
          </template>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ElAvatar, ElButton, ElIcon } from 'element-plus';
import { Icon } from '@vicons/utils';
import { UserAvatarFilledAlt, Moon, Sunny, Dashboard, Document, Book, User, Settings, Category, Tag } from '@vicons/carbon';
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { userProfile, logout } from '../api/user';
import { themeMode, toggleTheme } from '../utils/theme';

const route = useRoute();
const router = useRouter();
const userInfo = ref<{ nickName?: string }>({});

// 菜单配置
const menuItems = [
  {
    index: '/admin/dashboard',
    title: 'Dashboard',
    icon: Dashboard
  },
  {
    index: 'article-group',
    title: '文章管理',
    icon: Document,
    children: [
      {
        index: '/admin/article',
        title: '文章列表',
        icon: Document
      },
      {
        index: '/admin/article-category',
        title: '文章分类',
        icon: Category
      },
      {
        index: '/admin/article-author',
        title: '文章作者',
        icon: User
      }
    ]
  },
  {
    index: '/admin/ebook',
    title: '电子书',
    icon: Book
  },
  {
    index: '/admin/tag',
    title: '标签管理',
    icon: Tag
  },
  {
    index: '/admin/user',
    title: '用户',
    icon: User
  },
  {
    index: '/admin/setting',
    title: '设置',
    icon: Settings
  }
];

// 计算当前激活的菜单
const activeMenu = computed(() => {
  return route.path;
});

onMounted(async () => {
  try {
    const res = await userProfile();
    userInfo.value = res.data || {};
    // 已登录，什么都不做
  } catch (e) {
    // 未登录，跳转到登录页，并带上当前路径，方便登录后跳回来
    router.replace({ path: '/login', query: { redirect: route.fullPath } });
  }
});

function handleUserMenu(command: string) {
  if (command === 'logout') {
    logout().finally(() => {
      router.replace({ path: '/login', query: { redirect: route.fullPath } });
    });
  } else if (command === 'profile') {
    // TODO: 用户信息弹窗或跳转
  } else if (command === 'changePwd') {
    // TODO: 修改密码弹窗或跳转
  }
}
</script>

<style scoped>
/* 全局样式变量 */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f6fa;
  --bg-gradient: linear-gradient(120deg, #e0e7ff 0%, #f5f6fa 100%);
  --text-primary: #333333;
  --text-secondary: #666666;
  --border-color: #e0e0e0;
  --shadow: rgba(60,60,120,0.07);
}

/* 暗黑模式样式 */
html.dark {
  --bg-primary: #2d2d2d;
  --bg-secondary: #2d2d2d;
  --bg-gradient: linear-gradient(120deg, #1a1a1a 0%, #2d2d2d 100%);
  --text-primary: #ffffff;
  --text-secondary: #393333;
  --border-color: #404040;
  --shadow: rgba(0,0,0,0.3);
}

/* 容器样式 */
.admin-container {
  width: 100%;
  height: 100vh;
  background: var(--bg-gradient);
  color: var(--text-primary);
  transition: background 0.3s ease, color 0.3s ease;
}

/* 导航栏样式 */
.navbar {
  background: var(--bg-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03), 0 2px 6px rgba(0, 0, 0, 0.03);
  transition: background 0.3s ease, box-shadow 0.3s ease;
  border-bottom: 1px solid var(--border-color);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 60px;
}

.navbar-row {
  height: 100%;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-end;
}

.navbar-title {
  font-size: 22px;
  font-weight: 700;
  color: #409EFF;
  letter-spacing: 2px;
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-toggle {
  margin-right: 8px;
}

.user-dropdown {
  margin-left: 8px;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-color-primary);
  padding: 4px 12px;
  border-radius: 6px;
  transition: background-color 0.2s;
  cursor: pointer;
  border: none;
  background: transparent;
}

.user-button:hover {
  background-color: var(--bg-secondary);
}

.user-info {
  font-size: 14px;
  color: var(--el-color-primary);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 主布局样式 */
.main-layout {
  height: calc(100vh - 60px);
  margin-top: 60px;
}

/* 侧边栏样式 */
.sidebar {
  background: var(--bg-primary);
  box-shadow: 2px 0 12px var(--shadow);
  transition: background 0.3s ease, box-shadow 0.3s ease;
  border-right: 1px solid var(--el-border-color);
  height: calc(100vh - 60px);
  overflow-y: auto;
  overflow-x: hidden;
  position: fixed;
  top: 60px;
  left: 0;
  z-index: 999;
}

/* 侧边栏滚动条样式 */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.sidebar-menu {
  border-right: none;
  padding: 20px 0;
}

.menu-item {
  margin: 4px 12px;
  border-radius: 8px;
  transition: all 0.2s;
}

.menu-item:hover {
  background-color: var(--bg-secondary);
}

.menu-icon {
  margin-right: 12px;
  width: 20px;
  height: 20px;
}

.menu-item-child {
  margin: 2px 12px 2px 12px;
  border-radius: 6px;
  transition: all 0.2s;
  font-size: 14px;
}

.menu-item-child:hover {
  background-color: var(--bg-secondary);
}

/* 主内容区样式 */
.main-content {
  background: transparent;
  padding: 0 !important;
  color: var(--text-primary);
  transition: color 0.3s ease;
  margin-left: 220px;
}

/* 暗黑模式下的导航栏样式 */
html.dark .navbar {
  background: #2d2d2d !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 2px 4px rgba(255, 255, 255, 0.03), 0 4px 16px rgba(255, 255, 255, 0.02) !important;
}

/* 暗黑模式下的滚动条样式 */
html.dark .sidebar::-webkit-scrollbar-thumb {
  background: #606060 !important;
}

html.dark .sidebar::-webkit-scrollbar-thumb:hover {
  background: #707070 !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar-title {
    display: none;
  }
  
  .user-info {
    display: none;
  }
  
  .sidebar {
    width: 60px !important;
  }
  
  .main-content {
    margin-left: 60px;
  }
  
  .sidebar-menu .el-menu-item span {
    display: none;
  }
}
</style> 