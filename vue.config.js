module.exports = {
  lintOnSave: false,
  // 解决Element Plus的警告
  transpileDependencies: ['element-plus'],
  
  // 配置路径别名
  configureWebpack: {
    resolve: {
      alias: {
        '@': require('path').resolve(__dirname, 'src')
      }
    }
  },
  
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          javascriptEnabled: true
        }
      }
    }
  }
} 