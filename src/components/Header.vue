<template>
  <fwb-navbar solid class="bg-gray-400">
    <template #logo>
      <router-link to="/" class="logo">
        <fwb-navbar-logo
          alt="S.T.A.R logo"
          image-url="https://blog.kakaocdn.net/dn/b3blpi/btrR8iJj38E/VRPwpmSXMGeBEC16SS34x1/img.png"
        >
          S.T.A.R
        </fwb-navbar-logo>
      </router-link>
    </template>
    <template #default="{ isShowMenu }">
      <fwb-navbar-collapse :is-show-menu="isShowMenu">
        <!-- 로그인된 경우에만 '내 정보'와 '로그아웃' 메뉴 표시 -->
        <template v-if="isLoggedIn">
          <router-link to="userinfoPage" class="mr-4 hover:underline"
            >내 정보</router-link
          >
          <router-link to="#" @click="logout" class="hover:underline"
            >로그아웃</router-link
          >
        </template>

        <!-- 로그인되지 않은 경우에만 '로그인' 메뉴 표시 -->
        <template v-else>
          <router-link to="/oauth2Login" class="hover:underline"
            >로그인</router-link
          >
        </template>
      </fwb-navbar-collapse>
    </template>
  </fwb-navbar>
</template>

<script setup>
import { FwbNavbar, FwbNavbarCollapse, FwbNavbarLogo } from "flowbite-vue";
import { computed } from "vue";
import { useStore } from "vuex"; // Vuex에서 상태 관리
import { useRouter } from "vue-router"; // vue-router의 useRouter 훅을 사용하여 router 객체를 가져옴

const store = useStore(); // Vuex store를 사용하여 상태에 접근
const router = useRouter(); // Vue Router 사용

// 로그인 상태 확인
const isLoggedIn = computed(() => store.state.isLoggedIn);

// 로그아웃 처리
const logout = () => {
  store.dispatch("logout"); // Vuex 상태 초기화
  localStorage.removeItem("access"); // 토큰 삭제 (예시)
  localStorage.removeItem("refresh"); // 토큰 삭제 (예시)
  router.push("/oauth2Login"); // 로그인 페이지로 이동
};
</script>
