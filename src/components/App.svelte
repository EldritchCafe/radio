<svelte:head>
    <title>{`${ $current ? `${$current.metadata.title} ∴ ` : ''}Eldritch Radio`}</title>
</svelte:head>

<main class="app">
    <header class="header">
        <h1>Eldritch Radio</h1>
    </header>

    <section class="viewer">
        {#if $current}
            <Viewer></Viewer>
            <Controls></Controls>
        {/if}
    </section>

    <section class="queue">
        <Queue></Queue>
    </section>
</main>


<script>
    import Controls from '/components/Controls.svelte'
    import Queue from '/components/Queue.svelte'
    import Viewer from '/components/Viewer.svelte'

    import { current } from '/store.js'
</script>

<style>
    .app {
        min-width: 100%;
        min-height: 100%;
    }
</style>