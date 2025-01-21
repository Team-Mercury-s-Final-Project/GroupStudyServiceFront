<template>
  <div>
    <h1>Next Page</h1>
    <button @click="$router.push('/')">Go Back to Home</button>
    <br />
    <FwbButton gradient="purple-pink" @click="navigateToDetailPage(1)"
      >Go to Group 1</FwbButton
    >
    <FwbButton gradient="purple-pink" @click="navigateToDetailPage(2)"
      >Go to Group 2</FwbButton
    >
  </div>
</template>
<script setup>
import { FwbButton } from "flowbite-vue";
import { useRouter } from "vue-router";

// Vue Router 사용
const router = useRouter();

// 페이지 이동 함수
function navigateToDetailPage(groupId) {
  router.push(`/groups/${groupId}`); // groupId를 동적으로 경로에 삽입
}
</script>
