<svelte:head>
    <title>{`${ $current ? `${$current.title} ∴ ` : ''}Eldritch Radio`}</title>
</svelte:head>

<div class="app container">
    <Header></Header>

    <section class="viewer">
        <Viewer></Viewer>
    </section>

    <section class="queue">
        <Queue></Queue>
    </section>

    <Footer></Footer>
</div>

<script>
    import Header from '/components/layout/Header.svelte'
    import Footer from '/components/layout/Footer.svelte'
    import Queue from '/components/Queue.svelte'
    import Viewer from '/components/Viewer.svelte'

    import { queue, next, current, select } from '/store.js'

    export let share

    $: if ($queue.length === 1 && $next != null && $current == null) {
        select($next)
    }
</script>