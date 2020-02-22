<button class="contextMenu__item" on:click={() => openShare()}>Share this song</button>
<a class="contextMenu__item" href="" target="_blank">Link to toot</a>
<a class="contextMenu__item" href="" target="_blank">Link to media</a>

<script>
import { onMount, getContext } from 'svelte';
import MicroModal from 'micromodal'; 

const closeMenu = getContext('closeMenu')

function openShare () {
    MicroModal.show('share-modal')
    closeMenu()
}

</script>