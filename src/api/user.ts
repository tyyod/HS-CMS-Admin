// 用户相关API
import client from './client';

/** 绑定二次认证步骤数据 */
export interface MfaBindData {
  mfa_required: true;
  mfa_action: 'bind';
  secret: string;
  qr_code: string;
  expire_seconds: number;
}

/** 登录验证步骤数据 */
export interface MfaVerifyData {
  mfa_required: true;
  mfa_action: 'verify';
}

/** 登录成功数据 */
export interface LoginUserData {
  mfa_required?: false;
  id: number;
  username: string;
  email: string;
  mobile: string;
}

/** login 接口 data 字段：登录成功或 MFA 中间态 */
export type LoginData = LoginUserData | MfaBindData | MfaVerifyData;

/** 后端统一响应体 */
export interface ApiResult<T> {
  code: number;
  msg: string;
  data: T;
}

/**
 * 用户登录
 * 注意：client 拦截器返回整个 body（{code,msg,data}），调用方需取 res.data
 */
export function loginUser(data: { username: string; password: string }): Promise<ApiResult<LoginData>> {
  // 拦截器在 code===0 时 resolve body，故第二个泛型 R 标为 body 类型
  return client.post<ApiResult<LoginData>, ApiResult<LoginData>>('/api/user/login', data);
}

/**
 * 校验 MFA 动态码（未绑定则完成绑定，已绑定则校验登录）
 */
export function verifyMfa(data: { username: string; mfa_code: string }): Promise<ApiResult<LoginUserData>> {
  return client.post<ApiResult<LoginUserData>, ApiResult<LoginUserData>>('/api/user/mfa/verify', data);
}

/**
 * 用户登出
 */
export function logout() {
  return client.post('/api/user/logout');
}

/**
 * 获取用户信息
 */
export function userProfile() {
  return client.get('/api/user/profile');
}
