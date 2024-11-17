<script>
	import { fade } from 'svelte/transition';
    import 'flatpickr/dist/flatpickr.css';
    import 'font-awesome/css/font-awesome.css';
    import 'jquery-ui/themes/base/draggable.css';
    import flatpickr from 'flatpickr';
    import { onDestroy, onMount } from 'svelte';
    import moment from 'moment';
    import { modal_alert } from '../../store/modalSlice';
    import { setAdminApp } from '../../compositions/admin';

    export let closeModalProgramModify;
    export let program;
    export let setAdminAppResult;
    console.log(program);

    let modalEle = null;

    let startDate;
    let endDate;
    let addDates = [""];
    let completeAddDates = null;

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
    // 추가교육일 리셋
    const resetAddDates = (index) => {
        console.log('resetAddDates', index)
        if(addDates.length > 1) {
            addDates = addDates.filter((v, i) => i !== index);
        } else {
            addDates[index] = "";
            addDates = addDates;
        }
    }

    // 프로그램 변경
    const setAdminApp_before = () => {
        const sDate = new Date(startDate);
        const eDate = new Date(endDate);
        if(sDate >= eDate) {
            modal_alert.open('종료일이 시작일보다 뒤여야 합니다.');
        } else if(addDates.some((v) => sDate >= new Date(v))
        || addDates.some((v) => eDate >= new Date(v))) {
            modal_alert.open('추가교육일은 시작일, 종료일보다 뒤여야 합니다.');
        } else if(!program.time || program.time <= 0) {
            modal_alert.open('교육시간 입력이 잘못되었습니다.');
        } else if(!program.enrol_limit || program.enrol_limit <= 0) {
            modal_alert.open('정원 입력이 잘못되었습니다.');
        } else {
            const obj = {
                schedule_code: program.schedule_code,
                schedule_start_date: new Date(startDate),
                time : program.time,
                online: program.online,
                part_type: program.part_type,
                enrol_limit: program.enrol_limit,
                schedule_number: program.schedule_number,
            }
            if(endDate)
                obj.schedule_start_date_add_date = new Date(endDate);
            if(addDates.length > 1)
                obj.schedule_after_date = addDates.slice(0, addDates.length - 1).sort();
            setAdminApp(obj).then(({data}) => {
                console.log(data);
                setAdminAppResult({...program, ...data.data});
                closeModalProgramModify();
            });
        }
        // console.log(program);
    }
    // datePicker 초기설정
    const datePickerSetting = {
        enableTime:true,
        time_24hr: true,
        locale: {
            firstDayOfWeek: 0, // 일요일부터 시작
            weekdays: {
                shorthand: ['일', '월', '화', '수', '목', '금', '토'],
                longhand: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
            },
            months: {
                shorthand: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
                longhand: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
            },
        },
        dateFormat: 'Y-m-d H:i',
        enabled: [
            (date) => {
                return !(date.getDay() === 0 || date.getDay() === 6);
            }
        ],
        disable: [
            (date) => {
                return (date.getDay() === 0 || date.getDay() === 6);
            }
        ],
    }
    // 추가교육일 
    $:if(completeAddDates) {
        if(addDates[addDates.length - 1]) {
            addDates.push("");
        } else {
            for(let i in addDates) {
                if(addDates[i]) {
                    flatpickr(`#addDate${i}`, {...datePickerSetting, now: new Date(addDates[i])});
                } else {
                    flatpickr(`#addDate${i}`, {...datePickerSetting});
                }
            }
        }
    }

    onMount(() => {
        // final_status
        let dateFormat = 'YYYY-MM-DD HH:mm';
        startDate = moment(program.schedule_start_date).format(dateFormat);
        const now = new Date();
        const fiveAfter = new Date();
        fiveAfter.setDate(now.getDate() + 5);

        const curDate = new Date(startDate.substring(0, 10));
        const maxDate = new Date(startDate.substring(0, 10));
        maxDate.setMonth(maxDate.getMonth() + 1);
        maxDate.setDate(1);
        maxDate.setDate(maxDate.getDate() - 1);

        let noCalendar = false;
        let minDate_str = startDate.substring(0, 8) + '01';
        
        const minDate_day = new Date(startDate.substring(0, 8) + '01');
        if(now.getMonth() === minDate_day.getMonth()) {
            if(curDate >= fiveAfter) {
                minDate_str = fiveAfter.toISOString().substring(0, 10);
            } else {
                noCalendar = true;
            }
        }
        flatpickr("#datepicker", {defaultDate:startDate, noCalendar , minDate: minDate_str, maxDate: maxDate.toISOString().substring(0, 10), ...datePickerSetting, now: new Date(program.schedule_start_date)});
        endDate = program.schedule_start_date_add_date ? moment(program.schedule_start_date_add_date).format(dateFormat) : '';
        flatpickr("#datepicker2", {defaultDate:endDate, ...datePickerSetting, 
            now: program.schedule_start_date_add_date 
            ? new Date(program.schedule_start_date_add_date) : new Date()});
        if(program.schedule_after_date && program.schedule_after_date.length) {
            addDates = program.schedule_after_date.map((v, i) => {
                const format = moment(v).format(dateFormat);
                flatpickr(`#addDate${i}`, {defaultDate:format, ...datePickerSetting, now: new Date(format)});
                return format;
            });
            // addDates.push("");
            // flatpickr(`#addDate${program.schedule_after_date.length}`
            //     , {...datePickerSetting});
        } else {
            flatpickr(`#addDate0`, {...datePickerSetting});
        }
        document.body.classList.add('modal-open');
    });
    onDestroy(() => {
        document.body.classList.remove('modal-open');
    });
</script>

<div class="modal" bind:this={modalEle} in:fade={{duration: 300}} out:fade={{duration: 300}}>
    <div
        class="modal-background"
    ></div>
    <div class="modal-board">
        <div class="modal-content">
            <!-- BEGIN panel -->
            <div class="panel panel-inverse" data-sortable-id="table-basic-5">
                <!-- BEGIN panel-heading -->
                <div class="panel-heading">
                    <h4 class="panel-title">강의 정보 수정</h4>
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
                                    <td><b>교육시작일</b></td>
                                    <td>
                                        <input type="text" class="form-control" id="datepicker" 
                                        bind:value={startDate}>
                                    </td>
                                </tr>
                                <tr>
                                    <td><b>교육종료일</b></td>
                                    <td>
                                        <input type="text" class="form-control" 
                                        id="datepicker2" bind:value={endDate} placeholder="-없음-">
                                        {#if endDate}
                                        <button on:click={() => endDate = ""}>
                                            <i class="far fa-lg fa-fw me-10px fa-circle-xmark c_red"></i>
                                        </button>    
                                        {/if}
                                    </td>
                                </tr> 
                                {#if addDates.length}
                                {#each addDates as addDate, index}
                                <tr>
                                    <td><b>추가교육일{index > 0 ? index + 1 : ""}</b></td>
                                    <td>
                                        <input type="text" class="form-control" 
                                            id={`addDate${index}`} placeholder="-없음-"
                                            bind:value={addDate}>
                                        {#if addDate}
                                        <button on:click={() => resetAddDates(index)}>
                                            <i class="far fa-lg fa-fw me-10px fa-circle-xmark c_red"></i>
                                        </button>    
                                        {/if}
                                        
                                    </td>
                                </tr>
                                    {#if index === addDates.length - 1}
                                    <div class="hide" bind:this={completeAddDates}></div>
                                    {/if}
                                {/each}
                                {/if}
                                <tr>
                                    <td><b>역량</b></td>
                                    <td class="wide">{program.group_title}</td>
                                </tr>
                                <tr>
                                    <td><b>과정</b></td>
                                    <td class="wide">{program.title}</td>
                                </tr>
                                <tr>
                                    <td><b>교육시간</b></td>
                                    <td>
                                        <input type="number" class="form-control" bind:value={program.time}> H
                                    </td>
                                </tr>
                                <tr>
                                    <td><b>차수</b></td>
                                    <td>
                                        <input type="number" class="form-control" bind:value={program.schedule_number}> 차
                                    </td>
                                </tr>
                                <tr>
                                    <td><b>방법</b></td>
                                    <td>
                                        <select class="form-select form-select-sm"
                                            bind:value={program.online}>
                                            <option value="Y">온라인</option>
                                            <option value="N">집합</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td><b>유형</b></td>
                                    <td>
                                        <select class="form-select form-select-sm"
                                            bind:value={program.part_type}>
                                            <option value="합반">합반</option>
                                            <option value="그룹장">그룹장</option>
                                            <option value="파트장">파트장</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td><b>신청인원/정원</b></td>
                                    <td>
                                        <span style={enrollCountStyle()}>{program.enrol_count}</span>
                                        <span>
                                            /<input type="number" class="form-control" bind:value={program.enrol_limit}>
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <!-- END table-responsive -->
                </div>
                <!-- END panel-body -->
            </div>
            <div class="modal-confirm">
                <button type="button" class="btn btn-success me-1 mb-1"
                    on:click={setAdminApp_before}>저장</button>
            </div>
            <!-- END panel -->
            <div class="modal-btn_wrap">
                <button
                type="button"
                class="modal_close"
                on:click={closeModalProgramModify}
                >
                <i class="fas fa-times text-white" aria-hidden="true"></i>
                </button>
            </div>
        </div>
        
        
    </div>
    
</div>

<style>
.modal {
    z-index: 1021;
}
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
    width:150px;
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
    font-size:20px;
}
.table-striped .wide {
    padding: 16.2px 0;
}
/* 추가css */
.form-control, .form-select {
    width:auto;
    display: inline-block;
    font-size:20px;
}
.form-control {
    width:190px;
}
.form-control[type="number"] {
    width:80px;
}
.table-responsive {
    max-height: 700px;
}
</style>