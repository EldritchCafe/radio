<div class="controls">
    <div class="controls-group">
        <button on:click={() => $muted = !$muted}>
            {#if $muted}
                🔇
            {:else}
                {#if $volume < 20}
                    🔈
                {:else if $volume < 80}
                    🔉
                {:else}
                    🔊
                {/if}
            {/if}
        </button>

        <input type="range" min="0" max="100" bind:value={$volume}>
    </div>

    <div class="controls-group">
        <button on:click={() => entry.previous()}>⏮️</button>
        <button on:click={() => $paused = !$paused}>{#if $paused}▶️{:else}⏸️{/if}</button>
        <button on:click={() => entry.next()}>⏭️</button>
    </div>

    <div class="controls-group">
        <button>⭐</button>
        <button>🔁</button>
    </div>
</div>

<script>
    import { paused, volume, muted, entry } from '/stores.js'
</script>

<style>
    .controls {
        display: flex;
        width: 100%;
    }

    .controls-group {
        margin: 0 1rem;
    }
</style>