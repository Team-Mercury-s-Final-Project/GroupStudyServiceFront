<template>
  <aside class="sidebar">
    <fwb-tooltip placement="right">
      <template #trigger>
        <fwb-avatar
          img="https://www.home-learn.co.kr/common/image.do?imgPath=newsroom&imgName=CK20230317131145039.png&imgGubun=D"
        />
      </template>
      <template #content> 수학의 정석 </template>
    </fwb-tooltip>
    <fwb-tooltip placement="right">
      <template #trigger>
        <fwb-avatar
          img="https://static.cdn.kmong.com/gigs/UJYvB1717564634.jpg"
        />
      </template>
      <template #content> 토익 스터디 </template>
    </fwb-tooltip>
    <fwb-tooltip placement="right">
      <template #trigger>
        <fwb-avatar
          img="https://upload.wikimedia.org/wikipedia/ko/3/38/수특.jpg"
        />
      </template>
      <template #content> 2025 수능대비 </template>
    </fwb-tooltip>
    <fwb-tooltip placement="right">
      <template #trigger>
        <fwb-avatar
          img="https://i.namu.wiki/i/K35xg_xOR6xQugv5z7OA5McfGddwP9-mP6_jfh9tKGwTzksPXimI3J6-PJOQWyKCyhkq1JHTttviVHBSCsGC0Q.svg"
        />
      </template>
      <template #content> 공산주의는 어째서 실패하는가? </template>
    </fwb-tooltip>
    <fwb-tooltip placement="right">
      <template #trigger>
        <fwb-avatar img="/src/assets/capitalism.png" />
      </template>
      <template #content> 자본주의와 우리사회 </template>
    </fwb-tooltip>
  </aside>
</template>

<script setup>
import { FwbAvatar, FwbTooltip } from "flowbite-vue";
</script>
<script>
export default {
  name: "Sidebar",
};
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
