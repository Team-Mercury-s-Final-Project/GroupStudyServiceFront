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
        rounded
        status-position="top-right"
        :status="user.status === 'OFFLINE' ? 'offline' : 'online'"
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

    <p class="study-time">
      오늘 공부시간<br />{{ formattedTime(user.studyTime) }}
    </p>

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
import { useRoute } from "vue-router";

const route = useRoute();
const toast = useToast();
const props = defineProps(["user", "userId", "x", "y", "closeModal"]);
const modalRef = ref(null);

const editing = ref(false);
const newNickname = ref(props.user.nickname);

const saveNickname = async () => {
  if (!newNickname.value.trim()) return alert("닉네임을 입력하세요.");

  try {
    const response = await axiosInstance.patch(
      `/users/groups/${props.user.groupId}/change-nickname`,
      JSON.stringify({ nickname: newNickname.value })
    );

    if (response.status !== 200) throw new Error("닉네임 변경 실패");

    toast.success("닉네임이 변경되었습니다.", { timeout: 2000 });
    props.user.nickname = response.data.data.nickname;
    editing.value = false;

    if (route.name === "GroupChat" && route.params.groupId && route.params.chatRoomId) {
      window.location.reload();
    }
  } catch (error) {
    console.error(error.message);
    toast.error("닉네임 변경 실패", { timeout: 2000 });
  }
};

const sendDM = async () => {
  try {
    let chatRoomId = -1;

    // 첫 번째 요청: 채팅 메시지 카운트 확인
    const response1 = await axiosInstance.get("/chat/chatMessageCountCk", {
      params: {
        senderId: props.userId,
        receiverId: props.user.id,
      },
    });

    const count = response1.data.data.count;

    // 기존 채팅기록이 없다면
    if (count === 0) {
      // 채팅기록은 없는데 채팅방은 있는지 확인
      const response = await axiosInstance.get("/chat/findDmChatRoomId", {
        params: {
          senderId: props.userId,
          receiverId: props.user.id,
        },
      });
      chatRoomId = response.data.data; // response.data가 객체인 경우 대비

      // 만약 채팅방이 없다면 채팅방 새로 생성
      if (chatRoomId === -1 || chatRoomId === null) {
        const createPayload = {
          senderId: props.userId,
          receiverId: props.user.id,
        };
        const response2 = await axiosInstance.post(
          "/chat/createDMChatRoom",
          JSON.stringify(createPayload)
        );
        console.log("채팅방 생성:", response2.data);
        chatRoomId = response2.data.data.chatRoomId;
      }
    } else {
      // 기존 채팅기록이 있는 경우, 기존 채팅방 ID를 가져오는 로직 추가
      const response = await axiosInstance.get("/chat/findExistingChatRoomId", {
        params: {
          senderId: props.userId,
          receiverId: props.user.id,
        },
      });
      chatRoomId = response.data.data; // response.data가 객체인 경우 대비
      //읽지 않은 메시지 확인. 읽지 않은 메시지를 확인하여 update
      await axiosInstance.post(
        `/chat/updateGroupUnreadMessagesForDM/${chatRoomId}`
      );
    }

    // 채팅방으로 이동
    if (chatRoomId !== -1 && chatRoomId !== null) {
      window.location.href = `/chats/${chatRoomId}`;
      //$router.push(`/chats/${chatRoomId}`);
    } else {
      alert("채팅방을 찾을 수 없습니다.");
    }
  } catch (error) {
    console.error("오류 발생:", error);
  }
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

const formattedTime = (second) => {
  const hours = Math.floor(second / 3600);
  const minutes = Math.floor((second % 3600) / 60);
  const seconds = Math.floor((second % 60) / 1);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
};
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

.nickname-btn,
.save-btn,
.dm-btn {
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
