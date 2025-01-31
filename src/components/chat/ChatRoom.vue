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
                'my-message': message.senderId === currentUserId,
                'other-message': message.senderId !== currentUserId,
              }"
            >
              <div class="message-content">
                <strong>{{ message.nickName }}</strong
                >: {{ message.content }}
              </div>
              <!-- 첨부 파일 표시 -->
              <div v-if="message.messageFiles.length > 0" class="message-files">
                <div
                  v-for="(file, index) in message.messageFiles"
                  :key="index"
                  class="message-file"
                >
                  <div v-if="file.fileType && file.fileType.includes('image')">
                    <img :src="file.fileUrl" alt="첨부 이미지" />
                  </div>
                  <div v-else>
                    <a :href="file.fileUrl" target="_blank">파일 다운로드</a>
                  </div>
                </div>
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
import api from "../../api.js";
import Stomp from "stompjs";
import * as jwtDecode from "jwt-decode"; // 수정된 import 문

export default {
  data() {
    return {
      messages: [], // 메시지 배열
      newMessage: "",
      chatRoomId: -999, // 채팅방 ID
      stompClient: null, // stompClient 초기화
      currentUserId: null, // 현재 사용자 ID 초기화
      receiverId: null, // 수신자 ID 초기화
      isDataLoaded: false, // 데이터 로드 상태
      nickName: "",
    };
  },
  mounted() {
    this.chatRoomId = this.$route.params.chatRoomId; // URL에서 chatRoomId 가져오기

    // JWT 토큰에서 사용자 정보 추출
    const token = localStorage.getItem("access");
    if (token) {
      const decodedToken = jwtDecode.jwtDecode(token); // 수정된 호출 방식
      this.currentUserId = decodedToken.id; // jwt 토큰에서 userId 추출
    }

    this.loadChatHistory(); // 채팅 내역 불러오기

    // WebSocket 연결 설정
    let socket = new WebSocket("ws://localhost:8080/chat");
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect(
      {},
      (frame) => {
        console.log("Connected: " + frame);
        // 특정 경로를 구독
        this.stompClient.subscribe(
          `/topic/chat.${this.chatRoomId}`,
          (messageOutput) => {
            try {
              const message = JSON.parse(messageOutput.body);

              // 수신된 메시지 데이터를 콘솔에 출력하여 구조 확인
              console.log("수신된 메시지 데이터:", message);

              // 메시지 데이터를 messages 배열에 추가
              this.messages.push({
                id: message.data.id,
                senderId: message.data.senderId, // Sender ID 설정
                nickName: message.data.nickName, // Nickname 설정. 상대방의 닉네임
                content: message.data.messageContent,
                createdAt: new Date(message.data.createdAt).toLocaleString(),
                unreadCount: message.data.unreadCount,
                messageFiles: message.data.messageFiles || [],
              });

              console.log("추가된 메시지:", this.messages);
            } catch (error) {
              console.error("메시지 파싱 오류:", error);
            }
          }
        );
      },
      (error) => {
        console.error("WebSocket 연결 오류:", error);
        // 재연결 시도
        setTimeout(() => {
          this.stompClient.connect();
        }, 10000); // 10초 후 재연결 시도
      }
    );
  },

  methods: {
    loadChatHistory() {
      api
        .get(`/chats/${this.chatRoomId}`, { timeout: 10000 }) // 10초 타임아웃 설정
        .then((response) => {
          console.log("응답 데이터:", JSON.stringify(response.data, null, 2));

          if (response.data && response.data.success && response.data.data) {
            const chatData = response.data.data;

            // chatMembers에서 현재 사용자의 nickName 설정
            if (Array.isArray(chatData.chatMembers)) {
              const currentUser = chatData.chatMembers.find(
                (member) => member.id === this.currentUserId
              );
              if (currentUser) {
                this.nickName = currentUser.nickName; // 현재 사용자의 nickName 설정
              }

              // 현재 사용자와 일치하지 않는 멤버를 찾아 receiverId 설정
              const receiver = chatData.chatMembers.find(
                (member) => member.id !== this.currentUserId
              );
              if (receiver) {
                this.receiverId = receiver.id; // 상대방의 ID로 receiverId 설정
              }
            }

            // messages 설정
            if (Array.isArray(chatData.messages)) {
              this.messages = chatData.messages.map((msg) => ({
                id: msg.id,
                senderId: msg.senderId,
                nickName: msg.nickName,
                content: msg.content,
                createdAt: new Date(msg.createdAt).toLocaleString(),
                unreadCount: msg.unreadCount,
                messageFiles: msg.messageFiles || [],
              }));
            }

            console.log("설정된 메시지 배열:", this.messages);
            this.isDataLoaded = true; // 데이터 로드 완료
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
          receiverId: this.receiverId, // 추가
          nickName: this.nickName,
          messageContent: this.newMessage,
          messageFiles: this.messageFiles || [], // 추가
        };

        this.stompClient.send(
          `/pub/chat/sendTextMessage/${this.chatRoomId}`,
          {},
          JSON.stringify(payload)
        );

        // 메시지를 보내고 나서 newMessage를 초기화
        this.newMessage = "";
      }
    },
  },
};
</script>

<style scoped>
.loading {
  text-align: center;
  padding: 20px;
  font-size: 18px;
  color: #666;
}
</style>

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
