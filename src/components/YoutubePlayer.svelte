<div bind:this={element}></div>

<script>
    import { createEventDispatcher, onMount, onDestroy } from 'svelte'
    import { loadIframeApi, STATE } from '/services/youtube.js'
    import { queue } from '/services/misc.js'

    let element
    let player
    let animationFrameId

    let currentTime
    let duration

    // input props
    export let id
    export let paused
    export let volume

    const dispatch = createEventDispatcher()

    $: load(id)
    $: paused ? pause() : play()
    $: setVolume(volume)
    $: dispatch('timeupdate', currentTime)
    $: dispatch('durationchange', duration)

    const { enqueue, run } = queue()

    export const load = (id) => enqueue((player) => {
        currentTime = null
        duration = null

        player.cueVideoById(id)

        if (!paused) {
            player.playVideo()
        }
    })

    export const play = () => enqueue((player) => {
        player.playVideo()
    })

    export const pause = () => enqueue((player) => {
        player.pauseVideo()
    })

    const setVolume = volume => enqueue(player => {
        player.setVolume(volume)
    })

    export const seek = (seconds, allowSeekAhead) => enqueue((player) => {
        player.seekTo(seconds, allowSeekAhead)
    })

    onMount(async () => {
        const api = await loadIframeApi()

        element.id = Math.random().toString(16).slice(2, 8)

        const onReady = ({ target: player }) => {
            if (player.isMuted()) {
                player.unMute()
            }

            run(player)
        }

        const onStateChange = ({ data: state, target: player }) => {
            switch (state) {
                case STATE.UNSTARTED:
                    break

                case STATE.ENDED:
                    dispatch('ended')
                    break

                case STATE.PLAYING:
                    dispatch('play')

                    const newDuration = player.getDuration()

                    if (duration !== newDuration) {
                        duration = newDuration
                        dispatch('durationchange', duration)
                    }

                    break

                case STATE.PAUSED:
                    dispatch('pause')

                    break

                case STATE.CUED:
                    dispatch('canplay')

                    break
            }

            if (state === STATE.PLAYING) {
                const step = () => {
                    currentTime = player.getCurrentTime()
                    animationFrameId = requestAnimationFrame(step)
                }

                step()
            } else {
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId)
                }
            }
        }

        const onError = error => {
            dispatch('error', error)
        }

        player = new api.Player(element.id, {
            playerVars: {
                autoplay: 0,
                controls: 0,
                enablejsapi: 1,
                modestbranding: 1,
                rel: 0
            },
            events: {
                onReady,
                onStateChange,
                onError
            }
        })
    })

    onDestroy(() => {
        if (player) {
            player.destroy()
        }
    })
</script>