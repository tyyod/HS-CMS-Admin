import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Admin from '../src/views/admin.vue'
import { createRouter, createMemoryHistory } from 'vue-router'

// mock userProfile，避免真实请求
vi.mock('../src/api/user', () => ({
  userProfile: () => Promise.resolve({ data: { nickName: '测试用户' } })
}))

describe('管理页', () => {
  it('应包含“HSCMS”标题', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: { template: '<div></div>' } }]
    })
    router.push('/')
    await router.isReady()
    const wrapper = mount(Admin, {
      global: {
        plugins: [router]
      }
    })
    expect(wrapper.text()).toContain('HSCMS')
  })
})
