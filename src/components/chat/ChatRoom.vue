<template>
  <div class="layout">
    <div class="main-content">
      <div class="content">
        <div class="chat-container">
          <div class="messages">
            <div
              class="message"
              v-for="(message, index) in messages"
              :key="index"
            >
              <div class="message-sender">{{ message.sender }}</div>
              <div class="message-content">{{ message.content }}</div>
              <div class="message-timestamp">{{ message.timestamp }}</div>
            </div>
          </div>
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
import api from "../../api.js";
import ChatMessage from "./ChatMessage.vue";
import Stomp from "stompjs";

export default {
  components: {
    ChatMessage,
  },
  data() {
    return {
      messages: [], // 배열로 초기화
      newMessage: "",
      chatRoomId: 1, // 예시 채팅방 ID
      stompClient: null, // stompClient 초기화
    };
  },
  mounted() {
    // 서버에서 채팅 내역 불러오기
    api
      .get(`/chats/${this.chatRoomId}`)
      .then((response) => {
        if (Array.isArray(response.data)) {
          this.messages = response.data; // 배열로 설정
        } else {
          this.messages = []; // 배열이 아닐 경우 빈 배열로 초기화
        }
      })
      .catch((error) => {
        console.error("Error loading messages:", error);
        this.messages = []; // 에러 발생 시 빈 배열로 초기화
      });

    // WebSocket 연결 설정
    let socket = new WebSocket("ws://localhost:8080/chat");
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect(
      {},
      (frame) => {
        console.log("Connected: " + frame);
        // 특정 경로를 구독
        this.stompClient.subscribe(
          `/topic/chat/${this.chatRoomId}`,
          (messageOutput) => {
            const message = JSON.parse(messageOutput.body);
            if (Array.isArray(this.messages)) {
              this.messages.push(message); // 구독 메시지를 배열에 추가
            } else {
              console.error("this.messages is not an array:", this.messages);
            }
            console.log("Received message: ", message.messageContent);
          }
        );
      },
      (error) => {
        console.error("WebSocket connection error:", error);
        // 재연결 시도
        setTimeout(() => {
          this.stompClient.connect();
        }, 10000); // 10초 후 재연결 시도
      }
    );
  },
  methods: {
    sendMessage() {
      if (this.newMessage.trim() !== "" && Array.isArray(this.messages)) {
        const payload = {
          chatRoomId: this.chatRoomId,
          senderId: 5, // 사용자 ID
          receiverId: 6, // 상대방 ID
          messageContent: this.newMessage,
        };

        this.stompClient.send(
          `/pub/chat/sendTextMessage/${this.chatRoomId}`,
          {},
          JSON.stringify(payload)
        );

        // 메시지를 내 화면에 바로 띄우기
        this.messages.push({
          sender: "Me", // 또는 사용자 이름
          content: this.newMessage,
          timestamp: new Date().toLocaleTimeString(),
        });

        this.newMessage = "";
      } else {
        console.error("this.messages is not an array:", this.messages);
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
  color: #333;
  padding: 2rem;
  border-radius: 10px;
  margin-top: 3.5rem; /* 네비게이션 바 높이 조정 */
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
.message-sender {
  font-weight: bold;
}
.message-content {
  margin: 0.5rem 0;
}
.message-timestamp {
  font-size: 0.8rem;
  color: #888;
}
.date-separator {
  text-align: center;
  margin: 1rem 0;
  font-weight: bold;
  color: #999;
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
.chat-list {
  background-color: #555;
  color: #fff;
}
</style>
