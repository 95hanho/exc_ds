<script>
    import { afterUpdate, onMount } from 'svelte';
    import 'summernote/dist/summernote-lite.js';
    import "summernote/dist/summernote-lite.css";
    import jQuery from "jquery";
    import { modal_alert, modal_confirm, modal_confirm_result } from '../store/modalSlice.js';
    import { pop, push, querystring } from 'svelte-spa-router';
    import { getNotice, noticeFileDelete, noticeFileUpload, updateNoticeQna } from '../compositions/notice.js';
    import { ui } from '../compositions/ui.js';
    import { onAllLoding } from '../store/moduleSlice.js';
    
    export let params = {}
    $:noticeId = params.noticeId;
    $:notice.id = noticeId;
    const page = new URLSearchParams($querystring).get('page');

    let summernoteInitialized = false;

    const notice = {
        id: '',
        title:'',
        content:'',
        file: null,
    }
    let initFile = []; // 처음 파일

    // 수정완료
    const updateNotice_before = async () => {
        const content = jQuery('.summernote').summernote('code');
        notice.content = content;
        if(!notice.title) {
            modal_alert.open('제목이 입력되지 않았습니다.');
        } else if(notice.content === '<p><br></p>') {
            modal_alert.open('내용이 입력되지 않았습니다.');
        } else {
            $onAllLoding = true;
            await updateNoticeQna(notice).then(({data}) => {
                if(notice.file?.length) {
                    noticeFileUpload({ id: data.data.id, file: notice.file})
                        .then(({data}) => {
                            if(page) push(`/notice/${page}/${noticeId}`);
                            else push(`/notice/1/${noticeId}`);
                        });
                } else {
                    if(page) push(`/notice/${page}/${noticeId}`);
                    else push(`/notice/1/${noticeId}`);
                }
            });
            $onAllLoding = false;
        }
    }

    $:getNotice(noticeId).then(({data}) => {
        notice.title = data.data.title;
        initFile = data.data.file_list;
        jQuery('.summernote').summernote('code', data.data.content);
        return data.data;
    }).catch(() => {
        modal_alert.open('권한이 없습니다.');
        pop();
    });
    const initializeSummernote =() => {
        if (!summernoteInitialized) {
            window.jQuery = jQuery;
            import('summernote/dist/lang/summernote-ko-KR.js').then(() => {
                jQuery('.summernote').summernote({
                    height: 300,
                    lang:'ko-KR',
                    minHeight: 200,
                    maxHeight: 500,
                    placeholder: '내용을 입력해주세요.',
                    // fontNames: ["Noto Sans KR", "Roboto"], // 여기에 사용하고자 하는 글꼴을 추가
                    fontNames: ['Noto Sans KR', 'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Helvetica', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana', 'Roboto'],
                    fontNamesIgnoreCheck: ['Roboto'],
                    // Summernote에 필요한 다른 설정들을 추가할 수 있습니다.
                });
            })
            summernoteInitialized = true;
        }
    }
    $:if($modal_confirm_result === 'deleteNoticeFile') {
        noticeFileDelete(noticeId).then(({data}) => {
            initFile = [];
        });
        $modal_confirm_result = '';
    }
    onMount(() => {
        initializeSummernote();
    });
    afterUpdate(() => {
        initializeSummernote();
    });
</script>

<!-- BEGIN content -->
<div id="content">
    <!-- BEGIN form -->
    <form on:submit|preventDefault={updateNotice_before}>
        <!-- BEGIN panel -->
        <div class="panel panel-inverse" data-sortable-id="form-plugins-9">
            <!-- BEGIN panel-heading -->
            <div class="panel-heading">
                <h4 class="panel-title">공지사항 작성</h4>
            </div>
            <!-- END panel-heading -->
            <!-- BEGIN panel-body -->
            <div class="panel-body p-0">
                <div class="form-horizontal form-bordered">
                    <div class="form-group row">
                        <label class="form-label col-form-label col-lg-2">제목</label>
                        <div class="col-lg-10">
                            <input bind:value={notice.title} type="text" class="form-control" id="masked-input-date" placeholder="제목을 입력해주세요." />
                        </div>
                    </div>
                    <div class="form-group row">
                        <label class="form-label col-form-label col-lg-2">내용</label>
                        <div class="col-lg-10">
                            <div>
                                <textarea bind:value={notice.content} id="summernote" class="summernote" name="content"></textarea>
                            </div>
                        </div>
                    </div>
                    <div class="form-group row">
                        <label class="form-label col-form-label col-lg-4">첨부파일</label>
                        <div class="col-lg-8 file-space">
                            <input bind:files={notice.file} 
                                type="file" class="form-control" id="noticeFile" />
                            {#if notice.file?.length}
                            <button type="button" on:click={() => {
                                notice.file = null;
                                ui.fileReset("#noticeFile");
                            }}>
                                <i class="bi bi-x-circle-fill fs-24px h-60px"></i>
                            </button>
                            {/if}
                            {#if initFile.length && (!notice.file?.length)}
                            <label for="noticeFile" class="init-filemark">
                                {initFile[0]?.name}
                            </label>
                            <p class="align_right">
                                <a href="#" class="isLink_btn c_red"
                                    on:click|preventDefault={() => {
                                        modal_confirm.open('기존 파일을 삭제하시겠습니까?','deleteNoticeFile');
                                    }}>기존파일 삭제</a>
                            </p>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
            <!-- END panel-body -->
        </div>
        <!-- END panel -->
        <div class="complete-btn">
            <button class="btn btn-primary me-1 mb-1">완료</button>
            <button type="button" class="btn btn-danger me-1 mb-1" on:click={pop}>취소</button>
        </div>
    </form>
    <!-- END form -->
</div>
<!-- END content -->

<style>
.panel-title {
    font-size:25px;
}
.complete-btn {
    text-align: right;
}
.complete-btn button {
    font-size:20px;
    padding:10px 30px;
}
.form-horizontal, .form-horizontal input {
    font-size:20px;
}
.file-space {
    position: relative;
}
.file-space button{
    position:absolute;
    right: 30px;
    top:20px;
    color:red;
}
.init-filemark {
    position: absolute;
    top: 23.2px;
    left: 130px;
    width: 652.4px;
    background: #fff;
    text-overflow: ellipsis;
    overflow: hidden;
    cursor: pointer;
    white-space: nowrap;
}
</style>