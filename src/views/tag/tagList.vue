<template>
  <div class="p-5 min-h-screen">
    <!-- 页面标题 -->
    <div class="mb-5 p-5 rounded-lg shadow-sm border" style="border-color: var(--el-border-color);">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">标签管理</h2>
      <p class="text-gray-600 dark:text-gray-400 text-sm">管理网站标签，支持创建、编辑、删除等操作</p>
    </div>

    <!-- 搜索和操作区域 -->
    <div class="mb-5 p-4 rounded-lg shadow-sm border flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4" style="border-color: var(--el-border-color);">
      <div class="flex flex-col sm:flex-row gap-3">
        <el-input
          v-model="searchForm.name"
          placeholder="搜索标签名称"
          clearable
          @input="handleSearch"
          class="w-full sm:w-80"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select
          v-model="searchForm.module"
          placeholder="模块类型"
          clearable
          @change="handleSearch"
          class="w-full sm:w-32"
        >
          <el-option label="全部" value="" />
          <el-option label="通用" :value="0" />
          <el-option label="文章" :value="1" />
        </el-select>

        <el-select
          v-model="searchForm.status"
          placeholder="状态"
          clearable
          @change="handleSearch"
          class="w-full sm:w-32"
        >
          <el-option label="全部" value="" />
          <el-option label="正常" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </div>

      <div class="flex gap-2">
        <el-button type="primary" @click="handleAdd" :icon="Plus">
          新增标签
        </el-button>
        <el-button @click="handleRefresh" :icon="Refresh">
          刷新
        </el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="rounded-lg shadow-sm border" style="border-color: var(--el-border-color);">
      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="标签名称" min-width="150" />
        <el-table-column prop="module" label="模块" width="100">
          <template #default="{ row }">
            <el-tag :type="row.module === 1 ? 'primary' : 'info'">
              {{ row.module === 1 ? '文章' : '通用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column prop="updated_at" label="更新时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)" :icon="Edit">
              编辑
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="handleDelete(row)" 
              :icon="Delete"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="p-4 flex justify-between items-center">
        <div class="text-sm text-gray-500">
          共 {{ total }} 条记录
        </div>
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.page_size"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑标签' : '新增标签'"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="标签名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入标签名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="模块类型" prop="module">
          <el-select v-model="formData.module" placeholder="请选择模块类型" style="width: 100%">
            <el-option label="通用" :value="0" />
            <el-option label="文章" :value="1" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleDialogClose">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus';
import { Search, Plus, Refresh, Edit, Delete } from '@element-plus/icons-vue';
import { 
  getTagList, 
  createTag, 
  updateTag, 
  deleteTag,
  type Tag,
  type TagListParams,
  type CreateTagParams,
  type UpdateTagParams
} from '../../api/tag';

// 响应式数据
const loading = ref(false);
const submitLoading = ref(false);
const tableData = ref<Tag[]>([]);
const total = ref(0);
const selectedRows = ref<Tag[]>([]);

// 搜索表单
const searchForm = reactive<TagListParams>({
  name: '',
  module: undefined,
  status: undefined
});

// 分页
const pagination = reactive({
  page: 1,
  page_size: 10
});

// 对话框相关
const dialogVisible = ref(false);
const isEdit = ref(false);
const formRef = ref<FormInstance>();
const formData = reactive<CreateTagParams & { id?: number }>({
  name: '',
  module: 1,
  status: 1
});

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入标签名称', trigger: 'blur' },
    { min: 1, max: 50, message: '标签名称长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  module: [
    { required: true, message: '请选择模块类型', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
};

// 获取标签列表
const fetchTagList = async () => {
  try {
    loading.value = true;
    const params: TagListParams = {
      page: pagination.page,
      page_size: pagination.page_size,
      ...searchForm
    };
    
    const response = await getTagList(params);
    tableData.value = response.data.list;
    total.value = response.data.total;
  } catch (error) {
    console.error('获取标签列表失败:', error);
    ElMessage.error('获取标签列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索处理
const handleSearch = () => {
  pagination.page = 1;
  fetchTagList();
};

// 刷新
const handleRefresh = () => {
  fetchTagList();
};

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.page_size = size;
  pagination.page = 1;
  fetchTagList();
};

const handleCurrentChange = (page: number) => {
  pagination.page = page;
  fetchTagList();
};

// 选择处理
const handleSelectionChange = (selection: Tag[]) => {
  selectedRows.value = selection;
};

// 新增标签
const handleAdd = () => {
  isEdit.value = false;
  dialogVisible.value = true;
  resetForm();
};

// 编辑标签
const handleEdit = (row: Tag) => {
  isEdit.value = true;
  dialogVisible.value = true;
  formData.id = row.id;
  formData.name = row.name;
  formData.module = row.module;
  formData.status = row.status;
};

// 删除标签
const handleDelete = async (row: Tag) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除标签 "${row.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await deleteTag(row.id);
    ElMessage.success('删除成功');
    fetchTagList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除标签失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 对话框关闭
const handleDialogClose = () => {
  dialogVisible.value = false;
  resetForm();
};

// 重置表单
const resetForm = () => {
  formData.id = undefined;
  formData.name = '';
  formData.module = 1;
  formData.status = 1;
  formRef.value?.clearValidate();
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    submitLoading.value = true;
    
    if (isEdit.value) {
      await updateTag(formData.id!, formData as UpdateTagParams);
      ElMessage.success('更新成功');
    } else {
      await createTag(formData as CreateTagParams);
      ElMessage.success('创建成功');
    }
    
    dialogVisible.value = false;
    fetchTagList();
  } catch (error) {
    console.error('提交失败:', error);
    ElMessage.error(isEdit.value ? '更新失败' : '创建失败');
  } finally {
    submitLoading.value = false;
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchTagList();
});
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

