<script>
	import { fade } from 'svelte/transition';
    import { getProgram } from '../../compositions/application.js';
	import { modal_apply_cancer_result, modal_apply_detail, modal_apply_detail_obj, modal_apply_detail_result } from '../../store/modalSlice.js';
	import { ui } from './../../compositions/ui.js';
    import { onMount } from 'svelte';
	import moment from 'moment/moment';

    export let reMyApplication;

    let calendar = null;
    let allProgramList = []; // 프로그램리스트
    let programList = null; // 보여줄 **
    // let bunya = [true, false, false, false, false]; // 분류 구별
    let groupTitleList = [];
    let groupTitleOnOff = [];
    let groupTitleColor = ['', '#46c29d', '#9324a6', '#6ba3fe', '#ef9968'];
    let bunya = [true, false, false]; // 분류 구별
    let sugang = [true, false, false]; // 수강 관리
    let online = [true, false, false]; // 온라인/오프라인
    let eduTime = [true, false, false, false, false]; // 교육시간
    function clickTrueAllFalseFilter(list, index) {
        return list = list.map((v, i) => {
            if(index === i) return true;
            return false;
        });
    }
    const groupTitleClick = (index) => {
        if(!groupTitleOnOff[index]) {
            groupTitleOnOff = clickTrueAllFalseFilter(groupTitleOnOff, index);
            filterEvent();
        }
    }
    const sugangClick = (index) => {
        if(!sugang[index]) {
            sugang = clickTrueAllFalseFilter(sugang, index);
            filterEvent();
        }
    }
    const onlineClick = (index) => {
        if(!online[index]) {
            online = clickTrueAllFalseFilter(online, index);
            filterEvent();
        }
    }
    const eduTimeClick = (index) => {
        if(!eduTime[index]) {
            eduTime = clickTrueAllFalseFilter(eduTime, index);
            filterEvent();
        }
    }
    const filterEvent = () => {
         programList = allProgramList.filter((pg, i) => {
            // if(bunya[1]) {
            //     if(pg.group_title !== '사업/경영') return false;
            // } else if(bunya[2]) {
            //     if(pg.group_title !== '산업/기술') return false;
            // } else if(bunya[3]) {
            //     if(pg.group_title !== '리더십/조직문화') return false;
            // } else if(bunya[4]) {
            //     if(pg.group_title !== '인문/소양') return false;
            // }
            let groupTitleIndex = groupTitleOnOff.findIndex(v => v);
            if(groupTitleIndex > 0 && groupTitleIndex) {
                if(pg.group_title != groupTitleList[groupTitleIndex]) return false;
            }
            if(sugang[1]) {
                if(pg.schedule_status === true) return false; 
            } else if(sugang[2]) {
                if(pg.my_enrol_status !== 1) return false;
            }
            if(online[1]) {
                if(pg.online !== 'Y') return false;
            } else if(online[2]) {
                if(pg.online !== 'N') return false;
            }
            const ampm = moment(pg.schedule_start_date).format('a');
            if(eduTime[1]) {
                if(pg.time !== 4 || ampm == "오후") return false;
            } else if(eduTime[2]) {
                if(pg.time !== 4 || ampm == "오전") return false;
            } else if(eduTime[3]) {
                if(pg.time !== 8) return false;
            } else if(eduTime[4]) {
                if(pg.time !== 16) return false;
            }
            return true;
        });
    }
    let detail_store_index = 0; // 열려있는 모달창의 allProgramList의 index
    // 이벤트 클릭 시
    const clickEvent = (aplIndex) => {
        detail_store_index = aplIndex;
        modal_apply_detail.open(allProgramList[detail_store_index]);
    }
    // 프로그램 리스트 만들기
    const make_programList = (data) => {
        allProgramList = data;
        const group_title_set = new Set();
        programList = allProgramList.map((v, i) => {
            v.indexNum = i;
            group_title_set.add(v.group_title);
            return v;
        });
        groupTitleList = ["전체", ...group_title_set];
        groupTitleOnOff = new Array(groupTitleList.length + 1).fill(false);
        groupTitleOnOff[0] = true;
        bunya = [true, false, false];
        // bunya = [true, false, false, false, false];
        sugang = [true, false, false];
        online = [true, false, false];
        eduTime = [true, false, false, false, false];
    }

    // 월 바뀔 때
    let init = true; // 초기 두번 조회 방지
    let currentMonth = "";
    const changeMonth = (info) => {
        currentMonth = info.view.title.split(" ")[1].replace('월', '');
        if(!init) {
            getProgram(currentMonth).then(({data}) => {
                make_programList(data.data);
            });
        }
        init = false;
    }
    // programList이 업데이트되면
    $: if(calendar && programList) {
        calendar.removeAllEvents();
    }
    $: if(programList && programList.length > 0) {
        calendar.addEventSource(
            addEventSource()
        );
    }
    // ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
    const addEventSource = () => {
        return programList.map((v, i) => {
            /* 분류별 색 */
            let color = "";
            if (v.schedule_status === true) color = "#E6E6E6"; // 폐강
            else if(v.group_title_color) color = v.group_title_color; // 색깔 정해진거 있으면 그 색으로
            // else if (v.group_title === "사업/경영") color = "#46c29d";
            // else if (v.group_title === "산업/기술") color = "#9324a6";
            // else if (v.group_title === "리더십/조직문화") color = "#6ba3fe";
            // else if (v.group_title === "인문/소양") color = "#ef9968";
            if(!color) {
                let groupTitleIndex = groupTitleList.findIndex((val) => val == v.group_title);
                if(groupTitleIndex != -1) color = groupTitleColor[groupTitleIndex];
                else color = "#000";
            }
            /* 남은인원표시 */
            const remainder = v.enrol_limit - v.enrol_count;
            const yellowLimit = Math.round(v.enrol_limit / 3); 
            const redLimit = Math.round(v.enrol_limit / 10); 
            let remainColor = "";
            if(remainder <= redLimit) {
                remainColor = '#ff0000';
            } else if(remainder <= yellowLimit) {
                remainColor = '#F29661';
            }
            if(v.schedule_start_date_add_date) {
                return {
                    title: v.title,
                    start: new Date(`${v.schedule_start_date.substring(0, 10)} 00:00:00`),
                    end: new Date(`${v.schedule_start_date_add_date.substring(0, 10)} 23:59:59`),
                    className: `apply-${v.indexNum} 
                                remain-${v.enrol_limit - v.enrol_count} 
                                remainColor-${remainColor}
                                ${v.my_enrol_status == 1 ? 'enroll': ''}`,
                    color,
                }
            } else {
                return {
                    title: v.title,
                    date: new Date(v.schedule_start_date),
                    allDay: true,
                    className: `apply-${v.indexNum} 
                                remain-${v.enrol_limit - v.enrol_count} 
                                remainColor-${remainColor}
                                ${v.my_enrol_status == 1 ? 'enroll': ''}`,
                    color
                }
            }
            
        });
    }
    $: if($modal_apply_detail_result === 'apply') {
        allProgramList[detail_store_index] = 
            {   ...$modal_apply_detail_obj, indexNum: Number(detail_store_index)};
        allProgramList = allProgramList;
        filterEvent();
        calendar.removeAllEvents();
        calendar.addEventSource(
            addEventSource()
        );
        reMyApplication();
        $modal_apply_detail_result = "";
    }
    // 수강취소 됐을 때
    $: if($modal_apply_cancer_result === 'cancel') {
        cancelAPI();
        $modal_apply_cancer_result = "";
    }
    // ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
    const cancelAPI = () => {
        getProgram(currentMonth).then(({data}) => {
            allProgramList = data.data;
            allProgramList.map((v, i) => {
                v.indexNum = i;
                return v;
            });
            filterEvent();
        });
    }
    onMount(async () => {
        getProgram(0).then(({data}) => {
            calendar = ui.calendarInit(clickEvent, data.select_month, changeMonth);
            make_programList(data.data);
        });
        // calendar.addEventSource([]);
    });
</script>

<!-- BEGIN row -->
<div class="row calendar-store" in:fade={{duration: 500}} out:fade={{duration: 200}}>
    <!-- BEGIN event-list -->
    <div class="d-none d-lg-block" style="width: 215px;">
        <div id="external-events" class="fc-event-list">
            <h5 class="mb-3">수강관리</h5>
            <div>
                <button class="fc-event" data-color="#b6c2c9"
                    class:active={sugang[0]} on:click={() => sugangClick(0)}>
                    <div class="fc-event-text">전체</div>
                    <div class="fc-event-icon"><i class="fas fa-circle fa-fw fs-9px text-black-500"></i></div>
                </button>
                <button class="fc-event" data-color="#b6c2c9"
                    class:active={sugang[1]} on:click={() => sugangClick(1)}>
                    <div class="fc-event-text">폐강숨기기</div>
                    <div class="fc-event-icon"><i class="fas fa-circle fa-fw fs-9px text-black-500"></i></div>
                </button>
                <button class="fc-event" data-color="#b6c2c9"
                    class:active={sugang[2]} on:click={() => sugangClick(2)}>
                    <div class="fc-event-text">내강의만보기</div>
                    <div class="fc-event-icon"><i class="fas fa-circle fa-fw fs-9px text-black-500"></i></div>
                </button>
            </div>
            <hr class="my-3" />
            <h5 class="mb-3">분류</h5>
            <div>
                {#each groupTitleList as groupTitle, index}
                <button class="fc-event" class:active={groupTitleOnOff[index]}
                    on:click={() => groupTitleClick(index)}>
                    <div class="fc-event-text">{groupTitle}</div>
                    <div class="fc-event-icon">
                        <i class="fas fa-circle fa-fw fs-9px" 
                            class:text-black-500={index == 0} 
                            style={`color:${groupTitleColor[index]}`}>
                        </i>
                    </div>
                </button>    
                {/each}
                <!-- <button class="fc-event" class:active={bunya[0]} 
                    on:click={() => groupTitleClick(0)} data-color="#00acac">
                    <div class="fc-event-text">전체</div>
                    <div class="fc-event-icon"><i class="fas fa-circle fa-fw fs-9px text-black-500"></i></div>
                </button>
                <button class="fc-event" class:active={bunya[1]}
                    on:click={() => groupTitleClick(1)}>
                    <div class="fc-event-text">그룹장/PL</div>
                    <div class="fc-event-icon"><i class="fas fa-circle fa-fw fs-9px" style="color:#46c29d"></i></div>
                </button>
                <button class="fc-event" class:active={bunya[2]} 
                    on:click={() => groupTitleClick(2)} data-color="#f59c1a">
                    <div class="fc-event-text">파트장/TL</div>
                    <div class="fc-event-icon"><i class="fas fa-circle fa-fw fs-9px" style="color:#9324a6"></i></div>
                </button> -->
                <!-- <button class="fc-event" class:active={bunya[1]}
                    on:click={() => groupTitleClick(1)}>
                    <div class="fc-event-text">사업/경영</div>
                    <div class="fc-event-icon"><i class="fas fa-circle fa-fw fs-9px" style="color:#46c29d"></i></div>
                </button>
                <button class="fc-event" class:active={bunya[2]} 
                    on:click={() => groupTitleClick(2)} data-color="#f59c1a">
                    <div class="fc-event-text">산업/기술</div>
                    <div class="fc-event-icon"><i class="fas fa-circle fa-fw fs-9px" style="color:#9324a6"></i></div>
                </button>
                <button class="fc-event" class:active={bunya[3]} 
                    on:click={() => groupTitleClick(3)} data-color="#ff5b57">
                    <div class="fc-event-text">리더십/조직문화</div>
                    <div class="fc-event-icon"><i class="fas fa-circle fa-fw fs-9px" style="color:#6ba3fe"></i></div>
                </button>
                <button class="fc-event" class:active={bunya[4]} 
                    on:click={() => groupTitleClick(4)} data-color="#ff5b57">
                    <div class="fc-event-text">인문/소양</div>
                    <div class="fc-event-icon"><i class="fas fa-circle fa-fw fs-9px" style="color:#ef9968"></i></div>
                </button> -->
            </div>
            <!-- <hr class="my-3" />
            <h5 class="mb-3">온라인/오프라인</h5>
            <div>
                <button class="fc-event" data-color="#b6c2c9"
                    class:active={online[0]} on:click={() => onlineClick(0)}>
                    <div class="fc-event-text">전체</div>
                    <div class="fc-event-icon"><i class="fas fa-circle fa-fw fs-9px text-black-500"></i></div>
                </button>
                <button class="fc-event" data-color="#b6c2c9"
                    class:active={online[1]} on:click={() => onlineClick(1)}>
                    <div class="fc-event-text">온라인</div>
                    <div class="fc-event-icon"><i class="fas fa-circle fa-fw fs-9px text-black-500"></i></div>
                </button>
                <button class="fc-event" data-color="#b6c2c9"
                    class:active={online[2]} on:click={() => onlineClick(2)}>
                    <div class="fc-event-text">오프라인</div>
                    <div class="fc-event-icon"><i class="fas fa-circle fa-fw fs-9px text-black-500"></i></div>
                </button>
            </div>
            <hr class="my-3" />
            <h5 class="mb-3">교육시간</h5>
            <div>
                <button class="fc-event" data-color="#b6c2c9"
                    class:active={eduTime[0]} on:click={() => eduTimeClick(0)}>
                    <div class="fc-event-text">전체</div>
                    <div class="fc-event-icon"><i class="fas fa-circle fa-fw fs-9px text-black-500"></i></div>
                </button>
                <button class="fc-event" data-color="#b6c2c9"
                    class:active={eduTime[1]} on:click={() => eduTimeClick(1)}>
                    <div class="fc-event-text">4H (오전)<br>(08:30 ~ 12:30)</div>
                    <div class="fc-event-icon"><i class="fas fa-circle fa-fw fs-9px text-black-500"></i></div>
                </button>
                <button class="fc-event" data-color="#b6c2c9"
                    class:active={eduTime[2]} on:click={() => eduTimeClick(2)}>
                    <div class="fc-event-text">4H (오후)<br>(13:30 ~ 17:30)</div>
                    <div class="fc-event-icon"><i class="fas fa-circle fa-fw fs-9px text-black-500"></i></div>
                </button>
                <button class="fc-event" data-color="#b6c2c9"
                    class:active={eduTime[3]} on:click={() => eduTimeClick(3)}>
                    <div class="fc-event-text">8H</div>
                    <div class="fc-event-icon"><i class="fas fa-circle fa-fw fs-9px text-black-500"></i></div>
                </button>
                <button class="fc-event" data-color="#b6c2c9"
                    class:active={eduTime[4]} on:click={() => eduTimeClick(4)}>
                    <div class="fc-event-text">16H</div>
                    <div class="fc-event-icon"><i class="fas fa-circle fa-fw fs-9px text-black-500"></i></div>
                </button>
            </div> -->
            
        </div>
    </div>
    <!-- END event-list -->
    <div class="col-lg">
        <!-- BEGIN calendar -->
        <div id="calendar" class="calendar"></div>
        <!-- END calendar -->
    </div>
</div>
<!-- END row -->


<style>
.calendar-store {
    min-height: 1000px;
}
.row .col-lg {
    margin: 10px 0 82px 0;
}
.fc-event {
    display: flex;
    width: 100%;
    text-align: left;
    align-items: center;
}
.fc-event:focus::after {
    background:transparent;
    box-shadow: none;
}
.fc-event-list .fc-event:before {
    display: none;
}
.fc-event-list .fc-event {
    padding-left: 5px;
}
.d-none {
    position:absolute;
    right:-230px;
    /* left:-230px; */
}
#external-events {
    position:absolute;
    width:100%;
    top:70px;
    padding:20px 5px;
    border:5px double gray;
    border-radius: 10px;
}
#external-events .fc-event.active, #external-events .fc-event:hover {
    background-color:#DFDFDF;
    color:#fff;
    font-size:15px;
    font-weight: bold;
}
.d-lg-block {
    display: block!important;
}
.col-lg {
    flex: 1 0 0%;
}
</style>