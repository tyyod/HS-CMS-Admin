<template>
  <div class="login_page fill_contain">
    <transition name="form-fade" mode="in-out">
      <section class="form_container">
        <div class="manage_tip">
          <p>ShuaiYang CMS</p>
        </div>
        <el-form :model="loginForm" :rules="rules" ref="loginForm">
          <el-form-item prop="username">
            <el-input style="margin-top: 10px" v-model="loginForm.username" :disabled="isLoginLoading" placeholder="用户名"></el-input>
          </el-form-item>
          <el-form-item v-if="loginType === 0" prop="password">
            <el-input type="password" placeholder="密码" :disabled="isLoginLoading" v-model="loginForm.password"></el-input>
          </el-form-item>
          <el-form-item v-if="loginType === 1" prop="authCode">
            <el-input placeholder="验证码" v-model="loginForm.authCode"  :disabled="isLoginLoading" oninput="value=value.replace(/[^\w]/g,'')" maxLength='6'>
              <template #append>
                <el-button v-if="remainAuthCodeTime === 0" class="auth_code_sender" type="text" :disabled="sendingAuthCode" :loading="sendingAuthCode" @click="onTapAuthCode('loginForm')">发送验证码</el-button>
                <span v-if="remainAuthCodeTime > 0" class="auth_code_remain_time">{{remainAuthCodeTime}}s</span>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button style="width: 100%" type="primary" @click="onTopLogin('loginForm')" class="submit_btn" :loading="isLoginLoading">登录</el-button>
          </el-form-item>
        </el-form>
        <p class="tip">*温馨提示：如果忘记账号密码，请联系管理员</p>
      </section>
    </transition>
  </div>
</template>

<script>
import {ElMessage} from "element-plus";
import {adminLogin, sendAuthCode} from "@/api";
const SEND_AUTH_CODE_INTERVAL = 180;
export default {
  name: "login",
  data() {
    return {
      loginType: 1,
      loginForm: {
        username: '',
        password: '',
        authCode: '',
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        authCode: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { min: 6, max: 6, message: '请输入6位验证码', trigger: 'blur' },
        ],
      },
      isLoginLoading: false,
      sendingAuthCode: false,
      remainAuthCodeTime: 0,
      remainAuthCodeTimer: null,
    }
  },
  methods: {
    onTapAuthCode: function (formName) {
      this.$refs[formName].validateField('username', async (valid) => {
        if (!valid) {
          this.sendingAuthCode = true;
          let app = this;
          const resp = await sendAuthCode({userName: formName.userName})
          if (resp.code === 0) {
            app.sendingAuthCode = false
            app.remainAuthCodeTime = 180
            //将最后获取验证码的时间写入localStorage
            //用于页面刷新恢复倒计时
            app.putStorageLastAuthTime()
            //开始倒计时
            app.onRemainTimesTickTack()
          } else {
            ElMessage.error(resp.msg);
          }
        } else {
          ElMessage.error('用户名不能为空哦～');
        }
      })
    },
    onTopLogin: function (formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          this.isLoginLoading = true;
          const resp = await adminLogin({})
          if (resp.code === 0) {
            this.putStorageUser(this.loginForm.username)
            this.isLoginLoading = false
            await this.$router.push("/manager")
          } else {
            ElMessage.error(resp.msg);
          }
        } else {
          let alertText = ''
          if (this.loginType === 0) {
            alertText = '用户名和密码不能为空哦～'
          } else if (this.loginType === 1) {
            alertText = '用户名和验证码不能为空哦～'
          }
          ElMessage.error(alertText);
        }
      })
    },
    onRemainTimesTickTack: function() {
      if (!this.remainAuthCodeTimer) {
        this.remainAuthCodeTimer = setInterval(() => {
          if (this.remainAuthCodeTime > 0) {
            this.remainAuthCodeTime--;
          } else {
            clearInterval(this.remainAuthCodeTimer);  // 清除定时器
            this.remainAuthCodeTimer = null;
          }
        }, 1000)
      }
    },
    getStorageUser: function () {
      return localStorage ? localStorage.getItem('login-user-name') : null;
    },
    putStorageUser: function (userName) {
      if (localStorage) {
        localStorage.setItem('login-user-name', userName);
      }
    },
    getStorageLastAuthTime: function () {
      return localStorage ? localStorage.getItem('login-last-auth-time') : null;
    },
    putStorageLastAuthTime: function () {
      if (localStorage) {
        let timeStamp = (new Date()).getTime();
        return localStorage.setItem('login-last-auth-time', timeStamp.toString())
      }
    }
  },
  created(){
    let userName = this.getStorageUser()
    if (userName) {
      this.loginForm.username = userName
    }
    let lastAuthTime = this.getStorageLastAuthTime()
    if (lastAuthTime) {
      let timestamp = parseInt(lastAuthTime)
      let now = (new Date()).getTime();
      let remainTimes = SEND_AUTH_CODE_INTERVAL  - Math.round((now - timestamp) / 1000);
      //检查验证码倒计时是否已-结束
      if (remainTimes > 0) {
        this.sendingAuthCode = true
        this.remainAuthCodeTime = remainTimes
        this.onRemainTimesTickTack()
      }
    }
  }
}
</script>

<style lang="less" scoped>
 @import "../style/mixin.less";
 .login_page{

 }

 @loginFormWidth: 350px;
 @loginFormHeight: 230px;
 @loginFormPadding: 25px;

.form_container{
  .size(@loginFormWidth, @loginFormHeight);
  .center(@loginFormWidth, @loginFormHeight, @loginFormPadding);
  padding: @loginFormPadding;
  border-radius: 5px;
  text-align: center;
  border: 1px solid #DCDFE6;
}

 .manage_tip{
   position: absolute;
   width: 100%;
   top: -110px;
   left: 0;
   p{
     font-size: 34px;
     color: #409EFF;
     font-weight: bold;
   }
 }

 .auth_code_sender {
   padding: 0 15px;
   font-weight: normal;
   color: #409EFF !important;
   font-size: 13px;
 }

 .auth_code_remain_time {
   padding: 0 15px;
   font-weight: normal;
   font-size: 13px;
 }

 .tip{
   font-size: 12px;
   color: #909399;
 }

.form-fade-enter-active, .form-fade-leave-active {
  transition: all 1s;
}
.form-fade-enter, .form-fade-leave-active {
  transform: translate3d(0, -50px, 0);
  opacity: 0;
}
</style>