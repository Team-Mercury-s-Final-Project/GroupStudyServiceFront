<template>
  <div class="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
    <!-- 로딩 상태 화면 -->
    <div
      v-if="isLoading"
      class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50"
    >
      <div class="text-xl text-gray-800">내 정보 로딩 중...</div>
    </div>

    <!-- 메인 화면 -->
    <div class="max-w-3xl w-full bg-white shadow-lg rounded-lg p-6">
      <!-- Profile Section -->
      <div class="flex items-center space-x-6 mb-6">
        <img
          :src="userInfo.profileImgUrl"
          alt="User Profile Picture"
          class="w-24 h-24 rounded-full object-cover"
        />
        <div class="flex flex-col relative">
          <div class="text-xl font-semibold text-gray-800">
            {{ userInfo.nickname }}
          </div>
          <button
            v-if="!isEditing"
            @click="toggleEditing('nickname')"
            class="absolute top-0 right-0 text-gray-500 hover:text-gray-700"
          >
            <i
              class="fas fa-pencil-alt"
              style="position: relative; left: 32vw; top: -6vh"
            ></i>
          </button>
        </div>
      </div>

      <!-- Edit & Save Section -->
      <div class="space-y-4">
        <!-- 닉네임 수정 -->
        <div class="flex items-center space-x-4">
          <label for="nickname" class="text-gray-700 font-medium w-32"
            >닉네임</label
          >
          <input
            id="nickname"
            v-model="userInfo.nickname"
            :disabled="!isEditing || editField !== 'nickname'"
            type="text"
            class="w-full p-2 border border-gray-300 rounded-md"
            placeholder="닉네임을 입력하세요"
          />
        </div>

        <!-- 이메일 수정 불가 -->
        <div class="flex items-center space-x-4">
          <label for="email" class="text-gray-700 font-medium w-32"
            >이메일</label
          >
          <input
            id="email"
            v-model="userInfo.email"
            disabled
            type="text"
            class="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <!-- 가입일 수정 불가 -->
        <div class="flex items-center space-x-4">
          <label for="created_at" class="text-gray-700 font-medium w-32"
            >가입날짜</label
          >
          <input
            id="created_at"
            v-model="userInfo.created_at"
            disabled
            type="text"
            class="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <!-- 파일 업로드 -->
        <div class="flex items-center space-x-4">
          <label for="profileImg" class="text-gray-700 font-medium w-32"
            >프로필 사진</label
          >
          <input
            id="profileImg"
            type="file"
            @change="handleFileUpload"
            :disabled="!isEditing"
            class="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <!-- 수정/저장 버튼 -->
        <div v-if="isEditing" class="flex justify-end space-x-4">
          <button
            @click="saveChanges"
            :disabled="!isEditing"
            class="w-1/3 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-200"
          >
            저장
          </button>
        </div>

        <!-- 탈퇴/수정 버튼 -->
        <div class="flex justify-end space-x-4">
          <button
            v-if="!isEditing"
            @click="showModal('탈퇴')"
            class="w-1/3 bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition duration-200"
          >
            탈퇴
          </button>
        </div>
      </div>
    </div>

    <!-- 공통 모달 -->
    <div
      v-if="modalData.visible"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
      <div class="bg-white w-96 rounded-lg shadow-lg p-6 space-y-4">
        <h2 class="text-xl font-semibold text-gray-800">
          {{ modalData.title }}
        </h2>
        <p class="text-gray-600">{{ modalData.message }}</p>
        <div v-if="modalData.type === '탈퇴'" class="space-y-4">
          <input
            v-model="confirmationInput"
            type="text"
            class="w-full p-2 border border-gray-300 rounded-md"
            placeholder="탈퇴하겠습니다를 입력하세요"
          />
          <div class="flex justify-end space-x-4">
            <button
              @click="closeModal"
              class="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
            >
              취소
            </button>
            <button
              @click="deleteAccount"
              :disabled="confirmationInput !== '탈퇴하겠습니다'"
              class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-300"
            >
              탈퇴
            </button>
          </div>
        </div>
        <div v-else class="flex justify-end">
          <button
            @click="closeModal"
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "../api/axiosInstance";
import { computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

const store = useStore();
const router = useRouter();
const isLoggedIn = computed(() => store.state.isLoggedIn);

const userInfo = ref({
  nickname: "",
  email: "",
  created_at: "",
  profileImgUrl: "",
});

const originalUserInfo = ref({ ...userInfo.value });
const isEditing = ref(false);
const isLoading = ref(true);
const selectedFile = ref(null);
const confirmationInput = ref("");
const editField = ref(""); // 수정할 필드를 추적하는 변수

const modalData = ref({
  visible: false,
  title: "",
  message: "",
  type: "",
});

const toggleEditing = (field) => {
  if (isEditing.value) {
    userInfo.value = { ...originalUserInfo.value };
  } else {
    editField.value = field; // 수정할 필드 저장
  }
  isEditing.value = !isEditing.value;
};

const fetchUserInfo = async () => {
  try {
    const response = await axios.get("/api/user-info");
    console.log(response);
    userInfo.value = response.data;
    originalUserInfo.value = { ...userInfo.value };
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const handleFileUpload = async (e) => {
  if (e.target.files[0]) {
    selectedFile.value = e.target.files[0];
    modalData.value = {
      visible: true,
      title: "이미지 선택 완료",
      message: "이미지가 선택되었습니다.",
    };
  }
};

const saveChanges = async () => {
  try {
    const formData = new FormData();
    if (editField.value === "nickname")
      formData.append("nickname", userInfo.value.nickname);

    if (selectedFile.value) formData.append("profileImg", selectedFile.value);
    const response = await axios.post("/api/user-info", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.status === 200) {
      modalData.value = {
        visible: true,
        title: "수정 완료",
        message: "회원 정보가 수정이 완료되었습니다.",
      };
      fetchUserInfo();
    }
  } catch (error) {
    modalData.value = {
      visible: true,
      title: "수정 실패",
      message: "회원 정보 수정이 실패하였습니다.",
    };
  } finally {
    originalUserInfo.value = { ...userInfo.value };
    isEditing.value = false;
    editField.value = ""; // 수정 완료 후 필드 초기화
  }
};

const showModal = (type) => {
  modalData.value = {
    visible: true,
    title: type === "탈퇴" ? "회원 탈퇴" : "알림",
    message:
      type === "탈퇴" ? '탈퇴하려면 "탈퇴하겠습니다"를 입력해주세요.' : "",
    type,
  };
};

const closeModal = () => {
  modalData.value.visible = false;
};

const deleteAccount = async () => {
  try {
    const response = await axios.delete("/api/user-info");

    if (response.status === 200) {
      // 탈퇴 완료 후 처리
      modalData.value = {
        visible: true,
        title: "탈퇴 완료",
        message: "회원 탈퇴가 완료되었습니다.",
      };

      // 1. 쿠키에서 리프레시 토큰 제거
      document.cookie =
        "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      // 2. 로컬 스토리지에서 액세스 토큰 제거
      localStorage.removeItem("accessToken");

      // 로그아웃 처리 (예: store에 액션을 디스패치하여 상태 변경)
      store.dispatch("logout");

      // 2초 대기 후 리디렉션션
      setTimeout(() => {
        router.push("/oauth2Login");
      }, 2000);
    }
  } catch (error) {
    console.error(error);
  }
};

onMounted(fetchUserInfo);
</script>
