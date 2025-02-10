<template>
  <div class="app">
    <Sidebar />
    <div class="header-layout">
      <Header />

      <div class="content-container">
        <main class="content">
          <LoginModal v-if="modal.isVisible" />
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
import { EventSourcePolyfill } from "event-source-polyfill";
import store from "./store/store";
import LoginModal from "./components/modal/LoginPermissionRequired.vue";
import Sidebar from "./components/Sidebar.vue";
import axiosInstance from "./api/axiosInstance";

// 전역 상태 정의
const globalState = reactive({
  myGroups: [],
});
provide("globalState", globalState);

const route = useRoute();

// 라우팅 변화를 감지하여 필요하면 데이터 재요청
watch(route, async () => {
  await fetchGroups(); // 라우트 변경 시 그룹 데이터를 다시 가져옴
});

// 그룹 데이터 가져오는 함수
async function fetchGroups() {
  if (isLoggedIn.value) {
    try {
      const response = await axiosInstance.get("/groups/myGroups");
      if (response.status == 200) {
        globalState.myGroups = response.data.data;
      }
    } catch (error) {
      console.error("그룹 데이터 불러오기 실패:", error);
    }
  } else {
    globalState.myGroups = [];
  }
}

// 로그인 상태 확인
const isLoggedIn = computed(() => store.state.isLoggedIn);
const isUserListVisible = ref(false);
const isToggleButtonVisible = ref(false);
const modal = computed(() => store.state.modal);

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

/* SSE 연결 관리 */
let eventSource = null; // SSE 전역 변수
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const groupId = ref(null);
const users = reactive({ list: [] });
const token = localStorage.getItem("access");

const connectSSE = async () => {
  if (eventSource) return; // 기존 SSE가 있으면 중복 연결 방지

  eventSource = new EventSourcePolyfill(
    `${import.meta.env.VITE_SERVER_HOST}/groups/${groupId.value}/subscribe`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  eventSource.addEventListener("connect", (event) => {
    reconnectAttempts = 0;
    console.log("SSE connect:", event.data);
  });

  eventSource.addEventListener("heartbeat", (event) => {
    console.log("heartbeat 수신:", event.data);
  });

  eventSource.onerror = (error) => {
    console.error("SSE 연결 오류:", error);
    eventSource.close();
    eventSource = null;
    store.commit("clearUsers");

    if (reconnectAttempts < maxReconnectAttempts) {
      const retryTime = Math.pow(2, reconnectAttempts) * 1000; // 지수 백오프 (1s, 2s, 4s, 8s, 16s)
      console.log(
        `SSE 재연결 시도 ${reconnectAttempts + 1}회 후 ${
          retryTime / 1000
        }초 대기...`
      );

      setTimeout(() => {
        reconnectAttempts++;
        connectSSE();
      }, retryTime);
    } else {
      console.warn("SSE 최대 재연결 횟수를 초과했습니다.");
    }
  };

  eventSource.addEventListener("memberData", (event) => {
    try {
      users.list = JSON.parse(event.data);
      store.commit("setUsers", users);
    } catch (error) {
      console.error("데이터 파싱 오류:", error);
    }
  });

  eventSource.addEventListener("statusUpdate", (event) => {
    const data = JSON.parse(event.data);
    store.commit("updateStatus", data);
  });

  return eventSource;
};

const closeSSE = () => {
  if (eventSource && typeof eventSource.close === "function") {
    console.log("SSE 연결 종료");
    eventSource.close();
    eventSource = null;
    // Vuex 상태 초기화
    store.commit("clearUsers");
  }
};

// 라우트 변경 감지하여 SSE 관리
watch(
  () => route.fullPath,
  (newPath) => {
    const match = newPath.match(/^\/groups\/(\d+)/); // `/groups/:groupId` 패턴 검사
    if (match) {
      const newGroupId = match[1];

      if (groupId.value !== newGroupId) {
        console.log(`🔄 그룹 변경 감지: ${groupId.value} → ${newGroupId}`);
        closeSSE();
        groupId.value = newGroupId;
        connectSSE();
      }
    } else {
      console.log("🏠 그룹 페이지가 아님 - SSE 연결 해제");
      closeSSE();
      groupId.value = null;
    }
  },
  { immediate: true }
);
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
    LoginModal,
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
  min-height: 90vh;
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
