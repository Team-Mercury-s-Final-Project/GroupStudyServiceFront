<template>
  <div class="layout">
    <div class="main-content">
      <div class="content">
        <div class="chat-container">
          <div v-if="isDataLoaded" class="messages">
            <div
              class="message"
              v-for="(message, index) in messages"
              :key="index"
              :class="{
                'my-message': message.senderId === this.currentUserId,
                'other-message': message.senderId !== this.currentUserId,
              }"
            >
              <div class="message-content">
                <strong>{{ message.nickName }}</strong
                >: {{ message.content }}
              </div>
              <div class="message-timestamp">{{ message.createdAt }}</div>
            </div>
          </div>
          <div v-else class="loading">데이터를 불러오는 중입니다...</div>
          <div class="input-container">
            <input
              v-model="newMessage"
              @keyup.enter="sendMessage"
              placeholder="메시지를 입력해주세요"
            />
            <button @click="sendMessage">보내기</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Stomp from "stompjs";
import * as jwtDecode from "jwt-decode";
import axiosInstance from "../../api/axiosInstance_test.js";

let token = "";
export default {
  data() {
    return {
      messages: [],
      newMessage: "",
      chatRoomId: -999,
      stompClient: null,
      currentUserId: null,
      receiverId: null,
      isDataLoaded: false,
      nickName: "",
      chatRoomType: "DM",
    };
  },

  mounted() {
    token = localStorage.getItem("access");
    this.chatRoomId = this.$route.params.chatRoomId;

    if (token) {
      const decodedToken = jwtDecode.jwtDecode(token);
      this.currentUserId = decodedToken.id;
    }

    this.connectWebSocket();
    this.loadChatHistory();
  },

  methods: {
    connectWebSocket() {
      const socket = new WebSocket(`ws://localhost:8080/chat`);
      this.stompClient = Stomp.over(socket);

      this.stompClient.connect(
        {},
        (frame) => {
          console.log("Connected: " + frame);
          this.stompClient.subscribe(
            `/topic/chat.${this.chatRoomId}`,
            (messageOutput) => {
              try {
                const message = JSON.parse(messageOutput.body);
                console.log("Received message:", message);

                this.messages.push({
                  id: message.data.id,
                  senderId: message.data.senderId,
                  nickName: message.data.nickName || "알 수 없음",
                  content: message.data.messageContent,
                  createdAt: new Date(message.data.createdAt).toLocaleString(),
                });
              } catch (error) {
                console.error("메시지 파싱 오류:", error);
              }
            }
          );
        },
        (error) => {
          console.error("WebSocket 연결 오류:", error);
          setTimeout(() => {
            this.connectWebSocket();
          }, 10000);
        }
      );
    },

    loadChatHistory() {
      axiosInstance
        .get(`/chats/${this.chatRoomId}`, {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          if (response.data && response.data.success && response.data.data) {
            const chatData = response.data.data;

            if (Array.isArray(chatData.messages)) {
              this.messages = chatData.messages.map((msg) => ({
                id: msg.id,
                senderId: msg.senderId,
                nickName: msg.nickName || "알 수 없음",
                content: msg.content,
                createdAt: new Date(msg.createdAt).toLocaleString(),
              }));

              // JWT ID와 같지 않은 데이터의 ID를 receiverId로 설정
              const receiver = chatData.messages.find(
                (msg) => msg.senderId !== this.currentUserId
              );
              this.receiverId = receiver ? receiver.senderId : null;

              const sender = chatData.messages.find(
                (msg) => msg.senderId === this.currentUserId
              );
              this.nickName = sender.nickName;
            }

            this.isDataLoaded = true;
          } else {
            console.error("알 수 없는 데이터 구조:", response.data);
            this.messages = [];
            this.isDataLoaded = true;
          }
        })
        .catch((error) => {
          console.error("메시지 로딩 중 오류 발생:", error);
          this.messages = [];
          this.isDataLoaded = true;
        });
    },

    sendMessage() {
      if (this.newMessage.trim() !== "") {
        const payload = {
          chatRoomId: this.chatRoomId,
          senderId: this.currentUserId,
          receiverId: this.receiverId,
          nickName: this.nickName,
          messageContent: this.newMessage,
          chatRoomType: this.chatRoomType,
        };

        if (this.stompClient && this.stompClient.connected) {
          this.stompClient.send(
            `/pub/chat/sendTextMessage/${this.chatRoomId}`,
            {},
            JSON.stringify(payload)
          );
        } else {
          console.error("WebSocket is not connected.");
        }

        this.newMessage = "";
      }
    },
  },
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: Arial, sans-serif;
}
.layout {
  display: flex;
}
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 200px;
  height: 100%;
  background-color: #444;
  color: #fff;
  padding: 1rem;
}

.main-content {
  margin-left: 200px;
  width: calc(100% - 200px);
}
.content {
  background-color: #fff;
  color: #fff;
  padding: 2rem;
  border-radius: 10px;
  margin-top: 3.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 3.5rem);
}
.chat-container {
  background-color: #222;
  padding: 1rem;
  border-radius: 10px;
  width: 100%;
  max-width: 600px;
  height: 80vh;
  display: flex;
  flex-direction: column;
}
.messages {
  overflow-y: auto;
  flex-grow: 1;
  background-color: #222;
  padding: 1rem;
  border-radius: 10px;
}
.message {
  margin-bottom: 1rem;
}
.message-content {
  margin: 0.5rem 0;
}
.message-timestamp {
  font-size: 0.8rem;
  color: #888;
}
.input-container {
  display: flex;
  padding: 0.5rem;
  background-color: #444;
  border-radius: 10px;
  margin-top: 1rem;
}
input {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 5px;
}
button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  margin-left: 0.5rem;
  background-color: #f7c02b;
  color: #333;
  cursor: pointer;
}
</style>
