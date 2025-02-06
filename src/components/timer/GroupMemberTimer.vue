<!-- 그룹원의 타이머들 -->
<template>
  <div class="stopwatch">
    <span style="color: white">
      <p>{{ timeData.nickname }}</p>
      <p>오늘의 총 공부시간: {{ timeData.todayTotalTime }}분</p>
      <p>순위: {{ timeData.ranking }}위</p>
    </span>
    <TimerDisplay :time="localTime" />
  </div>
</template>

<script setup>
import { defineProps, ref, watch } from "vue";
import TimerDisplay from "./TimerDisplay.vue";
const { timeData } = defineProps(["timeData"]);
const localTime = ref(timeData.timeSoFar);
const localStatus = ref(timeData.status);
const interval = ref(null);

watch(
  () => timeData,
  (newVal, oldVal) => {
    localTime.value = newVal.timeSoFar;
    localStatus.value = newVal.status;
    eventHandle();
  },
  { deep: true }
);


const eventHandle = () => {
  
  // 타이머 시작
  if (!interval.value && localStatus.value === "START") {
    
    interval.value = setInterval(() => {
      localTime.value++;
    }, 1000);
  }
  else if (interval.value && timeData.status === "STOP") {
    clearInterval(interval.value);
    interval.value = null;
  }else if (interval.value && timeData.status === "END") {
    clearInterval(interval.value);
    interval.value = null;
    localTime.value = 0;
  }
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
