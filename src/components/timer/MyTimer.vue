<template>
  <div id="webcrumbs" class="flex justify-center">
    <div class="w-full  bg-gradient-to-br from-red-100 to-yellow-100 rounded-lg shadow-lg p-3 md:p-6 transform hover:scale-[1.03] transition-transform duration-300 overflow-hidden">
      <div class="flex flex-col items-center space-y-3">
        <!-- 타이머 박스 -->
        <div class="text-2xl md:text-4xl font-bold tracking-wider bg-white/80 backdrop-blur-sm w-full py-3 md:py-4 rounded-lg shadow-inner text-center transition-all duration-300 hover:bg-white/90 text-red-600">
          <div>{{ formattedTime }}</div>
        </div>
        <!-- 공부 시간 & 랭킹 -->
        <div class="w-full bg-white/80 backdrop-blur-sm rounded-lg p-2 md:p-3 shadow-inner">
          <div class="flex justify-between items-center text-xs md:text-sm">
            <span class="font-semibold text-red-700">오늘 공부 시간:</span>
            <span class="font-bold text-red-600">{{ formattedTotalTime }}</span>
          </div>
          <div class="flex justify-between items-center mt-2 text-xs md:text-sm">
            <span class="font-semibold text-red-700"><strong class="text-black">{{nickname}}</strong>님의 오늘의 Ranking:</span>
            <div class="flex items-center space-x-1">
              <span class="material-symbols-outlined text-yellow-500 text-base">trophy</span>
              <span class="font-bold text-red-600">#{{ranking}}</span>
            </div>
          </div>
        </div>
        <!-- 버튼 그룹 -->
        <div class="flex space-x-2 md:space-x-3 w-full">
          <button @click="start" class="flex-1 min-w-20 bg-gradient-to-r from-green-500 to-green-600 hover:brightness-110 text-white py-2 rounded-2xl transform hover:scale-105 transition-all duration-300 active:scale-95 shadow-md font-semibold text-sm md:text-base">
            Start
          </button>
          <button @click="stop" class="flex-1 min-w-20 bg-gradient-to-r from-yellow-300 to-yellow-400 hover:brightness-110 text-white py-2 rounded-2xl transform hover:scale-105 transition-all duration-300 active:scale-95 shadow-md font-semibold text-sm md:text-base">
            Pause
          </button>
          <button @click="end" class="flex-1 min-w-20 bg-gradient-to-r from-red-500 to-red-600 hover:brightness-110 text-white py-2 rounded-2xl transform hover:scale-105 transition-all duration-300 active:scale-95 shadow-md font-semibold text-sm md:text-base">
            Reset
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { ref, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const groupId = route.params.groupId;

const {
  userId,
  nickname,
  todayTotalTime,
  timeSoFar,
  stompClient,
  status,
} = defineProps([
  "userId",
  "nickname",
  "todayTotalTime",
  "timeSoFar",
  "stompClient",
  "ranking",
  "status"
]);

const localTotalTime = ref(todayTotalTime);

const formattedTime = computed(() => {
  const localtime = timeSoFar.value;
  const hours = Math.floor(localtime / 3600);
  const minutes = Math.floor((localtime % 3600) / 60);
  const seconds = Math.floor((localtime % 60) / 1);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
});
const formattedTotalTime = computed(() => {
  const localtime = todayTotalTime.value;
  const hours = Math.floor(localtime / 3600);
  const minutes = Math.floor((localtime % 3600) / 60);
  const seconds = Math.floor((localtime % 60) / 1);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
});

const localTime = ref(timeSoFar);
// props.time이 변경되면 localTime도 업데이트
const interval = ref(null);

const start = () => {
  if (!interval.value && status.value !== "START") {
    sendStartSign();
  }
};
const stop = () => {
  if (interval.value) {
    clearInterval(interval.value);
    interval.value = null;
    sendStopsign();
  }
};
const end = () => {
  if (interval.value) {
    clearInterval(interval.value);
    interval.value = null;
    localTime.value = 0;
  }
  sendEndSign();
};

const sendStartSign = () => {
  if (stompClient && stompClient.connected) {
    interval.value = setInterval(() => {
      localTime.value++;
      localTotalTime.value++;
    }, 1000);
    stompClient.send(`/pub/groups/${groupId}/timers/start`, userId.value, {});
  } else {
    console.error("WebSocket is not connected");
  }
};
const sendStopsign = () => {
  if (stompClient && stompClient.connected) {
    stompClient.send(`/pub/groups/${groupId}/timers/stop`, userId.value, {});
  } else {
    console.error("WebSocket is not connected");
  }
};
const sendEndSign = () => {
  if (stompClient && stompClient.connected) {
    stompClient.send(`/pub/groups/${groupId}/timers/end`, userId.value, {});
  } else {
    console.error("WebSocket is not connected");
  }
};
onBeforeUnmount(() => {
  stop(); // stop 함수 호출
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Open+Sans&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined");

#webcrumbs {
  font-family: "Open Sans", sans-serif;
}
</style>
