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
      <el-button text @click="handlePaste" title="粘贴">
        <Icon icon="fluent:clipboard-paste-24-filled" style="width: 24px; height: 24px;" />
      </el-button>
      <el-button text @click="handleParagraph" title="段落">
        <el-icon :size="24"><Document /></el-icon>
      </el-button>
    </div>

    <div class="toolbar-group">
      <el-button text @click="handleHeading" title="标题 (H1/H2)">
        H
      </el-button>
      <el-button 
        text 
        @click="handleBold" 
        title="加粗"
        :class="{ 'is-active': isBold }"
      >
        <strong>B</strong>
      </el-button>
      <el-button 
        text 
        @click="handleItalic" 
        title="斜体"
        :class="{ 'is-active': isItalic }"
      >
        <em>I</em>
      </el-button>
      <el-button 
        text 
        @click="handleUnderline" 
        title="下划线"
        :class="{ 'is-active': isUnderline }"
      >
        <u>U</u>
      </el-button>
      <el-button 
        text 
        @click="handleStrikethrough" 
        title="删除线"
        :class="{ 'is-active': isStrike }"
      >
        <s>S</s>
      </el-button>
      <el-button 
        text 
        @click="handleQuote" 
        title="引用"
        :class="{ 'is-active': isBlockquote }"
      >
        <el-icon :size="24"><ChatLineSquare /></el-icon>
      </el-button>
    </div>

    <div class="toolbar-group">
      <el-button 
        text 
        @click="handleBulletList" 
        title="无序列表"
        :class="{ 'is-active': isBulletList }"
      >
        <el-icon :size="24"><List /></el-icon>
      </el-button>
      <el-button 
        text 
        @click="handleNumberedList" 
        title="有序列表"
        :class="{ 'is-active': isOrderedList }"
      >
        <span style="font-weight: bold;">1.</span>
      </el-button>
      <el-button text @click="handleAlignLeft" title="左对齐">
        <span style="font-size: 14px;">←</span>
      </el-button>
      <el-button text @click="handleAlignCenter" title="居中">
        <span style="font-size: 14px;">↔</span>
      </el-button>
      <el-button text @click="handleAlignRight" title="右对齐">
        <span style="font-size: 14px;">→</span>
      </el-button>
      <el-button text @click="handleAlignJustify" title="两端对齐">
        <span style="font-size: 14px;">⇄</span>
      </el-button>
    </div>

    <div class="toolbar-group">
      <el-button text @click="handleLink" title="链接">
        <el-icon :size="24"><Link /></el-icon>
      </el-button>
      <el-button 
        text 
        @click="handleCode" 
        title="行内代码"
        :class="{ 'is-active': isCode }"
      >
        &lt;/&gt;
      </el-button>
      <el-button text @click="handleImage" title="图片">
        <el-icon :size="24"><Picture /></el-icon>
      </el-button>
      <el-button text @click="handleEmoji" title="表情">
        ☺
      </el-button>
      <el-button text @click="handleTable" title="表格">
        <el-icon :size="24"><Grid /></el-icon>
      </el-button>
    </div>

    <div class="toolbar-group">
      <el-button text @click="handleMore" title="更多">
        <el-icon :size="24"><More /></el-icon>
      </el-button>
      <el-button text @click="handleDocument" title="文档">
        <el-icon :size="24"><Document /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { ElButton, ElIcon } from 'element-plus';
import {
  Document,
  ChatLineSquare,
  List,
  Link,
  Picture,
  Grid,
  More
} from '@element-plus/icons-vue';
import { IconArrowBackUp as ArrowBackUp, IconArrowForwardUp as ArrowForwardUp } from '@tabler/icons-vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  editor: {
    type: Object,
    default: null
  }
});

const handleUndo = () => {
  props.editor?.chain().focus().undo().run();
};

const handleRedo = () => {
  props.editor?.chain().focus().redo().run();
};

const handlePaste = () => {
  // 粘贴功能由浏览器原生支持，这里可以添加自定义处理
  navigator.clipboard.readText().then(text => {
    props.editor?.chain().focus().insertContent(text).run();
  }).catch(() => {
    // 如果剪贴板 API 不可用，使用默认粘贴
    document.execCommand('paste');
  });
};

const handleParagraph = () => {
  props.editor?.chain().focus().setParagraph().run();
};

const handleHeading = () => {
  const level = props.editor?.isActive('heading', { level: 1 }) ? 2 : 1;
  props.editor?.chain().focus().toggleHeading({ level }).run();
};

const handleBold = () => {
  props.editor?.chain().focus().toggleBold().run();
};

const handleItalic = () => {
  props.editor?.chain().focus().toggleItalic().run();
};

const handleUnderline = () => {
  props.editor?.chain().focus().toggleUnderline().run();
};

const handleStrikethrough = () => {
  props.editor?.chain().focus().toggleStrike().run();
};

const handleQuote = () => {
  props.editor?.chain().focus().toggleBlockquote().run();
};

const handleBulletList = () => {
  props.editor?.chain().focus().toggleBulletList().run();
};

const handleNumberedList = () => {
  props.editor?.chain().focus().toggleOrderedList().run();
};

const handleAlignLeft = () => {
  props.editor?.chain().focus().setTextAlign('left').run();
};

const handleAlignCenter = () => {
  props.editor?.chain().focus().setTextAlign('center').run();
};

const handleAlignRight = () => {
  props.editor?.chain().focus().setTextAlign('right').run();
};

const handleAlignJustify = () => {
  props.editor?.chain().focus().setTextAlign('justify').run();
};

const handleLink = () => {
  const url = window.prompt('请输入链接地址:');
  if (url) {
    props.editor?.chain().focus().setLink({ href: url }).run();
  }
};

const handleCode = () => {
  props.editor?.chain().focus().toggleCode().run();
};

const handleImage = () => {
  const url = window.prompt('请输入图片地址:');
  if (url) {
    props.editor?.chain().focus().setImage({ src: url }).run();
  }
};

const handleEmoji = () => {
  // 表情功能可以后续扩展
  console.log('Emoji feature');
};

const handleTable = () => {
  props.editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
};

const handleMore = () => {
  // 更多功能可以后续扩展
  console.log('More features');
};

const handleDocument = () => {
  // 文档功能可以后续扩展
  console.log('Document feature');
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
</script>

<style scoped>
.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #ffffff;
  flex-wrap: wrap;
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
  gap: 4px;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background-color: #e5e7eb;
  margin: 0 4px;
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
</style>

