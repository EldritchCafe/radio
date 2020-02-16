<Radio share={refererCredentials} />

<script>
    import Radio from '/components/Radio.svelte'

    export let domain
    export let id

    const refererCredentials = {
        type: 'mastodon',
        domain,
        id
    }
</script>