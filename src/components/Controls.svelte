<div class="controls">
    <div class="controls__volume">
        <Volume></Volume>
    </div>

    <div class="controls__controls">
        <button
            class="controls__prevnext"
            class:disabled={!$canPrevious} on:click={() => selectPrevious()}
            disabled={!$canPrevious} on:click={() => selectPrevious()}
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
        <button class="controls__menuBtn" aria-label="track menu"><IconMenu></IconMenu></button>
    </div>
</div>

<script>
    import {
        paused,
        canPrevious,
        canNext,
        selectPrevious,
        selectNext,
        loading
    } from '/store.js'
    import Volume from '/components/Volume'
    import PlayPause from '/components/icons/controls/PlayPause'
    import Prev from '/components/icons/controls/Prev'
    import Next from '/components/icons/controls/Next'
    import IconMenu from '/components/icons/Menu'
</script>
