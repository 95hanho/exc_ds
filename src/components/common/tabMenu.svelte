<script>
    import { link, location } from 'svelte-spa-router';
    import { programIntroScrTop } from '../../store/moduleSlice';

</script>

<!-- BEGIN tabMenu -->
<div id="tabList">
    <ul class="profile-header-tab nav nav-tabs" role="tablist">
        <li class="nav-item" role="presentation">
            <a href="/program" use:link class="nav-link" class:active={$location.startsWith('/program')} data-bs-toggle="tab" aria-selected="true" role="tab"
                on:click={() => {
                    programIntroScrTop.set(0);
                }}>전체과정 프로그램</a>
        </li>
        <li class="nav-item" role="presentation">
            <a href="/application/list" use:link class="nav-link" class:active={$location.startsWith('/application')} data-bs-toggle="tab" aria-selected="false" tabindex="-1" role="tab">
                교육일정 확인 및 수강신청(변경)
            </a>
        </li>
        <li class="nav-item" role="presentation">
            <a href="/talktalk/1" use:link class="nav-link" class:active={$location.startsWith('/talktalk')} data-bs-toggle="tab" aria-selected="false" tabindex="-1" role="tab">
                TalkTalk 게시판
            </a>
        </li>
    </ul>
</div>
<!-- END tabMenu -->

<style>
#tabList {
    position: absolute;
    top: -50px;
    width:100%;
    margin:0 auto;
}
#tabList ul {
    width:1200px;
    margin:0 auto;
}
.nav-item {
    width:calc(33.3333% - 10px);
    text-align: center;
    font-size:22px;
    background: rgba(0, 0, 0, 0.3);
    margin-left:5px;
    border-radius: 10px 10px 0 0;
}
.nav-item>a {
    color:#fff;
}
.nav-item:hover {
    background: rgba(0,0,0,0.6);
}
.nav-tabs {
    -bs-nav-tabs-border-radius: 0;
}
.nav-link.active {
    font-weight: 600;
    color:#000;
}
</style>