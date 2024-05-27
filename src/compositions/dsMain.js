import { get_normal } from "./apiDoc";
// 메인페이지 필요정보
export const mainInit = () => get_normal("/v1/main/latest");
