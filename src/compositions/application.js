import { get_normal, post_urlFormData, put_urlFormData } from "./apiDoc";
// 프로그램조회
export const getProgram = (month) => get_normal(`/v1/application/${month}`);
// 프로그램신청(수강신청)
export const programApply = (schedule_code) => post_urlFormData("/v1/application", { schedule_code });
// 나의수강신청정보조회
export const myApplication = () => get_normal("/v1/member/application").then(({ data }) => data.data);
// 수강신청취소 사유목록
export const applyCancelList = () => get_normal("/v1/member/cancel/msg");
// 수강신청취소
export const applyCancel = (enrol_obj) => put_urlFormData("/v1/member/application", enrol_obj);
