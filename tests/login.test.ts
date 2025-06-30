import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Login from '../src/views/login/Login.vue'

describe('登录页', () => {
  it('应包含“登录”按钮', () => {
    const wrapper = mount(Login)
    expect(wrapper.text()).toContain('登录')
  })
})
