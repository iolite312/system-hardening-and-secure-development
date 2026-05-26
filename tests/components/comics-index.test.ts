import { describe, it, expect, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { ref } from 'vue'
import ComicsIndex from '../../app/pages/comics/index.vue'

const { mockRefresh } = vi.hoisted(() => ({ mockRefresh: vi.fn() }))

mockNuxtImport('useAuth', () => () => ({
  user: ref({ id: '1', email: 'friend@example.com', role: 'friend' }),
  loaded: ref(true),
  can: (perm: string) => perm === 'comic:view',
  login: vi.fn(),
  logout: vi.fn(),
  fetchMe: vi.fn()
}))

mockNuxtImport('useFetch', () => () => ({
  data: ref({
    comics: [
      { id: '1', title: 'Watchmen #1', serie: 'Watchmen', number: '1', createdAt: '2024-01-01T00:00:00Z' },
      { id: '2', title: 'Sandman #1', serie: 'Sandman', number: '1', createdAt: '2024-01-02T00:00:00Z' }
    ],
    total: 2,
    page: 1,
    limit: 20,
    pages: 1
  }),
  pending: ref(false),
  error: ref(null),
  refresh: mockRefresh
}))

mockNuxtImport('useRoute', () => () => ({ query: {}, path: '/comics' }))

describe('Comics index page', () => {
  it('renders a card for each comic', async () => {
    const wrapper = await mountSuspended(ComicsIndex)
    expect(wrapper.text()).toContain('Watchmen #1')
    expect(wrapper.text()).toContain('Sandman #1')
  })

  it('shows total comic count', async () => {
    const wrapper = await mountSuspended(ComicsIndex)
    expect(wrapper.text()).toContain('2 comics total')
  })

  it('shows series and issue number', async () => {
    const wrapper = await mountSuspended(ComicsIndex)
    expect(wrapper.text()).toContain('Watchmen')
    expect(wrapper.text()).toContain('#1')
  })

  it('hides Manage button for a friend', async () => {
    const wrapper = await mountSuspended(ComicsIndex)
    expect(wrapper.text()).not.toContain('Manage comics')
  })

  it('hides pagination when there is only one page', async () => {
    const wrapper = await mountSuspended(ComicsIndex)
    expect(wrapper.html()).not.toContain('aria-label="Go to next page"')
  })
})
