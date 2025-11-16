<template>
  <div class="tiptap-editor-wrapper">
    <EditorContent :editor="editor" class="tiptap-editor" />
  </div>
</template>

<script setup>
import { watch } from 'vue';
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

const emit = defineEmits(['update:modelValue']);

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
      underline: false
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
</script>

<style scoped>
.tiptap-editor-wrapper {
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

/* 表格样式 */
:deep(.editor-table) {
  border-collapse: collapse;
  margin: 1rem 0;
  table-layout: fixed;
  width: 100%;
}

:deep(.editor-table td),
:deep(.editor-table th) {
  min-width: 1em;
  border: 1px solid var(--el-border-color);
  padding: 8px;
  vertical-align: top;
  box-sizing: border-box;
  position: relative;
}

:deep(.editor-table th) {
  font-weight: bold;
  text-align: left;
  background-color: var(--el-fill-color-light);
}

:deep(.editor-table .selectedCell:after) {
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
</style>

