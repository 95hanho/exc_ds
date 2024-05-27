import { wrap } from "svelte-spa-router/wrap";
import Main from "./views/main.svelte";
import Program from "./views/programIntro.svelte";
import ProgramDetail from "./views/programDetail.svelte";
import Application from "./views/application.svelte";
import Talktalk from "./views/talktalk.svelte";
import TalktalkAdd from "./views/talktalkAdd.svelte";
import TalktalkDetail from "./views/talktalkDetail.svelte";
import TalktalkModify from "./views/talktalkModify.svelte";
import Notice from "./views/notice.svelte";
import NoticeAdd from "./views/noticeAdd.svelte";
import NoticeQnaAdd from "./views/noticeQnaAdd.svelte";
import NoticeDetail from "./views/noticeDetail.svelte";
import NoticeModify from "./views/noticeModify.svelte";
import NoticeQnaModify from "./views/noticeQnaModify.svelte";
import Admin from "./views/admin.svelte";
import Ready from "./views/ready.svelte";
import NotPage from "./views/notPage.svelte";
import { loginOn } from "./store/userSlice";
import { getUser } from "./compositions/user";
import { replace } from "svelte-spa-router";
import { modal_alert } from "./store/modalSlice";

// 로그인 페이지에 토큰체크 & 헤더네임가져오기
const loginUrlCheck = async () => {
    await loginOn.tokenCheck();
};
// 관리자 권한 검사
const adminCheck = async () => {
    let result = false;
    await getUser().then((userInfo) => {
        result = userInfo.grant;
        if (!result) {
            modal_alert.open("관리자 권한이 필요합니다.");
            replace("/");
        }
    });
    return result;
};
const talktalk = {
    "/talktalk/write/:talkId": wrap({
        asyncComponent: async () => {
            await loginUrlCheck();
            return TalktalkModify;
        },
    }),
    "/talktalk/write": wrap({
        asyncComponent: async () => {
            await loginUrlCheck();
            return TalktalkAdd;
        },
    }),
    "/talktalk/:pageNum/:talkId": wrap({
        asyncComponent: async () => {
            await loginUrlCheck();
            return TalktalkDetail;
        },
    }),
    "/talktalk/:pageNum": wrap({
        asyncComponent: async () => {
            await loginUrlCheck();
            return Talktalk;
        },
    }),
};
const notice = {
    "/notice/notice-write/:noticeId": wrap({
        asyncComponent: async () => {
            await loginUrlCheck();
            if (!(await adminCheck())) return;
            return NoticeModify;
        },
    }),
    "/notice/notice-write": wrap({
        asyncComponent: async () => {
            await loginUrlCheck();
            if (!(await adminCheck())) return;
            return NoticeAdd;
        },
    }),
    "/notice/write/:qnaId": wrap({
        asyncComponent: async () => {
            await loginUrlCheck();
            return NoticeQnaModify;
        },
    }),
    "/notice/write": wrap({
        asyncComponent: async () => {
            await loginUrlCheck();
            return NoticeQnaAdd;
        },
    }),
    "/notice/:pageNum": wrap({
        asyncComponent: async () => {
            await loginUrlCheck();
            return Notice;
        },
    }),
    "/notice/:pageNum/:noticeId": wrap({
        asyncComponent: async () => {
            await loginUrlCheck();
            return NoticeDetail;
        },
    }),
};

const router = {
    "/": wrap({
        asyncComponent: async () => {
            loginOn.subscribe((value) => {
                if (value) loginUrlCheck();
            });
            return Main;
        },
    }),
    /*  */
    "/program": wrap({
        asyncComponent: async () => {
            await loginUrlCheck();
            return Program;
        },
    }),
    "/program/:pNum": wrap({
        asyncComponent: async () => {
            await loginUrlCheck();
            return ProgramDetail;
        },
    }),
    /*  */
    "/application/:viewForm": wrap({
        asyncComponent: async () => {
            await loginUrlCheck();
            return Application;
        },
    }),
    /*  */
    ...talktalk,
    /*  */
    ...notice,
    /*  */
    "/admin/:menu": wrap({
        asyncComponent: async () => {
            await loginUrlCheck();
            if (!(await adminCheck())) return;
            return Admin;
        },
    }),
    // 개발중 페이지
    "/ready": wrap({
        asyncComponent: async () => {
            return Ready;
        },
    }),
    // 없는 페이지
    "/notPage": wrap({
        asyncComponent: async () => {
            return NotPage;
        },
    }),
    // 12321
    "/*": wrap({
        asyncComponent: () => {
            replace("/notPage");
            return null;
        },
    }),
};

export default router;
