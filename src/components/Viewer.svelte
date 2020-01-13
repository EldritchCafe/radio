<div>
    <div class:hidden={!duration}>
        <div bind:this={element}></div>
    </div>

    {#if duration}
        {currentTimeText}
        <input type="range" min="0" max={duration} value={currentTime} disabled>
        {durationText}
    {/if}
</div>

<script>
    import { onMount, onDestroy } from 'svelte'
    import { get } from 'svelte/store'
    import YoutubePlayer from 'yt-player'
    import { entry, paused, muted, volume } from '/store.js'
    import { secondsToElapsedTime } from '/util.js'

    let element
    let player

    let currentTime = null
    let duration = null

    let currentTimeText = null
    let durationText = null

    $: currentTimeText = currentTime !== null ? secondsToElapsedTime(currentTime) : null
    $: durationText = duration !== null ? secondsToElapsedTime(duration) : null

    $: updateEntry($entry)
    $: updatePaused($paused)
    $: updateMuted($muted)
    $: updateVolume($volume)

    const updateViewerDurationCallback = () => {
        if (player) {
            duration = player.getDuration()
            currentTime = player.getCurrentTime()
        }
    }

    const updateEntry = (entry) => {
        if (player && entry) {
            duration = null
            currentTime = null
            player.off('playing', updateViewerDurationCallback)

            player.load(entry.data.id, !$paused)
        }
    }

    const updatePaused = (paused) => {
        if (player) paused ? player.pause() : player.play()
    }

    const updateMuted = (muted) => {
        if (player) muted ? player.mute() : player.unMute()
    }

    const updateVolume = (volume) => {
        if (player) player.setVolume(volume)
    }



    onMount(() => {
        player = new YoutubePlayer(element, {
            width: 300,
            height: 300,
            autoplay: !$paused,
            controls: false,
            keyboard: false,
            fullscreen: false,
            modestBranding: true,
            related: false
        })

        updatePaused($paused)
        updateMuted($muted)
        updateVolume($volume)

        // player.on('playing', () => {
        //     $paused = false
        // })

        // player.on('paused', () => {
        //     $paused = true
        // })

        player.on('unstarted', () => {
            player.once('playing', updateViewerDurationCallback)
        })

        player.on('timeupdate', (time) => {
            currentTime = time
        })

        player.on('ended', () => entry.next())

        player.on('unplayable', (...args) => {
            console.log('unplayable', ...args)
            entry.next()
        })

        player.on('error', (...args) => {
            console.log('error', ...args)
            entry.next()
        })
    })

    onDestroy(() => {
        if (player) {
            player.destroy()
        }
    })
</script>

<style>
    .hidden {
        display: none;
    }
</style>