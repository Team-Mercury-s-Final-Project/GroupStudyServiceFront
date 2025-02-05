<!-- 집중방 -->
<template>
    <div class="timer-container">
        <div class="group-timer-container">
            <div v-for="timeData in memberTimers" :key="timeData.userId">
                <GroupMemberTimer :timeData="timeData" />
            </div>
        </div>
        <div class="my-timer-container" style="background-color: blue;">
            <UserTimer :todayTotalTime="'10'" :nickname="'김스타'" :stomp-clinet="this.stompClient" />
        </div>
        <div>
            <p>Connection Status: {{ isConnect }}</p>
            <button @click="connect">Connect</button>
            <button @click="sendMSG">메시지 테스트</button>
            <button @click="disconnectFromServer">Disconnect</button>
        </div>
        
    </div>
</template>

<script>
import UserTimer from './UserTimer.vue';
import GroupMemberTimer from './GroupMemberTimer.vue';
import Stomp from "webstomp-client";
import SockJS from 'sockjs-client';

export default {
    components: {
        UserTimer,
        GroupMemberTimer,
    },
    data() {
        return {
            memberTimers: [
                {userId:1, nickname: '익명1', timeSoFar: 3945,ranking: 2,todayTotalTime: 90,status: 'stop'},
                {userId:2, nickname: '익명2', timeSoFar: 5246,ranking: 1,todayTotalTime: 120,status: 'stop'},
            ],
            stompClient: null,
            groupId: '3',
            isConnect: false,
        };
    },
    methods: {
        sendMSG() {
            const msg = {message: "테스트입니다"};
            const jsonMsg = JSON.stringify(msg);
            console.log('Sending message:', jsonMsg);
            
            if (this.stompClient && this.stompClient.connected) {
                this.stompClient.send(
                // destination    
                `/pub/groups/${this.groupId}/timers`,
                // body
                jsonMsg, 
                // header
                {});            
            }
        },
    connect() {
        let socket = new WebSocket('ws://34.22.98.26:8080/timer');
        this.stompClient = Stomp.over(socket);

        this.stompClient.connect({}, () => {
            console.log('Connected to the server');
            
            this.isConnect = true;
            this.stompClient.subscribe(
                // destination 구독 경로
                `/sub/groups/${this.groupId}/timers`, 
                // 서버로 부터 온 메시지(payload) 수신 후 실행할 함수
                (payload) => {
                // const data = JSON.parse(payload.body);
                console.log('Received data:', payload.body);
            });
        });
        },
    // 집중방 나가기
    disconnectFromServer() {
        if (this.stompClient) {
            this.stompClient.disconnect();
            this.isConnect = false;
        }
    },
    },
    // 집중방에 들어올 때 실행되는 함수
    mounted() {
        this.connect();
    },
    // 컴포넌트가 제거되기 전에 실행되는 함수 - 집중방에서 나가면 실행
    beforeDestroy() {
        // 다른 페이지로 이동시 연결 끊기
        if (this.stompClient) {
            this.stompClient.disconnect();
        }
    },
    

};
</script>
<style scoped>
.timer-container{
    background-color: gold;
    height: 80%;
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;
    justify-content: space-between;
}
.group-timer-container {
    display: flex;
    gap: 10px;
    justify-content: space-evenly;
    background-color: aqua;
    width: 80%;
}
</style>
