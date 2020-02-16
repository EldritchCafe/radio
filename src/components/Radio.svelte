<svelte:head>
    <title>{`${ $current ? `${$current.title} ∴ ` : ''}Eldritch Radio`}</title>
</svelte:head>

<div class="app container">
    <Header></Header>

    <section class="viewer">
        {#if $current}
            <Viewer></Viewer>
            <Controls></Controls>
        {/if}
    </section>

    <section class="queue">
        <Queue></Queue>
    </section>

    <Footer></Footer>
</div>

<script>
    import { onMount, onDestroy } from 'svelte'
    import { derived, get } from 'svelte/store'

    import Header from '/components/layout/Header.svelte'
    import Footer from '/components/layout/Footer.svelte'
    import Controls from '/components/Controls.svelte'
    import Queue from '/components/Queue.svelte'
    import Viewer from '/components/Viewer.svelte'
    import { radioIterator, radioShareIterator } from '/services/radio.js'
    import { fetchStatus } from '/services/mastodon.js'

    import { domain, hashtags, queue, next, current, enqueueing, select } from '/store.js'
    import DeepSet from '/services/deep-set.js'

    export let share

    const cache = new DeepSet()

    let nextUnsubcribe = null
    let currentUnsubcribe = null

    onMount(async () => {
        let iterator

        if (share != null) {
            const track = await fetchStatus(share.domain, share.id)
            iterator = radioShareIterator(track, get(domain), get(hashtags), cache)
        } else {
            iterator = radioIterator(get(domain), get(hashtags), cache)
        }

        // generated multiples times cannot usable and don't free resources
        // const iterator = derived([domain, hashtags], ([$domain, $hashtags]) => radioIterator($domain, $hashtags))

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