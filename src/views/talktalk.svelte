<script>
	import { fade } from 'svelte/transition';
	import { getProgramNames, talkUpHit } from './../compositions/talktalk.js';
	import { link, pop, push, querystring, replace } from 'svelte-spa-router';
    import TabMenu from "../components/common/tabMenu.svelte";
    import { getTalks } from '../compositions/talktalk';
    import { modal_alert } from '../store/modalSlice';

    export let params = {};
    $:page = Number(params.pageNum);
    let pagingList = [];
    let total_record = 0;
    let selectCourse = "";
    $: program_code = new URLSearchParams($querystring).get('program_code');
    $: if(program_code) selectCourse = program_code;
    $: if(selectCourse) {
        init = true;
        replace(`/talktalk/1?program_code=${selectCourse}`);
    } else {
        init = true;
        replace(`/talktalk/1`);
    }

    let init = true;
    const initFnc = (in_total_pages, in_total_record) => {
        if(init) {
            pagingList.length = 0;
            for(let i = 1; i <= in_total_pages; i++) {
                pagingList.push(i);
            }
            pagingList = pagingList;
            total_record = in_total_record;
            init = false;
        }
    }

    let talkAwait = null;
    $:if(!selectCourse) {
        talkAwait = getTalks({page, size:10}).then(({data}) => {
            initFnc(data.data.total_pages, data.data.total_record);
            return data.data.list
        }).catch((err) => {
            modal_alert.open('잘못된 접근입니다.');
            pop();
        });
    } else {
        talkAwait = getTalks({page, size:10, program_code:selectCourse}).then(({data}) => {
            initFnc(data.data.total_pages, data.data.total_record);
            return data.data.list
        }).catch((err) => {
            modal_alert.open('잘못된 접근입니다.');
            pop();
        });
    }
    
    
</script>

<TabMenu />
<!-- BEGIN content -->
<div id="content" in:fade={{duration: 500}}>
    {#await talkAwait then talkList}
    {#if talkList}
    <!-- BEGIN panel -->
    <div class="panel panel-inverse">
        <!-- BEGIN panel-heading -->
        <div class="panel-heading">
        </div>
        <!-- END panel-heading -->
        
        <!-- BEGIN panel-body -->
        <div class="panel-body">
            <div class="row select-row">
                {#await getProgramNames().then(({data}) => data.data) then programNames}
                <div class="col-sm-12 col-md-6">
                    <div id="data-table-default_filter" class="dataTables_filter select-table">
                        <span>과정&nbsp;</span>
                        <label>
                            <select bind:value={selectCourse}
                            name="data-table-default_length" 
                            aria-controls="data-table-default" 
                            class="form-select form-select-sm">
                                <option value="">======과정명 전체보기======</option>
                                {#each programNames as programName}
                                <option value={programName.program_code}>{programName.program_name}</option>
                                {/each}
                            </select>
                        </label>
                    </div>
                </div>
                {/await}
            </div>
            <div class="row">
                <table id="talktalk-table" class="table table-striped table-bordered align-middle">
                    <thead>
                        <tr>
                            <th width="5%">번호</th>
                            <th class="text-nowrap" width="30%">프로그램명</th>
                            <th class="text-nowrap">제목</th>
                            <th class="text-nowrap" width="7%">등록자</th>
                            <!-- <th class="text-nowrap" width="7%">첨부파일</th> -->
                            <th class="text-nowrap" width="10%">등록일</th>
                            <th class="text-nowrap" width="7%">조회</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each talkList as talk, index}
                        <tr on:click={() => {
                            talkUpHit(talk.id).then(({data}) => {
                                push(`/talktalk/${page}/${talk.id}`);
                            });
                        }}>
                            <td class="fw-bold">{total_record - (page - 1) * 10 - index}</td>
                            <td>
                                {talk.program_name}
                            </td>
                            <td class="align_left">
                                {talk.title}
                            </td>
                            <td>{talk.writer}</td>
                            <td>{talk.regdate.substring(0, 10)}</td>
                            <td>{talk.hit}</td>
                        </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
            
        </div>
        <!-- END panel-body -->
        
        
        <!-- BEGIN paging -->
        <nav class="paging-div" aria-label="Page navigation example">
            <ul class="pagination">
                <li class="page-item sub"><a class="page-link" href="#"
                    on:click|preventDefault={() => {
                        if(page > 1) push(`/talktalk/${page - 1}`);
                    }}>이전목록</a></li>
                {#each pagingList as pagingNum}
                <li class="page-item">
                    <a href="#" class="page-link active"
                    class:active={page == pagingNum}
                    on:click|preventDefault={() => {
                    push(`/talktalk/${pagingNum}`);
                    }}>
                    {pagingNum}
                </a>
                </li>
                {/each}
                <li class="page-item sub"><a class="page-link" href="#"
                    on:click|preventDefault={() => {
                        if(pagingList.length > page) push(`/talktalk/${page + 1}`);
                    }}>다음목록</a>
                </li>
            </ul>
        </nav>
        <!-- END paging -->
    </div>
    <!-- END panel -->
    <div class="writer-btn align_right">
        <a href="/talktalk/write" use:link class="btn btn-dark me-1 mb-1">글쓰기</a>
    </div>
    {/if}
    {/await}
    
</div>
<!-- END content -->

<style>
.dataTables_filter {
    text-align: right;
}
.select-row {
    padding-bottom: 20px;
}
.col-sm-12 {
    width: 100%;
}
.select-table select {
    font-size:20px;
}
#talktalk-table {
    text-align: center;
}
#talktalk-table tbody tr {
    cursor: pointer;
}
#talktalk-table tbody tr:hover {
    background-color: cornsilk;
    --bs-table-bg-type: auto !important;
}
#talktalk-table tbody tr {
    max-height: 50px;
}
.writer-btn a {
    font-size:20px;
    padding:10px 20px;
}
.paging-div {
    align-self: center;
}
.page-link.active {
    background-color: #212121;
    border-color: #212121;
}
</style>