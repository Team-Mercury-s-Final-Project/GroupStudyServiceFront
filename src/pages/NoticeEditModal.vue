<template>
  <fwb-modal v-if="visible" @close="$emit('close')">
    <template #header>
      <h3 class="text-lg font-medium">공지사항 수정</h3>
    </template>

    <!-- 모달  -->
    <template #body>
      <div class="space-y-4 text-left">
        <fwb-input
          v-model="localNoticeData.title"
          label="제목"
          placeholder="공지사항 제목을 입력하세요"
        />
        <br />
        <fwb-textarea
          v-model="localNoticeData.content"
          label="내용"
          placeholder="공지사항 내용을 입력하세요"
        />
      </div>
    </template>

    <template #footer>
      <div class="flex justify-between">
        <fwb-button @click="$emit('close')" color="alternative">
          나가기
        </fwb-button>
        <fwb-button color="green" @click="updateNotice"> 수정하기 </fwb-button>
      </div>
    </template>
  </fwb-modal>
</template>

<script setup>
import { ref } from "vue";
import { FwbButton, FwbModal, FwbInput, FwbTextarea } from "flowbite-vue";

const emit = defineEmits(["close", "submit"]);
const props = defineProps({
  visible: Boolean,
  noticeData: {
    type: Object,
    required: true,
    default: () => ({ title: "", content: "" }),
  },
});

const localNoticeData = ref({ ...props.noticeData });

async function updateNotice() {
  try {
    // API 요청 전 데이터 확인
    console.log("수정 데이터:", localNoticeData.value);
    // API 요청 후 성공 시 이벤트 전송
    emit("submit", localNoticeData.value);
  } catch (error) {
    console.error("공지사항 수정 오류:", error);
  }
}
</script>
