<template>
  <!-- layout: flex -->
  <div class="flex">
    <!-- main-content: margin-left 200px, width: calc(100% - 200px) (임의 값 사용) -->
    <div class="w-[calc(100%)]">
      <!-- content: 흰색 배경, 텍스트 색상, 2rem 패딩, rounded, margin-top 3.5rem, flex, center 정렬, 높이 계산 -->
      <div
        class="bg-green-500 text-gray-800 p-8 rounded-lg mt-14 flex justify-center items-center h-[calc(75vh)]"
      >
        <!-- chat-container: 연한 회색 배경, 1rem 패딩, rounded, full width, 최대 600px, 높이 80vh, flex-col, border -->
        <div
          class="bg-[#f9f9f9] p-4 rounded-lg w-full max-w-[600px] h-[80vh] flex flex-col border border-gray-300"
        >
          <!-- 채팅 메시지 리스트 -->
          <div
            v-if="isDataLoaded"
            ref="messagesContainer"
            class="overflow-y-auto flex-grow p-4 rounded-lg"
          >
            <div
              v-for="(message, index) in messages"
              :key="index"
              :class="[
                'flex items-end mb-[15px] p-[10px] rounded-lg max-w-[75%]',
                message.senderId === currentUserId
                  ? 'ml-auto bg-blue-500'
                  : 'mr-auto  bg-red-500',
              ]"
            >
              <!-- 내 메시지 -->
              <template v-if="message.senderId === currentUserId">
                <!-- 메시지 내용과 읽음 숫자 컨테이너 (세로 정렬, 오른쪽 정렬) -->
                <div class="flex flex-col items-end">
                  <!-- 메시지 내용 박스 -->
                  <div class="bg-white p-2 rounded-lg inline-block text-right">
                    <div class="flex justify-between mb-1">
                      <strong>{{ message.nickName }}</strong>
                      <span class="text-[0.8rem] text-[#888]">{{
                        message.createdAt
                      }}</span>
                    </div>
                    <div class="whitespace-normal break-all">
                      {{ message.content }}
                    </div>
                  </div>
                  <!-- 읽음 표시 (메시지 내용 박스 바로 아래) -->
                  <span
                    v-if="message.unreadCount > 0"
                    class="text-[0.8rem] text-red-500 mt-1"
                  >
                    {{ message.unreadCount }}
                  </span>
                </div>
                <!-- 프로필 이미지 (오른쪽에 배치) -->
                <img
                  :src="message.profileImgUrl"
                  alt="Profile"
                  class="w-10 h-10 rounded-full ml-[10px]"
                />
              </template>

              <!-- 상대방 메시지 -->
              <template v-else>
                <!-- 프로필 이미지 (왼쪽에 배치) -->
                <img
                  :src="message.profileImgUrl"
                  alt="Profile"
                  class="w-10 h-10 rounded-full mr-[10px]"
                />
                <!-- 메시지 내용과 읽음 숫자 컨테이너 (세로 정렬, 왼쪽 정렬) -->
                <div class="flex flex-col items-start">
                  <!-- 메시지 내용 박스 -->
                  <div class="bg-white p-2 rounded-lg inline-block text-left">
                    <div class="flex justify-between mb-1">
                      <strong>{{ message.nickName }}</strong>
                      <span class="text-[0.8rem] text-[#888]">{{
                        message.createdAt
                      }}</span>
                    </div>
                    <div class="whitespace-normal break-all">
                      {{ message.content }}
                    </div>
                  </div>
                  <!-- 읽음 표시 (메시지 내용 박스 바로 아래) -->
                  <span
                    v-if="message.unreadCount > 0"
                    class="text-[0.8rem] text-red-500 mt-1"
                  >
                    {{ message.unreadCount }}
                  </span>
                </div>
              </template>
            </div>
          </div>
          <!-- 데이터 로딩 중 -->
          <div v-else class="text-center py-4">
            데이터를 불러오는 중입니다...
          </div>
          <!-- 입력창 영역 -->
          <div class="flex items-center p-2 bg-white rounded-lg mt-4">
            <!-- 파일 업로드 버튼 (라벨) -->
            <label
              for="file-upload"
              class="bg-[#007bff] text-white p-2 rounded-md cursor-pointer mr-2"
              >+</label
            >
            <input
              type="file"
              id="file-upload"
              ref="fileInput"
              @change="handleFileUpload"
              class="hidden"
            />
            <!-- 텍스트 입력창 -->
            <input
              type="text"
              v-model="newMessage"
              @keyup.enter="uploadFile"
              placeholder="메시지를 입력해주세요"
              class="flex-1 p-2 border border-gray-300 rounded-md mx-2"
            />
            <!-- 보내기 버튼 -->
            <button
              @click="uploadFile"
              class="py-2 px-4 rounded-md bg-blue-500 text-white cursor-pointer"
            >
              보내기
            </button>
          </div>
          <!-- 파일 미리보기 -->
          <div
            v-if="filePreview"
            class="fixed bottom-[80px] left-1/2 -translate-x-1/2 bg-white/80 p-[10px] rounded-lg shadow-lg text-center z-[1000]"
          >
            <img
              v-if="isImage"
              :src="filePreview"
              alt="파일 미리보기"
              class="max-w-[100px] max-h-[100px] mx-auto"
            />
            <p v-else class="m-0 py-[5px]">{{ fileName }}</p>
          </div>
        </div>
        <!-- 채팅 목록으로 이동 버튼 -->
        <button
          @click="goToChatRoomList"
          class="py-2 px-4 rounded-md bg-blue-500 text-white cursor-pointer mt-4"
        >
          채팅 목록으로 이동
        </button>
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
      receiverNickName: "",
      isDataLoaded: false,
      nickName: "",
      chatRoomType: "DM",
      readCount: 0,
      profileImgUrl: "",
      fileUrl: "",
      fileType: "",
      filePreview: "",
      isImage: false,
      connectedUsers: [],
      chatMembers: [],
    };
  },

  async mounted() {
    const token = localStorage.getItem("access");
    this.chatRoomId = this.$route.params.chatRoomId;

    if (token) {
      const decodedToken = jwtDecode.jwtDecode(token);
      this.currentUserId = decodedToken.id;
    }
    // 이전 메시지 데이터 가져오기
    await this.loadChatHistory();
    // WebSocket 연결
    await this.connectWebSocket();
    //읽지 않은 모든 메시지 읽음처리
    //await this.insertUnreadMessagesToChatRead();

    // beforeunload 이벤트 리스너 추가
    window.addEventListener("beforeunload", this.handleBeforeUnload);
  },

  beforeUnmount() {
    // 컴포넌트가 파괴되기 전에 beforeunload 이벤트 리스너 제거
    window.removeEventListener("beforeunload", this.handleBeforeUnload);
  },
  watch: {
    messages() {
      this.scrollToBottom();
    },
  },

  methods: {
    //페이지를 떠날 때 실행되는 메서드
    handleBeforeUnload(event) {
      // 페이지를 떠날 때 접속자 update
      this.sendDisconnectedUser();
    },

    async goToChatRoomList() {
      this.$router.push({
        path: `/users/${this.currentUserId}/chatRoomList`,
        beforeEnter: (to, from, next) => {
          this.sendDisconnectedUser();
          next();
        },
      });
    },
    isImageUrl(url) {
      return url.startsWith(
        "https://storage.googleapis.com/mercury-star-bucket/"
      );
    },
    async connectWebSocket() {
      const socket = new WebSocket(`ws://localhost:8080/chat`);
      this.stompClient = Stomp.over(socket);
      this.stompClient.heartbeat.outgoing = 0;
      this.stompClient.heartbeat.incoming = 0;
      this.stompClient.connect(
        {},
        (frame) => {
          console.log("Connected: " + frame);

          // 채팅방 접속 인원 구독
          this.stompClient.subscribe(
            `/topic/chat.connect.${this.chatRoomId}`,
            (messageOutput) => {
              try {
                const message = JSON.parse(messageOutput.body);
                console.log("채팅방에 참여한사람~:", message);

                // 현재 접속한 사용자 목록 업데이트
                this.connectedUsers = message.data.connectedMemberIds;

                console.log(
                  "현재 살아있는 채팅 접속 인원 : ",
                  this.connectedUsers
                );
              } catch (error) {
                console.error("메시지 파싱 오류:", error);
              }
            }
          );
          // 채팅방 접속 해제 인원 구독
          this.stompClient.subscribe(
            `/topic/chat.disconnect.${this.chatRoomId}`,
            (messageOutput) => {
              try {
                const message = JSON.parse(messageOutput.body);
                console.log("채팅방에 나간사람~:", message);

                // 현재 접속한 사용자 목록 업데이트.
                this.connectedUsers = message.data.connectedMemberIds;

                console.log(
                  "현재 살아있는 채팅 접속 인원 : ",
                  this.connectedUsers
                );
              } catch (error) {
                console.error("메시지 파싱 오류:", error);
              }
            }
          );

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
                  nickName: message.data.nickName || this.receiverNickName,
                  content: message.data.messageContent,
                  createdAt: new Date(message.data.createdAt).toLocaleString(),
                  profileImgUrl: message.data.profileImgUrl,
                  unreadCount: message.data.unreadCount,
                });

                // 메시지가 화면에 표시되면 읽음 상태 업데이트
                console.log("메시지 읽음 정보 업데이트 요청");
                this.updateReadUsers(message.data.id);
                //메시지를 잘 전달받았으면 채팅목록으로 새로운 메시지 왔다고 보냄
                this.sendRecentMessageToChatList(message);
              } catch (error) {
                console.error("메시지 파싱 오류:", error);
              } finally {
                this.scrollToBottom();
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
          // 채팅방 접속 시 접속자 update
          this.sendConnectedUser();
        },
        (error) => {
          console.error("WebSocket 연결 오류:", error);
          setTimeout(() => {
            this.connectWebSocket();
          }, 10000);
        }
      );
    },

    async loadChatHistory() {
      console.log("이전 메시지 기록 받아오기");
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
            this.chatMembers = chatData.chatMembers;

            console.log("채팅방 참여자: ", this.chatMembers);
            //nickName셋팅
            this.nickName = this.chatMembers.find(
              (member) => member.id === this.currentUserId
            ).nickName;
            //채팅방 타입 체크
            if (chatData.chatRoomType === "GROUP") {
              this.chatRoomType = "GROUP";
              //그룹멤버정보로 셋팅
            } else {
              //DM일 경우
              //현재 채팅방 멤버에서 내 아이디가 아닌 사람이 상대방이 됨

              this.receiverId = this.chatMembers.find(
                (member) => member.id !== this.currentUserId
              ).id;
              this.receiverNickName = this.chatMembers.find(
                (member) => member.id !== this.currentUserId
              ).nickName;
            }

            if (chatData.messages.length !== 0) {
              if (Array.isArray(chatData.messages)) {
                this.messages = chatData.messages.map((msg) => ({
                  id: msg.id,
                  senderId: msg.senderId,
                  nickName: msg.nickName || "알 수 없음",
                  profileImgUrl: msg.profileImgUrl,
                  content: msg.content,
                  createdAt: new Date(msg.createdAt).toLocaleString(),
                  unreadCount: msg.unreadCount, // unreadCount 추가
                }));
              }
            } else {
            }

            this.isDataLoaded = true;
            //this.insertUnreadMessagesToChatRead();
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
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
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
          // 메세지 전송 후 입력창 초기화
          this.newMessage = "";

          // this.scrollToBottom();
        } else {
          console.error("WebSocket is not connected.");
        }
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
    async insertUnreadMessagesToChatRead() {
      try {
        console.log("읽지 않은 메시지 읽음 처리");
        axiosInstance.post(
          `/chats/${this.chatRoomId}/insertUnreadMessagesToChatRead`
        );
      } catch (error) {
        console.error("읽지 않은 메시지 읽음 처리 중 에러 발생:", error);
      }
    },
    //채팅목록으로 최신메시지 전달
    sendRecentMessageToChatList(recentMessage) {
      console.log("채팅목록으로 보낼 최신 메시지 확인: ", recentMessage);
      const payload = {
        id: recentMessage.data.id,
        senderId: recentMessage.data.senderId,
        chatRoomId: this.chatRoomId,
        nickName: recentMessage.data.nickName,
        profileImgUrl: recentMessage.data.profileImgUrl,
        content: recentMessage.data.messageContent,
        createdAt: recentMessage.data.createdAt,
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
    // 접속한 사용자 정보 전송
    async sendConnectedUser() {
      const userPayload = {
        connectedMemberId: this.currentUserId,
      };
      console.log("접속한 사용자 정보 전송", userPayload);
      if (this.stompClient && this.stompClient.connected) {
        this.stompClient.send(
          `/pub/chat/connect/${this.chatRoomId}`,
          {},
          JSON.stringify(userPayload)
        );
      } else {
        console.error("WebSocket is not connected.");
      }
    },
    // 접속해제한 사용자 정보 전송
    async sendDisconnectedUser() {
      const userPayload = {
        connectedMemberId: this.currentUserId,
      };
      console.log("접속해제한 사용자 정보 전송", userPayload);
      if (this.stompClient && this.stompClient.connected) {
        this.stompClient.send(
          `/pub/chat/disconnect/${this.chatRoomId}`,
          {},
          JSON.stringify(userPayload)
        );
      } else {
        console.error("WebSocket is not connected.");
      }
    },
  },
};
</script>
