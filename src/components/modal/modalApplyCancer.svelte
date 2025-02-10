<script>
    import { modal_apply_cancer, modal_apply_cancer_code } from '../../store/modalSlice.js';
	import { modalUI } from './../../compositions/ui.js';
    import { applyCancel, applyCancelList } from '../../compositions/application.js';
    let modalEle = null;

    let cancelList = [];
    let pickCancel = "";
    let pickCancelEle = null;
    let cancelTxt = "";
    const enrol_obj = {
        schedule_code: "",
        reason: "",
    }
    let alertTxt = "";

    const { close, cancel } = modal_apply_cancer;
    $: if($modal_apply_cancer) {
        modalUI.open(modalEle);
        pickCancelEle.focus();
        openSetting();
        document.addEventListener('keydown', escClose);
    } else {
        modalUI.close(modalEle);
        document.removeEventListener('keydown', escClose);
    }
    const openSetting = () => {
        enrol_obj.schedule_code = $modal_apply_cancer_code;
        pickCancel = "";
        cancelTxt = "";
        alertTxt = "";
        applyCancelList().then(({data}) => {
            cancelList = data.data;
        });
    }
    const escClose = (e) => {
        if(e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
            close();
        }
    }

    const ApplicationCancel = () => {
        if(!pickCancel) alertTxt = "* 취소사유가 선택되지 않았습니다.";
        else if(pickCancel === '개인 사정 및 기타' && !cancelTxt) {
            alertTxt = "* 취소사유를 적어주세요.";
        } else {
            if(pickCancel === '개인 사정 및 기타') {
                enrol_obj.reason = cancelTxt;
            } else {
                enrol_obj.reason = pickCancel;
            }
            applyCancel(enrol_obj).then(({data}) => {
                cancel();
            });
        }
    }

</script>

<div id="modalApplyCancer" class="modal" bind:this={modalEle}>
    <button
        class="modal-background"
        on:click={close}
        ></button>
    <div class="modal-board">
        <form on:submit|preventDefault={ApplicationCancel}>
            <div class="modal-content">
                <div class="modal-title">알림창</div>
                <div class="modal-con">
                    <p>신청취소사유를 선택해주세요.</p>
                    <div>
                        <select bind:value={pickCancel} 
                            bind:this={pickCancelEle}
                        class="form-select form-select-sm" 
                        style="font-size:18px" tabindex="1">
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
                    on:click={close}
                    >
                    닫기
                    </button>
                </div>
                <div class="modal-confirm">
                    <button
                        tabindex="2"
                        class="btn btn-primary me-1">완료</button>
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