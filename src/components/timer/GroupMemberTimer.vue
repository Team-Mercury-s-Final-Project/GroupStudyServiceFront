<template>
  <div
    class="group-timer flex flex-col justify-between p-3 rounded-lg bg-white shadow-md w-full max-w-sm"
  >
    <div class="font-bold text-gray-900">이름: {{ timeData.nickname }}</div>
    <div class="text-lg text-gray-900 font-semibold">
      시간: {{ formattedTime }}
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, computed } from "vue";
const { timeData } = defineProps(["timeData"]);
const localTime = ref(timeData.timeSoFar);
const localStatus = ref(timeData.status);
const milliSecondTimeOffset = ref(timeData.milliSecondTimeOffset);
// 타이머 ID 값(setTimeout 함수의 반환값 - clear할 때 사용)
const timeoutId = ref(null);
// 예상 시간 값 (현재 기준 +1초)
const expectedTime = ref(0);

onMounted(() => {
  eventHandle();
});

watch(
  () => timeData,
  (newVal, oldVal) => {
    localTime.value = newVal.timeSoFar;
    localStatus.value = newVal.status;
    milliSecondTimeOffset.value = newVal.milliSecondTimeOffset;
    eventHandle();
  },
  { deep: true }
);

const eventHandle = () => {
  // 타이머 시작
  if (!timeoutId.value && localStatus.value === "START") {
    /* 
     오차 보정 파트.
     타이머 시작, 지금 기준 1초 뒤에 실행되도록함.
    */
    if (!Number.isFinite(milliSecondTimeOffset.value)) {
      milliSecondTimeOffset.value = 0;
    }
    expectedTime.value = Date.now() + 1000 - milliSecondTimeOffset.value;
    timeoutId.value = setTimeout(
      increaseLocalTimeByOneSecond,
      1000 - milliSecondTimeOffset.value
    );
  } else if (timeoutId.value && timeData.status === "STOP") {
    clearTimeout(timeoutId.value);
    timeoutId.value = null;
  } else if (timeoutId.value && timeData.status === "END") {
    clearTimeout(timeoutId.value);
    timeoutId.value = null;
    localTime.value = 0;
  }
};

const formattedTime = computed(() => {
  const hours = Math.floor(localTime.value / 3600);
  const minutes = Math.floor((localTime.value % 3600) / 60);
  const seconds = Math.floor((localTime.value % 60) / 1);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
});

// 타이머 오차 보정 재귀함수
function increaseLocalTimeByOneSecond() {
  // 드리프트 계산: 현재 시각과 예상 시각의 차이
  const drift = Date.now() - expectedTime.value;

  // 타이머 값 업데이트
  localTime.value++;

  // 다음 예상 시각 갱신
  expectedTime.value += 1000;

  // 오차 보정: 1000ms에서 드리프트를 빼고, 최소 0ms로 예약
  timeoutId.value = setTimeout(
    increaseLocalTimeByOneSecond,
    Math.max(0, 1000 - drift)
  );
}
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
