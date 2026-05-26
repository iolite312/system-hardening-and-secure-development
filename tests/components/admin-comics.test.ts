import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { ref } from 'vue'
import AdminComics from '../../app/pages/admin/comics.vue'

const { mockFetch, mockToastAdd } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
  mockToastAdd: vi.fn()
}))

mockNuxtImport('useAuth', () => () => ({
  user: ref({ id: '1', email: 'admin@example.com', role: 'admin' }),
  loaded: ref(true),
  can: () => true,
  login: vi.fn(),
  logout: vi.fn(),
  fetchMe: vi.fn()
}))

mockNuxtImport('useFetch', () => () => ({
  data: ref({
    comics: [
      { id: 'a1', title: 'Batman #1', serie: 'Batman', number: '1', createdAt: '2024-01-01T00:00:00Z' },
      { id: 'a2', title: 'Batman #2', serie: 'Batman', number: '2', createdAt: '2024-01-02T00:00:00Z' }
    ]
  }),
  pending: ref(false),
  error: ref(null),
  refresh: vi.fn()
}))

mockNuxtImport('navigateTo', () => vi.fn())
mockNuxtImport('useToast', () => () => ({ add: mockToastAdd }))

describe('Admin comics page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('$fetch', mockFetch)
  })

  it('renders comic rows', async () => {
    const wrapper = await mountSuspended(AdminComics)
    expect(wrapper.text()).toContain('Batman #1')
    expect(wrapper.text()).toContain('Batman #2')
  })

  it('shows Add comic and Import CSV buttons', async () => {
    const wrapper = await mountSuspended(AdminComics)
    expect(wrapper.text()).toContain('Add comic')
    expect(wrapper.text()).toContain('Import CSV')
  })

  it('shows the page heading', async () => {
    const wrapper = await mountSuspended(AdminComics)
    expect(wrapper.text()).toContain('Manage comics')
  })

  it('opens the add modal when Add comic is clicked', async () => {
    const wrapper = await mountSuspended(AdminComics)
    const addBtn = wrapper.findAll('button').find(b => b.text().includes('Add comic'))
    await addBtn!.trigger('click')
    expect(wrapper.text()).toContain('Title')
    expect(wrapper.text()).toContain('Series')
  })

  it('opens the import modal when Import CSV is clicked', async () => {
    // UModal teleports content to document.body, so check there instead of wrapper.text().
    const wrapper = await mountSuspended(AdminComics, { attachTo: document.body })
    const importBtn = wrapper.findAll('button').find(b => b.text().includes('Import CSV'))
    await importBtn!.trigger('click')
    await new Promise(r => setTimeout(r, 50))
    expect(document.body.textContent).toContain('Expected CSV format')
  })

  it('shows the Upload & import button inside the import modal', async () => {
    const wrapper = await mountSuspended(AdminComics, { attachTo: document.body })
    await wrapper.findAll('button').find(b => b.text().includes('Import CSV'))!.trigger('click')
    await new Promise(r => setTimeout(r, 50))
    expect(document.body.textContent).toContain('Upload')
  })
})
