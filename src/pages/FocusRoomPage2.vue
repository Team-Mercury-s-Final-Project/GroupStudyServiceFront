<template>
  <!-- 부모 컨테이너: 고정 크기 내에서 스크롤 가능 -->
  <div
    class="p-4 bg-red-700 h-[1500px] lg:h-[700px] flex flex-col lg:flex-row justify-center space-x-0 lg:space-x-32 lg:space-y-0 overflow-auto"
  >
    <!-- 좌측: 타이머 진행사항 및 내 타이머 -->
    <div
      class="flex flex-col space-y-4 w-[400px] md:w-[500px] lg:w-[700px] xl:w-[1000px] flex-1 h-full"
    >
      <!-- 타이머 진행 사항 박스 -->
      <div class="bg-green-300 p-4 rounded-lg overflow-y-auto h-[530px]">
        <div class="grid grid-cols-2 gap-4">
          <!-- 각 사람의 타이머 진행 상황 카드 -->
          <div
            v-for="user in timerData"
            :key="user.id + '-' + Math.random()"
            class="p-4 bg-gray-200 rounded-lg shadow-md"
          >
            <p class="font-bold">이름: {{ user.name }}</p>
            <p>시간: {{ user.time }}</p>
          </div>
        </div>
      </div>
      <!-- 자신의 타이머 박스 -->
      <div class="bg-blue-300 p-4 rounded-lg h-[120px]">
        <p class="text-lg font-bold text-center mb-4">
          오늘 총 공부 시간 : {{ totalStudyTime }}
        </p>
        <div class="flex items-center justify-center space-x-4">
          <p class="text-4xl font-bold">{{ currentTimer }}</p>
          <button class="p-2 bg-gray-400 rounded hover:bg-gray-500">⏸️</button>
          <button class="p-2 bg-gray-400 rounded hover:bg-gray-500">⏹️</button>
        </div>
      </div>
    </div>
    <!-- 우측: 랭킹 박스 (크기 축소 방지 위해 shrink-0 추가) -->
    <div
      class="p-4 bg-gray-800 text-white rounded-lg shadow-lg xs:w-[400px] sm:w-[400px] md:w-[500px] lg:w-[300px] h-[668px]np overflow-y-auto"
    >
      <h2 class="text-xl font-bold text-center mb-4">전체 순위</h2>
      <div class="space-y-4">
        <!-- 순위 항목 반복 -->
        <div
          v-for="user in rankData"
          :key="user.id + '-' + Math.random()"
          class="flex items-center justify-between bg-gray-700 rounded-lg p-3 shadow-md"
        >
          <!-- 등수 -->
          <div class="text-xl font-extrabold text-yellow-400">
            {{ user.rank }}등
          </div>
          <!-- 프로필 정보 -->
          <div class="flex items-center space-x-3">
            <img
              :src="user.avatar"
              alt="avatar"
              class="w-10 h-10 rounded-full border-2 border-gray-500"
            />
            <div>
              <p class="font-bold text-sm">{{ user.name }}</p>
            </div>
          </div>
          <!-- 시간 정보 -->
          <div class="text-sm font-semibold text-gray-200">
            {{ user.time }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const rankData = ref([
  {
    id: 1,
    rank: 1,
    name: "정주영",
    time: "12:08:10",
    avatar: "https://picsum.photos/50",
  },
  {
    id: 2,
    rank: 2,
    name: "김철수",
    time: "09:15:43",
    avatar: "https://picsum.photos/51",
  },
  {
    id: 3,
    rank: 3,
    name: "이영희",
    time: "10:05:12",
    avatar: "https://picsum.photos/52",
  },
  {
    id: 4,
    rank: 4,
    name: "박준형",
    time: "08:22:34",
    avatar: "https://picsum.photos/53",
  },
  {
    id: 5,
    rank: 5,
    name: "최수연",
    time: "11:45:19",
    avatar: "https://picsum.photos/54",
  },
  {
    id: 6,
    rank: 6,
    name: "최수연",
    time: "11:45:19",
    avatar: "https://picsum.photos/54",
  },
  {
    id: 7,
    rank: 7,
    name: "최수연",
    time: "11:45:19",
    avatar: "https://picsum.photos/54",
  },
  {
    id: 8,
    rank: 8,
    name: "최수연",
    time: "11:45:19",
    avatar: "https://picsum.photos/54",
  },
  {
    id: 9,
    rank: 9,
    name: "최수연",
    time: "11:45:19",
    avatar: "https://picsum.photos/54",
  },
]);

const timerData = ref([
  { id: 1, name: "정주영", time: "12 : 08 : 10" },
  { id: 2, name: "김철수", time: "09 : 15 : 43" },
  { id: 3, name: "이영희", time: "10 : 05 : 12" },
  { id: 4, name: "박준형", time: "08 : 22 : 34" },
  { id: 5, name: "최수연", time: "11 : 45 : 19" },
  { id: 6, name: "정주영", time: "12 : 08 : 10" },
  { id: 7, name: "김철수", time: "09 : 15 : 43" },
  { id: 8, name: "이영희", time: "10 : 05 : 12" },
  { id: 9, name: "박준형", time: "08 : 22 : 34" },
  { id: 10, name: "최수연", time: "11 : 45 : 19" },
  { id: 11, name: "정주영", time: "12 : 08 : 10" },
  { id: 12, name: "김철수", time: "09 : 15 : 43" },
  { id: 13, name: "이영희", time: "10 : 05 : 12" },
  { id: 14, name: "박준형", time: "08 : 22 : 34" },
  { id: 15, name: "최수연", time: "11 : 45 : 19" },
  { id: 16, name: "정주영", time: "12 : 08 : 10" },
  { id: 17, name: "김철수", time: "09 : 15 : 43" },
  { id: 18, name: "이영희", time: "10 : 05 : 12" },
  { id: 19, name: "박준형", time: "08 : 22 : 34" },
  { id: 20, name: "최수연", time: "11 : 45 : 19" },
]);

const totalStudyTime = ref("05 : 50 : 00");
const currentTimer = ref("01 : 30 : 13");
</script>

<style scoped>
/* 추가적인 스타일 조정이 필요하다면 이곳에 작성 */
</style>
