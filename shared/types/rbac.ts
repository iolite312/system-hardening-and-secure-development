export const USER_ROLES = ['super_admin', 'admin', 'friend'] as const
export type UserRole = (typeof USER_ROLES)[number]

export type Permission
  = | 'comic:view'
    | 'comic:create'
    | 'comic:update'
    | 'comic:delete'
    | 'user:list'
    | 'user:create:admin'
    | 'user:create:friend'
    | 'user:delete'
