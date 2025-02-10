<template>
  <fwb-modal v-if="visible" @close="closeModal">
    <template #header>
      <h3 class="text-lg font-medium align-center">{{ notice.title }}</h3>
    </template>

    <!-- 모달  -->
    <template #body>
      <div class="p-6">
        <!-- 작성자 및 작성일 정보 -->
        <div class="flex justify-between items-center border-b pb-2 mb-4">
          <div class="flex items-center space-x-2">
            <!-- 아이콘 (원하는 경우) -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <p class="text-sm text-gray-600">
              <span class="font-semibold">작성자:</span> {{ notice.writer }}
            </p>
          </div>
          <p class="text-sm text-gray-500">
            <span class="font-semibold">작성일:</span>
            {{ new Date(notice.createdAt).toLocaleString() }}
          </p>
        </div>

        <!-- 공지사항 내용 -->
        <div class="text-gray-700 text-base leading-relaxed">
          {{ notice.content }}
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end">
        <fwb-button color="green" @click="closeModal"> 닫기 </fwb-button>
      </div>
    </template>
  </fwb-modal>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
import { FwbTextarea, FwbModal, FwbButton } from "flowbite-vue";

const props = defineProps({
  visible: Boolean,
  notice: Object,
});

const emit = defineEmits(["close"]);

function closeModal() {
  emit("close");
}
</script>
