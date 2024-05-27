<script>
	import { modal_apply_cancer, modal_apply_cancer_result } from '../store/modalSlice.js';
	import TabMenu from '../components/common/tabMenu.svelte';
	import { link } from 'svelte-spa-router';
    import ListView from '../components/application/listView.svelte';
    import CalendarView from '../components/application/calendarView.svelte';
    import { onMount } from 'svelte';
    import { myApplication } from '../compositions/application.js';
    import moment from 'moment';
    import Loding from '../components/common/loding.svelte';
    import { fade } from 'svelte/transition';

    export let params = {};

    let myApplicationAwait = null;
    let onBefore = false; // 이전 신청 목록이 켜지는지

    $:if($modal_apply_cancer_result === 'cancel') {
        reMyApplication();
    }

    const reMyApplication = () => {
        myApplicationAwait = myApplication();
    }

    onMount(() => {
        reMyApplication();
    });
</script>

<TabMenu />
<!-- BEGIN #content -->
<div id="content" in:fade={{duration: 500}}>
    <!-- BEGIN breadcrumb -->
    <ol class="breadcrumb float-xl-end">
        <li class="breadcrumb-item" class:active={params?.viewForm === 'list'}>
            <a href="/application/list" use:link>리스트로 보기</a></li>
        <li class="breadcrumb-item" class:active={params?.viewForm === 'calendar'}>
            <a href="/application/calendar" use:link>캘린더로 보기</a></li>
    </ol>
    <!-- END breadcrumb -->

    <!-- BEGIN panel -->
    <div class="panel panel-inverse" data-sortable-id="ui-general-2">
        <!-- BEGIN panel-heading -->
        <div class="panel-heading">
            <h4 class="panel-title">나의 신청현황
                <!-- <span class="badge bg-success ms-1">NEW</span> -->
            </h4>
        </div>
        <!-- END panel-heading -->
        <!-- BEGIN panel-body -->
        {#await myApplicationAwait}
        <Loding />
        {:then myApps} 
        {#if myApps}
        <div class="panel-body">
            <div class="row gx-2">
                {#each myApps.new_list as myApp, index}
                <div class="col-md-4 pb-2">
                    <div
                        class="alert alert-dismissible fade show h-100 mb-0 alert-indigo">
                        <h5>{myApp.title}</h5>
                        <p>
                            {moment(myApp.schedule_start_date).format('YYYY-MM-DD')}
                            {#if myApp.enrol_waiting_rank > 0}
                            <span>대기 {myApp.enrol_waiting_rank}번째</span>
                            {/if}
                        </p>
                        {#if new Date() < new Date(myApp.schedule_start_date)}
                        <button 
                            on:click={() => modal_apply_cancer.open(myApp.schedule_code)}
                            type="button" class="btn-close" data-bs-dismiss="alert"></button>    
                        {/if}
                        
                    </div>
                </div>
                {/each}
                {#if !onBefore}
                <div class="col-md-4 pb-2 before_btn">
                    <button class="c_blue"
                        on:click={() => {
                            onBefore = true;
                        }}>이전 신청현황 보기...</button>
                </div>
                {:else}
                    {#each myApps.old_list as myApp, index}
                    <div class="col-md-4 pb-2">
                        <div
                            class="alert alert-dismissible fade show h-100 mb-0 alert-gray">
                            <h5>{myApp.title}</h5>
                            <p>
                                {moment(myApp.schedule_start_date).format('YYYY-MM-DD')}
                                {#if myApp.enrol_waiting_rank > 0}
                                <span>대기 {myApp.enrol_waiting_rank}번째</span>
                                {/if}
                            </p>
                        </div>
                    </div>
                    {/each}
                    <div class="col-md-4 pb-2 before_btn">
                        <button class="c_red"
                            on:click={() => {
                                onBefore = false;
                            }}>← 이전 신청현황 숨기기</button>
                    </div>
                {/if}
            </div>
        </div>
        {/if}
        {/await}
        <!-- END panel-body -->
    </div>
    <!-- END panel -->
    {#if params?.viewForm === 'list'}
    <ListView {reMyApplication}/>
    {:else if params?.viewForm === 'calendar'}
    <CalendarView {reMyApplication}/>
{/if}


</div>
<!-- END #content -->

<style>
.breadcrumb {
    justify-content: right;
}
.breadcrumb-item {
    font-size:18px;
}
.breadcrumb-item.active {
    font-weight: bold;
}
.float-xl-end {
    float: none !important;
}
/* 나의신청현황 */
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
.before_btn {
    display: flex;
}
.before_btn button:hover {
    text-decoration: underline;
}
/*  */
</style>

