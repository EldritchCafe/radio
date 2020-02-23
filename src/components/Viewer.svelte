<div class="player" class:playerBig={large}>
    <div class="playerBig__player" class:placeholder={!ready} class:hidden={!large}>
        {#if $current}
        <YoutubePlayer
            id={$current ? $current.media.credentials.id : null}
            class="playerBig__iframe"
            paused={$paused}
            volume={$volume}
            bind:ready
            bind:ended
            bind:error
            bind:currentTime
            bind:duration
            bind:seek={seek}
        ></YoutubePlayer>
        <div class="playerBig__overlay" on:click={() => $paused = !$paused}></div>
        <button
            class="playerBig__reduce"
            class:active={ready && $paused}
            on:click|stopPropagation={() => switchBigPlayer()}
        >
            Reduce<IconReduce></IconReduce>
        </button>
        {/if}
    </div>
    <div class="playerMini" class:hidden="{large}">
        <div class="playerCover" class:placeholder={!$current}>
            {#if $current}
                <img
                    class="playerCover__img"
                    src={'https://img.youtube.com/vi/' + $current.media.credentials.id + '/mqdefault.jpg'}
                    alt="cover"
                >
                <button
                    class="playerCover__expand"
                    aria-label="Expand player"
                    title="Expand player"
                    on:click={() => switchBigPlayer()}
                ><IconExpand></IconExpand></button>
            {/if}
        </div>
    </div>

    <Progress
        duration={duration}
        currentTime={currentTime}
        ready={ready}
        on:input={event => updateCurrentTime(event.target.value, false)}
        on:change={event => updateCurrentTime(event.target.value, true)}
    ></Progress>

    <div class="playerTrack">
        <div class="playerTrack__infos">
            <div class="playerTrack__name" class:placeholder={!$current}>{#if $current}{$current.media.title}{/if}</div>
            <div class="playerTrack__referer" class:placeholder={!$current}>
                {#if $current}shared by <span class="playerTrack__username">{$current.referer.username}</span>{/if}
            </div>
        </div>
        <!--<button class="playerTrack__fav" class:hidden={!$current} aria-label="Fav"><IconHeart></IconHeart></button>-->
    </div>

    <Controls large={large}></Controls>
</div>


<!-- Sticky player -->
<div class="playerSticky" class:hidden={!sticky}>
    <div class="container">
        {#if $current}
            <div class="playerSticky__cover">
                <img
                    class="playerSticky__coverImg"
                    src={'https://img.youtube.com/vi/' + $current.media.credentials.id + '/mqdefault.jpg'}
                    alt="cover"
                >
            </div>
            <Controls large={false}></Controls>
            <div class="playerSticky__infos">
                <div class="playerSticky__track">{$current.media.title}</div>
                <Progress
                    duration={duration}
                    currentTime={currentTime}
                    ready={ready}
                    on:input={event => updateCurrentTime(event.target.value, false)}
                    on:change={event => updateCurrentTime(event.target.value, true)}
                ></Progress>
                <div class="playerSticky__referer">shared by <span class="playerTrack__username">{$current.referer.username}</div>
            </div>
        {/if}
    </div>
</div>


<script>
    import { getContext } from 'svelte'
    import Controls from '/components/Controls.svelte'
    import IconReduce from '/components/icons/player/Reduce.svelte'
    import IconExpand from '/components/icons/player/Expand.svelte'
    import IconHeart from '/components/icons/Heart.svelte'
    import YoutubePlayer from '/components/YoutubePlayer'
    import Progress from '/components/player/Progress'

    export let large
    export let sticky

    const paused = getContext('paused')
    const volume = getContext('volume')
    const current = getContext('current')
    const loading = getContext('loading')
    const selectNext = getContext('selectNext')

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

    const switchBigPlayer = () => {
        large = !large
    }

</script>
