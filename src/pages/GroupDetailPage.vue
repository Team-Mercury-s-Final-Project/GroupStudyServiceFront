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
      <!-----------------------modal start------------------------------------>
      <div class="info-item">
        <svg
          class="h-8 w-8 text-neutral-500"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
          @click="openModal('groupEdit')"
        >
          <path stroke="none" d="M0 0h24v24H0z" />
          <path
            d="M9 7 h-3a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-3"
          />
          <path d="M9 15h3l8.5 -8.5a1.5 1.5 0 0 0 -3 -3l-8.5 8.5v3" />
          <line x1="16" y1="5" x2="19" y2="8" />
        </svg>
        <fwb-modal v-if="activeModal === 'groupEdit'" @close="closeModal">
          <template #header>
            <div class="flex items-center text-lg">그룹 정보 수정</div>
          </template>
          <template #body>
            <fwb-input
              v-model="groupData.name"
              placeholder="그룹 이름을 입력하세요"
              label="그룹 이름"
            />
            <br />
            <fwb-input
              v-model="groupData.description"
              placeholder="그룹에 대한 소갯말를 입력하세요"
              label="소개글"
            />
            <br />
            <fwb-file-input v-model="groupData.image" label="Upload file">
              <p class="!mt-1 text-sm text-gray-500 dark:text-gray-300">
                JPG, JPEG, PNG, WEBP, SVG, BMP
              </p>
            </fwb-file-input>
            <br />
            <fwb-input
              v-model.number="groupData.maxCapacity"
              placeholder=""
              label="최대인원"
              type="number"
            />
            <p v-if="!isMaxCapacityValid" class="text-sm text-red-500">
              최대인원은 2에서 50 사이여야 합니다.
            </p>
            <br />
            <div class="radio-container">
              <div class="radio-row">
                <p class="label text-sm">공개 여부</p>
                <div class="radio-group">
                  <fwb-radio
                    v-model="groupData.isPublic"
                    label="공개"
                    value="true"
                  />
                  <fwb-radio
                    v-model="groupData.isPublic"
                    label="비공개"
                    value="false"
                  />
                </div>
              </div>
            </div>
            <br />
            <div class="radio-container">
              <div class="radio-row">
                <p class="label text-sm">비밀번호 여부</p>
                <div class="radio-group">
                  <fwb-radio
                    v-model="groupData.hasPassword"
                    label="있음"
                    :value="true"
                  />
                  <fwb-radio
                    v-model="groupData.hasPassword"
                    label="없음"
                    :value="false"
                  />
                </div>
              </div>
            </div>
            <br />
            <fwb-input
              v-if="groupData.hasPassword === 'true'"
              v-model="groupData.password"
              placeholder="비밀번호 입력"
              label="비밀번호"
            />
          </template>

          <template #footer>
            <div class="flex justify-between">
              <fwb-button @click="closeModal" color="alternative">
                나가기
              </fwb-button>
              <fwb-button
                :disabled="!isMaxCapacityValid"
                @click="updateGroup"
                color="green"
              >
                변경하기
              </fwb-button>
            </div>
          </template>
        </fwb-modal>
      </div>
      <!-----------------------modal end------------------------------------>
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
        <div class="title flex items-center justify-between relative">
          <!-- 중앙에 위치한 공지사항 -->
          <span class="absolute left-1/2 -translate-x-1/2">공지사항</span>
          <!-- 오른쪽 상단 버튼 -->
          <button
            @click="openModal('noticeCreate')"
            class="w-8 h-8 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-blue-300 flex items-center justify-center text-lg ml-auto"
          >
            +
          </button>
          <NoticeCreateModal
            :visible="activeModal === 'noticeCreate'"
            @close="closeModal"
          />
        </div>
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
            <fwb-button @click="$router.push(`${groupId}/focusroom`)"
              >입장하기</fwb-button
            >
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
  FwbInput,
  FwbFileInput,
  FwbRadio,
} from "flowbite-vue";

import { ref, onMounted, watch, computed } from "vue";
import { useRoute } from "vue-router";
import api from "../api";
import NoticeCreateModal from "./NoticeCreateModal.vue";
// --------------------modal start----------------
// maxCapacity 유효성 검사
const isMaxCapacityValid = computed(() => {
  return groupData.value.maxCapacity >= 2 && groupData.value.maxCapacity <= 50;
});
const isPublic = ref();
const hasPassword = ref();

// 단일 상태 변수로 모달 관리
const activeModal = ref(null);

function openModal(modalName) {
  activeModal.value = modalName; // 열고자 하는 모달의 이름을 설정
}

function closeModal() {
  activeModal.value = null; // 모든 모달을 닫음
}

// Router에서 동적 파라미터(groupId)를 가져옴
const route = useRoute();
const groupId = route.params.groupId; // pathVariable에서 groupId 추출

// 그룹 데이터 상태
const groupData = ref(null);

// API 호출
onMounted(async () => {
  try {
    const response = await api.get(`/groups/${groupId}`);
    groupData.value = response.data.data; // API 응답 저장
    console.log(groupData.value);
  } catch (error) {
    console.error("Failed to fetch group details:", error);
  }
});
// 그룹 수정 요청 함수
async function updateGroup() {
  try {
    const response = await api.put(`/groups/${groupId}`, groupData.value);
    console.log("변경 완료:", response.data);
    closeModal(); // 모달 닫기
  } catch (error) {
    console.error("그룹 수정 실패:", error);
  }
}
// --------------------modal end----------------
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
.radio-row {
  display: flex;
  align-items: center;
  gap: 1rem; /* 텍스트와 버튼 간 간격 */
  width: 100%;
}

/* 텍스트 라벨 고정 폭 */
.label {
  width: 120px; /* 고정된 폭으로 통일 */
  min-width: 120px; /* 작은 화면에서도 유지 */
  text-align: left;
}

/* 라디오 버튼 그룹 */
.radio-group {
  display: flex;
  flex: 1; /* 나머지 공간을 차지 */
  justify-content: flex-start; /* 왼쪽 정렬 */
  gap: 2rem; /* 버튼 간 간격 */
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
