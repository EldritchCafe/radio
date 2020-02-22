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
        <Popper>
            <button slot="btn" class="controls__menuBtn" aria-label="track menu"><IconMenu></IconMenu></button>
            <div slot="content" class="contextMenu__list">
                <ContextMenu></ContextMenu>
            </div>
        </Popper>
    </div>
</div>

<script>
    import { getContext } from 'svelte'
    import Volume from '/components/Volume'
    import PlayPause from '/components/icons/controls/PlayPause'
    import Prev from '/components/icons/controls/Prev'
    import Next from '/components/icons/controls/Next'
    import IconMenu from '/components/icons/Menu'
    import Popper from '/components/PopperMenu'
    import ContextMenu from '/components/ContextMenu'

    const paused = getContext('paused')
    const canPrevious = getContext('canPrevious')
    const canNext = getContext('canNext')
    const selectPrevious = getContext('selectPrevious')
    const selectNext = getContext('selectNext')
</script>
