<template>
  <div class="editor-header">
    <div class="header-left">
      <el-button text @click="handleBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
    </div>
    <div class="header-right">
      <el-button @click="handleSave">保存草稿</el-button>
      <el-button type="primary" @click="handlePreview">预览</el-button>
    </div>
  </div>
</template>

<script setup>
import { ElButton, ElIcon } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const emit = defineEmits(['save', 'preview']);

const handleBack = () => {
  router.back();
};

const handleSave = () => {
  emit('save');
};

const handlePreview = () => {
  emit('preview');
};
</script>

<style scoped>
.editor-header {
  height: 60px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e8e8e8;
  background-color: #fff;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
