<!-- 그룹원의 타이머들 -->
<template>
    <div class="stopwatch">
    <span style="color: white;">
        <p>{{ timeData.nickname }}</p>
        <p>오늘의 총 공부시간: {{ timeData.todayTotalTime }}분</p>
        <p>순위: {{ timeData.ranking }}위</p>
    </span>
        <TimerDisplay :time="timeData.timeSoFar" />
    </div>
</template>

<script>
import TimerDisplay from './TimerDisplay.vue';

export default {
    components: {
        TimerDisplay,
    },
    props: {
        timeData: {
            type: Object,
            required: true,
        },
        
    },
};
</script>

<style scoped>
.stopwatch {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 10px;
    max-width: 400px;
    background-color: gray;
}
</style>
