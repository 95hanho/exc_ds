<script>
	import { location } from 'svelte-spa-router';
    import AdminEtc from "../components/admin/adminEtc.svelte";
    import AdminApp from "../components/admin/adminApp.svelte";
    import AdminAppModify from "../components/admin/adminAppModify.svelte";
    import AdminStudent from "../components/admin/adminStudent.svelte";
    import AdminTabMenu from "../components/admin/adminTabMenu.svelte";
    import AdminUserSearch from "../components/admin/adminUserSearch.svelte";
    import AdminAppAdd from '../components/admin/adminAppAdd.svelte';
    import { setContext } from 'svelte';
	import AdminProgram from '../components/admin/adminProgram.svelte';

    export let params = {}
    $: menu = params.menu;

    /* AdminUserSearch, AdminAppModify 관련 */
    let modalStatus = ""; // 모달상태값(변화에 따라 함수적용)
    // 모달상태값 초기화
    const resetModalStatus = (result) => {
        console.log('resetModalStatus');
        modalStatus = "";
    }
    setContext('resetModalStatus', resetModalStatus);

    let adminUserSearchOn = false; // AdminUserSearch 열지말지
    let user = {}; // 검색결과
    let desangStudent = ""; // 

    // AdminUserSearch 열기
    const openModalUserSearch = (student) => {
        if(student) desangStudent = student;
        adminUserSearchOn = true;
    }
    setContext('openModalUserSearch', openModalUserSearch);
    // AdminUserSearch 닫기
    const closeModalUserSearch = () => {
        desangStudent = "";
        adminUserSearchOn = false;
    }
    /// 검색 완료
    const searchComplete = (obj, mStatus) => {
        if(obj) user = obj;
        modalStatus = mStatus;
    }
    // router변하면 검색결과는 초기화, 안하면 교육생관리 시 검색돼있음
    $: if($location) {
        user = {};
    }

    let adminAppModifyOn = false; // AdminAppModify 열지말지
    let program = {}; // 

    const openModalProgramModify = (prg) => {
        program = {...prg};
        adminAppModifyOn = true;
    }
    const closeModalProgramModify = () => {
        adminAppModifyOn = false;
    }
    const setAdminAppResult = (obj) => {
        program = {...obj};
        modalStatus = 'modifySuccess';
    }

    /* AdminAppAdd 관련 */

    let adminAppAddOn = false;

    const openAdminAppAdd = () => {
        adminAppAddOn = true;
    }
    const closeAdminAppAdd = () => {
        adminAppAddOn = false;
    }


</script>

<div>
    <div id="content" class="admin">
        <AdminTabMenu />
        <div class="admin-content">
            {#if menu === 'application'}
            <AdminApp {openModalProgramModify} 
                programResult={program} {modalStatus} changeUser={user}
                {openAdminAppAdd}/>
            {:else if menu === 'student'}
            <AdminStudent {openModalUserSearch} {user} {modalStatus}/>
            {:else if menu === 'program'}
            <AdminProgram />
            {:else if menu === 'etc'}
            <AdminEtc />
            {/if}
        </div>
    </div>
</div>

{#if adminUserSearchOn}
<AdminUserSearch {closeModalUserSearch} {searchComplete}
    {desangStudent} {user}/>
{/if}
{#if adminAppModifyOn}
<AdminAppModify {closeModalProgramModify} {program} {setAdminAppResult}/>
{/if}
{#if adminAppAddOn}
<AdminAppAdd {closeAdminAppAdd}/>
{/if}

<style>
.admin-content {
    border: 2px solid black;
    border-radius: 5px;
    padding-bottom: 20px;
}
</style>