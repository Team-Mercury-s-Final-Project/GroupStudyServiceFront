<template>
  <div class="chat-room">
    <div class="messages">
      <ChatMessage
        v-for="message in messages"
        :key="message.id"
        :message="message"
      />
    </div>
    <input type="text" v-model="newMessage" @keyup.enter="sendMessage" />
  </div>
</template>

<script>
import ChatMessage from "./ChatMessage.vue";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

export default {
  components: {
    ChatMessage,
  },
  data() {
    return {
      messages: [],
      newMessage: "",
      chatRoomId: "1", // 예시 채팅방 ID
    };
  },
  mounted() {
    // WebSocket 연결 설정
    let socket = new WebSocket("ws://localhost:8080/chat");
    let stompClient = Stomp.over(socket);

    stompClient.connect(
      {},
      (frame) => {
        console.log("Connected: " + frame);
        // 특정 경로를 구독
        stompClient.subscribe(
          `/sub/topic/chat/${this.chatRoomId}`,
          (messageOutput) => {
            const message = JSON.parse(messageOutput.body);
            this.messages.push(message);
            console.log("Received message: ", message.messageContent);
          }
        );

        this.stompClient = stompClient; // stompClient를 Vue 인스턴스에 저장
      },
      (error) => {
        console.error("WebSocket connection error:", error);
        // 재연결 시도
        setTimeout(() => {
          this.stompClient.connect();
        }, 10000); // 5초 후 재연결 시도
      }
    );
  },
  methods: {
    sendMessage() {
      if (this.newMessage.trim() !== "") {
        const payload = {
          chatRoomId: this.chatRoomId,
          senderId: this.$store.state.userId, // 사용자 ID
          receiverId: this.receiverId, // 상대방 ID
          messageContent: this.newMessage,
        };
        this.stompClient.send(
          `/pub/topic/chat/sendTextMessage/${this.chatRoomId}`,
          JSON.stringify(payload),
          {}
        );
        this.newMessage = "";
      }
    },
  },
};
</script>

<style scoped>
.chat-room {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.messages {
  flex: 1;
  overflow-y: auto;
}
input {
  width: 100%;
  padding: 10px;
}
</style>
