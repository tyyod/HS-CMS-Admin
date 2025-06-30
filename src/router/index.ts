import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import Admin from '../views/admin.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/Login.vue')
  },
  {
    path: '/',
    redirect: '/admin/dashboard'
  },
  {
    path: '/admin',
    component: Admin,
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: { template: '<div class="welcome">欢迎来到后台管理系统<br>这里是Dashboard首页。</div>' }
      },
      {
        path: 'article',
        name: 'Article',
        component: { template: '<div class="welcome">文章管理<br>这里可以管理所有文章。</div>' }
      },
      {
        path: 'ebook',
        name: 'Ebook',
        component: { template: '<div class="welcome">电子书管理<br>这里可以管理电子书。</div>' }
      },
      {
        path: 'user',
        name: 'User',
        component: { template: '<div class="welcome">用户管理<br>这里可以管理用户信息。</div>' }
      },
      {
        path: 'setting',
        name: 'Setting',
        component: { template: '<div class="welcome">系统设置<br>这里可以进行系统相关设置。</div>' }
      }
    ]
  },
  // 其他路由可在此处继续添加
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router; 