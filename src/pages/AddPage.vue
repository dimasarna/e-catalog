<template>
  <div class="q-pa-md">
    <q-table
      title="Daftar Barang dan Jasa"
      :rows="rows"
      :columns="columns"
      row-key="id"
      :pagination="pagination"
      :loading="loading"
      :filter="filter"
    >
      <template v-slot:top>
        <q-input
          @update:model-value="files => { file = files[0] }"
          filled
          type="file"
          hint="Import from template"
        />
        <q-space />
        <q-btn class="q-ml-sm" color="secondary" :disable="loading" label="Save data" @click="saveData" />
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { Meilisearch } from 'meilisearch'
import { useSettingsStore } from '../stores/settings'
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { faker } from '@faker-js/faker'
import { read, utils } from 'xlsx'

const $q = useQuasar()
const settings = useSettingsStore()
const client = new Meilisearch({
  host: settings.host,
  apiKey: settings.apiKey,
})

const columns = [
  { name: 'sap_code', label: 'SAP Code', align: 'left', field: 'sap_code' },
  { name: 'name', label: 'Nama', align: 'left', field: 'name' },
  { name: 'spesification', label: 'Spesifikasi', align: 'left', field: 'spesification' },
  { name: 'uom', label: 'Satuan', align: 'left', field: 'uom' },
  { name: 'price', label: 'Harga', align: 'left', field: 'price' },
  { name: 'reference', label: 'Referensi', align: 'left', field: 'reference' }
]

const rows = ref([])
const loading = ref(false)
const filter = ref('')
const pagination = ref({
  page: 1,
  rowsPerPage: 20,
  sortBy: null,
  descending: false,
})
const file = ref(null)

const saveData = async () => {
  loading.value = true

  try {
    const response = await client.index('items').addDocuments(rows.value)

    rows.value = []
    file.value = null

    $q.notify({
      type: 'positive',
      message: 'Data saved successfully!',
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to save data: ' + error.message,
    })
  }

  loading.value = false
}

watch(file, async (newFile) => {
    if (!newFile) return
    loading.value = true

    try {
      const data = await newFile.arrayBuffer()
      const workbook = read(data)
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const sheetRows = utils.sheet_to_json(sheet)
      const formattedRows = sheetRows.map(row => ({
        ...row,
        id: faker.string.uuid(),
      }))

      rows.value = formattedRows
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Failed to read file: ' + error.message,
      })
    }

    loading.value = false
})
</script>