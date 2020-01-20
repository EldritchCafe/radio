import { writable } from 'svelte/store'

export const writableLocalStorage = (key, value) => {
    const item = JSON.parse(localStorage.getItem(key))
    const store = writable(item === null ? value : item)

    store.subscribe(x => localStorage.setItem(key, JSON.stringify(x)))

    return store
}