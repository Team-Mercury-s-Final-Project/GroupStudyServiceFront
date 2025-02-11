<template>
  <div class="group-timer flex flex-col justify-between p-3 rounded-lg bg-white shadow-md w-full max-w-sm">
    <div class="font-bold text-gray-900">이름: {{ timeData.nickname }}</div>
    <div class="text-lg text-gray-900 font-semibold">시간: {{ formattedTime }}</div>
  </div>
</template>
  
<script setup>
import { onMounted, ref, watch,computed } from "vue";
const { timeData } = defineProps(["timeData"]);
const localTime = ref(timeData.timeSoFar);
const localStatus = ref(timeData.status);
const interval = ref(null);

onMounted(() => {
  eventHandle();
});

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

const formattedTime = computed(() => {
const hours = Math.floor(localTime.value / 3600);
const minutes = Math.floor((localTime.value % 3600) / 60);
const seconds = Math.floor((localTime.value % 60) / 1);
return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
});
</script>
  
  <style scoped>
  .group-timer {
    transition: all 0.3s ease-in-out;
  }
  .group-timer:hover {
    transform: scale(1.02);
    background-color: #f7fff0;
  }
  </style>
  