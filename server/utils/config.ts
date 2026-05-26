// Thin wrapper so unit tests can mock runtimeConfig without fighting
// Nuxt's auto-import resolution (which requires a live app instance).
export const useConfig = () => useRuntimeConfig()
