// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { hasPermission, creatableRoles, canCreateRole, permissionsFor } from '../../../server/utils/rbac'
import type { Permission, UserRole } from '../../../shared/types/rbac'

describe('hasPermission', () => {
  describe('super_admin', () => {
    it('can list users', () => {
      expect(hasPermission('super_admin', 'user:list')).toBe(true)
    })
    it('can create admins', () => {
      expect(hasPermission('super_admin', 'user:create:admin')).toBe(true)
    })
    it('can delete users', () => {
      expect(hasPermission('super_admin', 'user:delete')).toBe(true)
    })
    it('cannot view comics', () => {
      expect(hasPermission('super_admin', 'comic:view')).toBe(false)
    })
    it('cannot create comics', () => {
      expect(hasPermission('super_admin', 'comic:create')).toBe(false)
    })
    it('cannot update comics', () => {
      expect(hasPermission('super_admin', 'comic:update')).toBe(false)
    })
    it('cannot delete comics', () => {
      expect(hasPermission('super_admin', 'comic:delete')).toBe(false)
    })
    it('cannot create friends directly', () => {
      expect(hasPermission('super_admin', 'user:create:friend')).toBe(false)
    })
  })

  describe('admin', () => {
    const comicPerms: Permission[] = ['comic:view', 'comic:create', 'comic:update', 'comic:delete']
    it.each(comicPerms)('has %s permission', (perm) => {
      expect(hasPermission('admin', perm)).toBe(true)
    })
    it('can list users', () => {
      expect(hasPermission('admin', 'user:list')).toBe(true)
    })
    it('can create friends', () => {
      expect(hasPermission('admin', 'user:create:friend')).toBe(true)
    })
    // admin creates admins via canCreateRole (business logic) but the
    // permission matrix only grants the 'user:create:friend' capability flag.
    it('does not hold the user:create:admin permission flag', () => {
      expect(hasPermission('admin', 'user:create:admin')).toBe(false)
    })
  })

  describe('friend', () => {
    it('can view comics', () => {
      expect(hasPermission('friend', 'comic:view')).toBe(true)
    })
    it('cannot create comics', () => {
      expect(hasPermission('friend', 'comic:create')).toBe(false)
    })
    it('cannot manage users', () => {
      expect(hasPermission('friend', 'user:list')).toBe(false)
      expect(hasPermission('friend', 'user:delete')).toBe(false)
    })
  })
})

describe('creatableRoles', () => {
  it('super_admin can only create admins', () => {
    expect(creatableRoles('super_admin')).toEqual(['admin'])
  })
  it('admin can create admins and friends', () => {
    expect(creatableRoles('admin')).toEqual(expect.arrayContaining(['admin', 'friend']))
    expect(creatableRoles('admin')).toHaveLength(2)
  })
  it('friend cannot create anyone', () => {
    expect(creatableRoles('friend')).toEqual([])
  })
})

describe('canCreateRole', () => {
  it('super_admin can create admin', () => {
    expect(canCreateRole('super_admin', 'admin')).toBe(true)
  })
  it('super_admin cannot create super_admin', () => {
    expect(canCreateRole('super_admin', 'super_admin')).toBe(false)
  })
  it('super_admin cannot create friend', () => {
    expect(canCreateRole('super_admin', 'friend')).toBe(false)
  })
  it('admin can create friend', () => {
    expect(canCreateRole('admin', 'friend')).toBe(true)
  })
  it('admin can create admin', () => {
    expect(canCreateRole('admin', 'admin')).toBe(true)
  })
  it('admin cannot create super_admin', () => {
    expect(canCreateRole('admin', 'super_admin')).toBe(false)
  })
  it('friend cannot create any role', () => {
    const roles: UserRole[] = ['super_admin', 'admin', 'friend']
    for (const role of roles) {
      expect(canCreateRole('friend', role)).toBe(false)
    }
  })
})

describe('permissionsFor', () => {
  it('returns a non-empty array for super_admin', () => {
    expect(permissionsFor('super_admin').length).toBeGreaterThan(0)
  })
  it('returns a non-empty array for admin', () => {
    expect(permissionsFor('admin').length).toBeGreaterThan(0)
  })
  it('returns only comic:view for friend', () => {
    expect(permissionsFor('friend')).toEqual(['comic:view'])
  })
  it('admin has more permissions than friend', () => {
    expect(permissionsFor('admin').length).toBeGreaterThan(permissionsFor('friend').length)
  })
})
