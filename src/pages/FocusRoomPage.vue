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
      <MyTimer v-bind="toRefs(myTimerData)" :stompClient="stompClient" />
      <div>
        <p>Connection Status: {{ isConnect }}</p>
        <button @click="connect()">구글모 Connect</button>
        <button @click="connect('구카모')">구카모 Connect</button>
        <button @click="sendMSG">메시지 테스트</button>
        <button @click="disconnectFromServer">Disconnect</button>
        <button @click="groupMembersTimerDataInit">datainit</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, toRefs } from "vue";
import { useRoute } from "vue-router";
import MyTimer from "../components/timer/MyTimer.vue";
import GroupMemberTimer from "../components/timer/GroupMemberTimer.vue";
import Stomp from "webstomp-client";
import api from "../api.js";

//  ==== 상태값 시작 ====
// 임시 로그인 유저 아이디
const userId = ref(1);

// 집중방에 있는 유저들의 타이머 데이터 데이터 초기 값
const memberTimers = reactive([]);
const myTimerData = reactive({
  userId: userId.value,
  nickname: "구글모",
  todayTotalTime: 0,
  timeSoFar: 7,
});

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
    const response = await api.get(`/api/groups/${groupId.value}/timers`);
    const timerDatas = response.data;
    console.log("timerDatas:=====**", timerDatas);

    timerDatas.forEach((timer) => {
      if (timer.userId === userId.value) {
        console.log("내 타이머 데이터!!!!!!!!!!!!!");

        Object.assign(myTimerData, timer);
      } else {
        console.log("그룹원 타이머 데이터!!!!!!!!!!!!!");

        memberTimers.push(timer);
      }
    });

    console.log("응답 성공적");
  } catch (error) {
    console.error("API 호출 중 오류 발생:", error);
  }
};

// 웹소켓 연결
async function connect(type) {
  let headers = {
    roomType: "focus",
    groupId: groupId.value,
    userId: 1,
    nickname: "구글모",
  };
  if (type === "구카모") {
    console.log("구카모 연결");
    userId.value = 2;
    myTimerData.userId = 2;
    myTimerData.nickname = "구카모";
    headers = {
      roomType: "focus",
      groupId: groupId.value,
      userId: 2,
      nickname: "구카모",
    };
  }
  let socket = new WebSocket("ws://localhost:8080/timer");
  stompClient.value = Stomp.over(socket);

  await stompClient.value.connect(headers, () => {
    console.log("스톰프 서버 연결 성공");
    isConnect.value = true;

    stompClient.value.subscribe(
      // destination 구독 경로
      `/sub/groups/${groupId.value}/timers`,
      // 서버로 부터 온 메시지(payload) 수신 후 실행할 함수
      (payload) => {
        if (payload.body) {
          const eventData = JSON.parse(payload.body);
          handleEvent(eventData);
          console.log("=====Received data=====:", eventData);
        }
      }
    );
  });
};

const handleEvent = (eventData) => {
  const eventHandler = timerEventHandlers[eventData.event];
  console.log("이벤트 도착!!!!!", eventData.event);
  console.log("eventHandler", eventHandler);

  if (eventHandler) {
    eventHandler(eventData);
  } else {
    console.error("이벤트를 찾을 수 없습니다 이벤트:", eventData.event);
  }
};

const timerEventHandlers = {
  START: (eventData) => {
    console.log("=====TIMER_START 이벤트 발생=====");

    const { userId } = eventData;
    const memberTimer = memberTimers.find((timer) => timer.userId === userId);
    if (memberTimer) {
      console.log(" 아니 해당하는 거 있냐?");
      
      memberTimer.ranking = eventData.ranking;
      memberTimer.time = eventData.timeSoFar;
      memberTimer.todayTotalTime = eventData.todayTotalTime;
      memberTimer.status = "START";
    }
    console.log("memberTimers: 변경되나?", memberTimers);
    console.log("memberTimer: 변경되나?", memberTimer);
    
    
  },
  STOP: (eventData) => {
    console.log("=====TIMER_STOP 이벤트 발생=====");

    const { userId } = eventData;
    const memberTimer = memberTimers.find((timer) => timer.userId === userId);
    if (memberTimer) {
      memberTimer.ranking = eventData.ranking;
      memberTimer.todayTotalTime = eventData.todayTotalTime;
      memberTimer.timeSoFar = eventData.timeSoFar;
      memberTimer.status = "STOP";
    }
  },
  END: (eventData) => {
    console.log("=====TIMER_END 이벤트 발생=====");
    
    const { userId } = eventData;
    const memberTimer = memberTimers.find((timer) => timer.userId === userId);
    if (memberTimer) {
      memberTimer.status = "END";
      memberTimer.timeSoFar = 0;
      memberTimer.todayTotalTime = eventData.todayTotalTime;
      memberTimer.ranking = eventData.ranking;
    }
  
    if (myTimerData.userId === userId) {
      myTimerData.timeSoFar = 0;
      myTimerData.todayTotalTime = eventData.todayTotalTime;
    }
  },
  ENTRY: (eventData) => {
    console.log("=====ENTRY 이벤트 발생=====");

    const { userId, nickname, timeSoFar, todayTotalTime, ranking, status } =
      eventData;
    memberTimers.push({
      userId,
      nickname,
      timeSoFar,
      todayTotalTime,
      ranking,
      status,
    });
  },
  DISCONNECT: (eventData) => {
    console.log("=====DISCONNECT 이벤트 발생=====");
    const { userId } = eventData;
    const index = memberTimers.findIndex((timer) => timer.userId === userId);
    if (index !== -1) {
      memberTimers.splice(index, 1);
    }
  },
};
// test msg
const sendMSG = () => {
  const msg = { message: "테스트입니다" };
  const jsonMsg = JSON.stringify(msg);
  console.log("Sending message:", jsonMsg);

  if (stompClient.value && stompClient.value.connected) {
    stompClient.value.send(
      // destination
      `/pub/groups/${groupId.value}/timers/start`,
      // body
      myTimerData.userId.toString(),
      // header
      {}
    );
  }
};
// 집중방 나가기
const disconnectFromServer = () => {
  console.log("Disconnecting from the server");
  if (stompClient.value) {
    stompClient.value.disconnect();
    isConnect.value = false;
  }
};
onMounted(() => {
  connect();
  // 1초 뒤에 데이터 받아오기 - 비동기화 문제 해결 필요 backend listener가 오래 동작하는 문제
  setTimeout(() => {
    groupMembersTimerDataInit();
  }, 1000);
});

onUnmounted(() => {
  if (stompClient.value) {
    disconnectFromServer();
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
  width: 100%;
  height: 80%;
}

.group-member-timer {
  width: calc(33.33% - 10px); /* 3열 레이아웃 */
  background-color: #f0f0f0;
  padding: 10px;
  border: 1px solid #ccc;
}
</style>
