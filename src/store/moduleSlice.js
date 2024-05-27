import { writable } from "svelte/store";
// 전체 화면 로딩
export const onAllLoding = writable(false);
// 전체과정 프로그램 스크롤위치
export const programIntroScrTop = writable(0);
