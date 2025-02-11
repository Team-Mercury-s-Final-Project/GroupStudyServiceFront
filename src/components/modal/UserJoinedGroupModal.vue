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
        v-if="groupList && groupList.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 overflow-y-auto max-h-96"
      >
        <div
          v-for="group in groupList"
          :key="group.groupId"
          class="bg-white border border-gray-200 rounded-lg shadow-lg p-4"
        >
          <fwb-avatar :img="group.imageUrl" rounded />
          <h3 class="text-sm font-bold text-gray-800">{{ group.name }}</h3>
          <br />

          <!-- 그룹장이면 선택할 수 있는 멤버 목록 -->
          <!-- <select
            v-if="
              group.isHost === '1' &&
              Array.isArray(group.members) &&
              group.members.length > 0
            "
            v-model="group.selectedMembers.nickname"
            class="w-full p-2 border border-gray-300 rounded-md"
            disable:true
          >
            <option
              v-for="member in group.members"
              :key="member.id"
              :value="member.nickname"
            >
              {{ member.nickname }}
            </option>
          </select> -->
        </div>
      </div>

      <div v-if="modalData.type === '탈퇴'" class="space-y-4">
        <input
          v-model="confirmationInput"
          type="text"
          class="w-full p-2 border border-gray-300 rounded-md"
          placeholder="탈퇴하겠습니다를 입력하세요"
        />

        <div class="flex justify-end space-x-4">
          <button
            @click="close"
            class="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
          >
            취소
          </button>
          <button
            @click="deleteAccount"
            :disabled="confirmationInput !== '탈퇴하겠습니다'"
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-300"
          >
            탈퇴
          </button>
        </div>
      </div>

      <div v-else class="flex justify-end">
        <button
          @click="closeModal"
          class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          확인
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { FwbAvatar } from "flowbite-vue";
import { useStore } from "vuex"; // Vuex에서 상태 관리
import axiosInstance from "../../api/axiosInstance";
import { useToast } from "vue-toastification";
import { useRouter } from "vue-router";

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  modalData: {
    type: Object,
    required: true,
  },
  groupList: {
    type: Array, // 수정: Object에서 Array로 변경
    required: true,
  },
});

// 'close' 이벤트를 부모에게 전달하기 위해 emit을 사용
const emit = defineEmits();
const store = useStore();
const router = useRouter();
const toast = useToast();
const confirmationInput = ref("");
const selectedMember = ref(null);

// 수정된 부분: props.groupList로 접근
const modalSizeClass = computed(() => {
  // console.log("groupList: ", groupList.value); 오류 발생생
  return props.groupList.length === 0 ? "w-[500px]" : "w-11/12 max-w-3xl";
});

// 탈퇴 처리 함수
async function deleteAccount() {
  const requestData = prepareLeaveData();
  try {
    const response = await axiosInstance.delete("/user-info", {
      data: requestData,
    });
    if (response.status === 200) {
      close();
      toast.success("탈퇴가 완료되었습니다.", { timeout: 2000 });

      // 로컬 저장소 데이터 삭제 및 상태 초기화
      localStorage.removeItem("access");
      localStorage.removeItem("redirectUrl");
      localStorage.removeItem("userId");
      store.dispatch("logout");

      // 로그인 페이지로 리다이렉트
      setTimeout(() => {
        router.push("/oauth2Login");
      }, 3000);
    }
  } catch (e) {
    toast.error(
      "탈퇴가 실패하였습니다: " + (e.response?.data?.message || e.message),
      { timeout: 2000 }
    );
  }
}

// 모달 닫기
function close() {
  emit("closeModal");
}

function prepareLeaveData() {
  if (props.groupList.length >= 1) {
    const requestPrepareData = {
      groupMemberInfos: props.groupList
        .filter(
          (group) => group.isHost === "1" && group.selectedMembers != undefined
        ) // 그룹장이 아닌 데이터는 제외
        .map((group) => ({
          groupId: group.groupId,
          memberId: group.selectedMembers.memberId,
        })),
    };
    console.log("전송 데이터:", JSON.stringify(requestPrepareData));
    return requestPrepareData;
  } else {
    return null;
  }
}
</script>
