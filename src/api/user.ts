// 用户相关API
import client from './client';

// ... 这里后续可扩展更多用户相关接口 

/**
 * 用户登录
 * @param data 登录参数 { username, password }
 * @returns Promise
 */
export function loginUser(data: { username: string; password: string }) {
  return client.post('/api/user/login', data);
}

/**
 * 用户登出
 * @returns Promise
 */
export function logout() {
  return client.post('/api/user/logout');
}

/**
 * 获取用户信息
 * @returns Promise
 */
export function userProfile() {
  return client.get('/api/user/profile');
} 