/**
 * 配置编译环境和线上环境之间的切换
 *
 * baseUrl: 域名地址
 * routerMode: 路由模式
 * baseImgPath: 图片存放地址
 *
 */
let baseUrl = 'https://api.tyyod.com';
let routerMode = 'hash';
let baseImgPath;

// if (process.env.NODE_ENV === 'development') {
//     baseUrl = '//api.tyyod.com';
//     baseImgPath = '/img/';
// }else{
//     baseUrl = '//api.tyyod.com';
//     baseImgPath = '//elm.cangdu.org/img/';
// }

export {
    baseUrl,
    routerMode,
    baseImgPath
}