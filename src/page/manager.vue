<template>
  <div class="fill_contain">
    <el-container class="fill_contain">
      <el-header height="80px">
        <headerBar style="padding-bottom: -2px"></headerBar>
      </el-header>
      <el-container>
        <el-aside width="200px" style="padding-right: 1px">
          <el-menu
              :default-active="defaultActive"
              class="el-menu-vertical"
              unique-opened
              router>
            <el-menu-item
                index="manager">
              <i class="el-icon-menu"></i>
              <template #title>
                <span>仪表盘</span>
              </template>
            </el-menu-item>
            <el-menu-item
                index="dataManager">
              <i class="el-icon-s-data"></i>
              <template #title>数据管理</template>
            </el-menu-item>
            <el-menu-item
                index="questionBank">
              <i class="el-icon-s-ticket"></i>
              <template #title>题库管理</template>
            </el-menu-item>
            <el-menu-item
                index="customer">
              <i class="el-icon-s-custom"></i>
              <template #title>客户管理</template>
            </el-menu-item>
            <el-menu-item
                index="settings">
              <i class="el-icon-s-tools"></i>
              <template #title>系统设置</template>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main class="fill_contain">
          <router-view v-slot="{ Component }">
            <transition>
              <keep-alive>
                <component :is="Component" />
              </keep-alive>
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import headerBar from "@/components/headerBar";
export default {
  name: "index",
  computed: {
    defaultActive: function(){
      return this.$route.path.replace('/', '');
    }
  },
  components: {
    headerBar,
  }
}
</script>

<style scoped>
  @import "../style/common.less";

  .el-menu-vertical:not(.el-menu--collapse) {
    width: 100%;
    min-height: 100%;
  }
  .el-header {
    padding: 0;
  }
  .el-main {
    padding: 0;
  }
</style>