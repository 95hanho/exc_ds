<script>
    import { ui } from "../../compositions/ui";
    import { modal_alert } from "../../store/modalSlice";
    import { setMainPopup } from "../../compositions/admin";

    export let pop_info;
    $:if(pop_info) initSet();
    export let set_pop_info;

    let file1_status = false;
    let file2_status = false;
    let file1 = null;
    let initName = "기존파일1";
    let file2 = null;
    let initName2 = "기존파일2";

    const reset = () => {
        file1 = null;
        ui.fileReset('#popupFile');
        file2 = null;
        ui.fileReset('#popupFile2');
    }
    const initSet = () => {
        console.log(pop_info)
        reset();
        file1_status = pop_info[1].status;
        initName = '현재: ' + pop_info[1].name;
        file2_status = pop_info[2].status;
        initName2 = '현재: ' + pop_info[2].name;
    }

    const setMainPopup_before = () => {
        console.log('setMainPopup_before', {
            file1_status, file2_status,
            file1, file2,
        });
        let obj = {
            file1_status,
            file2_status,
        }
        if(file1 && file1.length > 0) obj.file1 = file1;
        if(file2 && file2.length > 0) obj.file2 = file2;
        setMainPopup(obj).then(({data}) => {
            console.log(data.msg);
            set_pop_info(1, 'status', file1_status);
            if(file1) set_pop_info(1, 'name', file1[0].name);
            set_pop_info(2, 'status', file2_status);
            if(file2) set_pop_info(2, 'name', file2[0].name);
            modal_alert.open('변경완료!');
        });
    }
</script>

<div id="adminEtcSetPopup">
    <h2>메인 팝업 설정(사이즈 고정 608 × 732)</h2>
    <div>
        <div class="inline-block file-space">
            <strong>왼쪽 : </strong>
            <input class="form-control popupFile" type="file" id="popupFile"
                accept="image/*" bind:files={file1}>
            {#if file1?.length}
            <button type="button" on:click={() => {
                file1 = null;
                ui.fileReset('#popupFile');
            }}>
                <i class="bi bi-x-circle-fill fs-24px h-60px"></i>
            </button>
            {/if}
            {#if initName.length && (!file1?.length)}
            <label for="popupFile" class="init-filemark">
                {initName}
            </label>
            {/if}
        </div>
        <div class="onoffBtnDiv">
            <input
                type="checkbox"
                id="file1"
                name="private"
                class="onf_checkbox"
                bind:checked={file1_status}
            />
            <label for="file1" class="switch_label">
                <span class="onf_btn"></span>
                <span
                class={`onf_txt c_red`}
                class:c_red={!file1_status}
                class:c_green={file1_status}
                >
                {#if file1_status} On
                {:else} Off
                {/if}
                </span>
            </label>
        </div>
    </div>
    <div>
        <div class="inline-block file-space">
            <strong>오른쪽 : </strong>
            <input class="form-control popupFile" type="file" id="popupFile2"
                accept="image/*" bind:files={file2}>
            {#if file2?.length}
            <button type="button" on:click={() => {
                file2 = null;
                ui.fileReset('#popupFile2');
            }}>
                <i class="bi bi-x-circle-fill fs-24px h-60px"></i>
            </button>
            {/if}
            {#if initName2.length && (!file2?.length)}
            <label for="popupFile2" class="init-filemark right">
                {initName2}
            </label>
            {/if}
        </div>
        <div class="onoffBtnDiv">
            <input
                type="checkbox"
                id="file2"
                name="private2"
                class="onf_checkbox"
                bind:checked={file2_status}
            />
            <label for="file2" class="switch_label">
                <span class="onf_btn"></span>
                <span
                class={`onf_txt c_red`}
                class:c_red={!file2_status}
                class:c_green={file2_status}
                >
                {#if file2_status} On
                {:else} Off
                {/if}
                </span>
            </label>
        </div>
    </div>
    <div class="storage">
        <button type="button" class="btn btn-green"
            on:click={setMainPopup_before}>저장</button>
        <button type="button" class="btn btn-danger"
            on:click={initSet}>되돌리기</button>
    </div>
</div>
<style>
#adminEtcSetPopup > div {
    padding:5px 10px;
}
h2 {
    font-size:30px;
    padding:0 10px;
}
.popupFile {
    width:500px;
    display: inline-block;
}
.onoffBtnDiv {
    display: inline-block;
}
/* 파일삭제 및 기존파일 표시 */
.file-space {
    position: relative;
}
.file-space button{
    position: absolute;
    right: 10px;
    top: 0px;
    color: red;
}
.init-filemark {
    position: absolute;
    top: 7.4px;
    left: 130px;
    width: 352.4px;
    background: #fff;
    text-overflow: ellipsis;
    overflow: hidden;
    cursor: pointer;
    white-space: nowrap;
}
.init-filemark.right {
    left: 150px;
}
.storage {
    text-align: right;
    padding-bottom: 0 !important;
}
.storage button {
    width:150px;
    height: 50px;
    font-size:25px;
}
</style>