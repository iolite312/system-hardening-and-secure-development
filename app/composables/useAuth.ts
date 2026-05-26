import type { Permission } from '~~/shared/types/rbac'
import type { AuthUser } from '~~/shared/types/auth'
import { hasPermission } from '~/utils/rbac'

export function useAuth() {
  const user = useState<AuthUser | null>('auth:user', () => null)
  const loaded = useState<boolean>('auth:loaded', () => false)

  async function fetchMe() {
    try {
      const reqFetch = useRequestFetch()
      const { user: u } = await reqFetch<{ user: AuthUser }>('/api/auth/me')
      user.value = u
    } catch {
      user.value = null
    } finally {
      loaded.value = true
    }
    return user.value
  }

  async function login(email: string, password: string) {
    const { user: u } = await $fetch<{ user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    })
    user.value = u
    loaded.value = true
    return u
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    user.value = null
    await navigateTo('/login')
  }

  function can(permission: Permission): boolean {
    return user.value ? hasPermission(user.value.role, permission) : false
  }

  return { user, loaded, fetchMe, login, logout, can }
}
