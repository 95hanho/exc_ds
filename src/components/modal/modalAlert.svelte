<script>
    import { onDestroy, onMount } from 'svelte';
    import { modal_alert, modal_alert_txt } from '../../store/modalSlice.js';
	import { modalUI, ui } from './../../compositions/ui.js';
    let modalEle = null;
    let closeBtn = null;

    const { close } = modal_alert;
    $: if($modal_alert) {
        modalUI.open(modalEle)
        closeBtn.focus();
        document.addEventListener('keydown', escClose);
    } else {
        modalUI.close(modalEle);
        document.removeEventListener('keydown', escClose);
    }

    const escClose = (e) => {
        if(e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
            close();
        }
    }
</script>

<div class="modal" bind:this={modalEle}>
    <button
        class="modal-background"
        on:click={() => close()}
    ></button>
    <div class="modal-board">
        <div class="modal-content">
            <div class="modal-title">알림창</div>
            <div class="modal-con">
                <p>{@html $modal_alert_txt}</p>
            </div>
            <div class="modal-btn_wrap">
                <button
                type="button"
                class="modal_close"
                tabindex="0"
                bind:this={closeBtn}
                on:click={() => close()}
                >
                닫기
                </button>
            </div>
        </div>
    </div>
</div>

<style>
.modal {
    z-index: 1500;
}
</style>