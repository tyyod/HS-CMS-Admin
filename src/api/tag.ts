import client from './client';

// 标签接口类型定义
export interface Tag {
  id: number;
  name: string;
  module: number; // 0通用，1文章
  status: number; // 1正常，0禁用
  created_at: string;
  updated_at: string;
}

export interface TagListParams {
  page?: number;
  page_size?: number;
  name?: string;
  module?: number;
  status?: number;
}

export interface TagListResponse {
  list: Tag[];
  total: number;
  page: number;
  page_size: number;
}

export interface CreateTagParams {
  name: string;
  module: number;
  status?: number;
}

export interface UpdateTagParams {
  name: string;
  module: number;
  status: number;
}

// 获取标签列表（后台）
export const getTagList = (params: TagListParams = {}) => {
  return client.get('/api/admin/tags/list', { params });
};

// 创建标签（后台）
export const createTag = (data: CreateTagParams) => {
  return client.post('/api/admin/tags/add', data);
};

// 更新标签（后台）
export const updateTag = (id: number, data: UpdateTagParams) => {
  return client.put(`/api/admin/tags/${id}`, data);
};

// 删除标签（后台）
export const deleteTag = (id: number) => {
  return client.delete(`/api/admin/tags/${id}`);
};

// 获取标签列表（通用接口，用于下拉选择等）
export const getTagsList = (params: { module?: number } = {}) => {
  return client.get('/api/tags/list', { params });
};
