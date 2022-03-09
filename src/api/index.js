import fetch from "@/api/fetch";

export const adminLogin = data => fetch({url: '/admin/user/auth/login', data: data, method: 'POST'})
export const sendAuthCode = data => fetch({url: '/admin/user/auth/send/verify', data: data, method: 'POST'})