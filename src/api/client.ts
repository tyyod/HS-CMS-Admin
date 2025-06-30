import axios from 'axios';
import router from '../router';

// API 基础配置
export const API_HOST = import.meta.env.CMS_API_HOST;

// 创建client对象，baseURL可以根据环境的切换
const client = axios.create({
    baseURL: API_HOST,
    withCredentials: true, // 跨域请求时发送Cookie
})

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

client.interceptors.response.use(
    response => {
        if (response.status === 200) {
            if (response?.data?.code === 0) {
                return response.data;
            } else {
                return Promise.reject(response);
            }
        } else if (response.status === 401) {
            if (response?.data?.code === 99999) {
                router.push('/login');
            } 
            return Promise.reject(response);
        } else {
            return Promise.reject(response)
        }
    },
    error => {
        // 我们可以在这里对异常状态作统一处理
        if (error.response && error.response.status) {
            // 处理请求失败的情况
            // 对不同返回码对相应处理
            return Promise.reject(error.response)
        }
        return Promise.reject(error);
    }
);

export default client;