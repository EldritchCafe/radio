<Router>
    <Route path="/share/:domain/:statusId" component={Share} />
    <Route path="/" component={Home} />
</Router>

<script>
    import { Router, Route } from 'svelte-routing'
    import Home from '/routes/Home.svelte'
    import Share from '/routes/Share.svelte'
</script>