<script>
    import AdminEtcProgramSet from "./adminEtcProgramSet.svelte";
    import AdminEtcMainPopup from "./adminEtcMainPopup.svelte";
    import AdminEtcReview from "./adminEtcReview.svelte";
    import AdminEtcCancelList from "./adminEtcCancelList.svelte";
    import { onMount } from "svelte";
    import { getInitMonth } from "../../compositions/admin";

    let default_month = undefined;
    let pop_info = undefined;

    const set_pop_info = (type, name, value) => {
        pop_info[type][name] = value;
    }

    onMount(() => {
        getInitMonth().then(({data}) => {
            // console.log(data);
            default_month = data.data.default_month;
            pop_info = {};
            data.data.pop_info.map((v) => {
                pop_info[v.type] = {...v};
            });
        });
    });
</script>

<div id="adminEtc">
    <section>
        <!-- 프로그램 기본설정 -->
        <AdminEtcProgramSet {default_month}/>
    </section>
    <hr>
    <section>
        <!-- 취소자목록 엑셀다운로드 -->
        <AdminEtcCancelList />
    </section>
    <hr>
    <section>
        <!-- 메인팝업설정 -->
        <AdminEtcMainPopup {pop_info} {set_pop_info}/>
    </section>
    <hr>
    <section>
        <!-- 수강생후기작성 -->
        <AdminEtcReview />
    </section>
</div>

<style>
#adminEtc {
    padding:20px 0;
}
#adminEtc>section {
    padding:20px 20px;
}
</style>