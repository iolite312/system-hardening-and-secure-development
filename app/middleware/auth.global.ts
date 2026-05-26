export default defineNuxtRouteMiddleware(async (to) => {
  // Login page is the only unauthenticated route.
  if (to.path === '/login') return

  const { user, loaded, fetchMe } = useAuth()
  if (!loaded.value) await fetchMe()
  if (!user.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
