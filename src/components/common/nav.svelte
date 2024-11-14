<script>
	import { modal_login } from '../../store/modalSlice.js';
    import { location, push, querystring } from 'svelte-spa-router';
    import login_btn from '../../assets/img/btn_login.png'
    import main_title from '../../assets/img/title.png'
    import { loginPage } from '../../compositions/user.js';
    import { grant, loginOn } from '../../store/userSlice.js';

    export let onNoImage;

    const login_form = () => {
        modal_login.open();
    };
</script>

<!-- BEGIN navInfo -->
<nav id="nav" class:main={$location === '/'}
    class:sub1={$location.startsWith('/program')}
    class:sub2={$location.startsWith('/application')}
    class:sub3={$location.startsWith('/talktalk')}
    class:noImage={onNoImage}
>
    <div class="main-space">
    {#if $location === '/'}
        {#if !$loginOn}
        <button on:click={login_form}>
            <img src={login_btn} alt="">
        </button>
        {/if}
        {#if $grant == 90}
        <button class="admin-btn btn btn-danger me-1 mb-1"
            on:click={() => push('/admin/application')}
        >관리자페이지</button>
        {:else if $grant == 80}
        <button class="admin-btn btn btn-danger me-1 mb-1"
            on:click={() => push('/manager')}
        >운영자페이지</button>
        {/if}
        <div class="main_title">
            <img src={main_title} alt="">
        </div>
    {/if}
        <div class="menu_outline" class:talktalk={$location.startsWith('/talktalk')}>
            {#if $location.startsWith('/program')}
            <span></span>
            {:else if $location.startsWith('/application')}
            나의 프로그램 신청현황과<br>
            교육일정 및 수강이력을 확인합니다.
            {:else if $location.startsWith('/talktalk')}
                개별 과정에 대해 자유롭게 이야기 하는 곳입니다. <br>
                과정 내용, 운영 방식, 강사님께 문의하고 싶은 내용 뿐만 아니라 <br>
                과정을 듣고 좋았던 점이나 더 필요한 내용들을 자유롭게 적어주세요. <br><br>
                * 과정 신청 및 취소 문의는 문의처로 연락주시기 바랍니다.<br>
            {/if}
        </div>
    </div>
</nav>
<!-- END navInfo -->

<style>
/* nav */
#nav {
    position: relative;
    width:100%;
    height: 271px;
    background: url(../../assets/img/sub_main_img.jpg) no-repeat 50% 50%;
}
#nav.main {
    background-image: url(../../assets/img/main_img.png);
    height: 365px;
}
#nav.sub1 {
    background: url(../../assets/img/sub_img_01.jpg) no-repeat 50% 50%;
}
#nav.sub2 {
    background: url(../../assets/img/sub_img_02.jpg) no-repeat 50% 50%;
}
#nav.sub3 {
    background: url(../../assets/img/sub_img_03.jpg) no-repeat 50% 50%;
}
#nav.noImage {
    height: 0;
}
#nav .main_title {
    position: absolute;
    top: 70px;
    left: 120px;
}
#nav .main-space {
    position: relative;
    width:1200px;
    height: 100%;
    margin:0 auto;
}
#nav .main-space button {    
    position: absolute;
    top: 210px;
    left: 120px;
}
.admin-btn {
    width: 300px;
    height: 100px;
    font-size: 40px;
}
.menu_outline {
    position:absolute;
    top:70px;
    left:20px;
    font-size:28px;
    font-weight: 600;
    color:#01378f;
}
.talktalk {
    font-size:17px;
    top:50px;
}
</style>