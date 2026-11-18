<template>
  <div class="tiptap-editor-wrapper" ref="editorWrapperRef">
    <EditorContent :editor="editor" class="tiptap-editor" />
    
    <!-- 表格悬浮工具栏 -->
    <div 
      v-if="showTableToolbar && tablePosition"
      class="table-toolbar"
      :style="{
        top: tablePosition.top + 'px',
        left: tablePosition.left + 'px'
      }"
    >
      <div class="table-toolbar-group">
        <el-button 
          text 
          size="small"
          @click="handleAddColumnBefore"
          title="在左侧添加列"
        >
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <el-button 
          text 
          size="small"
          @click="handleAddColumnAfter"
          title="在右侧添加列"
        >
          <el-icon><ArrowRight /></el-icon>
        </el-button>
        <el-button 
          text 
          size="small"
          @click="handleDeleteColumn"
          :disabled="!canDeleteColumn"
          title="删除列"
        >
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
      <div class="table-toolbar-divider"></div>
      <div class="table-toolbar-group">
        <el-button 
          text 
          size="small"
          @click="handleAddRowBefore"
          title="在上方添加行"
        >
          <el-icon><ArrowUp /></el-icon>
        </el-button>
        <el-button 
          text 
          size="small"
          @click="handleAddRowAfter"
          title="在下方添加行"
        >
          <el-icon><ArrowDown /></el-icon>
        </el-button>
        <el-button 
          text 
          size="small"
          @click="handleDeleteRow"
          :disabled="!canDeleteRow"
          title="删除行"
        >
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch, onMounted, nextTick, ref, computed, onUnmounted } from 'vue';
import { ElButton, ElIcon } from 'element-plus';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Delete } from '@element-plus/icons-vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import TextAlign from '@tiptap/extension-text-align';
import Strike from '@tiptap/extension-strike';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'editor-ready']);

const editorWrapperRef = ref(null);
const showTableToolbar = ref(false);
const tablePosition = ref(null);

// 获取表格节点
const getTableNode = (selection) => {
  if (!editor.value) return null;
  const { state } = editor.value;
  const { $anchor } = selection;
  let depth = $anchor.depth;
  while (depth > 0) {
    const node = $anchor.node(depth);
    if (node.type.name === 'table') {
      return node;
    }
    depth--;
  }
  return null;
};

// 检查是否可以删除列/行
const canDeleteColumn = computed(() => {
  if (!editor.value) return false;
  const { state } = editor.value;
  const { selection } = state;
  const table = getTableNode(selection);
  if (!table) return false;
  // 检查第一行（表头或第一行）的列数
  const firstRow = table.firstChild;
  return firstRow && firstRow.childCount > 1;
});

const canDeleteRow = computed(() => {
  if (!editor.value) return false;
  const { state } = editor.value;
  const { selection } = state;
  const table = getTableNode(selection);
  if (!table) return false;
  return table.childCount > 1;
});

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5, 6]
      },
      bulletList: {
        keepMarks: true,
        keepAttributes: false
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false
      },
      // 禁用 StarterKit 中已包含的扩展，我们将单独配置它们
      link: false,
      code: false,
      codeBlock: false,
      strike: false,
      underline: false,
      table: false
    }),
    Underline,
    Strike,
    Code,
    CodeBlock,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'editor-link'
      }
    }),
    Image.configure({
      HTMLAttributes: {
        class: 'editor-image'
      }
    }),
    Table.configure({
      resizable: true,
      HTMLAttributes: {
        class: 'editor-table'
      }
    }),
    TableRow,
    TableHeader,
    TableCell,
    TextAlign.configure({
      types: ['heading', 'paragraph']
    })
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML());
    updateTableToolbar();
  },
  onSelectionUpdate: () => {
    updateTableToolbar();
  },
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      spellcheck: 'false'
    }
  }
});

// 监听外部内容变化
watch(() => props.modelValue, (newValue) => {
  if (!editor.value) return;
  const isSame = editor.value.getHTML() === newValue;
  if (!isSame) {
    editor.value.commands.setContent(newValue || '', false);
  }
}, { deep: true });

// 暴露编辑器实例供父组件使用
defineExpose({
  editor
});

// 更新表格工具栏位置和显示状态
const updateTableToolbar = () => {
  if (!editor.value || !editorWrapperRef.value) {
    showTableToolbar.value = false;
    return;
  }

  const { state } = editor.value;
  const { selection } = state;
  
  // 检查是否在表格内
  const table = getTableNode(selection);
  if (!table) {
    showTableToolbar.value = false;
    return;
  }

  // 获取当前选中的单元格
  const { $anchor } = selection;
  let cell = null;
  let cellDepth = 0;
  let depth = $anchor.depth;
  while (depth > 0) {
    const node = $anchor.node(depth);
    if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
      cell = node;
      cellDepth = depth;
      break;
    }
    depth--;
  }
  
  if (!cell) {
    showTableToolbar.value = false;
    return;
  }

  // 获取单元格的 DOM 元素
  const cellPos = $anchor.before(cellDepth);
  const cellDOM = editor.value.view.nodeDOM(cellPos);
  
  if (!cellDOM || !(cellDOM instanceof HTMLElement)) {
    showTableToolbar.value = false;
    return;
  }

  // 获取表格的 DOM 元素
  let tableDOM = cellDOM.closest('table');
  if (!tableDOM) {
    // 可能在 tableWrapper 中
    const tableWrapper = cellDOM.closest('.tableWrapper');
    if (tableWrapper) {
      tableDOM = tableWrapper.querySelector('table');
    }
  }

  if (!tableDOM) {
    showTableToolbar.value = false;
    return;
  }

  // 计算工具栏位置（显示在表格上方）
  const editorRect = editorWrapperRef.value.getBoundingClientRect();
  const tableRect = tableDOM.getBoundingClientRect();
  
  tablePosition.value = {
    top: tableRect.top - editorRect.top - 50, // 表格上方 50px
    left: tableRect.left - editorRect.left + (tableRect.width / 2) - 120 // 居中，工具栏宽度约 240px
  };

  showTableToolbar.value = true;
};

// 表格操作函数
const handleAddColumnBefore = () => {
  if (!editor.value) return;
  editor.value.commands.focus();
  editor.value.commands.addColumnBefore();
};

const handleAddColumnAfter = () => {
  if (!editor.value) return;
  editor.value.commands.focus();
  editor.value.commands.addColumnAfter();
};

const handleDeleteColumn = () => {
  if (!editor.value || !canDeleteColumn.value) return;
  editor.value.commands.focus();
  editor.value.commands.deleteColumn();
};

const handleAddRowBefore = () => {
  if (!editor.value) return;
  editor.value.commands.focus();
  editor.value.commands.addRowBefore();
};

const handleAddRowAfter = () => {
  if (!editor.value) return;
  editor.value.commands.focus();
  editor.value.commands.addRowAfter();
};

const handleDeleteRow = () => {
  if (!editor.value || !canDeleteRow.value) return;
  editor.value.commands.focus();
  editor.value.commands.deleteRow();
};

// 确保编辑器在挂载后可用，并通知父组件
onMounted(() => {
  nextTick(() => {
    if (editor.value) {
      emit('editor-ready', editor.value);
      // 初始检查表格工具栏
      updateTableToolbar();
    } else {
      // 如果编辑器还没初始化，等待一下再试
      setTimeout(() => {
        if (editor.value) {
          emit('editor-ready', editor.value);
          updateTableToolbar();
        }
      }, 100);
    }
  });

  // 监听滚动，更新工具栏位置
  const handleScroll = () => {
    if (showTableToolbar.value) {
      updateTableToolbar();
    }
  };

  window.addEventListener('scroll', handleScroll, true);
  
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll, true);
  });
});
</script>

<style scoped>
.tiptap-editor-wrapper {
  position: relative;
  width: 100%;
  min-height: 500px;
  flex: 1;
  background-color: transparent;
}

.tiptap-editor {
  width: 100%;
  min-height: 500px;
  padding: 0;
  background-color: transparent;
}

/* Tiptap 编辑器样式 */
:deep(.ProseMirror) {
  outline: none;
  min-height: 500px;
  padding: 0;
  color: var(--el-text-color-primary);
  font-size: 16px;
  line-height: 1.8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

:deep(.ProseMirror:focus) {
  outline: none;
}

:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  color: var(--el-text-color-placeholder);
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

/* 链接样式 */
:deep(.editor-link) {
  color: var(--el-color-primary);
  text-decoration: underline;
  cursor: pointer;
}

:deep(.editor-link:hover) {
  color: var(--el-color-primary-light-3);
}

/* 图片样式 */
:deep(.editor-image) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1rem auto;
}

/* 表格包装器样式 */
:deep(.tableWrapper) {
  overflow-x: auto;
  margin: 1rem 0;
}

:deep(.tableWrapper table) {
  width: 100%;
}

/* 表格样式 */
:deep(.editor-table),
:deep(.tableWrapper table) {
  border-collapse: collapse;
  margin: 0;
  table-layout: fixed;
  width: 100%;
  border: 1px solid var(--el-border-color);
}

:deep(.editor-table tr),
:deep(.tableWrapper table tr) {
  border-bottom: 1px solid var(--el-border-color);
}

:deep(.editor-table tr:last-child),
:deep(.tableWrapper table tr:last-child) {
  border-bottom: none;
}

:deep(.editor-table td),
:deep(.editor-table th),
:deep(.tableWrapper table td),
:deep(.tableWrapper table th) {
  min-width: 1em;
  border-right: 1px solid var(--el-border-color);
  border-left: 1px solid var(--el-border-color);
  padding: 8px 12px;
  vertical-align: top;
  box-sizing: border-box;
  position: relative;
}

:deep(.editor-table td:last-child),
:deep(.editor-table th:last-child),
:deep(.tableWrapper table td:last-child),
:deep(.tableWrapper table th:last-child) {
  border-right: none;
}

:deep(.editor-table th),
:deep(.tableWrapper table th) {
  font-weight: bold;
  text-align: left;
  background-color: var(--el-fill-color-light);
  border-bottom: 2px solid var(--el-border-color);
}

:deep(.editor-table td),
:deep(.tableWrapper table td) {
  border-top: 1px solid var(--el-border-color);
}

:deep(.editor-table .selectedCell:after),
:deep(.tableWrapper table .selectedCell:after) {
  z-index: 2;
  position: absolute;
  content: '';
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(200, 200, 255, 0.4);
  pointer-events: none;
}

/* Dark 模式表格样式 */
.dark :deep(.editor-table),
.dark :deep(.tableWrapper table) {
  border-color: #404040;
}

.dark :deep(.editor-table tr),
.dark :deep(.tableWrapper table tr) {
  border-bottom-color: #404040;
}

.dark :deep(.editor-table td),
.dark :deep(.editor-table th),
.dark :deep(.tableWrapper table td),
.dark :deep(.tableWrapper table th) {
  border-right-color: #404040;
  border-left-color: #404040;
}

.dark :deep(.editor-table th),
.dark :deep(.tableWrapper table th) {
  border-bottom-color: #404040;
  background-color: #2a2a2a;
}

.dark :deep(.editor-table td),
.dark :deep(.tableWrapper table td) {
  border-top-color: #404040;
}

/* 代码块样式 */
:deep(pre) {
  background: var(--el-fill-color-light);
  border-radius: 4px;
  padding: 1rem;
  margin: 1rem 0;
  overflow-x: auto;
}

:deep(code) {
  background: var(--el-fill-color-light);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
}

:deep(pre code) {
  background: none;
  padding: 0;
}

/* 引用样式 */
:deep(blockquote) {
  border-left: 4px solid var(--el-border-color);
  padding-left: 1rem;
  margin: 1rem 0;
  color: var(--el-text-color-regular);
  font-style: italic;
}

.dark :deep(blockquote) {
  border-left-color: #404040;
}

/* 无序列表样式 */
:deep(ul) {
  margin: 1rem 0;
  padding-left: 2rem;
  list-style-type: disc;
}

:deep(ul li) {
  margin: 0.5rem 0;
  padding-left: 0.5rem;
}

:deep(ul li p) {
  margin: 0;
}

/* 有序列表样式 */
:deep(ol) {
  margin: 1rem 0;
  padding-left: 2rem;
  list-style-type: decimal;
}

:deep(ol li) {
  margin: 0.5rem 0;
  padding-left: 0.5rem;
}

:deep(ol li p) {
  margin: 0;
}

/* 列表嵌套样式 */
:deep(ul ul),
:deep(ol ol),
:deep(ul ol),
:deep(ol ul) {
  margin: 0.5rem 0;
}

/* 段落样式 */
:deep(p) {
  margin: 1rem 0;
}

:deep(p:first-child) {
  margin-top: 0;
}

:deep(p:last-child) {
  margin-bottom: 0;
}

/* 表格悬浮工具栏样式 */
.table-toolbar {
  position: absolute;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  background-color: #ffffff;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transform: translateX(-50%);
}

.dark .table-toolbar {
  background-color: #2d2d2d;
  border-color: #404040;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.table-toolbar-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.table-toolbar-divider {
  width: 1px;
  height: 20px;
  background-color: var(--el-border-color);
  margin: 0 4px;
}

.dark .table-toolbar-divider {
  background-color: #404040;
}

.table-toolbar :deep(.el-button) {
  padding: 4px 8px;
  min-height: auto;
}

.table-toolbar :deep(.el-button.is-disabled) {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>

