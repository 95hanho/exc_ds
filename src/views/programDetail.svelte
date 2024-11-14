<script>
	import { fade } from 'svelte/transition';
	import TabMenu from '../components/common/tabMenu.svelte';
    import image5 from '../assets/img/A001_01_img_05.jpg';
    import 'font-awesome/css/font-awesome.css';
    import { onMount } from 'svelte';
    import { getIntroDetail } from '../compositions/intro';
    import Loding from '../components/common/loding.svelte';
    import { link, replace } from 'svelte-spa-router';
    import { modal_alert } from '../store/modalSlice';
    import { uiScr } from '../compositions/scroll';

    export let params = {};

    let repeatCount = 10;
    let items = Array.from({length:repeatCount}, (_, index) => 10 - index);

    $: detailAwait = getIntroDetail(params.pNum).then(({data}) => {

        return data.data;
    }).catch((err) => {
        modal_alert.open('잘못된 접근입니다.');
        replace('/program');
    });

    onMount(() => {
        uiScr.goTopRight(0);
    });

</script>

<TabMenu />

<!-- BEGIN #content -->
<div id="content" in:fade={{duration: 500}}>
    {#await detailAwait}
    <Loding />
    {:then detail} 
    <div id="program-detail">
        <div class="program-header">
            <div class="field_img">
                <img src={detail.program_meta_info.categroy_bg_url} alt="" width="300" height="155">
                <div class="categroy_name">
                    {@html detail.program_meta_info.categroy_name}
                </div>
            </div>
            <div class="title">
                <div><span>과정명</span></div>
                <div><span>교육시간</span></div>
                <div><span>교육장소</span></div>
            </div>
            <div class="content">
                <div>
                    <span>{detail.program_name}</span>
                </div>
                <div>
                    <span>{detail.program_meta_info.time}</span>
                </div>
                <div>
                    <span>{@html detail.program_meta_info.place}
                    </span>
                </div>
            </div>
        </div>
        {@html detail.program_content}
        <p>
            <a href={`/application/list?content=${detail.program_name}`} use:link>
                <img src={image5} alt="">
            </a>
        </p>
    </div>
    <div class="review">
        <!-- BEGIN page-header -->
        <h1 class="page-header">수강후기({detail.review_data.length}건)</h1>
        <!-- END page-header -->
        <!-- BEGIN panel -->
        <div class="panel panel-inverse">
            <!-- BEGIN panel-heading -->
            <div class="panel-heading">
                <!-- <h4 class="panel-title">Data Table - Default</h4>
                <div class="panel-heading-btn">
                    <a href="javascript:;" class="btn btn-xs btn-icon btn-default" data-toggle="panel-expand"><i class="fa fa-expand"></i></a>
                    <a href="javascript:;" class="btn btn-xs btn-icon btn-success" data-toggle="panel-reload"><i class="fa fa-redo"></i></a>
                    <a href="javascript:;" class="btn btn-xs btn-icon btn-warning" data-toggle="panel-collapse"><i class="fa fa-minus"></i></a>
                    <a href="javascript:;" class="btn btn-xs btn-icon btn-danger" data-toggle="panel-remove"><i class="fa fa-times"></i></a>
                </div> -->
            </div>
            <!-- END panel-heading -->
            <!-- BEGIN panel-body -->
            <div class="panel-body">
                <div class="row">
                    <table id="starReviewTable" class="table table-striped table-bordered align-middle">
                        <thead>
                            <tr>
                                <th width="5%">번호</th>
                                <th width="12%" class="text-nowrap">만족도</th>
                                <th class="text-nowrap">내용</th>
                                <th width="6%" class="text-nowrap">성명</th>
                                <th width="10%" class="text-nowrap">수강일</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each detail.review_data as review, index}
                            <tr>
                                <td width="1%" class="fw-bold">{index + 1}</td>
                                <td>
                                    <fieldset class="rate">
                                        {#each items as item, index}
                                        <label
                                        class:half={item%2 === 1}
                                        class:active={review.rate * 2 === item}
                                        ></label>
                                        {/each}
                                    </fieldset>
                                </td>
                                <td>{@html review.contents}</td>
                                <td>{review.writer.substring(0, 1)}**</td>
                                <td>{review.regdate.substring(0, 10)}</td>
                            </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
            <!-- END panel-body -->
            <!-- BEGIN paging -->
            <!-- <nav class="paging-div" aria-label="Page navigation example">
                <ul class="pagination">
                <li class="page-item"><a class="page-link" href="#">이전목록</a></li>
                <li class="page-item"><a class="page-link" href="#">1</a></li>
                <li class="page-item"><a class="page-link" href="#">2</a></li>
                <li class="page-item"><a class="page-link" href="#">3</a></li>
                <li class="page-item"><a class="page-link" href="#">다음목록</a></li>
                </ul>
            </nav> -->
            <!-- END paging -->
        </div>
        <!-- END panel -->
    </div>
    {/await}
    
</div>
<!-- END #content -->

<style>
/* program-header */
.program-header {
    display: flex;
    width:1000px;
    margin: 0 auto;
    border-top:3px solid #dbdcf0;
}
.program-header>div{
    text-align: left;
}
.program-header .field_img {
    position:relative;
    width:27%;
    padding:40px 0;
}
.program-header .field_img .categroy_name {
    position: absolute;
    top: 0;
    right: 20px;
    height: 240px;
    display: flex;
    align-items: center;
    font-size: 32px;
    font-weight: bolder;
    color: #fff;
    text-align: center;
}
.program-header .title {
    padding:40px 0 40px 30px;
}
.program-header .title>div {
    display: flex;
    font-size:19px;
    font-weight: 700;
    color:#565b5f;
    height: 52px;
}
.program-header .title>div span {
    background-color:#e3edf7;
    margin:0 0 0 38px;
    width:108px;
    border:2px solid #d4d9e0;
    height: 40px;
    text-align: center;
    font-weight: 700;
    border-radius: 5px;
    line-height: 35px;
}
.program-header .title>div:nth-child(1) {
    line-height: 40px;
}
.program-header .title>div:nth-child(2) {
    align-items: center;
}
.program-header .title>div:nth-child(3) {
    align-items: end;
}
.program-header .content {
    width:50%;
    padding:40px 0 40px 0;
}
.program-header .content>div {
    font-size: 19px;
    font-weight: 700;
    color: #565b5f;
    height: 57.8px;
    display: flex;
    line-height: 25px;
    padding-top:5px;
}
.program-header .content>div:nth-child(3) {
    height: auto;
}
.program-header .content>div span {
    padding: 0 20px;
    font-size: 20px;
}
/*  */
.review .page-header {
    padding:0 10px;
}
/*  */
.rate {
    display: inline-block;
    border: 0;
}
.rate > label {
    float: right;
    color: #ddd;
}
.rate > label:before {
    display: inline-block;
    font-size: 1rem;
    padding: 0.3rem 0.2rem;
    margin: 0;
    font-family: FontAwesome;
    /* background-image: url("/src/assets/img/star_off.png"); */
    content: "\f005 ";
}
.rate .half:before {
    content: "\f089 ";
    /* background-image: url("/src/assets/img/star_on.png"); */
    position: absolute;
    padding-right: 0;
}
.rate label.active,
.rate label.active ~ label {
    color: #f73c32 !important;
}
/*  */
#starReviewTable {
    text-align:center;
    word-break: keep-all;
}
/*  */

</style>