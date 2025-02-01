<!-- 그룹원의 타이머들 -->
<template>
  <div class="stopwatch">
    <span style="color: white">
      <p>{{ timeData.nickname }}</p>
      <p>오늘의 총 공부시간: {{ timeData.todayTotalTime }}분</p>
      <p>순위: {{ timeData.ranking }}위</p>
    </span>
    <TimerDisplay :time="timeData.timeSoFar" />
  </div>
</template>

<script setup>
import { defineProps, onMounted, ref } from "vue";
import TimerDisplay from "./TimerDisplay.vue";
const { timeData } = defineProps(["timeData"]);
const interval = ref(null);
onMounted(() => {
  eventHandle();
});
const eventHandle = () => {
  console.log(" 이벤트 시작 ");

  // 타이머 시작
  if (!interval.value && timeData.status === "START") {
    interval.value = setInterval(() => {
      localTime.value++;
    }, 1000);
  }
  // else if (interval.value && timeData.status === "STOP") {
  //   clearInterval(interval.value);
  //   interval.value = null;
  // }
};
</script>

<style scoped>
.stopwatch {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  max-width: 400px;
  background-color: gray;
}
</style>
