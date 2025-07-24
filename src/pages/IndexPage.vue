<template>
  <div class="q-pa-md">
    <q-table
      ref="tableRef"
      title="Daftar Barang dan Jasa"
      :rows="rows"
      :columns="columns"
      row-key="id"
      v-model:pagination="pagination"
      :loading="loading"
      :filter="filter"
      selection="multiple"
      v-model:selected="selected"
      @request="onRequest"
    >
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:top-selection>
        <q-btn color="negative" :disable="loading" label="Delete data" @click="deleteData" />
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { Meilisearch } from 'meilisearch'
import { useSettingsStore } from '../stores/settings'
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'

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

const tableRef = ref()
const rows = ref([])
const loading = ref(false)
const filter = ref('')
const pagination = ref({
  sortBy: null,
  descending: false,
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 100
})
const selected = ref([])

const onRequest = async (props) => {
  loading.value = true

  try {
    const { page, rowsPerPage } = props.pagination
    const searchQuery = filter.value || ''

    const response = await client.index('items').search(searchQuery, {
      limit: rowsPerPage,
      offset: (page - 1) * rowsPerPage,
    })

    rows.value = response.hits
    pagination.value.rowsNumber = response.estimatedTotalHits
    pagination.value.page = page
    pagination.value.rowsPerPage = rowsPerPage
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to load data: ' + error.message,
    })
  }

  loading.value = false
}

const deleteData = async () => {
  loading.value = true

  try {
    const ids = selected.value.map(item => item.id)
    const response = await client.index('items').deleteDocuments(ids)
    rows.value = rows.value.filter(row => !ids.includes(row.id))
    selected.value = []

    $q.notify({
      type: 'positive',
      message: 'Data deleted successfully!',
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to delete data: ' + error.message,
    })
  }

  loading.value = false
}

onMounted(() => {
  tableRef.value.requestServerInteraction()
})
</script>
