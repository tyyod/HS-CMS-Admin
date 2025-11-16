# Vue3 项目推荐目录结构

```text
src/
  assets/         # 静态资源（图片、字体、全局样式等）
  components/     # 全局可复用组件
  views/          # 页面级组件（即路由页面）
  router/         # 路由相关文件（如index.ts）
  store/          # 状态管理（如Pinia或Vuex相关文件）
  api/            # 所有与后端交互的接口请求
  utils/          # 工具函数
  directives/     # 自定义指令
  composables/    # 组合式API封装（如useXXX.ts）
  layouts/        # 布局组件（如有多种页面布局时）
  plugins/        # 插件（如全局注册的第三方库）
  types/          # TypeScript类型定义
  App.vue         # 根组件
  main.ts         # 入口文件
```

## 目录说明

- **assets/**  
  存放图片、字体、全局样式等静态资源。

- **components/**  
  存放全局可复用的小组件，不直接对应路由页面。

- **views/**  
  页面级组件（即路由对应的页面），每个页面建议单独一个文件夹，包含主组件和相关子组件。

- **router/**  
  路由相关的文件（如`index.ts`或`routes.ts`），便于管理和扩展路由配置。

- **store/**  
  状态管理相关文件，推荐使用Pinia或Vuex。

- **api/**  
  所有与后端交互的接口请求封装。

- **utils/**  
  工具函数和辅助方法。

- **directives/**  
  自定义指令存放目录。

- **composables/**  
  组合式API的封装（如`useUser.ts`、`useTable.ts`等）。

- **layouts/**  
  多种页面布局（如后台主框架、登录页等）可放在这里。

- **plugins/**  
  用于存放Vue插件相关的代码。

- **types/**  
  TypeScript类型定义文件。

- **App.vue**  
  根组件。

- **main.ts**  
  入口文件。

## 示例结构

```text
src/
  router/
    index.ts
  views/
    Home/
      index.vue
    Login/
      index.vue
  components/
    MyButton.vue
    UserCard.vue
  assets/
    logo.png
    styles/
      global.scss
  store/
    user.ts
    index.ts
  api/
    user.ts
    product.ts
  utils/
    formatDate.ts
  composables/
    useAuth.ts
  layouts/
    DefaultLayout.vue
    AuthLayout.vue
  plugins/
    axios.ts
  types/
    user.d.ts
  App.vue
  main.ts
```

这样结构清晰，便于维护和扩展。可根据实际需求进一步定制。 