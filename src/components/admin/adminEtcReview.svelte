<script>
    import { onMount } from "svelte";
    import { getProgramNames } from "../../compositions/talktalk";
    import flatpickr from 'flatpickr';
    import { modal_alert } from "../../store/modalSlice";
    import { addReview } from "../../compositions/admin";

    let programNames = []; // 프로그램명 리스트

    let review = {
        program_code: '',
        review_ring_rate:1,
        review_content:'',
        review_name: '',
        review_enrol_date: '',
    }
    const resetReview = () => {
        review = {
            program_code: '',
            review_ring_rate:1,
            review_content:'',
            review_name: '',
            review_enrol_date: '',
        }
    }

    const addReview_before = () => {
        let ment = '';
        if(!review.program_code) ment = '프로그램명';
        else if(!review.review_content.trim()) ment = '내용';
        else if(!review.review_name) ment = '성명';
        else if(!review.review_enrol_date) ment = '수강일';

        if(ment) modal_alert.open(`${ment}를(을) 입력해주세요.`);
        else {
            review.review_content = review.review_content.trim().replaceAll('\n', '<br>');
            console.log(review);
            addReview(review).then(({data}) => {
                console.log(data.msg);
                modal_alert.open('작성완료!');
                resetReview();
            });
        }
    }

    onMount(() => {
        getProgramNames().then(({data}) => {
            console.log(data.data);
            programNames = data.data;
        });
        flatpickr('#datepicker', {
            locale: {
                firstDayOfWeek: 0, // 일요일부터 시작
                weekdays: {
                    shorthand: ['일', '월', '화', '수', '목', '금', '토'],
                    longhand: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
                },
                months: {
                    shorthand: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
                    longhand: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
                },
            },
            dateFormat: 'Y-m-d',
            enabled: [
                (date) => {
                    return !(date.getDay() === 0 || date.getDay() === 6);
                }
            ],
            disable: [
                (date) => {
                    return (date.getDay() === 0 || date.getDay() === 6);
                }
            ],
        });
    });
</script>

<div id="adminEtcReview">
    <h2>수강생 후기 작성</h2>
    <!-- BEGIN form -->
    <form on:submit|preventDefault={addReview_before}>
        <!-- BEGIN panel -->
        <div class="panel panel-inverse" data-sortable-id="form-plugins-9">
            <!-- BEGIN panel-heading -->
            <div class="panel-heading">
            </div>
            <!-- END panel-heading -->
            <!-- BEGIN panel-body -->
            <div class="panel-body p-0">
                <div class="form-horizontal form-bordered">
                    <div class="form-group row">
                        <span class="form-label col-form-label col-lg-4">프로그램명</span>
                        <div class="col-lg-8">
                            <select class="form-select" bind:value={review.program_code}>
                                <option value="">---------- 프로그램명 ----------</option>
                                {#each programNames as programName}
                                <option value={programName.program_code}>{programName.program_name}</option>
                                {/each}
                            </select>
                        </div>
                    </div>
                    <div class="form-group row">
                        <span class="form-label col-form-label col-lg-4">만족도</span>
                        <div class="col-lg-2">
                            <select class="form-select" bind:value={review.review_ring_rate}>
                                <option value={1}>1</option>
                                <option value={2}>2</option>
                                <option value={3}>3</option>
                                <option value={4}>4</option>
                                <option value={5}>5</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group row">
                        <span class="form-label col-form-label col-lg-4">내용</span>
                        <div class="col-lg-8">
                            <div>
                                <textarea bind:value={review.review_content}
                                    class="qna-content form-control" rows="5" 
                                    placeholder="내용을 입력해주세요."/>
                            </div>
                        </div>
                    </div>
                    <div class="form-group row">
                        <span class="form-label col-form-label col-lg-4">성명</span>
                        <div class="col-lg-3">
                            <input type="text" class="form-control"
                                bind:value={review.review_name} placeholder="노출될 성명" />
                        </div>
                    </div>
                    <div class="form-group row">
                        <span class="form-label col-form-label col-lg-4">수강일</span>
                        <div class="col-lg-3 classdate">
                            <input type="text" class="form-control" 
                            id="datepicker" placeholder="-없음-"
                            bind:value={review.review_enrol_date}>
                            {#if review.review_enrol_date}
                            <button type="button" on:click|stopPropagation={() => review.review_enrol_date = ''}>
                                <i class="far fa-lg fa-fw me-10px fa-circle-xmark c_red"></i>
                            </button>    
                            {/if}
                            
                        </div>
                    </div>
                </div>
            </div>
            <!-- END panel-body -->
        </div>
        <!-- END panel -->
        <div class="complete-btn">
            <button class="btn btn-primary me-1 mb-1">완료</button>
        </div>
        <input
            type="file" class="form-control hide" id="qnaFile" />
    </form>
    <!-- END form -->
</div>

<style>
h2 {
    font-size:30px;
    padding:0 10px;
}
.col-lg-4 {
    flex: 0 0 auto;
    width: 33.33333333%;
}
.form-horizontal.form-bordered .form-group>div {
    padding: 1rem;
}
.form-horizontal.form-bordered .form-group .col-form-label+div {
    border-left: 1px solid rgba(var(--bs-component-border-color-rgb),.5);
}
.form-horizontal.form-bordered .form-group .col-form-label {
    padding: 1rem;
    display: flex;
    align-items: center;
}
.complete-btn {
    text-align: right;
}
.complete-btn button {
    font-size:20px;
    padding:10px 30px;
}
.form-horizontal, .form-horizontal input, .form-horizontal, .form-horizontal textarea {
    font-size:20px;
}
.form-select {
    font-size: 20px;
}
.classdate {
    position: relative;
}
.classdate>button {
    position: absolute;
    top:23px;
    right:10px;
}
</style>