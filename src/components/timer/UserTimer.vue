<!-- 유저의 타이머 -->
<template>
  <div class="stopwatch">
    <span>
      <h3>이름:{{ nickname }}</h3>
      <h3>오늘의 총 공부시간: {{ todayTotalTime }}분</h3>
    </span>
    <TimerDisplay :time="time" />
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

<script>
import TimerDisplay from "./TimerDisplay.vue";

export default {
  components: {
    TimerDisplay,
  },
  props: ["stompClient", "nickname", "todayTotalTime", "groupId"],
  data() {
    return {
      time: 0,
      interval: null,
    };
  },
  methods: {
    start() {
      if (!this.interval) {
        this.interval = setInterval(() => {
          this.time++;
        }, 1000);
        this.sendStartSign();
      }
    },
    stop() {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    },
    reset() {
      this.stop();
      this.time = 0;
    },
    sendStartSign() {
      if (this.stompClient && this.stompClient.connected) {
        const message = "start!!";
        this.stompClient.send(
          `/pub/groups/${this.groupId}/timers/start`,
          {},
          JSON.stringify(message)
        );
        console.log("Message sent:", message);
      } else {
        console.error("WebSocket is not connected");
      }
    },
  },
  beforeDestroy() {
    this.stop();
  },
};
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
