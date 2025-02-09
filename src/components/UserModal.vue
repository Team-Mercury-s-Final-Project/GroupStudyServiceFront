<template>
  <div 
    v-if="user" 
    class="modal-content"
    ref="modalRef"
    :style="{ top: `${y}px`, left: `${x}px` }"
    @click.stop
  >
    <div class="user-info-container">
      <fwb-avatar 
        :img="user.image" 
        rounded status-position="top-right"
        :status="user.status.toLowerCase()" 
        class="user-avatar" 
      />
      <div class="nickname-container">
        <template v-if="editing">
          <input v-model="newNickname" class="nickname-input" />
          <fwb-button 
            size="xs" 
            color="green"
            class="mt-2 mb-2"
            @click="saveNickname"
          >
            변경 완료
          </fwb-button>
        </template>
        <template v-else>
          <h2 class="user-nickname">{{ user.nickname }}</h2>
          <fwb-button 
            v-if="user.id == userId" 
            size="xs" 
            color="dark"
            class="mt-2 mb-2"
            @click="editing = true"
          >
            닉네임 변경
          </fwb-button>
        </template>
      </div>
    </div>

    <p class="study-time">오늘 공부시간<br>{{ user.studyTime }}</p>

    <fwb-button 
      v-if="user.id != userId" 
      size="md"
      color="purple"
      class="mt-2"
      @click="sendDM"
    >
      DM
    </fwb-button>
  </div>
</template>

<script setup>
import { defineProps, ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { FwbAvatar, FwbButton } from "flowbite-vue";
import axiosInstance from "../api/axiosInstance";
import { useToast } from "vue-toastification";

const toast = useToast();
const props = defineProps(["user", "userId", "x", "y", "closeModal"]);
const modalRef = ref(null);

const editing = ref(false);
const newNickname = ref(props.user.nickname);

const saveNickname = async () => {
  if (!newNickname.value.trim()) return alert("닉네임을 입력하세요.");

  try {
    const response = await axiosInstance.patch(`/users/groups/${props.user.groupId}/change-nickname`,
      JSON.stringify({ nickname: newNickname.value })
    );
    
    if (response.status !== 200) throw new Error("닉네임 변경 실패");

    toast.success("닉네임이 변경되었습니다.", { timeout: 2000 });
    props.user.nickname = response.data.data.nickname;
    editing.value = false;
  } catch (error) {
    console.error(error.message);
    toast.error("닉네임 변경 실패", { timeout: 2000 });
  }
};

const sendDM = () => {
  alert("DM 전송 기능 추가 예정");
};

const closeModalHandler = (event) => {
  // 모달 내부 클릭 시 닫히지 않도록 설정
  if (event.target.closest(".modal")) return;
  props.closeModal();
};

onMounted(async () => {
  await nextTick(); // DOM 업데이트 후 실행
  setTimeout(() => {
    window.addEventListener("click", closeModalHandler);
  }, 0);
});

onBeforeUnmount(() => {
  window.removeEventListener("click", closeModalHandler);
});
</script>

<style scoped>
.modal-content {
  position: absolute;
  background: #c3c3c3;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  width: 250px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.user-info-container {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.user-avatar {
  width: 50px;
  height: 50px;
  margin-bottom: 10px;
}

.nickname-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-nickname {
  font-size: 1.2rem;
  font-weight: bold;
}

.nickname-input {
  width: 80%;
  padding: 5px;
  border: 1px solid #aaa;
  border-radius: 5px;
  text-align: center;
}

.nickname-btn, .save-btn, .dm-btn {
  display: block;
  margin: 10px auto;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.nickname-btn {
  background: white;
  border: 1px solid gray;
}

.save-btn {
  background: green;
  color: white;
}

.dm-btn {
  background: black;
  color: white;
}
</style>
