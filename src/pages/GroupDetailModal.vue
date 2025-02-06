<template>
  <div
    v-if="isLoading"
    class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50"
  >
    <fwb-spinner size="12" />
    <div class="text-xl text-gray-800">가입중...</div>
  </div>
  <fwb-modal v-if="isOpen" @close="closeModal">
    <template #header>
      <div class="text-lg font-bold">그룹 상세 정보</div>
    </template>

    <template #body>
      <div class="flex gap-4">
        <!-- 그룹 이미지 -->
        <img
          :src="group?.image || '/default.jpg'"
          alt="그룹 이미지"
          class="w-32 h-32 object-cover rounded-md border border-gray-300"
        />

        <div class="flex-1 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >그룹명</label
            >
            <span
              class="inline-block text-gray-700 bg-gray-200 border border-gray-300 p-2 rounded w-80"
            >
              {{ group.name }}
            </span>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >그룹 설명</label
            >
            <div
              class="bg-gray-200 border border-gray-300 p-2 rounded w-80 max-h-62 overflow-auto whitespace-pre-wrap"
            >
              {{ group.description }}
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >현재 인원</label
            >
            <div
              class="inline-block text-gray-700 bg-gray-200 border border-gray-300 p-2 rounded w-20"
            >
              {{ memberCount }}
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >개설일자</label
            >
            <div
              class="inline-block text-gray-700 bg-gray-200 border border-gray-300 p-2 rounded w-28"
            >
              {{ group.createdAt }}
            </div>
          </div>
          <div v-if="group?.hasPassword" class="w-56">
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >🔒비밀번호</label
            >
            <fwb-input type="password" v-model="password" />
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-center">
        <fwb-button color="green" @click="joinGroup">가입하기</fwb-button>
      </div>
    </template>
  </fwb-modal>
</template>

<script setup>
import { computed, ref } from "vue";
import { FwbModal, FwbInput, FwbButton, FwbSpinner } from "flowbite-vue";
import { useRouter } from "vue-router";
import axiosInstance from "../api/axiosInstance_test";
import { useToast } from "vue-toastification";
const isLoading = ref(false);
const toast = useToast();

const props = defineProps({
  isOpen: Boolean,
  group: Object,
});

const emit = defineEmits(["close"]);
const router = useRouter();

const memberCount = computed(
  () => `${props.group.memberCount} / ${props.group.maxCapacity}`
);
const password = ref(""); // 비밀번호 입력값 (비밀번호가 있는 경우)

const closeModal = () => {
  emit("close");
};

// 가입 요청
const joinGroup = async () => {
  // 버튼 클릭 시 즉시 모달 닫기 (낙관적 업데이트)
  closeModal();
  isLoading.value = true;
  try {
    const groupId = props.group.id;
    const token = localStorage.getItem("access");

    let requestData = {};
    if (props.group.hasPassword) {
      requestData.password = password.value; // 비밀번호가 있으면 requestBody에 추가
    }

    const response = await axiosInstance.post(
      `/groups/${groupId}/join`,
      requestData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      router.push({ name: "GroupDetail", params: { groupId: groupId } });
      toast.success("가입완료! 그룹페이지로 이동합니다.", { timeout: 2000 });
    } else {
      toast.error("가입 실패: " + response.data.message, {
        timeout: 2000,
      });
    }
  } catch (error) {
    toast.error(
      "오류가 발생했습니다: " +
        (error.response?.data?.message || error.message),
      { timeout: 2000 }
    );
  } finally {
    isLoading.value = false;
  }
};
</script>
