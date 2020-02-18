import { writable, readable } from 'svelte-pipeable-store'

export { get } from 'svelte/store'
export * from 'svelte-pipeable-store'

export const writableLocalStorage = (key, value) => {
    const item = JSON.parse(localStorage.getItem(key))
    const store = writable(item === null ? value : item)

    store.subscribe(x => localStorage.setItem(key, JSON.stringify(x)))

    return store
}

export const distinct = () => {
    return ({ subscribe }) => readable(undefined, set => {
        let last

        return subscribe(v => {
            if (last !== v) {
                set(v)
                last = v
            }
        })
    })
}