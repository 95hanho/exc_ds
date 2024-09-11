<!-- 과정 추가 -->
<script>
	import { modal_alert } from './../store/modalSlice.js';
	import { afterUpdate, onMount } from "svelte";
	import AdminTabMenu from "../components/admin/adminTabMenu.svelte";
	import { programStore } from "../store/adminSlice";
	import { pop, replace } from "svelte-spa-router";
	import { ui } from "../compositions/ui";
    import jQuery from "jquery";
    import 'summernote/dist/summernote-lite.js';
    import "summernote/dist/summernote-lite.css";
    import { getIntroDetail } from '../compositions/intro';
	import { addProgram } from '../compositions/admin.js';

    let summernoteInitialized = false; // 편집기 실행
    // 과정 데이터
    let adminProgram = {
        program_category:"",
        program_name: "",
        program_hash_tag: "",
        file: null,
        categoryList: [],
        program_meta_info: {
            time:"",
            place:`<br><span style="font-size:16px"></span>`,
        },
        program_content: "",
    };

    // 수정완료
    const adminProgramModify_before = () => {
        adminProgram.program_content = jQuery('.summernote').summernote('code');
        let c_f = { ...adminProgram };
        if(!c_f.program_name) {
            modal_alert.open('과정 이름을 입력해주세요.');
            return;
        } else if(!c_f.program_hash_tag) {
            modal_alert.open('태그를 입력해주세요.');
            return;
        } else if(!c_f.file || c_f.file.length === 0) {
            modal_alert.open('제목이미지를 첨부 해주세요.');
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
            c_f = {
                ...c_f,
                ...c_f.program_meta_info
            }
            delete c_f.program_meta_info;
            addProgram(c_f).then((data) => {
                console.log(data);
                replace('/admin/program');
            }).catch((err) => {
                modal_alert.open('실패!!!');
            });
        }
    }

    const init = async () => {
        await getInit();
        initializeSummernote();
    }
    const getInit = async () => {
        if($programStore.categoryList) {
            adminProgram.categoryList = $programStore.categoryList;
            adminProgram.program_category = $programStore.categoryList[0];
        } else {
            replace('/admin/program');
        }
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
                    <h4 class="panel-title">과정 추가</h4>
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
                            <label class="form-label col-form-label col-lg-4">과정 이름</label>
                            <div class="col-lg-8">
                                <input bind:value={adminProgram.program_name} type="text" class="form-control" id="masked-input-date" placeholder="과정이름을 입력해주세요." />
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
            <div>
                <p style="text-align: right;padding:0 20px" class="c_red">
                    * '예시' 클릭 후 수정해서 추가 할 수 있습니다.
                </p>
             </div>
            <div class="complete-btn">
                <button type="button" class="btn btn-warning me-1 mb-1" on:click={() => {
                    adminProgram = {
                        ...adminProgram,
                        program_category: "사업/경영",
                        program_name: "고객 경험은 어떻게 무기가 되는가",
                        program_hash_tag: "#디지털트렌스포메이션 #고객경험 #마케팅 #경험마케팅 #커뮤니티",
                        program_meta_info: {
                            time: "4H (8:30~12:30 / 13:30~17:30)",
                            place: `서천 인재개발원/ DS에듀센터 동탄 Ⅱ<br><span style="font-size:16px"> ※자세한 사항은  수강신청 시스템  및  입과 안내 메일을 참고해주세요.</span>`
                        },
                    }
                    const con = `<p><img src="https://dsedu.exc.co.kr/images/A001_13_img_01.jpg"></p>
                                <p><img src="https://dsedu.exc.co.kr/images/A001_13_img_02.jpg"></p>
                                <p><img src="https://dsedu.exc.co.kr/images/A001_13_img_03.jpg"></p>`;
                        jQuery('.summernote').summernote('code', con);
                }}>예시</button>
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
    top:20px;
    color:red;
}
.onf_txt {
    width:500px;
}
</style>