<script>
	import { fade } from 'svelte/transition';
    import "moment/locale/ko";
    import moment from 'moment/moment';

    export let change_log;
    export let changeQueryString;

    let changeList = []; // 보여줄 로그리스트
    let registLeng = 0; // 등록건 갯수
    let registOn = false; // 등록건만 보여줄 것인가
    // 초기 데이터 들어올 때
    $: if(change_log.length > 0) {
        filter_changeList();
        registLeng = 0;
        change_log.map((v) => {
            if(v.flag === '등록') registLeng++;
        });
    }
    // 등록 건만 보여줄 지 필터링
    $: filter_changeList = () => {
        changeList = change_log.filter((v) => {
            if(registOn && v.flag !== '등록') return false;
            return true;
        });
    }
</script>

<div id="adminCancel">
    <div class="panel panel-inverse">
        <!-- BEGIN panel-heading -->
        <div class="panel-heading ">
            <h4 class="panel-title">
                <label for="closeBtn" class="isLink_btn">변경로그 등록</label>
                <button id="closeBtn"
                    on:click={() => changeQueryString('cancelListOn', 'off')}>
                    <i class="bi bi-arrow-up-square-fill fs-25px h-60px c_white"></i>
                </button>
            </h4>
        </div>
        <!-- END panel-heading -->
        <!-- BEGIN panel-body -->
        <div class="panel-body" in:fade={{duration:500}} out:fade={{duration:200}}>
            <div class="button_area">
                <div class="fs-20px">
                    <input id="close_class" type="checkbox" class="class_check"
                        bind:checked={registOn}
                        on:click={filter_changeList}>
                    <label for="close_class">등록 건만 보기({registLeng})</label>
                </div>
            </div>
               
            <div class="row">
                <table id="application-table"
                    class="application-table table table-striped table-bordered align-middle"
                    >
                    <thead>
                        <tr>
                            <th style="width: 2%;"></th>
                            <th style="width: 18%;">변경날짜</th>
                            <th style="width: 5%;">차수</th>
                            <th style="width: 12%;">교육날짜</th>
                            <th style="width: 23%;">프로그램</th>
                            <th style="width: 10%;">변경인</th>
                            <th style="width: 5%;">유형</th>
                            <th style="width: 30%;">취소 사유</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each changeList as chLog, index}
                        <tr>
                            <td>{index + 1}</td>
                            <td>{moment(chLog.change_date).format('YYYY-MM-DD A hh:mm:ss')}</td>
                            <td>{chLog.schedule_index ? chLog.schedule_index + '차' : ''}</td>
                            <td>{chLog.schedule_start_date === 'None' ? '' : moment(chLog.schedule_start_date).format('YYYY-MM-DD A hh:mm:ss')}</td>
                            <td>{chLog.program_name}</td>
                            <td>{chLog.executor}</td>
                            <td>{chLog.flag}</td>
                            <td>{chLog.cancel_msg}</td>
                        </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
        <!-- END panel-body -->
    </div>
</div>

<style>
#adminCancel {
    margin-top:20px;
}
.panel-heading>h4 {
    font-size:20px;
}
.panel-heading button {
    width:calc(100% - 121px);
    text-align: left;
}
.panel-body {
    padding-top:0px;
    padding-bottom:10px;
}
.button_area {
    padding-top:10px;
    width:100%;
    text-align: right;
}
.class_check {
    accent-color: #aaa;
    width:20px;
    height: 20px;
}
.application-table tbody td:nth-child(5) {
    word-break: keep-all;
}
</style>