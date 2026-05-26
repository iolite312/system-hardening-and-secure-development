export default defineNuxtRouteMiddleware(() => {
  const { can } = useAuth()
  if (!can('user:list')) {
    return navigateTo('/comics')
  }
})
