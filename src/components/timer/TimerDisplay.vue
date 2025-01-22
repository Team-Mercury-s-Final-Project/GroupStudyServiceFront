<!-- 타이머 화면 창 -->
<template>
  <div class="clock-display">
    <div>{{ formattedTime }}</div>
  </div>
</template>

<script>
export default {
  props: {
    time: {
      type: Number,
      required: true,
    },
  },
  computed: {
    formattedTime() {
      const hours = Math.floor(this.time / 3600);
      const minutes = Math.floor((this.time % 3600) / 60);
      const seconds = Math.floor((this.time % 60) / 1);
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}:${String(seconds).padStart(2, "0")}`;
    },
  },
};
</script>

<style scoped>
.clock-display {
  width: 100%;
  background-color: #333;
  color: #fff;
  padding: 20px;
  border-radius: 10px;
  font-family: "Courier New", Courier, monospace;
}
</style>
