<script>
	import { modal_alert, modal_apply_cancer_admin, modal_apply_cancer_admin_reason } from '../../store/modalSlice.js';
	import { adminAppRegist, deleteEnrollStudent, getAdminAppStudents, setEnrollStudent, setPresent } from '../../compositions/admin.js';
    import Loding from "../common/loding.svelte";
    import { getContext } from 'svelte';
    import "moment/locale/ko";
    import moment from 'moment/moment';

    export let curProgram; // 현재 보여주고 있는 스케줄코드
    console.log(curProgram);
    export let schedule_latest; // 현재 프로그램차수 최신화
    export let modalStatus;
    const openModalUserSearch = getContext('openModalUserSearch');
    const resetModalStatus = getContext('resetModalStatus');
    export let changeUser; // 바뀔 유저

    let getStudentsAwait = null;
    let studentList = []; // 신청자명단 리스트
    let waitStudentList = []; // 대기자명단 리스트
    let final_status = false; // 확정이 된 인원인지 => 그래야 출결가능

    let store_student = {};

    // 학생리스트 불러오기
    const initGetStudents = async () => {
        getStudentsAwait = getAdminAppStudents({schedule_code:curProgram.schedule_code}).then(({data}) => {
            console.log(data);
            studentList = [];
            waitStudentList = [];
            final_status = data.enrol_final_status;
            if(data.schedule_info) {
                data.schedule_info.map((v) => {
                    if(!v.enrol_waiting_status) studentList.push(v);
                    else waitStudentList.push(v);
                });
                if(final_status) {
                    studentList.sort((a, b) => a.member_name > b.member_name ? 1 : -1);
                }
            }
            
            return data;
        });
    }
    $:sCode = curProgram.schedule_code;
    $:if(sCode) initGetStudents();
    // 모두출석처리
    const allPresent = (indexNum, schedule_code) => {
        const idNoList = [];
        studentList.map((v) => {
            if(v.attendance_type === '') {
                v.attendance_type = 'Y';
                idNoList.push(v.member_no);
            }
        });
        studentList = studentList;
        if(!idNoList.length) {
            modal_alert.open('모두 출결처리 되었습니다.');
        } else {
            setPresent({
                member_no:idNoList, schedule_code, type:'Y'
            }).then(({data}) => {
                presentCount();
            });
        }
    }
    // 출결인원 숫자세서 최신화
    const presentCount = () => {
        let count = 0;
        studentList.map((v) => {
            if(v.attendance_type === 'Y' || v.attendance_type === 'T') count++; 
        });
        curProgram.attendance_count = count;
        schedule_latest(curProgram);
    }
    // 출결 변경
    const changePresent = (type, member_no, schedule_code) => {
        setPresent({
            member_no: [member_no], schedule_code, type
        }).then(({data}) => {
            presentCount();
        });
    }
    // 출결변경 텍스트
    const changePresentTxt = (type, description, member_no, schedule_code) => {
        setPresent({
            member_no: [member_no], schedule_code, description, type
        });
    }
    // 신청명단 삭제
    $:if($modal_apply_cancer_admin_reason) {
        apply_cancer_fnc();
    }
    // ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
    const apply_cancer_fnc = () => {
        store_student.reason = $modal_apply_cancer_admin_reason;
        deleteEnrollStudent(store_student).then(({data}) => {
            curProgram.enrol_count--;
            schedule_latest(curProgram);
            initGetStudents();
            store_student = {};
            $modal_apply_cancer_admin_reason = "";
        });
    }
    // 신청자 추가
    $: if(modalStatus === 'applyAdminStudent') {
        resetModalStatus();
        console.log(changeUser);
        console.log(studentList, waitStudentList);
        if([...studentList, ...waitStudentList].some((v) => v.member_no === changeUser.member_no)) {
            modal_alert.open('이미 신청 되어있는 교육생 입니다.');
        } else {
            adminAppRegist({member_no:changeUser.member_no, schedule_code: curProgram.schedule_code}).then(({data}) => {
                console.log(data);
                curProgram.enrol_count++;
                schedule_latest(curProgram);
                initGetStudents();
            });
        }
    }
    // 신청자변경
    $: if(modalStatus === 'applyStudentChange') {
        resetModalStatus();
        console.log(store_student);
        console.log(changeUser);
        setEnrollStudent({
            enroll_id: store_student.enrol_id,
            to_member_no: changeUser.member_no
        }).then(({data}) => {
            console.log(data, '===>');
            console.log(curProgram);
            curProgram = {
                ...curProgram,
                ...data.data,
            }
            initGetStudents();
            schedule_latest(curProgram);
            store_student = {};
        });
    }
    // 프로그램 수정 후 결과  
    $: if(modalStatus === 'modifySuccess') {
        initGetStudents();
    }
</script>

{#await getStudentsAwait}
<tr>
    <td colspan="14" class="students">
        <Loding />
    </td>
</tr>
{:then result}
    {#if result}
    <tr>
        <td colspan="14" class="students">
            <div class="title">
                신청자명단({studentList.length}명)
                <button type="button" class="plus-data btn btn-yellow"
                    on:click={() => {
                        openModalUserSearch();
                    }}>명단<i class="fas fa-plus s-NaP9PiCxOJHH"></i></button>
                {#if studentList.length > 0 && final_status && studentList.some((v) => !v.attendance_type)}
                <button type="button" class="btn btn-indigo me-1 mb-1 all_present"
                    on:click={() => allPresent(curProgram.indexNum, curProgram.schedule_code)}>전체수료</button>
                {/if}
            </div>
            <p>* 더블클릭 시 신청자변경 
                {studentList.length > 0 && final_status 
                && studentList.some((v) => !v.attendance_type) ? 
                `/ 전체수료 시 비어있는 출결이 '수료'로 됨 ` : ''}
                {!final_status ? `/ 교육일 1일 전 '11:00 AM'부터 인원확정. 출결기능 활성화`: ''}</p>
            <div class="scroll_thead">
                <table id="innerTable" class="applyList innerTable table table-striped table-bordered align-middle dataTable no-footer dtr-inline collapsed">
                    <thead>
                        <tr>
                            <th></th>
                            <th>부서</th>
                            <th>이름</th>
                            <th>유형</th>
                            <th>아이디</th>
                            <th>연락처</th>
                            <th>신청일</th>
                            <th>출결</th>
                            <th>출결 특이사항</th>
                            <th>기능</th>
                        </tr>
                    </thead>
                </table>
            </div>
            <div class="scroll_tbody">
                <table id="innerTable2" class="applyList innerTable table table-striped table-bordered align-middle dataTable no-footer dtr-inline collapsed">
                    <tbody>
                        {#each studentList as student, index2}
                        <tr 
                            on:dblclick={() => {
                                if(!student.attendance_type) {
                                    store_student = student;
                                    openModalUserSearch(`${student.member_name}/${student.member_login_id}/${student.member_insa_number}/${student.member_hp}`);
                                } else {
                                    modal_alert.open('출결정보가 있을 경우 신청자 변경이 불가합니다.<br> <p class="c_red">* 출결 정보를 초기화 후 진행해주세요.</p');
                                }
                                
                            }}>
                            <td>{index2 + 1}</td>
                            <td>{student.team_name}</td>
                            <td>{student.member_name}</td>
                            <td>{student.member_type}</td>
                            <td>{student.member_login_id}</td>
                            <td>{student.member_hp}</td>
                            <td>{moment(student.enrol_regdate).format('YYYY-MM-DD A h:mm:ss')}</td>
                            <td>
                                <select class="form-select form-select-sm" 
                                    bind:value={student.attendance_type}
                                    on:click|stopPropagation
                                    on:change={() => {
                                        if(!student.attendance_type) student.attendance_description = '';
                                        changePresent(student.attendance_type, student.member_no, curProgram.schedule_code)}}
                                    class:text_readonly={!final_status}
                                    disabled={!final_status}
                                    >
                                    <option value="">-----</option>
                                    <option value="Y">수료</option>
                                    <option value="N">미수료</option>
                                    <option value="T">지각</option>
                                </select>
                            </td>
                            <td>
                                <input type="text" class="form-control"
                                    class:text_readonly={!student.attendance_type}
                                    readonly={!student.attendance_type}
                                    bind:value={student.attendance_description}
                                    on:change={() => 
                                    changePresentTxt(student.attendance_type, student.attendance_description, student.member_no, curProgram.schedule_code)}>
                            </td>
                            <td>
                                <button type="button" class="btn btn-danger me-1 mb-1"
                                    on:click={() => {
                                        if(!student.attendance_type) {
                                            modal_apply_cancer_admin.open();
                                            store_student = {
                                                index:curProgram.indexNum,
                                                member_no:student.member_no,
                                                schedule_code:curProgram.schedule_code,
                                            }
                                        } else modal_alert.open('출결정보가 있을 경우 신청삭제가 불가합니다.<br> <p class="c_red">* 출결 정보를 초기화 후 진행해주세요.</p');
                                    }}>신청삭제</button>
                            </td>
                        </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
            {#if waitStudentList.length}
            <div class="title">
                대기자명단({waitStudentList.length}명)
            </div>
            <div class="scroll_thead">
                <table id="innerTable3" class="waitList innerTable table table-striped table-bordered align-middle dataTable no-footer dtr-inline collapsed">
                    <thead>
                        <tr>
                            <th></th>
                            <th>부서</th>
                            <th>이름</th>
                            <th>유형</th>
                            <th>아이디</th>
                            <th>연락처</th>
                            <th>신청일</th>
                            <th>기능</th>
                        </tr>
                    </thead>
                </table>
            </div>
            <div class="scroll_tbody">
                <table id="innerTable4" class="waitList innerTable table table-striped table-bordered align-middle dataTable no-footer dtr-inline collapsed">
                    <tbody>
                        {#each waitStudentList as student, index2}
                        <tr>
                            <td>{index2 + 1}</td>
                            <td>{student.team_name}</td>
                            <td>{student.member_name}</td>
                            <td>{student.member_type}</td>
                            <td>{student.member_login_id}</td>
                            <td>{student.member_hp}</td>
                            <td>{moment(student.enrol_regdate).format('YYYY-MM-DD A h:mm:ss')}</td>
                            <td>
                                <button type="button" class="btn btn-danger me-1 mb-1"
                                    on:click={() => {
                                        modal_apply_cancer_admin.open()
                                        store_student = {
                                            index:curProgram.indexNum,
                                            member_no:student.member_no,
                                            schedule_code:curProgram.schedule_code,
                                        }
                                    }}>신청삭제</button>
                            </td>
                        </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
            {/if}
        </td>
    </tr>  
    {/if}
{/await}

<style>
.students {
    background-color: #FFFFD7;
    border-top: 5px solid lightgray;
    border-bottom: 5px solid lightgray;
    padding-bottom: 20px
}
.students .all_present {
    font-size: 20px;
    width:150px;
    height: 50px;
    float: right;
}
.plus-data {
    float: right;
    height: 50px;
    color:white;
    font-size: 20px;
    /* border: 1px solid #FFCD12; */
    padding: 0 11px 5.8px 11px;
    /* background-color: #FFCD12; */
    border-radius: 5px;
    line-height: 40px;
}
.students .title {
    font-size: 30px;
    text-align: left;
    padding-bottom: 10px;
}
.students>p {
    margin:0;
    text-align: right;
    color:red;
}
.innerTable  {
    background-color: #fff;
    margin:0 !important;
}
.applyList td {
    word-break: break-all;
    padding-top:2px;
    padding-bottom:2px;
}
.applyList th:nth-child(1), .applyList td:nth-child(1) {
    width:5%
}
.applyList th:nth-child(2), .applyList td:nth-child(2) {
}
.applyList th:nth-child(3), .applyList td:nth-child(3) {
    width:6%
}
.applyList th:nth-child(4), .applyList td:nth-child(4) {
    width:5.5%
}
.applyList th:nth-child(5), .applyList td:nth-child(5) {
    width:15%
}
.applyList th:nth-child(6), .applyList td:nth-child(6) {
    width:11%
}
.applyList th:nth-child(7), .applyList td:nth-child(7) {
    width:9%
}
.applyList th:nth-child(8), .applyList td:nth-child(8) {
    width:9%
}
.applyList th:nth-child(9), .applyList td:nth-child(9) {
    width:10%
}
.applyList th:nth-child(10), .applyList td:nth-child(10) {
    width:10%
}
.waitList td {
    word-break: break-all;
    padding-top:2px;
    padding-bottom:2px;
}
.waitList th:nth-child(1), .waitList td:nth-child(1) {
    width:5%
}
.waitList th:nth-child(2), .waitList td:nth-child(2) {
}
.waitList th:nth-child(3), .waitList td:nth-child(3) {
    width:6%
}
.waitList th:nth-child(4), .waitList td:nth-child(4) {
    width:5.5%
}
.waitList th:nth-child(5), .waitList td:nth-child(5) {
    width:15%
}
.waitList th:nth-child(6), .waitList td:nth-child(6) {
    width:20%
}
.waitList th:nth-child(7), .waitList td:nth-child(7) {
    width:19%;
}
.waitList th:nth-child(8), .waitList td:nth-child(8) {
    width:10%
}
.innerTable .form-select, .innerTable .form-control {
    margin: 0;
    width: 100%;
    height: 100%;
    font-size: 15px;
}
#innerTable2 tbody>tr:hover {
    background-color: #FFFFA6;
    cursor: pointer;
}
.scroll_thead {
    width:100%;
    overflow-y: scroll;
}
.scroll_tbody {
    max-height: 500px;
    overflow-y: scroll;
}
#innerTable2 tbody>tr td button {
    font-size: 15px;
}
</style>