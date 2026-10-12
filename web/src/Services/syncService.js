// src/services/syncService.js
import { openDB } from 'idb'

const DB_NAME = 'MayasVolailleDB'
const STORE_NAME = 'pendingOperations'

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
      }
    }
  })
}

// Sauvegarde locale hors-ligne
export const enregistrerOperationLocale = async (operation) => {
  const db = await initDB()
  const payload = {
    ...operation,
    timestamp: new Date().toISOString(),
    synced: false
  }
  await db.add(STORE_NAME, payload)
  return payload
}

// Synchronisation avec le serveur
export const synchroniserAvecServeur = async (apiEndpoint) => {
  const db = await initDB()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const store = tx.objectStore(STORE_NAME)
  const pending = await store.getAll()

  if (pending.length === 0) return { count: 0, message: 'Rien à synchroniser' }

  try {
    const response = await fetch(`${apiEndpoint}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operations: pending })
    })

    if (response.ok) {
      const clearTx = db.transaction(STORE_NAME, 'readwrite')
      await clearTx.objectStore(STORE_NAME).clear()
      return { count: pending.length, success: true }
    }
  } catch (err) {
    console.error('Échec de la synchronisation serveur :', err)
    return { count: 0, success: false, error: err }
  }
}