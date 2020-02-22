<div>
    <div class="queue__section">
        <div class="queue__sectionTitle">Next song</div>
        <div class="track">
            <div class="track__main" on:click={() => select($next)}>
                <div class="track__title" class:placeholder={!$next}>
                    {#if $next}{$next.media.title}{/if}
                </div>
                <div class="track__subtitle" class:placeholder={!$next}>
                {#if $next}
                    shared by {$next.referer.username} •
                    <DistanceDate date={$next.referer.date} />
                {/if}
                </div>
            </div>
            {#if $next}
                <Popper>
                    <button slot="btn" class="track__menu" aria-label="track menu"><IconMenu></IconMenu></button>
                    <div slot="content" class="contextMenu__list">
                        <ContextMenu shareUrl={$next.shareUrl}></ContextMenu>
                    </div>
                </Popper>
            {/if}
        </div>
    </div>


    <div class="queue__section">
        <div class="queue__sectionTitle">History</div>
        {#each history as track}
            <div class="track" class:track--active={track === $current} class:track--playing={!$paused}>
                <div class="track__main" on:click={() => select(track)}>
                    <div class="track__title">{track.media.title}</div>
                    <div class="track__subtitle">
                        shared by {track.referer.username} •
                        <DistanceDate date={track.referer.date} />
                    </div>
                </div>
                <Popper>
                    <button slot="btn" class="track__menu" aria-label="track menu"><IconMenu></IconMenu></button>
                    <div slot="content" class="contextMenu__list">
                        <ContextMenu shareUrl={track.shareUrl}></ContextMenu>
                    </div>
                </Popper>
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
    import Popper from '/components/PopperMenu'
    import ContextMenu from '/components/ContextMenu'

    const current = getContext('current')
    const enqueueing = getContext('enqueueing')
    const next = getContext('next')
    const queue = getContext('queue')
    const select = getContext('select')
    const paused = getContext('paused')

    $: history = $queue.filter(x => x !== $next).reverse()
</script>
