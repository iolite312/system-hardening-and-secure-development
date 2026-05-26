import type { Permission, UserRole } from '~~/shared/types/rbac'

const matrix: Record<UserRole, Permission[]> = {
  super_admin: [
    'user:list',
    'user:create:admin',
    'user:delete'
  ],
  admin: [
    'comic:view',
    'comic:create',
    'comic:update',
    'comic:delete',
    'user:list',
    'user:create:friend',
    'user:delete'
  ],
  friend: ['comic:view']
}

export function hasPermission(role: UserRole, perm: Permission): boolean {
  return matrix[role]?.includes(perm) ?? false
}

export function permissionsFor(role: UserRole): Permission[] {
  return matrix[role] ?? []
}

/**
 * Which roles can the actor create?
 *  - super_admin can create only admins
 *  - admin can create friends and other admins, but never super_admin
 *  - friend can create no one
 */
export function creatableRoles(actor: UserRole): UserRole[] {
  if (actor === 'super_admin') return ['admin']
  if (actor === 'admin') return ['admin', 'friend']
  return []
}

export function canCreateRole(actor: UserRole, target: UserRole): boolean {
  return creatableRoles(actor).includes(target)
}
