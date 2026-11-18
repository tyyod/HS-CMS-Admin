<template>
  <div class="editor-toolbar">
    <div class="toolbar-group">
      <el-button text @click="handleUndo" title="撤销">
        <ArrowBackUp :size="24" />
      </el-button>
      <el-button text @click="handleRedo" title="重做">
        <ArrowForwardUp :size="24" />
      </el-button>
      <div class="toolbar-divider"></div>
      <el-button text @click="handleHeading" title="标题 (H1/H2)">
        <IconHeading :size="24" />
      </el-button>
      <el-button 
        text 
        @click="handleBold" 
        title="加粗"
        :class="{ 'is-active': isBold }"
      >
        <IconBold :size="24" />
      </el-button>
      <el-button 
        text 
        @click="handleItalic" 
        title="斜体"
        :class="{ 'is-active': isItalic }"
      >
        <IconItalic :size="24" />
      </el-button>
      <el-button 
        text 
        @click="handleUnderline" 
        title="下划线"
        :class="{ 'is-active': isUnderline }"
      >
        <Icon icon="fluent:text-underline-20-filled" style="width: 24px; height: 24px;" />
      </el-button>
      <el-button 
        text 
        @click="handleStrikethrough" 
        title="删除线"
        :class="{ 'is-active': isStrike }"
      >
        <IconStrikethrough :size="24" />
      </el-button>
      <el-button 
        text 
        @click="handleQuote" 
        title="引用"
        :class="{ 'is-active': isBlockquote }"
      >
        <Icon icon="carbon:quotes" style="width: 24px; height: 24px;" />
      </el-button>
      <el-dropdown trigger="click" @command="handleListCommand">
        <el-button 
          text 
          title="列表"
          :class="{ 'is-active': isBulletList || isOrderedList }"
        >
          <IconList :size="24" />
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="bullet">
              <div class="dropdown-item">
                <IconList :size="20" />
                <span>无序列表</span>
              </div>
            </el-dropdown-item>
            <el-dropdown-item command="ordered">
              <div class="dropdown-item">
                <el-icon :size="20"><FormatListNumberedRound /></el-icon>
                <span>有序列表</span>
              </div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-button text @click="handleLink" title="链接">
        <IconLink :size="24" />
      </el-button>
      <el-dropdown trigger="click" @command="handleCodeCommand">
        <el-button 
          text 
          title="代码"
          :class="{ 'is-active': isCode || isCodeBlock }"
        >
          <IconCode :size="24" />
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="inline">
              <div class="dropdown-item">
                <IconCode :size="20" />
                <span>行内代码</span>
              </div>
            </el-dropdown-item>
            <el-dropdown-item command="block">
              <div class="dropdown-item">
                <IconBraces :size="20" />
                <span>代码块</span>
              </div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-button text @click="handleImage" title="图片">
        <el-icon :size="24"><Picture /></el-icon>
      </el-button>
      <el-button 
        text 
        @click="handleTable" 
        title="表格"
        :disabled="isInTable"
      >
        <el-icon :size="24"><Grid /></el-icon>
      </el-button>
      <el-button text @click="handleEmoji" title="表情">
        <Icon icon="fluent:emoji-28-regular" style="width: 24px; height: 24px;" />
      </el-button>
      <el-dropdown trigger="click" @command="handleMoreCommand">
        <el-button text title="更多">
          <el-icon :size="24"><More /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="document">
              <div class="dropdown-item">
                <el-icon :size="20"><Document /></el-icon>
                <span>文档</span>
              </div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    
    <!-- 表情选择器弹窗 -->
    <el-dialog
      v-model="emojiDialogVisible"
      title="选择表情"
      width="400px"
      :close-on-click-modal="true"
    >
      <div class="emoji-picker">
        <div class="emoji-grid">
          <span
            v-for="emoji in emojiList"
            :key="emoji"
            class="emoji-item"
            @click="insertEmoji(emoji)"
          >
            {{ emoji }}
          </span>
        </div>
      </div>
    </el-dialog>

    <!-- 表格尺寸选择器弹窗 -->
    <el-dialog
      v-model="tableSizeDialogVisible"
      title="选择表格尺寸"
      width="400px"
      :close-on-click-modal="true"
    >
      <el-form :model="tableSizeForm" label-width="80px">
        <el-form-item label="行数">
          <el-input-number
            v-model="tableSizeForm.rows"
            :min="1"
            :max="20"
            :step="1"
          />
        </el-form-item>
        <el-form-item label="列数">
          <el-input-number
            v-model="tableSizeForm.cols"
            :min="1"
            :max="20"
            :step="1"
          />
        </el-form-item>
        <el-form-item label="表头">
          <el-switch v-model="tableSizeForm.withHeaderRow" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="tableSizeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmInsertTable">确定</el-button>
      </template>
    </el-dialog>

    <!-- 链接插入弹窗 -->
    <el-dialog
      v-model="linkDialogVisible"
      title="插入链接"
      width="500px"
      :close-on-click-modal="true"
    >
      <el-form :model="linkForm" :rules="linkRules" ref="linkFormRef" label-width="80px">
        <el-form-item label="链接文字" prop="text" required>
          <el-input
            v-model="linkForm.text"
            placeholder="填写链接文字"
            clearable
          />
        </el-form-item>
        <el-form-item label="链接地址" prop="url" required>
          <el-input
            v-model="linkForm.url"
            placeholder="填写链接地址"
            clearable
          />
          <div class="link-form-extra">
            <p class="hint">请勿添加与正文无关的链接</p>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="linkDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmInsertLink">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { ElButton, ElIcon, ElDropdown, ElDropdownMenu, ElDropdownItem, ElDialog, ElForm, ElFormItem, ElInputNumber, ElSwitch, ElInput, ElMessage } from 'element-plus';
import {
  Document,
  Picture,
  Grid,
  More
} from '@element-plus/icons-vue';
import { 
  IconArrowBackUp as ArrowBackUp, 
  IconArrowForwardUp as ArrowForwardUp,
  IconHeading,
  IconBold,
  IconItalic,
  IconStrikethrough,
  IconList,
  IconLink,
  IconCode,
  IconBraces
} from '@tabler/icons-vue';
import { Icon } from '@iconify/vue';
import { FormatListNumberedRound } from '@vicons/material';

const props = defineProps({
  editor: {
    type: Object,
    default: null
  }
});

const handleUndo = () => {
  if (!props.editor) return;
  props.editor.chain().focus().undo().run();
};

const handleRedo = () => {
  if (!props.editor) return;
  props.editor.chain().focus().redo().run();
};

const handleHeading = () => {
  if (!props.editor) return;
  const level = props.editor.isActive('heading', { level: 1 }) ? 2 : 1;
  props.editor.chain().focus().toggleHeading({ level }).run();
};

const handleBold = () => {
  if (!props.editor) return;
  props.editor.chain().focus().toggleBold().run();
};

const handleItalic = () => {
  if (!props.editor) return;
  props.editor.chain().focus().toggleItalic().run();
};

const handleUnderline = () => {
  if (!props.editor) return;
  props.editor.chain().focus().toggleUnderline().run();
};

const handleStrikethrough = () => {
  if (!props.editor) return;
  props.editor.chain().focus().toggleStrike().run();
};

const handleQuote = () => {
  if (!props.editor) return;
  props.editor.commands.focus();
  props.editor.commands.toggleBlockquote();
};

const handleListCommand = (command) => {
  if (!props.editor) return;
  
  props.editor.commands.focus();
  
  if (command === 'bullet') {
    // 如果当前在有序列表中，先取消它
    if (props.editor.isActive('orderedList')) {
      props.editor.commands.toggleOrderedList();
    }
    // 切换无序列表
    props.editor.commands.toggleBulletList();
  } else if (command === 'ordered') {
    // 如果当前在无序列表中，先取消它
    if (props.editor.isActive('bulletList')) {
      props.editor.commands.toggleBulletList();
    }
    // 切换有序列表
    props.editor.commands.toggleOrderedList();
  }
};

const handleLink = () => {
  if (!props.editor) return;
  
  // 获取当前选中的文本
  const { state } = props.editor;
  const { selection } = state;
  const { from, to } = selection;
  const selectedText = state.doc.textBetween(from, to, ' ');
  
  // 保存选中范围
  savedSelection.value = { from, to };
  
  // 如果当前已经是链接，获取链接信息
  const linkAttrs = props.editor.getAttributes('link');
  
  // 初始化表单
  linkForm.value = {
    text: selectedText || linkAttrs.href || '',
    url: linkAttrs.href || ''
  };
  
  linkDialogVisible.value = true;
};

const confirmInsertLink = async () => {
  if (!linkFormRef.value || !props.editor) return;
  
  // 验证表单
  try {
    await linkFormRef.value.validate();
  } catch (error) {
    return;
  }
  
  const { text, url } = linkForm.value;
  
  // 处理URL，如果没有协议则添加 http://
  let finalUrl = url.trim();
  if (finalUrl && !finalUrl.match(/^https?:\/\//)) {
    finalUrl = 'http://' + finalUrl;
  }
  
  props.editor.commands.focus();
  
  // 使用保存的选中范围
  if (savedSelection.value) {
    const { from, to } = savedSelection.value;
    const hasSelection = from !== to;
    
    if (hasSelection) {
      // 如果有选中文本，先删除选中文本，然后插入链接
      props.editor.chain()
        .focus()
        .setTextSelection({ from, to })
        .deleteSelection()
        .insertContent(`<a href="${finalUrl}">${text}</a>`)
        .run();
    } else {
      // 如果没有选中文本，直接插入链接
      props.editor.chain()
        .focus()
        .setTextSelection({ from, to })
        .insertContent(`<a href="${finalUrl}">${text}</a>`)
        .run();
    }
  } else {
    // 如果没有保存的范围，直接插入链接
    props.editor.chain()
      .focus()
      .insertContent(`<a href="${finalUrl}">${text}</a>`)
      .run();
  }
  
  linkDialogVisible.value = false;
  linkForm.value = { text: '', url: '' };
  savedSelection.value = null;
};

const handleCodeCommand = (command) => {
  if (!props.editor) return;
  if (command === 'inline') {
    props.editor.chain().focus().toggleCode().run();
  } else if (command === 'block') {
    props.editor.chain().focus().toggleCodeBlock().run();
  }
};

const handleImage = () => {
  if (!props.editor) return;
  const url = window.prompt('请输入图片地址:');
  if (url) {
    props.editor.chain().focus().setImage({ src: url }).run();
  }
};

const emojiDialogVisible = ref(false);
const tableSizeDialogVisible = ref(false);
const tableSizeForm = ref({
  rows: 3,
  cols: 3,
  withHeaderRow: true
});

const linkDialogVisible = ref(false);
const linkFormRef = ref(null);
const linkForm = ref({
  text: '',
  url: ''
});
const savedSelection = ref(null); // 保存选中文本的范围

// 链接表单验证规则
const linkRules = {
  text: [
    { required: true, message: '请输入链接文字', trigger: 'blur' }
  ],
  url: [
    { required: true, message: '请输入链接地址', trigger: 'blur' },
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
  ]
};

const emojiList = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
  '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
  '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
  '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
  '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
  '🤧', '🥵', '🥶', '😶‍🌫️', '😵', '😵‍💫', '🤯', '🤠', '🥳', '😎',
  '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳',
  '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖',
  '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬',
  '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽',
  '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿',
  '😾', '🙈', '🙉', '🙊', '💋', '💌', '💘', '💝', '💖', '💗',
  '💓', '💞', '💕', '💟', '❣️', '💔', '❤️', '🧡', '💛', '💚',
  '💙', '💜', '🖤', '🤍', '🤎', '💯', '💢', '💥', '💫', '💦',
  '💨', '🕳️', '💣', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤', '👋',
  '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟',
  '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎',
  '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏',
  '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻',
  '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄'
];

const insertEmoji = (emoji) => {
  if (!props.editor) return;
  props.editor.chain().focus().insertContent(emoji).run();
  emojiDialogVisible.value = false;
};

// 检查是否在表格内
const isInTable = computed(() => {
  if (!props.editor) return false;
  return props.editor.isActive('table');
});

const handleTable = () => {
  if (!props.editor || isInTable.value) return;
  // 显示表格尺寸选择对话框
  tableSizeForm.value = {
    rows: 3,
    cols: 3,
    withHeaderRow: true
  };
  tableSizeDialogVisible.value = true;
};

const confirmInsertTable = () => {
  if (!props.editor) return;
  props.editor.commands.focus();
  props.editor.commands.insertTable({
    rows: tableSizeForm.value.rows,
    cols: tableSizeForm.value.cols,
    withHeaderRow: tableSizeForm.value.withHeaderRow
  });
  tableSizeDialogVisible.value = false;
};

const handleEmoji = () => {
  emojiDialogVisible.value = true;
};

const handleMoreCommand = (command) => {
  if (command === 'document') {
    // 文档功能可以后续扩展
    console.log('Document feature');
  }
};

// 计算按钮激活状态
const isBold = computed(() => props.editor?.isActive('bold'));
const isItalic = computed(() => props.editor?.isActive('italic'));
const isUnderline = computed(() => props.editor?.isActive('underline'));
const isStrike = computed(() => props.editor?.isActive('strike'));
const isHeading = computed(() => props.editor?.isActive('heading'));
const isBulletList = computed(() => props.editor?.isActive('bulletList'));
const isOrderedList = computed(() => props.editor?.isActive('orderedList'));
const isBlockquote = computed(() => props.editor?.isActive('blockquote'));
const isCode = computed(() => props.editor?.isActive('code'));
const isCodeBlock = computed(() => props.editor?.isActive('codeBlock'));
</script>

<style scoped>
.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #ffffff;
  flex-wrap: nowrap;
  overflow-x: auto;
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

/* 工具栏吸顶状态 */
.editor-toolbar.toolbar-sticky {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  max-width: 854px;
  width: calc(100% - 64px);
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 0 0 8px 8px;
}

/* Dark 模式工具栏样式 */
.dark .editor-toolbar {
  border-bottom-color: #404040;
  background-color: #2d2d2d;
}

.dark .editor-toolbar.toolbar-sticky {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background-color: #e5e7eb;
  margin: 0 2px;
  flex-shrink: 0;
  transition: background-color 0.3s ease;
}

/* Dark 模式分隔线 */
.dark .toolbar-divider {
  background-color: #404040;
}

:deep(.el-button) {
  padding: 6px 8px;
  min-height: auto;
  color: var(--el-text-color-regular);
}

:deep(.el-button.is-text) {
  border: none;
  color: var(--el-text-color-regular);
}

:deep(.el-button.is-text:hover) {
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
}

:deep(.el-icon) {
  color: var(--el-text-color-regular);
}

:deep(.el-button.is-text:hover .el-icon) {
  color: var(--el-text-color-primary);
}

/* 文本按钮内的文本颜色 */
:deep(.el-button.is-text strong),
:deep(.el-button.is-text em),
:deep(.el-button.is-text u),
:deep(.el-button.is-text s),
:deep(.el-button.is-text span) {
  color: var(--el-text-color-regular);
}

:deep(.el-button.is-text:hover strong),
:deep(.el-button.is-text:hover em),
:deep(.el-button.is-text:hover u),
:deep(.el-button.is-text:hover s),
:deep(.el-button.is-text:hover span) {
  color: var(--el-text-color-primary);
}

/* Tabler 图标样式 */
:deep(.el-button.is-text svg) {
  color: var(--el-text-color-regular);
  stroke: currentColor;
}

:deep(.el-button.is-text:hover svg) {
  color: var(--el-text-color-primary);
  stroke: currentColor;
}

/* Fluent UI 图标样式 (Iconify) */
:deep(.el-button.is-text .iconify) {
  color: var(--el-text-color-regular);
}

:deep(.el-button.is-text:hover .iconify) {
  color: var(--el-text-color-primary);
}

:deep(.el-button.is-text .iconify svg) {
  color: inherit;
  fill: currentColor;
}

/* 激活状态样式 */
:deep(.el-button.is-text.is-active) {
  background-color: var(--el-fill-color);
  color: var(--el-color-primary);
}

:deep(.el-button.is-text.is-active .el-icon),
:deep(.el-button.is-text.is-active svg),
:deep(.el-button.is-text.is-active .iconify) {
  color: var(--el-color-primary);
}

/* 下拉菜单项样式 */
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dropdown-item svg {
  flex-shrink: 0;
}

.dropdown-item .el-icon {
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 表情选择器样式 */
.emoji-picker {
  max-height: 300px;
  overflow-y: auto;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  padding: 8px;
}

.emoji-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 20px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.emoji-item:hover {
  background-color: var(--el-fill-color-light);
}

.dark .emoji-item:hover {
  background-color: var(--el-fill-color-dark);
}

/* 链接表单样式 */
.link-form-extra {
  margin-top: 4px;
}

.link-form-extra .hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin: 0;
  line-height: 1.5;
}

.dark .link-form-extra .hint {
  color: var(--el-text-color-placeholder);
}
</style>

