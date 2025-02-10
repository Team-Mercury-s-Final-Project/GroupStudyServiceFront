<template>
  <div class="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
    <!-- 로딩 상태 화면 -->
    <div
      v-if="isLoading"
      class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50"
    >
      <fwb-spinner size="12" />
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
        <!-- 오류 메시지 출력 -->
        <p
          v-if="nicknameError"
          class="text-red-500 text-sm mt-1"
          style="position: relative; left: 8vw"
        >
          닉네임은 특수문자 제외 3자 이상 설정해주세요.
        </p>

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
            @click="openModal"
            class="w-1/3 bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition duration-200"
          >
            탈퇴
          </button>
        </div>
      </div>
    </div>

    <!-- 모달 컴포넌트 연결 -->
    <UserJoinedGroupModal
      v-if="isModalVisible"
      :visible="isModalVisible"
      :modalData="modalData"
      :groupList="groupList"
      @closeModal="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axiosInstance from "../api/axiosInstance";
import { computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import UserJoinedGroupModal from "../components/modal/UserJoinedGroupModal.vue";
import { FwbSpinner } from "flowbite-vue";

const store = useStore();
const router = useRouter();
const isLoggedIn = computed(() => store.state.isLoggedIn);
const toast = useToast();
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
const FileValidError = ref(false);

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
    const response = await axiosInstance.get("/user-info");

    // console.log(response);
    userInfo.value = response.data;
    originalUserInfo.value = { ...userInfo.value };
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

// 이미지 검증 규칙
const handleFileUpload = async (e) => {
  const file = e.target.files[0];

  if (file) {
    // 허용되는 이미지 확장자
    const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/jpg"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    // 확장자 및 파일 크기 체크
    if (!allowedTypes.includes(file.type)) {
      toast.error("허용되지 않는 이미지 형식입니다. (PNG, JPEG, WEBP만 가능)");
      FileValidError.value = true;
      return;
    }

    if (file.size > maxSize) {
      toast.error("이미지 크기는 10MB 이하로 업로드 해주세요.");
      FileValidError.value = true;
      return;
    }

    selectedFile.value = file;
    FileValidError.value = false;
    toast.success("이미지가 선택되었습니다.");
  }
};

// 닉네임 검증 규칙
const nicknameError = computed(() => {
  const nickname = userInfo.value.nickname;
  return !nickname || !/^[a-zA-Z가-힣\d]{3,}$/.test(nickname);
});

const saveChanges = async () => {
  if (!nicknameError.value && !FileValidError.value) {
    try {
      const formData = new FormData();
      if (editField.value === "nickname")
        formData.append("nickname", userInfo.value.nickname);

      if (selectedFile.value) formData.append("profileImg", selectedFile.value);
      const response = await axiosInstance.post("/user-info", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 200) {
        toast.success("회원 정보 수정이 완료되었습니다.");
        fetchUserInfo();
        originalUserInfo.value = { ...userInfo.value };
        isEditing.value = false;
        editField.value = ""; // 수정 완료 후 필드 초기화
      } else {
        console.log("response: " + response);
      }
    } catch (error) {
      toast.error("회원 정보 수정이 실패하였습니다.");
      userInfo.value = { ...originalUserInfo.value };
    }
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

// const closeModal = () => {
//   modalData.value.visible = false;
// };

const deleteAccount = async () => {
  try {
    const response = await axiosInstance.delete("/user-info");

    if (response.status === 200) {
      // 탈퇴 완료 후 처리
      modalData.value = {
        visible: true,
        title: "탈퇴 완료",
        message: "회원 탈퇴가 완료되었습니다.",
      };

      localStorage.removeItem("access");
      store.dispatch("logout");
      setTimeout(() => {
        router.push("/oauth2Login");
      }, 2000);
    }
  } catch (error) {
    console.error(error);
  }
};

// 모달 visibility 상태
const isModalVisible = ref(false);

// 모달에 전달할 데이터
const modalData = ref({
  title: "회원 탈퇴",
  message:
    "※ 현재 가입된 모든 그룹에서 탈퇴 처리되며, 그룹의 위임장인 경우 반드시 다른 구성원에게 권한을 위임해야 합니다. 권한 위임 대상자는 지정이 가능합니다.",
  type: "탈퇴",
});

const groupList = ref([]);

// 모달 열기
const openModal = async () => {
  try {
    const response = await axiosInstance.get("/user/joinGroup-info");
    if (response.status === 200) {
      groupList.value = response.data.data;
      // console.log("groupList.value: " + JSON.stringify(groupList.value));
      isModalVisible.value = true;
    }
  } catch (error) {
    console.error(error);
  }
};

// 모달 닫기
const closeModal = () => {
  isModalVisible.value = false;
};

onMounted(fetchUserInfo);
</script>
