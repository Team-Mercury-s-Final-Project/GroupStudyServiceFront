import { createRouter, createWebHistory } from "vue-router";
import GroupList from "../pages/GroupList.vue";
import GroupDetailPage from "../pages/GroupDetailPage.vue";
import FocusRoomPage from "../pages/FocusRoomPage.vue";
import LoginPage from "../pages/LoginPage.vue";
import userinfoPage from "../pages/Userinfo.vue";
import axiosInstance from "../api/axiosInstance";
import { handleOAuthCallback } from "../api/authentication";

const routes = [

  {
    path: "/",
    name: "Home",
    component: GroupList, // 기본 페이지
  },

  {
    path: "/groups/:groupId", // :groupId로 pathVariable 정의
    name: "GroupDetail",
    component: GroupDetailPage,
    meta: { showUserList: true, showToggleButton: true },
  },
  {
    path: "/groups/:groupId/focusroom",
    name: "FocusRoom",
    component: FocusRoomPage,
  },
  {
    path: "/oauth2Login",
    name: "oauth2Login",
    component: LoginPage, // 소셜 로그인 페이지
  },
  {
    path: "/oauth2/callback", // 콜백 라우트
    name: "OAuth2Callback",
    component: null, // 콜백은 페이지 컴포넌트가 필요 없음
    beforeEnter: async (to, from, next) => {
      await handleOAuthCallback();
    },
  },
  {
    path: "/userinfoPage",
    name: "userinfoPage",
    component: userinfoPage, // 소셜 로그인 페이지
  },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 요청 블랙리스트
const publicPageList = [
  "/",
  "/oauth2Login",
  "/oauth2/callback",
  "/userinfoPage",
  "/fileupload", // 정적인 경로
];
const publicPagePrefixList = [
  "/fileupload", // 동적인 경로 패턴
  "/groups",
];

function isPublicPage(path) {
  // 정적 경로 체크
  if (publicPageList.includes(path)) {
    return true;
  }
  // 동적 경로 패턴 체크
  for (let prefix of publicPagePrefixList) {
    if (path.startsWith(prefix)) {
      return true;
    }
  }
  return false;
}

// 라우팅 변화 시마다 API 요청을 보낼 수 있도록 설정
router.beforeEach(async (to, from, next) => {
  // 인증 필요 없는 경로는 API 요청 제외
  if (isPublicPage(to.path)) {
    next();
    return;
  }
  try {
    // 인증이 필요한 경로에 대해 API 요청
    await axiosInstance.get(to.path); // 인증 상태 확인용 API
    next(); // 인증 성공 시 라우팅 계속 진행
  } catch (error) {
    console.error("Authentication check failed:", error);
    // 인증 실패 시 로그인 페이지로 리다이렉트
    if (to.path !== "/oauth2Login") {
      next("/oauth2Login");
    } else {
      next();
    }
  }
});

export default router;
