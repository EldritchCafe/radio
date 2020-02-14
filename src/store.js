import { writable, derived, get } from 'svelte/store'
import { writableLocalStorage } from '/services/svelte.js'

export const domain = writableLocalStorage('domain', 'eldritch.cafe')

export const hashtags = writableLocalStorage('hashtags', [
    'np',
    'nowplaying',
    'tootradio',
    'pouetradio'
])

export const paused = writable(true)
export const muted = writableLocalStorage('muted', false)
export const volume = writableLocalStorage('volume', 100)

export const queue = writable([])
export const next = writable(null)
export const current = writable(null)
export const enqueueing = writable(false)

export const loading = writable(false)

const index = derived([queue, current], ([$queue, $current]) => {
    const i = $queue.indexOf($current)
    return i === -1 ? null : i
})

export const canPrevious = derived([queue, index], ([$queue, $index]) => $index !== null && $index > 0)
export const canNext = derived([queue, index], ([$queue, $index]) => $index !== null && $index < $queue.length - 1)


export const select = track => {
    console.log(`Select ${track.metadata.title}`)
    current.set(track)
}

export const selectPrevious = () => {
    if (get(canPrevious)) {
        const $queue = get(queue)
        const $index = get(index)
        select($queue[$index - 1])
    }
}

export const selectNext = () => {
    if (get(canNext)) {
        const $queue = get(queue)
        const $index = get(index)
        select($queue[$index + 1])
    }
}