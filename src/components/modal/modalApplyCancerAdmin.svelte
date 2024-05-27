<script>
    import { modal_apply_cancer_admin, modal_apply_cancer_admin_reason } from '../../store/modalSlice.js';
	import { modalUI } from './../../compositions/ui.js';
    import { applyCancelList } from '../../compositions/application.js';
    let modalEle = null;

    let cancelList = [];
    let pickCancel = "";
    let cancelTxt = "";
    let alertTxt = "";
    let pickEle = null;

    const { close } = modal_apply_cancer_admin;
    $: if($modal_apply_cancer_admin) {
        modalUI.open(modalEle);
        openSetting();
        document.addEventListener('keydown', escClose);
        pickEle.focus();
    } else {
        modalUI.close(modalEle);
        document.removeEventListener('keydown', escClose);
    }

    const escClose = (e) => {
        if(e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
            close();
        }
    }
    const openSetting = () => {
        pickCancel = "";
        cancelTxt = "";
        alertTxt = "";
        applyCancelList().then(({data}) => {
            cancelList = data.data;
        });
    }
    const ApplicationCancel = () => {
        if(!pickCancel) alertTxt = "* 취소사유가 선택되지 않았습니다.";
        else if(pickCancel === '개인 사정 및 기타' && !cancelTxt) {
            alertTxt = "* 취소사유를 적어주세요.";
        } else {
            if(pickCancel === '개인 사정 및 기타') {
                $modal_apply_cancer_admin_reason = cancelTxt;
            } else {
                $modal_apply_cancer_admin_reason = pickCancel;
            }
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
        <form on:submit|preventDefault={ApplicationCancel}>
            <div class="modal-content">
                <div class="modal-title">알림창</div>
                <div class="modal-con">
                    <p>신청취소사유를 선택해주세요.</p>
                    <div>
                        <select bind:value={pickCancel}
                            bind:this={pickEle}
                            tabindex="1"
                        class="form-select form-select-sm" style="font-size:18px">
                            <option value="">==== 취소사유목록 ====</option>
                            {#each cancelList as cancel}
                            <option value={cancel}>{cancel}</option>
                            {/each}
                        </select>
                    </div>
                    {#if pickCancel === '개인 사정 및 기타'}
                    <div style="margin-top: 5px;">
                        <input bind:value={cancelTxt} 
                            class="form-control" type="text" 
                            placeholder="사유를 입력해주세요.">
                    </div>
                    {/if}
                    {#if alertTxt}
                    <p class="c_red">{alertTxt}</p>
                    {/if}
                </div>
                <div class="modal-btn_wrap">
                    <button
                    type="button"
                    class="modal_close"
                    tabindex="3"
                    on:click={() => close()}
                    >
                    닫기
                    </button>
                </div>
                <div class="modal-confirm">
                    <button class="btn btn-primary me-1" tabindex="2">완료</button>
                </div>
            </div>
        </form>
    </div>
</div>

<style>
    .btn {
        min-width:80px;
    }
    .modal .modal-board .modal-content .modal-con {
        padding-bottom: 50px;
    }
</style>