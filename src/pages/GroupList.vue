<template>
  <div
    v-if="isCreating"
    class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50"
  >
    <fwb-spinner size="12" />
    <div class="text-xl text-gray-800">"그룹을 생성중입니다...."</div>
  </div>
  <div
    class="container mx-auto overflow-y-auto h-screen"
    @scroll="handleScroll"
  >
    <div class="p-4">
      <div class="flex items-center bg-gray-200 p-3 rounded-md">
        <div class="flex flex-grow items-center space-x-4">
          <!-- 검색창 -->
          <input
            type="text"
            v-model="searchText"
            @keyup.enter="searchGroups"
            placeholder="검색창"
            class="p-2 w-1/3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
          />

          <!-- 정렬 방식 선택 -->
          <div class="flex items-center space-x-2">
            <label for="sort" class="text-gray-700">정렬 방식</label>
            <select
              id="sort"
              v-model="sortOption"
              @change="searchGroups"
              class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            >
              <option value="createdAt_desc">최신순</option>
              <option value="createdAt_asc">오래된순</option>
              <option value="memberCount_asc">멤버 적은순</option>
              <option value="memberCount_desc">멤버 많은순</option>
            </select>
          </div>
        </div>

        <!-- 그룹 생성 버튼 -->
        <button
          @click="openModal('groupForm', 'create')"
          class="ml-auto text-2xl bg-gray-400 px-3 py-1 rounded-md hover:bg-gray-500"
        >
          +
        </button>
        <!-- 그룹 생성/수정 모달 -->
        <GroupFormModal
          v-if="activeModal === 'groupForm'"
          :visible="true"
          mode="create"
          :groupData="newGroupData"
          @close="closeCreateModal"
          @submit="createGroup"
        />
      </div>
      <!-- 로딩 중.... -->
      <div
        v-if="isLoading"
        class="absolute inset-0 flex items-center justify-center z-50"
      >
        <fwb-spinner size="12" />
      </div>
      <!-- 그룹 목록 -->
      <div class="grid grid-cols-3 gap-4 mt-4">
        <div
          v-for="group in studyGroups"
          :key="group.id"
          class="bg-gray-200 h-30 p-4 rounded-md flex transition-transform transform hover:scale-105 hover:bg-gray-300"
          @click="fetchGroupDetail(group.id)"
        >
          <div class="w-18 mr-3">
            <fwb-avatar size="lg" :img="group.image" />
          </div>
          <div class="flex flex-col">
            <span class="font-bold">{{ group.name }}</span>
            <span class="text-sm text-gray-600">{{
              truncateDescription(group.description)
            }}</span>
            <span class="font-bold text-xs text-gray-500">
              현재인원: {{ group.memberCount }} / {{ group.maxCapacity }}
            </span>
            <span class="text-xs text-gray-500"
              >개설일자: {{ group.createdAt.split("T")[0] }}</span
            >
            <span
              v-if="group.hasPassword"
              class="text-xs text-gray-500 flex items-center"
            >
              🔒 비밀번호 설정됨
            </span>
          </div>
        </div>
      </div>

      <!-- 그룹 상세정보 모달 -->
      <GroupDetailModal
        :isOpen="isModalOpen"
        :group="selectedGroup"
        @close="closeModal"
      />
    </div>
  </div>
</template>

<script setup>
import { FwbAvatar, FwbSpinner } from "flowbite-vue";
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router"; // useRouter 임포트
import GroupDetailModal from "./GroupDetailModal.vue";
import axiosInstance from "../api/axiosInstance";
import GroupFormModal from "./GroupFormModal.vue";
import { useToast } from "vue-toastification";

const toast = useToast();
// 라우터 인스턴스 생성
const router = useRouter();

const page = ref(0);
const isLoading = ref(false);
const isCreating = ref(false);
const isLast = ref(false);
const searchText = ref("");
const sortOption = ref("createdAt_desc");
const studyGroups = ref([]);

const isModalOpen = ref(false);
const selectedGroup = ref(null);

// ✅ 그룹 목록 불러오기
const fetchGroups = async () => {
  if (isLoading.value || isLast.value) return; // 요청 중일 때와 마지막 페이지일 때 추가 호출 방지
  isLoading.value = true;

  try {
    let sortParam = sortOption.value;
    let orderParam = null;

    if (sortOption.value === "createdAt_desc") {
      sortParam = "createdAt";
      orderParam = "desc";
    } else if (sortOption.value === "createdAt_asc") {
      sortParam = "createdAt";
      orderParam = "asc";
    } else if (sortOption.value === "memberCount_desc") {
      sortParam = "memberCount";
      orderParam = "desc";
    } else if (sortOption.value === "memberCount_asc") {
      sortParam = "memberCount";
      orderParam = "asc";
    }

    const response = await axiosInstance.get("/groups", {
      params: {
        keyword: searchText.value,
        sort: sortParam,
        direction: orderParam,
        page: page.value,
      },
    });
    studyGroups.value.push(...response.data.data.content);
    if (response.data.data.last === true) {
      isLast.value = true;
    }
  } catch (error) {
    console.error("스터디 그룹 목록을 불러오는 중 오류 발생:", error);
  } finally {
    isLoading.value = false;
  }
};
// ✅ 검색 API 호출 (Enter 입력 시)
const searchGroups = () => {
  page.value = 0; // 검색 시 첫 페이지로 초기화
  studyGroups.value = []; // 기존 데이터 초기화
  isLast.value = false;
  fetchGroups();
};

// ✅ 스크롤 이벤트 핸들링
const handleScroll = (event) => {
  const bottom =
    event.target.scrollHeight ===
    event.target.scrollTop + event.target.clientHeight;

  // 스크롤 끝에 도달했을 때 페이지를 증가시키고 데이터를 추가로 요청
  if (bottom && !isLoading.value) {
    page.value++; // 페이지 증가
    fetchGroups();
  }
};

const maxLength = 58; // 최대 길이 설정
const truncateDescription = (desc) => {
  return desc.length > maxLength ? desc.substring(0, maxLength) + "..." : desc;
};

const fetchGroupDetail = async (id) => {
  try {
    const response = await axiosInstance.get(`/groups/${id}`);
    selectedGroup.value = response.data.data;
    isModalOpen.value = true;
  } catch (error) {
    console.error("그룹 정보를 불러오는 중 오류 발생:", error);
  }
};

const closeModal = () => {
  isModalOpen.value = false;
};

// ✅ 그룹 생성 모달 불러오기

const activeModal = ref("");
const modalMode = ref("");
const newGroupData = ref({
  name: "",
  description: "",
  image: "",
  maxCapacity: 10,
  isPublic: true,
  hasPassword: false,
  password: "",
});

function openModal(modalName, mode) {
  const token = localStorage.getItem("access");
  if (!token) {
    toast.error("로그인이 필요합니다.", { timeout: 2000 });
    return;
  }

  activeModal.value = modalName;
  modalMode.value = mode;
}

function closeCreateModal() {
  activeModal.value = "";
  modalMode.value = "";
}

async function createGroup(groupData) {
  closeCreateModal();
  isCreating.value = true;
  // const loadingToastId = toast.warning("그룹을 생성중입니다.", {
  //   timeout: false,
  // });

  const payload = {
    name: groupData.name,
    description: groupData.description,
    maxCapacity: groupData.maxCapacity,
    isPublic: groupData.isPublic,
    hasPassword: groupData.hasPassword,
    password: groupData.hasPassword ? groupData.password : null,
    image: groupData.image,
  };
  // 보낼 데이터를 로그에 출력
  console.log("Payload being sent to API:", payload);

  try {
    // 백엔드로 그룹 생성 요청
    const response = await axiosInstance.post("/groups", payload);
    if (response.status === 200) {
      // API 응답에서 새로 생성된 그룹의 id 추출
      const newGroupId = response.data.data.id;
      // 생성된 그룹의 상세 페이지로 라우팅 이동
      router.push(`/groups/${newGroupId}`);
      toast.success("그룹 생성 완료! 그룹페이지로 이동합니다.", {
        timeout: 2000,
      });
    }
  } catch (error) {
    toast.error(
      "그룹 생성 실패: " +
        (error.response?.data?.message || error.message),
      { timeout: 2000 }
    );
  } finally {
    // toast.dismiss(loadingToastId);
    isCreating.value = false;
  }
}

// ✅ 컴포넌트가 마운트될 때 초기 데이터 가져오기
onMounted(() => {
  fetchGroups();
});
</script>

<style scoped>
/* 추가적인 스타일이 필요하면 여기에 작성 */
</style>
