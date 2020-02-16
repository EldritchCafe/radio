<div class="playerBig">
    <div class="playerBig__player">
        <YoutubePlayer
            id={$current ? $current.media.credentials.id : null}
            class="playerBig__iframe"
            paused={$paused}
            muted={$muted}
            volume={$volume}
            bind:ready
            bind:ended
            bind:error
            bind:currentTime
            bind:duration
            bind:seek={seek}
        ></YoutubePlayer>

        <div class="playerBig__overlay" on:click={() => $paused = !$paused}></div>
        <button class="playerBig__reduce">Reduce<IconReduce></IconReduce></button>
    </div>

    {#if !ready}
        LOADING TRACK
    {/if}

    <Progress
        duration={duration}
        currentTime={currentTime}
        on:input={event => updateCurrentTime(event.target.value, false)}
        on:change={event => updateCurrentTime(event.target.value, true)}
    ></Progress>
</div>

<script>
    import { get } from 'svelte/store'
    import IconReduce from '/components/icons/player/Reduce.svelte'
    import YoutubePlayer from '/components/YoutubePlayer'
    import Progress from '/components/player/Progress'
    import { paused, muted, volume, current, selectNext, loading } from '/store.js'

    let ready = null
    let ended = null
    let error = null
    let currentTime = null
    let duration = null
    let seek = null

    $: if (ended || error) {
        selectNext()
    }

    const updateCurrentTime = (seconds, seekAhead) => {
        seek(seconds, seekAhead)
        currentTime = seconds
    }
</script>
