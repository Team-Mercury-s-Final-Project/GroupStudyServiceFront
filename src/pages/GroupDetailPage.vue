<template>
  <div class="group-container" v-if="groupData">
    <fwb-avatar size="lg" :img="groupData.image"> </fwb-avatar>
    <div class="group-info-container">
      <div class="info-item">
        <a>{{ groupData.name }}</a>
      </div>
      <div class="info-item">
        <fwb-tooltip placement="top">
          <template #trigger>
            <svg
              class="h-8 w-8 text-neutral-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </template>
          <template #content> {{ groupData.description }} </template>
        </fwb-tooltip>
      </div>
      <div class="info-item" >
        <svg
          class="h-8 w-8 text-neutral-500"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" />
          <path
            d="M9 7 h-3a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-3"
          />
          <path d="M9 15h3l8.5 -8.5a1.5 1.5 0 0 0 -3 -3l-8.5 8.5v3" />
          <line x1="16" y1="5" x2="19" y2="8" />
        </svg>
      </div>
    </div>
    
  </div>
  <div v-else>
    <p>Loading...</p>
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
import {
  FwbAvatar,
  FwbButton,
  FwbCard,
  FwbButtonGroup,
  FwbTooltip,
  FwbModal,
} from "flowbite-vue";
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import api from "../api";

// Router에서 동적 파라미터(groupId)를 가져옴
const route = useRoute();
const groupId = ref(Number(route.params.groupId)); // 숫자로 변환하여 저장

// 탭 데이터 및 선택된 탭 상태
const tabs = ref([
  { name: "일간", content: "일간 랭킹을 보여줍니다." },
  { name: "주간", content: "주간 랭킹을 보여줍니다." },
  { name: "월간", content: "월간 랭킹을 보여줍니다." },
]);

const selectedTab = ref(0);
function selectTab(index) {
  selectedTab.value = index;
}

// 그룹 데이터 상태
const groupData = ref(null);

// API 호출 함수
async function fetchGroupData() {
  try {
    if (!groupId.value) {
      throw new Error("Invalid Group ID");
    }
    const response = await api.get(`/groups/${groupId.value}`); // API 호출
    groupData.value = response.data.data; // 응답 데이터 저장
    console.log("Fetched Group Data:", groupData.value);
  } catch (error) {
    console.error("Failed to fetch group details:", error);
  }
}

// Group ID가 변경될 때마다 데이터를 다시 로드
watch(groupId, fetchGroupData);

// 컴포넌트가 마운트될 때 API 호출
onMounted(fetchGroupData);
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
