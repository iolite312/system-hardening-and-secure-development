<script setup lang="ts">
// The global auth middleware guarantees `user` is non-null by the time we get here.
// Route them to the page their role can actually see.
import { landingPathFor } from '~/utils/rbac'

const { user } = useAuth()
await navigateTo(user.value ? landingPathFor(user.value.role) : '/login', { replace: true })
</script>

<template>
  <div />
</template>
