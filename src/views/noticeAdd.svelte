<script>
    import { afterUpdate, onMount } from 'svelte';
    import 'summernote/dist/summernote-lite.js';
    import "summernote/dist/summernote-lite.css";
    import jQuery from "jquery";
    import { modal_alert } from '../store/modalSlice.js';
    import { pop, push } from 'svelte-spa-router';
    import { noticeFileUpload, addQna } from '../compositions/notice.js';
    import { ui } from '../compositions/ui.js';
    import { onAllLoding } from '../store/moduleSlice.js';
    
    let summernoteInitialized = false;

    let notice = {
        title:'',
        content:'',
        file: null,
    }

    const createNotice_before = async () => {
        const content = jQuery('.summernote').summernote('code');
        notice.content = content;
        if(!notice.title) {
            modal_alert.open('제목이 입력되지 않았습니다.');
        } else if(notice.content === '<p><br></p>') {
            modal_alert.open('내용이 입력되지 않았습니다.');
        } else {
            $onAllLoding = true;
            await addQna(notice).then(({data}) => {
                console.log(data);
                return;
                if(notice.file?.length) {
                    noticeFileUpload({ id: data.data.id, file: notice.file})
                    .then(({data}) => {
                        push('/notice/1');
                    });
                } else push('/notice/1');
            });
            $onAllLoding = false;
        }
    }

    onMount(() => {
        initializeSummernote();
    });
    afterUpdate(() => {
        initializeSummernote();
    });
    function initializeSummernote() {
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
            });
            summernoteInitialized = true;
        }
    }
</script>

<!-- BEGIN content -->
<div id="content">
    <!-- BEGIN form -->
    <form on:submit|preventDefault={createNotice_before}>
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
</style>