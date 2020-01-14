import { writable, get } from 'svelte/store'
import { mkTracksIterator } from '/util.js'

export const writableLocalStorage = (key, value) => {
    const item = JSON.parse(localStorage.getItem(key))
    const store = writable(item === null ? value : item)

    store.subscribe(x => localStorage.setItem(key, JSON.stringify(x)))

    return store
}

export const stackStore = (domain, hashtags) => {
    const tracksIterator = mkTracksIterator(domain, hashtags)

    const store = writable([])
    const { update, subscribe } = store

    let promise = Promise.resolve()
    const buffer = []

    const load = async () => {


        const n = 5 - buffer.length

        for (let i = 0; i < n; i++) {
            const iteratorResult = await tracksIterator.next()

            if (iteratorResult.value) {
                update(entries => [...entries, iteratorResult.value])
            } else {
                // iterator don't have new entries for now
                break
            }
        }
    }

    const unshift = async () => {
        let promise = promise.then(() => {

        })
    }

    promise = load()

    return { subscribe, unshift }
}

export const entryStore = (entriesStore) => {
    const store = writable(null)
    const { set, update, subscribe } = store

    const select = (entry) => {
        update(() => entry)

        const entriesList = get(entriesStore)
        const index = entriesList.indexOf(entry)

        if (index === entriesList.length - 1) {
            entriesStore.load(1)
        }
    }

    const previous = () => {
        const entriesList = get(entriesStore)

        update(currentEntry => {
            const index = entriesList.indexOf(currentEntry)

            return index > 0 ? entriesList[index - 1] : null
        })
    }

    const next = () => {
        const entriesList = get(entriesStore)

        update(oldEntry => {
            if (entriesList.length === 0) {
                return null
            }

            const index = entriesList.indexOf(oldEntry)

            if (index === -1) {
                return null
            }

            const nextIndex = index + 1

            if (nextIndex === entriesList.length - 1) {
                entries.load(1)
            }

            return entriesList[nextIndex]
        })
    }

    return { subscribe, set: select, previous, next }
}

export const entriesStore = (domain, hashtags) => {
    const tracksIterator = mkTracksIterator(domain, hashtags)

    const store = writable([])
    const { update, subscribe } = store

    const load = async (number) => {
        for (let i = 0; i < number; i++) {
            const iteratorResult = await tracksIterator.next()

            if (iteratorResult.value) {
                update(entries => [...entries, iteratorResult.value])
            } else {
                // iterator don't have new entries for now
                break
            }
        }
    }

    return { subscribe, load }
}