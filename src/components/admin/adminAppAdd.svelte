<script>
	import { fade, scale, slide } from 'svelte/transition';
    import jexcel from 'jspreadsheet-ce';
    import 'jspreadsheet-ce/dist/jspreadsheet.css';
    import { onDestroy, onMount } from 'svelte';
    import { getProgramNames } from '../../compositions/talktalk';
    import { modal_alert } from '../../store/modalSlice';
    import { ui } from '../../compositions/ui';
    import { onAllLoding } from '../../store/moduleSlice';
    import { addProgramSchedules } from '../../compositions/admin';

    export let closeAdminAppAdd;

    let initData = [
        [],
    ];
    let exampleData = [
        [
            '54', '2022-10-02 00:00:00', '2022-09-29 00:00:00', '2022-10-01 00:00:00', '50', '4', 'S21', 'Y', '4', 
        ], [
            '55', '2022-10-02 00:00:00', '2022-09-29 00:00:00', '2022-10-01 00:00:00', '100', '6', 'S21', 'N', '8', 
        ]
    ]
    let exampleOn = false;
    let excel;
    let getProgramNamesAwait;
    let programViewOn = false;
    let programCodes = [];
    let programList = [];
    let programList2 = [];
    let troubleI = -1;
    let troubleJ = -1;

    $:if(!$modal_alert && troubleI > -1 && troubleJ > -1) {
        ui.jexcelFocus(troubleI, troubleJ);
        troubleI = -1;
        troubleJ = -1;
    }
    // 차수 추가
    const adminAppAdd_before = async () => {
        const excelData = excel.getData();
        console.log(excelData);
        onAllLoding.set(true);
        if(excelData.length === 1 && excelData.every((v) => v.every((v) => v === ''))) {
            onAllLoding.set(false);
            return; // 초기 상태
        } else if(exampleOn) {
            // 예시 상태
            modal_alert.open(`예시 상태에선 제출 불가능합니다. 
            <br><span class="c_red">'리셋'</span>을 한 번 클릭 후 진행해주세요.`);
            onAllLoding.set(false);
            return;
        } else {
            let cStartDate;
            let applyStartDate;
            let applyEndDate;
            for(let ii in excelData) {
                let i = Number(ii);
                for(let jj in excelData[i]) {
                    let j = Number(jj);
                    let v = excelData[i][j];
                    
                    if(j == 1) cStartDate = new Date(v);
                    if(j == 2) applyStartDate = new Date(v);
                    if(!v) {
                        modal_alert.open(`비어있는 값이 존재합니다. ${excelLocate(i, j)}`)
                        onAllLoding.set(false);
                        return;
                    } else if((j == 0 && isNaN(Number(v))) ||
                        ((j == 1 || j == 2 || j == 3) && isNaN(new Date(v).getTime())) ||
                        (j == 4 && isNaN(Number(v))) || 
                        (j == 5 && ![2, 4, 6].includes(Number(v))) || 
                        (j == 6 && !programCodes.includes(v)) ||
                        (j == 7 && !['Y', 'N'].includes(v)) ||
                        (j == 8 && isNaN(Number(v)))) {
                        modal_alert.open(`형태에 맞지 않는 입력이 존재합니다. ${excelLocate(i, j)}`);
                        onAllLoding.set(false);
                        return;
                    } else if(j == 3) {
                        applyEndDate = new Date(v);
                        if(cStartDate < applyStartDate || cStartDate < applyEndDate) {
                            modal_alert.open(`수강시작일은 수강신청 기간 뒤여야 합니다. ${excelLocate(i, 1)}`);
                            onAllLoding.set(false);
                            return;
                        } else if(applyStartDate > applyEndDate) {
                            modal_alert.open(`수강신청시작일은 수강신청종료일 뒤여야 합니다. ${excelLocate(i, 2)}`);
                            onAllLoding.set(false);
                            return;
                        }
                    }
                }
            }
        }
        console.log({list: excelData});
        await addProgramSchedules({list: excelData}).then(({data}) => {
            console.log(data);
            if(data?.data?.fail_list?.length) {
                const message = data.data.fail_list.reduce((acc, cur, i) => {
                    if(i > 0) acc = acc + '<br>';
                    acc = acc + cur;
                    return acc;
                }, '');
                modal_alert.open(message);
            } else excel.setData([[]]);
        });
        onAllLoding.set(false);
    }
    // 문제있는 엑셀 위치표시
    const excelLocate = (index, jIndex) => {
        troubleI = index;
        troubleJ = jIndex;
        switch(jIndex) {
            case 0: return `<br>위치 : ${index + 1}번줄 차수`;
            case 1: return `<br>위치 : ${index + 1}번줄 수강시작일`;
            case 2: return `<br>위치 : ${index + 1}번줄 수강신청시작일`;
            case 3: return `<br>위치 : ${index + 1}번줄 수강신청종료일`;
            case 4: return `<br>위치 : ${index + 1}번줄 수강인원 최대 인원`;
            case 5: return `<br>위치 : ${index + 1}번줄 합반(6)/그룹장(4)/파트장(2) 구분`;
            case 6: return `<br>위치 : ${index + 1}번줄 프로그램 코드`;
            case 7: return `<br>위치 : ${index + 1}번줄 대면(N)/비대면(Y)`;
            case 8: return `<br>위치 : ${index + 1}번줄 교육시간(시간)`;
        }
    }
    onMount(() => {
        document.body.classList.add('modal-open');
        getProgramNamesAwait = getProgramNames().then(({data}) => {
            Math.round(data.data.length / 2);
            const middleLeng = data.data.length / 2;
            data.data.map((v, i) => {
                if(i <= middleLeng) {
                    programList.push(v);
                } else {
                    programList2.push(v);
                }
                programCodes.push(v.program_code);
            });
        });
        excel = jexcel(document.getElementById('programAdd'), {
            data: initData,
            columns: [
                { type: 'text', title: '차수' },
                { type: 'text', title: '수강시작일' },
                { type: 'text', title: '수강신청시작일' },
                { type: 'text', title: '수강신청종료일' },
                { type: 'text', title: '수강인원 최대 인원' },
                { type: 'text', title: '합반(6)/그룹장(4)/파트장(2)' },
                { type: 'text', title: '프로그램코드' },
                { type: 'text', title: '대면(N)/비대면(Y)' },
                { type: 'text', title: '교육시간(시간)' },
            ],
            colWidths: ['4%', '15%', '15%', '15%', '10%', '15%', '8%', '10%', '8%',]
        });
        // console.log(excel);
    });
    onDestroy(() => {
        document.body.classList.remove('modal-open');
    });
</script>

<div id="adminAppAdd" class="modal" in:fade={{duration: 400}} out:fade={{duration: 400}}>
    <div
        class="modal-background"
    ></div>
    <div class="search_wrap">
		<div class="app-header">
            <h4>프로그램 추가</h4>
            <div class="modal-btn_wrap">
                <button
                type="button"
                class="modal_close"
                on:click={closeAdminAppAdd}
                >
                닫기
                </button>
            </div>
        </div>
        
        <div class="content">
            <div class="content_wrap">
                <div class="content_scroll" class:scroll={programViewOn}>
                    <div id="programAdd"></div>
                </div>
                {#await getProgramNamesAwait then result}
                <div class="program-list">
                    <!-- BEGIN panel -->
                    <div class="panel panel-inverse">
                        <!-- BEGIN panel-heading -->
                        <div class="panel-heading" out:scale={{duration: 0}} class:active={programViewOn}>
                            <h4 class="panel-title">
                                <label for="closeBtn">등록 되어 있는 프로그램 목록 {programViewOn? '닫기':'열기'}</label>
                                <button id="closeBtn" on:click={() => programViewOn = !programViewOn}>
                                    {#if programViewOn}
                                    <i class="bi bi-arrow-up-square-fill fs-25px h-60px c_white"></i>
                                    {:else}
                                    <i class="bi bi-arrow-down-square-fill fs-20px h-60px c_white"></i>
                                    {/if}
                                </button>
                            </h4>
                        </div>
                        <!-- END panel-heading -->
                        {#if programViewOn}
                        <!-- BEGIN panel-body -->
                        <div class="panel-body" in:slide={{duration: 500}} out:slide={{duration: 500}}>
                            <div class="row">
                                <table id="programExampleList"
                                    class="application-table table table-striped table-bordered align-middle"
                                    >
                                    <thead>
                                        <tr>
                                            <th>프로그램 명</th>
                                            <th>프로그램 코드</th>
                                            <th>프로그램 명</th>
                                            <th>프로그램 코드</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {#each programList as program, index}
                                        <tr>
                                            <td>{program.program_name}</td>
                                            <td>{program.program_code}</td>
                                            {#if programList2[index]}
                                            <td>{programList2[index].program_name}</td>
                                            <td>{programList2[index].program_code}</td>    
                                            {/if}
                                        </tr>    
                                        {/each}
                                        
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <!-- END panel-body -->
                        {/if}
                    </div>
                    <!-- END panel -->
                </div>
                {/await}
            </div>
            <div class="complete-wrap">
                <p class="c_red">* '수강신청시작일'부터 시작해서 '수강신청종료일'까지 신청가능합니다.</p>
                <p class="c_red">ex) '수강신청시작일':2024-03-04 10:00:00 ~ '수강신청종료일':2024-03-08 17:00:00 이면</p>
                <p class="c_red">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    2024-03-04 오전 10시부터 2024-03-08 오후 5시까지 신청가능합니다.</p>
                <button class="example btn btn-warning me-1 mb-1"
                    on:click={() => {
                        exampleOn = true;
                        excel.setData(exampleData);
                    }}>예시보기</button>
                <button class="reset btn btn-danger me-1 mb-1"
                    on:click={() => {
                        exampleOn = false;
                        excel.setData([[]]);
                    }}>리셋</button>
                <button class="complete btn btn-primary me-1 mb-1"
                    on:click={adminAppAdd_before}>완료</button>
            </div>
        </div>
    </div>
</div>

<style>
#adminAppAdd {
    z-index:1021;
}
.app-header h4 {
    width:100%;
}
.modal-btn_wrap {
    float: right;
}
.search_wrap {
    position: relative;
    max-width: calc(100% - 50px);
    min-width:570px;
    min-height: 200px;
    background-color: #fff;
    z-index:1022;
    padding:20px;
    border-radius: 10px;
}
.search_wrap .app-header {
    box-shadow: none;
}
.content .complete-wrap {
    position:relative;
    padding:10px 0 0 0;
}
.content .complete-wrap p {
    width: calc(100% - 375px);
    margin: 0;
}
.content .complete-wrap button {
    padding:7px 30px;
    font-size:20px;
    position:absolute;
    top:10px;
}
.content .complete-wrap .reset {
    right:110px;
}
.content .complete-wrap .complete {
    right:0;
}
.content .complete-wrap .example {
    right:220px;
}
.content .content_wrap .content_scroll {
    max-height: calc(100vh - 260px);
    overflow: auto;
}
.content .content_wrap .content_scroll.scroll {
    max-height: calc(50vh - 120px);
}
.content .content_wrap .program-list .panel-body {
    max-height: calc(50vh - 163px);
    overflow: auto;
}
.program-list {
    padding-top:10px;
}
.program-list .panel-heading {
    padding:5px 15px;
    border-radius: 5px;
}
.program-list .panel-heading.active {
    border-radius: 5px 5px 0 0;
}
.program-list .panel-heading h4 {
    font-size:15px;
}
.program-list .panel-heading.active h4 {
    font-size:17px;
}
.program-list .panel-heading label {
    cursor: pointer;
}
.program-list .panel-heading button {
    width: calc(100% - 260px);
    display: inline-block;
    margin-left: 5px;
    text-align: left;
}
.program-list .panel-body {
    padding:0 10px;
}
.program-list #programExampleList {
    font-size:15px;
    margin:0;
}
#programExampleList th:nth-child(2), #programExampleList td:nth-child(2) {
    border-right: 3px solid black;
}
</style>