<script>
	import { getNotices, noticeQnaUpHit } from './../compositions/notice.js';
    import { link, pop, push } from "svelte-spa-router";
    import { grant, login_id } from "../store/userSlice";
    import { modal_alert } from '../store/modalSlice.js';

    export let params = {};
    $:page = Number(params.pageNum);
    let pagingList = [];
    let total_record = 0;

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
    $:noticeAwait = getNotices({page, size:11}).then(({data}) => {
        initFnc(data.data.total_pages, data.data.total_record)
        return data.data.list
    }).catch((err) => {
        modal_alert.open('잘못된 접근입니다.');
        pop();
    });
</script>

<!-- BEGIN content -->
<div id="content">
    {#await noticeAwait then noticeList}
    {#if noticeList}
    <!-- BEGIN panel -->
    <div class="panel panel-inverse">
        <!-- BEGIN panel-heading -->
        <div class="panel-heading">
            <h4 class="panel-title">공지사항 및 QnA<br>
                <span>
                    과정 참여를 위해 궁금한 내용을 문의하는 곳입니다.
                    원활할 수강을 위한 문의사항을 적어주세요
                </span>
            </h4>
        </div>
        <!-- END panel-heading -->
        
        <!-- BEGIN panel-body -->
        <div class="panel-body">
            <div class="row">
                <table id="notice-table" class="table table-striped table-bordered align-middle">
                    <thead>
                        <tr>
                            <th width="5%">번호</th>
                            <th class="text-nowrap">제목</th>
                            <th class="text-nowrap" width="7%">등록자</th>
                            <th class="text-nowrap" width="7%">첨부파일</th>
                            <th class="text-nowrap" width="10%">등록일</th>
                            <th class="text-nowrap" width="7%">조회</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each noticeList as notice, index}
                        {#if notice.type === 'G'}
                        <tr class="admin fw-bold"
                        on:click={() => {
                            noticeQnaUpHit(notice.id).then(({data}) => {
                                push(`/notice/${page}/${notice.id}`)
                            })
                        }}>
                            <td width="1%" class="">공지</td>
                            <td class="align_left">{notice.title}</td>
                            <td>{notice.writer}</td>
                            <td>
                                {#if notice.in_file}
                                O
                                {/if}
                            </td>
                            <td>{notice.regdate.substring(0, 10)}</td>
                            <td>{notice.hit}</td>
                        </tr>
                        {:else}
                        <tr on:click={() => {
                            if(notice.secret && (!$grant && $login_id !== notice.writer_login_id)) {
                                modal_alert.open('비밀글 입니다.');
                            } else {
                                noticeQnaUpHit(notice.id).then(({data}) => {
                                    push(`/notice/${page}/${notice.id}`);
                                });
                            }
                        }}>
                            <td class="fw-bold">{total_record - (page - 1) * 11 - index}</td>
                            <td class="align_left">
                                {notice.title}
                                {#if notice.secret}
                                <i class="bi bi-lock-fill fs-13px"></i>    
                                {/if}
                                {#if !notice.manager_comment_latest}
                                <span class="c_red">답변 대기중</span>
                                {/if}
                            </td>
                            <td>{notice.writer}</td>
                            <td>
                                {#if notice.in_file}
                                O
                                {/if}
                            </td>
                            <td>{notice.regdate.substring(0, 10)}</td>
                            <td>{notice.hit}</td>
                        </tr>
                        {/if}
                        {/each}
                        
                        
                    </tbody>
                </table>
            </div>
            
        </div>
        <!-- END panel-body -->
        
        
        <!-- BEGIN paging -->
        <nav class="paging-div" aria-label="Page navigation example">
            <ul class="pagination">
                <li class="page-item sub">
                    <a class="page-link" href="#"
                    on:click|preventDefault={() => {
                        if(page > 1) push(`/notice/${page - 1}`);
                    }}>이전목록
                    </a>
                </li>
                {#each pagingList as pagingNum}
                <li class="page-item">
                    <a href="#" class="page-link active"
                    class:active={page == pagingNum}
                    on:click|preventDefault={() => {
                        push(`/notice/${pagingNum}`);
                    }}>
                    {pagingNum}
                    </a>
                </li>
                {/each}
                <li class="page-item sub">
                    <a class="page-link" href="#"
                    on:click|preventDefault={() => {
                        if(pagingList.length > page) push(`/notice/${page + 1}`);
                    }}>다음목록
                    </a>
                </li>
            </ul>
        </nav>
        <!-- END paging -->
    </div>
    <!-- END panel -->
    <div class="writer-btn align_right">
        {#if $grant}
        <a href={"/notice/notice-write"} use:link class="btn btn-danger me-1 mb-1">공지사항쓰기</a>
        {:else}
        <a href="/notice/write" use:link class="btn btn-dark me-1 mb-1">글쓰기</a>
        {/if}
    </div>
    {/if}
    {/await}
</div>
<!-- END content -->



<style>
.panel-title {
    font-size: 25px;
}
.panel-title span {
    font-size:15px;
}
#notice-table {
    text-align: center;
}
#notice-table tbody tr {
    cursor: pointer;
}
#notice-table tbody tr:hover {
    background-color: cornsilk;
    --bs-table-bg-type: auto !important;
}
.table-striped>tbody>tr:nth-of-type(odd)>* {
    --bs-table-bg-type: auto;
}
.table-striped>tbody>tr.admin>td {
    --bs-table-bg-type: var(--bs-table-striped-bg);
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