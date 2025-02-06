import { createRouter, createWebHistory } from "vue-router";
import GroupList from "../pages/GroupList.vue";
import GroupDetailPage from "../pages/GroupDetailPage.vue";
import ChatPage from "../pages/ChatPage.vue"; // 채팅페이지
import ChatRoomList from "../pages/ChatRoomList.vue";
import LoginPage from "../pages/LoginPage.vue";
import userinfoPage from "../pages/Userinfo.vue";
import axiosInstance from "../api/axiosInstance_test";
// import axiosInstance from "../api/axiosInstance";
import { handleOAuthCallback } from "../api/authentication";
// import LoginRequiredModal from "../components/modal/LoginPermissionRequired.vue";
// axios
// import axiosInstance from "../api/axiosInstance";

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
    path: "/oauth2Login",
    name: "oauth2Login",
    component: LoginPage, // 소셜 로그인 페이지
  },
  {
    path: "/oauth2/callback", // 콜백 라우트
    name: "OAuth2Callback",
    component: null, // 콜백은 페이지 컴포넌트가 필요 없음
    beforeEnter: async (to, from, next) => {
      alert("1");
      await handleOAuthCallback();
    },
  },
  {
    path: "/oauth2/LoginFailcallback",
    name: "oauth2LoginFailcallback",
    component: null,
    beforeEnter: async (to, from, next) => {
      const errorMessage = to.query.error; // URL에서 error 파라미터를 추출
      if (errorMessage) {
        alert(`로그인 실패: ${decodeURIComponent(errorMessage)}`);
        router.push("/oauth2Login");
      }
    },
  },
  {
    path: "/userinfoPage",
    name: "userinfoPage",
    component: userinfoPage, // 소셜 로그인 페이지
  },
  {
    path: "/chats/:chatRoomId",
    name: "ChattingRoom",
    component: ChatPage,
  },
  {
    path: "/users/:userId/chatRoomList",
    name: "ChatRoomList",
    component: ChatRoomList,
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
  "/oauth2/LoginFailcallback",
  "/userinfoPage",
  "/fileupload", // 정적인 경로
  "/groups/1",
  "/chats/1",
  "/groups/1/focusroom",
];

const publicPagePrefixList = [
  "/fileupload", // 동적인 경로 패턴
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
    await axiosInstance.get(to.path);
  } catch (error) {
    console.error("Authentication check failed:", error);
  }
});

export default router;
