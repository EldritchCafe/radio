<div class="controls">
    <div class="controls__volume">
        <Volume></Volume>
    </div>

    <div class="controls__controls">
        <button
            class="controls__prevnext"
            class:disabled={!$canPrevious}
            disabled={!$canPrevious}
            on:click={() => selectPrevious()}
            aria-label="Prev"
            title="Previous song"
        ><Prev></Prev></button>
        <PlayPause on:click={() => $paused = !$paused}></PlayPause>
        <button
            class="controls__prevnext"
            class:disabled={!$canNext}
            disabled={!$canNext}
            on:click={() => selectNext()}
            aria-label="Next"
            title="Next Song"
        ><Next></Next></button>
    </div>

    <div class="controls__menu">
        <Popper needOffset={false}>
            <button
                slot="btn"
                class="controls__menuBtn"
                disabled={!$current}
                class:disabled={!$current}
                aria-label="track menu"
            ><IconMenu></IconMenu>{!!$current}</button>
            <div slot="content" class="contextMenu__list">
                {#if $current}
                    <ContextMenu track={$current}></ContextMenu>
                {/if}
            </div>
        </Popper>
    </div>
</div>

<script>
    import { getContext } from 'svelte'
    import Volume from '/src/components/Volume'
    import PlayPause from '/src/components/icons/controls/PlayPause'
    import Prev from '/src/components/icons/controls/Prev'
    import Next from '/src/components/icons/controls/Next'
    import IconMenu from '/src/components/icons/Menu'
    import Popper from '/src/components/PopperMenu'
    import ContextMenu from '/src/components/ContextMenu'

    const current = getContext('current')
    const paused = getContext('paused')
    const canPrevious = getContext('canPrevious')
    const canNext = getContext('canNext')
    const selectPrevious = getContext('selectPrevious')
    const selectNext = getContext('selectNext')
</script>
