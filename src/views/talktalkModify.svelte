<script>
	import Talktalk from './talktalk.svelte';
    import { afterUpdate, onMount } from 'svelte';
    import 'summernote/dist/summernote-lite.js';
    import "summernote/dist/summernote-lite.css";
    import jQuery from "jquery";
    import { modal_alert } from '../store/modalSlice.js';
    import { pop, push, querystring } from 'svelte-spa-router';
    import { getProgramNames, getTalk, updateTalk } from '../compositions/talktalk';
    
    export let params = {}
    $:talkId = params.talkId;
    $:talktalk.id = talkId;
    const page = new URLSearchParams($querystring).get('page');

    let summernoteInitialized = false;

    const talktalk = {
        id: '',
        title:'',
        content:'',
        program_code:'',
    }
    let programNames = []; // 프로그램명 리스트

    // 수정완료
    const updateTalk_before = () => {
        const content = jQuery('.summernote').summernote('code');
        talktalk.content = content;
        if(!talktalk.title) {
            modal_alert.open('제목이 입력되지 않았습니다.');
        } else if(talktalk.content === '<p><br></p>') {
            modal_alert.open('내용이 입력되지 않았습니다.');
        } else {
            updateTalk(talktalk).then(({data}) => {
                if(page) push(`/talktalk/${page}/${talkId}`);
                else push(`/talktalk/1/${talkId}`);
            });
        }
    }

    $:getTalk(talkId).then(({data}) => {
        talktalk.title = data.data.title;
        talktalk.program_code = data.data.program_code;
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
    onMount(() => {
        initializeSummernote();
        getProgramNames().then(({data}) => {
            programNames = data.data;
        });
    });
    afterUpdate(() => {
        initializeSummernote();
    });
</script>

<!-- BEGIN content -->
<div id="content">
    <!-- BEGIN form -->
    <form on:submit|preventDefault={updateTalk_before}>
        <!-- BEGIN panel -->
        <div class="panel panel-inverse" data-sortable-id="form-plugins-9">
            <!-- BEGIN panel-heading -->
            <div class="panel-heading">
                <h4 class="panel-title">Talktalk 수정</h4>
            </div>
            <!-- END panel-heading -->
            <!-- BEGIN panel-body -->
            <div class="panel-body p-0">
                <div class="form-horizontal form-bordered">
                    <div class="form-group row">
                        <span class="form-label col-form-label col-lg-2">제목</span>
                        <div class="col-lg-10">
                            <input bind:value={talktalk.title} type="text" class="form-control" id="masked-input-date" placeholder="제목을 입력해주세요." />
                        </div>
                    </div>
                    <div class="form-group row">
                        <span class="form-label col-form-label col-lg-2">프로그램명</span>
                        <div class="col-lg-10">
                            <select class="form-select"
                                bind:value={talktalk.program_code}>
                                <option value="">---------- 프로그램명 ----------</option>
                                {#each programNames as programName}
                                <option value={programName.program_code}>{programName.program_name}</option>
                                {/each}
                            </select>
                        </div>
                    </div>
                    <div class="form-group row">
                        <span class="form-label col-form-label col-lg-2">내용</span>
                        <div class="col-lg-10">
                            <div>
                                <textarea bind:value={talktalk.content} id="summernote" class="summernote" name="content"></textarea>
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
.form-horizontal, .form-horizontal input, .form-horizontal, .form-horizontal select {
    font-size:20px;
}
</style>