import axios from "axios";
import { push } from "svelte-spa-router";
import { loginOn } from "./store/userSlice";
import { modal_alert } from "./store/modalSlice";

const instance = axios.create({
  baseURL: "https://ds-api.exc.co.kr",
});
// 토큰체크 안하는 url
const notTokenCheckUrl = [
  "/v1/auth/page", // 삼성로그인페이지가져오기
  "/v1/auth/login-old", // 로그인
  "/v1/auth/regenerator/refresh", // 토큰리프레시
  "/v1/main/latest", // 메인 이닛
];
let setUserIng = false;

instance.interceptors.request.use(
  async (res) => {
    // console.log(res.url);
    // res.url = hostUrl + res.url;
    // console.log(res.url, res.data);
    if (!notTokenCheckUrl.includes(res.url)) {
      await loginOn.tokenCheck();
    }
    const aToken = loginOn.getAtoken();
    if (aToken) res.headers["Expert-Access"] = aToken;

    return res;
  },
  (err) => {
    return Promise.reject(err.response);
  }
);

instance.interceptors.response.use(
  (res) => {
    return res;
  },
  (err) => {
    console.log(err);
    if (err.response.status === 401) {
      loginOn.logout();
      modal_alert.open("로그인 정보가 유효하지 않습니다.");
      push("/");
      return;
    }
    return Promise.reject(err.response.data?.msg);
  }
);

export default instance;

// 403
