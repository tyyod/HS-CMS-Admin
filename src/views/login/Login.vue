<template>
  <div class="login-wrapper">
    <canvas id="bg-canvas"></canvas>
    <div class="login-form-side">
      <div class="login-card">
        <div class="login-title">欢迎使用HSCMS</div>
        <div class="login-desc">高效内容管理，安全便捷登录</div>
        <el-form :model="form" ref="loginFormRef" class="login-form" @submit.prevent="onSubmit">
          <el-form-item style="margin-bottom:22px;position:relative;width:276px;display:block;">
            <el-input
              v-model="form.username"
              placeholder="用户名"
              autocomplete="username"
              @input="clearError"
              clearable
              style="width: 276px;"
            >
              <template #prefix>
                <span style="display:flex;align-items:center;">
                    <Icon class="w-[18px] h-[18px] text-[#b0b3b8] !important">
                        <MdPerson/>
                    </Icon>
                  <span style="display:inline-block;width:1px;height:16px;background:#e5e7eb;margin:0 8px 0 6px;"></span>
                </span>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item style="margin-bottom:22px;position:relative;width:276px;display:block;">
            <el-input
              v-model="form.password"
              :type="passwordVisible ? 'text' : 'password'"
              placeholder="密码"
              autocomplete="current-password"
              @input="clearError"
              clearable
              style="width: 276px;"
            >
              <template #prefix>
                <span style="display:flex;align-items:center;">
                    <Icon class="w-[18px] h-[18px] text-[#b0b3b8] !important">
                        <MdLock/>
                    </Icon>
                  <span style="display:inline-block;width:1px;height:16px;background:#e5e7eb;margin:0 8px 0 6px;"></span>
                </span>
              </template>
              <template #suffix>
                <span style="display:flex;align-items:center;height:100%;padding-right:2px;">
                  <button type="button" class="password-eye-btn" @click="togglePassword">
                    <component :is="passwordVisible ? MdEyeOff : MdEye" class="password-eye" />
                  </button>
                </span>
              </template>
            </el-input>
          </el-form-item>
          <div id="login-error" v-if="errorMsg" style="height:16px;color:#f56c6c;font-size:12px;margin-bottom:6px;margin-top:-14px;text-align:left;line-height:16px;padding-left:2px;">{{ errorMsg }}</div>
          <el-form-item style="margin-bottom:0;">
            <el-button
              type="primary"
              class="login-btn"
              :disabled="!canSubmit"
              native-type="submit"
              >登录</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { loginUser } from '../../api/index';
import { Icon } from '@vicons/utils'
import { MdEye, MdEyeOff, MdPerson, MdLock } from '@vicons/ionicons4';

const router = useRouter();
const route = useRoute();
const form = reactive({
  username: '',
  password: ''
});
const errorMsg = ref('');
const passwordVisible = ref(false);
const loginFormRef = ref();

const canSubmit = computed(() => {
  return form.username && form.password && form.password.length >= 8;
});

function clearError() {
  errorMsg.value = '';
}

function togglePassword() {
  passwordVisible.value = !passwordVisible.value;
}

async function onSubmit() {
  if (!form.username || !form.password) {
    errorMsg.value = '请输入用户名和密码';
    return;
  }
  if (form.password.length < 8) {
    errorMsg.value = '密码长度不能少于8位';
    return;
  }
  try {
    await loginUser({ username: form.username, password: form.password });
    errorMsg.value = '';
    // 登录成功后跳转
    const redirect = route.query.redirect as string;
    if (redirect) {
      router.replace(redirect);
    } else {
      router.replace('/');
    }
  } catch (e: any) {
    if (e?.data) {
      errorMsg.value = e.data.msg || '用户名或密码错误';
    } else {
      errorMsg.value = '网络异常，请检查服务是否可用';
    }
  }
}

/**
 * 初始化并渲染动态背景动画
 * 1. 创建彩色球体，随机运动并碰撞边界反弹
 * 2. 随窗口大小自适应
 * 3. 持续重绘实现动画效果
 */
function setupBackgroundAnimation() {
  // 动画球体颜色
  const colors = ['#a5b4fc', '#60a5fa', '#fbbf24', '#409EFF', '#c084fc'];
  // 存储所有球体对象
  const balls: any[] = [];
  const BALL_COUNT = 6;
  // 获取 canvas 元素
  const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement;
  if (!canvas) return;
  // 获取 2D 绘图上下文
  const ctx = canvas.getContext('2d')!;
  // 适配窗口大小
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  // 初始化球体参数
  for(let i=0;i<BALL_COUNT;i++){
    const r = 40 + Math.random()*50;
    balls.push({
      x: Math.random()*(window.innerWidth-r*2)+r,
      y: Math.random()*(window.innerHeight-r*2)+r,
      r,
      color: colors[i%colors.length],
      vx: (Math.random()-0.5)*1.2,
      vy: (Math.random()-0.5)*1.2
    });
  }
  // 动画主循环，绘制所有球体并更新位置
  function drawBalls() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(const b of balls){
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
      ctx.closePath();
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 30;
      ctx.fill();
      ctx.restore();
      // 球体运动与边界反弹
      b.x += b.vx;
      b.y += b.vy;
      if(b.x-b.r<0){ b.x=b.r; b.vx*=-1; }
      if(b.x+b.r>canvas.width){ b.x=canvas.width-b.r; b.vx*=-1; }
      if(b.y-b.r<0){ b.y=b.r; b.vy*=-1; }
      if(b.y+b.r>canvas.height){ b.y=canvas.height-b.r; b.vy*=-1; }
    }
    requestAnimationFrame(drawBalls);
  }
  drawBalls();
}

onMounted(() => {
  setupBackgroundAnimation();
});
</script>

<style scoped>
.login-wrapper {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
  z-index: 1;
}
#bg-canvas {
  position: fixed;
  left: 0; top: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  pointer-events: none;
  display: block;
}
.login-form-side {
  width: 100vw;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
.login-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 24px rgba(60, 60, 120, 0.13);
  padding: 38px 32px 32px 32px;
  width: 100%;
  max-width: 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
}
.login-title {
  font-size: 28px;
  font-weight: 700;
  color: #409EFF;
  margin-bottom: 18px;
  letter-spacing: 2px;
  text-align: center;
  width: 100%;
}
.login-desc {
  color: #888;
  font-size: 15px;
  margin-bottom: 32px;
  width: 100%;
  text-align: center;
}
.el-form-item {
  margin-bottom: 22px;
  position: relative;
  width: 100%;
  display: block;
}
.password-eye-btn {
  background: none;
  border: none;
  outline: none;
  padding: 0 2px;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  height: 100%;
  color: #b0b3b8;
  transition: color 0.2s;
  position: relative;
  z-index: 10;
}
.password-eye-btn:hover {
  color: #409EFF;
}
.password-eye {
  width: 18px;
  height: 18px;
  pointer-events: none;
  display: block;
  fill: currentColor;
}
.login-btn {
  width: 100%;
  font-size: 17px;
  padding: 16px 0;
  border-radius: 6px;
  height: 44px;
}
@media (max-width: 900px) {
  .login-card { width: 98vw; min-width: 0; padding: 32px 8vw; }
}
</style> 