import { defineStore, acceptHMRUpdate } from 'pinia'
import { useQuasar } from 'quasar'
import { ref, computed } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const $q = useQuasar()

  const getDefaultSettings = () => ({
    host: 'http://localhost',
    port: '9200'
  })

  const getSettings = () => {
    const settings = $q.localStorage.getItem('settings')

    return settings ? JSON.parse(settings) : getDefaultSettings()
  }

  const updateSettings = (partialSettings) => {
    settings.value = {
      ...settings.value,
      ...partialSettings
    }
    
    $q.localStorage.setItem('settings', JSON.stringify(settings.value))
  }

  const settings = ref(getSettings())

  return { settings, updateSettings }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSettingsStore, import.meta.hot))
}
