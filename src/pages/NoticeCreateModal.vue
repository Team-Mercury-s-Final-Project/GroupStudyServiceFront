<template>
  <fwb-modal v-if="visible" @close="$emit('close')">
    <template #header>
      <h3 class="text-lg font-medium">공지사항 작성</h3>
    </template>

    <template #body>
      <div class="space-y-4">
        <fwb-input
          v-model="title"
          label="제목"
          placeholder="공지사항 제목을 입력하세요"
        />
        <fwb-textarea
          v-model="content"
          label="내용"
          placeholder="공지사항 내용을 입력하세요"
        />
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end space-x-2">
        <fwb-button color="gray" @click="closeModal">취소</fwb-button>
        <fwb-button color="blue" @click="submitNotice">작성하기</fwb-button>
      </div>
    </template>
  </fwb-modal>
</template>

<script setup>
import { ref } from "vue";
import { FwbModal, FwbInput, FwbTextarea, FwbButton } from "flowbite-vue";

// 부모 컴포넌트에서 전달받는 상태 값과 이벤트
defineProps({
  visible: Boolean, // 부모로부터 상태를 받음
});

const title = ref("");
const content = ref("");

function closeModal() {
  isShowModal.value = false;
}

function openModal() {
  isShowModal.value = true;
}

function submitNotice() {
  if (title.value && content.value) {
    console.log('공지사항 작성 완료:', title.value, content.value);
    $emit('close');
  } else {
    alert('제목과 내용을 입력하세요.');
  }
}
</script>
