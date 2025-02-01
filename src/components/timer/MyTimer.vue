<!-- 유저의 타이머 -->
<template>
  <div class="stopwatch">
    <span>
      <h3>이름:{{ nickname }}</h3>
      <h3>오늘의 총 공부시간: {{ todayTotalTime }}분</h3>
    </span>
    <TimerDisplay :time="localTime" />
    <div class="buttons">
      <button v-if="!interval" @click="start" class="icon-button">
        <i class="fas fa-play"></i>
      </button>
      <div v-else>
        <button @click="stop" class="icon-button">
          <i class="fas fa-pause"></i>
        </button>
        <button @click="reset" class="icon-button">
          <i class="fas fa-stop"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, watch, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import TimerDisplay from "./TimerDisplay.vue";
const route = useRoute();
const groupId = route.params.groupId;

const {
  userId,
  nickname,
  todayTotalTime,
  timeSoFar: time,
  stompClient,
} = defineProps([
  "userId",
  "nickname",
  "todayTotalTime",
  "timeSoFar",
  "stompClient",
]);

const localTime = ref(time);
// props.time이 변경되면 localTime도 업데이트
const interval = ref(null);
const start = () => {
  console.log("MY TIMER START");

  if (!interval.value) {
    interval.value = setInterval(() => {
      localTime.value++;
    }, 1000);
    sendStartSign();
  }
};
const stop = () => {
  if (interval.value) {
    clearInterval(interval.value);
    interval.value = null;
  }
};
const reset = () => {
  stop();
  localTime.value = 0;
};

const sendStartSign = () => {
  if (stompClient && stompClient.connected) {
    console.log("Message sent:", userId.value);
    console.log("Message sent:", userId.toString());
    console.log("Message sent:", userId.toString());
    stompClient.send(`/pub/groups/${groupId}/timers/start`, userId.value, {});
  } else {
    console.error("WebSocket is not connected");
  }
};

onBeforeUnmount(() => {
  stop(); // stop 함수 호출
});
</script>
<style scoped>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css");

.stopwatch {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  max-width: 400px;
  background-color: #e0e0e0; /* Slightly grey color */
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.clock-display {
  background-color: #333;
  color: #fff;
  padding: 20px;
  border-radius: 10px;
  font-family: "Courier New", Courier, monospace;
  font-size: 2em;
  margin-bottom: 20px;
}

.buttons {
  display: flex;
  gap: 10px;
}

.icon-button {
  margin: 0px 30px;
  background: none;
  border: none;
  font-size: 2em;
  cursor: pointer;
  color: #333;
}

.icon-button:hover {
  color: #555;
}
</style>
