<script>
	import { modal_alert, modal_confirm, modal_confirm_result } from './../store/modalSlice.js';
    import { pop, push, replace } from 'svelte-spa-router';
    import Loding from '../components/common/loding.svelte';
    import "moment/locale/ko";
    import moment from 'moment/moment';
    import { grant, login_id } from '../store/userSlice';
    import { createTalkComment, deleteTalk, deleteTalkComment, getTalk, updateTalkComment } from '../compositions/talktalk.js';
    import TabMenu from '../components/common/tabMenu.svelte';
    import { uiScr } from '../compositions/scroll.js';

    export let params = {}
    $: tId = params.talkId;
    $: page = params.pageNum;
    
    let newCTxt = '';
    let commentList = [];
    // 댓글수정 textarea
    let commentModifyTxtList = [];
    const setCommentModifyTxtList = (length) => {
        commentModifyTxtList = new Array(length).fill("");
    }
    let commentIng = false; // 댓글작성중

    // 댓글작성
    const createComment_before = () => {
        if(!newCTxt.length) {
            modal_alert.open('내용이 입력되지 않았습니다.');
        } else {
            createTalkComment({
                id:tId,
                content:newCTxt.trim().replaceAll('\n', '<br>')
            }).then(({data}) => {
                commentList.push(data.data);
                commentList = commentList;
                newCTxt = '';
                uiScr.goBottom();
            });
        }
    }
    // 댓글수정
    const updateComment_before = (cId, cIndex) => {
        if(!commentModifyTxtList[cIndex]) {
            modal_alert.open('내용이 입력되지 않았습니다.');
        } else {
            updateTalkComment({
                id:cId,
                content:commentModifyTxtList[cIndex].trim().replaceAll('\n', '<br>')
            }).then(({data}) => {
                commentList[cIndex].content = commentModifyTxtList[cIndex].trim().replaceAll('\n', '<br>');
                commentList[cIndex].modify = false;
                commentList = commentList;
            })
        }
    }
    // 글삭제 시
    $: if($modal_confirm_result === 'talkDelete') {
        deleteTalk(tId).then(({data}) => {
            replace('/talktalk/1');
            $modal_confirm_result = "";
        });
    }
    // 댓글삭제 시
    $: if($modal_confirm_result.startsWith('commentTalkDelete')) {
        commentDelete();
    }
    const commentDelete = () => {
        const cIndex = $modal_confirm_result.replace('commentTalkDelete-', '');
        deleteTalkComment(commentList[cIndex].id).then(({data}) => {
            commentList = commentList.filter((v, i) => i !== Number(cIndex));
        });
    }
    // 초기 데이터 불러오기
    $:talkAwait = setTalkAwait(tId);
    const setTalkAwait = (tId) => {
        return getTalk(tId).then(({data}) => {
            setCommentModifyTxtList(data.data.comment_list.length);
            data.data.comment_list.map((v) => {
                v.modify = false;
            });
            commentList = data.data.comment_list;
            return data.data;
        }).catch(() => {
            modal_alert.open('읽기 권한이 없습니다.');
            pop();
        });
    }
</script>

<TabMenu />
<!-- BEGIN content -->
<div id="content" class="board-detail">
    {#await talkAwait}
    <Loding />
    {:then talk} 
    {#if talk}
    <!-- BEGIN panel -->
    <div class="panel panel-inverse" data-sortable-id="form-plugins-9">
        <!-- BEGIN panel-heading -->
        <div class="panel-heading">
            <h4 class="panel-title">TalkTalk</h4>
            <!-- BEGIN complete-btn -->
            <div class="complete-btn">
                {#if talk.writer_login_id === $login_id}
                <button class="btn btn-primary me-1 mb-1" 
                    on:click={() => {
                        push(`/talktalk/write/${tId}?page=${page}`)
                    }}>수정</button>
                {/if}
                {#if $grant == 90 || talk.writer_login_id === $login_id}
                <button type="button" class="btn btn-danger me-1 mb-1"
                    on:click={() => {
                        modal_confirm.open('삭제하시겠습니까?', 'talkDelete');
                    }}>삭제</button>
                {/if}
                <button type="button" class="btn btn-white me-1 mb-1"
                    on:click={() => {
                        push(`/talktalk/${page}`);
                    }}>목록으로</button>
            </div>
            <!-- END complete-btn -->
        </div>
        <!-- END panel-heading -->
        
        <!-- BEGIN panel-body -->
        <div class="panel-body p-0">
            <div class="form-horizontal form-bordered">
                <div class="form-group row">
                    <label class="form-label col-form-label col-lg-2">제목</label>
                    <div class="col-lg-10">{talk.title}</div>
                </div>
                <div class="form-group row">
                    <label class="form-label col-form-label col-lg-2">프로그램명</label>
                    <div class="col-lg-10">{talk.program_name}</div>
                </div>
                <div class="form-group row">
                    <label class="form-label col-form-label col-lg-2">등록자</label>
                    <div class="col-lg-2 flex_center">{talk.writer}</div>
                    <label class="form-label col-form-label col-lg-2 border-left-gray">등록일</label>
                    <div class="col-lg-3 flex_center" >{moment(talk.regdate).format('YYYY-MM-DD A h:mm:ss')}</div>
                    <label class="form-label col-form-label col-lg-2 border-left-gray">조회</label>
                    <div class="col-lg-1 flex_center">{talk.hit}</div>
                </div>
                <div class="form-group row">
                    <label class="form-label col-form-label col-lg-2 talk-neyong">내용</label>
                    <div class="col-lg-10 talk-content border-left-gray">
                        <div>{@html talk.content}</div>
                    </div>
                </div>
            </div>
        </div>
        <!-- END panel-body -->   
        <!-- BEGIN panel-body -->
        <div class="panel-body p-0 bg-gray-100 comment">
            <div class="opinion-view">
                {#each commentList as comment, index}
                <div class="opinion-wrap" 
                    class:my={$login_id === comment.writer_login_id} 
                    class:other={$login_id !== comment.writer_login_id}>
                    <div>
                        <p class="name">
                            {comment.writer} {moment(comment.regdate).format('YYYY-MM-DD A h:mm:ss')}
                            {#if !comment.modify}
                                {#if $login_id === comment.writer_login_id}
                                <button class="c_red"
                                    on:click={() => {
                                        comment.modify = true;
                                        commentModifyTxtList[index] = comment.content
                                        setTimeout(() =>{
                                            document.getElementById(`cTxt-${index}`).focus();
                                        }, 200);
                                }}>수정</button>
                                {/if}
                                {#if $grant == 90 || $login_id === comment.writer_login_id}
                                <button class="c_red" on:click={() => {
                                    modal_confirm.open('댓글을 삭제하시겠습니까?', `commentTalkDelete-${index}`);
                                }}>삭제</button>    
                                {/if}
                            {:else if comment.modify}
                            <button class="btn btn-primary"
                                on:click={() => {
                                    updateComment_before(comment.id, index);
                                }}>완료</button>
                            <button class="btn btn-danger"
                                on:click={() => {
                                    comment.modify = false;
                                }}>취소</button>
                            {/if}
                        </p>
                        {#if !comment.modify}
                        <p>{@html comment.content}</p>
                        {:else}
                        <textarea id={`cTxt-${index}`} bind:value={commentModifyTxtList[index]} cols="50" rows="5" />
                        {/if}
                    </div>
                </div>
                {/each}
                <div class="opinion-wrap my input-form">
                    {#if commentIng || newCTxt}
                    <div>
                        <textarea id="new-cTxt" bind:value={newCTxt}
                         cols="50" rows="3" placeholder="내용을 입력해주세요..."
                         on:blur={() => {
                            commentIng = false;
                         }}/>
                        <div class="align_right">
                            <button on:click={createComment_before} class="btn btn-default me-5px"><i class="fa fa-comment"></i> 답글달기</button>
                        </div>
                    </div>
                    {:else}
                    <div class="commentIng-btn">
                        <button on:click={() => {
                            commentIng = true;
                            setTimeout(() => {
                                document.getElementById('new-cTxt').focus();
                            }, 200);
                        }}>
                            <span>{newCTxt ? newCTxt : "내용을 입력해주세요..."}</span>
                            <span><i class="fa fa-comment"></i></span>
                        </button>
                    </div>
                    {/if}
                </div>
            </div>
        </div>
        <!-- END panel-body -->   
    </div>
    <!-- END panel -->
    {/if}
    {/await}
</div>
<!-- END content -->

<style>
.panel-title {
    font-size:25px;
}
.complete-btn {
    text-align: right;
}
.complete-btn button {
    font-size:15px;
}
.form-horizontal, .form-horizontal {
    font-size:20px;
}
.border-left-gray {
    border-left:1px solid #f1f2f3;
}
.talk-neyong {
    align-items: baseline !important;
    padding-top: 20px;
}
.talk-content>div {
    padding:10px;
}
.col-lg-8 {
    flex: 0 0 auto;
    width: 66.66666667%;
}
.col-lg-4 {
    flex: 0 0 auto;
    width: 33.33333333%;
}
.col-lg-1 {
    flex: 0 0 auto;
    width: 8.33333333%;
}
.col-lg-2 {
    flex: 0 0 auto;
    width: 16.66666667%;
}
.col-lg-3 {
    flex: 0 0 auto;
    width: 25%;
}
.form-horizontal.form-bordered .form-group .col-form-label+div {
    padding: 1rem;
    border-left:1px solid rgba(var(--bs-component-border-color-rgb),.5)
}
.form-horizontal.form-bordered .form-group .col-form-label {
    padding-bottom: 0.5rem;
}
.comment {
    border: 1px solid #dbe0e5;
    border-radius: 0 0 10px 10px;
}
</style>