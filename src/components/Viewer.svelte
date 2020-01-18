<div>
    <div class="embed-container" class:hidden={!ready}>
        <YoutubePlayer
            id={$current ? $current.data.id : null}
            paused={$paused}
            muted={$muted}
            volume={$volume}
            bind:ready
            bind:ended
            bind:currentTime
            bind:duration
            bind:seek={seek}
        ></YoutubePlayer>

        <div class="embed-overlay" on:click={() => $paused = !$paused}></div>
    </div>

    {#if !ready}
        LOADING TRACK
    {/if}

    {#if duration}
        {currentTimeText}
        <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            on:input={(e) => seek(e.target.value, false)}
            on:change={(e) => seek(e.target.value, true)}>
        {durationText}
    {/if}
</div>

<script>
    import { get } from 'svelte/store'
    import YoutubePlayer from '/components/YoutubePlayer'
    import { secondsToElapsedTime } from '/util.js'
    import { paused, muted, volume, current, selectNext, loading } from '/store.js'

    let ready = null
    let ended = null
    let currentTime = null
    let duration = null
    let seek = null

    $: currentTimeText = currentTime !== null ? secondsToElapsedTime(currentTime) : null
    $: durationText = duration !== null ? secondsToElapsedTime(duration) : null

    $: if (ended) {
        selectNext()
    }
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