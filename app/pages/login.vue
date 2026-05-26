<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { landingPathFor } from '~/utils/rbac'

definePageMeta({ title: 'Login' })

useSeoMeta({ title: 'Login — Comic Library' })

const { login, user } = useAuth()
const route = useRoute()
const router = useRouter()

// If already authenticated, bounce them to wherever their role can land.
if (user.value) {
  await router.replace((route.query.redirect as string) || landingPathFor(user.value.role))
}

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required')
})
type Schema = z.output<typeof schema>

const state = reactive<Schema>({ email: '', password: '' })
const submitError = ref<string | null>(null)
const loading = ref(false)

async function onSubmit(_event: FormSubmitEvent<Schema>) {
  submitError.value = null
  loading.value = true
  try {
    const u = await login(state.email, state.password)
    const redirect = (route.query.redirect as string) || landingPathFor(u.role)
    await router.push(redirect)
  } catch (err: unknown) {
    submitError.value = (err as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UContainer class="py-16">
    <div class="max-w-md mx-auto">
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-book-open" class="size-6 text-primary" />
            <h1 class="text-xl font-semibold">
              Sign in to Comic Library
            </h1>
          </div>
        </template>

        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
          <UFormField label="Email" name="email" required>
            <UInput v-model="state.email" type="email" autocomplete="email" placeholder="you@example.com" class="w-full" />
          </UFormField>

          <UFormField label="Password" name="password" required>
            <UInput v-model="state.password" type="password" autocomplete="current-password" class="w-full" />
          </UFormField>

          <UAlert
            v-if="submitError"
            color="error"
            variant="soft"
            icon="i-lucide-alert-triangle"
            :title="submitError"
          />

          <UButton type="submit" :loading="loading" block>
            Sign in
          </UButton>
        </UForm>
      </UCard>

      <p class="text-sm text-muted text-center mt-4">
        Visitors without an account cannot browse comics.
      </p>
    </div>
  </UContainer>
</template>
