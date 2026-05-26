import type { UserRole } from './rbac'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
}
