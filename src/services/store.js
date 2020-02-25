import { writable, tap } from 'svelte-pipeable-store'

export { get } from 'svelte/store'
export * from 'svelte-pipeable-store'

export const writableStorage = (storage, storageKey, defaultValue) => {
    const item = storage.getItem(storageKey)
    const value = item === null ? defaultValue : JSON.parse(item)

    return writable(value)
        .pipe(tap(value => storage.setItem(storageKey, JSON.stringify(value))))
}