<template>
  <div class="app">
    <Sidebar />
    <div class="header-layout">
      <Header />
      <main class="content">
        <h2>Welcome to My Website!</h2>
        <p>This is the main content area.</p>
        <FocusRoomTimers />
        <UserList />
      </main>
    </div>
  </div>
</template>

<script>
import Header from "./components/Header.vue";
import Sidebar from "./components/Sidebar.vue";
import UserList from "./components/UserList.vue";
import FocusRoomTimers from "./components/timer/FocusRoomTimers.vue";



export default {
  name: "App",
  components: {
    Sidebar,
    Header,
    UserList,
    FocusRoomTimers,
  },
};
</script>

<style scoped>
/* 전체 레이아웃 */
.app {
  display: flex;
}

/* Sidebar */
.sidebar {
  position: fixed; /* 화면의 고정 위치 */
  top: 0;
  left: 0;
  width: 70px;
  height: 100vh; /* 전체 화면 높이 */
  background-color: #d9d9d9;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

/* 헤더 Layout */
.header-layout {
  margin-left: 70px; /* 사이드바 너비만큼 오른쪽으로 밀림 */
  width: calc(100% - 70px); /* 사이드바를 제외한 너비 */
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  height: 70px;
  background-color: #333;
  color: white;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Main Content */
.content {
  flex: 1;
  padding: 2rem;
  background-color: #f9f9f9;
}

/* User List */

/* 유저 리스트 */
.user-list {
  position: fixed;
  top: 70px;
  right: 0px;
  width: 200px;
  height: 100%;
  background-color: #eaeaea;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}
</style>
