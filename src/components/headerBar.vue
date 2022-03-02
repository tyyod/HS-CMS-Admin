<template>
  <div class="header_container">
    <div><span style="font-size: 28px; color: #409EFF; font-weight: bold">Interview Management</span></div>
    <el-dropdown @command="handleCommand" menu-align='start'>
      <div class="block"><el-avatar :size="40" :src="circleUrl"></el-avatar></div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="home">首页</el-dropdown-item>
          <el-dropdown-item command="signout">退出</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script>
export default {
  name: "managerHeader",
  data() {
    return {
      circleUrl: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
    }
  },
  methods: {
    handleCommand(command) {
      if (command === 'home') {
        this.$router.push('/manage');
      }else if(command === 'signout'){
        this.$router.push('/');
        // const res = await signout()
        // if (res.status == 1) {
        //   this.$message({
        //     type: 'success',
        //     message: '退出成功'
        //   });
        //   this.$router.push('/');
        // }else{
        //   this.$message({
        //     type: 'error',
        //     message: res.message
        //   });
        // }
      }
    }
  }
}
</script>

<style scoped>
.header_container{
  height: 79px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  border-bottom: 1px solid #DCDFE6;
}
.el-dropdown-menu__item{
  text-align: center;
}
</style>