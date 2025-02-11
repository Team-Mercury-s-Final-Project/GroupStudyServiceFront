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
      <span>{{ userId }}</span>
      <MyTimer
        v-bind="toRefs(myTimerData)"
        :stompClient="stompClient"
        :isConnect="isConnect"
      />
      <div>
        <p>Connection Status: {{ isConnect }}</p>
        <button @click="connect()">Connect</button>
        <button @click="sendMSG">메시지 테스트</button>
        <button @click="disconnectFromServer">Disconnect</button>
        <button @click="groupMembersTimerDataInit">datainit</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, toRefs } from "vue";
import { useRoute, useRouter } from "vue-router";
import MyTimer from "../components/timer/MyTimer.vue";
import GroupMemberTimer from "../components/timer/GroupMemberTimer.vue";
import Stomp from "webstomp-client";
import axiosInstance from "../api/axiosInstance";

//  ==== 상태값 시작 ====
const userId = ref(localStorage.getItem("userId"));

// 집중방에 있는 유저들의 타이머 데이터 데이터 초기 값
const memberTimers = reactive([]);
const myTimerData = reactive({
  userId: userId.value,
  nickname: "서버 접속중",
  todayTotalTime: 0,
  timeSoFar: 3,
});

// 집중방 아이디
const route = useRoute();
const groupId = ref(route.params.groupId);

// 웹소켓 연결 상태
const isConnect = ref(false);

// STOMP 클라이언트
const stompClient = ref(null);

// ==== 상태값 끝 ====

// ==== Methods 시작====

// 웹소켓 연결
function connect() {
  const headers = {
    roomType: "focus",
    groupId: groupId.value,
    userId: userId.value,
    nickname: myTimerData.nickname,
    Authorization: "Bearer " + localStorage.getItem("access"),
  };

  const socket = new WebSocket("ws://localhost:8080/timer");
  stompClient.value = Stomp.over(socket);

  stompClient.value.connect(headers, () => {
    console.log("스톰프 서버 연결 성공");
    isConnect.value = true;

    stompClient.value.subscribe(
      // destination 구독 경로
      `/topic/groups.${groupId.value}.timers`,
      // 서버로 부터 온 메시지(payload) 수신 후 실행할 함수
      (payload) => {
        if (payload.body) {
          const eventData = JSON.parse(payload.body);
          handleEvent(eventData);
        }
      }
    );
    // sub 완료
  });
}

const handleEvent = (eventData) => {
  const eventHandler = timerEventHandlers[eventData.event];
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
      memberTimer.ranking = eventData.ranking;
      memberTimer.time = eventData.timeSoFar;
      memberTimer.todayTotalTime = eventData.todayTotalTime;
      memberTimer.status = "START";
    }
    // Start Event 시, 서버 기준으로 내 타이머 데이터 업데이트
    if (myTimerData.userId === userId) {
      myTimerData.timeSoFar = eventData.timeSoFar;
      myTimerData.todayTotalTime = eventData.todayTotalTime;
    }
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
    if (myTimerData.userId === userId) {
      myTimerData.timeSoFar = eventData.timeSoFar;
      myTimerData.todayTotalTime = eventData.todayTotalTime;
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
    if (userId === myTimerData.userId) {
      return;
    }
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

// 집중방 나가기
const disconnectFromServer = () => {
  console.log("Disconnecting from the server");
  if (stompClient.value) {
    stompClient.value.disconnect();
    // isConnect.value = false;
  }
};
const checkLoginAndConnect = async () => {
  const userId = localStorage.getItem("userId");
  if (!localStorage.getItem("access") && userId === null) {
    // alert("로그인이 필요합니다.");
    const router = useRouter();
    router.push("/login");
  } else {
    await enterAndGetMyTimerData();
    await connect();
    groupMembersTimerDataInit();
  }
};
// 내 타이머 데이터 받아오기
const enterAndGetMyTimerData = async () => {
  try {
    const response = await axiosInstance.get(
      `/groups/${groupId.value}/timers/entry`
    );
    const timerData = response.data;
    Object.assign(myTimerData, timerData);
  } catch (error) {
    console.error("API 호출 중 오류 발생:", error);
  }
};
// 그룹원 타이머 데이터 받아오기
const groupMembersTimerDataInit = async () => {
  try {
    const response = await axiosInstance.get(`/groups/${groupId.value}/timers`);
    const timerDatas = response.data;
    timerDatas.forEach((timer) => {
      if (timer.userId == userId.value) {
        Object.assign(myTimerData, timer);
      } else {
        memberTimers.push(timer);
      }
    });
  } catch (error) {
    console.error("API 호출 중 오류 발생:groupMembersTimerDataInit", error);
  }
};

onMounted(() => {
  // getMyTimerData();
  checkLoginAndConnect();
  // 1초 뒤에 데이터 받아오기 - 비동기화 문제 해결 필요 backend listener가 오래 동작하는 문제
  setTimeout(() => {
    // groupMembersTimerDataInit();
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
