import { writable } from "svelte/store";
import { cookies } from "../cookies";
import { getUser, tokenRefresh } from "../compositions/user";
import { modal_alert } from "./modalSlice";
import { push, replace } from "svelte-spa-router";

export const loginOn = create_login();
export const userName = writable("");
export const grant = writable(false);
export const login_id = writable("");

function create_login() {
    const { subscribe, set } = writable(false);
    let setUserIng = false;

    const login = async (aToken, rToken, adminStatus) => {
        if (adminStatus) adminReToken(aToken, rToken);
        else reToken(aToken, rToken);
        set(true);
    };
    const reToken = (aToken, rToken) => {
        cookies.set("access_token", aToken, 60 * 10);
        cookies.set("refresh_token", rToken, 60 * 30);
    };
    const adminReToken = (aToken, rToken) => {
        console.log("adminReToken");
        cookies.set("access_token", aToken, 60 * 10);
        cookies.set("refresh_token", rToken, 60 * 180);
    };
    const setUser = (userInfo) => {
        userName.set(userInfo.name);
        grant.set(userInfo.grant);
        login_id.set(userInfo.login_id);
    };
    const resetUser = () => {
        userName.set("");
        grant.set(false);
        login_id.set("");
    };
    const setHeaderUserName = async () => {
        await getUser().then((userInfo) => {
            setUser(userInfo);
            setUserIng = false;
        });
    };
    const logout = () => {
        cookies.remove("access_token");
        cookies.remove("refresh_token");
        set(false);
        modal_alert.open("로그아웃 되었습니다.");
        resetUser();
        push("/");
    };
    const getAtoken = () => cookies.get("access_token");
    const getRtoken = () => cookies.get("refresh_token");

    const tokenCheck = async () => {
        const aToken = getAtoken();
        const rToken = getRtoken();
        let lOn = false;
        subscribe((val) => {
            lOn = val;
        });
        if (lOn) {
            if (!rToken) {
                logout();
                // 로그아웃시키기
            } else if (!aToken && rToken) {
                await tokenRefresh(rToken)
                    .then(({ data }) => {
                        if (data.data.exception === "ADMIN") {
                            adminReToken(
                                data.data.access_token,
                                data.data.refresh_token
                            );
                        } else {
                            reToken(
                                data.data.access_token,
                                data.data.refresh_token
                            );
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
            userName.subscribe((value) => {
                if (lOn && !value && !setUserIng) {
                    setUserIng = true;
                    setHeaderUserName();
                }
            });
        } else {
            modal_alert.open("로그아웃 되었습니다.");
            resetUser();
            replace("/");
        }
    };

    return {
        subscribe,
        login,
        setHeaderUserName,
        resetUser,
        getAtoken,
        getRtoken,
        set,
        tokenCheck,
        logout,
    };
}
