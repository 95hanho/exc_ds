<script>
    import { querystring, replace } from "svelte-spa-router";
    import { getContext, onMount } from "svelte";
    import moment from "moment";
    import { modal_alert, modal_apply_cancer_admin, modal_apply_cancer_admin_reason } from "../../store/modalSlice";
    import AdminCancel from "./adminCancel.svelte";
    import { deleteEnrollStudent, getStudentInfo, setStudentInfo } from "../../compositions/admin";

    export let openModalUserSearch;
    export let user;
    export let modalStatus;
    const resetModalStatus = getContext('resetModalStatus');
    
    const queryParams = new URLSearchParams($querystring)
    $: cancelListOn = new URLSearchParams($querystring).get('cancelListOn');
    $: selectMonth = new URLSearchParams($querystring).get('selectMonth');

    $: searchOn = Object.keys(user).length > 0; // 검색데이터가 있는지

    let enrol_list = []; // 신청목록
    let old_list = []; // 이전 신청목록
    let change_log = []; // 변경로그 리스트
    let application_list = []; // 과정차수 등록 리스트
    let delete_student = {}; // 삭제할 학생 정보

    const userSave = () => {
        setStudentInfo(user).then(({data}) => {
            modal_alert.open('유저정보 수정이 완료되었습니다.');
        }).catch(() => {
            modal_alert.open('오류발생');
        });
    }
    let searchInit = true;
    // 과정등록에서 월이 변할 때
    $:if(selectMonth && searchOn) {
        if(!searchInit) reload();
        searchInit = false;
    }
    // 검색이 완료되었을 때
    $: if(modalStatus === 'searchComplete') {
        console.log('검색 완료');
        initStudentInfo(user.member_no, 0);
        resetModalStatus();
    }
    // 쿼리스트링 변화
    const changeQueryString = (name, value) => {
        console.log('changeQueryString');
        queryParams.delete(name);
        queryParams.append(name, value);
        replace(`/admin/student${'?' + queryParams}`);
    }
    // 신청명단 삭제
    $:if($modal_apply_cancer_admin_reason) {
        delete_student.reason = $modal_apply_cancer_admin_reason;
        deleteEnrollStudent(delete_student).then(({data}) => {
            reload();
            delete_student = {};
            $modal_apply_cancer_admin_reason = "";
        });
    }
    // 검색 데이터 가져오기
    const initStudentInfo = (member_no, month) => {
        getStudentInfo({member_no, month}).then(({data}) => {
            console.log(data.data);
            enrol_list = data.data.enrol_list.new_list;
            old_list = data.data.enrol_list.old_list;
            change_log = data.data.change_log;
            application_list = data.data.application_list.data;
            changeQueryString('selectMonth', data.data.application_list.select_month);
        });
    }
    // 새로 정보가져오기
    const reload = () => {
        initStudentInfo(user.member_no, selectMonth);
    }

    onMount(() => {
        console.log(user);
        // if(searchOn) initStudentInfo(user.member_no, 0);
        if(!searchOn) replace('/admin/student');
    });
</script>

<div>
    <div class="app-header">
        <div class="navbar-nav">
            <div class="navbar-item navbar-form">
                <button class="form-group search-btn"
                    on:click={(() => openModalUserSearch())}>
                    <input type="text" class="form-control isLink_btn" placeholder='유저 검색' readonly
                        value={user.member_name ? user.member_name : ''} />
                    <button type="button" class="btn btn-search"><i class="fa fa-search"></i></button>
                </button>
            </div>
        </div>
    </div>
    <div class="list-wrapper">
        <div class="user-info">
            <!-- BEGIN panel -->
            <div class="panel panel-inverse" >
                <!-- BEGIN panel-heading -->
                <div class="panel-heading">
                    <h4 class="panel-title">유저정보</h4>
                    <div class="panel-heading-btn">
                        {#if searchOn}
                        <button type="button" class="btn btn-green me-2 mb-1"
                            on:click={userSave}>저장</button>
                        {/if}
                    </div>
                </div>
                <!-- END panel-heading -->
                {#if searchOn}
                <!-- BEGIN panel-body -->
                <div class="panel-body">
                    <!-- BEGIN table-responsive -->
                    <div class="table-responsive">
                        <table id="userInfo" class="table mb-0">
                            <thead>
                                <tr>
                                    <th>이름</th>
                                    <th>아이디</th>
                                    <th>사번</th>
                                    <th>연락처</th>
                                    <th>부서</th>
                                    <th>직급</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{user.member_name}</td>
                                    <td>{user.member_login_id}</td>
                                    <td>{user.member_insa_number}</td>
                                    <td>
                                        <input type="text" class="form-control"
                                            bind:value={user.member_hp}>
                                    </td>
                                    <td>
                                        <input type="text" class="form-control"
                                            bind:value={user.team_name}>
                                    </td>
                                    <td>
                                        <select class="form-select" 
                                        bind:value={user.member_type}>
                                            {#if user.member_type === '관리자'}
                                            <option value="관리자">관리자</option>
                                            {:else}
                                            <option value="팀장">팀장</option>
                                            <option value="파트장">파트장</option>
                                            <option value="통합">통합</option>
                                            <option value="그룹장">그룹장</option>
                                            {/if}
                                        </select>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <!-- END table-responsive -->
                    {#if enrol_list.length > 0}
                    <div class="row gx-2 alert-wrap">
                        {#each enrol_list as enrol, index}
                        <div class="col-md-4 pb-2">
                            <div
                                class="alert alert-dismissible fade show h-100 mb-0 alert-indigo">
                                <h5>{enrol.title}</h5>
                                <p>
                                    {moment(enrol.schedule_start_date).format('YYYY-MM-DD')}
                                    {#if enrol.enrol_waiting_rank > 0}
                                    <span>대기 {enrol.enrol_waiting_rank}번째</span>
                                    {/if}
                                </p>
                                <button 
                                    on:click={() => {
                                        modal_apply_cancer_admin.open();
                                        delete_student = {
                                            member_no:user.member_no,
                                            schedule_code:enrol.schedule_code,
                                        }
                                    }}
                                    type="button" class="btn-close" data-bs-dismiss="alert"></button>
                            </div>
                        </div>
                        {/each}
                        <hr>
                        {#each old_list as old, index}
                        <div class="col-md-4 pb-2">
                            <div
                                class="alert alert-dismissible fade show h-100 mb-0 alert-gray">
                                <h5>{old.title}</h5>
                                <p>
                                    {moment(old.schedule_start_date).format('YYYY-MM-DD')}
                                    {#if old.enrol_waiting_rank > 0}
                                    <span>대기 {old.enrol_waiting_rank}번째</span>
                                    {/if}
                                </p>
                                <button 
                                    on:click={() => {
                                        modal_apply_cancer_admin.open();
                                        delete_student = {
                                            member_no:user.member_no,
                                            schedule_code:old.schedule_code,
                                        }
                                    }}
                                    type="button" class="btn-close" data-bs-dismiss="alert"></button>
                            </div>
                        </div>
                        {/each}
                    </div>
                    {/if}
                </div>
                <!-- END panel-body -->
                {/if}
            </div>
            <!-- END panel -->
        </div>
        <div class="apply-list">
            {#if cancelListOn === 'on'}
            <AdminCancel {change_log} {changeQueryString}/>
            {:else}
            <div class="cancel-openbtn panel panel-inverse">
                <div class="panel-heading">
                    <h4 class="panel-title">
                        <label for="openBtn" class="isLink_btn">변경로그 열기</label>
                        {#if searchOn && change_log?.length}
                        <button id="openBtn"
                            on:click={() => changeQueryString('cancelListOn', 'on')}>
                            <i class="bi bi-arrow-down-square-fill fs-24px h-60px mb-1"></i>
                        </button>
                        {/if}
                    </h4>
                </div>
            </div>
            {/if}
        </div>
    </div>
</div>

<style>
hr {
    margin:10px 0 15px 0;
}
.app-header {
    padding:10px 0;
    box-shadow: none;
    z-index:0;
}
.panel-inverse {
    margin-bottom: 0;
}
.search-btn {
    width:400px;
    left:auto;
    right:0;
}
.search-btn input {
    height: 50px;
    font-size:25px;
    background-color: #eee;
    border:1px solid #ccc;
}
.list-wrapper {
    padding:0 30px;
}
.user-info>div {
    margin-bottom: 0;
}
.user-info .panel-title {
    font-size:25px;
}

.user-info #userInfo {
    font-size:20px;
    margin:0;
    padding: 0;
}
.form-control, .form-select {
    font-size:20px;
}
.apply-list .panel-heading {
    border-radius: 10px;
}
.apply-list .panel-title {
    font-size:20px;
}
.apply-list .panel-title button i {
    color:#fff;
}
.cancel-openbtn {
    margin-top:20px;
}
.cancel-openbtn button {
    width: calc(100% - 125px);
    text-align: left;
}
/* 유저의 신청현황 */
.alert-wrap {
    padding-top:20px;
}
.alert {
    padding: 10px 40px 26px 10px;
}
.alert h5 {
    margin: 0;
    word-break: keep-all;
    font-size:16px;
}
.alert p {
    margin:0;
    text-align: left;
    position: absolute;
    width:100%;
    bottom: 5px;
}
.alert p span {
    padding-left:10px;
}
.alert p span:first-child {
    color:red;
    font-size:16px;
    font-weight: 900;
    text-decoration: underline;
}
.col-md-4 {
    flex: 0 0 auto;
    width: 33.33333333%;
}
</style>