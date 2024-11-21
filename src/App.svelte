<script>
	import { onAllLoding } from './store/moduleSlice.js';
	import { loginOn, userName } from './store/userSlice.js';
	import Modal from './components/modal/modal.svelte';
    import Header from "./components/common/header.svelte";
    import Nav from "./components/common/nav.svelte";
    import Router, { location } from 'svelte-spa-router';
    import routes from './router';
    import Footer from './components/common/footer.svelte';
    import TopButton from './components/common/topButton.svelte';
    import { onMount } from 'svelte';
    import { ui } from './compositions/ui.js';
    import AllLoding from './components/common/allLoding.svelte';

    if(loginOn.getRtoken()) {
        $loginOn = true;
    }

    $: noImage = $location.startsWith('/notice') 
    || $location.startsWith('/admin')
    || $location.startsWith('/manager')
    || $location.startsWith('/talktalk/write')
    || $location.startsWith('/notPage');

    onMount(() => {
        ui.tapTitle();
    });
</script>

<style>
.wrapper {
    /* font-family: 'Courier New', Courier, monospace; */
}
.wrapper {
    min-width:1200px;
    background-color: #fff;
}
#section {
    min-height: calc(100vh - 443px);
}
#section.main {
    min-height: calc(100vh - 531px);
}
#section.noImage {
    min-height: calc(100vh - 172px);
}
</style>

<div class="wrapper">
<!-- BEGIN #loader -->
<!-- <div id="loader" class="app-loader">
    <span class="spinner"></span>
</div> -->
<!-- END #loader -->

    {#if !$location.startsWith('/ready')}
    <Header />

    <Nav onNoImage={noImage}/>
    {/if}

    <section id="section" class:main={$location === '/'} 
        class:noImage={noImage}>
        <Router {routes} />
    </section>

    <Footer />

    <TopButton />

    <Modal />

    {#if $onAllLoding}
    <AllLoding />
    {/if}

</div>
