<template>
  <aside class="sidebar">
    <button class="group-btn" @click="handleClick">로고</button>
    <button class="group-btn">그룹</button>
    <button class="group-btn">그룹</button>
    <button class="group-btn">그룹</button>
    <button class="group-btn">그룹</button>
  </aside>
</template>

<script>
// backend api 데이터 통신 테스트
import api from '../api';

export const fetchData = async () => {
    try {
        const response = await api.get('/testData'); // '/data' 엔드포인트 호출
        console.log(response);
        return response.data;
    } catch (error) {
        console.error("API 호출 중 오류 발생:", error);
        throw error;
    }
};

export default {
  name: "Sidebar",
  methods: {
    async handleClick() {
      try {
        const data = await fetchData(); // 비동기 함수 호출
        alert(data); // 받아온 데이터를 alert 창에 표시
      } catch (error) {
        console.error("데이터를 가져오는 중 오류 발생:", error);
      }
    }
  }
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
