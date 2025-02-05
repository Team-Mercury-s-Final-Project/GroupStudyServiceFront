<template>
  <fwb-modal v-if="visible" @close="$emit('close')">
    <template #header>
      <div class="flex items-center text-lg">
        {{ isEditMode ? "그룹 정보 수정" : "그룹 생성" }}
      </div>
    </template>

    <template #body>
      <fwb-input
        v-model="localGroupData.name"
        placeholder="그룹 이름을 입력하세요"
        label="그룹 이름"
      />
      <br />
      <fwb-input
        v-model="localGroupData.description"
        placeholder="그룹에 대한 소갯말를 입력하세요"
        label="소개글"
      />
      <br />
      <fwb-file-input
        v-model="localGroupData.image"
        label="Upload file"
        @change="handleFileUpload"
      >
        <p class="!mt-1 text-sm text-gray-500 dark:text-gray-300">
          JPEG, PNG, WEBP
        </p>
      </fwb-file-input>
      <br />
      <fwb-input
        v-if="localGroupData"
        v-model.number="localGroupData.maxCapacity"
        placeholder=""
        label="최대인원"
        type="number"
      />
      <p v-if="!isMaxCapacityValid" class="text-sm text-red-500">
        최대인원은 2에서 50 사이여야 합니다.
      </p>
      <br />
      <div class="radio-container">
        <div class="radio-row">
          <p class="label text-sm">공개 여부</p>
          <div class="radio-group">
            <fwb-radio
              v-model="localGroupData.isPublic"
              label="공개"
              value="true"
            />
            <fwb-radio
              v-model="localGroupData.isPublic"
              label="비공개"
              value="false"
            />
          </div>
        </div>
      </div>
      <br />
      <div class="radio-container">
        <div class="radio-row">
          <p class="label text-sm">비밀번호 여부</p>
          <div class="radio-group">
            <fwb-radio
              v-model="localGroupData.hasPassword"
              label="있음"
              :value="true"
            />
            <fwb-radio
              v-model="localGroupData.hasPassword"
              label="없음"
              :value="false"
            />
          </div>
        </div>
      </div>
      <br />
      <fwb-input
        v-if="localGroupData.hasPassword === true"
        v-model="localGroupData.password"
        type="password"
        placeholder="비밀번호 입력"
        label="비밀번호"
      />
    </template>

    <template #footer>
      <div class="flex justify-between">
        <fwb-button @click="$emit('close')" color="alternative">
          나가기
        </fwb-button>
        <fwb-button
          :disabled="!isMaxCapacityValid || isFileUploading"
          @click="submitGroup"
          color="green"
        >
          {{ isEditMode ? "변경하기" : "생성하기" }}
        </fwb-button>
      </div>
    </template>
  </fwb-modal>
</template>

<script setup>
import { ref, reactive, watch, computed } from "vue";
import axiosInstance from "../api/axiosInstance_test";
import { useToast } from "vue-toastification";

import {
  FwbAvatar,
  FwbButton,
  FwbCard,
  FwbButtonGroup,
  FwbTooltip,
  FwbModal,
  FwbInput,
  FwbFileInput,
  FwbRadio,
} from "flowbite-vue";
const toast = useToast();
const isMaxCapacityValid = computed(() => {
  // const { maxCapacity } = props.groupData;
  const { maxCapacity } = localGroupData;
  localGroupData;
  return maxCapacity >= 2 && maxCapacity <= 50;
});

const props = defineProps({
  visible: Boolean,
  mode: { type: String, required: true },
  groupData: {
    type: Object,
    required: true,
    default: () => ({ maxCapacity: 0 }),
  },
});

const { groupData } = props; // groupData만 구조 분해
// 부모의 groupData를 로컬 복사본으로 사용
const localGroupData = reactive({ ...props.groupData });

// 부모의 데이터가 바뀔 때마다 로컬 데이터도 업데이트
watch(
  () => props.groupData,
  (newData) => {
    Object.assign(localGroupData, newData);
  }
);
const isEditMode = computed(() => props.mode === "edit");
const emit = defineEmits(["submit", "close"]);

// 파일 업로드 후 새 이미지 URL을 로컬 복사본에 반영해야 합니다.
let newImageUrl = groupData.image;

function submitGroup() {
  localGroupData.image = newImageUrl;
  console.log("업데이트 할 데이터 : ", localGroupData);
  emit("submit", { ...localGroupData }); // 이벤트 전송
  emit("close");
}

// 파일 업로드 상태를 관리하는 반응형 변수
const isFileUploading = ref(false);

async function handleFileUpload(event) {
  const isFileUploadingId = toast.warning("이미지 업로드중입니다...", {
    timeout: false,
  });

  try {
    isFileUploading.value = true; // 업로드 시작 시 true로 설정
    const file = event.target.files[0];
    if (!file) {
      alert("파일이 선택되지 않았습니다.");
      return;
    }

    // FormData에 파일 추가
    const formData = new FormData();
    formData.append("file", file);

    // 이미지 업로드 요청 전송
    const response = await axiosInstance.post("/files/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.status === 200) {
      // 업로드 성공 시 URL 저장
      newImageUrl = response.data.data.url;
      toast.success("이미지가 성공적으로 업로드되었습니다.", { timeout: 2000 });
    } else {
      toast.error("이미지 업로드 실패: " + response.data.message, {
        timeout: 2000,
      });
    }
  } catch (error) {
    toast.error(
      "이미지 업로드 중 오류가 발생했습니다. " +
        (error.response?.data?.message || error.message),
      { timeout: 2000 }
    );
  } finally {
    isFileUploading.value = false; // 업로드 완료 후 false로 설정
    toast.dismiss(isFileUploadingId);
  }
}
</script>
