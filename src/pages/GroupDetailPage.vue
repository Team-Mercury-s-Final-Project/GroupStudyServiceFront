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
          @click="openModal('groupForm', 'edit')"
        >
          <path stroke="none" d="M0 0h24v24H0z" />
          <path
            d="M9 7 h-3a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-3"
          />
          <path d="M9 15h3l8.5 -8.5a1.5 1.5 0 0 0 -3 -3l-8.5 8.5v3" />
          <line x1="16" y1="5" x2="19" y2="8" />
        </svg>

        <!-- CreateGroupModal 컴포넌트 -->
        <GroupFormModal
          :visible="activeModal === 'groupForm'"
          :groupData="groupData"
          mode="edit"
          @close="closeModal"
          @submit="updateGroup"
        />
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
      <!-- 공지사항 시작 -->
      <fwb-card class="card">
        <div class="title flex items-center justify-between relative">
          <!-- 중앙에 위치한 공지사항 -->
          <span class="absolute left-1/2 -translate-x-1/2">공지사항</span>
          <!-- 오른쪽 상단 버튼 -->
          <button
            @click="openCreateModal"
            class="w-8 h-8 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-blue-300 flex items-center justify-center text-lg ml-auto"
          >
            +
          </button>
        </div>
        <!-- 공지사항 리스트에 스크롤 추가 -->
        <div class="card-content space-y-2 overflow-y-auto max-h-48 p-2">
          <div v-for="notice in notices" :key="notice.id" class="p-2 border-b">
            <div class="flex justify-between items-center">
              <h4 class="font-bold" @click="openNoticeDetail(notice)">
                {{ notice.title }}
              </h4>

              <!-- 수정 및 삭제 버튼 -->
              <div class="flex items-center space-x-2">
                <button
                  @click="openEditModal(notice)"
                  class="text-blue-500 hover:underline text-sm"
                >
                  수정
                </button>
                <button
                  @click="deleteNotice(notice.id)"
                  class="text-red-500 hover:underline text-sm"
                >
                  삭제
                </button>
              </div>
            </div>
            <span class="text-xs text-gray-500"
              >작성자: {{ notice.writer }}</span
            >
            <span class="text-xs text-gray-500 ml-4"
              >작성일: {{ new Date(notice.createdAt).toLocaleString() }}</span
            >
          </div>
        </div>
      </fwb-card>

      <!-- 공지사항 작성 모달 -->
      <NoticeCreateModal
        :visible="activeModal === 'noticeCreate'"
        @close="closeModal"
        @submit="addNotice"
      />
      <!-- 공지사항 수정 모달 -->
      <NoticeEditModal
        v-if="selectedNotice"
        :visible="activeModal === 'noticeEdit'"
        :noticeData="selectedNotice"
        @close="closeModal"
        @submit="updateNotice"
      />
      <!-- 공지사항 상세보기 모달 -->
      <NoticeDetailModal
        v-if="selectedNoticeDetail"
        :visible="activeModal === 'noticeDetail'"
        :notice="selectedNoticeDetail"
        @close="closeModal"
      />
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
import GroupFormModal from "./GroupFormModal.vue";
import { ref, onMounted, watch, computed } from "vue";
import { useRoute } from "vue-router";
import axiosInstance from "../api/axiosInstance_test";
import NoticeCreateModal from "./NoticeCreateModal.vue";
import NoticeEditModal from "./NoticeEditModal.vue";
import NoticeDetailModal from "./NoticeDetailModal.vue";

// --------------------modal start----------------
// content 자르기
function truncateText(text, length) {
  return text.length > length ? text.substring(0, length) + "..." : text;
}

// 단일 상태 변수로 모달 관리
const activeModal = ref(null);

function openModal(modalName) {
  activeModal.value = modalName; // 열고자 하는 모달의 이름을 설정
}
const selectedNoticeDetail = ref(null); // 상세보기 모달에 사용할 공지사항
// Router에서 동적 파라미터(groupId)를 가져옴
const route = useRoute();
const groupId = route.params.groupId; // pathVariable에서 groupId 추출
const token = localStorage.getItem("access");

const notices = ref([]); // 공지사항 리스트

async function deleteNotice(noticeId) {
  if (confirm("정말로 이 공지사항을 삭제하시겠습니까?")) {
    try {
      await axiosInstance.delete(`/groups/${groupId}/notices/${noticeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // 삭제 후 공지사항 리스트 갱신
      notices.value = notices.value.filter((n) => n.id !== noticeId);
      fetchNotices();
    } catch (error) {
      console.error("공지사항 삭제 실패:", error);
      alert("공지사항 삭제에 실패했습니다.");
    }
  }
}
// API 호출하여 공지사항 가져오기
async function fetchNotices() {
  try {
    const response = await axiosInstance.get(`/groups/${groupId}/notices`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    notices.value = response.data.data; // 응답 데이터 저장
  } catch (error) {
    console.error("공지사항 가져오기 중 오류 발생:", error);
  }
}
// 모달 열기 함수들
function openCreateModal() {
  activeModal.value = "noticeCreate";
}
const selectedNotice = ref({ title: "", content: "" });
function openEditModal(notice) {
  console.log("받아온 공지사항 데이터:", notice); // 확인용 콘솔 출력
  selectedNotice.value = notice;
  activeModal.value = "noticeEdit";
}
// 새로 추가: 공지사항 상세보기 모달 열기 함수
function openNoticeDetail(notice) {
  selectedNoticeDetail.value = notice;
  activeModal.value = "noticeDetail";
}

// 모달 닫기 함수 (모든 모달 닫기)
function closeModal() {
  activeModal.value = "";
  selectedNotice.value = null;
  selectedNoticeDetail.value = null;
}
// 공지사항 보기

// 공지사항 추가
async function addNotice(newNotice) {
  try {
    // API 요청 보내기
    const response = await axiosInstance.post(
      `/groups/${groupId}/notices`,
      newNotice,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 200) {
      notices.value.push(response.data);
      alert("공지사항이 추가되었습니다!");
      // 공지사항 리스트 갱신
      // 모달 닫기
      activeModal.value = "";
      await fetchNotices();
    } else {
      alert("공지사항 추가 실패: " + response.data.message);
    }
  } catch (error) {
    console.error("공지사항 추가 중 오류 발생:", error);
    alert(
      "오류가 발생했습니다: " + (error.response?.data?.message || error.message)
    );
  }
  // closeModal();
}

// 공지사항 수정
async function updateNotice(selectedNotice) {
  try {
    const noticeId = selectedNotice.id;
    console.log("공지사항 ID:", noticeId); // 로그 출력 확인
    const token = localStorage.getItem("access");

    // API 요청
    const response = await axiosInstance.put(
      `/groups/${groupId}/notices/${noticeId}`,
      selectedNotice,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      alert("공지사항이 수정되었습니다!");

      // 공지사항 리스트 다시 가져오기
      await fetchNotices();

      // 모달 닫기
      closeModal();
    } else {
      alert("공지사항 수정 실패: " + response.data.message);
    }
  } catch (error) {
    console.error("공지사항 수정 중 오류 발생:", error);
    alert("오류가 발생했습니다.");
  }
}

// 컴포넌트가 마운트되면 API 호출
onMounted(() => {
  fetchNotices();
});

// 그룹 데이터 상태
const groupData = ref(null);

// API 호출
onMounted(async () => {
  try {
    const response = await axiosInstance.get(`/groups/${groupId}`);
    groupData.value = response.data.data; // API 응답 저장
    console.log(groupData.value);
  } catch (error) {
    console.error("Failed to fetch group details:", error);
  }
});
// 그룹 수정 요청 함수
async function updateGroup() {
  try {
    const response = await axiosInstance.put(
      `/groups/${groupId}`,
      groupData.value
    );
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
