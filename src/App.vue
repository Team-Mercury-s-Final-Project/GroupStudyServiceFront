<template>
  <div class="layout">
    <Header />
    <div class="main">
      <Sidebar />
      <main class="content">
        <h2>Welcome to My Website!</h2>
        <p>This is the main content area.</p>
      </main>
      <UserList />
    </div>
  </div>
</template>

<script>
import Header from "./components/Header.vue";
import Sidebar from "./components/Sidebar.vue";
import UserList from "./components/UserList.vue";





export default {
  name: "App",
  components: {
    Header,
    Sidebar,
    UserList,
  },
};
</script>

<style scoped>
/* 전체 레이아웃 */
.layout {
  display: flex;
  flex-direction: column;
  width: 100vw; /* 전체 화면 너비 */
  height: 100vh; /* 전체 화면 높이 */
  overflow: hidden;
}

/* Header */
header {
  height: 80px;
  background-color: #333;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
}

/* 메인 영역 */
.main {
  display: flex;
  flex: 1;
  overflow: hidden; /* 스크롤 문제 방지 */
}

/* Sidebar */
.sidebar {
  width: 120px; /* 고정된 너비 */
  background-color: #d9d9d9;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem; /* 그룹 버튼 간격 */
}

/* Content */
.content {
  flex: 1; /* 중앙 영역을 유연하게 사용 */
  padding: 1.5rem;
  background-color: #f4f4f4;
  overflow-y: auto;
}

/* User List */
.user-list {
  width: 200px; /* 고정된 너비 */
  background-color: #e0e0e0;
  padding: 1rem;
  overflow-y: auto; /* 유저 리스트 스크롤 가능 */
}
</style>
