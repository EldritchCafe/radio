<svelte:head>
    <title>{`${ $current ? `${$current.metadata.title} ∴ ` : ''}Eldritch Radio`}</title>
</svelte:head>

<main class="app">
    <header class="header">
        <h1>Eldritch Radio</h1>
    </header>

    <section class="viewer">
        {#if $current}
            <Viewer></Viewer>
            <Controls></Controls>
        {/if}
    </section>

    <section class="queue">
        <Queue></Queue>
    </section>
</main>


<script>
    import { onMount, onDestroy } from 'svelte'
    import { get } from 'svelte/store'

    import Controls from '/components/Controls.svelte'
    import Queue from '/components/Queue.svelte'
    import Viewer from '/components/Viewer.svelte'
    import { hashtagIterator, combinedIterator } from '/services/mastodon.js'
    import { mkTracksIterator } from '/services/misc.js'

    import { domain, hashtags, queue, next, current, enqueueing, select } from '/store.js'

    let nextUnsubcribe = null
    let currentUnsubcribe = null

    onMount(async () => {
        // const iterator = mkTracksIterator(hashtagIterator(get(domain), get(hashtags)[0]))
        const domainValue = get(domain)
        const hashtagsValue = get(hashtags)

        const iterator = combinedIterator(
            hashtagsValue.map(hashtag => mkTracksIterator(hashtagIterator(domainValue, hashtag)))
        )

        const { value: first } = await iterator.next()

        queue.set([first])
        select(first)

        nextUnsubcribe = next.subscribe(async nextValue => {
            if (nextValue === null) {
                if (!get(enqueueing)) {
                    enqueueing.set(true)

                    const { value: newTrack } = await iterator.next()

                    if (newTrack) {
                        queue.update(queueValue => [...queueValue, newTrack])
                        next.set(newTrack)
                    }

                    enqueueing.set(false)
                }
            }
        })

        currentUnsubcribe = current.subscribe(currentValue => {
            if (currentValue !== null) {
                next.update(nextValue => {
                    if (nextValue === currentValue) {
                        return null
                    } else {
                        return nextValue
                    }
                })
            }
        })
    })

    onDestroy(() => {
        for (const unsubcribe of [nextUnsubcribe, currentUnsubcribe]) {
            if (unsubcribe) {
                unsubcribe()
            }
        }
    })
</script>

<style>
    .app {
        min-width: 100%;
        min-height: 100%;
    }
</style>