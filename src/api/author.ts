import client from './client';

// 作者接口类型定义
export interface Author {
  id: number;
  name: string;
  avatar: string;
  user_id?: number;
  author_type: number; // 1站内用户，2站外作者
  status: number; // 1正常，0禁用
  created_at: string;
  updated_at: string;
}

export interface AuthorListParams {
  page?: number;
  page_size?: number;
  name?: string;
  author_type?: number;
  status?: number;
}

export interface AuthorListResponse {
  list: Author[];
  total: number;
  page: number;
  page_size: number;
}

export interface CreateAuthorParams {
  name: string;
  avatar: string;
  user_id?: number;
  author_type: number;
  status: number;
}

export interface UpdateAuthorParams {
  name: string;
  avatar: string;
  user_id?: number;
  author_type: number;
  status: number;
}

// 获取作者列表（后台）
export const getAuthorList = (params: AuthorListParams = {}) => {
  return client.get<AuthorListResponse>('/api/admin/authors/list', { params });
};

// 创建作者（后台）
export const createAuthor = (data: CreateAuthorParams) => {
  return client.post<Author>('/api/admin/authors/add', data);
};

// 更新作者（后台）
export const updateAuthor = (id: number, data: UpdateAuthorParams) => {
  return client.put(`/api/admin/authors/${id}`, data);
};

// 删除作者（后台）
export const deleteAuthor = (id: number) => {
  return client.delete(`/api/admin/authors/${id}`);
};

