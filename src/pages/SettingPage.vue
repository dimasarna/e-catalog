<template>
    <div class="q-pa-md" style="max-width: 400px">
  
      <q-form
        @submit="onSubmit"
        @reset="onReset"
        class="q-gutter-md"
      >
        <q-input
          filled
          v-model="host"
          label="Server Host"
          hint="Alamat server (termasuk http://)"
          lazy-rules
          :rules="[ val => val && val.length > 0 || 'Please type something']"
        />

        <q-input
          filled
          v-model="port"
          label="Server Port"
          hint="Nomor port database"
          lazy-rules
          :rules="[ val => val && val.length > 0 || 'Please type something']"
        />
  
        <div>
          <q-btn label="Submit" type="submit" color="primary"/>
          <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
        </div>
      </q-form>
  
    </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import { useSettingsStore } from 'stores/settings'
import { ref } from 'vue'

const $q = useQuasar()
const settingsStore = useSettingsStore()
const { settings } = storeToRefs(settingsStore)
const { updateSettings } = settingsStore

const host = ref(settings.value.host)
const port = ref(settings.value.port)

const onSubmit = () => {
  updateSettings({
    host: host.value,
    port: port.value
  })

  $q.notify({
    type: 'positive',
    message: 'Submitted'
  })
}

const onReset = () => {
  host.value = null,
  port.value = null
}
</script>