<!-- 집중방 -->
<template>
  <div class="p-4 bg-red-700 h-[700px] flex justify-center space-x-40">
    <!-- 타이머 진행사항 박스랑 내 타이머를 묶어준다 -->
    <div
      class="flex flex-col space-y-4 w-[300px] md:w-[400px] lg:w-[600px] xl:w-[1000px]"
    >
      <!-- 타이머 진행 사항 박스 -->
      <div class="bg-green-300 p-4 rounded-lg overflow-y-auto h-[530px]">
        <div class="grid grid-cols-2 gap-4">
          <!-- 각 사람의 타이머 진행 상황 카드 -->
          <div
            v-for="user in timerData"
            :key="user.id"
            class="p-4 bg-gray-200 rounded-lg shadow-md"
          >
            <p class="font-bold">이름: {{ user.name }}</p>
            <p>시간: {{ user.time }}</p>
          </div>
        </div>
      </div>
      <!-- 자신의 타이머 박스 -->
      <!-- 높이, 너비 여기서 조절 -->
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
    <!-- 오른쪽 추가 박스 -->
    <div
      class="bg-gray-400 p-4 rounded-lg shadow-lg w-[300px] h-[668px] max-w-[350px]"
    >
      <p class="font-bold text-center">추가 기능 박스</p>
      <p class="text-center">여기에 원하는 내용을 넣어주세요</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const timerData = ref([
  { id: 1, name: "정주영", time: "12 : 08 : 10" },
  { id: 2, name: "김철수", time: "09 : 15 : 43" },
  { id: 3, name: "이영희", time: "10 : 05 : 12" },
  { id: 4, name: "박준형", time: "08 : 22 : 34" },
  { id: 5, name: "최수연", time: "11 : 45 : 19" },
  { id: 1, name: "정주영", time: "12 : 08 : 10" },
  { id: 2, name: "김철수", time: "09 : 15 : 43" },
  { id: 3, name: "이영희", time: "10 : 05 : 12" },
  { id: 4, name: "박준형", time: "08 : 22 : 34" },
  { id: 5, name: "최수연", time: "11 : 45 : 19" },
  { id: 1, name: "정주영", time: "12 : 08 : 10" },
  { id: 2, name: "김철수", time: "09 : 15 : 43" },
  { id: 3, name: "이영희", time: "10 : 05 : 12" },
  { id: 4, name: "박준형", time: "08 : 22 : 34" },
  { id: 5, name: "최수연", time: "11 : 45 : 19" },
  { id: 1, name: "정주영", time: "12 : 08 : 10" },
  { id: 2, name: "김철수", time: "09 : 15 : 43" },
  { id: 3, name: "이영희", time: "10 : 05 : 12" },
  { id: 4, name: "박준형", time: "08 : 22 : 34" },
  { id: 5, name: "최수연", time: "11 : 45 : 19" },
]);

const totalStudyTime = ref("05 : 50 : 00");
const currentTimer = ref("01 : 30 : 13");
</script>

<style scoped></style>
