<div class="controls">
    <div class="controls-group">
        <Volume></Volume>
    </div>

    <div class="controls-group">
        <button class:cant={!$canPrevious} on:click={() => selectPrevious()}>⏮️</button>

        <button on:click={() => $paused = !$paused}>
            {#if $current === null}
                ▶️
            {:else if $loading}
                🕒
            {:else if $paused}
                ▶️
            {:else }
                ⏸️
            {/if}
        </button>

        <button class:cant={!$canNext} on:click={() => selectNext()}>⏭️</button>
    </div>

    <div class="controls-group">
        <button>⭐</button>
        <button>🔁</button>
    </div>
</div>

<script>
    import {
        paused,
        muted,
        current,
        queue,
        canPrevious,
        canNext,
        selectPrevious,
        selectNext,
        loading
    } from '/store.js'
    import Volume from '/components/Volume'
</script>

<style>
    .controls {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
    }

    .controls-group {
        margin: 0 1rem;

    }

    .cant {
        background-color: red;
    }
</style>