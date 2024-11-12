import { delete_normal, get_normal, post_formData, post_urlFormData, put_urlFormData } from "./apiDoc";

// 공지QnA 리스트가져오기
export const getNotices = (pagingInfo) =>
	get_normal("/v1/bbs/notice/list", pagingInfo).then((res) => {
		console.log(res);
		return res;
	});
// 공지QnA 상세조회
export const getNotice = (id) =>
	get_normal(`/v1/bbs/notice/detail/${id}`).then((res) => {
		console.log(res);
		return res;
	});
// 공지QnA 작성
export const addQna = (obj) =>
	post_formData("/v1/bbs/notice/write", obj).then((res) => {
		console.log(res);
		return res;
	});
// 공지QnA 파일업로드
export const noticeFileUpload = (obj) =>
	post_formData("/v1/bbs/notice/file", obj).then((res) => {
		console.log(res);
		return res;
	});
// 공지QnA 수정
export const updateNoticeQna = (obj) =>
	put_urlFormData("/v1/bbs/notice/write", obj).then((res) => {
		console.log(res);
		return res;
	});
// 공지QnA 파일삭제요청
export const noticeFileDelete = (id) =>
	delete_normal(`/v1/bbs/notice/file/${id}`).then((res) => {
		console.log(res);
		return res;
	});
// 공지QnA 삭제
export const deleteNoticeQna = (id) =>
	delete_normal(`/v1/bbs/notice/write/${id}`).then((res) => {
		console.log(res);
		return res;
	});
// 공지QnA 조회수
export const noticeQnaUpHit = (id) =>
	put_urlFormData(`/v1/bbs/notice/detail/count/${id}`).then((res) => {
		console.log(res);
		return res;
	});
// 답글작성
export const createQnaComment = (obj) =>
	post_urlFormData("/v1/bbs/notice/comment/write", obj).then((res) => {
		console.log(res);
		return res;
	});
// 답글수정
export const updateQnaComment = (obj) =>
	put_urlFormData("/v1/bbs/notice/comment/write", obj).then((res) => {
		console.log(res);
		return res;
	});
// 답글 삭제
export const deleteQnaComment = (id) =>
	delete_normal(`/v1/bbs/notice/comment/write/${id}`).then((res) => {
		console.log(res);
		return res;
	});
