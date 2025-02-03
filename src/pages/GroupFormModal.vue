<template>
  <fwb-modal v-if="visible" @close="$emit('close')">
    <template #header>
      <div class="flex items-center text-lg">
        {{ isEditMode ? "그룹 정보 수정" : "그룹 생성" }}
      </div>
    </template>

    <template #body>
      <fwb-input
        v-model="groupData.name"
        placeholder="그룹 이름을 입력하세요"
        label="그룹 이름"
      />
      <br />
      <fwb-input
        v-model="groupData.description"
        placeholder="그룹에 대한 소갯말를 입력하세요"
        label="소개글"
      />
      <br />
      <fwb-file-input
        v-model="groupData.image"
        label="Upload file"
        @change="handleFileUpload"
      >
        <p class="!mt-1 text-sm text-gray-500 dark:text-gray-300">
          JPEG, PNG, WEBP
        </p>
      </fwb-file-input>
      <br />
      <fwb-input
        v-if="groupData"
        v-model.number="groupData.maxCapacity"
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
            <fwb-radio v-model="groupData.isPublic" label="공개" value="true" />
            <fwb-radio
              v-model="groupData.isPublic"
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
              v-model="groupData.hasPassword"
              label="있음"
              :value="true"
            />
            <fwb-radio
              v-model="groupData.hasPassword"
              label="없음"
              :value="false"
            />
          </div>
        </div>
      </div>
      <br />
      <fwb-input
        v-if="groupData.hasPassword === true"
        v-model="groupData.password"
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
          :disabled="!isMaxCapacityValid"
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
import { ref, computed } from "vue";
import axiosInstance from "../api/axiosInstance_test";

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
const isMaxCapacityValid = computed(() => {
  const { maxCapacity } = props.groupData;
  return maxCapacity >= 2 && maxCapacity <= 50;
});
const isPublic = ref();
const hasPassword = ref();

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  mode: {
    type: String,
    required: true,
  },
  groupData: {
    type: Object,
    required: true,
    default: () => ({ maxCapacity: 0 }),
  },
});

const { groupData } = props; // groupData만 구조 분해

const isEditMode = computed(() => props.mode === "edit");

const emit = defineEmits(["submit", "close"]);

function submitGroup() {
  emit("submit", props.groupData); // 이벤트 전송
}

// 이미지 업로드
const uploadedImageUrl = ref(""); // 업로드된 이미지 URL을 저장할 변수
async function handleFileUpload(event) {
  try {
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
      uploadedImageUrl.value = response.data.data.url;
      groupData.image = uploadedImageUrl.value;
      alert("이미지가 성공적으로 업로드되었습니다.");
    } else {
      alert("이미지 업로드 실패: " + response.data.message);
    }
  } catch (error) {
    console.error("이미지 업로드 오류:", error);
    alert("이미지 업로드 중 오류가 발생했습니다.");
  }
}
</script>
