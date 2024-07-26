<script>
	import { mainInit } from './../compositions/dsMain.js';
	import { push, querystring, replace } from 'svelte-spa-router';
    import arrow from '~assets/img/arrow.png';
    import main1_bt from '~assets/img/main_bnr_bg.png';
    import main1_icon from '~assets/img/main_icon01.png';
    import main2_icon from '~assets/img/main_icon02.png';

    import { loginOn } from '../store/userSlice';
    import { modal_alert, modal_login } from '../store/modalSlice';
    import { onDestroy, onMount } from 'svelte';
    import { cookies } from '../cookies.js';
    import { programIntroScrTop } from '../store/moduleSlice.js';
    import { uiScr } from '../compositions/scroll.js';

    const urlSearch = new URLSearchParams($querystring);
    const aToken = urlSearch.get('access_token');
    const rToken = urlSearch.get('refresh_token');

    let mainInitAwait;
    let noticeSliceIndex = null;
    let noticeReStartIndex = null;
    let notice_complete = null;
    let noticeLeng = 0;
    let popOn = true;
    let popOn2 = true;
    let popCookies = cookies.get('mainPopup');
    let popCookies2 = cookies.get('mainPopup2');

    if(!loginOn.getAtoken() && !loginOn.getRtoken()) {
        if(aToken && rToken) {
            loginOn.login(aToken, rToken);
            replace('/');
        }
    }
    const loginCheck = () => {
        if($loginOn) return true;
        else {
            modal_alert.open("로그인이 필요합니다.");
            return false;
        }
    }
    const mainNoticeSliceUpDown = (onUp) => {
        clearTimeout(noticeReStartIndex);
        clearInterval(noticeSliceIndex);
        if(onUp) uiScr.mainNoticeSliceUp(noticeLeng);
        else uiScr.mainNoticeSliceDown(noticeLeng);
        noticeReStartIndex = setTimeout(() => {
            noticeSliceIndex = uiScr.mainNoticeSlice(noticeLeng);
        }, 5000);
    }
    const todayClose = () => {
        cookies.set('mainPopup', 'off', 60 * 60 * 24);
    }
    const todayClose2 = () => {
        cookies.set('mainPopup2', 'off', 60 * 60 * 24);
    }

    $: if(notice_complete) {
        visibilitychange_fnc();
        document.addEventListener('visibilitychange', visibilitychange_fnc);
    }
    const visibilitychange_fnc = () => {
        if (document.hidden) {
            clearTimeout(noticeReStartIndex);
            clearInterval(noticeSliceIndex);
        } else {
            if(noticeLeng > 1) {
                clearTimeout(noticeReStartIndex);
                clearInterval(noticeSliceIndex);
                noticeSliceIndex = uiScr.mainNoticeSlice(noticeLeng);
            }
        }
    }
    onMount(() => {
        clearTimeout(noticeReStartIndex);
        clearInterval(noticeSliceIndex);
        mainInitAwait = mainInit().then(({data}) => {
            noticeLeng = data.data.notice_latest.length;
            return data.data;
        });
        if(!$loginOn && new URLSearchParams($querystring).get('type') === 'login') {
            modal_login.open();
            cookies.set('adminLogin', 'on', 60 * 60 * 24);
        } else if(!$loginOn && cookies.get('adminLogin') === 'on') {
            modal_login.open();
        }
    });
    onDestroy(() => {
        clearTimeout(noticeReStartIndex);
        clearInterval(noticeSliceIndex);
    });
</script>

<div id="content">
    <!-- BEGIN 메인메뉴버튼 -->
    <div class="main-menu">
        <ul>
            <li>
                <a href="/program"
                on:click|preventDefault={() => {
                    if(loginCheck()) {
                        programIntroScrTop.set(0);
                        push('/program');
                    }
                }}>
                    <div class="main-btn main1-btn">
                        <h3>
                            <img src={main1_icon} alt="main1_icon">
                            <span><b>전체과정</b><br>프로그램</span>
                            <img src={arrow} alt="arrow">
                        </h3>
                        <div class="bottom"><img src={main1_bt} alt="main1_bt"></div>
                    </div>
                </a>
            </li>
            <li>
                <a href="/application/list"
                on:click|preventDefault={() => {
                    if(loginCheck()) push('/application/list');
                }}>
                    <div class="main-btn main2-btn">
                        <h3>
                            <img src={main2_icon} alt="main1_icon">
                            <span><b>교육일정 확인</b><br>및 수강신청(변경)</span>
                            <img src={arrow} alt="arrow">
                        </h3>
                    </div>
                </a>
                </li>
            <li>
                <a href="/talktalk"
                on:click|preventDefault={() => {
                    if(loginCheck()) push('/talktalk/1');
                }}>
                    <div class="main-btn main3-btn half">
                        <h3>
                            <span><b>Talk!Talk!</b><br>게시판</span>
                            <img src={arrow} alt="arrow">
                        </h3>
                    </div>
                </a>
            </li>
            <li>
                <a href="/notice"
                on:click|preventDefault={() => {
                    if(loginCheck()) push('/notice/1');
                }}>
                    <div class="main-btn main4-btn half">
                        <h3>
                            <span><b>공지사항 <br>및 QnA</b></span>
                            <img src={arrow} alt="arrow">
                        </h3>
                    </div>
                </a>
            </li>
        </ul>
    </div>
    <!-- END 메인메뉴버튼 -->
    {#await mainInitAwait then data}
    {#if data}
        <!-- BEGIN notice슬라이드 -->
        {#if data?.notice_latest}
        <div id="notice">
            <div class="notice-img">
                <img 
                src="https://dsedu.exc.co.kr/images/icon_notice.jpg" alt="공지표시"
                width="30" height="30">
            </div>
            <div class="notice_slide">
                <ul>
                    {#each data.notice_latest as notice}
                    <li>
                        <a href={`/notice/1/${notice.id}`} class="isLink_btn" on:click|preventDefault={() => {
                            if(loginCheck()) push(`/notice/1/${notice.id}`);
                        }}>{notice.title}</a>
                    </li>
                    {/each}
                    {#each data.notice_latest as notice}
                    <li>
                        <a href={`/notice/1/${notice.id}`} class="isLink_btn" on:click|preventDefault={() => {
                            if(loginCheck()) push(`/notice/1/${notice.id}`);
                        }}>{notice.title}</a>
                    </li>
                    {/each}
                    {#each data.notice_latest as notice}
                    <li>
                        <a href={`/notice/1/${notice.id}`} class="isLink_btn" on:click|preventDefault={() => {
                            if(loginCheck()) push(`/notice/1/${notice.id}`);
                        }}>{notice.title}</a>
                    </li>
                    {/each}
                </ul>
            </div>
            {#if noticeLeng > 1}
            <div class="module">
                <div class="top"><button on:click={() => mainNoticeSliceUpDown(true)}>▲</button></div>
                <div class="bottom"><button on:click={() => mainNoticeSliceUpDown(false)}>▼</button></div>
            </div>    
            {/if}
            <div class="hide" bind:this={notice_complete}></div>
        </div>
        {/if}
        <!-- BEGIN notice슬라이드 -->
        <!-- BEGIN mainPopup -->
        {#if popOn && !popCookies && data.popup_list.length && data.popup_list[0]}
        <div id="mainPopup" class="mainPopup">
            <div class="top">
                <button type="button" 
                    on:click={() => {
                        popOn = false;
                    }} class="btn-close" data-bs-dismiss="alert"></button>
            </div>
            <div class="content">
                <!-- 608 731.84 -->
                {@html data?.popup_list[0].html}
                <!-- <img  width="608" height="731.84" src="https://dsedu.exc.co.kr/images/popup_240204_v1.png" alt=""> -->
            </div>
            <div class="bottom">
                <input id="todayClose" type="checkbox"
                    on:click|preventDefault={() => {
                        popOn = false;
                        todayClose();
                    }}>
                <label for="todayClose">오늘 하루 안보기</label>
            </div>
        </div>
        {/if}
        {#if popOn2 && !popCookies2 && data.popup_list.length && data.popup_list[1]}
            <div id="mainPopup2" class="mainPopup">
                <div class="top">
                    <button type="button" 
                        on:click={() => {
                            popOn2 = false;
                        }} class="btn-close" data-bs-dismiss="alert"></button>
                </div>
                <div class="content">
                    {@html data?.popup_list[1].html}
                </div>
                <div class="bottom">
                    <input id="todayClose2" type="checkbox"
                        on:click|preventDefault={() => {
                            popOn2 = false;
                            todayClose2();
                        }}>
                    <label for="todayClose2">오늘 하루 안보기</label>
                </div>
            </div>
            {/if}
    {/if}
    {/await}
</div>

<style>
#content {
    margin:0 auto;
}
.main-menu {
    display: flex;
    justify-content: center;
}
.main-menu ul {
    width:1070px;
    height: 312px;
}
.main-menu ul li {
    float:left;
    padding:5px;
}
/*  */
.main-menu a {
    text-decoration: none;
}
.main-menu .main-btn {
    position: relative;
    display: flex;
    align-items: center;
    border-radius: 15px;
    color:#fff;
    user-select: none;
}
.main-menu .main-btn h3 {
    width:100%;
    display: flex;
    align-items: center;
}
.main-menu .main-btn h3 img:first-child {
    padding: 0 30px;
}
.main-menu .main-btn h3 span {
    font-size:33px;
    display: inline-block;
}
.main-menu .main-btn h3 span b {
    font-size:35px;
}
.main-menu .main-btn h3 img:last-child {
    position:absolute;
    right:30px;
}
.main-menu .main1-btn {
    width:442px;
    height: 312px;
    background-color: #00609e;
}
.main-menu .main2-btn {
    width:544px;
    height: 151px;
    background-color: #1db4d1;
}
.main-menu .half {
    width:267px;
    height: 151px;
}
.main-menu .half h3 span {
    padding-left:30px;
    font-size:28px;
}
.main-menu .half h3 span b {
    font-size:30px;
}
.main-menu .main3-btn {
    background-color: #747ae1;
}
.main-menu .main4-btn {
    background-color: #747474;
}
.main-menu .main1-btn .bottom {
    position: absolute;
    bottom: 0;
}
.main-menu .main1-btn h3 img:first-child {
    padding: 0 30px;
}
/* notice */
#notice {
    position: relative;
    max-width: 1000px;
    border: 1px solid #c6c6c6;
    border-radius: 10px;
    margin: 0 auto;
    height: 70px;
    background-color: #fff;
    clear: both;
    overflow: hidden;
}
#notice .notice-img {
    display: block;
    width:100px;
    height: 100%;
    text-align: center;
    float: left;
    line-height: 60px;
}
#notice .notice_slide {
    display: inline-block;
    width:85%;
}
#notice .notice_slide ul {
    position:relative;
    width:100%;
    display: inline-block;
    padding:0;
}
#notice .notice_slide ul li {
    width:100%;
    height: 70px;
    line-height: 65px;
    font-size:20px;
}
#notice .notice_slide ul li a{
    text-overflow: ellipsis;
    display: block;
    white-space: nowrap;
    overflow: hidden;
}

#notice .module {
    position: absolute;
    font-size: 20px;
    top: 0;
    right: 0;
    width:50px;
    height: 100%;
    text-align: center;
}
#notice .module>div {
    height: 50%;
}
#notice .module>div button:active {
    color:red;
    font-size:23px;
}
/* mainPopup */
.mainPopup {
    position: absolute;
    top:-300px;
    left:0;
    border-radius: 10px 10px 0 0;
    border: 1px solid #999;
    box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.5);
}
.mainPopup .top {
    font-size: 25px;
    text-align: right;
    background-color: #fff;
    border-radius: 10px 10px 0 0;
}
.mainPopup .content {
    width:608px;
    height: 731.84px;
}
.mainPopup .bottom {
    text-align: right;
    background-color: #fff;
}
#mainPopup2 {
    left:650px;
}
</style>