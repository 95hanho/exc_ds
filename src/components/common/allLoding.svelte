<div id="allLoding">
    <div class="loding-wrap">
        <i class="fas fa-spinner fa-pulse"></i>
    </div>
</div>

<style>
#allLoding {
    position:fixed;
    top:0;
    left:0;
    width:100%;
    height:100%;
    z-index:9999;
    background:rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
}
.loding-wrap {
    width:100%;
    text-align: -webkit-center;
    padding:100px 0;
    z-index:10000;
}
.loding-wrap i {
    font-size:150px;
    color:#6CC0FF;
}
</style>