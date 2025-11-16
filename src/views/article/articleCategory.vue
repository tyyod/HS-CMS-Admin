<template>
  <div class="p-5 min-h-screen">
    <!-- 页面标题 -->
    <div class="mb-5 p-5 rounded-lg shadow-sm border" style="border-color: var(--el-border-color);">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">文章分类管理</h2>
      <p class="text-gray-600 dark:text-gray-400 text-sm">管理文章分类，支持新增、编辑、删除等操作</p>
    </div>

    <!-- 搜索和操作区域 -->
    <div class="mb-5 p-4 rounded-lg shadow-sm border flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4" style="border-color: var(--el-border-color);">
      <div class="flex flex-col sm:flex-row gap-3">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索分类名称"
          clearable
          @input="handleSearch"
          class="w-full sm:w-80"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select
          v-model="searchForm.status"
          placeholder="分类状态"
          clearable
          @change="handleSearch"
          class="w-full sm:w-32"
        >
          <el-option label="全部" value="" />
          <el-option label="正常" value="1" />
          <el-option label="禁用" value="0" />
        </el-select>
      </div>

      <div class="flex gap-2">
        <el-button type="primary" @click="handleAdd" :icon="Plus">
          新增分类
        </el-button>
        <el-button @click="handleRefresh" :icon="Refresh" :loading="loading">
          刷新
        </el-button>
      </div>
    </div>

    <!-- 分类列表 -->
    <div class="rounded-lg shadow-sm border overflow-hidden" style="border-color: var(--el-border-color);">
      <el-table
        :data="categoryList"
        v-loading="loading"
        stripe
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="id" label="分类ID" width="80" />
        
        <el-table-column prop="name" label="分类名称" min-width="200">
          <template #default="{ row }">
            <span class="font-medium">{{ row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="created_at" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="280" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex flex-wrap justify-center gap-1">
              <el-button
                type="primary"
                size="small"
                @click="handleEdit(row)"
                :icon="Edit"
              >
                编辑
              </el-button>
              <el-button
                type="success"
                size="small"
                @click="handleToggleStatus(row)"
                :icon="row.status === 1 ? Hide : View"
              >
                {{ row.status === 1 ? '禁用' : '启用' }}
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleDelete(row)"
                :icon="Delete"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex justify-center p-4 border-t" style="border-color: var(--el-border-color);">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 批量操作 -->
    <div v-if="selectedCategories.length > 0" class="fixed bottom-5 left-1/2 transform -translate-x-1/2 flex items-center gap-3 px-5 py-3 text-white rounded-lg shadow-lg z-50">
      <span class="text-sm">已选择 {{ selectedCategories.length }} 个分类</span>
      <el-button type="danger" @click="handleBatchDelete" :icon="Delete" size="small">
        批量删除
      </el-button>
      <el-button type="success" @click="handleBatchToggleStatus" :icon="Check" size="small">
        批量启用
      </el-button>
    </div>

    <!-- 新增分类弹窗 -->
    <el-dialog
      v-model="addDialogVisible"
      title="新增分类"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-width="80px"
        @submit.prevent
      >
        <el-form-item label="分类名称" prop="name">
          <el-input
            v-model="addForm.name"
            placeholder="请输入分类名称"
            maxlength="32"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="排序" prop="sort">
          <el-input-number
            v-model="addForm.sort"
            :min="0"
            :max="999"
            placeholder="请输入排序值"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="addForm.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <!-- 错误信息显示 -->
      <div v-if="addFormError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
        <div class="flex items-center">
          <el-icon class="text-red-500 mr-2"><Warning /></el-icon>
          <span class="text-red-700 text-sm">{{ addFormError }}</span>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancelAdd">取消</el-button>
          <el-button type="primary" @click="handleSaveAdd" :loading="addFormSaving">
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { 
  Search, 
  Plus, 
  Refresh, 
  Edit, 
  Delete, 
  Check,
  View,
  Hide,
  Warning
} from '@element-plus/icons-vue'
import { 
  getCategoryList, 
  createCategory,
  updateCategory, 
  deleteCategory, 
  batchDeleteCategories, 
  batchUpdateCategoryStatus,
  type ArticleCategory,
  type CategoryListParams,
  type CreateCategoryParams
} from '../../api/article'

// 接口定义
interface SearchForm {
  keyword: string
  status: string
}

interface Pagination {
  currentPage: number
  pageSize: number
  total: number
}

// 响应式数据
const loading = ref(false)
const categoryList = ref<ArticleCategory[]>([])
const selectedCategories = ref<ArticleCategory[]>([])

const searchForm = reactive<SearchForm>({
  keyword: '',
  status: ''
})

const pagination = reactive<Pagination>({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 新增分类弹窗相关
const addDialogVisible = ref(false)
const addFormSaving = ref(false)
const addFormError = ref('')
const addFormRef = ref()

const addForm = reactive<CreateCategoryParams>({
  name: '',
  sort: 0,
  status: 1
})

const addFormRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 32, message: '分类名称长度在1到32个字符', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序值', trigger: 'blur' },
    { type: 'number', min: 0, max: 999, message: '排序值必须在0-999之间', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 计算属性
const getStatusType = (status: number) => {
  return status === 1 ? 'success' : 'danger'
}

const getStatusName = (status: number) => {
  return status === 1 ? '正常' : '禁用'
}

// 方法
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const loadCategoryList = async () => {
  loading.value = true
  try {
    const params: CategoryListParams = {
      page: pagination.currentPage,
      page_size: pagination.pageSize,
      name: searchForm.keyword || undefined,
      status: searchForm.status ? Number(searchForm.status) : undefined
    }
    
    const response = await getCategoryList(params)
    categoryList.value = response.data.list
    pagination.total = response.data.total
  } catch (error) {
    ElMessage.error('加载分类列表失败')
    console.error('加载分类列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadCategoryList()
}

const handleRefresh = () => {
  loadCategoryList()
}

const handleAdd = () => {
  // 重置表单
  addForm.name = ''
  addForm.sort = 0
  addForm.status = 1
  addFormError.value = ''
  
  // 打开弹窗
  addDialogVisible.value = true
}

const handleEdit = (row: ArticleCategory) => {
  ElMessage.info(`编辑分类: ${row.name}`)
  // TODO: 打开编辑分类弹窗或跳转到编辑分类页面
}

const handleToggleStatus = async (row: ArticleCategory) => {
  const action = row.status === 1 ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(
      `确定要${action}分类"${row.name}"吗？`,
      `${action}确认`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    const newStatus = row.status === 1 ? 0 : 1
    await updateCategory(row.id, {
      name: row.name,
      sort: 0, // 保持原有排序
      status: newStatus
    })
    
    ElMessage.success(`${action}成功`)
    loadCategoryList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${action}失败`)
      console.error(`${action}失败:`, error)
    }
  }
}

const handleDelete = async (row: ArticleCategory) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除分类"${row.name}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteCategory(row.id)
    ElMessage.success('删除成功')
    loadCategoryList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('删除失败:', error)
    }
  }
}

const handleSelectionChange = (selection: ArticleCategory[]) => {
  selectedCategories.value = selection
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadCategoryList()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  loadCategoryList()
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedCategories.value.length} 个分类吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const ids = selectedCategories.value.map(item => item.id)
    await batchDeleteCategories(ids)
    ElMessage.success('批量删除成功')
    selectedCategories.value = []
    loadCategoryList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
      console.error('批量删除失败:', error)
    }
  }
}

const handleBatchToggleStatus = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要启用选中的 ${selectedCategories.value.length} 个分类吗？`,
      '批量启用确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    const ids = selectedCategories.value.map(item => item.id)
    await batchUpdateCategoryStatus(ids, 1)
    ElMessage.success('批量启用成功')
    selectedCategories.value = []
    loadCategoryList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量启用失败')
      console.error('批量启用失败:', error)
    }
  }
}

// 新增分类相关处理函数
const handleSaveAdd = async () => {
  try {
    // 清除之前的错误信息
    addFormError.value = ''
    
    // 表单验证
    await addFormRef.value?.validate()
    
    // 开始保存
    addFormSaving.value = true
    
    // 调用API创建分类
    await createCategory(addForm)
    
    // 保存成功 - 先关闭弹窗
    addDialogVisible.value = false
    
    // 显示成功通知
    ElNotification({
      title: '创建成功',
      message: `分类"${addForm.name}"创建成功`,
      type: 'success',
      duration: 3000
    })
    
    // 刷新列表
    loadCategoryList()
    
  } catch (error: any) {
    // 处理错误
    if (error?.data?.msg) {
      addFormError.value = error.data.msg
    } else if (error?.message) {
      addFormError.value = error.message
    } else {
      addFormError.value = '保存失败，请重试'
    }
    console.error('创建分类失败:', error)
  } finally {
    addFormSaving.value = false
  }
}

const handleCancelAdd = () => {
  addDialogVisible.value = false
  addFormError.value = ''
}

// 生命周期
onMounted(() => {
  loadCategoryList()
})
</script>

<style scoped>
/* 使用Tailwind CSS，无需自定义样式 */
</style>
