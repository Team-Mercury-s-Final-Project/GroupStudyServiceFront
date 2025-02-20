<!-- 집중방 -->
<template>
  <div
    class="p-4 gradient-background h-[1500px] lg:h-[700px] flex flex-col lg:flex-row justify-center space-x-0 lg:space-x-32 lg:space-y-0 overflow-auto"
  >
    <!-- 타이머 진행사항 박스랑 내 타이머를 묶어준다 -->
    <div
      class="flex flex-col space-y-4 w-[450px] md:w-[550px] lg:w-[700px] xl:w-[1000px] flex-1 h-full"
    >
      <!-- 타이머 진행 사항 박스 -->
      <div class="bg-green-300 p-4 rounded-lg overflow-y-auto h-[530px]">
        <div class="grid grid-cols-2 gap-4">
          <!-- 각 사람의 타이머 진행 상황 카드 -->
          <GroupMemberTimer
            v-for="timeData in memberTimers"
            :key="timeData.id"
            :timeData="timeData"
          />
        </div>
      </div>
      <!-- 자신의 타이머 박스 -->
      <!-- 높이, 너비 여기서 조절 -->
      <MyTimer v-bind="toRefs(myTimerData)" :stompClient="stompClient" />
    </div>
    <!-- 오른쪽 추가 박스 -->
    <div
      class="p-4 bg-gray-800 text-white rounded-lg shadow-lg xs:w-[400px] sm:w-[450px] md:w-[550px] lg:w-[300px] h-[668px]np overflow-y-auto"
    >
      <!-- 새로고침 버튼 -->
      <h2 class="text-xl font-bold text-center mb-4">
        오늘의 랭킹
        <img
          @click="getRankData"
          src="../assets/refresh-ccw.svg"
          :class="[
            'inline',
            'rotate-180',
            'cursor-pointer',
            { 'animate-spin': isLoading },
          ]"
        />
      </h2>
      <div class="space-y-4">
        <!-- 순위 항목 반복 -->
        <div
          v-for="user in formattedRankingData"
          :key="user.userId + '-' + Math.random()"
          class="flex items-center justify-between bg-gray-700 rounded-lg p-3 shadow-md"
        >
          <!-- 등수 -->
          <div class="text-xl font-extrabold text-yellow-400">
            {{ user.ranking }}등
          </div>
          <!-- 프로필 정보 -->
          <div class="flex items-center space-x-3">
            <img
              :src="user.image"
              alt="image"
              class="w-10 h-10 rounded-full border-2 border-gray-500"
            />
            <div>
              <p class="font-bold text-sm">{{ user.nickname }}</p>
            </div>
          </div>
          <!-- 시간 정보 -->
          <div class="text-sm font-semibold text-gray-200">
            {{ user.totalTime }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, toRefs, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import MyTimer from "../components/timer/MyTimer.vue";
import GroupMemberTimer from "../components/timer/GroupMemberTimer.vue";
import Stomp from "webstomp-client";
import axiosInstance from "../api/axiosInstance";

const rankData = ref([
  {
    id: 1,
    rank: 1,
    name: "정주영",
    time: "12:08:10",
    image: "https://picsum.photos/50",
  },
  {
    id: 2,
    rank: 2,
    name: "김철수",
    time: "09:15:43",
    image: "https://picsum.photos/51",
  },
  {
    id: 3,
    rank: 3,
    name: "이영희",
    time: "10:05:12",
    image: "https://picsum.photos/52",
  },
  {
    id: 4,
    rank: 4,
    name: "박준형",
    time: "08:22:34",
    image: "https://picsum.photos/53",
  },
  {
    id: 5,
    rank: 5,
    name: "최수연",
    time: "11:45:19",
    image: "https://picsum.photos/54",
  },
  {
    id: 6,
    rank: 6,
    name: "최수연",
    time: "11:45:19",
    image: "https://picsum.photos/54",
  },
  {
    id: 7,
    rank: 7,
    name: "최수연",
    time: "11:45:19",
    image: "https://picsum.photos/54",
  },
  {
    id: 8,
    rank: 8,
    name: "최수연",
    time: "11:45:19",
    image: "https://picsum.photos/54",
  },
  {
    id: 9,
    rank: 9,
    name: "최수연",
    time: "11:45:19",
    image: "https://picsum.photos/54",
  },
]);
//  ==== 상태값 시작 ====

const userId = ref(localStorage.getItem("userId"));
const isLoading = ref(false);
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

  const baseUrl = import.meta.env.VITE_SERVER_HOST_BASE.replace(/^https?:\/\//, "");
  const protocol = import.meta.env.VITE_SERVER_HOST_BASE.startsWith("https") ? "wss" : "ws";
  const socket = new WebSocket(`${protocol}://${baseUrl}/timer`);
  stompClient.value = Stomp.over(socket);
  stompClient.value.heartbeat.outgoing = 25000;
  stompClient.value.heartbeat.incoming = 0;

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
    const memberTimer = memberTimers.find((timer) => timer.userId == userId);
    
    if (memberTimer) {
      memberTimer.ranking = eventData.ranking;
      memberTimer.timeSoFar = eventData.timeSoFar;
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
    const memberTimer = memberTimers.find((timer) => timer.userId == userId);
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
    const memberTimer = memberTimers.find((timer) => timer.userId == userId);
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
    if (userId == myTimerData.userId) {
      return;
    }
    memberTimers.unshift({
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
    const index = memberTimers.findIndex((timer) => timer.userId == userId);
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
    alert("로그인이 필요합니다.");
    const router = useRouter();
    router.push("/login");
  } else {
    try {
      groupMembersTimerDataInit();
      await enterAndGetMyTimerData();
      connect();
      getRankData();
    } catch (error) {
      console.error("API 호출 중 오류 발생:", error);
    }
  }
};
// 내 타이머 데이터 받아오기
const enterAndGetMyTimerData = async () => {
  try {
    const response = await axiosInstance.get(
      `/timers/groups/${groupId.value}/entry`
    );
    const timerData = response.data;
    Object.assign(myTimerData, timerData);
  } catch (error) {
    console.error("API 호출 중 오류 발생:", error);
    myTimerData.nickname = "서버 접속 실패";
    throw error;
  }
};
// 그룹원 타이머 데이터 받아오기
const groupMembersTimerDataInit = async () => {
  try {
    const response = await axiosInstance.get(`/timers/groups/${groupId.value}`);
    const timerDatas = response.data;
    console.log("그룹 타이머 데이터 받아오기", timerDatas);

    timerDatas.forEach((timer) => {
      if (timer.userId == userId.value) {
        Object.assign(myTimerData, timer);
      } else {
        memberTimers.unshift(timer);
      }
    });
  } catch (error) {
    console.error("API 호출 중 오류 발생:groupMembersTimerDataInit", error);
  }
};
// 랭킹 데이터 패치
const getRankData = async () => {
  try {
    isLoading.value = true;
    const response = await axiosInstance.get(
      `/timers/ranking/groups/${groupId.value}`,
      {
        params: {
          period: "DAILY",
        },
      }
    );
    console.log("랭킹 데이터 받아오기", response);

    rankData.value = response.data.data;
    console.log("랭킹 데이터 받아오기", rankData.value);
    isLoading.value = false;
    // 랭킹 myTimer에 반영
    setRankingToMyTimer();
  } catch (error) {
    console.error("API 호출 중 오류 발생:", error);
  }
};

// 랭킹 데이터를 내 타이머에 반영
const setRankingToMyTimer = () => {
  
  const myRanking = rankData.value.find((data) => {
    if(data.userId == userId.value) {
      return data;
    }
  });
  if (myRanking) {
    myTimerData.ranking = myRanking.ranking;
  }
};

onMounted(() => {
  // getMyTimerData();
  checkLoginAndConnect();
});

onUnmounted(() => {
  if (stompClient.value) {
    disconnectFromServer();
  }
});
const formattedRankingData = computed(() => {
  return rankData.value.map((item, index) => {
    // 0~2번 인덱스면 totalTime 변환 적용
    if (item.totalTime != null) {
      return {
        ...item,
        totalTime: secondToTime(item.totalTime),
      };
    }
    return item;
  });
});
function secondToTime(second) {
  const hour = String(Math.floor(second / 3600)).padStart(2, "0");
  const min = String(Math.floor((second % 3600) / 60)).padStart(2, "0");
  const sec = String(second % 60).padStart(2, "0");
  return `${hour}:${min}:${sec}`;
}
</script>

<style scoped>
.gradient-background {
  background: linear-gradient(45deg, #f4ffde, #ffffff);
  background-size: 200% 200%;
  animation: gradientAnimation 15s ease infinite;
}

@keyframes gradientAnimation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
