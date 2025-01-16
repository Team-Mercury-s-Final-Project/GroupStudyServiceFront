<template>
  <aside class="sidebar">
    <button class="group-btn">로고</button>
    <button class="group-btn">그룹</button>
    <button class="group-btn">그룹</button>
    <button class="group-btn">그룹</button>
    <button class="group-btn">그룹</button>
  </aside>
</template>

<script>
export default {
  name: "Sidebar",
};
</script>

<style scoped>
.group-btn {
  width: 100%;
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