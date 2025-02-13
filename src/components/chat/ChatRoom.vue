<template>
  <!-- layout: flex -->
  <div class="flex">
    <!-- main-content: margin-left 200px, width: calc(100% - 200px) (임의 값 사용) -->
    <div class="w-[calc(100%)]">
      <!-- content: 흰색 배경, 텍스트 색상, 2rem 패딩, rounded, margin-top 3.5rem, flex, center 정렬, 높이 계산 -->
      <div
        class="bg-[#f9f9f9] text-gray-800 p-8 rounded-lg mt-14 flex justify-center items-center h-[calc(75vh)]"
      >
        <!-- chat-container: 연한 회색 배경, 1rem 패딩, rounded, full width, 최대 600px, 높이 80vh, flex-col, border -->
        <div
          class="bg-[#f9f9f9] p-4 rounded-lg w-full max-w-[600px] h-[80vh] flex flex-col border border-gray-300 relative"
        >
          <!-- 채팅 목록으로 이동 버튼을 채팅창 우측 상단에 배치 (절대 위치) -->
          <button
            @click="goToChatRoomList"
            class="absolute top-2 right-2 py-2 px-4 rounded-md bg-green-500 text-white cursor-pointer z-10"
          >
            채팅 목록으로 이동
          </button>
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
                  ? 'ml-auto bg-[#f9f9f9] justify-end'
                  : 'mr-auto  bg-[#f9f9f9] justify-start',
              ]"
            >
              <!-- 내 메시지 -->
              <template v-if="message.senderId === currentUserId">
                <!-- 메시지 내용과 읽음 숫자 컨테이너 (세로 정렬, 오른쪽 정렬) -->
                <div class="flex flex-col items-end">
                  <!-- 메시지 내용 박스 -->
                  <div
                    class="bg-blue-500 p-2 rounded-lg inline-block text-right text-white min-w-[270px]"
                  >
                    <div class="flex justify-between mb-1">
                      <strong>{{ message.nickName }}</strong>
                      <span class="text-[0.8rem] text-white opacity-75">
                        {{ formatTimestamp(message.createdAt) }}
                      </span>
                    </div>
                    <div class="whitespace-normal break-all">
                      <template v-if="isImageUrl(message.content)">
                        <!-- 이미지 URL인 경우 이미지 태그로 렌더링 -->
                        <img
                          :src="message.content"
                          class="max-w-full max-h-60"
                          alt="Uploaded Image"
                          @load="scrollToBottom"
                        />
                      </template>
                      <template v-else>
                        {{ message.content }}
                      </template>
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
                  <div
                    class="bg-gray-200 p-2 rounded-lg inline-block text-left text-black"
                  >
                    <div class="flex justify-between mb-1">
                      <strong>{{ message.nickName }}</strong>
                      <span class="text-[0.8rem] text-gray-600">
                        {{ formatTimestamp(message.createdAt) }}
                      </span>
                    </div>
                    <div class="whitespace-normal break-all">
                      <template v-if="isImageUrl(message.content)">
                        <img
                          :src="message.content"
                          class="max-w-full max-h-60"
                          alt="Uploaded Image"
                          @load="scrollToBottom"
                        />
                      </template>
                      <template v-else>
                        {{ message.content }}
                      </template>
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
              class="bg-[#007bff] text-white flex justify-center items-center w-8 h-8 rounded-md cursor-pointer mr-2 text-2xl font-bold"
            >
              +
            </label>
            <input
              type="file"
              id="file-upload"
              ref="fileInput"
              @change="handleFileUpload"
              class="hidden"
            />
            <!-- 텍스트 입력창을 input 대신 textarea로 변경 -->
            <textarea
              v-model="newMessage"
              @keyup.enter="uploadFile"
              :placeholder="filePreview ? '' : '메시지를 입력해주세요'"
              :style="{ minHeight: filePreview ? '125px' : '60px' }"
              class="flex-1 p-2 border border-gray-300 rounded-md mx-2 resize-y"
            ></textarea>

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
    formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // 0부터 시작하므로 +1
      const day = date.getDate();

      let hour = date.getHours();
      const minute = date.getMinutes();
      const second = date.getSeconds();

      // 오전/오후 판별
      const period = hour < 12 ? "오전" : "오후";

      // 12시간제로 변환 (0시(자정)은 12시로)
      hour = hour % 12;
      if (hour === 0) {
        hour = 12;
      }

      // 분이 10 미만이면 앞에 0 붙이기
      const paddedMinute = minute < 10 ? "0" + minute : minute;
      const paddedSecond = second < 10 ? "0" + second : second;

      return `${year}-${month}-${day} ${period} ${hour}시 ${paddedMinute}분 ${paddedSecond}초 `;
    },
    isImageUrl(url) {
      // 간단하게 jpg, jpeg, png, gif 확장자 여부로 판별하거나,
      // 특정 도메인이 포함되어 있는지 확인할 수 있습니다.
      return (
        typeof url === "string" &&
        (url.endsWith(".jpg") ||
          url.endsWith(".jpeg") ||
          url.endsWith(".png") ||
          url.endsWith(".gif") ||
          url.includes("storage.googleapis.com"))
      );
    },
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
      this.stompClient.heartbeat.outgoing = 25000;
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
