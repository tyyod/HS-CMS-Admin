<template>
  <div class="p-5 min-h-screen">
    <!-- 页面标题 -->
    <div class="mb-5 p-5 rounded-lg shadow-sm border" style="border-color: var(--el-border-color);">
      <h2 class="text-2xl font-semibold mb-2">文章作者管理</h2>
      <p class="text-sm">管理文章作者，支持新增、编辑、删除等操作</p>
    </div>

    <!-- 搜索和操作区域 -->
    <div class="mb-5 p-4 rounded-lg shadow-sm border flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4" style="border-color: var(--el-border-color);">
      <div class="flex flex-col sm:flex-row gap-3">
        <el-input
          v-model="searchForm.name"
          placeholder="搜索作者名称"
          clearable
          @input="handleSearch"
          class="w-full sm:w-80"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select
          v-model="searchForm.author_type"
          placeholder="作者类型"
          clearable
          @change="handleSearch"
          class="w-full sm:w-40"
        >
          <el-option label="全部" value="" />
          <el-option label="站内用户" :value="1" />
          <el-option label="站外作者" :value="2" />
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
          新增作者
        </el-button>
        <el-button @click="handleRefresh" :icon="Refresh" :loading="loading">
          刷新
        </el-button>
      </div>
    </div>

    <!-- 作者列表 -->
    <div class="rounded-lg shadow-sm border overflow-hidden" style="border-color: var(--el-border-color);">
      <el-table
        :data="authorList"
        v-loading="loading"
        stripe
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="id" label="作者ID" width="80" />
        
        <el-table-column label="头像" width="80" align="center">
          <template #default="{ row }">
            <el-avatar
              :src="row.avatar || ''"
              :size="50"
              shape="circle"
            >
              <el-icon><User /></el-icon>
            </el-avatar>
          </template>
        </el-table-column>

        <el-table-column prop="name" label="作者名称" min-width="150">
          <template #default="{ row }">
            <span class="font-medium">{{ row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="author_type" label="作者类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.author_type === 1 ? 'primary' : 'info'">
              {{ row.author_type === 1 ? '站内用户' : '站外作者' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="user_id" label="用户ID" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.user_id">{{ row.user_id }}</span>
            <span v-else class="text-gray-400">-</span>
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

    <!-- 新增/编辑作者弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑作者' : '新增作者'"
      width="600px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        @submit.prevent
      >
        <el-form-item label="作者名称" prop="name">
          <el-input
            v-model="formData.name"
            placeholder="请输入作者名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="头像URL" prop="avatar">
          <el-input
            v-model="formData.avatar"
            placeholder="请输入头像URL（可选，https://...）"
            clearable
          >
            <template #append>
              <el-button @click="previewAvatar" :disabled="!formData.avatar">预览</el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item v-if="formData.avatar" label="头像预览">
          <el-avatar
            :src="formData.avatar"
            :size="80"
            shape="circle"
          >
            <el-icon><User /></el-icon>
          </el-avatar>
        </el-form-item>
        
        <el-form-item label="作者类型" prop="author_type">
          <el-radio-group v-model="formData.author_type">
            <el-radio :value="1">站内用户</el-radio>
            <el-radio :value="2">站外作者</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item 
          v-if="formData.author_type === 1" 
          label="用户ID" 
          prop="user_id"
        >
          <el-input-number
            v-model="formData.user_id"
            :min="1"
            placeholder="请输入站内用户ID"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <!-- 错误信息显示 -->
      <div v-if="formError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
        <div class="flex items-center">
          <el-icon class="text-red-500 mr-2"><Warning /></el-icon>
          <span class="text-red-700 text-sm">{{ formError }}</span>
        </div>
      </div>
      
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElNotification, type FormInstance } from 'element-plus'
import { 
  Search, 
  Plus, 
  Refresh, 
  Edit, 
  Delete, 
  View,
  Hide,
  Warning,
  User
} from '@element-plus/icons-vue'
import { 
  getAuthorList, 
  createAuthor,
  updateAuthor, 
  deleteAuthor, 
  type Author,
  type AuthorListParams,
  type CreateAuthorParams,
  type UpdateAuthorParams
} from '../../api/author'

// 接口定义
interface SearchForm {
  name: string
  author_type: string | number
  status: string | number
}

interface Pagination {
  currentPage: number
  pageSize: number
  total: number
}

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const authorList = ref<Author[]>([])

const searchForm = reactive<SearchForm>({
  name: '',
  author_type: '',
  status: ''
})

const pagination = reactive<Pagination>({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 对话框相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const formError = ref('')

const formData = reactive<CreateAuthorParams & { id?: number }>({
  name: '',
  avatar: '',
  user_id: undefined,
  author_type: 1,
  status: 1
})

const formRules = {
  name: [
    { required: true, message: '请输入作者名称', trigger: 'blur' },
    { min: 1, max: 50, message: '作者名称长度在1到50个字符', trigger: 'blur' }
  ],
  avatar: [
    { 
      validator: (_rule: any, value: any, callback: any) => {
        if (value && value.trim() !== '') {
          // 如果填写了头像URL，则验证是否为有效的URL
          const urlPattern = /^https?:\/\/.+/
          if (!urlPattern.test(value)) {
            callback(new Error('请输入有效的URL地址（以http://或https://开头）'))
          } else {
            callback()
          }
        } else {
          // 头像为空时，验证通过
          callback()
        }
      },
      trigger: 'blur' 
    }
  ],
  author_type: [
    { required: true, message: '请选择作者类型', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  user_id: [
    { 
      validator: (_rule: any, value: any, callback: any) => {
        if (formData.author_type === 1 && !value) {
          callback(new Error('站内用户类型必须填写用户ID'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
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

const loadAuthorList = async () => {
  loading.value = true
  try {
    const params: AuthorListParams = {
      page: pagination.currentPage,
      page_size: pagination.pageSize,
      name: searchForm.name || undefined,
      author_type: searchForm.author_type ? Number(searchForm.author_type) : undefined,
      status: searchForm.status ? Number(searchForm.status) : undefined
    }
    
    const response = await getAuthorList(params)
    authorList.value = response.data.list
    pagination.total = response.data.total
  } catch (error) {
    ElMessage.error('加载作者列表失败')
    console.error('加载作者列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadAuthorList()
}

const handleRefresh = () => {
  loadAuthorList()
}

const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: Author) => {
  isEdit.value = true
  formData.id = row.id
  formData.name = row.name
  formData.avatar = row.avatar
  formData.user_id = row.user_id
  formData.author_type = row.author_type
  formData.status = row.status
  formError.value = ''
  dialogVisible.value = true
}

const handleToggleStatus = async (row: Author) => {
  const action = row.status === 1 ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(
      `确定要${action}作者"${row.name}"吗？`,
      `${action}确认`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    const newStatus = row.status === 1 ? 0 : 1
    await updateAuthor(row.id, {
      name: row.name,
      avatar: row.avatar,
      user_id: row.user_id,
      author_type: row.author_type,
      status: newStatus
    })
    
    ElMessage.success(`${action}成功`)
    loadAuthorList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${action}失败`)
      console.error(`${action}失败:`, error)
    }
  }
}

const handleDelete = async (row: Author) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除作者"${row.name}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteAuthor(row.id)
    ElMessage.success('删除成功')
    loadAuthorList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('删除失败:', error)
    }
  }
}

const handleSelectionChange = (selection: Author[]) => {
  // 可以在这里实现批量操作功能
  console.log('选中的作者:', selection)
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadAuthorList()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  loadAuthorList()
}

const handleDialogClose = () => {
  dialogVisible.value = false
  resetForm()
}

const resetForm = () => {
  formData.id = undefined
  formData.name = ''
  formData.avatar = ''
  formData.user_id = undefined
  formData.author_type = 1
  formData.status = 1
  formError.value = ''
  formRef.value?.clearValidate()
}

const previewAvatar = () => {
  if (formData.avatar) {
    // 头像预览已经在模板中实现了，这里可以添加额外的预览逻辑
    console.log('预览头像:', formData.avatar)
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    // 清除之前的错误信息
    formError.value = ''
    
    // 表单验证
    await formRef.value.validate()
    
    // 开始保存
    submitLoading.value = true
    
    // 准备提交数据，站外作者时确保 user_id 为 undefined
    const submitData: CreateAuthorParams | UpdateAuthorParams = {
      name: formData.name,
      avatar: formData.avatar?.trim() || '',
      author_type: formData.author_type,
      status: formData.status,
      user_id: formData.author_type === 1 ? formData.user_id : undefined
    }
    
    if (isEdit.value) {
      // 更新作者
      await updateAuthor(formData.id!, submitData as UpdateAuthorParams)
      ElNotification({
        title: '更新成功',
        message: `作者"${formData.name}"更新成功`,
        type: 'success',
        duration: 3000
      })
    } else {
      // 创建作者
      await createAuthor(submitData as CreateAuthorParams)
      ElNotification({
        title: '创建成功',
        message: `作者"${formData.name}"创建成功`,
        type: 'success',
        duration: 3000
      })
    }
    
    // 关闭弹窗并刷新列表
    dialogVisible.value = false
    loadAuthorList()
    
  } catch (error: any) {
    // 处理错误
    if (error?.data?.msg) {
      formError.value = error.data.msg
    } else if (error?.message) {
      formError.value = error.message
    } else {
      formError.value = isEdit.value ? '更新失败，请重试' : '创建失败，请重试'
    }
    console.error(isEdit.value ? '更新作者失败:' : '创建作者失败:', error)
  } finally {
    submitLoading.value = false
  }
}

// 生命周期
onMounted(() => {
  loadAuthorList()
})
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

