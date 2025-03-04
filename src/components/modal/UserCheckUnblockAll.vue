<template>
  <div
    v-if="visible"
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
  >
    <div
      :class="[
        'bg-white rounded-lg shadow-lg p-6 space-y-4 h-auto',
        modalSizeClass,
      ]"
    >
      <h2 class="text-2xl font-bold text-gray-800">{{ modalData.title }}</h2>
      <p class="text-red-400 text-sm">{{ modalData.message }}</p>

      <div
        v-if="blockList && blockList.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 overflow-y-auto max-h-96"
      >
        <div
          v-for="blockUser in blockList"
          :key="blockUser.id"
          class="bg-white border border-gray-200 rounded-lg shadow-lg p-4"
        >
          <fwb-avatar :img="blockUser.image" rounded />
          <h3 class="text-sm font-bold text-gray-800">
            {{ blockUser.nickname }}
          </h3>
          <br />
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex justify-end space-x-4">
          <button
            @click="close"
            class="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
          >
            취소
          </button>
          <button
            @click="UnblockAllUser"
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-300"
          >
            해제
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { FwbAvatar } from "flowbite-vue";
import axiosInstance from "../../api/axiosInstance";
import { useToast } from "vue-toastification";

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  modalData: {
    type: Object,
    required: true,
  },
  blockList: {
    type: Array,
    required: true,
  },
});

// 'close' 이벤트를 부모에게 전달하기 위해 emit을 사용
const emit = defineEmits();
const toast = useToast();
const modalSizeClass = computed(() => {
  return props.blockList.length === 0 ? "w-[500px]" : "w-11/12 max-w-3xl";
});

// 모달 닫기
function close() {
  emit("closeModal");
}

// 차단 유저 전체 해제
const UnblockAllUser = async () => {
  try {
    const response = await axiosInstance.delete(`/users/blocks/`);
    if (response.status === 200) {
      emit("updateBlockList"); // 부모에게 업데이트 요청
      close();
      toast.success(`${props.blockList.length}명 차단 해제하였습니다.`);
    }
  } catch (error) {
    toast.error(`${blockList.length}명 차단 해제를 실패하였습니다.`);
  }
};
</script>
