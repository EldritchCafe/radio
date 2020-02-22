
<div class="modal" id="share-modal" aria-hidden="true">
    <div class="modal__overlay" tabindex="-1" on:click={() => closeModal()}></div>

    <div class="modal__container" role="dialog" aria-modal="true">
        <button class="modal__close" aria-label="close" on:click={() => closeModal()}></button>
        <div class="modal__title">Share this song</div>
        <div class="modal__content">
            <input class="modalShare__input f-size-full w100" readonly type="text" value="https://radio.eldritch.cafe/share/eldritch.cafe/1645635448?large">
            <div class="modalShare__controls">
                <div class="modalShare__bigplayer">
                    <input type="checkbox" id="bigplayer_active">
                    <label for="bigplayer_active">active big player</label>
                </div>
                <button class="modalShare__copy">copy</button>
            </div>
        </div>
    </div>
</div>


<script>
import MicroModal from 'micromodal';
MicroModal.init();


let closeModal = () => {
    MicroModal.close('share-modal');
}


</script>