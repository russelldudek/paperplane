const DATABASE_NAME = 'paper-airplane-lab'
const DATABASE_VERSION = 1

export type StoreName = 'designs' | 'attempts'

let databasePromise: Promise<IDBDatabase> | null = null

export function openDatabase(): Promise<IDBDatabase> {
  if (databasePromise) return databasePromise
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('IndexedDB is not available in this environment.'))

  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    request.onerror = () => reject(request.error ?? new Error('Unable to open local laboratory database.'))
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains('designs')) database.createObjectStore('designs', { keyPath: 'id' })
      if (!database.objectStoreNames.contains('attempts')) {
        const store = database.createObjectStore('attempts', { keyPath: 'id' })
        store.createIndex('designId', 'designId', { unique: false })
      }
    }
    request.onsuccess = () => resolve(request.result)
  })
  return databasePromise
}

export async function putRecord<T>(storeName: StoreName, record: T): Promise<void> {
  const database = await openDatabase()
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite')
    transaction.objectStore(storeName).put(record)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error ?? new Error(`Unable to save ${storeName} record.`))
  })
}

export async function getAllRecords<T>(storeName: StoreName): Promise<T[]> {
  const database = await openDatabase()
  return new Promise<T[]>((resolve, reject) => {
    const request = database.transaction(storeName, 'readonly').objectStore(storeName).getAll()
    request.onsuccess = () => resolve(request.result as T[])
    request.onerror = () => reject(request.error ?? new Error(`Unable to read ${storeName} records.`))
  })
}

export async function deleteRecord(storeName: StoreName, id: string): Promise<void> {
  const database = await openDatabase()
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite')
    transaction.objectStore(storeName).delete(id)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error ?? new Error(`Unable to delete ${storeName} record.`))
  })
}
