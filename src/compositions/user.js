import { get_normal, post_urlFormData } from "./apiDoc";

// sso 로그인 페이지 가져오기
export const loginPage = () => get_normal("/v1/auth/page");
// 로그인
export const login = (memb) => post_urlFormData("/v1/auth/login-old", memb);
// 토큰 리프레쉬
export const tokenRefresh = (refresh_token) =>
	post_urlFormData("/v1/auth/regenerator/refresh", { refresh_token });
// 유저정보가져오기
export const getUser = () => get_normal("/v1/member/info").then((res) => res.data.data);
