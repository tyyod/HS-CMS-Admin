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
      <EditorToolbar :editor="editorInstance" :class="{ 'toolbar-sticky': isToolbarSticky }" ref="toolbarRef" />

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
          class="whitespace-nowrap"
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
          @editor-ready="handleEditorReady"
        />
      </div>

      <!-- 标签、作者等选项区域 -->
      <div class="meta-section p-6 border-t" ref="metaSectionRef">
        <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
          <div class="flex flex-col gap-8">
            <!-- 封面图 -->
            <el-form-item label="展示封面" prop="cover_url" class="meta-form-item cover-form-item">
              <div class="cover-upload-wrapper">
                <!-- 封面类型选择 -->
                <div class="cover-type-selector">
                  <el-radio-group v-model="formData.cover_type" class="cover-radio-group">
                    <el-radio :value="2">单图</el-radio>
                    <el-radio :value="1">无封面</el-radio>
                  </el-radio-group>
                </div>

                <!-- 图片上传区域 -->
                <div v-if="formData.cover_type !== 1" class="cover-images-wrap">
                  <div class="cover-images-content">
                    <div class="cover-images-container">
                      <div class="cover-image-item">
                        <el-upload
                          class="cover-uploader"
                          :show-file-list="false"
                          :before-upload="beforeCoverUpload"
                          :http-request="handleCoverUpload"
                          accept="image/*"
                        >
                          <div v-if="formData.cover_url" class="cover-preview">
                            <img :src="formData.cover_url" alt="封面图预览" />
                            <div class="cover-mask">
                              <el-button text size="small" @click.stop="handleRemoveCover">删除</el-button>
                              <el-button text size="small" @click.stop="handlePreviewCover">预览</el-button>
                            </div>
                          </div>
                          <div v-else class="cover-add">
                            <el-icon class="cover-add-icon"><Plus /></el-icon>
                          </div>
                        </el-upload>
                      </div>
                    </div>

                    <!-- 预览按钮 -->
                    <div v-if="hasCoverImages" class="cover-preview-btn">
                      <el-button text size="small" @click="handlePreviewCover">预览</el-button>
                    </div>
                  </div>
                </div>

                <!-- 提示文字 -->
                <div v-if="formData.cover_type !== 1" class="cover-tip">
                  优质的封面有利于推荐，格式支持JPEG、PNG
                </div>
              </div>
            </el-form-item>

            <!-- 标签选择 -->
            <el-form-item label="标签" prop="tag_ids" class="meta-form-item tag-form-item">
              <el-select
                v-model="formData.tag_ids"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="请选择或输入标签"
                class="tag-select"
                @change="handleTagsChange"
              >
                <el-option
                  v-for="tag in tagOptions"
                  :key="tag.id"
                  :label="tag.name"
                  :value="tag.id"
                />
              </el-select>
            </el-form-item>

            <!-- 分类选择 -->
            <el-form-item label="分类" prop="category_id" class="meta-form-item category-form-item">
              <el-select
                v-model="formData.category_id"
                filterable
                placeholder="请选择分类"
                class="category-select"
              >
                <el-option
                  v-for="category in categoryOptions"
                  :key="category.id"
                  :label="category.name"
                  :value="category.id"
                />
              </el-select>
            </el-form-item>

            <!-- 文章类型（原创/转载） -->
            <el-form-item label="文章类型" prop="post_type" class="meta-form-item post-type-form-item">
              <el-radio-group v-model="formData.post_type" class="post-type-radio-group">
                <el-radio :value="0">原创</el-radio>
                <el-radio :value="1">转载</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 作者选择（仅原创时显示） -->
            <el-form-item 
              v-if="formData.post_type === 0"
              label="作者" 
              prop="author_id" 
              class="meta-form-item author-form-item"
            >
              <el-select
                v-model="formData.author_id"
                filterable
                clearable
                placeholder="请选择作者"
                class="author-select"
              >
                <el-option
                  v-for="author in authorOptions"
                  :key="author.id"
                  :label="author.name"
                  :value="author.id"
                >
                  <div class="author-option">
                    <el-avatar :src="author.avatar" :size="20" class="author-avatar">
                      <el-icon><User /></el-icon>
                    </el-avatar>
                    <span class="author-name">{{ author.name }}</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>

            <!-- 原作者（仅转载时显示） -->
            <el-form-item 
              v-if="formData.post_type === 1"
              label="原作者" 
              prop="original_author_name" 
              class="meta-form-item original-author-form-item"
            >
              <el-input
                v-model="formData.original_author_name"
                placeholder="请输入原作者"
                class="original-author-input"
              />
            </el-form-item>

            <!-- 原文链接（仅转载时显示） -->
            <el-form-item 
              v-if="formData.post_type === 1"
              label="原文链接" 
              prop="original_url" 
              class="meta-form-item original-url-form-item"
            >
              <el-input
                v-model="formData.original_url"
                placeholder="请输入原文链接"
                class="original-url-input"
              />
            </el-form-item>
          </div>
        </el-form>
      </div>

    </div>

    <!-- 封面图预览对话框 -->
    <el-dialog
      v-model="coverPreviewVisible"
      title="封面图预览"
      width="600px"
      :close-on-click-modal="true"
    >
      <div class="cover-preview-dialog">
        <img v-if="coverPreviewUrl" :src="coverPreviewUrl" alt="封面图预览" />
        <div v-else class="no-preview">暂无预览</div>
      </div>
    </el-dialog>

    <!-- 底部栏 -->
    <div class="footer-section">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <el-checkbox v-model="autoSave" disabled>草稿将自动保存</el-checkbox>
          <span>共{{ contentLength }}字</span>
          <el-button 
            text 
            @click="handleSettingsButtonClick"
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
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElButton, ElIcon, ElAvatar, ElInput, ElCheckbox, ElDropdown, ElDropdownMenu, ElDropdownItem, ElSelect, ElOption, ElForm, ElFormItem, ElMessage, ElUpload, ElRadioGroup, ElRadio, ElDialog } from 'element-plus';
import { ArrowLeft, ArrowDown, ArrowUp, User, Plus } from '@element-plus/icons-vue';
import EditorToolbar from '@/components/editor/EditorToolbar.vue';
import TiptapEditor from '@/components/editor/TiptapEditor.vue';
import { getTagList } from '@/api/tag';
import { getAuthorList } from '@/api/author';
import { getCategoryList } from '@/api/article';

const router = useRouter();

const articleTitle = ref('');
const articleContent = ref('');
const autoSave = ref(true);
const editorRef = ref(null);
const editorWrapperRef = ref(null);
const toolbarRef = ref(null);
const metaSectionRef = ref(null);
const formRef = ref(null);
const isToolbarSticky = ref(false);
const toolbarHeight = ref(60); // 默认工具栏高度
const isInSettingsArea = ref(false);
const editorInstance = ref(null);

// 表单数据
const formData = ref({
  tag_ids: [],
  author_id: null,
  category_id: null,
  cover_type: 2, // 1: 无封面, 2: 单图
  cover_url: '',
  post_type: 0, // 0: 原创, 1: 转载
  original_author_name: '',
  original_url: ''
});

// 封面预览对话框
const coverPreviewVisible = ref(false);
const coverPreviewUrl = ref('');

// 表单验证规则（根据文章类型动态变化）
const formRules = computed(() => {
  const rules = {
    tag_ids: [
      { required: true, message: '请选择至少一个标签', trigger: 'change', type: 'array', min: 1 }
    ],
    category_id: [
      { required: true, message: '请选择分类', trigger: 'change' }
    ],
    post_type: [
      { required: true, message: '请选择文章类型', trigger: 'change' }
    ]
  };

  // 原创：必须选择作者
  if (formData.value.post_type === 0) {
    rules.author_id = [
      { required: true, message: '请选择作者', trigger: 'change' }
    ];
  }

  // 转载：必须填写原作者姓名和原文链接
  if (formData.value.post_type === 1) {
    rules.original_author_name = [
      { required: true, message: '请输入原作者姓名', trigger: 'blur' }
    ];
    rules.original_url = [
      { required: true, message: '请输入原文链接', trigger: 'blur' },
      { 
        type: 'url', 
        message: '请输入有效的链接地址', 
        trigger: 'blur',
        transform(value) {
          // 如果用户没有输入协议，自动添加 http://
          if (value && !value.match(/^https?:\/\//)) {
            return 'http://' + value;
          }
          return value;
        }
      }
    ];
  }

  return rules;
});

// 标签、作者、分类选项
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

// 加载分类列表
const loadCategories = async () => {
  try {
    const res = await getCategoryList({ page_size: 100 });
    categoryOptions.value = res.data?.list || [];
  } catch (error) {
    console.error('加载分类失败:', error);
  }
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

// 监听编辑器实例的变化
watch(() => editorRef.value?.editor?.value, (newEditor) => {
  if (newEditor) {
    editorInstance.value = newEditor;
  }
}, { immediate: true });

// 计算内容长度（纯文本）
const contentLength = computed(() => {
  if (!editorInstance.value) return 0;
  return editorInstance.value.state.doc.textContent.length;
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

// 处理编辑器就绪事件
const handleEditorReady = (editor) => {
  editorInstance.value = editor;
};

// 处理标签变化（处理新创建的标签）
const handleTagsChange = (value) => {
  // 如果包含字符串（新创建的标签），可以在这里处理
  // 例如：创建新标签并更新 formData.tag_ids
  const newTags = value.filter(v => typeof v === 'string');
  if (newTags.length > 0) {
    // 这里可以调用创建标签的API
    console.log('新创建的标签:', newTags);
  }
};

// 封面图上传前验证
const beforeCoverUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  const isLt5M = file.size / 1024 / 1024 < 5;

  if (!isImage) {
    ElMessage.error('只能上传图片文件！');
    return false;
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB！');
    return false;
  }
  return true;
};

// 处理封面图上传
const handleCoverUpload = async (options) => {
  const { file } = options;
  
  // 这里可以调用实际上传API
  // 目前先使用FileReader转换为base64或blob URL作为临时方案
  const reader = new FileReader();
  reader.onload = (e) => {
    // 使用base64作为临时方案，实际项目中应该上传到服务器后获取URL
    formData.value.cover_url = e.target.result;
    ElMessage.success('封面图上传成功');
  };
  reader.onerror = () => {
    ElMessage.error('图片读取失败');
  };
  reader.readAsDataURL(file);
  
  // 如果后续有上传API，可以这样实现：
  // try {
  //   const uploadFormData = new FormData();
  //   uploadFormData.append('file', file);
  //   const res = await uploadImage(uploadFormData);
  //   formData.value.cover_url = res.data.url;
  //   ElMessage.success('封面图上传成功');
  // } catch (error) {
  //   ElMessage.error('封面图上传失败');
  // }
};

// 删除封面图
const handleRemoveCover = () => {
  formData.value.cover_url = '';
  ElMessage.info('已删除封面图');
};

// 预览封面图
const handlePreviewCover = () => {
  if (formData.value.cover_url) {
    coverPreviewUrl.value = formData.value.cover_url;
    coverPreviewVisible.value = true;
  }
};

// 计算是否有封面图片
const hasCoverImages = computed(() => {
  return formData.value.cover_type === 2 && !!formData.value.cover_url;
});

// 监听封面类型变化
watch(() => formData.value.cover_type, (newType) => {
  // 切换到无封面时，清空图片
  if (newType === 1) {
    formData.value.cover_url = '';
  }
});

// 监听文章类型变化
watch(() => formData.value.post_type, (newType) => {
  if (newType === 0) {
    // 切换到原创时，清空转载相关字段
    formData.value.original_author_name = '';
    formData.value.original_url = '';
  } else if (newType === 1) {
    // 切换到转载时，清空作者ID
    formData.value.author_id = null;
  }
  // 清除相关字段的验证错误
  if (formRef.value) {
    nextTick(() => {
      formRef.value?.clearValidate(['author_id', 'original_author_name', 'original_url']);
    });
  }
});

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

// 验证表单
const validateForm = async () => {
  if (!formRef.value) return false;
  
  try {
    await formRef.value.validate();
    return true;
  } catch (error) {
    ElMessage.warning('请完善必填信息');
    // 滚动到设置区域
    if (metaSectionRef.value) {
      metaSectionRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    return false;
  }
};

const handlePreviewAndPublish = async () => {
  // 验证标题
  if (!articleTitle.value || articleTitle.value.length < 2) {
    ElMessage.warning('请输入文章标题（至少2个字）');
    return;
  }
  
  // 验证内容
  if (!articleContent.value || articleContent.value.trim() === '') {
    ElMessage.warning('请输入文章内容');
    return;
  }
  
  // 验证必填字段
  if (!await validateForm()) {
    return;
  }
  
  console.log('Preview and publish', {
    title: articleTitle.value,
    content: articleContent.value,
    ...formData.value
  });
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
  font-size: 16px;
  color: var(--el-text-color-regular);
}

/* 表单样式 */
.meta-form-item {
  margin-bottom: 0;
}

/* 确保表单元素字号正常 */
.meta-form-item :deep(.el-input__inner),
.meta-form-item :deep(.el-select__placeholder),
.meta-form-item :deep(.el-select__selected-item),
.meta-form-item :deep(.el-option) {
  font-size: 16px;
}

.meta-form-item :deep(.el-form-item__label) {
  min-width: 80px;
  font-size: 16px;
  color: var(--el-text-color-regular);
}

.meta-form-item :deep(.el-form-item__content) {
  flex: 1;
}

/* 标签选择组件样式 */
.tag-form-item :deep(.el-form-item__content) {
  flex: 0 0 auto;
}

.tag-select {
  width: 400px;
  max-width: 100%;
}

/* 作者选择组件样式 */
.author-form-item :deep(.el-form-item__content) {
  flex: 0 0 auto;
}

.author-select {
  width: 400px;
  max-width: 100%;
}

/* 分类选择组件样式 */
.category-form-item :deep(.el-form-item__content) {
  flex: 0 0 auto;
}

.category-select {
  width: 400px;
  max-width: 100%;
}

/* 文章类型组件样式 */
.post-type-form-item {
  margin-bottom: 0;
}

.post-type-form-item :deep(.el-form-item) {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
}

.post-type-form-item :deep(.el-form-item__label) {
  white-space: nowrap;
  flex-shrink: 0;
}

.post-type-form-item :deep(.el-form-item__content) {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}

.post-type-radio-group {
  display: flex;
  gap: 16px;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.post-type-radio-group :deep(.el-radio) {
  margin-right: 0;
  white-space: nowrap;
  flex-shrink: 0;
}

/* 原作者姓名组件样式 */
.original-author-form-item {
  margin-top: 8px;
}

.original-author-form-item :deep(.el-form-item__label) {
  width: 90px !important;
  min-width: 90px;
  white-space: nowrap;
  padding-right: 8px;
}

.original-author-form-item :deep(.el-form-item__content) {
  flex: 0 0 auto;
}

.original-author-input {
  width: 400px;
  max-width: 100%;
}

/* 原文链接组件样式 */
.original-url-form-item {
  margin-top: 8px;
}

.original-url-form-item :deep(.el-form-item__label) {
  width: 90px !important;
  min-width: 90px;
  white-space: nowrap;
  padding-right: 8px;
}

.original-url-form-item :deep(.el-form-item__content) {
  flex: 0 0 auto;
}

.original-url-input {
  width: 400px;
  max-width: 100%;
}

.author-select :deep(.el-select__wrapper) {
  min-height: 32px;
}

.author-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.author-avatar {
  flex-shrink: 0;
}

.author-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 封面图上传样式 */
.cover-upload-wrapper {
  width: 100%;
}

.cover-form-item :deep(.el-form-item__content) {
  flex: 1;
}

/* 封面类型选择器 */
.cover-type-selector {
  margin-bottom: 16px;
}

.cover-radio-group {
  display: flex;
  gap: 16px;
}

.cover-radio-group :deep(.el-radio) {
  margin-right: 0;
}

/* 图片上传区域 */
.cover-images-wrap {
  width: 100%;
}

.cover-images-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.cover-images-container {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  flex: 1;
}

.cover-image-item {
  flex: 0 0 auto;
  width: 120px;
  height: 120px;
}

.cover-uploader {
  width: 100%;
  height: 100%;
}

.cover-uploader :deep(.el-upload) {
  width: 100%;
  height: 100%;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
}

.cover-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}

.cover-add {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.cover-add-icon {
  font-size: 28px;
  color: #8c939d;
}

.cover-preview {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.cover-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 6px;
}

.cover-preview:hover .cover-mask {
  opacity: 1;
}

.cover-mask :deep(.el-button) {
  color: #ffffff;
}

.cover-mask :deep(.el-button:hover) {
  background-color: rgba(255, 255, 255, 0.2);
}

/* 预览按钮 */
.cover-preview-btn {
  margin-top: 12px;
  padding-left: 0;
}

/* 提示文字 */
.cover-tip {
  margin-top: 12px;
  font-size: 16px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}

/* 封面预览对话框 */
.cover-preview-dialog {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.cover-preview-dialog img {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
}

.no-preview {
  text-align: center;
  color: var(--el-text-color-secondary);
  padding: 40px;
}

/* Dark 模式封面图上传样式 */
.dark .cover-uploader :deep(.el-upload) {
  border-color: #404040;
  background-color: #2a2a2a;
}

.dark .cover-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}

.dark .cover-add-icon {
  color: #8c939d;
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

