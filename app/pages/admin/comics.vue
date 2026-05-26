<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

useSeoMeta({ title: 'Comics — Admin' })

interface Comic {
  id: string
  title: string
  serie: string
  number: string
  createdAt: string
}

const { can } = useAuth()
const toast = useToast()

if (!can('comic:create')) {
  await navigateTo('/comics')
}

const { data, pending, refresh, error } = await useFetch<{ comics: Comic[] }>('/api/comics')

const schema = z.object({
  title: z.string().min(1).max(200),
  serie: z.string().min(1).max(200),
  number: z.string().min(1).max(200)
})
type Schema = z.output<typeof schema>

const open = ref(false)
const editing = ref<Comic | null>(null)
const state = reactive<Schema>({ title: '', serie: '', number: '' })
const submitting = ref(false)
const submitError = ref<string | null>(null)

function openCreate() {
  editing.value = null
  state.title = ''
  state.serie = ''
  state.number = ''
  submitError.value = null
  open.value = true
}

function openEdit(c: Comic) {
  editing.value = c
  state.title = c.title
  state.serie = c.serie
  state.number = c.number
  submitError.value = null
  open.value = true
}

async function onSubmit(_event: FormSubmitEvent<Schema>) {
  submitting.value = true
  submitError.value = null
  try {
    if (editing.value) {
      await $fetch(`/api/comics/${editing.value.id}`, { method: 'PATCH', body: state })
      toast.add({ title: 'Comic updated', color: 'success' })
    } else {
      await $fetch('/api/comics', { method: 'POST', body: state })
      toast.add({ title: 'Comic added', color: 'success' })
    }
    open.value = false
    await refresh()
  } catch (err: unknown) {
    submitError.value = (err as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Save failed'
  } finally {
    submitting.value = false
  }
}

async function onDelete(c: Comic) {
  if (!confirm(`Delete "${c.title}"?`)) return
  try {
    await $fetch(`/api/comics/${c.id}`, { method: 'DELETE' })
    toast.add({ title: 'Deleted', color: 'success' })
    await refresh()
  } catch (err: unknown) {
    toast.add({
      title: 'Delete failed',
      description: (err as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Unknown error',
      color: 'error'
    })
  }
}

// ---- CSV import ----
interface ImportResult {
  totalRows: number
  imported: number
  failed: number
  errors: Array<{ row: number, message: string }>
  truncatedErrors: boolean
}

const importOpen = ref(false)
const importFile = ref<File | null>(null)
const importing = ref(false)
const importResult = ref<ImportResult | null>(null)
const importError = ref<string | null>(null)

function openImport() {
  importFile.value = null
  importResult.value = null
  importError.value = null
  importOpen.value = true
}

function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  importFile.value = files && files[0] ? files[0] : null
}

async function onImport() {
  if (!importFile.value) {
    importError.value = 'Choose a CSV file first'
    return
  }
  importing.value = true
  importError.value = null
  importResult.value = null
  try {
    const formData = new FormData()
    formData.append('file', importFile.value)
    importResult.value = await $fetch<ImportResult>('/api/comics/import', {
      method: 'POST',
      body: formData
    })
    toast.add({
      title: `Imported ${importResult.value.imported} of ${importResult.value.totalRows}`,
      color: importResult.value.failed === 0 ? 'success' : 'warning'
    })
    await refresh()
  } catch (err: unknown) {
    importError.value = (err as { data?: { statusMessage?: string } })?.data?.statusMessage ?? 'Import failed'
  } finally {
    importing.value = false
  }
}

const columns = [
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'serie', header: 'Series' },
  { accessorKey: 'number', header: 'Number' },
  { id: 'actions', header: '' }
]
</script>

<template>
  <UContainer class="py-8">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-semibold">
          Manage comics
        </h1>
        <p class="text-sm text-muted">
          Add, edit, or remove comics in the library.
        </p>
      </div>
      <div class="flex gap-2">
        <UButton icon="i-lucide-upload" color="neutral" variant="soft" @click="openImport">
          Import CSV
        </UButton>
        <UButton icon="i-lucide-plus" color="primary" @click="openCreate">
          Add comic
        </UButton>
      </div>
    </div>

    <UAlert v-if="error" color="error" variant="soft" :title="error.message" class="mb-4" />

    <UCard>
      <UTable
        :data="data?.comics ?? []"
        :columns="columns"
        :loading="pending"
        :empty-state="{ icon: 'i-lucide-book', label: 'No comics yet' }"
      >
        <template #number-cell="{ row }">
          #{{ row.original.number }}
        </template>
        <template #actions-cell="{ row }">
          <div class="flex justify-end gap-1">
            <UButton variant="ghost" size="xs" icon="i-lucide-pencil" @click="openEdit(row.original)" />
            <UButton
              v-if="can('comic:delete')"
              variant="ghost"
              size="xs"
              color="error"
              icon="i-lucide-trash-2"
              @click="onDelete(row.original)"
            />
          </div>
        </template>
      </UTable>
    </UCard>

    <UModal v-model:open="importOpen" title="Import comics from CSV">
      <template #body>
        <div class="space-y-4">
          <UAlert
            color="info"
            variant="soft"
            icon="i-lucide-info"
            title="Expected CSV format"
            description="Header row required. Columns: title, serie, number. Extra columns are ignored. Max file size 50 MB."
          />

          <div>
            <label class="block text-sm font-medium mb-2">CSV file</label>
            <input
              type="file"
              accept=".csv,text/csv"
              class="block w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary-500 file:text-white file:cursor-pointer"
              @change="onFileChange"
            >
            <p v-if="importFile" class="text-xs text-muted mt-1">
              {{ importFile.name }} · {{ (importFile.size / 1024).toFixed(1) }} KB
            </p>
          </div>

          <UAlert v-if="importError" color="error" variant="soft" :title="importError" />

          <div v-if="importResult" class="space-y-2">
            <div class="grid grid-cols-3 gap-2 text-center">
              <UCard>
                <p class="text-xs text-muted">
                  Total
                </p>
                <p class="text-xl font-semibold">
                  {{ importResult.totalRows }}
                </p>
              </UCard>
              <UCard>
                <p class="text-xs text-muted">
                  Imported
                </p>
                <p class="text-xl font-semibold text-primary">
                  {{ importResult.imported }}
                </p>
              </UCard>
              <UCard>
                <p class="text-xs text-muted">
                  Failed
                </p>
                <p class="text-xl font-semibold" :class="importResult.failed ? 'text-error' : ''">
                  {{ importResult.failed }}
                </p>
              </UCard>
            </div>

            <div v-if="importResult.errors.length" class="max-h-64 overflow-auto border rounded">
              <table class="w-full text-xs">
                <thead class="bg-muted/50 sticky top-0">
                  <tr>
                    <th class="text-left p-2 w-20">
                      Row
                    </th>
                    <th class="text-left p-2">
                      Error
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(e, i) in importResult.errors" :key="i" class="border-t">
                    <td class="p-2 font-mono">
                      {{ e.row > 0 ? e.row : '—' }}
                    </td>
                    <td class="p-2">
                      {{ e.message }}
                    </td>
                  </tr>
                </tbody>
              </table>
              <p v-if="importResult.truncatedErrors" class="p-2 text-xs text-muted bg-muted/30">
                More errors omitted from this report.
              </p>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="ghost" @click="importOpen = false">
              Close
            </UButton>
            <UButton
              icon="i-lucide-upload"
              color="primary"
              :loading="importing"
              :disabled="!importFile"
              @click="onImport"
            >
              Upload &amp; import
            </UButton>
          </div>
        </div>
      </template>
    </UModal>

    <UModal v-model:open="open" :title="editing ? 'Edit comic' : 'Add comic'">
      <template #body>
        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
          <UFormField label="Title" name="title" required>
            <UInput v-model="state.title" class="w-full" />
          </UFormField>
          <UFormField label="Series" name="serie" required>
            <UInput v-model="state.serie" class="w-full" />
          </UFormField>
          <UFormField label="Number" name="number" required help="Issue or volume number">
            <UInput v-model="state.number" class="w-full" />
          </UFormField>

          <UAlert v-if="submitError" color="error" variant="soft" :title="submitError" />

          <div class="flex justify-end gap-2 pt-2">
            <UButton variant="ghost" @click="open = false">
              Cancel
            </UButton>
            <UButton type="submit" :loading="submitting" color="primary">
              {{ editing ? 'Save' : 'Create' }}
            </UButton>
          </div>
        </UForm>
      </template>
    </UModal>
  </UContainer>
</template>
