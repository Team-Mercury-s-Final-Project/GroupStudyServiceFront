<template>
  <header class="header">
    <h1>My Website</h1>
    <nav>
      <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </nav>
  </header>
</template>

<script>
export default {
  name: "Header",
};
</script>

<style scoped>
.header {
  background-color: #333;
  color: #fff;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.2rem; /* PC 환경에 적합한 크기 */
}

.header ul {
  list-style: none;
  display: flex;
  gap: 2rem; /* 더 넓은 간격 */
}

.header a {
  color: white;
  text-decoration: none;
}

.header a:hover {
  text-decoration: underline; /* PC 환경에서는 hover 효과 추가 */
}
</style>
