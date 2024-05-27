<script>
	import { fade } from 'svelte/transition';
	import { getProgram, programApply } from './../../compositions/application.js';
    import 'font-awesome/css/font-awesome.css';
    import { onDestroy, onMount } from 'svelte';
    import Loding from '../common/loding.svelte';
    import "moment/locale/ko";
    import moment from 'moment/moment';
    import { modal_alert, modal_apply_cancer_result } from '../../store/modalSlice.js';
    import { push, querystring, replace } from 'svelte-spa-router';
    import { uiScr } from '../../compositions/scroll.js';
    import { onAllLoding } from '../../store/moduleSlice.js';
    import { groupLineUI } from '../../compositions/ui.js';

    export let reMyApplication;

    let courses = []; // 과정리스트
    let allProgramList = []; // 프로그램리스트
    let programList = []; // 보여줄 **
    let selectMonth = 10; // 선택된 월
    let selectCourse = ''; // 선택된 과정
    let sortingInfo = [null, null, null, null, null, null, null, null, null, null];
    let sortingIndex = -1; // sorting중인 인덱스
    let sortingAttr = ''; // sorting중인 속성
    const nowDateIs = new Date();
    let getProgramAwait = null;

    let addClass = false;
    // 오전/오후 표시
    let trueIs_202405 = new Date('2024-05-01 00:00:00') < new Date();
    // 그룹갯수
    let group_count = 0;
    $:group_arr = Array.from({length:group_count}, (_, index) => index + 1);

    // 월 바꾸기
    const changeMonth = async () => {
        await initData(selectMonth);
        selectCourse = "";
        makeProgramList();
    }
    // 신청인원 꾸미기
    const enrollCountStyle = (limit, count) => {
        const remainder = limit - count;
        const yellowLimit = Math.round(limit / 3); 
        const redLimit = Math.round(limit / 10); 
        if(remainder <= redLimit) {
            return `color: red; font-weight: 900`
        } else if(remainder <= yellowLimit) {
            return `color: #F29661; font-weight: 900`
        } else {
            return `color: blue; font-weight: 500`
        }
    }
    // 과정 변경
    const makeProgramList = () => {
        const copyList = [...allProgramList];
        if(sortingAttr === 'indexNum' || sortingAttr === 'enrol_limit' || sortingAttr === 'enrol_count') {
            if(sortingInfo[sortingIndex] == true) {
                copyList.sort((a, b) => a[sortingAttr] - b[sortingAttr]);
            } else if(sortingInfo[sortingIndex] == false) {
                copyList.sort((a, b) => b[sortingAttr] - a[sortingAttr]);
            }
        } else {
            if(sortingInfo[sortingIndex] == true) {
                copyList.sort((a, b) => a[sortingAttr] >= b[sortingAttr] ? 1 : -1);
            } else if(sortingInfo[sortingIndex] == false) {
                copyList.sort((a, b) => a[sortingAttr] < b[sortingAttr] ? 1 : -1);
            }
        }
        programList = copyList;
        // allProgramList = copyList;
        programList = programList.filter((v) => {
            if(selectCourse === "") return true;
            if(v.title === selectCourse) return true;
            return false;
        });
        groupLineUI.groupLineDelete();
        setTimeout(() => {
            groupLineUI.groupLineSet();
        }, 400);
    }
    // 정렬변경
    const sortChange = (index, attr) => {
        if(sortingInfo[index] == true || sortingInfo[index] == false) {
            sortingInfo[index] = !sortingInfo[index];
        } else {
            const list = [null, null, null, null, null, null, null, null, null, null];
            list[index] = true;
            sortingInfo = list;
        }
        sortingIndex = index;
        sortingAttr = attr;
        makeProgramList();
        uiScr.goTopRight(0);
    }
    // 수강신청
    const apply_before = async (index, code) => {
        onAllLoding.set(true);
        await programApply(code).then(({data}) => {
            if(data.code === 403) {
                modal_alert.open('최대 3개까지의 과정을 신청할 수 있습니다.<br>기존의 과정을 취소 후 신청해주세요.');
                return;
            }
            allProgramList[index] = {
                ...data.schedule_info,
                indexNum:index,
            };
            makeProgramList();
            reMyApplication();
        }).catch((err) => {
            modal_alert.open('잠시 후 다시 시도해주세요.');
        });
        onAllLoding.set(false);
    }
    // 프로그램리스트 반복 다돌고 완성
    // $:if(pListEnd) {
    // }
    // 수강취소 됐을 때
    $:if($modal_apply_cancer_result === 'cancel') {
        window.removeEventListener('scroll', uiScr.listViewHeaderFixed);
        getProgramAwait = getProgram(selectMonth).then(({data}) => {
            data.data.map((v, i) => {
                    v.indexNum = i;
                    return v.title
            });
            allProgramList = data.data;
            makeProgramList();
            $modal_apply_cancer_result = "";
        });
        window.addEventListener('scroll', uiScr.listViewHeaderFixed);
    }
    const initData = async (month) => {
        window.removeEventListener('scroll', uiScr.listViewHeaderFixed);
        getProgramAwait = await getProgram(month).then(({data}) => {
            if(month === 0) {
                selectMonth = Number(data.select_month);
            }
            addClass = false;
            group_count = 0;
            const set = new Set(
                data.data.map((v, i) => {
                    v.indexNum = i;
                    if(v.schedule_start_date_add_date) {
                        addClass = true;
                    }
                    // schedule_group_num
                    if(v.schedule_group_num > group_count) group_count++;
                    return v.title
            }));
            courses.length = 0;
            courses.push(...set);
            courses.sort();
            courses = courses;
            allProgramList = data.data;
            sortingInfo = [null, null, null, null, null, null, null, null, null, null];
        });
        window.addEventListener('scroll', uiScr.listViewHeaderFixed);
    }
    onMount(async () => {
        await initData(0);
        const urlParams = new URLSearchParams($querystring);
        const content = urlParams.get('content');
        selectCourse = content || "";
        makeProgramList();
        replace('/application/list');
        window.addEventListener('scroll', uiScr.listViewHeaderFixed);
    });
    onDestroy(() => {
        window.removeEventListener('scroll', uiScr.listViewHeaderFixed);
    });
</script>

<!-- BEGIN page-header -->
<!-- <h1 class="page-header">Managed Tables <small>header small text goes here...</small></h1> -->
<!-- END page-header -->
<!-- BEGIN panel -->
<p class="apply-comment" in:fade={{duration: 500}} out:fade={{duration: 200}}>
    (과정별 대상 유형 : 
    <span class="c_red">그룹장</span>,
    <span class="c_blue">파트장</span>,
    합반)
</p>
<div class="panel panel-inverse" in:fade={{duration: 500}} out:fade={{duration: 200}}>
    <!-- BEGIN panel-heading -->
    <div class="panel-heading">
        <!-- <h4 class="panel-title">Data Table - Default</h4>
        <div class="panel-heading-btn">
            <a href="javascript:;" class="btn btn-xs btn-icon btn-default" data-toggle="panel-expand"><i class="fa fa-expand"></i></a>
            <a href="javascript:;" class="btn btn-xs btn-icon btn-success" data-toggle="panel-reload"><i class="fa fa-redo"></i></a>
            <a href="javascript:;" class="btn btn-xs btn-icon btn-warning" data-toggle="panel-collapse"><i class="fa fa-minus"></i></a>
            <a href="javascript:;" class="btn btn-xs btn-icon btn-danger" data-toggle="panel-remove"><i class="fa fa-times"></i></a>
        </div> -->
    </div>
    <!-- END panel-heading -->
    <!-- BEGIN panel-body -->
    <div class="panel-body">
        <div class="row select-row">
            <div class="col-sm-12 col-md-6">
                <div class="dataTables_length select-table" id="data-table-default_length">
                    <label>
                        <select 
                        name="data-table-default_length"
                        aria-controls="data-table-default" 
                        class="form-select form-select-sm"
                        bind:value={selectMonth}
                        on:change={changeMonth}>
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                            <option value={5}>5</option>
                            <option value={6}>6</option>
                            <option value={7}>7</option>
                            <option value={8}>8</option>
                            <option value={9}>9</option>
                            <option value={10}>10</option>
                            <option value={11}>11</option>
                            <option value={12}>12</option>
                        </select>&nbsp;&nbsp;월
                    </label>
                </div>
            </div>
            <div class="col-sm-12 col-md-6">
                <div id="data-table-default_filter" class="dataTables_filter select-table">
                    <span>과정&nbsp;</span>
                    <label>
                        <select bind:value={selectCourse}
                        on:change={makeProgramList}
                        name="data-table-default_length" 
                        aria-controls="data-table-default" 
                        class="form-select form-select-sm">
                            <option value="">======과정명 전체보기======</option>
                            {#each courses as course}
                            <option value={course}>{course}</option>
                            {/each}
                        </select>
                    </label>
                </div>
            </div>
        </div>
        <div class="row pst-relative">
            {#await getProgramAwait}
            <Loding />
            {:then}
            <table id="application-table"
                class="application-table table table-striped table-bordered align-middle"
                class:addClass={addClass}
                >
                <thead>
                    <tr>
                        <th class="sorting"
                        class:asc={sortingInfo[0] == true}
                        class:desc={sortingInfo[0] == false}>
                            <button on:click={() => sortChange(0, 'indexNum')}></button>
                        </th>
                        <th class="text-nowrap sorting"
                        class:asc={sortingInfo[1] == true}
                        class:desc={sortingInfo[1] == false}>
                            <button on:click={() => sortChange(1, 'schedule_start_date')}></button>
                            교육일
                        </th>
                        <th class="text-nowrap sorting"
                        class:asc={sortingInfo[2] == true}
                        class:desc={sortingInfo[2] == false}>
                            <button on:click={() => sortChange(2, 'schedule_enrol_end_date')}></button>
                            신청마감일</th>
                        <th class="text-nowrap sorting"
                        class:asc={sortingInfo[3] == true}
                        class:desc={sortingInfo[3] == false}>
                            <button on:click={() => sortChange(3, 'group_title')}></button>
                            역량</th>
                        <th style="width:350px" class="text-nowrap sorting"
                        class:asc={sortingInfo[4] == true}
                        class:desc={sortingInfo[4] == false}>
                            <button on:click={() => sortChange(4, 'title')}></button>
                            과정</th>
                        <th class="text-nowrap sorting"
                        class:asc={sortingInfo[5] == true}
                        class:desc={sortingInfo[5] == false}>
                            <button on:click={() => sortChange(5, 'time')}></button>
                            교육<br>시간</th>
                        <th class="text-nowrap sorting"
                        class:asc={sortingInfo[6] == true}
                        class:desc={sortingInfo[6] == false}>
                            <button on:click={() => sortChange(6, 'online')}></button>
                            방법</th>
                        <th class="text-nowrap sorting"
                        class:asc={sortingInfo[7] == true}
                        class:desc={sortingInfo[7] == false}>
                            <button on:click={() => sortChange(7, 'part_type')}></button>
                            유형</th>
                        <th class="text-nowrap sorting"
                        class:asc={sortingInfo[8] == true}
                        class:desc={sortingInfo[8] == false}>
                            <button on:click={() => sortChange(8, 'enrol_limit')}></button>
                            정원</th>
                        <th class="text-nowrap sorting"
                        class:asc={sortingInfo[9] == true}
                        class:desc={sortingInfo[9] == false}>
                            <button on:click={() => sortChange(9, 'enrol_count')}></button>
                            신청<br>인원</th>
                        <th class="text-nowrap">
                            수강신청</th>
                    </tr>
                </thead>
                <tbody>
                    {#each programList as program, index}
                    <tr class:groups={program.schedule_group_num}
                        class:one={program.schedule_group_num && program.schedule_group_num % 5 === 1}
                        class:two={program.schedule_group_num && program.schedule_group_num % 5 === 2}
                        class:three={program.schedule_group_num && program.schedule_group_num % 5 === 3}
                        class:four={program.schedule_group_num && program.schedule_group_num % 5 === 4}
                        class:five={program.schedule_group_num && program.schedule_group_num % 5 === 0}
                        class={program.schedule_group_num ? `group-${program.schedule_group_num}` : ''}
                        >
                        <td width="1%" class="fw-bold">
                            {program.indexNum + 1}
                        </td>
                        <td>{moment(program.schedule_start_date).format('M.D (ddd)')}
                            {#if program.schedule_start_date_add_date}
                                ~{moment(program.schedule_start_date_add_date).format('M.D (ddd)')}
                            {/if}
                            {#if program.schedule_after_date}
                                {#each program.schedule_after_date as afterDate}
                                <br>{moment(afterDate).format('M.D (ddd)')}
                                {/each}
                            {/if}
                        </td>
                        <!-- <td>10.10(월)~10.11(목)<br>12.12(금)</td> -->
                        <td>{moment(program.schedule_enrol_end_date).format('M.D (ddd)')}</td>
                        <td>{program.group_title}</td>
                        <td>
                            <button class="isLink_btn" style="display: inline" on:click={() => {
                                push(`/program/${program.program_code}`)
                            }}>{program.title}</button>
                            {#if program.schedule_group_num}
                            <p class="group-notice">* 이어지는 4H강의</p>
                            {/if}
                        </td>
                        <td>{program.time ? program.time +'H' : ''}
                            {#if new Date('2024-05-01 00:00:00') < new Date(program.schedule_start_date) && program.time <= 4}
                                <span class="ampm">{moment(program.schedule_start_date).format('a')}</span>
                            {/if}
                        </td>
                        <td>
                            {#if program.online === 'Y'}
                            온라인
                            {:else}
                            <span class="c_red">*</span>집합
                            {/if}
                        </td>
                        <td class:c_red={program.part_type === '그룹장'}
                            class:c_blue={program.part_type === '파트장'}>
                            {#if program.part_type === '합반'}
                            {program.part_type}
                            {:else}
                            <b>{program.part_type}</b>
                            {/if}
                        </td>
                        <td>{program.enrol_limit}</td>
                        <td style={enrollCountStyle(program.enrol_limit, program.enrol_count)}>
                            {program.enrol_count}
                        </td>
                        <td class="apply-btn">
                            {#if program.schedule_status === true}
                            <span class="c_darkgray">폐강</span>
                            {:else if nowDateIs <= new Date(program.schedule_enrol_start_date)}
                            오픈예정
                            {:else if new Date(program.schedule_enrol_end_date) < nowDateIs}
                            <span class="c_darkgray">마감</span>
                            {:else}
                                {#if program.my_enrol_status === 1}
                                <strong class="c_mediumseagreen">신청완료</strong>
                                {:else}
                                    <button type="button"
                                        class="btn btn-primary"
                                        class:btn-warning={program.enrol_count >= program.enrol_limit}
                                        on:click={() => apply_before(program.indexNum, program.schedule_code)}>
                                    {#if program.enrol_count >= program.enrol_limit}
                                    대기신청<span style="font-size: 13px">({program.enrol_count - program.enrol_limit + 1}명)</span>
                                    {:else}
                                    신청하기
                                    {/if}
                                    </button>
                                {/if}
                            {/if}
                        </td>
                    </tr>
                    {/each}
                </tbody>
            </table>
            <header id="list_header">
                <div class="header_wrapper">
                    <table class="application-table table table-striped table-bordered align-middle"
                        class:addClass={addClass}>
                        <thead>
                            <tr>
                                <th class="sorting"
                                class:asc={sortingInfo[0] == true}
                                class:desc={sortingInfo[0] == false}>
                                    <button on:click={() => sortChange(0, 'indexNum')}></button>
                                </th>
                                <th class="text-nowrap sorting"
                                class:asc={sortingInfo[1] == true}
                                class:desc={sortingInfo[1] == false}>
                                    <button on:click={() => sortChange(1, 'schedule_start_date')}></button>
                                    교육일
                                </th>
                                <th class="text-nowrap sorting"
                                class:asc={sortingInfo[2] == true}
                                class:desc={sortingInfo[2] == false}>
                                    <button on:click={() => sortChange(2, 'schedule_enrol_end_date')}></button>
                                    신청마감일</th>
                                <th class="text-nowrap sorting"
                                class:asc={sortingInfo[3] == true}
                                class:desc={sortingInfo[3] == false}>
                                    <button on:click={() => sortChange(3, 'group_title')}></button>
                                    역량</th>
                                <th style="width:350px" class="text-nowrap sorting"
                                class:asc={sortingInfo[4] == true}
                                class:desc={sortingInfo[4] == false}>
                                    <button on:click={() => sortChange(4, 'title')}></button>
                                    과정</th>
                                <th class="text-nowrap sorting"
                                class:asc={sortingInfo[5] == true}
                                class:desc={sortingInfo[5] == false}>
                                    <button on:click={() => sortChange(5, 'time')}></button>
                                    교육<br>시간</th>
                                <th class="text-nowrap sorting"
                                class:asc={sortingInfo[6] == true}
                                class:desc={sortingInfo[6] == false}>
                                    <button on:click={() => sortChange(6, 'online')}></button>
                                    방법</th>
                                <th class="text-nowrap sorting"
                                class:asc={sortingInfo[7] == true}
                                class:desc={sortingInfo[7] == false}>
                                    <button on:click={() => sortChange(7, 'part_type')}></button>
                                    유형</th>
                                <th class="text-nowrap sorting"
                                class:asc={sortingInfo[8] == true}
                                class:desc={sortingInfo[8] == false}>
                                    <button on:click={() => sortChange(8, 'enrol_limit')}></button>
                                    정원</th>
                                <th class="text-nowrap sorting"
                                class:asc={sortingInfo[9] == true}
                                class:desc={sortingInfo[9] == false}>
                                    <button on:click={() => sortChange(9, 'enrol_count')}></button>
                                    신청<br>인원</th>
                                <th class="text-nowrap">
                                    수강신청</th>
                            </tr>
                        </thead>
                    </table>
                </div>
            </header>
            <div class="group-line_wrap">
                {#each group_arr as groupLine, index}
                <div class={`group-line line-${groupLine}`}
                    style={`width:${20 + 10 * index}px;left:${-20 -10 * index}px;display:none`}>
                </div>
                {/each}
            </div>
            {/await}
        </div>
        
    </div>
    <!-- END panel-body -->
</div>
<!-- END panel -->

<style>
div.dataTables_length select {
    width: auto;
    display: inline-block;
}
.dataTables_filter {
    text-align: right;
}
.select-row {
    padding-bottom: 20px;
}
.col-sm-12 {
    width: 50%;
}
.select-table select {
    font-size:20px;
}
.apply-comment {
    text-align: right;
    font-size:20px;
    margin-bottom: 0;
}
.apply-comment span {
    vertical-align: baseline;
}
.application-table {
    text-align: center;
    font-size: 15px;
}
.application-table th {
    position: relative;
}
.application-table th button {
    width: 100%;
    height: 100%;
    /* display: inline-block; */
    /* display: block; */
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
}
.application-table .sorting {
    padding-right:17px;
}
.application-table .sorting:first-child {
    padding-right:8px;
}
.application-table .sorting:after {
    opacity: 1;
    color: #b1b1b1;
    top: 0;
    right:5px;
    bottom: 0;
    font-size: 1rem;
    display: flex;
    align-items: center;
    font-family: Font Awesome\ 6 Free,Font Awesome\ 6 Pro,FontAwesome!important;
    font-weight: 900;
    font-style: normal;
    font-variant: normal;
    text-rendering: auto;
    content: "\f0dc";
    position: absolute;
}
.application-table .sorting.asc:after {
    content: "\f0dd";
    color: #4285f4;
}
.application-table .sorting.desc:after {
    content: "\f0de";
    color: red;
}
.application-table .sorting:first-child:after {
    position:relative;
    justify-content:center;
    right: auto;
}
.application-table tbody tr td button {
    min-width: 52.25px;
    font-size: 15px;
    padding: 2px 10px;
}
.application-table tbody tr .apply-btn {
    padding:0;
}
.application-table th:nth-child(1) {
    width:4%
}
.application-table th:nth-child(2) {
    width:8%
}
.application-table.addClass th:nth-child(2) {
    width:14%
}
.application-table th:nth-child(3) {
    width:7%
}
.application-table th:nth-child(4) {
    width:12%
}
.application-table th:nth-child(5) {
    /* width:10% */
}
.application-table td:nth-child(5) {
    word-break: keep-all;
}
.application-table th:nth-child(6) {
    width:6%
}
.application-table th:nth-child(7) {
    width:6%
}
.application-table th:nth-child(8) {
    width:6%
}
.application-table th:nth-child(9) {
    width:5%
}
.application-table th:nth-child(10) {
    width:5%
}
.application-table th:nth-child(11) {
    width:12%
}
.application-table tbody tr.groups {
    --bs-table-bg-type: none !important;
}
#list_header {
    position:fixed;
    display: none;
    width:100%;
    top:0;
    left:0;
    z-index:20;
    padding:0;
}
#list_header .header_wrapper {
    margin:0 auto;
    width:1200px;
    padding:0 6px;
}
#list_header .header_wrapper table {
    background-color: #fff;
    margin:0;
}

.group-notice {
    color:#f00;
    font-size:12px;
    text-align: left;
    font-weight: 600;
    padding:0 5px;
}
.group-notice:hover {
    text-decoration: none;
}
.table-striped>tbody>tr.groups>* {
    /* --bs-table-color-type: none; */
    --bs-table-bg-type: none;
}
.table-striped>tbody>tr.groups.one>* {
    background-color: #FFFF7E;
}
.table-striped>tbody>tr.groups.two>* {
    background-color: #D1FFCA;
}
.table-striped>tbody>tr.groups.three>* {
    background-color: #FFC6FF;
}
.table-striped>tbody>tr.groups.four>* {
    background-color: #C7C6FF;
}
.table-striped>tbody>tr.groups.five>* {
    background-color: #FFEE90;
}
</style>