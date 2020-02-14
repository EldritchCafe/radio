<div class="controls">
    <div class="controls-group">
        <button on:click={() => $muted = !$muted}>
            {#if $muted}
                🔇
            {:else if $volume < 20}
                🔈
            {:else if $volume < 80}
                🔉
            {:else }
                🔊
            {/if}
        </button>

        <input type="range" min="0" max="100" bind:value={$volume}>
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
        volume,
        current,
        queue,
        canPrevious,
        canNext,
        selectPrevious,
        selectNext,
        loading
    } from '/store.js'
</script>

<style>
    .controls {
        display: flex;
        width: 100%;
    }

    .controls-group {
        margin: 0 1rem;
    }

    .cant {
        background-color: red;
    }
</style>