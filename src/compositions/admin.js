import { delete_normal, get_download, get_normal, post_formData, post_json, post_urlFormData, put_urlFormData } from "./apiDoc";

/* 프로그램리스트 */
// 관리자 프로그램리스트 조회
export const getAdminApp = (year, month) => get_normal(`/v1/expert/application/${year}/${month}`);
// 강의 정보수정
export const setAdminApp = (obj) => put_urlFormData("/v1/expert/schedule/info", obj);
// 강의 프로그램 차수 등록
export const addProgramSchedules = (obj) => post_json("/v1/expert/schedule/info", obj);
// 체크강의 설정
export const actionCheckedPrograms = (obj) => get_download("/v1/expert/control/user", obj);
/* 프로그램리스트->수강생리스트 */
// 관리자 프로그램 신청인원 조회
export const getAdminAppStudents = (obj) => get_normal("/v1/expert/user/enrollment", obj);
// 출결변경
export const setPresent = (obj) => post_urlFormData("/v1/expert/attendance/info", obj);
// 관리자 수강신청자 변경
export const setEnrollStudent = (obj) => put_urlFormData("/v1/expert/user/enrollment", obj);
// 신청명단 삭제
export const deleteEnrollStudent = (obj) => delete_normal("/v1/expert/user/enrollment", obj);
/*  */
// 유저 검색
export const getStudentsSearch = (obj) => get_normal("/v1/expert/member/search", obj);
// 교육생 정보 가져오기
export const getStudentInfo = (obj) => get_normal("/v1/expert/member/info", obj);
// 교육색 정보 수정하기
export const setStudentInfo = (obj) => put_urlFormData("/v1/expert/member/info", obj);
// 교육생 과정차수 등록 해주기
export const adminAppRegist = (obj) => post_urlFormData("/v1/expert/member/info", obj);
/*  */
// 과정추가
export const addProgram = (obj) => post_formData("/v1/expert/program/write", obj);
// 과정수정
export const setProgram = (obj) => post_formData("/v1/expert/program/modify", obj);
/*  */
// 기본 설정 정보 가져오기
export const getInitMonth = () => get_normal("/v1/expert/other/main");
// 기본 월 설정
export const setInitMonth = (obj) => post_urlFormData("/v1/expert/other/month", obj);
// 취소 사유 목록 엑셀다운로드
export const cancelListDownload = (obj) => get_download("/v1/expert/other/excel/cancel", obj);
// 메인팝업 설정 가져오기
export const getMainPopup = () => get_normal("");
// 메인팝업 설정 수정
export const setMainPopup = (obj) => post_formData("/v1/expert/other/popup", obj);
// 메인팝업 기존 파일삭제
export const deleteMainPopup = (id) => delete_normal("");
// 수강생 후기 작성
export const addReview = (obj) => post_urlFormData("/v1/expert/other/review", obj);
