<script>
    import moment from 'moment/moment';
    import { modal_alert, modal_apply_detail, modal_apply_detail_obj } from '../../store/modalSlice.js';
	import { modalUI } from './../../compositions/ui.js';
    import 'font-awesome/css/font-awesome.css';
    import 'jquery-ui/themes/base/draggable.css';
    import { programApply } from '../../compositions/application.js';
    import { onAllLoding } from '../../store/moduleSlice.js';

    let modalEle = null;
    let wrap_Ele = null;
    const { close, apply } = modal_apply_detail;

    let program = {};
    const nowDateIs = new Date();

    let trueIs_202405 = new Date('2024-05-01 00:00:00') < new Date();

    // 신청인원 꾸미기
    $: enrollCountStyle = () => {
        const remainder = program.enrol_limit - program.enrol_count;
        const yellowLimit = Math.round(program.enrol_limit / 3); 
        const redLimit = Math.round(program.enrol_limit / 10); 
        if(remainder <= redLimit) {
            return `color: red; font-weight: 900`
        } else if(remainder <= yellowLimit) {
            return `color: #F29661; font-weight: 900`
        } else {
            return `color: blue; font-weight: 500`
        }
    }
    // 신청하기
    const apply_before = async (index, code) => {
        onAllLoding.set(true);
        await programApply(code).then(({data}) => {
            if(data.code === 403) {
                modal_alert.open('최대 3개까지의 과정을 신청할 수 있습니다.<br>기존의 과정을 취소 후 신청해주세요.');
                return;
            }
            program = data.schedule_info;
            apply(data.schedule_info);
        }).catch((err) => {
            modal_alert.open('잠시 후 다시 시도해주세요.');
        });
        onAllLoding.set(false);
    }

    $: if($modal_apply_detail) {
        modalUI.open(modalEle);
        wrap_Ele.focus();
        program = {...$modal_apply_detail_obj};
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

<div id="modalApplyDetail" class="modal" bind:this={modalEle}>
    <button
        class="modal-background"
        on:click={() => close()}
    ></button>
    <div class="modal-board">
        <div class="modal-content">
            <!-- BEGIN panel -->
            <div class="panel panel-inverse" data-sortable-id="table-basic-5">
                <!-- BEGIN panel-heading -->
                <div class="panel-heading">
                    <h4 class="panel-title">과정 상세정보</h4>
                    <div class="panel-heading-btn">
                    </div>
                </div>
                <!-- END panel-heading -->
                <!-- BEGIN panel-body -->
                <div class="panel-body">
                    <!-- BEGIN table-responsive -->
                    <div class="table-responsive">
                        <table class="table table-striped mb-0">
                            <tbody>
                                <tr>
                                    <td><b>교육일</b></td>
                                    <td>
                                        {moment(program.schedule_start_date).format('M.D (ddd)')}
                                        {#if program.schedule_start_date_add_date}
                                        ~ {moment(program.schedule_start_date_add_date).format('M.D (ddd)')}
                                        {/if}
                                        {#if program.schedule_after_date}
                                            {#each program.schedule_after_date as afterDate}
                                            , &nbsp;{moment(afterDate).format('M.D (ddd)')}
                                            {/each}
                                            {/if}
                                    </td>
                                </tr>
                                <tr>
                                    <td><b>신청마감일</b></td>
                                    <td>{moment(program.schedule_enrol_end_date).format('M.D (ddd)')}</td>
                                </tr>
                                <tr>
                                    <td><b>역량</b></td>
                                    <td>{program.group_title}</td>
                                </tr>
                                <tr>
                                    <td><b>과정</b></td>
                                    <td>{program.title}</td>
                                </tr>
                                <tr>
                                    <td><b>교육시간</b></td>
                                    <td>{program.time ? program.time +' H' : ''}
                                        {program.time < 8 && new Date('2024-05-01 00:00:00') < new Date(program.schedule_start_date) ? `(${moment(program.schedule_start_date).format('a')})` : ''}    
                                    </td>
                                </tr>
                                <tr>
                                    <td><b>방법</b></td>
                                    <td>{program.online === 'Y' ? '온라인' : '집합'}</td>
                                </tr>
                                <tr>
                                    <td><b>유형</b></td>
                                    <td>{program.part_type}</td>
                                </tr>
                                <tr>
                                    <td><b>정원/신청인원</b></td>
                                    <td><span>{program.enrol_limit}/</span><span style={enrollCountStyle()}>{program.enrol_count}</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <!-- END table-responsive -->
                </div>
                <!-- END panel-body -->
            </div>
            <!-- END panel -->
            <div class="modal-confirm">
                {#if program.schedule_status === true}
                <button type="button" bind:this={wrap_Ele} class="btn btn-gray me-1 mb-1 ban">폐강</button>
                {:else if nowDateIs < new Date(program.schedule_enrol_start_date)}
                <button type="button" bind:this={wrap_Ele} class="btn btn-dark me-1 mb-1 ban">오픈예정</button>
                {:else if new Date(program.schedule_enrol_end_date) < nowDateIs}
                <button type="button" bind:this={wrap_Ele} class="btn btn-gray me-1 mb-1 ban">마감</button>
                {:else}
                    {#if program.my_enrol_status === 1}
                    <button type="button" bind:this={wrap_Ele}
                        class="btn btn-green me-1 mb-1 ban">신청완료</button>
                    {:else}
                    <button type="button" tabindex="0"
                        bind:this={wrap_Ele}
                        class="btn btn-primary me-1 mb-1"
                        class:btn-warning={program.enrol_count >= program.enrol_limit}
                        on:click={() => apply_before(program.indexNum, program.schedule_code)}>
                        {#if program.enrol_count >= program.enrol_limit}
                        대기신청({program.enrol_count - program.enrol_limit + 1}명)
                        {:else}
                        신청하기
                        {/if}
                    </button>
                    {/if}
                {/if}
            </div>
            <div class="modal-btn_wrap">
                <button
                type="button"
                tabindex="0"
                class="modal_close"
                on:click={() => close()}
                >
                <i class="fas fa-times text-white" aria-hidden="true"></i>
                </button>
            </div>
        </div>
        
        
    </div>
    
</div>

<style>
.btn {
    min-width:80px;
}
.modal .modal-board {
    max-width: 600px;
}
.modal-content {
    padding-bottom: 40px;
}
.modal .modal-board .modal-content .modal-btn_wrap {
    top: 0;
}
.modal .modal-board .modal-content .modal-confirm {
    right: 5px;
    bottom: 6.8px;
}
.modal .modal-board .modal-content .modal-confirm button {
    font-size:20px;
    line-height: 20px;
    width:auto;
    min-width:150px;
}
.modal .modal-board .modal-content .modal-confirm .ban {
    cursor: not-allowed;
}
.modal .modal-board .modal-content .modal-confirm span {
    margin-right: 10px;
    font-size: 20px;
    height: 100%;
}
.modal .modal-board .modal-content .modal-btn_wrap .modal_close {
    background:none;
    font-size:30px;
}
.panel-title {
    font-size:20px;
}
.table-striped {
    text-align: center;
    font-size:18px;
}
</style>