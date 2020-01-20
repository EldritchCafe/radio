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

export const paused = writable(true)
export const muted = writableLocalStorage('muted', false)
export const volume = writableLocalStorage('volume', 100)

export const index = writable(null)
export const queue = writable([])
export const enqueueing = writable(false)
export const current = derived([queue, index], ([$queue, $index]) => $queue[$index])

export const canPrevious = derived([index], ([$index]) => $index !== null && $index > 0)
export const canNext = derived([index, queue], ([$index, $queue]) => $index !== null && $index < $queue.length - 1)

export const loading = writable(false)





export const selectPrevious = () => { if (get(canPrevious)) index.update($index => $index - 1) }
export const selectNext = () => { if (get(canNext)) index.update($index => $index + 1) }


const tracksIterator = mkTracksIterator(hashtagIterator(get(domain), get(hashtags)[0]))

export const enqueue = async () => {
    if (!get(enqueueing)) {
        enqueueing.set(true)

        const { value: newTrack } = await tracksIterator.next()

        if (newTrack) {
            queue.update($queue => [...$queue, newTrack])
        }

        enqueueing.set(false)
    }
}