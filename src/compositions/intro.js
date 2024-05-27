import { get_normal } from "./apiDoc";
// 프로그램소개 리스트 가져오기
export const getIntros = () => get_normal("/v1/introduce/info");
// 프로그램 상세조회
export const getIntroDetail = (program_code) =>
    get_normal(`/v1/introduce/detail/${program_code}`);
