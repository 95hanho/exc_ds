<script>
	import { location } from 'svelte-spa-router';
    import AdminEtc from "../components/admin/adminEtc.svelte";
import AdminProgram from "../components/admin/adminProgram.svelte";
    import AdminProgramModify from "../components/admin/adminProgramModify.svelte";
    import AdminStudent from "../components/admin/adminStudent.svelte";
    import AdminTabMenu from "../components/admin/adminTabMenu.svelte";
    import AdminUserSearch from "../components/admin/adminUserSearch.svelte";
    import AdminProgramAdd from '../components/admin/adminProgramAdd.svelte';
    import { setContext } from 'svelte';

    export let params = {}
    $: menu = params.menu;

    /* AdminUserSearch, AdminProgramModify 관련 */
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

    let adminProgramModifyOn = false; // AdminProgramModify 열지말지
    let program = {}; // 

    const openModalProgramModify = (prg) => {
        program = {...prg};
        adminProgramModifyOn = true;
    }
    const closeModalProgramModify = () => {
        adminProgramModifyOn = false;
    }
    const setAdminProgramResult = (obj) => {
        program = {...obj};
        modalStatus = 'modifySuccess';
    }

    /* AdminProgramAdd 관련 */

    let adminProgramAddOn = false;

    const openAdminProgramAdd = () => {
        adminProgramAddOn = true;
    }
    const closeAdminProgramAdd = () => {
        adminProgramAddOn = false;
    }


</script>

<div id="content" class="admin">
    <AdminTabMenu />
    <div class="admin-content">
        {#if menu === 'program'}
        <AdminProgram {openModalProgramModify} 
            programResult={program} {modalStatus} changeUser={user}
            {openAdminProgramAdd}/>
        {:else if menu === 'student'}
        <AdminStudent {openModalUserSearch} {user} {modalStatus}/>
        {:else if menu === 'etc'}
        <AdminEtc />
        {/if}
    </div>
</div>

{#if adminUserSearchOn}
<AdminUserSearch {closeModalUserSearch} {searchComplete}
    {desangStudent} {user}/>
{/if}
{#if adminProgramModifyOn}
<AdminProgramModify {closeModalProgramModify} {program} {setAdminProgramResult}/>
{/if}
{#if adminProgramAddOn}
<AdminProgramAdd {closeAdminProgramAdd}/>
{/if}

<style>
.admin-content {
    border: 2px solid black;
    border-radius: 5px;
    padding-bottom: 20px;
}
</style>