import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const host = ref(LocalStorage.getItem('host') || 'http://127.0.0.1:7700')
  const apiKey = ref(LocalStorage.getItem('apiKey') || 'uLj9DmMV4bixoEk5vNFjF2Ip-SlQXV2fuBLHj2DT0NA')
  
  const setHost = (newHost) => {
    host.value = newHost
    LocalStorage.set('host', newHost)
  }

  const setApiKey = (newApiKey) => {
    apiKey.value = newApiKey
    LocalStorage.set('apiKey', newApiKey)
  }

  return { host, apiKey, setHost, setApiKey }
})