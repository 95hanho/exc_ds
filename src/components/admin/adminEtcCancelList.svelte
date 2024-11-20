<script>
    import { onMount } from "svelte";
    import { onAllLoding } from "../../store/moduleSlice";
    import { cancelListDownload } from "../../compositions/admin";

    let selectYear = new Date().getFullYear();
    let selectMonth = 99;

    const years = [];
    for(let year = 2022; year <= new Date().getFullYear(); year++) {
        years.push(year);
    }

    const cancelListDownload_before = () => {
        onAllLoding.set(true);
        cancelListDownload({
            year: selectYear,
            month: selectMonth
        }).then(({data}) => {
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `취소사유(${selectYear}-${selectMonth == 99 ? '전체' : selectMonth}).xlsx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            onAllLoding.set(false);
        });
    }

    onMount(() => {
    })
</script>

<div id="adminEtcProgramSet">
    <h2>취소사유목록 엑셀다운로드</h2>
    <div class="programSet_wrap">
        <div>
            년 : 
            <select class="form-select" bind:value={selectYear} disabled>
                {#each years as year}
                <option value={year}>{year}</option>
                {/each}
            </select>
            ,&nbsp;
            월 : 
            <select name="" id="" class="form-select"
                bind:value={selectMonth}>
                <option value={99}>전체</option>
                <!-- <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
                <option value={6}>6</option>
                <option value={7}>7</option>
                <option value={8}>8</option>
                <option value={9}>9</option>
                <option value={10}>10</option>
                <option value={11}>11</option>
                <option value={12}>12</option> -->
            </select>
            &nbsp;
            <button type="button" class="btn btn-success"
                on:click={cancelListDownload_before}>다운로드</button>
        </div>
    </div>
</div>

<style>
h2 {
    font-size:30px;
    padding:0 10px;
}
.programSet_wrap {
    font-size:20px;
    padding:10px 10px;
}
.programSet_wrap select {
    width:auto;
    display: inline-block;
    font-size:20px;
}
.programSet_wrap button {
    font-size:20px;
}
</style>