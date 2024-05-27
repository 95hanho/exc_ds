<script>
    import { addQna } from '../compositions/notice.js';
    import { modal_alert } from '../store/modalSlice.js';
    import { pop, push } from 'svelte-spa-router';
    
    const qna = {
        title:'',
        is_secret:'',
        content:'',
        file:null,
    }
    let secret = false;

    const createQna_before = () => {
        qna.file = document.getElementById('qnaFile').files;
        if(!qna.title) {
            modal_alert.open('제목이 입력되지 않았습니다.');
        } else if(!qna.content) {
            modal_alert.open('내용이 입력되지 않았습니다.');
        } else {
            qna.is_secret = secret ? 'Y' : 'N';
            qna.content = qna.content.trim().replaceAll('\n', '<br>');
            addQna(qna).then(({data}) => {
                modal_alert.open('QnA 작성이 완료되었습니다.');
                push('/notice/1');
            });
        }
    }

</script>

<!-- BEGIN content -->
<div id="content">
    <!-- BEGIN form -->
    <form on:submit|preventDefault={createQna_before}>
        <!-- BEGIN panel -->
        <div class="panel panel-inverse" data-sortable-id="form-plugins-9">
            <!-- BEGIN panel-heading -->
            <div class="panel-heading">
                <h4 class="panel-title">QnA 작성하기</h4>
            </div>
            <!-- END panel-heading -->
            <!-- BEGIN panel-body -->
            <div class="panel-body p-0">
                <div class="form-horizontal form-bordered">
                    <div class="form-group row">
                        <label class="form-label col-form-label col-lg-2">제목</label>
                        <div class="col-lg-10">
                            <input bind:value={qna.title} type="text" class="form-control" id="masked-input-date" placeholder="제목을 입력해주세요." />
                        </div>
                    </div>
                    <div class="form-group row">
                        <label class="form-label col-form-label col-lg-4">비밀글 설정</label>
                        <div class="col-lg-8">
                            <div class="onoffBtnDiv">
                                <input
                                    type="checkbox"
                                    id="switch"
                                    name="private"
                                    class="onf_checkbox"
                                    bind:checked={secret}
                                />
                                <label for="switch" class="switch_label">
                                    <span class="onf_btn"></span>
                                    <span
                                    class={`onf_txt c_red`}
                                    class:c_red={!secret}
                                    class:c_green={secret}
                                    >
                                    {#if secret}
                                    비공개 * 작성자와 관리자만 볼 수 있습니다.
                                    {:else}
                                    공개
                                    {/if}
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group row">
                        <label class="form-label col-form-label col-lg-2">내용</label>
                        <div class="col-lg-10">
                            <div>
                                <textarea bind:value={qna.content}
                                    class="qna-content form-control" rows="5" 
                                    placeholder="내용을 입력해주세요."/>
                            </div>
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
        <input bind:files={qna.file}
            type="file" class="form-control hide" id="qnaFile" />
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
.form-horizontal, .form-horizontal input, .form-horizontal, .form-horizontal textarea {
    font-size:20px;
}
.onoffBtnDiv .onf_txt {
    width: 500px;
}
</style>