import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../pages/HomePage.vue";
import GroupList from "../pages/GroupList.vue";
import NextPage from "../pages/NextPage.vue";
import GroupDetailPage from "../pages/GroupDetailPage.vue";
import TestPage from "../pages/TestPage.vue"; // TestPage를 import
import ChatPage from "../pages/ChatPage.vue"; // 채팅페이지

const routes = [
  // {
  //   path: "/",
  //   name: "Home",
  //   component: HomePage, // 기본 페이지
  // },
  {
    path: "/",
    name: "Home",
    component: GroupList, // 기본 페이지
  },
  {
    path: "/next",
    name: "Next",
    component: NextPage, // 버튼을 통해 이동할 페이지
  },
  {
    path: "/groups/:groupId", // :groupId로 pathVariable 정의
    name: "GroupDetail",
    component: GroupDetailPage,
    meta: {showUserList: true, showToggleButton: true}
  },
  {
    path: "/test",
    name: "Test",
    component: TestPage, // front - back data 통신 테스트용 페이지
  },
  {
    path: "/chats/:chatRoomId",
    name: "ChattingRoom",
    component: ChatPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
