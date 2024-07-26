<!-- 과정관리 -->
<script>
	import { link, push } from 'svelte-spa-router';
	import { onDestroy, onMount } from 'svelte';
	import { programIntroScrTop } from '../../store/moduleSlice';
	import { getIntros } from '../../compositions/intro';
	import { uiScr } from '../../compositions/scroll';
	import Loding from '../common/loding.svelte';
	import { programStore } from '../../store/adminSlice';

  // 비동기변수
  let introAwait = null;
  // 요소 완성 체크
  let completeCheck = null;
  //
  let categoryList = [];
  let categoryLeng = 0;

  let scrollEvent = null;

    $:if(completeCheck) {
        window.addEventListener('scroll', scrollEvent);
    }
    onMount(async () => {
        introAwait = await getIntros().then(({data}) => {
            console.log(data);
            categoryLeng = Object.values(data.data).length;
            categoryList = Object.values(data.data).map((v) => v.title);
            scrollEvent = uiScr.programIntroScroll.bind(window, categoryLeng);
            return Object.values(data.data);
        });
    });
    onDestroy(() => {
        window.removeEventListener('scroll', scrollEvent);
    });

</script>

<!-- BEGIN #content -->
<div id="adminProgram">
  {#await introAwait}
  <Loding />
  {:then programInfo}
  {#if programInfo}
  <!-- BEGIN pos -->
  <div class="pos" id="pos">
      <!-- BEGIN pos-content -->
      <div class="pos-content">
          <div class="add-btn">
            <button class="plus-data btn btn-info"
                on:click={() => {
                    programStore.set({
                        categoryList,
                    });
                    push(`/admin/program/add`)
                }}>과정<i class="fas fa-plus s-OGOsEul36LS3"></i></button>
          </div>
          <div class="pos-content-container h-100">
              {#each programInfo as program, index}
              <h3 id={`content${index + 1}`}>{program.title}</h3>
              <div class="product-row">
                  {#each program.list as pro, proIndex}
                  <div class="product-container" data-type="meat">
                      <a href={"/admin/program/" + pro.program_code}
                      use:link class="product program" data-bs-toggle="modal" data-bs-target="#modalPos"
                        on:click={() => {
                          programStore.set({
                            program_category:program.title,
                            ...pro,
                            categoryList,
                            ordering: proIndex + 1,
                            ordering_list: program.list,
                          })
                        }}
                      >
                          <div class="img" style={`background-image: url(${pro.program_header_img_url_v2})`}></div>
                          <div class="program-info">
                              <h4 style={`color:${program.color}`}>{program.title}</h4>
                              <h2>{pro.program_name}</h2>
                          </div>
                          <div class="c_gray">{pro.program_hash_tag}</div>
                          {#if pro.program_new_label === 'Y'}
                          <div class="new_bat">NEW</div>
                          {/if}
                      </a>
                  </div>
                  {/each}
              </div>
              {#if index < programInfo.length - 1}
              <hr>
              {/if}
              {/each}
              <div class="hide" bind:this={completeCheck}></div>
          </div>
      </div>
      <!-- END pos-content -->
  </div>
  <!-- END pos -->
  

  <!-- BEGIN quick -->
  <aside id="quick">
      <div class="section-container">
          <h4 class="section-title"><span>Quick</span></h4>
          <ul class="sidebar-list">
              <!-- <li><a>추천 강의</a></li> -->
              {#each programInfo as program, index}
              <li><a class:active={index === 0} on:click|preventDefault={() => uiScr.programQuickScroll(index + 1)} >{program.title} ({program.list.length})</a></li>
              {/each}
          </ul>
      </div>
  </aside>
  <!-- END quick -->
  {/if}
  {/await}
</div>
<!-- END #content -->

<style>
  #adminProgram {
      display: flex;
  }
  #pos {
      width:1200px;
      margin:0 auto;
  }
  .add-btn {
    padding: 10px 20px 0 20px;
    text-align: right;
  }
  .add-btn>button {
    font-size:30px;
  }
  #quick {
      position: relative;
  }
  .pos:before {
      display: none;
  }
  .pos-content-container h3 {
      font-weight: 700;
      font-size: 24px;
      color: #666;
      padding:0 10px;
  }
  .pos .product-row .product-container {
      position: relative;
      width: 25%;
  }
  .pos .product-row .product-container .new_bat {
      position: absolute;
      top:15px;
      left:20px;
      z-index:10;
      background-color: yellow;
      border-radius: 8px;
      padding:0 10px;
      color:#333;
      font-weight: bolder;
  }
  .pos .program {
      padding:10px;
  }
  .pos .program .img {
      width:100%;
      background-size: cover;
      background-repeat: no-repeat;
  }
  .pos .program .program-info h4 {
      color:#32bd93;
      font-size:14px;
      font-weight: 900;
      padding:15px 0 2px;
  }
  .pos .program .program-info h2 {
      font-size: 23px;
      font-weight: 600;
      letter-spacing: 0px;
      word-break: keep-all;
  }
  .section-container {
      width: 180px;
      padding: 10px;
      border: 1px solid black;
      border-radius: 21px;
      position: absolute;
      top: 90px; 
      margin-left:10px;
  }
  .section-title {
      font-size: .875rem;
      line-height: 1.5;
      text-align: center;
      margin: 0 0 15px;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: .5px;
      color: var(--bs-component-color);
      position: relative;
  }
  .section-title:before {
      content: "";
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--bs-component-color);
      margin-top: -1px;
  }
  .section-title span {
      padding: 0 10px;
      background: var(--bs-body-bg);
      position: relative;
      font-size:15px;
  }
  .sidebar-list {
      list-style-type: none;
      margin: 0;
      padding: 0;
      font-size: 15px;
      line-height: 1.5;
  }
  .sidebar-list li a {
      display: block;
      color: var(--bs-component-color);
      border-bottom: 1px solid var(--bs-component-border-color);
      padding: 10px 0;
      text-decoration: none;
  }
  .sidebar-list li a:hover {
      text-decoration: underline;
  }
  @media (prefers-reduced-motion: no-preference) {
      :root {
          scroll-behavior: auto;
      }
  }
  .sidebar-list li a.active {
      text-decoration: underline;
  }
  </style>