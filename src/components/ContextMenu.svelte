<button class="contextMenu__item" on:click={() => openShare()}>Share this song</button>
<a class="contextMenu__item" href="" target="_blank">Link to toot</a>
<a class="contextMenu__item" href="" target="_blank">Link to media</a>

<!-- Sharemodal -->
<Portal target="{document.body}">
    <div class="modal" id="share-modal" aria-hidden="true">
        <div class="modal__overlay" tabindex="-1" on:click={() => closeModal()}></div>

        <div class="modal__container" role="dialog" aria-modal="true">
            <button class="modal__close" aria-label="close" on:click={() => closeModal()}></button>
            <div class="modal__title">Share this song</div>
            <div class="modal__content">
                <input class="modalShare__input f-size-full w100" readonly type="text" value={shareUrlInput}>
                <div class="modalShare__controls">
                    <div class="modalShare__bigplayer">
                        <input type="checkbox" id="bigplayer_active" bind:checked={isBigPlayer}>
                        <label for="bigplayer_active">active big player {isBigPlayer}</label>
                    </div>
                    <button class="modalShare__copy" on:click={() => copyUrl()}>copy</button>
                </div>
            </div>
        </div>
    </div>
</Portal>

<script>
import copy from 'copy-to-clipboard';
import { onMount, getContext } from 'svelte';
import Portal from 'svelte-portal';
import MicroModal from 'micromodal';

export let shareUrl

let isBigPlayer = false

$: shareUrlInput = shareUrl + (isBigPlayer ? '?large' : '')
$: console.log(shareUrl)
$: console.log(shareUrlInput)
const closeMenu = getContext('closeMenu')

function openShare () {
    MicroModal.show('share-modal')
    closeMenu()
}

function closeModal () {
    MicroModal.close('share-modal');
}

function copyUrl () {
    copy(shareUrl)
}

onMount(() => {
    MicroModal.init();
})



</script>