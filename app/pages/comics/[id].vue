<script setup lang="ts">
interface Comic {
  id: string
  title: string
  serie: string
  number: string
  createdAt: string
  updatedAt: string
}

const route = useRoute()
const { can } = useAuth()
const toast = useToast()

const { data, error } = await useFetch<{ comic: Comic }>(`/api/comics/${route.params.id}`)

useSeoMeta({ title: () => data.value ? `${data.value.comic.title} — Comic Library` : 'Comic — Comic Library' })

async function onDelete() {
  if (!confirm('Delete this comic? This cannot be undone.')) return
  try {
    await $fetch(`/api/comics/${route.params.id}`, { method: 'DELETE' })
    toast.add({ title: 'Deleted', color: 'success' })
    await navigateTo('/comics')
  } catch (err: unknown) {
    toast.add({
      title: 'Delete failed',
      description: (err as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Unknown error',
      color: 'error'
    })
  }
}
</script>

<template>
  <UContainer class="py-8">
    <UButton
      to="/comics"
      variant="ghost"
      icon="i-lucide-arrow-left"
      class="mb-4"
    >
      Back
    </UButton>

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      :title="error.message"
    />

    <UCard v-if="data?.comic">
      <div class="flex items-start gap-4">
        <UIcon
          name="i-lucide-book"
          class="size-12 text-primary shrink-0"
        />
        <div class="flex-1">
          <h1 class="text-3xl font-semibold">
            {{ data.comic.title }}
          </h1>
          <p class="text-lg text-muted mt-1">
            {{ data.comic.serie }} · Issue #{{ data.comic.number }}
          </p>
        </div>
      </div>

      <USeparator class="my-6" />

      <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <dt class="text-muted">
            Series
          </dt>
          <dd class="font-medium">
            {{ data.comic.serie }}
          </dd>
        </div>
        <div>
          <dt class="text-muted">
            Number
          </dt>
          <dd class="font-medium">
            #{{ data.comic.number }}
          </dd>
        </div>
        <div>
          <dt class="text-muted">
            Added
          </dt>
          <dd class="font-medium">
            {{ new Date(data.comic.createdAt).toLocaleString() }}
          </dd>
        </div>
        <div>
          <dt class="text-muted">
            Updated
          </dt>
          <dd class="font-medium">
            {{ new Date(data.comic.updatedAt).toLocaleString() }}
          </dd>
        </div>
      </dl>

      <div
        v-if="can('comic:update') || can('comic:delete')"
        class="mt-8 flex gap-2"
      >
        <UButton
          v-if="can('comic:update')"
          to="/admin/comics"
          icon="i-lucide-pencil"
          variant="soft"
        >
          Edit in admin
        </UButton>
        <UButton
          v-if="can('comic:delete')"
          color="error"
          variant="soft"
          icon="i-lucide-trash-2"
          @click="onDelete"
        >
          Delete
        </UButton>
      </div>
    </UCard>
  </UContainer>
</template>
