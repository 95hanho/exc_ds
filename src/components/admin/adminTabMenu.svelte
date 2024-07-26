<script>
    import { link, location } from 'svelte-spa-router';

</script>

<!-- BEGIN tabMenu -->
<div id="tabList">
    <ul class="profile-header-tab nav nav-tabs" role="tablist">
        <li class="nav-item" role="presentation">
            <a href="/admin/application" use:link 
            class="nav-link" class:active={$location.startsWith('/admin/application')}>
                일정 관리
            </a>
        </li>
        <li class="nav-item" role="presentation">
            <a href="/admin/student" use:link class="nav-link" class:active={$location.startsWith('/admin/student')}>
                교육생 관리
            </a>
        </li>
        <li class="nav-item" role="presentation">
            <a href="/admin/program" use:link class="nav-link" class:active={$location.startsWith('/admin/program')}>
                <!-- 과정 관리 -->
                 (개발중 Don't touch)
            </a>
        </li>
        <li class="nav-item" role="presentation">
            <a href="/admin/etc" use:link class="nav-link" class:active={$location.startsWith('/admin/etc')}>
                기타 설정
            </a>
        </li>
    </ul>
</div>
<!-- END tabMenu -->

<style>
#tabList {
    top: -10px;
    width:100%;
    margin:0 auto;
}
#tabList ul {
    width:1200px;
    margin:0 auto;
}
.nav-item {
    /* width:calc(33.3333% - 10px); */
    width:calc(25% - 10px);
    text-align: center;
    font-size:22px;
    margin-left:5px;
    border-radius: 10px 10px 0 0;
    border-top:1px solid #b2b2b2;
    border-left:1px solid #b2b2b2;
    border-right:1px solid #b2b2b2;
    color:black;
}
.nav-item>a {
    color:#aaa;
}
.nav-item>a:hover {
    font-weight: 600;
    color:#000;
    border-top:1px solid #000;
    border-left:1px solid #000;
    border-right:1px solid #000;
}
.nav-tabs {
    -bs-nav-tabs-border-radius: 0;
}
.nav-link.active {
    font-weight: 700;
    color:#000;
    border-top:1px solid #000;
    border-left:1px solid #000;
    border-right:1px solid #000;
}
</style>