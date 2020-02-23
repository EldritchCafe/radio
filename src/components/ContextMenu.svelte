<button class="contextMenu__item" on:click={() => showModal()}>Share this song</button>
<a class="contextMenu__item" href={track.referer.url} target="_blank">Link to toot</a>
<a class="contextMenu__item" href={track.media.url} target="_blank">Link to media</a>

<!-- Sharemodal -->
<Portal target="{document.body}">
    {#if open}
        <div class="modal">
            <div class="modal__overlay" tabindex="-1" on:click={() => hideModal()}></div>

            <div class="modal__container" role="dialog" aria-modal="true">
                <button class="modal__close" aria-label="close" on:click={() => hideModal()}></button>
                <div class="modal__title">Share this song</div>
                <div class="modal__content">
                    <input class="modalShare__input f-size-full w100" readonly type="text" value={shareUrlInput}>
                    <div class="modalShare__controls">
                        <div class="modalShare__bigplayer">
                            <input type="checkbox" id="bigplayer_active" bind:checked={isBigPlayer}>
                            <label for="bigplayer_active">active big player</label>
                        </div>
                        <button class="modalShare__copy" on:click={() => copyUrl()}>{ copied ? 'copied' : 'copy' }</button>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</Portal>

<script>
    import { getContext } from 'svelte'
    import Portal from 'svelte-portal'
    import copy from 'copy-to-clipboard'

    export let track

    let open = false
    let isBigPlayer = false
    let copied = false

    $: shareUrlInput = track.shareUrl + (isBigPlayer ? '?large' : '')

    const closeMenu = getContext('closeMenu')

    function showModal () {
        open = true
        closeMenu()
    }

    function hideModal () {
        open = false
    }

    function copyUrl () {
        copy(shareUrlInput)
        copied = true
        setTimeout(() => copied = false, 2000)
    }
</script>