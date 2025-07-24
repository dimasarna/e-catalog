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
          v-model="apiKey"
          label="Private Key"
          hint="Nomor key untuk connect ke database"
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
import { useQuasar } from 'quasar'
import { useSettingsStore } from 'stores/settings'
import { ref } from 'vue'

const $q = useQuasar()
const settings = useSettingsStore()

const host = ref(settings.host)
const apiKey = ref(settings.apiKey)

const onSubmit = () => {
  settings.setHost(host.value)
  settings.setApiKey(apiKey.value)

  $q.notify({
    type: 'positive',
    message: 'Submitted'
  })
}

const onReset = () => {
  host.value = null,
  apiKey.value = null
}
</script>