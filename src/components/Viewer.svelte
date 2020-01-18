<div>
    <div class="embed-container" class:hidden={!loaded}>
        <div bind:this={element}></div>
        <div class="embed-overlay" on:click={() => $paused = !$paused}></div>
    </div>

    {#if !loaded}
        LOADING TRACK
    {/if}

    {#if duration}
        {currentTimeText}
        <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            on:input={ (e) => updatePlayerCurrentTime(e.target.value) }
            on:mousedown={() => { if (player && !$paused) player.pause() }}
            on:mouseup={() => { if (player && !$paused) player.play() }}>
        {durationText}
    {/if}
</div>

<script>
    import { onMount, onDestroy } from 'svelte'
    import { get } from 'svelte/store'
    import YoutubePlayer from 'yt-player'
    import { secondsToElapsedTime } from '/util.js'
    import { paused, muted, volume, current, selectNext, loading } from '/store.js'

    let element
    let player

    let currentTime = null
    let duration = null
    let loaded = false

    let currentTimeText = null
    let durationText = null

    $: currentTimeText = currentTime !== null ? secondsToElapsedTime(currentTime) : null
    $: durationText = duration !== null ? secondsToElapsedTime(duration) : null

    $: updatePlayerVideoId($current)
    $: updatePlayerPaused($paused)
    $: updatePlayerMuted($muted)
    $: updatePlayerVolume($volume)

    const updateViewerDurationCallback = () => {
        if (player) {
            duration = player.getDuration()
            currentTime = player.getCurrentTime()
            $loading = false
        }
    }

    const updatePlayerVideoId = ($current) => {
        if (player && $current) {
            duration = null
            currentTime = null
            $loading = true
            loaded = false
            player.off('playing', updateViewerDurationCallback)

            player.load($current.data.id, !$paused)
        }
    }

    const updatePlayerPaused = (paused) => {
        if (player) paused ? player.pause() : player.play()
    }

    const updatePlayerMuted = (muted) => {
        if (player) muted ? player.mute() : player.unMute()
    }

    const updatePlayerVolume = (volume) => {
        if (player) player.setVolume(volume)
    }

    const updatePlayerCurrentTime = (seconds) => {
        if (player) player.seek(seconds)
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

        updatePlayerPaused($paused)
        updatePlayerMuted($muted)
        updatePlayerVolume($volume)

        player.on('unstarted', () => {
            loaded = true
            player.once('playing', updateViewerDurationCallback)
        })

        player.on('timeupdate', (time) => {
            currentTime = time
        })

        player.on('ended', () => {
            selectNext()
        })

        player.on('unplayable', (...args) => {
            console.log('unplayable', ...args)
            selectNext()
        })

        player.on('error', (...args) => {
            console.log('error', ...args)
            selectNext()
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

    .embed-container {
        position: relative;
    }

    .embed-overlay {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
    }
</style>