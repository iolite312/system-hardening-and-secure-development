// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { hasPermission, creatableRoles, landingPathFor } from '../../../app/utils/rbac'

// The app/utils/rbac matrix must stay in sync with server/utils/rbac.
// If a permission changes server-side but not here, RBAC enforcement
// is still correct (server wins) but the UI will show wrong buttons.

describe('hasPermission — super_admin', () => {
  it('has user management permissions', () => {
    expect(hasPermission('super_admin', 'user:list')).toBe(true)
    expect(hasPermission('super_admin', 'user:create:admin')).toBe(true)
    expect(hasPermission('super_admin', 'user:delete')).toBe(true)
  })
  it('has no comic permissions', () => {
    expect(hasPermission('super_admin', 'comic:view')).toBe(false)
    expect(hasPermission('super_admin', 'comic:create')).toBe(false)
    expect(hasPermission('super_admin', 'comic:update')).toBe(false)
    expect(hasPermission('super_admin', 'comic:delete')).toBe(false)
  })
})

describe('hasPermission — admin', () => {
  it('has all comic permissions', () => {
    expect(hasPermission('admin', 'comic:view')).toBe(true)
    expect(hasPermission('admin', 'comic:create')).toBe(true)
    expect(hasPermission('admin', 'comic:update')).toBe(true)
    expect(hasPermission('admin', 'comic:delete')).toBe(true)
  })
  it('has user management permissions', () => {
    expect(hasPermission('admin', 'user:list')).toBe(true)
    expect(hasPermission('admin', 'user:create:friend')).toBe(true)
    // admin creates admins via canCreateRole (business logic); the permission
    // flag user:create:admin is reserved for super_admin in the matrix.
    expect(hasPermission('admin', 'user:create:admin')).toBe(false)
  })
})

describe('hasPermission — friend', () => {
  it('can only view comics', () => {
    expect(hasPermission('friend', 'comic:view')).toBe(true)
    expect(hasPermission('friend', 'comic:create')).toBe(false)
    expect(hasPermission('friend', 'user:list')).toBe(false)
  })
})

describe('creatableRoles', () => {
  it('super_admin can create only admins', () => {
    expect(creatableRoles('super_admin')).toEqual(['admin'])
  })
  it('admin can create admin and friend', () => {
    expect(creatableRoles('admin')).toEqual(expect.arrayContaining(['admin', 'friend']))
  })
  it('friend cannot create anyone', () => {
    expect(creatableRoles('friend')).toHaveLength(0)
  })
})

describe('landingPathFor', () => {
  it('sends super_admin to user management', () => {
    expect(landingPathFor('super_admin')).toBe('/admin/users')
  })
  it('sends admin to comics', () => {
    expect(landingPathFor('admin')).toBe('/comics')
  })
  it('sends friend to comics', () => {
    expect(landingPathFor('friend')).toBe('/comics')
  })
})
