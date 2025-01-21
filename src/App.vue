<template>
  <div class="app">
    <Sidebar />
    <div class="header-layout">
      <Header />

      <div class="content-container">
        <main class="content">
          <router-view />
          <!-- 라우팅된 페이지가 여기 렌더링 -->
        </main>
        <!-- UserList (조건부 렌더링) -->
        <transition name="slide">
          <UserList v-if="isUserListVisible" />
        </transition>
      </div>
      <!-- 플로팅 버튼 -->
      <button class="floating-btn" @click="toggleUserList">
        {{ isUserListVisible ? "❌" : "👥" }}
      </button>

    </div>
  </div>
</template>
<script setup>
import { FwbButton, FwbAvatar, FwbTooltip } from "flowbite-vue";
</script>
<script>
import Header from "./components/Header.vue";
import Sidebar from "./components/Sidebar.vue";
import UserList from "./components/UserList.vue";

export default {
  name: "App",
  components: {
    Sidebar,
    Header,
    UserList,
    FocusRoomTimers,
  },
  data() {
    return {
      isUserListVisible: true, // 기본값: UserList가 보이는 상태
    };
  },
  methods: {
    toggleUserList() {
      this.isUserListVisible = !this.isUserListVisible;
    },
  },
};
</script>

<style scoped>
/* 전체 레이아웃 */
.app {
  display: flex;
  height: 100vh;
}

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

.content-container {
  display: flex;
  flex: 1;
  min-height: 100vh;
}

/* 메인 콘텐츠 스타일 */
.content {
  flex: 1;
  background-color: #f9f9f9;
  padding: 32px;
  transition: flex 0.3s ease; /* 애니메이션 추가 */
  overflow-y: auto; /* 스크롤 활성화 */
}

/* UserList 스타일 */
.user-list {
  width: 200px;
  background-color: #eaeaea;
  border-left: 1px solid #ccc;
  transition: all 0.3s ease; /* 애니메이션 추가 */
}

/* 플로팅 버튼 스타일 */
.floating-btn {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  font-size: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.floating-btn:hover {
  transform: scale(1.1);
}

/* UserList 애니메이션 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
