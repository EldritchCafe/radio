import { writable, derived, get } from 'svelte/store'
import { writableLocalStorage } from '/services/svelte.js'
import { hashtagIterator } from '/services/mastodon.js'
import { mkTracksIterator } from '/services/misc.js'

export const domain = writableLocalStorage('domain', 'eldritch.cafe')

export const hashtags = writableLocalStorage('hashtags', [
    'np',
    'nowplaying',
    'tootradio',
    'pouetradio'
])



const tracksIterator = mkTracksIterator(hashtagIterator(get(domain), get(hashtags)[0]))



export const paused = writable(true)
export const muted = writableLocalStorage('muted', false)
export const volume = writableLocalStorage('volume', 100)

export const next = writable(null)
export const enqueueing = writable(false)

export const queue = writable([])
export const index = writable(null)
export const current = derived([queue, index], ([$queue, $index]) => $queue[$index])

export const canPrevious = derived([index, queue], ([$index, $queue]) => $index !== null && $index < $queue.length - 1)
export const canNext = derived([index, next], ([$index, $next]) => $index !== null && ($index > 0 || $next !== null))

export const loading = writable(false)

next.subscribe(async $next => {
    if ($next === null) {
        if (!get(enqueueing)) {
            enqueueing.set(true)

            const { value: newTrack } = await tracksIterator.next()

            if (newTrack) {
                next.set(newTrack)
            }

            enqueueing.set(false)
        }
    }
})

export const selectPrevious = () => {
    if (get(canPrevious)) {
        index.update($index => $index + 1)
    }
}

export const selectNext = () => {
    if (get(canNext)) {
        const $index = get(index)

        if ($index === 0) {
            queue.update($queue => {
                const $next = get(next)
                next.set(null)

                return [$next, ...$queue]
            })
        } else {
            index.update($index => $index - 1)
        }
    }
}