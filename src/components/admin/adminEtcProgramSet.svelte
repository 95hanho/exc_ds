<script>
    import { setInitMonth } from "../../compositions/admin";

    export let default_month;

    let initMonth = 0;
    $:if(default_month) initMonth = default_month;

    const setInitMonth_before = () => {
        console.log(initMonth);
        setInitMonth({value:initMonth}).then(({data}) => {
            console.log(data.msg);
        });
    }
</script>

<div id="adminEtcProgramSet">
    <h2>프로그램 기본설정</h2>
    <div class="programSet_wrap">
        <div>
            표시 월 : 
            <select name="" id="" class="form-select"
                bind:value={initMonth}
                on:change={setInitMonth_before}>
                <option value="0">현재 월({new Date().getMonth() + 1})</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
                <option value="11">11</option>
                <option value="12">12</option>
            </select>
        </div>
        <p class="c_red">* 모든 교육일정 나오는 페이지에서 처음 표시 해줄 달(월)</p>
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
</style>