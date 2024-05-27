<script>
    import { getNotice, updateNoticeQna } from '../compositions/notice.js';
    import { modal_alert } from '../store/modalSlice.js';
    import { pop, push, querystring } from 'svelte-spa-router';
    
    export let params = {}
    $:qnaId = params.qnaId;
    $:qna.id = qnaId;
    const page = new URLSearchParams($querystring).get('page');

    const qna = {
        id:'',
        title:'',
        is_secret:'',
        content:'',
    }
    let secret = false;

    const updateQna_before = () => {
        if(!qna.title) {
            modal_alert.open('제목이 입력되지 않았습니다.');
        } else if(!qna.content) {
            modal_alert.open('내용이 입력되지 않았습니다.');
        } else {
            qna.is_secret = secret ? 'Y' : 'N';
            qna.content = qna.content.replaceAll('\n', '<br>');
            updateNoticeQna(qna).then(({data}) => {
                if(page) push(`/notice/${page}/${qnaId}`);
                else push(`/notice/1/${qnaId}`);
            });
        }
    }

    $:getNotice(qnaId).then(({data}) => {
        qna.title = data.data.title;
        secret = data.data.secret;
        qna.content = data.data.content;
        return data.data;
    }).catch(() => {
        modal_alert.open('권한이 없습니다.');
        pop();
    });

</script>

<!-- BEGIN content -->
<div id="content">
    <!-- BEGIN form -->
    <form on:submit|preventDefault={updateQna_before}>
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
/* on/off 버튼 */
.onoffBtnDiv {
  /* checking style */
  /* move */
}
.onoffBtnDiv .onf_checkbox {
  position: absolute;
  /* hidden */
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}
.onoffBtnDiv .switch_label {
  position: relative;
  cursor: pointer;
  display: inline-block;
  width: 58px;
  height: 28px;
  background: #fff;
  border: 2px solid #daa;
  border-radius: 20px;
  transition: 0.2s;
}
.onoffBtnDiv .switch_label:hover {
  background: #efefef;
}
.onoffBtnDiv .onf_btn {
  position: absolute;
  top: 2.5px;
  left: 3px;
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 20px;
  background: #daa;
  transition: 0.2s;
}
.onoffBtnDiv .onf_txt {
  position: absolute;
  top: -5px;
  left: 67px;
  font-size: 20px;
  -webkit-user-select: none;
     -moz-user-select: none;
          user-select: none;
  width: 100px;
}
.onoffBtnDiv .onf_checkbox:checked + .switch_label {
  background: rgb(128, 197, 128);
  border: 2px solid rgb(133, 190, 133);
}
.onoffBtnDiv .onf_checkbox:checked + .switch_label:hover {
  background: rgb(103, 158, 103);
}
.onoffBtnDiv .onf_checkbox:checked + .switch_label .onf_btn {
  left: 34px;
  background: #fff;
  box-shadow: 1px 2px 3px rgba(0, 0, 0, 0.1254901961);
}
.onoffBtnDiv .onf_txt {
    width:500px;
}
</style>