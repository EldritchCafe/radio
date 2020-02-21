<div>
    <div class="queue__section">
        <div class="queue__sectionTitle">Next song</div>
        <div class="track" on:click={() => select($next)}>
            <div class="track__main">
                <div class="track__title" class:placeholder={!$next}>
                    {#if $next}{$next.title}{/if}
                </div>
                <div class="track__subtitle" class:placeholder={!$next}>
                {#if $next}
                    shared by {$next.referer.username} • 
                    <DistanceDate date={$next.date} />
                {/if}
                </div>
            </div>
            {#if $next}
                <button class="track__menu" aria-label="track menu"><IconMenu></IconMenu></button>
            {/if}
        </div>
    </div>


    <div class="queue__section">
        <div class="queue__sectionTitle">History</div>
        {#each history as track}
            <div class="track" class:track--active={track === $current} on:click={() => select(track)}>
                <div class="track__main">
                    <div class="track__title">{track.title}</div>
                    <div class="track__subtitle">
                        shared by {track.referer.username} • 
                        <DistanceDate date={track.date} />
                    </div>
                </div>
                <button class="track__menu" aria-label="track menu"><IconMenu></IconMenu></button>
            </div>
        {/each}
        {#if history.length === 0}
            <div class="track">
                <div class="track__main">
                    <div class="track__title placeholder"></div>
                    <div class="track__subtitle placeholder"></div>
                </div>
            </div>
        {/if}

    </div>
</div>

<script>
    import { getContext } from 'svelte'
    import DistanceDate from '/components/DistanceDate'
    import IconMenu from '/components/icons/Menu'

    const current = getContext('current')
    const enqueueing = getContext('enqueueing')
    const next = getContext('next')
    const queue = getContext('queue')
    const select = getContext('select')

    $: history = $queue.filter(x => x !== $next).reverse()
</script>

<style>
    .entry {
        padding: 1em 2em;
        cursor: pointer;
    }

    .entry.active {
        background-color: plum;
    }

    .entry.active::before {
        content: "▶️";
    }
</style>