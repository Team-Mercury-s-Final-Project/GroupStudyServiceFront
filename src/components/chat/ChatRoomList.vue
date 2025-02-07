<template>
  <div class="chat-container">
    <div class="tab-buttons">
      <button
        @click="setActiveTab('DM')"
        :class="{ active: activeTab === 'DM' }"
      >
        DM
      </button>
      <button
        @click="setActiveTab('GROUP')"
        :class="{ active: activeTab === 'GROUP' }"
      >
        GROUP
      </button>
    </div>

    <div class="chat-list">
      <ul v-if="activeTab === 'DM'">
        <li
          v-for="chat in dmList"
          :key="chat.id"
          class="chat-item"
          @dblclick="goToChatRoom(chat.id, chat.unreadMessages)"
        >
          <img
            :src="chat.recentMessage.profileImgUrl"
            class="profile-picture"
          />
          <div class="chat-details">
            <span class="username">{{ chat.recentMessage.nickName }}</span>
            <span class="message-preview">{{
              chat.recentMessage.content
            }}</span>
          </div>
          <span class="timestamp">
            {{ formatTimestamp(chat.recentMessage.createdAt) }}
          </span>
          <span v-if="chat.unreadMessages.length > 0" class="unread">
            {{ chat.unreadMessages.length }}
          </span>
        </li>
      </ul>
      <ul v-else>
        <li
          v-for="chat in groupList"
          :key="chat.id"
          class="chat-item"
          @dblclick="goToChatRoom(chat.id, chat.unreadMessages)"
        >
          <img
            :src="chat.recentMessage.profileImgUrl"
            class="profile-picture"
          />
          <div class="chat-details">
            <span class="username">{{ chat.recentMessage.nickName }}</span>
            <span class="message-preview">{{
              chat.recentMessage.content
            }}</span>
          </div>
          <span class="timestamp">
            {{ formatTimestamp(chat.recentMessage.createdAt) }}
          </span>
          <span v-if="chat.unreadMessages.length > 0" class="unread">
            {{ chat.unreadMessages.length }}
          </span>
        </li>
      </ul>
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
    };
  },
  mounted() {
    token = localStorage.getItem("access");
    if (token) {
      const decodedToken = jwtDecode.jwtDecode(token);
      this.currentUserId = decodedToken.id;
    }
    this.fetchChatList();
    this.connectWebSocket();
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
    //채팅방으로 이동
    async goToChatRoom(chatRoomId, unreadMessages) {
      //채팅방의 읽지 않은 메시지들 모두 읽음처리
      try {
        const response = await axiosInstance.post(
          `/chats/${chatRoomId}/insertAllUnreadChatMessages`,
          {
            unreadMessages: unreadMessages,
          }
        );
        console.log(response.data); // 응답 데이터를 로그로 출력
      } catch (error) {
        console.error("읽지 않은 메시지 읽음처리 중 에러 발생:", error);
      }
      //읽음 처리 이후 채팅방으로 이동
      this.$router.push(`/chats/${chatRoomId}`);
    },

    setActiveTab(tab) {
      this.activeTab = tab;
    },
    connectWebSocket() {
      const socket = new WebSocket(`ws://localhost:8080/chat`);
      this.stompClient = Stomp.over(socket);
      this.stompClient.connect(
        {},
        (frame) => {
          console.log("Connected: " + frame);
          this.stompClient.subscribe("/topic/messages", (message) => {
            const newMessage = JSON.parse(message.body);
            this.chatList = this.chatList.map((room) =>
              room.id === newMessage.chatRoomId
                ? { ...room, recentMessage: newMessage }
                : room
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
    },
    async fetchChatList() {
      try {
        const response = await axiosInstance.get(
          `/users/${this.currentUserId}/chats`
        );
        this.chatList = response.data.data.chatRooms; // 채팅 목록 설정
        console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    },
    formatTimestamp(timestamp) {
      // 타임스탬프 형식을 변환하는 함수 (예시)
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${
        date.getMonth() + 1
      }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
    },
  },
};
</script>

<style>
.chat-container {
  width: 400px; /* 채팅 목록을 더 넓게 */
}

.tab-buttons {
  display: flex;
  justify-content: space-around;
}

.tab-buttons button {
  flex: 1;
  padding: 10px;
  cursor: pointer;
}

.tab-buttons .active {
  background-color: #007bff;
  color: white;
}

.chat-list {
  margin-top: 10px;
}

.chat-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.profile-picture {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.chat-details {
  flex: 1;
}

.username {
  font-weight: bold;
}

.message-preview {
  display: block;
  color: #666;
}

.timestamp {
  margin-left: 10px;
  color: #999;
}

.unread {
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 5px 10px;
  margin-left: 10px;
}
</style>
