<template>
  <div>
    <!-- 顶部导航栏 -->
    <div class="navbar">
      <div class="navbar-left">
        <span class="logo-icon">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="16" fill="#409EFF"/>
            <text x="10" y="26" font-size="18" font-family="Arial, sans-serif" fill="#fff" font-weight="bold">H</text>
          </svg>
        </span>
        <span class="navbar-title">HSCMS</span>
      </div>
      <div class="navbar-user" v-if="userInfo.nickName">
        <el-avatar class="user-avatar" size="36">
          <Icon size="36" color="#409EFF"><UserAvatarFilledAlt /></Icon>
        </el-avatar>
        <span class="user-info">{{ userInfo.nickName }}</span>
      </div>
    </div>
    <!-- 主体布局 -->
    <div class="admin-layout">
      <div class="sidebar">
        <div class="menu">
          <router-link class="menu-item" :class="{active: isActive('dashboard')}" to="/admin/dashboard">
            <span class="icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#409EFF" stroke-width="1.6"><rect x="3" y="9" width="4" height="8" rx="1.2"/><rect x="8.5" y="5" width="3" height="12" rx="1.2"/><rect x="13.5" y="12" width="3" height="5" rx="1.2"/></svg>
            </span>Dashboard
          </router-link>
          <router-link class="menu-item" :class="{active: isActive('article')}" to="/admin/article">
            <span class="icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#409EFF" stroke-width="1.6"><rect x="3" y="4" width="14" height="12" rx="2"/><line x1="6" y1="8" x2="14" y2="8"/><line x1="6" y1="12" x2="12" y2="12"/></svg>
            </span>文章
          </router-link>
          <router-link class="menu-item" :class="{active: isActive('ebook')}" to="/admin/ebook">
            <span class="icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#409EFF" stroke-width="1.6"><rect x="3" y="3" width="14" height="14" rx="2"/><path d="M7 7h6M7 10h6M7 13h4"/></svg>
            </span>电子书
          </router-link>
          <router-link class="menu-item" :class="{active: isActive('user')}" to="/admin/user">
            <span class="icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#409EFF" stroke-width="1.6"><circle cx="10" cy="7" r="3"/><path d="M4 16c0-2.2 2.7-4 6-4s6 1.8 6 4"/></svg>
            </span>用户
          </router-link>
          <router-link class="menu-item" :class="{active: isActive('setting')}" to="/admin/setting">
            <span class="icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#409EFF" stroke-width="1.6"><circle cx="10" cy="10" r="3"/><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.42 1.42M13.65 13.65l1.42 1.42M4.93 15.07l1.42-1.42M13.65 6.35l1.42-1.42"/></svg>
            </span>设置
          </router-link>
        </div>
      </div>
      <div class="content" id="main-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ElAvatar } from 'element-plus';
import { Icon } from '@vicons/utils';
import { UserAvatarFilledAlt } from '@vicons/carbon';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { userProfile } from '../api/user';

const route = useRoute();
const router = useRouter();
const userInfo = ref<{ nickName?: string }>({});

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

function isActive(key: string) {
  // 判断当前路由是否激活
  return route.path.includes(key);
}
</script>

<style scoped>
/* 样式同原cms/index.vue */
body {
  margin: 0;
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
  background: linear-gradient(120deg, #e0e7ff 0%, #f5f6fa 100%);
  min-height: 100vh;
}
.navbar {
  width: 100vw;
  height: 60px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(60,60,120,0.07);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
}
.navbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  margin-right: 2px;
}
.navbar-title {
  font-size: 22px;
  font-weight: 700;
  color: #409EFF;
  letter-spacing: 2px;
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}
.navbar-user {
  display: flex;
  align-items: center;
  gap: 5px;
  max-width: 180px;
  overflow: hidden;
}
.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f5f6fa;
  object-fit: cover;
  flex-shrink: 0;
}
.user-info {
  font-size: 15px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
  display: inline-block;
}
@media (max-width: 600px) {
  .user-info { display: none; }
}
.admin-layout {
  display: flex;
  min-height: 100vh;
  margin-top: 60px;
}
.sidebar {
  width: 220px;
  background: #fff;
  box-shadow: 2px 0 12px rgba(60,60,120,0.07);
  display: flex;
  flex-direction: column;
  padding-top: 32px;
  z-index: 2;
  height: calc(100vh - 60px);
  position: fixed;
  top: 60px;
  left: 0;
  overflow-y: auto;
}
.sidebar .logo {
  display: none;
}
.menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.menu-item {
  display: flex;
  align-items: center;
  padding: 14px 28px;
  font-size: 16px;
  color: #333;
  cursor: pointer;
  border-left: 4px solid transparent;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
  border-radius: 0 20px 20px 0;
  margin-right: 10px;
  text-decoration: none;
}
.menu-item.active, .menu-item:hover {
  background: #e8f3ff;
  color: #409EFF;
  border-left: 4px solid #409EFF;
}
.menu-item .icon {
  margin-right: 14px;
  font-size: 20px;
  width: 22px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}
.content {
  flex: 1;
  padding: 48px 40px;
  background: transparent;
  min-height: 100vh;
  z-index: 1;
  margin-left: 220px;
}
.welcome {
  font-size: 28px;
  color: #409EFF;
  font-weight: 700;
  margin-bottom: 18px;
}
@media (max-width: 900px) {
  .admin-layout { flex-direction: column; }
  .sidebar {
    width: 100vw;
    height: 60px;
    flex-direction: row;
    padding-top: 0;
    box-shadow: none;
    border-bottom: 1px solid #eee;
    position: fixed;
    top: 60px;
    left: 0;
    margin-left: 0;
    overflow-x: auto;
    overflow-y: hidden;
  }
  .sidebar .logo { display: none; }
  .menu { flex-direction: row; gap: 0; width: 100vw; }
  .menu-item { flex: 1; justify-content: center; border-radius: 0; margin-right: 0; padding: 14px 0; }
  .content { margin-left: 0; padding: 80px 8vw 32px 8vw; }
}
</style> 