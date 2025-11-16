<template>
  <div class="article-edit-page min-h-screen flex flex-col">
    <!-- 导航栏 -->
    <div class="navbar-section h-[60px] px-6 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <el-button text @click="handleBack">
          <el-icon size="26"><ArrowLeft /></el-icon>
        </el-button>
      </div>
      <div class="flex items-center gap-4">
        <el-avatar :size="32" class="cursor-pointer">
          <el-icon><User /></el-icon>
        </el-avatar>
      </div>
    </div>

    <!-- 编辑区域 -->
    <div 
      class="editor-content-wrapper" 
      :class="{ 'toolbar-sticky-active': isToolbarSticky }" 
      :style="{ '--toolbar-height': toolbarHeight + 'px' }"
      ref="editorWrapperRef"
    >
      <!-- 工具栏 -->
      <EditorToolbar :editor="editor" :class="{ 'toolbar-sticky': isToolbarSticky }" ref="toolbarRef" />

      <!-- 标题输入 -->
      <div class="title-section p-6 flex items-center gap-4 border-b">
        <el-input
          v-model="articleTitle"
          placeholder="请输入文章标题 (2~30个字)"
          class="flex-1 title-input"
          @input="handleTitleInput"
        />
        <span
          v-if="showTitleCounter"
          class="text-sm whitespace-nowrap"
          :class="{ 'text-red-500': titleRemaining > 0 }"
        >
          还需输入{{ titleRemaining }}个字
        </span>
      </div>

      <!-- 正文输入 -->
      <div class="flex-1 p-6 flex flex-col">
        <TiptapEditor
          v-model="articleContent"
          ref="editorRef"
        />
      </div>

      <!-- 标签、作者等选项区域 -->
      <div class="meta-section p-6 border-t" ref="metaSectionRef">
        <div class="flex flex-col gap-4">
          <!-- 标签选择 -->
          <div class="flex items-center gap-4">
            <label class="meta-label">标签：</label>
            <el-select
              v-model="selectedTags"
              multiple
              filterable
              allow-create
              default-first-option
              placeholder="请选择或输入标签"
              class="flex-1"
              @change="handleTagsChange"
            >
              <el-option
                v-for="tag in tagOptions"
                :key="tag.id"
                :label="tag.name"
                :value="tag.id"
              />
            </el-select>
          </div>

          <!-- 作者选择 -->
          <div class="flex items-center gap-4">
            <label class="meta-label">作者：</label>
            <el-select
              v-model="selectedAuthor"
              filterable
              placeholder="请选择作者"
              class="flex-1"
            >
              <el-option
                v-for="author in authorOptions"
                :key="author.id"
                :label="author.name"
                :value="author.id"
              >
                <div class="flex items-center gap-2">
                  <el-avatar :src="author.avatar" :size="24">
                    <el-icon><User /></el-icon>
                  </el-avatar>
                  <span>{{ author.name }}</span>
                </div>
              </el-option>
            </el-select>
          </div>

          <!-- 分类选择 -->
          <div class="flex items-center gap-4">
            <label class="meta-label">分类：</label>
            <el-select
              v-model="selectedCategory"
              filterable
              placeholder="请选择分类"
              class="flex-1"
            >
              <el-option
                v-for="category in categoryOptions"
                :key="category.id"
                :label="category.name"
                :value="category.id"
              />
            </el-select>
          </div>
        </div>
      </div>

    </div>

    <!-- 底部栏 -->
    <div class="footer-section">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <el-checkbox v-model="autoSave" disabled>草稿将自动保存</el-checkbox>
          <span class="text-sm">共{{ contentLength }}字</span>
          <el-button 
            text 
            @click="handleSettingsButtonClick"
            class="text-sm"
          >
            {{ isInSettingsArea ? '回到顶部' : '发文设置' }}
            <el-icon class="ml-1">
              <ArrowUp v-if="isInSettingsArea" />
              <ArrowDown v-else />
            </el-icon>
          </el-button>
        </div>
        <div class="flex items-center gap-3">
          <el-button @click="handlePreview">预览</el-button>
          <el-button @click="handleSchedulePublish">定时发布</el-button>
          <el-button type="primary" @click="handlePreviewAndPublish">预览并发布</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { ElButton, ElIcon, ElAvatar, ElInput, ElCheckbox, ElDropdown, ElDropdownMenu, ElDropdownItem, ElSelect, ElOption } from 'element-plus';
import { ArrowLeft, ArrowDown, ArrowUp, User } from '@element-plus/icons-vue';
import EditorToolbar from '@/components/editor/EditorToolbar.vue';
import TiptapEditor from '@/components/editor/TiptapEditor.vue';
import { getTagList } from '@/api/tag';
import { getAuthorList } from '@/api/author';

const router = useRouter();

const articleTitle = ref('');
const articleContent = ref('');
const autoSave = ref(true);
const editorRef = ref(null);
const editorWrapperRef = ref(null);
const toolbarRef = ref(null);
const metaSectionRef = ref(null);
const isToolbarSticky = ref(false);
const toolbarHeight = ref(60); // 默认工具栏高度
const isInSettingsArea = ref(false);

// 标签、作者、分类相关
const selectedTags = ref([]);
const selectedAuthor = ref(null);
const selectedCategory = ref(null);
const tagOptions = ref([]);
const authorOptions = ref([]);
const categoryOptions = ref([]);

// 加载标签列表
const loadTags = async () => {
  try {
    const res = await getTagList({ module: 1, page_size: 100 });
    tagOptions.value = res.data?.list || [];
  } catch (error) {
    console.error('加载标签失败:', error);
  }
};

// 加载作者列表
const loadAuthors = async () => {
  try {
    const res = await getAuthorList({ page_size: 100 });
    authorOptions.value = res.data?.list || [];
  } catch (error) {
    console.error('加载作者失败:', error);
  }
};

// 加载分类列表（示例数据，后续可替换为实际API）
const loadCategories = () => {
  categoryOptions.value = [
    { id: 1, name: '技术文章' },
    { id: 2, name: '产品动态' },
    { id: 3, name: '公司新闻' }
  ];
};

// 处理工具栏吸顶和检测设置区域
const handleScroll = () => {
  if (!editorWrapperRef.value || !toolbarRef.value) return;
  
  const wrapperRect = editorWrapperRef.value.getBoundingClientRect();
  // 获取工具栏元素（可能是组件实例或DOM元素）
  const toolbarEl = toolbarRef.value.$el || toolbarRef.value;
  if (!toolbarEl) return;
  
  const toolbarRect = toolbarEl.getBoundingClientRect();
  
  // 更新工具栏高度
  if (toolbarRect.height > 0) {
    toolbarHeight.value = toolbarRect.height;
  }
  
  // 当编辑区域到达顶部且工具栏也到达顶部时，设置为吸顶状态
  isToolbarSticky.value = wrapperRect.top <= 0 && toolbarRect.top <= 0;
  
  // 检测是否在设置区域（标签、作者等选项区域）
  // 当页面滚动到顶部时，显示"发文设置"按钮
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  if (scrollTop < 100) {
    // 在页面顶部，显示"发文设置"
    isInSettingsArea.value = false;
  } else if (metaSectionRef.value) {
    const metaRect = metaSectionRef.value.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const footerHeight = 80; // 底部栏高度（包含padding）
    // 当设置区域的顶部在视口中可见（考虑底部栏高度）时，认为在设置区域
    isInSettingsArea.value = metaRect.top < viewportHeight - footerHeight;
  }
};

onMounted(async () => {
  loadTags();
  loadAuthors();
  loadCategories();
  
  // 等待 DOM 渲染完成后计算工具栏高度
  await nextTick();
  if (toolbarRef.value) {
    const toolbarEl = toolbarRef.value.$el || toolbarRef.value;
    if (toolbarEl) {
      const toolbarRect = toolbarEl.getBoundingClientRect();
      if (toolbarRect.height > 0) {
        toolbarHeight.value = toolbarRect.height;
      }
    }
  }
  
  // 监听滚动事件
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  // 清理滚动监听
  window.removeEventListener('scroll', handleScroll);
});

const titleLength = computed(() => articleTitle.value.length);
const titleRemaining = computed(() => {
  const remaining = 2 - titleLength.value;
  return remaining > 0 ? remaining : 0;
});
const showTitleCounter = computed(() => titleLength.value < 2);

// 获取编辑器实例
const editor = computed(() => editorRef.value?.editor);

// 计算内容长度（纯文本）
const contentLength = computed(() => {
  if (!editor.value) return 0;
  return editor.value.state.doc.textContent.length;
});

const handleBack = () => {
  router.back();
};

const handlePublishCommand = (command) => {
  console.log('Publish command:', command);
  // 处理发布相关操作
};

const handleTitleInput = () => {
  // 标题输入处理
};

// 处理标签变化（处理新创建的标签）
const handleTagsChange = (value) => {
  // 如果包含字符串（新创建的标签），可以在这里处理
  // 例如：创建新标签并更新 selectedTags
  const newTags = value.filter(v => typeof v === 'string');
  if (newTags.length > 0) {
    // 这里可以调用创建标签的API
    console.log('新创建的标签:', newTags);
  }
};

// 处理设置按钮点击
const handleSettingsButtonClick = () => {
  if (isInSettingsArea.value) {
    // 回到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    // 滚动到设置区域
    if (metaSectionRef.value) {
      metaSectionRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
};

const handlePreview = () => {
  console.log('Preview');
  // 预览功能
};

const handleSchedulePublish = () => {
  console.log('Schedule publish');
  // 定时发布功能
};

const handlePreviewAndPublish = () => {
  console.log('Preview and publish');
  // 预览并发布功能
};
</script>

<style scoped>
/* 页面背景色 - Light 模式 */
.article-edit-page {
  background-color: #f8f8f8;
  transition: background-color 0.3s ease;
}

/* 页面背景色 - Dark 模式 */
.dark .article-edit-page {
  background-color: #1a1a1a;
}

/* 编辑区域容器 */
.editor-content-wrapper {
  max-width: 854px;
  margin: 20px auto 0 auto;
  width: calc(100% - 64px);
  display: flex;
  flex-direction: column;
  flex: 1;
  /* Light 模式：编辑区域背景色为白色 */
  background-color: #ffffff;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  padding-bottom: 0;
  margin-bottom: 60px;
}

/* 工具栏吸顶时的编辑区域 padding */
.editor-content-wrapper.toolbar-sticky-active {
  padding-top: var(--toolbar-height, 60px);
}

/* Dark 模式：编辑区域背景色 */
.dark .editor-content-wrapper {
  background-color: #2d2d2d;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* 标题输入区域边框 - Light 模式 */
.title-section {
  border-bottom-color: #e5e7eb;
}

/* 标题输入区域边框 - Dark 模式 */
.dark .title-section {
  border-bottom-color: #404040;
}

/* 标签、作者等选项区域 */
.meta-section {
  border-top-color: #e5e7eb;
}

.dark .meta-section {
  border-top-color: #404040;
}

.meta-label {
  min-width: 60px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

/* 底部栏 - Light 模式 */
.footer-section {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  max-width: 854px;
  width: calc(100% - 64px);
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background-color: #ffffff;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  z-index: 10;
  border-radius: 0;
}

/* 底部栏 - Dark 模式 */
.dark .footer-section {
  border-top-color: #404040;
  background-color: #2d2d2d;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.3);
}

/* 标题输入框样式 */
.title-input :deep(.el-input__wrapper) {
  box-shadow: none;
  border: none;
  font-size: 24px;
  font-weight: 500;
  background-color: transparent;
}

.title-input :deep(.el-input__inner) {
  font-size: 24px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

/* 导航栏背景 - Light 模式 */
.navbar-section {
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

/* 导航栏背景 - Dark 模式 */
.dark .navbar-section {
  background-color: #2d2d2d;
  border-bottom-color: #404040;
}

</style>

