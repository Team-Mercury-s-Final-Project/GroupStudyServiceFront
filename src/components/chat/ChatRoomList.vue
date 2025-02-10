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
      newMessages: [],
      processedMessages: new Set(), // 메시지 ID를 추적하기 위한 Set
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
    async goToChatRoom(chatRoomId, unreadMessages) {
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
      this.$router.push(`/chats/${chatRoomId}`);
    },

    setActiveTab(tab) {
      this.activeTab = tab;
    },
    connectWebSocket() {
      const socket = new WebSocket(`ws://localhost:8080/chat`);
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
      } catch (error) {
        console.error(error);
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
