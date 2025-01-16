<template>
  <aside class="sidebar">
    <button class="group-btn" @click="handleClick">그룹</button>
    <button class="group-btn">그룹</button>
    <button class="group-btn">그룹</button>
    <button class="group-btn">그룹</button>
    <button class="group-btn">그룹</button>
  </aside>
</template>

<script>
export default {
  name: "Sidebar",
  methods: {
    handleClick() {
      console.log("버튼이 클릭되었습니다!");
      alert("그룹 버튼 클릭!");
    },
  },
};
</script>

<style scoped>
.group-btn {
  width: 50px;
  height: 50px;
  padding: 0.5rem;
  background-color: #ff8888;
  border: none;
  color: white;
  text-align: center;
  cursor: pointer;
  font-weight: bold;
}

.group-btn:hover {
  background-color: #ff6666;
}
</style>
