<div>
    <div class="queue__section">
        <div class="queue__sectionTitle">Next song</div>
        {#if $next || $enqueueing}
            <div class="track">
                <div class="track__main" on:click={() => select($next)}>
                    <div class="track__title" class:placeholder={!$next && $enqueueing}>
                        {#if $next}{$next.media.title}{/if}
                    </div>
                    <div class="track__subtitle" class:placeholder={!$next && $enqueueing}>
                    {#if $next}
                        shared by <span class="track__username">{$next.referer.username}</span> •
                        <DistanceDate date={$next.referer.date} />
                    {/if}
                    </div>
                </div>
                {#if $next}
                    <Popper needOffset={true}>
                        <button slot="btn" class="track__menu" aria-label="track menu"><IconMenu></IconMenu></button>
                        <div slot="content" class="contextMenu__list">
                            <ContextMenu track={$next}></ContextMenu>
                        </div>
                    </Popper>
                {/if}
            </div>
        {:else}
            <div class="notif notif--warning">There is no more song to play. Reload the app or change your hashtags settings to get new songs.</div>
        {/if}
    </div>


    <div class="queue__section">
        <div class="queue__sectionTitle">History</div>
        {#each history as track, i (track.referer.url)}
            <div class="track track--history" class:track--active={track === $current} class:track--playing={!$paused}>
                <div class="track__main" on:click={() => select(track)}>
                    <div class="track__title">{track.media.title}</div>
                    <div class="track__subtitle">
                        shared by <span class="track__username">{track.referer.username}</span> •
                        <DistanceDate date={track.referer.date} />
                    </div>
                </div>
                <Popper needOffset={true}>
                    <button slot="btn" class="track__menu" aria-label="track menu"><IconMenu></IconMenu></button>
                    <div slot="content" class="contextMenu__list">
                        <ContextMenu track={track}></ContextMenu>
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
    import DistanceDate from '/src/components/DistanceDate'
    import IconMenu from '/src/components/icons/Menu'
    import Popper from '/src/components/PopperMenu'
    import ContextMenu from '/src/components/ContextMenu'

    const current = getContext('current')
    const enqueueing = getContext('enqueueing')
    const next = getContext('next')
    const queue = getContext('queue')
    const select = getContext('select')
    const paused = getContext('paused')

    $: history = $queue.filter(x => x !== $next).reverse()
</script>
