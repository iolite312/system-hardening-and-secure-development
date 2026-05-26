<script setup lang="ts">
useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'icon', href: '/favicon.ico' }],
  htmlAttrs: { lang: 'en' }
})

const title = 'Comic Library'
const description = 'A private comic library with role-based access.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description
})

const { user, logout, can } = useAuth()

const navItems = computed(() => {
  const items: { label: string, to: string, icon: string }[] = []
  if (!user.value) return items
  items.push({ label: 'Comics', to: '/comics', icon: 'i-lucide-library' })
  if (can('user:list')) {
    items.push({ label: 'Users', to: '/admin/users', icon: 'i-lucide-users' })
  }
  if (can('comic:create')) {
    items.push({ label: 'Manage', to: '/admin/comics', icon: 'i-lucide-settings' })
  }
  return items
})
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink
          to="/"
          class="flex items-center gap-2 font-semibold"
        >
          <UIcon
            name="i-lucide-book-open"
            class="size-6 text-primary"
          />
          <span>Comic Library</span>
        </NuxtLink>

        <nav
          v-if="user"
          class="hidden md:flex items-center gap-1 ml-6"
        >
          <UButton
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :icon="item.icon"
            variant="ghost"
            color="neutral"
            size="sm"
          >
            {{ item.label }}
          </UButton>
        </nav>
      </template>

      <template #right>
        <UColorModeButton />
        <template v-if="user">
          <UBadge
            variant="soft"
            color="neutral"
            class="hidden sm:inline-flex"
          >
            {{ user.email }} · {{ user.role }}
          </UBadge>
          <UButton
            icon="i-lucide-log-out"
            color="neutral"
            variant="ghost"
            aria-label="Log out"
            @click="logout"
          />
        </template>
        <UButton
          v-else
          to="/login"
          color="primary"
          size="sm"
        >
          Sign in
        </UButton>
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          © {{ new Date().getFullYear() }} Comic Library
        </p>
      </template>
    </UFooter>
  </UApp>
</template>
