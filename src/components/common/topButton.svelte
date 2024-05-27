<script>
    import { onMount } from "svelte";
    import { uiScr } from "../../compositions/scroll";

    onMount(() =>{
        uiScr.scrollTopBtn();
    });
</script>

<div id="topButton">
    <div class="top">
        <button on:click={uiScr.goTop}>
            <i class="bi bi-arrow-up-circle-fill fs-40px"></i>
        </button>
    </div>
    <div class="bottom">
        <button>
            <i class="bi bi-arrow-down-circle-fill fs-40px"></i>
        </button>
    </div>
</div>

<style>
    #topButton {
        display: none;
        position:fixed;
        right:20px;
        bottom:30px;
        z-index:500;
    }
    #topButton .bottom {
        display: none;
    }
    body.is-bottomBtn #topButton .bottom {
        display: block;
    }
</style>