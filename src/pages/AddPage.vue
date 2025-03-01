<template>
    <div class="row full-width">
        <div class="col q-pa-md">
            <q-btn
                color="white"
                text-color="black"
                label="Add New Row"
                @click="addNewRow()"
            />
        </div>
        <q-space />
        <div class="column items-end">
            <div class="col q-pa-md">
                <q-btn
                    color="secondary"
                    label="Submit Items"
                    @click="submitItems()"
                />
            </div>
        </div>
    </div>
  <div class="row full-width">
    <div class="col q-pa-md">
        <SlickgridVue
            grid-id="items"
            v-model:columns="columnDefinitions"
            v-model:options="gridOptions"
            v-model:data="dataset"
            @onVueGridCreated="onGridReady($event.detail)"
        />
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { Editors, FieldType, SlickgridVue } from 'slickgrid-vue'
import { fakerID_ID as faker } from '@faker-js/faker'
import { ref, onBeforeMount } from 'vue'

import { useSettingsStore } from 'stores/settings'
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const settingsStore = useSettingsStore()
const { settings } = storeToRefs(settingsStore)

const gridOptions = ref()
const columnDefinitions = ref([])
const dataset = ref([])

let vueGrid = null

onBeforeMount(() => {
    defineGrid()
})

function onGridReady(grid) {
    vueGrid = grid
}

function defineGrid() {
    columnDefinitions.value = [
        { id: 'name', name: 'Name', field: 'name', type: FieldType.string, editor: { model: Editors.text } },
        { id: 'specification', name: 'Specification', field: 'specification', type: FieldType.string, editor: { model: Editors.text } },
        { id: 'uom', name: 'Unit of Measurement', field: 'uom', type: FieldType.string, editor: { model: Editors.text } },
        { id: 'price', name: 'Price', field: 'price', type: FieldType.string, editor: { model: Editors.text } },
        { id: 'reference', name: 'Reference', field: 'reference', type: FieldType.string, editor: { model: Editors.text } },
    ]

    gridOptions.value = {
        autoEdit: false,
        autoCommitEdit: true,
        editable: true,
        enableCellNavigation: true,
        enableExcelCopyBuffer: true,
        excelCopyBufferOptions: {
            newRowCreator: (rows) => {
                for (let i = 0; i < rows; i++) {
                    addNewRow()
                }
            }
        },
        enableAutoResize: true,
        autoResize: {
            calculateAvailableSizeBy: 'container'
        }
    }
}

function addNewRow() {
    vueGrid.gridService.addItems({ id: faker.string.uuid() }, { position: 'bottom' })
}

function addMockRow() {
    vueGrid.gridService.addItems({
        id: faker.string.uuid(),
        name: faker.commerce.productName(),
        specification: faker.commerce.isbn(),
        uom: faker.science.unit().name,
        price: faker.commerce.price(),
        reference: faker.company.name()
    }, {
        position: 'bottom'
    })
}

function submitItems() {
    const server = `${settings.value.host}:${settings.value.port}`
    const api = '/_bulk'
    const operations = []

    for (let i = 0, len = dataset.value.length; i < len; i++) {
        operations.push({ index: { _index: 'catalog', _id: dataset.value[i].id } })
        operations.push(dataset.value[i])
    }

    axios({
        url: api,
        method: 'post',
        baseURL: server,
        data: ndserialize(operations),
        headers: {
            'Content-Type': 'application/x-ndjson'
        }
    }).then((response) => {
        if (!response.data.errors) {
            $q.notify({
                type: 'positive',
                message: 'Submitted'
            })

            dataset.value = []
        }
    }).catch((reason) => {
        $q.notify({
            type: 'negative',
            message: reason.message
        })
    })
}

function serialize(object) {
    let json = ''

    try {
        json = JSON.stringify(object)
    } catch (error) {
        $q.notify({
            type: 'negative',
            message: 'Object serialize error'
        })
    }

    return json
}

function ndserialize(array) {
    let ndjson = ''

    if (!Array.isArray(array)) {
        $q.notify({
            type: 'negative',
            message: 'NDJson serialize error'
        })
    } else {
        for (let i = 0, len = array.length; i < len; i++) {
            if (typeof array[i] === 'string') {
                ndjson += array[i] + '\n'
            } else {
                ndjson += serialize(array[i]) + '\n'
            }
        }

        return ndjson
    }
}
</script>