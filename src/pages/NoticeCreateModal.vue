<template>
  <fwb-modal v-if="visible" @close="$emit('close')">
    <template #header>
      <h3 class="text-lg font-medium">공지사항 작성</h3>
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
        <fwb-button color="green" @click="submitNotice"> 작성하기 </fwb-button>
      </div>
    </template>
  </fwb-modal>
</template>
<script setup>
import { ref, watch } from "vue";
import { FwbButton, FwbModal, FwbInput, FwbTextarea } from "flowbite-vue";

const emit = defineEmits(["close", "submit"]);
const props = defineProps({ visible: Boolean });

const localNoticeData = ref({ title: "", content: "" });

// 모달이 열릴 때마다 localNoticeData를 초기화
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      localNoticeData.value = { title: "", content: "" };
    }
  }
);

async function submitNotice() {
  try {
    
    // API 요청 후 성공 시 이벤트 전송
    emit("submit", localNoticeData.value);
    emit("close");
  } catch (error) {
    console.error("공지사항 작성 오류:", error);
  }
}
</script>
