import { createRouter, createWebHashHistory } from 'vue-router'

const login = () => import('@/page/login')
const manager = () => import('@/page/manager')
const dashboard = () => import('@/page/dashboard');
const dataManager = () => import('@/page/dataManager');
const questionBank = () => import('@/page/questionBank');
const customer = () => import('@/page/customer');
const settings = () => import('@/page/settings');


// 2. 定义一些路由
// 每个路由都需要映射到一个组件。
// 我们后面再讨论嵌套路由。
const routes = [
    {
        path: '/',
        component: login
    },
    {
        path: '/login',
        component: login
    },
    {
        path: '/manager',
        component: manager,
        children: [
            {
                path: '',
                component: dashboard,
            },
            {
                path: '/dataManager',
                component: dataManager
            },
            {
                path: '/questionBank',
                component: questionBank
            },
            {
                path: '/customer',
                component: customer
            },
            {
                path: '/settings',
                component: settings
            },
        ]
    },
]

// 3. 创建路由实例并传递 `routes` 配置
// 你可以在这里输入更多的配置，但我们在这里
// 暂时保持简单
const router = createRouter({
    // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
    history: createWebHashHistory(),
    routes, // `routes: routes` 的缩写
})

export default router