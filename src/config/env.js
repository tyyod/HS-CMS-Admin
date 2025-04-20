// 从环境变量获取API配置
const baseUrl = process.env.VUE_APP_BASE_API;
const isMock = process.env.VUE_APP_IS_MOCK === 'true';

export {
  baseUrl,
  isMock
}; 