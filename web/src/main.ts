import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

createApp(App).mount('#app')

// Enregistrement sécurisé du Service Worker PWA pour TypeScript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('Service Worker enregistré avec succès :', reg.scope)
      })
      .catch((err: unknown) => {
        console.log('Échec de l\'enregistrement du Service Worker :', err)
      })
  })
}