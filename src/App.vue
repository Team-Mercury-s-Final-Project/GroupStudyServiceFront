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
      <button
        class="floating-btn"
        v-if="isToggleButtonVisible"
        @click="toggleUserList"
      >
        {{ isUserListVisible ? "✖️" : "👥" }}
      </button>
    </div>
  </div>

  <link
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
    rel="stylesheet"
  />
</template>
<script setup>
import { computed, ref, watch } from "vue";
import { reactive, provide } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const isUserListVisible = ref(false);
const isToggleButtonVisible = ref(false);

const isUserListComputed = computed(() => {
  return route.meta?.showUserList === true;
});
const isToggleButtonComputed = computed(() => {
  return route.meta?.showToggleButton === true;
});

// route가 변경될 때 값 초기화
watch(route, () => {
  isUserListVisible.value = isUserListComputed.value;
  isToggleButtonVisible.value = isToggleButtonComputed.value;
});

// 토글 클릭 시 값 변경
const toggleUserList = () => {
  isUserListVisible.value = !isUserListVisible.value;
};

const state = reactive({
  isLoggedIn: false,
});
// 상태 제공
provide("state", state);
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
    // FocusRoomTimers,
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
  width: 270px;
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
