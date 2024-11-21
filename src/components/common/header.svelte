<script>
	import { link, location, push } from 'svelte-spa-router';
    import home_btn from '/template/img/lead_logo.png';
    import { loginOn, userName } from '../../store/userSlice.js';
    import 'bootstrap-icons/font/bootstrap-icons.css'
    import 'font-awesome/css/font-awesome.css';
    import { modal_confirm, modal_confirm_result } from '../../store/modalSlice.js';

    $:if($modal_confirm_result === 'logout') {
        loginOn.logout();
        $modal_confirm_result = "";
    }
</script>

<!-- BEGIN #header -->
<div id="header" class="app-header">
    <div class="header-in-content">
        <a href="/" use:link class:home={$location === '/'}>
            <img src={home_btn} alt="">
        </a>
        {#if $loginOn}
        <!-- BEGIN header-nav -->
        <div class="menu-area">
            <a href="/notice" class="isLink_btn"
                on:click|preventDefault={() => {
                    push('/notice/1')
                }}>공지사항 및 QnA
            </a>
            <span class="">
                {$userName}
            </span>
            <button type="button" class="btn btn-dark me-1 mb-1"
                on:click={() => {
                    modal_confirm.open('로그아웃 하시겠습니까?', 'logout')
                }}>Logout</button>
        </div>
        <!-- END header-nav -->
        {/if}
    </div>
</div>
<!-- END #header -->

<style>
#header {
    width:100%;
    height: 64px;
    display: block;
}
.header-in-content {
    width:1200px;
    height: 100%;
    margin:0 auto;
}
.header-in-content .home {
    margin-left:100px;
}
.header-in-content>a {
    margin-left: 5px;
}
.header-in-content .navbar-nav a {
    display: inline-block;
    height: 100%;
    margin-left: 10px;
}.menu-area {
    width:50%;
    height: 100%;
    position:absolute;
    right:10px;
    top:0;
    text-align: right;
    line-height: -100px;
}
.menu-area a, .menu-area span {
    display: inline-block;
    height: 100%;
    line-height: 60px;
}
.menu-area span, .menu-area button {
    margin-left:20px;
}
.menu-area button {
    font-size:18px;
}
</style>