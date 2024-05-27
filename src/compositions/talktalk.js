import {
    delete_normal,
    get_normal,
    post_formData,
    post_urlFormData,
    put_urlFormData,
} from "./apiDoc";

// 톡톡 리스트가져오기
export const getTalks = (pagingInfo) =>
    get_normal("/v1/bbs/talk/list", pagingInfo);
// 톡톡 상세조회
export const getTalk = (id) => get_normal(`/v1/bbs/talk/detail/${id}`);
// 톡톡 작성
export const setTalk = (obj) => post_formData("/v1/bbs/talk/write", obj);
// 톡톡 수정
export const updateTalk = (obj) => put_urlFormData("/v1/bbs/talk/write", obj);
// 톡톡 삭제
export const deleteTalk = (id) => delete_normal(`/v1/bbs/talk/write/${id}`);
// 톡톡 조회수
export const talkUpHit = (id) =>
    put_urlFormData(`/v1/bbs/talk/detail/count/${id}`);
// 댓글작성
export const createTalkComment = (obj) =>
    post_urlFormData("/v1/bbs/talk/comment/write", obj);
// 댓글수정
export const updateTalkComment = (obj) =>
    put_urlFormData("/v1/bbs/talk/comment/write", obj);
// 댓글 삭제
export const deleteTalkComment = (id) =>
    delete_normal(`/v1/bbs/talk/comment/write/${id}`);
// 프로그램목록 조회
export const getProgramNames = () => get_normal("/v1/program");
