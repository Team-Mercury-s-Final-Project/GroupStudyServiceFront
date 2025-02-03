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
              <img
                :src="message.profileImgUrl"
                class="profile-picture"
                alt="Profile"
              />
              <div class="message-details">
                <div class="message-header">
                  <strong>{{ message.nickName }}</strong>
                  <span class="message-timestamp">{{ message.createdAt }}</span>
                </div>
                <div class="message-content">
                  {{ message.content }}
                  <span class="unread-count" v-if="message.unreadCount > 0">
                    {{ message.unreadCount }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="loading">데이터를 불러오는 중입니다...</div>
          <div class="input-container">
            <label for="file-upload" class="upload-button">+</label>
            <input
              type="file"
              id="file-upload"
              @change="uploadFile"
              style="display: none"
            />
            <input
              type="text"
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
      readCount: 0,
      profileImgUrl: "",
      fileUrl: "",
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

          // 메시지 구독
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
                  profileImgUrl: message.data.profileImgUrl,
                  unreadCount: message.data.unreadCount,
                });

                // 메시지가 화면에 표시되면 읽음 상태 업데이트
                this.updateReadUsers(message.data.id);
                console.log("메시지 읽음 정보 업데이트 요청");
              } catch (error) {
                console.error("메시지 파싱 오류:", error);
              }
            }
          );
          // 읽음 정보 응답 구독
          this.stompClient.subscribe(
            `/topic/readCheck.response.${this.chatRoomId}`,
            (readInfo) => {
              try {
                const readData = JSON.parse(readInfo.body);
                console.log("읽은 사용자 정보", readData);
                const messageIndex = this.messages.findIndex(
                  (msg) => msg.id === readData.chatMessageId
                );
                if (messageIndex !== -1) {
                  // unreadCount를 직접 설정
                  this.messages[messageIndex].unreadCount =
                    readData.unreadCount;
                }
              } catch (error) {
                console.error("읽음 정보 파싱 오류 ::", error);
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
            //채팅방 타입 체크
            if (chatData.chatRoomType === "GROUP") {
              this.chatRoomType = "GROUP";
            }
            if (Array.isArray(chatData.messages)) {
              this.messages = chatData.messages.map((msg) => ({
                id: msg.id,
                senderId: msg.senderId,
                nickName: msg.nickName || "알 수 없음",
                profileImgUrl: msg.profileImgUrl,
                content: msg.content,
                createdAt: new Date(msg.createdAt).toLocaleString(),
                unreadCount: msg.unreadCount, // unreadCount 추가
              isImage: this.isImageUrl(msg.content), // 이미지 여부 확인
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
      //텍스트릅 입력하였는가 / 파일url이 있는가
      if (this.newMessage.trim() !== "" || this.fileUrl) {
        const messageFileDto = {
          id: null, // id는 backend에서 생성 가능.
          fileUrl: this.fileUrl,
          fileType: this.file ? this.file.type : null,
          chatMessageId: null, // chatMessageId는 메시지와 연관된 ID로, backend에서 설정.
        };

        const payload = {
          chatRoomId: this.chatRoomId,
          senderId: this.currentUserId,
          receiverId: this.receiverId,
          nickName: this.nickName,
          messageContent: this.newMessage.trim(),
          chatRoomType: this.chatRoomType,
          messageFiles: this.fileUrl ? [messageFileDto] : [],
        };

        if (this.stompClient && this.stompClient.connected) {
          if (this.fileUrl) {
            this.stompClient.send(
              `/pub/chat/sendFileMessage/${this.chatRoomId}`,
              {},
              JSON.stringify(payload)
            );
            this.fileUrl = null; // 파일 URL 초기화
          } else {
            this.stompClient.send(
              `/pub/chat/sendTextMessage/${this.chatRoomId}`,
              {},
              JSON.stringify(payload)
            );
          }
        } else {
          console.error("WebSocket is not connected.");
        }

        this.newMessage = "";
      }
    },

    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.file = file;
        const fileType = file.type;
        console.log("파일 타입:", fileType);
      }
    },

    async uploadFile() {
      if (this.file) {
        try {
          console.log("파일 업로드 시작");
          const formData = new FormData();
          formData.append("file", this.file);
          const response = await axiosInstance.post("/files/image", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          const fileUrl = response.data.url;
          console.log("파일 업로드 완료. URL:", fileUrl);

          this.fileUrl = fileUrl; // 파일 URL 저장
          this.file = null; // 파일 초기화
          this.sendMessage(); // 파일 업로드가 완료되면 sendMessage 함수 호출
        } catch (error) {
          console.error(error);
        }
      } else {
        this.sendMessage(); // 파일이 없으면 sendMessage 함수 바로 호출
      }
    },

    updateReadUsers(messageId) {
      const readPayload = {
        chatMessageId: messageId,
        chatUserId: this.currentUserId,
      };

      if (this.stompClient && this.stompClient.connected) {
        this.stompClient.send(
          `/pub/readCheck/${this.chatRoomId}`,
          {},
          JSON.stringify(readPayload)
        );
      } else {
        console.error("WebSocket is not connected.");
      }
    },
  },
};
</script>

<style scoped>
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
.main-content {
  margin-left: 200px;
  width: calc(100% - 200px);
}
.content {
  background-color: #fff;
  color: #333;
  padding: 2rem;
  border-radius: 10px;
  margin-top: 3.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 3.5rem);
}
.chat-container {
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 10px;
  width: 100%;
  max-width: 600px;
  height: 80vh;
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
}
.messages {
  overflow-y: auto;
  flex-grow: 1;
  padding: 1rem;
  border-radius: 10px;
}
.message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 10px;
  background-color: #e3e3e3;
  max-width: 75%;
}
.my-message {
  justify-content: flex-end;
  background-color: #daf5ff;
}
.other-message {
  justify-content: flex-start;
}
.profile-picture {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}
.message-details {
  background-color: #fff;
  padding: 10px;
  border-radius: 10px;
  position: relative;
  max-width: 75%;
}
.my-message .message-details {
  background-color: #fff;
}
.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}
.message-timestamp {
  font-size: 0.8rem;
  color: #888;
}
.message-content {
  display: flex;
  align-items: center;
}
.unread-count {
  font-size: 0.8rem;
  color: red;
  margin-left: 5px;
}
.input-container {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background-color: #fff;
  border-radius: 10px;
  margin-top: 1rem;
}
input[type="text"] {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}
button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: #fff;
  cursor: pointer;
}
.upload-button {
  background-color: #007bff;
  color: #fff;
  padding: 0.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-right: 0.5rem;
}
</style>
