<script>
	import {  getAdminProgramStudents } from '../../compositions/admin.js';
    import Loding from '../common/loding.svelte';
    import "moment/locale/ko";
    import moment from 'moment/moment';

    export let curProgram; // 현재 보여주고 있는 스케줄코드

    let getStudentsAwait = null;
    let studentList = []; // 신청자명단 리스트
    let waitStudentList = []; // 대기자명단 리스트
    let final_status = false; // 확정이 된 인원인지 => 그래야 출결가능

    // 학생리스트 불러오기
    const initGetStudents = async () => {
        getStudentsAwait = getAdminProgramStudents({schedule_code:curProgram.schedule_code}).then(({data}) => {
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
            </div>
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
                        </tr>
                    </thead>
                </table>
            </div>
            <div class="scroll_tbody">
                <table id="innerTable2" class="applyList innerTable table table-striped table-bordered align-middle dataTable no-footer dtr-inline collapsed">
                    <tbody>
                        {#each studentList as student, index2}
                        <tr>
                            <td>{index2 + 1}</td>
                            <td>{student.team_name}</td>
                            <td>{student.member_name}</td>
                            <td>{student.member_type}</td>
                            <td>{student.member_login_id}</td>
                            <td>{student.member_hp}</td>
                            <td>{moment(student.enrol_regdate).format('YYYY-MM-DD A h:mm:ss')}</td>
                            <td>
                                {(() => {
                                    if(student.attendance_type === 'Y') {
                                        return "수료";
                                    } else if (student.attendance_type === 'N') {
                                        return "미수료";
                                    } else if (student.attendance_type === 'T') {
                                        return "지각";
                                    } else {
                                        return "";
                                    }
                                })()}
                            </td>
                            <td>{student.attendance_description}</td>
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