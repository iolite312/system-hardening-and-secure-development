// Client-side mirror of server/utils/rbac.ts.
// Server still enforces every permission — this is purely for hiding UI.

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

export function creatableRoles(actor: UserRole): UserRole[] {
  if (actor === 'super_admin') return ['admin']
  if (actor === 'admin') return ['admin', 'friend']
  return []
}

export function landingPathFor(role: UserRole): string {
  // Super admin can't view comics; send them straight to user management.
  if (role === 'super_admin') return '/admin/users'
  return '/comics'
}
