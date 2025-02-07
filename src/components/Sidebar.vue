<template>
  <aside class="sidebar">
    <!-- 반복문으로 그룹 데이터 렌더링 -->
    <fwb-tooltip
      v-for="group in globalState.myGroups"
      :key="group.id"
      placement="right"
    >
      <template #trigger>
        <fwb-avatar
          :img="group.imageUrl"
          @click="goToGroupDetail(group.id)"
          class="clickable-avatar"
        />
      </template>
      <template #content>{{ group.name }}</template>
    </fwb-tooltip>
  </aside>
</template>

<script setup>
import { ref, onMounted, inject } from "vue";
import { FwbAvatar, FwbTooltip } from "flowbite-vue";
import { useRouter } from "vue-router";
import axiosInstance from "../api/axiosInstance";

// 컴포넌트 이름 설정
defineOptions({
  name: "Sidebar",
});

// 필요한 로직 추가 (예시)
const router = useRouter();
const token = localStorage.getItem("access");
const globalState = inject("globalState"); // 전역 상태 가져오기

// 그룹 상세 페이지로 이동
async function goToGroupDetail(groupId) {
  // router.push(`/groups/${groupId}`);
  router.push(`/groups/${groupId}`).then(() => {
    console.log("라우터 이동 성공:", router.currentRoute.value);
  });
}

// onMounted(() => {
//   getMyGroups();
// });
</script>

<style scoped>
.group-btn {
  width: 50px;
  height: 50px;
  padding: 0.5rem;
  background-color: #ff8888;
  border: none;
  color: white;
  text-align: center;
  cursor: pointer;
  font-weight: bold;
}

.group-btn:hover {
  background-color: #ff6666;
}
</style>
