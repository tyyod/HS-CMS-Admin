import fetch from "@/api/fetch";

export const adminLogin = data => fetch({url: '/admin/login', data: data, method: 'POST'})
export const sendAuthCode = data => fetch({url: '/admin/login', data: data, method: 'POST'})