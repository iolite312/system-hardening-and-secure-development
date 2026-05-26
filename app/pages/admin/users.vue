<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { UserRole } from '~~/shared/types/rbac'
import { creatableRoles } from '~/utils/rbac'

definePageMeta({ middleware: 'admin' })
useSeoMeta({ title: 'Users — Admin' })

interface UserRow {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
}

const { user, can } = useAuth()
const toast = useToast()

const { data, pending, refresh, error } = await useFetch<{ users: UserRow[] }>('/api/users')

const roleOptions = computed(() =>
  user.value ? creatableRoles(user.value.role).map(r => ({ label: r, value: r })) : []
)

const open = ref(false)
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(120),
  password: z.string().min(8).max(256),
  role: z.enum(['super_admin', 'admin', 'friend'])
})
type Schema = z.output<typeof schema>
const state = reactive<Schema>({ email: '', name: '', password: '', role: 'friend' })
const submitting = ref(false)
const submitError = ref<string | null>(null)

function resetForm() {
  state.email = ''
  state.name = ''
  state.password = ''
  state.role = roleOptions.value[0]?.value ?? 'friend'
  submitError.value = null
}

watch(open, (v) => {
  if (v) resetForm()
})

async function onCreate(_event: FormSubmitEvent<Schema>) {
  submitting.value = true
  submitError.value = null
  try {
    await $fetch('/api/users', { method: 'POST', body: state })
    toast.add({ title: 'User created', color: 'success' })
    open.value = false
    await refresh()
  } catch (err: unknown) {
    submitError.value = (err as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Failed to create user'
  } finally {
    submitting.value = false
  }
}

async function onDelete(row: UserRow) {
  if (row.id === user.value?.id) return
  if (!confirm(`Delete user ${row.email}?`)) return
  try {
    await $fetch(`/api/users/${row.id}`, { method: 'DELETE' })
    toast.add({ title: 'User deleted', color: 'success' })
    await refresh()
  } catch (err: unknown) {
    toast.add({
      title: 'Delete failed',
      description: (err as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Unknown error',
      color: 'error'
    })
  }
}

const columns = [
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'role', header: 'Role' },
  { accessorKey: 'createdAt', header: 'Created' },
  { id: 'actions', header: '' }
]
</script>

<template>
  <UContainer class="py-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-semibold">
          Users
        </h1>
        <p class="text-sm text-muted">
          Manage who can access the library.
        </p>
      </div>
      <UButton
        v-if="roleOptions.length"
        icon="i-lucide-user-plus"
        color="primary"
        @click="open = true"
      >
        Create user
      </UButton>
    </div>

    <UAlert v-if="error" color="error" variant="soft" :title="error.message" class="mb-4" />

    <UCard>
      <UTable
        :data="data?.users ?? []"
        :columns="columns"
        :loading="pending"
        :empty-state="{ icon: 'i-lucide-users', label: 'No users found' }"
      >
        <template #role-cell="{ row }">
          <UBadge
            :color="row.original.role === 'super_admin' ? 'primary' : row.original.role === 'admin' ? 'info' : 'neutral'"
            variant="soft"
          >
            {{ row.original.role }}
          </UBadge>
        </template>
        <template #createdAt-cell="{ row }">
          {{ new Date(row.original.createdAt).toLocaleDateString() }}
        </template>
        <template #actions-cell="{ row }">
          <UButton
            v-if="can('user:delete') && row.original.id !== user?.id && !(user?.role === 'admin' && row.original.role === 'super_admin')"
            color="error"
            variant="ghost"
            icon="i-lucide-trash-2"
            size="xs"
            @click="onDelete(row.original)"
          />
        </template>
      </UTable>
    </UCard>

    <UModal v-model:open="open" title="Create user">
      <template #body>
        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onCreate">
          <UFormField label="Email" name="email" required>
            <UInput v-model="state.email" type="email" autocomplete="off" class="w-full" />
          </UFormField>
          <UFormField label="Name" name="name" required>
            <UInput v-model="state.name" autocomplete="off" class="w-full" />
          </UFormField>
          <UFormField label="Temporary password" name="password" required help="Minimum 8 characters">
            <UInput v-model="state.password" type="password" autocomplete="new-password" class="w-full" />
          </UFormField>
          <UFormField label="Role" name="role" required>
            <USelect v-model="state.role" :items="roleOptions" class="w-full" />
          </UFormField>

          <UAlert v-if="submitError" color="error" variant="soft" :title="submitError" />

          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="ghost" @click="open = false">
              Cancel
            </UButton>
            <UButton type="submit" :loading="submitting" color="primary">
              Create
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </UContainer>
</template>
