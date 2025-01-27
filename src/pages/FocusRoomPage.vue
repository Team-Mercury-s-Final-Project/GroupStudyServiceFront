<!-- 집중방 -->
<template>
  <div class="timer-container">
    <div class="group-timer-container">
      <div
        class="group-member-timer"
        v-for="timeData in memberTimers"
        :key="timeData.userId"
      >
        <GroupMemberTimer :timeData="timeData" />
      </div>
    </div>
    <div class="my-timer-container">
      <UserTimer
        :time="12"
        :todayTotalTime="'10'"
        :nickname="'김스타'"
        :stomp-client="stompClient"
      />
      <div>
        <p>Connection Status: {{ isConnect }}</p>
        <button @click="connect()">김스타 Connect</button>
        <button @click="connect('한스타')">한스타 Connect</button>
        <button @click="sendMSG">메시지 테스트</button>
        <button @click="disconnectFromServer">Disconnect</button>
        <button @click="groupMembersTimerDataInit">datainit</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import UserTimer from "../components/timer/UserTimer.vue";
import GroupMemberTimer from "../components/timer/GroupMemberTimer.vue";
import Stomp from "webstomp-client";
import api from "../api.js";

//  ==== 상태값 시작 ====

// 집중방에 있는 유저들의 타이머 데이터 데이터 초기 값
const memberTimers = reactive([]);

// 집중방 아이디
const route = useRoute();
const groupId = ref(route.params.groupId);

// 웹소켓 연결 상태
const isConnect = ref(false);

// STOMP 클라이언트
const stompClient = ref(null);

// ==== 상태값 끝 ====

// ==== Methods ====

// 그룹원 타이머 데이터 받아오기
const groupMembersTimerDataInit = async () => {
  try {
    const response = await api.get(`/groups/${groupId.value}/timers`);
    memberTimers.splice(0, memberTimers.length, ...response.data); // 반응형 배열 업데이트
    console.log("응답 성공적");
    
  } catch (error) {
    console.error("API 호출 중 오류 발생:", error);
  }
};

// 웹소켓 연결
const connect = (type) => {
  let headers = {
    roomType: "focus",
    groupId: groupId.value,
    userId: "76",
    nickname: "김스타76",
  };
  if(type === "한스타") {
    headers = {
      roomType: "focus",
      groupId: groupId.value,
      userId: "77",
      nickname: "한스타77",
    };
  }
  let socket = new WebSocket("ws://localhost:8080/timer");
  stompClient.value = Stomp.over(socket);
  stompClient.value.connect(headers, () => {
    console.log("Connected to the server");
    isConnect.value = true;

    stompClient.value.subscribe(
      // destination 구독 경로
      `/sub/groups/${groupId.value}/timers`,
      // 서버로 부터 온 메시지(payload) 수신 후 실행할 함수
      (payload) => {
        // const data = JSON.parse(payload.body);
        console.log("Received data:", payload.body);

        //  // 받은 데이터로 memberTimers 업데이트
        //  const index = memberTimers.findIndex(timer => timer.userId === data.userId);
        // if (index !== -1) {
        //   memberTimers[index] = data; // 기존 데이터 업데이트
        // } else {
        //   memberTimers.push(data); // 새로운 데이터 추가
        // }
      }
    );
  });
};
// test msg
const sendMSG = () => {
  const msg = { message: "테스트입니다" };
  const jsonMsg = JSON.stringify(msg);
  console.log("Sending message:", jsonMsg);

  if (stompClient.value && stompClient.value.connected) {
    stompClient.value.send(
      // destination
      `/pub/groups/${groupId.value}/timers`,
      // body
      jsonMsg,
      // header
      {}
    );
  }
};
// 집중방 나가기
const disconnectFromServer = () => {
  if (stompClient.value) {
    stompClient.value.disconnect();
    isConnect.value = false;
  }
};
onMounted(() => {
  groupMembersTimerDataInit();
  // connect();
});

onUnmounted(() => {
  if (stompClient.value) {
    stompClient.value.disconnectFromServer();
  }
});
</script>
<style scoped>
.timer-container {
  background-color: gold;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
}

.group-timer-container {
  display: flex;
  justify-content: space-evenly;
  background-color: red;
  flex-wrap: wrap;
  gap: 10px;
}

.group-member-timer {
  width: calc(33.33% - 10px); /* 3열 레이아웃 */
  background-color: #f0f0f0;
  padding: 10px;
  border: 1px solid #ccc;
}
</style>
