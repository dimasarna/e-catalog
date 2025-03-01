<template>
  <q-page class="flex">
    <div class="row q-pa-md" style="width: 400px;">
      <div class="col">
        <q-input
          v-model="query"
          debounce="1000"
          placeholder="Isolator 160 kN"
        />
      </div>
    </div>
    <div class="row q-pa-md">
      <div class="col">
        <SlickgridVue
          grid-id="catalog"
          v-model:columns="columnDefinitions"
          v-model:options="gridOptions"
          v-model:data="dataset"
          @onVueGridCreated="onGridReady($event.detail)"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import axios from 'axios'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import { Formatters, SlickgridVue } from 'slickgrid-vue'
import { useSettingsStore } from 'stores/settings'
import { onBeforeMount, ref, watch } from 'vue'

const $q = useQuasar()

const query = ref('')

const settingsStore = useSettingsStore()
const { settings } = storeToRefs(settingsStore)

const gridOptions = ref({})
const columnDefinitions = ref([])
const dataset = ref([])

let vueGrid = null

watch(query, (newQuery, lastQuery) => {
  updateData(newQuery)
})

onBeforeMount(() => {
  defineGrid()
})

function onGridReady(grid) {
    vueGrid = grid
}

function defineGrid() {
  columnDefinitions.value = [
    {
      id: 'delete',
      field: 'delete',
      excludeFromHeaderMenu: true,
      formatter: Formatters.icon,
      params: { iconCssClass: 'mdi mdi-trash-can pointer' },
      minWidth: 32,
      maxWidth: 32,
      onCellClick: (_e, args) => {
        $q.dialog({
          title: 'Confirm',
          message: 'Are you sure about deleting this data?',
          cancel: true,
          persistent: true
        }).onOk(() => {
          deleteData(args.dataContext.id)
        })
      }
    },
    { id: 'name', name: 'Name', field: 'name' },
    { id: 'specification', name: 'Specification', field: 'specification' },
    { id: 'uom', name: 'Unit of Measurement', field: 'uom' },
    { id: 'price', name: 'Price', field: 'price' },
    { id: 'reference', name: 'Reference', field: 'reference' },
  ]

  gridOptions.value = {
    enableAutoResize: true,
    autoResize: {
      minWidth: 400,
      maxWidth: 1120
    },
    enablePagination: true
  }

  updateData(query.value)
}

function updateData(query) {
  const server = `${settings.value.host}:${settings.value.port}`
  const api = '/_search'

  axios({
    url: api,
    method: 'post',
    baseURL: server,
    data: (query === '') ? '' : {
      query: {
        query_string: {
          query: query
        }
      }
    }
  }).then((response) => {
    const data = response.data.hits.hits.map((item) => {
      return { ...item._source }
    })

    dataset.value = data
  })
}

function deleteData(id) {
  const server = `${settings.value.host}:${settings.value.port}`
  const api = '/catalog/_doc/' + id

  axios({
    url: api,
    method: 'delete',
    baseURL: server,
  }).then((response) => {
    if (response.data.result === 'deleted') {
      vueGrid.gridService.deleteItemById(id)
      
      $q.notify({
        type: 'positive',
        message: 'Data deleted'
      })
    }
  }).catch((reason) => {
    $q.notify({
      type: 'negative',
      message: reason.message
    })
  })
}
</script>
