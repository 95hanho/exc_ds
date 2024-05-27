<script>
	import { location } from 'svelte-spa-router';
	import { fade } from 'svelte/transition';
    import { onDestroy, onMount } from "svelte";
    import { getStudentsSearch } from '../../compositions/admin';
    import { modal_confirm, modal_confirm_result } from '../../store/modalSlice';

    export let closeModalUserSearch;
    export let searchComplete;
    export let desangStudent;
    export let user;
    $: searchOn = Object.keys(user).length > 0; // 검색데이터가 있는지
    
    let initUserSearchAwait = null;
    
    let type = 'name';
    let searchTxt = ""; // 검색텍스트
    let searchTxtEle = null; // 검색텍스트요소
    let allUserList = [];
    let userList = [];
    let searchResult = []; // 검색결과 tr
    let initFocus = true; // 처음 한 번만
    let userListComplete = null; // 검색리스트 완성 시
    let store_user = {};

    let regexpResult = null; // 정규식거친 검색텍스트
    const regexp = /[가-힣a-zA-Z0-9]+/g;
    $: regexpResult = searchTxt.match(regexp);
    $: regWord = ((type === 'name' || type === 'login_id') && regexpResult && regexpResult.join('').length >= 2)
    || ((type === 'insa_number') && regexpResult && regexpResult.join('').length >= 3)
    || ((type === 'hp') && regexpResult && regexpResult.join('').length >= 4)
        ? regexpResult.join('') : '';

    $: searchPlaceHolder = () => {
        switch(type) {
            case 'name' : return '두 글자';
            case 'login_id' : return '두 글자';
            case 'insa_number' : return '세 글자';
            case 'hp' : return '앞 세글자 제외(ex: 010) 네 글자';
        }
    }

    const listReset = () => {
        allUserList = [];
        userList = [];
        storeWord = "";
        initUserSearchAwait = null;
    }

    let storeWord = ""; // 서버요청 글자 달라지면 저장
    // 기준텍스트 길이 되면 검색함 && 그 이상 텍스트 수는 필터링
    const getStudentsSearch_before = async () => {
        let keyword = "";
        if((type === 'name' || type === 'login_id') && regWord.length >= 2)
            keyword = regWord.substring(0, 2);
        else if(type === 'insa_number' && regWord.length >= 3)
            keyword = regWord.substring(0, 3);
        else if(type === 'hp' && regWord.length >= 4)
            keyword = regWord.substring(0, 4);
        if(keyword && keyword !== storeWord) {
            listReset();
            storeWord = keyword;
            console.log(type, keyword);
            initUserSearchAwait = await getStudentsSearch({type, keyword}).then(({data}) => {
                console.log(data.data);
                allUserList = data.data;
                return data.data;
            });
        }
        userList_filter();
    }
    $: if(regWord && type) getStudentsSearch_before();
    else listReset();

    // 검색결과 필터링
    const userList_filter = () => {
        userList = allUserList.filter((v) => {
            const attr = `member_${type}`;
            if(v[attr].replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, '').includes(regWord)) return true;
            return false;
        });
    }
    $:if(userListComplete && initFocus && user.storeIndex !== undefined) {
        initFocus = false;
        searchResult[user.storeIndex].focus();
    }
    // 방향키↓ 시
    const searchFocus = (e, index) => {
        if(e.key === 'Escape') {
            e.preventDefault();
            closeModalUserSearch();
        } else if(e.key === 'ArrowUp') {
            e.preventDefault();
            if(searchResult[index - 1]) {
                searchResult[index - 1].focus();
            } else if(index === 0) {
                searchTxtEle.focus();
            }
        } else if(e.key === 'ArrowDown') {
            e.preventDefault();
            if(searchResult[index + 1]) {
                searchResult[index + 1].focus();
            }
        }
    }
    // 검색완료된 tr 선택
    const searchPick = (resultUser, index) => {
        if($location.startsWith('/admin/student')) {
            searchComplete({...resultUser, storeTxt: searchTxt, storeType: type, storeIndex: index}, 'searchComplete');
            closeModalUserSearch();
        } else {
            if(desangStudent) {
                store_user = resultUser;
                modal_confirm.open(
                `<span class="c_green">${desangStudent}</span><br>신청자를<br>
                <span class="c_blue">
                ${resultUser.member_name}/${resultUser.member_login_id}/${resultUser.member_insa_number}/${resultUser.member_hp}
                </span>
                <br>신청자로<br>변경하시겠습니까??`, 'applyStudentChange');
            } else {
                searchComplete(resultUser, 'applyAdminStudent');
                closeModalUserSearch();
            }
        }
    }
    $:if($modal_confirm_result === 'applyStudentChange') {
        searchComplete(store_user, 'applyStudentChange');
        closeModalUserSearch();
        $modal_confirm_result = '';
    }
    onMount(() => {
        document.body.classList.add('modal-open');
        if(user.storeIndex) {
            setTimeout(() => {
                searchResult[user.storeIndex].focus();
            }, 500);
        } else {
            searchTxtEle.focus();
        }
        if(searchOn && user.storeTxt && $location.startsWith('/admin/student')) {
            searchTxt = user.storeTxt;
            type = user.storeType;
        }
    });
    onDestroy(() => {
        document.body.classList.remove('modal-open');
    });
</script>

<div id="getStudentsSearch" class="modal" in:fade={{duration: 400}} out:fade={{duration: 400}}>
    <div
        class="modal-background"
    ></div>
    <div class="search_wrap">
		<div class="app-header">
            <div class="navbar-nav">
                <div class="search_kind navbar-item navbar-form">
                    <select class="form-select" bind:value={type}
                        on:change={() => {
                            // searchTxt = "";
                            // listReset();
                        }}>
                        <option value="name">이름</option>
                        <option value="login_id">아이디</option>
                        <option value="insa_number">사번</option>
                        <option value="hp">휴대폰</option>
                    </select>
                </div>
                <div class="search_input navbar-item navbar-form">
                    <div class="form-group">
                        <input type="text" class="form-control" 
                            bind:value={searchTxt}
                            bind:this={searchTxtEle}
                            placeholder={searchPlaceHolder() + " 이상 입력해주세요."}
                            on:keydown={(e) => searchFocus(e, -1)} 
                            />
                        <button type="button" class="btn btn-search"><i class="fa fa-search"></i></button>
                    </div>
                </div>
            </div>
            <div class="modal-btn_wrap">
                <button
                type="button"
                class="modal_close"
                on:click={closeModalUserSearch}
                >
                닫기
                </button>
            </div>
        </div>
        {#await initUserSearchAwait then list}
        {#if list && list?.length === 0}
        <p>검색결과가 없습니다.</p>
        {:else if list && list?.length > 0}
        <div>
            <!-- BEGIN panel -->
            <div class="panel panel-inverse" data-sortable-id="table-basic-1">
                <!-- BEGIN panel-body -->
                <div class="panel-body">
                    <!-- BEGIN table-responsive -->
                    <div class="table-responsive">
                        <table class="user_table table mb-0">
                            <thead>
                                <tr>
                                    <th>No.</th>
                                    <th>이름</th>
                                    <th>아이디</th>
                                    <th>사번</th>
                                    <th>휴대폰</th>
                                </tr>
                            </thead>
                        </table>
                        <div id="scroll_table" class="scroll_table">
                            <table class="user_table table mb-0">
                                <tbody>
                                    {#each userList as resultUser, index}
                                    <tr>
                                        <td>
                                            {index + 1}
                                            <button class="tr_focus" bind:this={searchResult[index]}
                                                on:click|preventDefault={() => searchPick(resultUser, index)}
                                                on:keydown|preventDefault={(e) => {
                                                    if(e.key == 'Enter') searchPick(resultUser, index);
                                                    else searchFocus(e, index);
                                                }}>검색결과선택</button>
                                        </td>
                                        <td>{resultUser.member_name}</td>
                                        <td>{resultUser.member_login_id}</td>
                                        <td>{resultUser.member_insa_number}</td>
                                        <td>
                                            {resultUser.member_hp}
                                            {#if index === userList.length - 1}
                                            <div style="visibility: hidden;" bind:this={userListComplete}></div>
                                            {/if}
                                        </td>
                                    </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <!-- END table-responsive -->
                </div>
                <!-- END panel-body -->
            </div>
            <!-- END panel -->
        </div>
        {/if}
        {/await}
    </div>
</div>

<style>
#getStudentsSearch {
    z-index:1021;
}
.search_wrap {
    position: relative;
    width:800px;
    min-height: 200px;
    background-color: #fff;
    z-index:1022;
    padding:20px;
    border-radius: 10px;
}
.search_wrap .app-header {
    box-shadow: none;
}
.navbar-item {
    width:auto;
    padding:0;
    margin: 8px 0;
}
.search_kind {
    margin-right: 10px;
}
.search_input {
    width:500px;
}
.search_kind select {
    height: 100%;
    font-size:20px
}
.user_table th, .user_table td {
    width:23%;
    text-align: center;
}
.user_table th:first-child, .user_table td:first-child {
    width:8%;
}
.user_table tbody tr {
    position:relative;
}
.user_table tbody tr .tr_focus {
    position: absolute;
    top:0;
    left:0;
    width:100%;
    height: 100%;
    font-size:0;
}
.user_table tbody tr .tr_focus:hover, .user_table tbody tr .tr_focus:focus {
    cursor: pointer;
    border:3px solid darkgray;
}
.user_table tbody tr .tr_focus:focus {
    background-color: rgba(255, 255, 0, 0.1);
    border:3px solid black;
}
.scroll_table {
    max-height: 410px;
    overflow-y: scroll;
}
</style>