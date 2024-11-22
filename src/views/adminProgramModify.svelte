<!-- 과정 수정 -->
<script>
	import { modal_alert, modal_confirm, modal_confirm_result } from './../store/modalSlice.js';
	import { afterUpdate, onMount } from "svelte";
	import AdminTabMenu from "../components/admin/adminTabMenu.svelte";
	import { programStore } from "../store/adminSlice";
	import { pop, push, replace } from "svelte-spa-router";
	import { ui } from "../compositions/ui";
    import jQuery from "jquery";
    import 'summernote/dist/summernote-lite.js';
    import "summernote/dist/summernote-lite.css";
    import { getIntroDetail } from '../compositions/intro';
	import { programHide, setProgram } from '../compositions/admin.js';

    export let params = {};

    let summernoteInitialized = false; // 편집기 실행
    // 과정 데이터
    let adminProgram = {
        categoryList: [],
        ordering_list: [],
        program_meta_info: {
            time:"",
            place:"",
        }
    };
    // 
    let before_ordering = 0;
    $:if(adminProgram.ordering) {
        re_ordering();
    }
    const re_ordering = () => {
        const store = adminProgram.ordering_list[before_ordering - 1];
        adminProgram.ordering_list[before_ordering - 1] = adminProgram.ordering_list[adminProgram.ordering - 1];
        adminProgram.ordering_list[adminProgram.ordering - 1] = store;
        before_ordering = adminProgram.ordering;
    }

    // NEW 태그여부
    let newOn = false;
    // 수정완료
    const adminProgramModify_before = () => {
        adminProgram.program_content = jQuery('.summernote').summernote('code');
        adminProgram.program_new_label = newOn ? 'Y' : 'N';
        let c_f = { ...adminProgram };
        if(!c_f.program_name) {
            modal_alert.open('과정 이름을 입력해주세요.');
            return;
        } else if(!c_f.program_hash_tag) {
            modal_alert.open('태그를 입력해주세요.');
            return;
        } else if(!c_f.program_meta_info.time) {
            modal_alert.open('교육시간을 입력 해주세요.');
            return;
        } else if(!c_f.program_meta_info.place || c_f.program_meta_info.place === `<br><span style="font-size:16px">`) {
            modal_alert.open('교육장소를 입력 해주세요.');
            return;
        } else if(c_f.program_content === `<p><br></p>`) {
            modal_alert.open('내용을 입력 해주세요.');
            return;
        } else {
            delete c_f.categoryList;
            delete c_f.ordering;
            delete c_f.review_data;
            delete c_f.program_header_img_url;
            c_f = { ...c_f,
                ...c_f.program_meta_info,
            }
            delete c_f.program_meta_info;
            delete c_f.categroy_bg_url;
            console.log(c_f);
            setProgram(c_f).then((data) => {
                push('/admin/program');
            }).catch((err) => {
                modal_alert.open('실패!!!');
            });
        }
    }

    const init = async () => {
        await getInit();
        console.log(adminProgram);
        jQuery('.summernote').summernote('code', adminProgram.program_content);
        initializeSummernote();
    }
    const getInit = async () => {
        console.log($programStore.program_category);
        if($programStore.program_category) {
            let obj = {};
            obj = { ...$programStore};
            before_ordering = obj.ordering;
            obj.ordering_list = obj.ordering_list.map((v) => v.program_code)
            await getIntroDetail(params.pNum).then(({data}) => {
                adminProgram = { ...obj, ...data.data };
                
                return data.data;
            }).catch((err) => {
                modal_alert.open('잘못된 접근입니다.');
                replace('/admin/program');
            });
            newOn = adminProgram.program_new_label === 'Y';
        } else {
            replace('/admin/program');
        }
    }

    // 과정숨김처리
    $: if($modal_confirm_result === 'programHide') {
        console.log(params.pNum);
        programHide(params.pNum).then(({data}) => {
            console.log(data);
            replace('/admin/program');
            $modal_confirm_result = "";
        });
    }

    onMount(() => {
        init();
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
                    minHeight: 500,
                    maxHeight: 1500,
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

<div>
  <div id="content" class="admin">
    <AdminTabMenu />
    <div class="admin-content">
        <form on:submit|preventDefault={adminProgramModify_before}>
            <!-- BEGIN panel -->
            <div class="panel panel-inverse" data-sortable-id="form-plugins-9">
            <!-- BEGIN panel-heading -->
            <div class="panel-heading">
                <h4 class="panel-title">과정 수정</h4>
            <div class="complete-btn">
                {#if adminProgram.program_status === 'Y'}
                <button type="button" class="btn btn-gray me-1 mb-1"
                    on:click={() => {
                        modal_confirm.open('해당 과정을 숨김 하시겠습니까??', 'programHide');
                    }}>숨김
                </button>
                {:else}
                <button type="button" class="btn btn-dark me-1 mb-1"
                    on:click={() => {
                        modal_confirm.open('숨김해제 하시겠습니까???', 'programHide');
                    }}>숨김해제
                </button>
                {/if}
            </div>
            </div>
            <!-- END panel-heading -->
            <!-- BEGIN panel-body -->
            <div class="panel-body p-0">
                <div class="form-horizontal form-bordered">
                    <div class="form-group row">
                        <label class="form-label col-form-label col-lg-4">분류</label>
                        <div class="col-lg-8">
                            <!-- <input bind:value={} type="text" class="form-control" id="masked-input-date" placeholder="제목을 입력해주세요." /> -->
                            <select bind:value={adminProgram.program_category} name="" id="" class="form-select">
                                {#each adminProgram.categoryList as cate}
                                <option value={cate}>{cate}</option>
                                {/each}
                            </select>
                        </div>
                    </div>
                    <div class="form-group row">
                        <label class="form-label col-form-label col-lg-4">순서</label>
                        <div class="col-lg-8">
                            <!-- <input bind:value={} type="text" class="form-control" id="masked-input-date" placeholder="제목을 입력해주세요." /> -->
                            <select bind:value={adminProgram.ordering} name="" id="" class="form-select">
                                {#each adminProgram.ordering_list as value, index}
                                <option value={index + 1}>{index + 1}</option>
                                {/each}
                            </select>
                        </div>
                    </div>
                    <div class="form-group row">
                        <label class="form-label col-form-label col-lg-4">과정 이름</label>
                        <div class="col-lg-8">
                            <input bind:value={adminProgram.program_name} type="text" class="form-control" id="masked-input-date" placeholder="과정 이름을 입력해주세요." />
                        </div>
                    </div>
                    <div class="form-group row">
                        <label class="form-label col-form-label col-lg-4">태그</label>
                        <div class="col-lg-8">
                            <input bind:value={adminProgram.program_hash_tag} type="text" class="form-control" id="masked-input-date" placeholder="태그를 입력해주세요." />
                        </div>
                    </div>
                    <div class="form-group row">
                        <label class="form-label col-form-label col-lg-4">제목이미지</label>
                        <div class="col-lg-8 file-space">
                            <div>
                                현재 파일 : <a href={adminProgram.program_header_img_url_v2} target="_blank" 
                                    style="vertical-align: baseline;"
                                    class="c_blue">링크</a>
                            </div>
                            <div>
                                <input bind:files={adminProgram.file}
                                    type="file" class="form-control" id="adminProgramFile" />
                                {#if adminProgram.file?.length}
                                <button type="button" on:click={() => {
                                    adminProgram.file = null;
                                    ui.fileReset("#adminProgramFile");
                                }}>
                                    <i class="bi bi-x-circle-fill fs-24px h-60px"></i>
                                </button>
                                {/if}
                            </div>
                        </div>
                    </div>
                    <div class="form-group row">
                        <label class="form-label col-form-label col-lg-4">New태그 여부</label>
                        <div class="col-lg-8">
                            <div class="onoffBtnDiv">
                                <input
                                    type="checkbox"
                                    id="switch"
                                    name="private"
                                    class="onf_checkbox"
                                    bind:checked={newOn}
                                />
                                <label for="switch" class="switch_label">
                                    <span class="onf_btn"></span>
                                    <span
                                    class={`onf_txt c_red`}
                                    class:c_red={!newOn}
                                    class:c_green={newOn}
                                    >
                                    {#if newOn}
                                    활성화
                                    {:else}
                                    비활성화
                                    {/if}
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="form-group row">
                        <label class="form-label col-form-label col-lg-4">교육시간</label>
                        <div class="col-lg-8">
                            <input bind:value={adminProgram.program_meta_info.time} type="text" class="form-control" id="masked-input-date" placeholder="교육시간을 입력해주세요." />
                        </div>
                    </div>
                    <div class="form-group row">
                        <label class="form-label col-form-label col-lg-4">교육장소</label>
                        <div class="col-lg-8">
                            <input bind:value={adminProgram.program_meta_info.place} type="text" class="form-control" id="masked-input-date" placeholder="교육장소를 입력해주세요." />
                            <p class="c_red">{`* '<br><span style="font-size:16px">' 앞에 장소 적고, 뒤에 공지멘트 적어주세요.`}</p>
                        </div>
                    </div>
                    <div class="form-group row">
                        <label class="form-label col-form-label col-lg-2">내용</label>
                        <div class="col-lg-10">
                            <div>
                                <textarea id="summernote" class="summernote" name="content"></textarea>
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
    </div>
</div>
</div>

<style>
.admin-content {
  border: 2px solid black;
  border-radius: 5px;
  padding-bottom: 20px;
}
.panel-heading {
    background-color: transparent;
}
.panel-title {
    font-size:25px;
    color:#000;
}
.complete-btn {
    text-align: right;
}
.complete-btn button {
    font-size:20px;
    padding:10px 30px;
}
.form-horizontal {
    border-top:2px solid black;
}
.form-select, .form-horizontal, .form-horizontal input {
    font-size:20px;
}
.file-space {
    position: relative;
}
.file-space button{
    position:absolute;
    right: 30px;
    top:50px;
    color:red;
}
.onf_txt {
    width:500px;
}
</style>