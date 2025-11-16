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
      <el-button text @click="handleTable" title="表格">
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
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { ElButton, ElIcon, ElDropdown, ElDropdownMenu, ElDropdownItem, ElDialog } from 'element-plus';
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
  props.editor?.chain().focus().undo().run();
};

const handleRedo = () => {
  props.editor?.chain().focus().redo().run();
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

const handleListCommand = (command) => {
  if (command === 'bullet') {
    props.editor?.chain().focus().toggleBulletList().run();
  } else if (command === 'ordered') {
    props.editor?.chain().focus().toggleOrderedList().run();
  }
};

const handleLink = () => {
  const url = window.prompt('请输入链接地址:');
  if (url) {
    props.editor?.chain().focus().setLink({ href: url }).run();
  }
};

const handleCodeCommand = (command) => {
  if (command === 'inline') {
    props.editor?.chain().focus().toggleCode().run();
  } else if (command === 'block') {
    props.editor?.chain().focus().toggleCodeBlock().run();
  }
};

const handleImage = () => {
  const url = window.prompt('请输入图片地址:');
  if (url) {
    props.editor?.chain().focus().setImage({ src: url }).run();
  }
};

const emojiDialogVisible = ref(false);

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
  props.editor?.chain().focus().insertContent(emoji).run();
  emojiDialogVisible.value = false;
};

const handleTable = () => {
  props.editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
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
</style>

