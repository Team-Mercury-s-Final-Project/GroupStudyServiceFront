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
import { ref, reactive, watch } from "vue";
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

// const localNoticeData = ref({ ...props.noticeData });

// reactive를 사용하여 localNoticeData를 생성
const localNoticeData = reactive({ ...props.noticeData });
// 부모로부터 받은 noticeData가 변경될 때마다 localNoticeData를 업데이트
watch(
  () => props.noticeData,
  (newNoticeData) => {
    Object.assign(localNoticeData, newNoticeData);
  },
  { immediate: true }
);

async function updateNotice() {
  try {
    // console.log("수정 데이터:", localNoticeData);
    emit("submit", localNoticeData);
    emit("close");
  } catch (error) {
    console.error("공지사항 수정 오류:", error);
  }
}
</script>
