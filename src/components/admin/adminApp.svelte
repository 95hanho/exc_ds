<script>
	import { actionCheckedPrograms, getAdminApp } from '../../compositions/admin.js';
    import 'font-awesome/css/font-awesome.css';
    import { getContext, onDestroy, onMount } from 'svelte';
    import Loding from '../common/loding.svelte';
    import "moment/locale/ko";
    import moment from 'moment/moment';
    import { uiScr } from '../../compositions/scroll.js';
    import AdminAppStudents from './adminAppStudents.svelte';
    import { onAllLoding } from '../../store/moduleSlice.js';

    // export let openModalUserSearch;
    export let openModalProgramModify;
    export let programResult;
    export let openAdminAppAdd;
    export let modalStatus;
    export let changeUser;
    const resetModalStatus = getContext('resetModalStatus');

    let allChecked = false;
    let courses = []; // 과정리스트
    let allProgramList = []; // 프로그램리스트
    let programList = []; // 보여줄 **

    let checkedPrograms = []; // 체크된 프로그램들
    let checkedStudents = 0; // 체크된 프로그램 학생수
    let includeWait = true; // 대기자 포함시킬 지
    let checkedStudentsNotOver = 0; // 체크된 프로그램(대기자 제외)

    let close_class= true; // 폐강 숨김여부
    let close_class_count = 0; // 숨겨진 폐강 갯수

    let addClass = false; // 교육일이 이틀짜리가 있는지

    const nowDateIs = new Date();
    let selectMonth = 10; // 선택된 월
    let selectYear = 2021; //
    let yearList = [];
    for(let i = 2021; i <= nowDateIs.getFullYear(); i++) {
        yearList.push(i);
    }
    let selectDay = 0;
    let dayList = [];

    let selectCourse = ''; // 선택된 과정
    
    let sortingInfo = new Array(20).fill(null);
    let sortingIndex = -1; // sorting중인 인덱스
    let sortingAttr = ''; // sorting중인 속성
    let sortingReverseOn = false;

    let getProgramAwait = null;

    let clickPrventIndex = null;

    let trueIs_202405 = new Date('2024-05-01 00:00:00') < new Date();

    // 새로고침 버튼
    const reloadData = async () => {
        onAllLoding.set(true);
        await initDataFnc(selectYear, selectMonth);
        makeProgramList();
        onAllLoding.set(false);
    }
    // 과정 변경
    const makeProgramList = () => {
        const copyList = [...allProgramList];
        if(sortingAttr === 'enrol_limit' || sortingAttr === 'enrol_count') {
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
        // programList = copyList;
        close_class_count = 0; // 페강 갯수
        programList = copyList.filter((v) => {
            if(v.schedule_status) close_class_count++;
            if(close_class && v.schedule_status) return false;
            if(selectCourse && v.title !== selectCourse) return false;
            if(selectDay && 
            ![new Date(v.schedule_start_date).getDate(),
                new Date(v.schedule_start_date_add_date).getDate(),
                new Date(v.schedule_after_date).getDate(),
            ].includes(selectDay))
                return false;
            /* programList로 포함 전 해야할 것 */
            return true;
        });
        calcChecked();
    }
    // 폐강숨김상태변경
    const closeNhideClass = (closeOn) => {
        if(!checkedPrograms.length) return;
        const programCodes = checkedPrograms.map((v) => v.schedule_code)
        actionCheckedPrograms({
            schedule_code:programCodes,
            type:closeOn ? 'SC' : 'OPEN_STATUS',
        }).then(({data}) => {
            const indexList = checkedPrograms.map((v) => v.indexNum);
            indexList.map((allPIndex) => {
                if(closeOn) {
                    allProgramList[allPIndex].schedule_status = !allProgramList[allPIndex].schedule_status
                } else {
                    allProgramList[allPIndex].open_status = !allProgramList[allPIndex].open_status
                }
            });
            programList.map((v) => {
                v.checked = false;
            });
            makeProgramList();
        });
    }
    // 엑셀다운로드
    const studentsExcel = async () => {
        if(!checkedPrograms.length) return;
        onAllLoding.set(true);
        const programCodes = checkedPrograms.reduce((acc, cur) => {
            if(cur.enrol_count) {
                acc.push(cur.schedule_code);
            }
            return acc;
        }, []);
        await actionCheckedPrograms({
            schedule_code:programCodes,
            type:includeWait ? 'EXCEL_WITH_WAIT' : 'EXCEL',
        }).then(({data}) => {
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            if(includeWait) link.setAttribute('download', '수강생정보_대기자포함.xlsx');
            else link.setAttribute('download', '수강생정보_대기자미포함.xlsx');
            // link.setAttribute('download', '수강생정보_대기자제외.ext');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            programList.map((v) => {
                v.checked = false;
            });
            makeProgramList();
        });
        onAllLoding.set(false);
    }
    // 선택된 강의 학생 수 계산 및 아이디 저장
    const calcChecked = () => {
        let count = 0; // 전체
        let count2 = 0; // 대기자 제외
        let checkLeng = 0; // 체크 갯수
        setTimeout(() => {
            checkedPrograms = programList.reduce((acc, cur) => {
                // 체크된 프로그램obj저장 및 신청인원 계산
                if(cur.checked) {
                    acc.push(cur);
                    count += cur.enrol_count;
                    if(cur.enrol_limit < cur.enrol_count) {
                        count2 += cur.enrol_limit;
                    } else {
                        count2 += cur.enrol_count;
                    }
                }
                if(cur.checked) checkLeng++
                return acc;
            }, []);
            // 전체 선택 취소 or 선택
            if(!allChecked && checkLeng === programList.length && programList.length > 0) {
                allChecked = true;
            } else if(allChecked && checkLeng !== programList.length) {
                allChecked = false;
            }
            checkedStudents = count;
            checkedStudentsNotOver = count2;
        }, 200);
    }
    /*  */
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
    /*  */
    // 정렬변경
    const sortChange = (index, attr) => {
        if(sortingInfo[index] == true || sortingInfo[index] == false) {
            sortingInfo[index] = !sortingInfo[index];
        } else {
            const list = new Array(20).fill(null);
            list[index] = true;
            sortingInfo = list;
        }
        sortingIndex = index;
        sortingAttr = attr;
        makeProgramList();
        uiScr.goTopRight(0);
    }
    // 수강생 보기
    const showStudents = (pIndex) => {
        // 클릭된거 제외 닫기
        programList.map((v, i) => {
            if(pIndex === i) programList[pIndex].onStudents = !programList[pIndex].onStudents;
            else v.onStudents = false;
        });
    }
    /*  */
    // 프로그램 수정 후 결과
    $: if(modalStatus === 'modifySuccess') {
        allProgramList[programResult.indexNum] = programResult;
        makeProgramList();
        resetModalStatus();
    }
    /*  */
    // 초기 프로그램리스트 반복사용
    const initDataFnc = async (year, month) => {
        getProgramAwait = await getAdminApp(year, month).then(({data}) => {
            console.log(data.data);
            if(year === 0 && month === 0) {
                selectMonth = data.select_month;
                selectYear = data.select_year;
            }
            const inDays = new Set();
            addClass = false;
            const set = new Set(
                data.data.map((v, i) => {
                    v.indexNum = i;
                    v.checked = false;
                    v.onStudents = false;
                    v.onChanging = false;
                    inDays.add(new Date(v.schedule_start_date).getDate());
                    if(v.schedule_start_date_add_date)
                        inDays.add(new Date(v.schedule_start_date_add_date).getDate());
                    if(v.schedule_after_date) {
                        v.schedule_after_date.map((after_date) => {
                            inDays.add(new Date(after_date).getDate());
                        });
                    }
                    if(v.schedule_start_date_add_date) {
                        addClass = true;
                    }
                    return v.title
                })
            );
            dayList.length = 0;
            dayList.push(...inDays);
            dayList.sort((a, b) => a > b ? 1 : -1);
            courses.length = 0;
            courses.push(...set);
            courses.sort();
            courses = courses;
            allProgramList = data.data;
            selectCourse = "";
            allChecked = false;
        });
        makeProgramList();
    }
    /*  */
    
    /*  */
    const schedule_latest = (changeProgram) => {
        allProgramList[changeProgram.indexNum] = changeProgram;
        makeProgramList();
    }
    /*  */
    onMount(async () => {
        await initDataFnc(0, 0);
        window.addEventListener('scroll', uiScr.programAdminHeaderFixed);
    });
    onDestroy(() => {
        window.removeEventListener('scroll', uiScr.programAdminHeaderFixed);
    });
</script>

<!-- BEGIN page-header -->
<!-- <h1 class="page-header">Managed Tables <small>header small text goes here...</small></h1> -->
<!-- END page-header -->
<!-- BEGIN panel -->
<p class="apply-comment">
    (과정별 대상 유형 : 
    <span class="c_red">그룹장</span>,
    <span class="c_blue">파트장</span>)
</p>
<div class="panel panel-inverse">
    <!-- BEGIN panel-heading -->
    <div class="panel-heading">
    </div>
    <!-- END panel-heading -->
    <!-- BEGIN panel-body -->
    <div id="scrollInit" class="panel-body">
        <div class="row select-row">
            <div class="col-sm-12 col-md-6">
                <div class="dataTables_length select-table" id="data-table-default_length">
                    <label>
                        <select 
                        name="data-table-default_length"
                        aria-controls="data-table-default" 
                        class="form-select form-select-sm"
                        bind:value={selectYear}
                        on:change={() => {
                            selectDay = 0;
                            initDataFnc(selectYear, selectMonth);
                        }}>
                            {#each yearList as inYear}
                            <option value={inYear}>{inYear}</option>
                            {/each}
                        </select>&nbsp;&nbsp;년
                    </label>
                    <label>
                        <select 
                        name="data-table-default_length"
                        aria-controls="data-table-default" 
                        class="form-select form-select-sm"
                        bind:value={selectMonth}
                        on:change={() => {
                            selectDay = 0;
                            initDataFnc(selectYear, selectMonth);
                        }}>
                            <option value={99}>전체</option>
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
                    <label>
                        <select 
                        name="data-table-default_length"
                        aria-controls="data-table-default" 
                        class="form-select form-select-sm"
                        bind:value={selectDay}
                        on:change={() => {
                            setTimeout(() => {
                                makeProgramList();
                            }, 200);
                        }}>
                            <option value={0}>전체</option>
                            {#each dayList as dayValue}
                            <option value={dayValue}>{dayValue}</option>
                            {/each}
                        </select>&nbsp;&nbsp;일
                    </label>
                </div>
            </div>
            <div class="col-sm-12 col-md-6 add">
                <div id="data-table-default_filter" class="dataTables_filter select-table">
                    <span>과정&nbsp;</span>
                    <label>
                        <select bind:value={selectCourse}
                        on:change={() => {
                            selectDay = 0;
                            makeProgramList();
                        }}
                        class="form-select form-select-sm">
                            <option value="">======과정명 전체보기======</option>
                            {#each courses as course}
                            <option value={course}>{course}</option>
                            {/each}
                        </select>
                    </label>
                    <button class="reload-data"
                        on:click={reloadData}>
                        <i class="fas fa-sync fa-spin"></i>
                    </button>
                    <button class="plus-data btn btn-info"
                        on:click={openAdminAppAdd}>
                        강의<i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
            <div id="headerFixed" class="button_area">
                <div class="fs-20px f-left">
                    전체 : {allProgramList.length} 개, 폐강: {close_class_count}개
                    (<input id="close_class" type="checkbox" 
                    bind:checked={close_class}
                    on:change={makeProgramList}>
                    <label for="close_class">폐강된 과정 안보기</label>)
                    <p class="align_left c_blue" style="margin: 0;">* {checkedPrograms.length}개 선택됨</p>
                </div>
                <div>
                    <button type="button" class="btn btn-gray me-1 mb-1"
                        on:click={() => closeNhideClass(true)}>선택 폐강상태변경</button>
                    <button type="button" class="btn btn-default me-1 mb-1"
                        on:click={() => closeNhideClass(false)}>선택 숨김상태변경</button>
                </div>
                <div>
                    <button type="button" class="btn btn-success me-1 mb-1"
                        on:click={studentsExcel}>{includeWait ? checkedStudents : checkedStudentsNotOver}명 엑셀다운로드</button>
                    <input type="checkbox" id="exWait" bind:checked={includeWait}> <label for="exWait">대기자 포함</label>
                </div>
                
            </div>
        </div>
        <!-- BEGIN fixed헤더 -->
        <header class="program_header">
            <div class="header_wrap">
                <div class="row select-row">
                    <div class="button_area">
                        <div class="fs-20px f-left">
                            <input id="close_class" type="checkbox" 
                            bind:checked={close_class}
                            on:change={makeProgramList}>
                            <label for="close_class">폐강된 과정 안보기({close_class_count})</label>
                            <p class="align_left c_blue" style="margin: 0;">* {checkedPrograms.length}개 선택됨</p>
                        </div>
                        <div>
                            <button type="button" class="btn btn-gray me-1 mb-1" on:click={() => closeNhideClass(true)}>선택 폐강상태변경</button>
                            <button type="button" class="btn btn-default me-1 mb-1" on:click={() => closeNhideClass(false)}>선택 숨김상태변경</button>
                        </div>
                        <div>
                            <button type="button" class="btn btn-success me-1 mb-1"
                                on:click={studentsExcel}>{includeWait ? checkedStudents : checkedStudentsNotOver}명 엑셀다운로드</button>
                            <input type="checkbox" id="exWait" bind:checked={includeWait}> <label for="exWait">대기자 포함</label>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <table class="application-table table table-striped table-bordered align-middle"
                        class:addClass={addClass}>
                        <thead>
                            <tr class="bg-gray-100">
                                <th>
                                    <input type="checkbox" bind:checked={allChecked} on:change={(e) => {
                                        programList.map((v) => {
                                            v.checked = allChecked;
                                        });
                                        programList = programList;
                                        calcChecked();
                                    }}>
                                </th>
                                <th class="number"
                                class:asc={sortingInfo[0] == true}
                                class:desc={sortingInfo[0] == false}>
                                    <button on:click={() => sortChange(0, 'index')}></button>
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
                                    <button on:click={() => sortChange(2, 'group_title')}></button>
                                    역량</th>
                                <th class="text-nowrap sorting"
                                class:asc={sortingInfo[3] == true}
                                class:desc={sortingInfo[3] == false}>
                                    <button on:click={() => sortChange(3, 'title')}></button>
                                    과정</th>
                                <th class="text-nowrap sorting"
                                class:asc={sortingInfo[4] == true}
                                class:desc={sortingInfo[4] == false}>
                                    <button on:click={() => sortChange(4, 'time')}></button>
                                    교육<br>시간</th>
                                <th class="text-nowrap sorting"
                                class:asc={sortingInfo[5] == true}
                                class:desc={sortingInfo[5] == false}>
                                    <button on:click={() => sortChange(5, 'schedule_number')}></button>
                                    차수</th>
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
                                <th class="text-nowrap"
                                class:asc={sortingInfo[10] == true}
                                class:desc={sortingInfo[10] == false}>
                                    잔여</th>
                                <th class="text-nowrap sorting"
                                class:asc={sortingInfo[11] == true}
                                class:desc={sortingInfo[11] == false}>
                                    <button on:click={() => sortChange(10, 'attendance_count')}></button>
                                    출결<br>인원</th>
                                <th class="text-nowrap">
                                </th>
                            </tr>
                        </thead>
                    </table>
                </div>
            </div>
        </header>
        <!-- END fixed헤더 -->
        <!-- BEGIN 실제헤더바디 -->
        <div class="row">
            {#await getProgramAwait}
            <Loding />
            {:then}
            <table id="application-table"
                class="application-table table table-striped table-bordered align-middle"
                class:addClass={addClass}
                >
                <thead>
                    <tr class="bg-gray-100">
                        <th>
                            <input type="checkbox" bind:checked={allChecked} 
                                on:change={(e) => {
                                programList.map((v) => {
                                    v.checked = allChecked;
                                });
                                programList = programList;
                                calcChecked();
                            }}>
                        </th>
                        <th class="number"
                        class:asc={sortingInfo[0] == true}
                        class:desc={sortingInfo[0] == false}>
                            <button on:click={() => sortChange(0, 'index')}></button>
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
                            <button on:click={() => sortChange(2, 'group_title')}></button>
                            역량</th>
                        <th class="text-nowrap sorting"
                        class:asc={sortingInfo[3] == true}
                        class:desc={sortingInfo[3] == false}>
                            <button on:click={() => sortChange(3, 'title')}></button>
                            과정</th>
                        <th class="text-nowrap sorting"
                        class:asc={sortingInfo[4] == true}
                        class:desc={sortingInfo[4] == false}>
                            <button on:click={() => sortChange(4, 'time')}></button>
                            교육<br>시간</th>
                        <th class="text-nowrap sorting"
                            class:asc={sortingInfo[5] == true}
                            class:desc={sortingInfo[5] == false}>
                            <button on:click={() => sortChange(5, 'schedule_number')}></button>
                            차수</th>
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
                        <th class="text-nowrap"
                        class:asc={sortingInfo[10] == true}
                        class:desc={sortingInfo[10] == false}>
                            잔여</th>
                        <th class="text-nowrap sorting"
                        class:asc={sortingInfo[11] == true}
                        class:desc={sortingInfo[11] == false}>
                            <button on:click={() => sortChange(10, 'attendance_count')}></button>
                            출결<br>인원</th>
                        <th class="text-nowrap">
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {#each programList as program, index}
                    <tr class:checked={program.checked}
                        class:notChecked={!program.checked}
                        class:closed={program.schedule_status}
                        class:hided={!program.open_status}
                        class="mainInfo"
                        on:click={(e) => {
                            clearTimeout(clickPrventIndex);
                            clickPrventIndex = setTimeout(() => {
                                program.checked = !program.checked
                                calcChecked();
                            }, 160);
                        }}
                        on:dblclick|stopPropagation={(e) => {
                            clearTimeout(clickPrventIndex);
                            openModalProgramModify(program);
                        }}>
                        <td>
                            <input type="checkbox" bind:checked={program.checked} on:click|stopPropagation={calcChecked}>
                        </td>
                        <td class="fw-bold">
                            {index + 1}
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
                        <td>{program.group_title}</td>
                        <td>{program.title}</td>
                        <td>
                            {program.time ? program.time +'H' : ''}
                            {#if new Date('2024-05-01 00:00:00') < new Date(program.schedule_start_date) && program.time <= 4}
                                <span class="ampm">{moment(program.schedule_start_date).format('a')}</span>
                            {/if}
                        </td>
                        <td>{program.schedule_number}차</td>
                        <td>
                            {#if program.online === 'Y'}
                            온라인
                            {:else}
                            <span class="c_red">*</span>집합
                            {/if}
                        </td>
                        <td
                            class:c_red={program.part_type === '그룹장'}
                            class:c_blue={program.part_type === '파트장'}>
                            <!-- {#if program.part_type === '합반'}
                            {program.part_type}
                            {:else} -->
                            <b>{program.part_type}</b>
                            <!-- {/if} -->
                        </td>
                        <td>{program.enrol_limit}</td>
                        <td style={enrollCountStyle(program.enrol_limit, program.enrol_count)}>
                            {program.enrol_count}
                        </td>
                        <td>{program.enrol_limit - program.enrol_count < 0 ? '-' : program.enrol_limit - program.enrol_count}</td>
                        <td>{program.attendance_count}</td>
                        <td class="apply-btn" on:click|stopPropagation={() => {
                            showStudents(index);
                        }}>
                            {#if program.onStudents}
                            <i class="bi bi-arrow-up-square fs-30px h-60px isLink_btn"></i>
                            {:else}
                            <i class="bi bi-arrow-down-square-fill fs-30px h-60px isLink_btn"></i>
                            {/if}
                        </td>
                    </tr>
                    {#if program.onStudents}
                    <AdminAppStudents curProgram={program} 
                    {schedule_latest} {modalStatus} {changeUser}/>
                    {/if}
                    {/each}
                </tbody>
            </table>
            {/await}
        </div>
        <!-- END 실제헤더바디 -->
        
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
.col-sm-12 {
    width: 35%;
}
.col-sm-12.add {
    width: 65%;
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
.button_area {
    padding-top:10px;
    width:100%;
    text-align: right;
}
.table-striped>tbody>tr:nth-of-type(odd)>* {
    --bs-table-bg-type: auto;
}
.reload-data {
    font-size: 30px;
    border: 1px solid lightgray;
    padding: 0 11px 5.8px 11px;
    background-color: lightgray;
    border-radius: 5px;
}
.plus-data {
    font-size: 25px;
    color:white;
    /* border: 1px solid #12EAFF; */
    padding: 0 11px 5.8px 11px;
    /* background-color: #12EAFF; */
    border-radius: 5px;
    height: 53px;
    line-height: 45px;
}
.application-table {
    text-align: center;
    font-size: 15px;
}
.application-table>thead th {
    position: relative;
}
.application-table>thead th button {
    width: 100%;
    height: 100%;
    /* display: inline-block; */
    /* display: block; */
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
}
.application-table>thead th:nth-child(1) {
    width:4%
}
.application-table>thead th:nth-child(2) {
    width:4%
}
.application-table>thead th:nth-child(3) {
    width:7%
}
.application-table.addClass>thead th:nth-child(3) {
    width:14%
}
.application-table>thead th:nth-child(4) {
    width:12%
}
.application-table>thead th:nth-child(5) {
    /* width:10% */
}
.application-table>thead th:nth-child(6) {
    width:6%;
}
.application-table>thead th:nth-child(7) {
    width:5%
}
.application-table>thead th:nth-child(8) {
    width:6%
}
.application-table>thead th:nth-child(9) {
    width:6%
}
.application-table>thead th:nth-child(10) {
    width:6%
}
.application-table>thead th:nth-child(11) {
    width:6%
}
.application-table>thead th:nth-child(12) {
    width:5%
}
.application-table>thead th:nth-child(13) {
    width:6%
}
.application-table>thead th:nth-child(14) {
    width:4%
}
.application-table 
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
.application-table .sorting.number:after {
    right:17.7px;
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
.application-table>tbody tr.closed {
    background-color: #7a7a7a;
    color:#fff !important;
}
.application-table>tbody tr.hided {
    text-decoration: line-through;
    /* background-color: #e9e9e9; */
}
.application-table>tbody tr.checked {
    background-color: #12EAFF;
}
.application-table>tbody tr.checked>td {
    --bs-table-bg-type: auto !important;
}
.application-table>tbody tr td button {
    min-width: 52.25px;
    height: 30px;
    font-size: 15px;
    padding: 0 5px;
}
.application-table>tbody tr .apply-btn {
    padding:0;
}
.application-table>tbody>tr.notChecked.mainInfo:hover {
    background-color: #CCFFFF;
}
.application-table>tbody>tr.mainInfo>td {
    cursor: pointer;
}
input[type="checkbox"] {
    width:25px;
    height: 25px;
    accent-color: #555;
}
#close_class {
    accent-color: #aaa;
}
header.program_header {
    position:fixed;
    display: none;
    width:100%;
    top:0;
    left:0;
    z-index:20;
}
header.program_header .header_wrap {
    margin:0 auto;
    width:1200px;
    padding:0 18px;
}
header.program_header .header_wrap>.row {
    background-color: #fff;
}
header.program_header .header_wrap table {
    margin:0;
}
header.program_header .header_wrap .button_area {
    background-color: #fff;
}
</style>