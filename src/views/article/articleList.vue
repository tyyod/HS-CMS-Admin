<template>
  <div class="p-5 min-h-screen">
    <!-- 页面标题 -->
    <div class="mb-5 p-5 rounded-lg shadow-sm border" style="border-color: var(--el-border-color);">
      <h2 class="text-2xl font-semibold mb-2">文章管理</h2>
      <p class="text-sm">管理网站文章内容，支持发布、编辑、删除等操作</p>
    </div>

    <!-- 搜索和操作区域 -->
    <div class="mb-5 p-4 rounded-lg shadow-sm border flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4" style="border-color: var(--el-border-color);">
      <div class="flex flex-col sm:flex-row gap-3">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索文章标题或内容"
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
          placeholder="文章状态"
          clearable
          @change="handleSearch"
          class="w-full sm:w-32"
        >
          <el-option label="全部" value="" />
          <el-option label="已发布" value="published" />
          <el-option label="草稿" value="draft" />
          <el-option label="已下线" value="offline" />
        </el-select>

        <el-select
          v-model="searchForm.category"
          placeholder="文章分类"
          clearable
          @change="handleSearch"
          class="w-full sm:w-32"
        >
          <el-option label="全部" value="" />
          <el-option label="技术文章" value="tech" />
          <el-option label="产品动态" value="product" />
          <el-option label="公司新闻" value="news" />
        </el-select>
      </div>

      <div class="flex gap-2">
        <el-button type="primary" @click="handleAdd" :icon="Plus">
          新增文章
        </el-button>
        <el-button @click="handleRefresh" :icon="Refresh">
          刷新
        </el-button>
      </div>
    </div>

    <!-- 文章列表 -->
    <div class="rounded-lg shadow-sm border overflow-hidden" style="border-color: var(--el-border-color);">
      <el-table
        :data="articleList"
        v-loading="loading"
        stripe
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="id" label="ID" width="80" />
        
        <el-table-column prop="title" label="文章标题" min-width="200">
          <template #default="{ row }">
            <div class="flex flex-col gap-1">
              <span class="font-medium">{{ row.title }}</span>
              <div class="flex gap-1">
                <el-tag v-if="row.isTop" type="warning" size="small">置顶</el-tag>
                <el-tag v-if="row.isHot" type="danger" size="small">热门</el-tag>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            <el-tag :type="getCategoryType(row.category)">
              {{ getCategoryName(row.category) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="author" label="作者" width="100" />

        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusName(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="viewCount" label="浏览量" width="100" />

        <el-table-column prop="publishTime" label="发布时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.publishTime) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="240" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex flex-wrap justify-center gap-1">
              <el-button
                type="primary"
                size="small"
                @click="handleView(row)"
                :icon="View"
              >
                查看
              </el-button>
              <el-button
                type="success"
                size="small"
                @click="handleEdit(row)"
                :icon="Edit"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleDelete(row)"
                :icon="Delete"
              >
                删除
              </el-button>
              <el-button
                type="info"
                size="small"
                @click="handleHide(row)"
                :icon="Hide"
              >
                隐藏
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
    <div v-if="selectedArticles.length > 0" class="fixed bottom-5 left-1/2 transform -translate-x-1/2 flex items-center gap-3 px-5 py-3 text-white rounded-lg shadow-lg z-50">
      <span class="text-sm">已选择 {{ selectedArticles.length }} 篇文章</span>
      <el-button type="danger" @click="handleBatchDelete" :icon="Delete" size="small">
        批量删除
      </el-button>
      <el-button type="success" @click="handleBatchPublish" :icon="Check" size="small">
        批量发布
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Search, 
  Plus, 
  Refresh, 
  View, 
  Edit, 
  Delete, 
  Check,
  Hide
} from '@element-plus/icons-vue'

// 接口定义
interface Article {
  id: number
  title: string
  content: string
  category: string
  author: string
  status: string
  viewCount: number
  publishTime: string
  isTop: boolean
  isHot: boolean
}

interface SearchForm {
  keyword: string
  status: string
  category: string
}

interface Pagination {
  currentPage: number
  pageSize: number
  total: number
}

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const articleList = ref<Article[]>([])
const selectedArticles = ref<Article[]>([])

const searchForm = reactive<SearchForm>({
  keyword: '',
  status: '',
  category: ''
})

const pagination = reactive<Pagination>({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 计算属性
const getCategoryType = (category: string) => {
  const typeMap: Record<string, string> = {
    tech: 'primary',
    product: 'success',
    news: 'info'
  }
  return typeMap[category] || 'default'
}

const getCategoryName = (category: string) => {
  const nameMap: Record<string, string> = {
    tech: '技术文章',
    product: '产品动态',
    news: '公司新闻'
  }
  return nameMap[category] || category
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    published: 'success',
    draft: 'warning',
    offline: 'danger'
  }
  return typeMap[status] || 'default'
}

const getStatusName = (status: string) => {
  const nameMap: Record<string, string> = {
    published: '已发布',
    draft: '草稿',
    offline: '已下线'
  }
  return nameMap[status] || status
}

// 方法
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const loadArticleList = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟数据
    const mockData: Article[] = [
      {
        id: 1,
        title: 'Vue 3 组合式API最佳实践',
        content: '详细介绍Vue 3组合式API的使用方法和最佳实践...',
        category: 'tech',
        author: '张三',
        status: 'published',
        viewCount: 1250,
        publishTime: '2024-01-15 10:30:00',
        isTop: true,
        isHot: true
      },
      {
        id: 2,
        title: '产品更新：新增用户权限管理功能',
        content: '本次更新新增了用户权限管理功能，支持细粒度权限控制...',
        category: 'product',
        author: '李四',
        status: 'published',
        viewCount: 890,
        publishTime: '2024-01-14 14:20:00',
        isTop: false,
        isHot: false
      },
      {
        id: 3,
        title: '公司获得ISO27001信息安全认证',
        content: '经过严格的审核流程，公司成功获得ISO27001信息安全认证...',
        category: 'news',
        author: '王五',
        status: 'draft',
        viewCount: 0,
        publishTime: '',
        isTop: false,
        isHot: false
      }
    ]
    
    articleList.value = mockData
    pagination.total = mockData.length
  } catch (error) {
    ElMessage.error('加载文章列表失败')
    console.error('加载文章列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadArticleList()
}

const handleRefresh = () => {
  loadArticleList()
}

const handleAdd = () => {
  // 在新标签页打开新增文章页面
  const url = router.resolve('/article/edit').href
  window.open(url, '_blank')
}

const handleView = (row: Article) => {
  ElMessage.info(`查看文章: ${row.title}`)
  // TODO: 路由跳转到文章详情页面
}

const handleEdit = (row: Article) => {
  // 在新标签页打开文章编辑页面
  const url = router.resolve(`/article/edit/${row.id}`).href
  window.open(url, '_blank')
}

const handleDelete = async (row: Article) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除文章"${row.title}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // TODO: 调用删除API
    ElMessage.success('删除成功')
    loadArticleList()
  } catch {
    // 用户取消删除
  }
}

const handleHide = async (row: Article) => {
  try {
    await ElMessageBox.confirm(
      `确定要隐藏文章"${row.title}"吗？`,
      '隐藏确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    // TODO: 调用隐藏API
    ElMessage.success('隐藏成功')
    loadArticleList()
  } catch {
    // 用户取消隐藏
  }
}

const handleSelectionChange = (selection: Article[]) => {
  selectedArticles.value = selection
}

const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadArticleList()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  loadArticleList()
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedArticles.value.length} 篇文章吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // TODO: 调用批量删除API
    ElMessage.success('批量删除成功')
    selectedArticles.value = []
    loadArticleList()
  } catch {
    // 用户取消删除
  }
}

const handleBatchPublish = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要发布选中的 ${selectedArticles.value.length} 篇文章吗？`,
      '批量发布确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    // TODO: 调用批量发布API
    ElMessage.success('批量发布成功')
    selectedArticles.value = []
    loadArticleList()
  } catch {
    // 用户取消发布
  }
}

// 生命周期
onMounted(() => {
  loadArticleList()
})
</script>

<style scoped>
/* 使用Tailwind CSS，无需自定义样式 */
</style>
