import ElementPlus from 'element-plus'
import '../style/element-variables.less'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

export default (app) => {
  app.use(ElementPlus, { locale: zhCn })
}
