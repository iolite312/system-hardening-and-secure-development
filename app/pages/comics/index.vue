<script setup lang="ts">
interface Comic {
  id: string
  title: string
  serie: string
  number: string
  createdAt: string
}

interface ComicsResponse {
  comics: Comic[]
  total: number
  page: number
  limit: number
  pages: number
}

useSeoMeta({ title: 'Comics — Comic Library' })

const { can } = useAuth()
const route = useRoute()
const router = useRouter()

const page = computed(() => Number(route.query.page) || 1)

const { data, pending, error } = await useFetch<ComicsResponse>('/api/comics', {
  query: computed(() => ({ page: page.value, limit: 20 })),
  watch: [page]
})

function onPageChange(p: number) {
  router.push({ query: { ...route.query, page: p } })
}
</script>

<template>
  <UContainer class="py-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-semibold">
          Comic library
        </h1>
        <p v-if="data" class="text-sm text-muted">
          {{ data.total }} comics total
        </p>
      </div>
      <UButton v-if="can('comic:create')" to="/admin/comics" icon="i-lucide-settings" color="primary">
        Manage comics
      </UButton>
    </div>

    <UAlert v-if="error" color="error" variant="soft" :title="error.message" />

    <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <USkeleton v-for="i in 20" :key="i" class="h-24 rounded-lg" />
    </div>

    <div v-else-if="data?.comics?.length" class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <UCard
          v-for="comic in data.comics"
          :key="comic.id"
          class="hover:ring-1 hover:ring-primary transition"
        >
          <NuxtLink :to="`/comics/${comic.id}`" class="block">
            <div class="flex items-start gap-3">
              <UIcon name="i-lucide-book" class="size-8 text-primary shrink-0 mt-1" />
              <div class="min-w-0">
                <h3 class="font-semibold line-clamp-2">
                  {{ comic.title }}
                </h3>
                <p class="text-sm text-muted mt-1">
                  {{ comic.serie }} · #{{ comic.number }}
                </p>
              </div>
            </div>
          </NuxtLink>
        </UCard>
      </div>

      <div v-if="data.pages > 1" class="flex items-center justify-between">
        <p class="text-sm text-muted">
          Page {{ data.page }} of {{ data.pages }}
        </p>
        <UPagination
          :page="data.page"
          :total="data.total"
          :items-per-page="data.limit"
          @update:page="onPageChange"
        />
      </div>
    </div>

    <UCard v-else class="text-center py-12">
      <UIcon name="i-lucide-library" class="size-12 text-muted mx-auto mb-3" />
      <p class="text-muted">
        No comics yet.
      </p>
      <UButton v-if="can('comic:create')" to="/admin/comics" class="mt-4">
        Add the first one
      </UButton>
    </UCard>
  </UContainer>
</template>
