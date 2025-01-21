<template>
  <div class="group-container">
    <fwb-avatar size="lg" img="/src/assets/capitalism.png"> </fwb-avatar>
    <div class="group-info-container">
      <div class="info-item">
        <a>group Name</a>
      </div>
      <div class="info-item">
        <fwb-button color="purple" @click="$router.push('/')">개요</fwb-button>
      </div>
      <div class="info-item">
        <fwb-button color="purple" @click="$router.push('/')">설정</fwb-button>
      </div>
    </div>
  </div>
  <div class="column-container">
    <div class="side-by-side-container">
      <fwb-card class="card">
        <!-- 버튼 그룹 -->
        <div class="title1">랭킹</div>
        <div class="card-buttons">
          <button
            v-for="(tab, index) in tabs"
            :key="index"
            :class="['tab-button', { active: selectedTab === index }]"
            @click="selectTab(index)"
          >
            {{ tab.name }}
          </button>
        </div>
        <!-- 탭 내용 -->
        <div class="card-content">
          <p>{{ tabs[selectedTab].content }}</p>
          <p>placeholder</p>
          <p>placeholder</p>
          <p>placeholder</p>
          <p>placeholder</p>
          <p>placeholder</p>
        </div>
      </fwb-card>
      <fwb-card class="card">
        <!-- 버튼 그룹 -->
        <div class="title">공지사항</div>
        <div class="card-content">
          <p>1 월 1일 어쩌구 저쩌구</p>
          <p>1 월 1일 어쩌구 저쩌구</p>
          <p>1 월 1일 어쩌구 저쩌구</p>
          <p>1 월 1일 어쩌구 저쩌구</p>
          <p>1 월 1일 어쩌구 저쩌구</p>
        </div>
      </fwb-card>
    </div>
    <div class="side-by-side-container">
      <fwb-card class="card">
        <!-- 버튼 그룹 -->
        <div class="title">집중방</div>
        <div class="card-content">
          <div class="enter-container">
            <p>5/10</p>
            <fwb-button>입장하기</fwb-button>
          </div>
        </div>
      </fwb-card>
      <fwb-card class="card">
        <!-- 버튼 그룹 -->
        <div class="title">채팅방</div>
        <div class="card-content">
          <div class="enter-container">
            <p>5/10</p>
            <fwb-button>입장하기</fwb-button>
          </div>
        </div>
      </fwb-card>
    </div>
  </div>
</template>
<script setup>
import { FwbAvatar, FwbButton, FwbCard, FwbButtonGroup } from "flowbite-vue";
import { ref } from "vue";

const tabs = ref([
  { name: "일간", content: "일간 랭킹을 보여줍니다." },
  { name: "주간", content: "주간 랭킹을 보여줍니다." },
  { name: "월간", content: "월간 랭킹을 보여줍니다." },
]);

const selectedTab = ref(0); // 현재 선택된 탭의 인덱스

function selectTab(index) {
  selectedTab.value = index; // 선택된 탭 업데이트
}
</script>
<style scoped>
.group-container {
  display: flex; /* Flexbox를 사용하여 가로 정렬 */
  align-items: center; /* 세로 정렬 정중앙 */
}

.group-info-container {
  display: flex; /* Flexbox 활성화 */
  justify-content: center; /* 가로 중앙 정렬 */
  align-items: center; /* 세로 중앙 정렬 */
  gap: 1rem; /* 요소 간 간격 */
}
.side-by-side-container {
  display: flex; /* Flexbox 활성화 */
  justify-content: space-between; /* 두 카드 사이에 가변적 갭 추가 */
  align-items: flex-start; /* 세로 정렬 (필요에 따라) */
  margin: 1rem; /* 전체 여백 */
  gap: 1rem; /* 카드 사이 간격 */
}
.card-buttons {
  display: flex;
  width: 100%;
}

.tab-button {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid #ccc;
  background-color: white;
  cursor: pointer;
  text-align: center;
  transition: background-color 0.3s ease;
}

.tab-button.active {
  background-color: #4caf50;
  color: white;
}

.tab-button:not(.active):hover {
  background-color: #f0f0f0;
}

.card-content {
  padding: 1rem;
}
.title {
  font-size: 1.1rem; /* 글자 크기를 1.5배로 */
  font-weight: bold; /* 글자 볼드 처리 */
  text-align: center; /* 가운데 정렬 */
  padding: 0.5rem; /* 보더와 텍스트 간 여백 */
  border-bottom: 1px solid #ccc;
}
.title1 {
  font-size: 1.1rem; /* 글자 크기를 1.5배로 */
  font-weight: bold; /* 글자 볼드 처리 */
  text-align: center; /* 가운데 정렬 */
  padding: 0.5rem; /* 보더와 텍스트 간 여백 */
}
.card {
  height: 250px;
  flex: 1; /* 남은 공간을 균등하게 채움 */
  max-width: 600px; /* 카드의 최대 크기를 600px로 제한 */
  background-color: white; /* 배경색 설정 */
  border-radius: 8px; /* 둥근 모서리 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 그림자 효과 */
  
}
.column-container {
  display: flex; /* Flexbox 활성화 */
  flex-direction: column; /* 세로로 배치 */
  gap: 2rem; /* 위아래 간격 설정 */
}
.enter-container {
  display: flex; /* Flexbox 활성화 */
  flex-direction: column; /* 요소를 위아래로 배치 */
  justify-content: center; /* 세로 중앙 정렬 */
  align-items: center; /* 가로 중앙 정렬 */
  gap: 1rem; /* 요소 간 간격 */
  height: 100%; /* 컨테이너의 전체 높이 사용 */
}

.enter-container fwb-button {
  padding: 1rem 2rem; /* 버튼 크기 확대 */
  font-size: 1.2rem; /* 버튼 글자 크기 확대 */
  border-radius: 8px; /* 버튼 모서리 둥글게 */
}

.enter-container p {
  font-size: 1.5rem; /* 텍스트 크기 확대 */
  font-weight: bold; /* 텍스트 볼드 처리 */
  text-align: center; /* 텍스트 정렬 */
}
@media (max-width: 768px) {
  .side-by-side-container {
    flex-direction: column; /* 위아래로 배치 */
    justify-content: center; /* 수직 정렬 */
    align-items: center; /* 가로 정렬 중앙 */
    gap: 4rem; /* 카드 간 간격 */
  }

  .card {
    width: 100%; /* 카드가 화면 크기에 꽉 차도록 설정 */
    max-width: 90%; /* 최대 너비 제한 */
    min-width: 400px;
  }
}
</style>
