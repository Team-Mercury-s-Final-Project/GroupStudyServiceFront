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
                  <div v-if="isImageUrl(message.content)">
                    <a
                      :href="message.content"
                      target="_blank"
                      class="link-preview"
                    >
                      <img
                        :src="message.content"
                        alt="미리보기 이미지"
                        class="preview-image"
                      />
                    </a>
                  </div>
                  <div v-else>
                    {{ message.content }}
                  </div>
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
              ref="fileInput"
              @change="handleFileUpload"
              style="display: none"
            />
            <input
              type="text"
              v-model="newMessage"
              @keyup.enter="uploadFile"
              placeholder="메시지를 입력해주세요"
            />
            <button @click="uploadFile">보내기</button>
          </div>
          <div v-if="filePreview" class="file-preview">
            <img :src="filePreview" alt="파일 미리보기" v-if="isImage" />
            <p v-else>{{ fileName }}</p>
          </div>
        </div>
        <!-- 여기서 시작 -->
        <button @click="goToChatRoomList" class="chat-room-list-button">
          채팅 목록으로 이동
        </button>
        <!-- 여기서 끝 -->
      </div>
    </div>
  </div>
</template>

<script>
import Stomp from "stompjs";
import * as jwtDecode from "jwt-decode";
import axiosInstance from "../../api/axiosInstance.js";

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
      fileType: "",
      filePreview: "",
      isImage: false,
      totalUsers: [],
    };
  },

  mounted() {
    const token = localStorage.getItem("access");
    this.chatRoomId = this.$route.params.chatRoomId;

    if (token) {
      const decodedToken = jwtDecode.jwtDecode(token);
      this.currentUserId = decodedToken.id;
    }

    this.loadChatHistory();
    this.connectWebSocket();
  },

  methods: {
    // WebSocket 연결 종료 메서드
    disconnectWebSocket() {
      if (this.stompClient) {
        this.stompClient.disconnect(() => {
          console.log("WebSocket 연결이 종료되었습니다.");
        });
      }
    },
    //채팅목록으로 이동
    async goToChatRoomList() {
      this.disconnectWebSocket();
      this.$router.push(`/users/${this.currentUserId}/chatRoomList`);
    },
    isImageUrl(url) {
      return url.startsWith(
        "https://storage.googleapis.com/mercury-star-bucket/"
      );
    },
    connectWebSocket() {
      const socket = new WebSocket(`ws://localhost:8080/chat`);
      this.stompClient = Stomp.over(socket);
      this.allReadCheckProcessed = false; // 모든 읽음 처리가 완료되었음을 나타내는 플래그
      this.stompClient.connect(
        {},
        (frame) => {
          // 서버로부터 현재 접속 중인 사용자 정보를 요청
          this.updateConnectedUsersInterval();
          console.log("Connected: " + frame);
          let readCheckProcessedUsers = 0;

          // 읽음 정보 응답 구독. 메시지를 받을 때 있었다면 '읽음'처리.
          //현재 접속중인 사용자 수만큼 읽음 메시지를 전송.
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

                  readCheckProcessedUsers++;

                  if (
                    readCheckProcessedUsers ===
                    this.totalUsers.connectedUsers.length
                  ) {
                    this.allReadCheckProcessed = true;
                  }

                  if (this.allReadCheckProcessed) {
                    //읽음 정보가 update된 최신 메시지를 채팅목록으로 전달
                    console.log("채팅목록으로 최신 메시지 전달");
                    this.sendRecentMessageToChatList(
                      this.messages[messageIndex]
                    );
                    this.allReadCheckProcessed = false; // 플래그 초기화
                    readCheckProcessedUsers = 0; // 사용자 명수 초기화
                  }
                }
              } catch (error) {
                console.error("읽음 정보 파싱 오류 ::", error);
              }
            }
          );

          // 메시지 구독
          this.stompClient.subscribe(
            `/topic/chat.${this.chatRoomId}`,
            (messageOutput) => {
              try {
                const message = JSON.parse(messageOutput.body);
                console.log("Received message:", message);
                console.log("사용자 아이디 : ", this.currentUserId);
                this.messages.push({
                  id: message.data.id,
                  senderId: message.data.senderId,
                  nickName: message.data.nickName || "알 수 없음",
                  content: message.data.messageContent,
                  createdAt: new Date(message.data.createdAt).toLocaleString(),
                  profileImgUrl: message.data.profileImgUrl,
                  unreadCount: message.data.unreadCount,
                  // 이미지 확인 부분 제거됨
                });

                // 메시지가 화면에 표시되면 읽음 상태 업데이트
                console.log("메시지 읽음 정보 업데이트 요청");
                this.updateReadUsers(message.data.id);
              } catch (error) {
                console.error("메시지 파싱 오류:", error);
              }
            }
          );

          this.stompClient.subscribe(
            `/topic/readCheck.bulkResponse.${this.chatRoomId}`,
            (updatedMessageIds) => {
              try {
                const readData = JSON.parse(updatedMessageIds.body);
                console.log("읽음 처리된 메시지 아이디들", readData);

                // unreadMessages의 id와 일치하는 메시지의 unreadCount를 -1 감소
                readData.unreadMessages.forEach((readMessageId) => {
                  const messageIndex = this.messages.findIndex(
                    (msg) => msg.id === readMessageId
                  );
                  if (
                    messageIndex !== -1 &&
                    this.messages[messageIndex].unreadCount > 0
                  ) {
                    this.messages[messageIndex].unreadCount--;
                  }
                });
              } catch (error) {
                console.error(
                  "읽음 처리된 메시지 아이디들을 가져오는데 에러 발생",
                  error
                );
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
                // 이미지 확인 부분 제거됨
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
      if (this.newMessage.trim() !== "" || this.fileUrl) {
        const messageFileDto = {
          id: null, // id는 backend에서 생성될 수 있습니다.
          fileUrl: this.fileUrl,
          fileType: this.fileType,
          chatMessageId: null, // chatMessageId는 메시지와 연관된 ID로, backend에서 설정될 수 있습니다.
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
              `/pub/chat/sendFile/${this.chatRoomId}`,
              {},
              JSON.stringify(payload)
            );
            this.fileUrl = null; // 파일 URL 초기화
            this.fileType = null; // 파일 타입 초기화
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
        this.fileType = file.type;
        this.fileName = file.name;
        console.log("파일 타입:", this.fileType);

        if (this.fileType.startsWith("image/")) {
          this.isImage = true;
          const reader = new FileReader();
          reader.onload = (e) => {
            this.filePreview = e.target.result;
          };
          reader.readAsDataURL(file);
        } else {
          this.isImage = false;
          this.filePreview = null;
        }
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
          const fileUrl = response.data.data.url;
          console.log("파일 업로드 완료. URL:", fileUrl);

          this.fileUrl = fileUrl;
          this.file = null;
          this.filePreview = null;
          this.sendMessage(); // 파일 업로드가 완료되면 sendMessage 함수 호출
        } catch (error) {
          console.error(error);
        }
      } else if (this.newMessage.trim() !== "") {
        this.sendMessage(); // 파일이 없고 메시지가 있을 경우 sendMessage 함수 호출
      }
    },
    //채팅목록으로 최신메시지 전달
    sendRecentMessageToChatList(recentMessage) {
      console.log("채팅목록으로 보낼 최신 메시지 확인: ", recentMessage);
      const payload = {
        id: recentMessage.id,
        senderId: recentMessage.senderId,
        chatRoomId: this.chatRoomId,
        nickName: recentMessage.nickName,
        profileImgUrl: recentMessage.profileImgUrl,
        content: recentMessage.content,
        createdAt: new Date(recentMessage.createdAt).toLocaleDateString,
      };

      if (this.stompClient && this.stompClient.connected) {
        this.stompClient.send(
          `/pub/chat/sendRecentMessageToChatList/${this.chatRoomId}`,
          {},
          JSON.stringify(payload)
        );
      } else {
        console.error("WebSocket is not connected.");
      }
    },

    //메시지 읽음처리
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
    //현재 웹소켓에 접속해있는 사람들 받아오기
    async fetchConnectedUsers() {
      try {
        const response = await axiosInstance.get(
          `chats/${this.chatRoomId}/chatRoomConnectedUsers`,
          {
            timeout: 10000,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        this.totalUsers = response.data.data;
        console.log("현재 접속 중인 사용자:", this.totalUsers);
      } catch (error) {
        console.error(
          "현재 접속 중인 사용자 정보를 가져오는 데 실패했습니다:",
          error
        );
      }
    },
    // 주기적으로 접속자 정보를 업데이트하는 함수
    updateConnectedUsersInterval() {
      this.fetchConnectedUsers();
      setInterval(() => {
        this.fetchConnectedUsers();
      }, 1000000); // 5초마다 업데이트
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

.file-preview {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  z-index: 1000;
}
.file-preview img {
  max-width: 100px;
  max-height: 100px;
}
.file-preview p {
  margin: 0;
  padding: 5px 0;
}
.message-image {
  max-width: 200px;
  max-height: 200px;
  margin-top: 10px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
.file-preview {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  z-index: 1000;
}
.file-preview img {
  max-width: 100px;
  max-height: 100px;
}
.file-preview p {
  margin: 0;
  padding: 5px 0;
}
.preview-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 5px;
}
</style>
