import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { ref } from 'vue'
import LoginPage from '../../app/pages/login.vue'

const { mockLogin } = vi.hoisted(() => ({ mockLogin: vi.fn() }))

mockNuxtImport('useAuth', () => () => ({
  user: ref(null),
  loaded: ref(true),
  can: vi.fn(() => false),
  login: mockLogin,
  logout: vi.fn(),
  fetchMe: vi.fn()
}))

// Minimal route object — do NOT mock useRouter (breaks Nuxt internal plugins).
mockNuxtImport('useRoute', () => () => ({ query: {}, path: '/login', fullPath: '/login' }))

describe('Login page', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders email and password inputs', async () => {
    const wrapper = await mountSuspended(LoginPage)
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
  })

  it('renders the sign-in button', async () => {
    const wrapper = await mountSuspended(LoginPage)
    expect(wrapper.text()).toContain('Sign in')
  })

  it('shows the visitor notice', async () => {
    const wrapper = await mountSuspended(LoginPage)
    expect(wrapper.text()).toContain('Visitors without an account')
  })

  it('calls login with entered credentials on submit', async () => {
    mockLogin.mockResolvedValue({ id: '1', email: 'admin@example.com', role: 'admin' })
    const wrapper = await mountSuspended(LoginPage)
    await wrapper.find('input[type="email"]').setValue('admin@example.com')
    await wrapper.find('input[type="password"]').setValue('secret123')
    await wrapper.find('form').trigger('submit')
    await new Promise(r => setTimeout(r, 50))
    expect(mockLogin).toHaveBeenCalledWith('admin@example.com', 'secret123')
  })

  it('shows an error alert when login fails', async () => {
    mockLogin.mockRejectedValue({ data: { statusMessage: 'Invalid credentials' } })
    const wrapper = await mountSuspended(LoginPage)
    await wrapper.find('input[type="email"]').setValue('bad@example.com')
    await wrapper.find('input[type="password"]').setValue('wrong')
    await wrapper.find('form').trigger('submit')
    await new Promise(r => setTimeout(r, 100))
    expect(wrapper.text()).toContain('Invalid credentials')
  })
})
