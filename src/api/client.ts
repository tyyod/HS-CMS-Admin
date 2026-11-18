import axios from 'axios';
import router from '../router';

// API 基础配置
export const API_HOST = import.meta.env.VITE_CMS_API_HOST;

// 创建client对象，baseURL可以根据环境的切换
const client = axios.create({
    baseURL: API_HOST,
    withCredentials: true, // 跨域请求时发送Cookie
})

// 防止重复跳转登录页的标志位
let isRedirectingToLogin = false;

// 
client.interceptors.request.use(
    config => {
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

client.defaults.timeout = 30000

// 跳转到登录页的辅助函数，防止重复跳转
function redirectToLogin() {
    // 如果已经在登录页或正在跳转中，则不重复跳转
    if (router.currentRoute.value.path === '/login' || isRedirectingToLogin) {
        return;
    }
    isRedirectingToLogin = true;
    router.push('/login').finally(() => {
        // 跳转完成后重置标志位，延迟重置以避免快速连续请求
        setTimeout(() => {
            isRedirectingToLogin = false;
        }, 1000);
    });
}

client.interceptors.response.use(
    response => {
        if (response.status === 200 || response.status === 201) {
            // 检查业务状态码
            if (response?.data?.code === 0) {
                return response.data;
            } else if (response?.data?.code === 99999) {
                // 未登录，跳转到登录页
                redirectToLogin();
                return Promise.reject(response);
            } else {
                return Promise.reject(response);
            }
        } else if (response.status === 401) {
            if (response?.data?.code === 99999) {
                redirectToLogin();
            } 
            return Promise.reject(response);
        } else {
            return Promise.reject(response)
        }
    },
    error => {
        // 我们可以在这里对异常状态作统一处理
        if (error.response && error.response.status) {
            // 检查业务状态码是否为99999（未登录）
            if (error.response?.data?.code === 99999) {
                redirectToLogin();
            }
            // 处理请求失败的情况
            // 对不同返回码对相应处理
            return Promise.reject(error.response)
        }
        return Promise.reject(error);
    }
);

export default client;