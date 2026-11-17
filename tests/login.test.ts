import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import Login from '../src/views/login/Login.vue'

const mocks = vi.hoisted(() => ({
  loginUser: vi.fn(),
  verifyMfa: vi.fn(),
  replace: vi.fn(),
}))

vi.mock('../src/api/index', () => ({
  loginUser: mocks.loginUser,
  verifyMfa: mocks.verifyMfa,
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({ replace: mocks.replace, push: vi.fn() }),
  useRoute: () => ({ query: {} }),
}))

function mountLogin() {
  return mount(Login, { global: { plugins: [ElementPlus] } })
}

async function gotoMfa(wrapper: ReturnType<typeof mountLogin>, action: 'bind' | 'verify') {
  mocks.loginUser.mockResolvedValue({
    code: 0,
    msg: '',
    data:
      action === 'bind'
        ? {
            mfa_required: true,
            mfa_action: 'bind',
            secret: 'JBSWY3DPEHPK3PXP',
            qr_code: 'data:image/png;base64,AAA',
            expire_seconds: 300,
          }
        : { mfa_required: true, mfa_action: 'verify' },
  })
  await wrapper.find('input[autocomplete="username"]').setValue('admin')
  await wrapper.find('input[autocomplete="current-password"]').setValue('12345678')
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

describe('登录页', () => {
  beforeEach(() => {
    mocks.loginUser.mockReset()
    mocks.verifyMfa.mockReset()
    mocks.replace.mockReset()
  })

  it('应包含“登录”按钮', () => {
    const wrapper = mountLogin()
    expect(wrapper.text()).toContain('登录')
  })

  it('密码正确但未绑定 MFA 时进入绑定步骤，显示二维码与密钥', async () => {
    const wrapper = mountLogin()
    await gotoMfa(wrapper, 'bind')
    expect(wrapper.find('img[alt="MFA 二维码"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('JBSWY3DPEHPK3PXP')
    expect(mocks.replace).not.toHaveBeenCalled()
  })

  it('已绑定 MFA 时进入验证码步骤', async () => {
    const wrapper = mountLogin()
    await gotoMfa(wrapper, 'verify')
    expect(wrapper.text()).toContain('请输入验证器中的 6 位验证码')
  })

  it('提交动态码后调用 verifyMfa，成功后跳转', async () => {
    mocks.verifyMfa.mockResolvedValue({ code: 0, msg: '登录成功', data: { id: 1 } })
    const wrapper = mountLogin()
    await gotoMfa(wrapper, 'verify')
    await wrapper.find('input[autocomplete="one-time-code"]').setValue('123456')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(mocks.verifyMfa).toHaveBeenCalledWith({ username: 'admin', mfa_code: '123456' })
    expect(mocks.replace).toHaveBeenCalledWith('/')
  })

  it('绑定过期（400，msg 含“过期”）时回到密码步骤', async () => {
    mocks.verifyMfa.mockRejectedValue({ status: 400, data: { msg: '绑定已过期，请重新登录' } })
    const wrapper = mountLogin()
    await gotoMfa(wrapper, 'verify')
    await wrapper.find('input[autocomplete="one-time-code"]').setValue('123456')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.find('input[autocomplete="current-password"]').exists()).toBe(true)
    expect(wrapper.find('input[autocomplete="one-time-code"]').exists()).toBe(false)
  })

  it('参数错误（400，非过期）时停留在 MFA 步骤并提示，不跳转', async () => {
    mocks.verifyMfa.mockRejectedValue({ status: 400, data: { msg: '无效的请求参数' } })
    const wrapper = mountLogin()
    await gotoMfa(wrapper, 'verify')
    await wrapper.find('input[autocomplete="one-time-code"]').setValue('123456')
    await wrapper.find('form').trigger('submit')
    await flushPromises()
    expect(wrapper.find('input[autocomplete="one-time-code"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('无效的请求参数')
    expect(mocks.replace).not.toHaveBeenCalled()
  })

  it('验证码输入过滤非半角数字字符', async () => {
    const wrapper = mountLogin()
    await gotoMfa(wrapper, 'verify')
    const input = wrapper.find('input[autocomplete="one-time-code"]')
    await input.setValue('１２３456')
    expect((input.element as HTMLInputElement).value).toBe('123456')
  })
})
