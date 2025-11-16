import client from './client'

// 文章分类接口类型定义
export interface ArticleCategory {
  id: number
  name: string
  sort: number
  status: number
  created_at: string
  updated_at: string
}

export interface CategoryListParams {
  page?: number
  page_size?: number
  name?: string
  status?: number
}

export interface CategoryListResponse {
  list: ArticleCategory[]
  total: number
  page: number
  page_size: number
}

export interface CreateCategoryParams {
  name: string
  sort: number
  status: number
}

export interface UpdateCategoryParams {
  name: string
  sort: number
  status: number
}

// 获取分类列表
export const getCategoryList = (params: CategoryListParams = {}) => {
  return client.get<CategoryListResponse>('/api/admin/article/categories/list', { params })
}

// 创建分类
export const createCategory = (data: CreateCategoryParams) => {
  return client.post<ArticleCategory>('/api/admin/article/categories/add', data)
}

// 更新分类
export const updateCategory = (id: number, data: UpdateCategoryParams) => {
  return client.put(`/api/admin/article/categories/${id}`, data)
}

// 删除分类
export const deleteCategory = (id: number) => {
  return client.delete(`/api/admin/article/categories/${id}`)
}

// 批量删除分类
export const batchDeleteCategories = (ids: number[]) => {
  return client.delete('/api/admin/article/categories/batch', { data: { ids } })
}

// 批量更新分类状态
export const batchUpdateCategoryStatus = (ids: number[], status: number) => {
  return client.put('/api/admin/article/categories/batch/status', { ids, status })
}
