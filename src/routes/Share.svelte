<Radio share={refererCredentials} large={large} />

<script>
    import Radio from '/src/components/Radio.svelte'

    export let domain
    export let id

    let large = (new URL(location)).searchParams.has('large')

    const refererCredentials = {
        type: 'mastodon',
        domain,
        id
    }
</script>
