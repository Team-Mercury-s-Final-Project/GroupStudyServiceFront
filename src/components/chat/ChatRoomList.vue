<template>
  <div class="w-[600px] border mx-auto">
    <!-- 탭 버튼 영역 -->
    <div class="flex justify-around">
      <button
        @click="setActiveTab('DM')"
        :class="[
          'flex-1 p-2.5 cursor-pointer',
          activeTab === 'DM' ? 'bg-[#007bff] text-white' : 'text-gray-800',
        ]"
      >
        DM
      </button>
      <button
        @click="setActiveTab('GROUP')"
        :class="[
          'flex-1 p-2.5 cursor-pointer',
          activeTab === 'GROUP' ? 'bg-[#007bff] text-white' : 'text-gray-800',
        ]"
      >
        GROUP
      </button>
    </div>

    <!-- 채팅 목록 영역 -->
    <div class="mt-2.5 min-h-[40vh] max-h-[70vh] overflow-y-auto">
      <!-- 데이터 로딩 중이면 스피너 표시 -->
      <template v-if="!isDataLoaded">
        <div class="flex justify-center items-center h-full">
          <svg
            class="animate-spin h-8 w-8 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            ></path>
          </svg>
        </div>
        <div
          v-if="isLoading"
          class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50"
        >
          <fwb-spinner size="12" />
          <div class="text-xl text-gray-800">로딩중...</div>
        </div>
      </template>

      <!-- 데이터 로딩 완료되면 채팅 목록 표시 -->
      <template v-else>
        <ul v-if="activeTab === 'DM'">
          <li
            v-for="chat in dmList"
            :key="chat.id"
            class="flex items-center p-2.5 border-b border-gray-300"
            @dblclick="goToChatRoom(chat.id, chat.unreadMessages)"
          >
            <img
              :src="chat.recentMessage.profileImgUrl"
              class="w-10 h-10 rounded-full mr-2.5"
              alt="Profile"
            />
            <div class="flex-1 overflow-hidden">
              <span class="font-bold block truncate">
                {{ chat.chatRoomName }}
              </span>
              <span class="block text-gray-600 truncate">
                {{ formatContent(chat.recentMessage.content) }}
              </span>
            </div>
            <div class="flex flex-col items-end ml-2.5">
              <span class="text-[0.8rem] text-gray-500">
                {{ formatTimestamp(chat.recentMessage.createdAt) }}
              </span>
              <span
                v-if="chat.unreadMessages.length > 0"
                class="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center mt-1 text-xs"
              >
                {{ chat.unreadMessages.length }}
              </span>
            </div>
          </li>
        </ul>
        <ul v-else>
          <li
            v-for="chat in groupList"
            :key="chat.id"
            class="flex items-center p-2.5 border-b border-gray-300"
            @dblclick="goToChatRoom(chat.id, chat.unreadMessages, chat.groupId)"
          >
            <img
              :src="chat.recentMessage.profileImgUrl"
              alt="Profile"
              class="w-10 h-10 rounded-full mr-2.5"
            />
            <div class="flex-1 overflow-hidden">
              <span class="font-bold block truncate">
                {{ chat.chatRoomName }}
              </span>
              <span class="block text-gray-600 truncate">
                {{ formatContent(chat.recentMessage.content) }}
              </span>
            </div>
            <div class="flex flex-col items-end ml-2.5">
              <span class="text-[0.8rem] text-gray-500">
                {{ formatTimestamp(chat.recentMessage.createdAt) }}
              </span>
              <span
                v-if="chat.unreadMessages.length > 0"
                class="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center mt-1 text-xs"
              >
                {{ chat.unreadMessages.length }}
              </span>
            </div>
          </li>
        </ul>
      </template>
    </div>
  </div>
</template>
<script>
import * as jwtDecode from "jwt-decode";
import axiosInstance from "../../api/axiosInstance.js";

let token = "";
export default {
  data() {
    return {
      currentUserId: null,
      activeTab: "DM",
      chatList: [],
      newMessages: [],
      processedMessages: new Set(), // 메시지 ID를 추적하기 위한 Set
      isDataLoaded: false, // 로딩 여부 플래그 추가
    };
  },
  mounted() {
    token = localStorage.getItem("access");
    if (token) {
      const decodedToken = jwtDecode.jwtDecode(token);
      this.currentUserId = decodedToken.id;
    }
    this.fetchChatList();

    console.log(this.chatList);
  },

  computed: {
    dmList() {
      return this.chatList.filter((chat) => chat.chatRoomType === "DM");
    },
    groupList() {
      return this.chatList.filter((chat) => chat.chatRoomType === "GROUP");
    },
  },
  methods: {
    formatContent(content) {
      if (content && content.startsWith("https://storage.googleapis.com/")) {
        return "사진을 보냈습니다";
      }
      return content;
    },
    //새로운 메시지를 받아 기존 채팅목록 업데이트
    async updateChatRoomList(newMessage) {
      console.log("새로 받은 메시지입니다.", newMessage);
      const chatRoomId = newMessage.data.chatRoomId;
      const newChatList = [...this.chatList];
      const chatIndex = newChatList.findIndex((chat) => chat.id === chatRoomId);

      if (chatIndex !== -1) {
        let updatedChat = { ...newChatList[chatIndex] };
        updatedChat.recentMessage.id = newMessage.data.id;
        updatedChat.recentMessage.nickName = newMessage.data.nickName;
        updatedChat.recentMessage.profileImgUrl = newMessage.data.profileImgUrl;
        updatedChat.recentMessage.content = newMessage.data.content;
        updatedChat.recentMessage.createdAt = newMessage.data.createdAt;

        if (!this.processedMessages.has(newMessage.data.id)) {
          this.processedMessages.add(newMessage.data.id); // 메시지 ID 추적
          const isRead = await this.isReadCheck(newMessage.data.id);
          if (!isRead) {
            updatedChat.unreadMessages.push(newMessage.data.id);
            console.log(
              chatRoomId,
              "번 채팅방 읽지 않은 메시지: ",
              updatedChat.unreadMessages
            );
          }
          this.processedMessages.delete(newMessage.data.id); // 작업이 완료된 후 ID 삭제 (필요 시)
        }

        newChatList.splice(chatIndex, 1, updatedChat);
      }

      //this.chatList = newChatList;
      // 메시지를 정렬
      this.chatList = newChatList.sort(
        (a, b) =>
          new Date(b.recentMessage.createdAt) -
          new Date(a.recentMessage.createdAt)
      );
    },

    // WebSocket 연결 종료 메서드
    disconnectWebSocket() {
      if (this.stompClient) {
        this.stompClient.disconnect(() => {
          console.log("WebSocket 연결이 종료되었습니다.");
        });
      }
    },
    //채팅방으로 이동
    async goToChatRoom(chatRoomId, unreadMessages, groupId) {
      //채팅방의 읽지 않은 메시지들 모두 읽음처리
      try {
        const response = axiosInstance.post(
          `/chats/${chatRoomId}/insertAllUnreadChatMessages`,
          {
            unreadMessages: unreadMessages,
            chatRoomId: chatRoomId,
          }
        );
        console.log(response.data); // 응답 데이터를 로그로 출력
      } catch (error) {
        console.error("읽지 않은 메시지 읽음처리 중 에러 발생:", error);
      }
      //웹소켓 연결 해제
      this.disconnectWebSocket();
      //읽음 처리 이후 채팅방으로 이동
      //그룹 / DM 경우를 분리
      if (groupId !== null && groupId !== undefined) {
        this.$router.push(`/groups/${groupId}/chats/${chatRoomId}`);
      } else {
        this.$router.push(`/chats/${chatRoomId}`);
      }
    },

    setActiveTab(tab) {
      this.activeTab = tab;
    },
    connectWebSocket() {
      const socket = new WebSocket(`wss://back.mercurystudy.store/chat`);
      this.stompClient = Stomp.over(socket);
      this.stompClient.heartbeat.outgoing = 0;
      this.stompClient.heartbeat.incoming = 0;

      this.stompClient.connect(
        {},
        (frame) => {
          console.log("Connected: " + frame);

          // chatList에 있는 각 채팅방에 대해 구독 설정
          this.chatList.forEach((chat) => {
            console.log(chat.id, "채팅방 구독");
            this.stompClient.subscribe(
              `/topic/chat.recentMessage.${chat.id}`,
              (messageOutput) => {
                try {
                  const newMessage = JSON.parse(messageOutput.body);
                  console.log("새로운 메시지 도착:", newMessage);
                  // newMessages 배열에 newMessage.data input
                  this.updateChatRoomList(newMessage);
                } catch (error) {
                  console.error("메시지 파싱 오류:", error);
                }
              }
            );
          });
        },
        (error) => {
          console.error("WebSocket 연결 오류:", error);
          setTimeout(() => {
            this.connectWebSocket();
          }, 10000);
        }
      );
      socket.onclose = () => {
        console.warn("WebSocket이 닫혔습니다. 재연결 시도 중...");
        setTimeout(() => {
          this.connectWebSocket();
        }, 10000);
      };
    },

    async fetchChatList() {
      try {
        const response = await axiosInstance.get(
          `/users/${this.currentUserId}/chats`
        );
        this.chatList = response.data.data.chatRooms; // 채팅 목록 설정

        // 채팅 목록 정렬
        this.chatList.sort(
          (a, b) =>
            new Date(b.recentMessage.createdAt) -
            new Date(a.recentMessage.createdAt)
        );
        console.log(response.data);
        this.connectWebSocket();
        this.isDataLoaded = true;
      } catch (error) {
        console.error(error);
        this.isDataLoaded = true;
      }
    },
    // 이 메시지를 읽었는지 확인 및 상태 업데이트
    async isReadCheck(newMessageId) {
      try {
        const response = await axiosInstance.post(`/chats/isReadCheck`, {
          chatMessageId: newMessageId,
          chatUserId: this.currentUserId,
        });
        console.log("읽었는지 체크 결과 : ", response.data.data); // 응답 데이터를 로그로 출력

        // 서버 응답이 성공적인지 여부를 반환
        return response.data.data;
      } catch (error) {
        console.error("새로 온 메시지 읽었었는지 체크 중 에러 발생:", error);
        return false;
      }
    },
    formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // 0부터 시작하므로 +1
      const day = date.getDate();

      let hour = date.getHours();
      const minute = date.getMinutes();

      // 오전/오후 판별
      const period = hour < 12 ? "오전" : "오후";

      // 12시간제로 변환 (0시(자정)은 12시로)
      hour = hour % 12;
      if (hour === 0) {
        hour = 12;
      }

      // 분이 10 미만이면 앞에 0 붙이기
      const paddedMinute = minute < 10 ? "0" + minute : minute;

      return `${year}-${month}-${day} ${period} ${hour}시 ${paddedMinute}분`;
    },
  },
};
</script>
