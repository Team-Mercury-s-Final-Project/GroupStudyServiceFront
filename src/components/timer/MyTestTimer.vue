<template>
  <div id="webcrumbs">
    <div class="w-[250px] md:w-[600px] bg-gradient-to-br from-red-100 to-yellow-100 rounded-lg shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
      <div class="flex flex-col items-center space-y-4">
        <div class="text-4xl font-bold tracking-wider bg-white/80 backdrop-blur-sm w-full py-6 rounded-lg shadow-inner text-center transition-all duration-300 hover:bg-white/90 text-red-600">
          <div>{{ formattedTime }}</div>
        </div>
        <div class="w-full bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-inner">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-semibold text-red-700">오늘 공부 시간:</span>
            <span class="text-lg font-bold text-red-600">02:45:30</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm font-semibold text-red-700">당신의 Ranking:</span>
            <div class="flex items-center space-x-2">
              <span class="material-symbols-outlined text-yellow-500">trophy</span>
              <span class="text-lg font-bold text-red-600">#3</span>
            </div>
          </div>
        </div>
        <div class="flex space-x-3 w-full">
          <button class="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-lg transform hover:scale-105 transition-all duration-300 active:scale-95 shadow-md font-semibold">
            Start
          </button>
            <button class="flex-1 bg-gradient-to-r from-yellow-300 to-yellow-400 hover:from-yellow-400 hover:to-yellow-500 text-white py-3 rounded-lg transform hover:scale-105 transition-all duration-300 active:scale-95 shadow-md font-semibold">
            Pause
            </button>
          <button class="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-lg transform hover:scale-105 transition-all duration-300 active:scale-95 shadow-md font-semibold">
            Reset
          </button>
        </div>
        </div>
      </div>
    </div>
</template>

<script setup>
import {  computed } from "vue";
import { ref, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
const route = useRoute();
const groupId = route.params.groupId;

const {
  userId,
  nickname,
  todayTotalTime,
  timeSoFar,
  stompClient,
  isConnect,
} = defineProps([
  "userId",
  "nickname",
  "todayTotalTime",
  "timeSoFar",
  "stompClient",
  "isConnect",
]);

const formattedTime = computed(() => {
  const hours = Math.floor(timeSoFar / 3600);
  const minutes = Math.floor((timeSoFar % 3600) / 60);
  const seconds = Math.floor((timeSoFar % 60) / 1);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
});
</script>

<style scoped>
@import url(https://fonts.googleapis.com/css2?family=Lato&display=swap);
@import url(https://fonts.googleapis.com/css2?family=Open+Sans&display=swap);
@import url(https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200);

#webcrumbs {
  font-family: Open Sans !important;
  font-size: 16px !important;
}

#webcrumbs .mb-2 {
  margin-bottom: 8px;
}

#webcrumbs .flex {
  display: flex;
}

#webcrumbs .w-\[300px\] {
  width: 300px;
}

#webcrumbs .w-full {
  width: 100%;
}

#webcrumbs .flex-1 {
  flex: 1 1 0%;
}

#webcrumbs .transform {
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

#webcrumbs .flex-col {
  flex-direction: column;
}

#webcrumbs .items-center {
  align-items: center;
}

#webcrumbs .justify-between {
  justify-content: space-between;
}

#webcrumbs .space-x-2 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-x-reverse: 0;
  margin-left: calc(8px * (1 - var(--tw-space-x-reverse)));
  margin-right: calc(8px * var(--tw-space-x-reverse));
}

#webcrumbs .space-x-3 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-x-reverse: 0;
  margin-left: calc(12px * (1 - var(--tw-space-x-reverse)));
  margin-right: calc(12px * var(--tw-space-x-reverse));
}

#webcrumbs .space-y-4 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-y-reverse: 0;
  margin-bottom: calc(16px * var(--tw-space-y-reverse));
  margin-top: calc(16px * (1 - var(--tw-space-y-reverse)));
}

#webcrumbs .rounded-lg {
  border-radius: 24px;
}

#webcrumbs .bg-white\/80 {
  background-color: hsla(0, 0%, 100%, 0.8);
}

#webcrumbs .bg-gradient-to-br {
  background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
}

#webcrumbs .bg-gradient-to-r {
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
}

#webcrumbs .from-red-100 {
  --tw-gradient-from: #fee2e2 var(--tw-gradient-from-position);
  --tw-gradient-to: hsla(0, 93%, 94%, 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

#webcrumbs .from-red-400 {
  --tw-gradient-from: #f87171 var(--tw-gradient-from-position);
  --tw-gradient-to: hsla(0, 91%, 71%, 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

#webcrumbs .from-red-500 {
  --tw-gradient-from: #ef4444 var(--tw-gradient-from-position);
  --tw-gradient-to: rgba(239, 68, 68, 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

#webcrumbs .from-yellow-500 {
  --tw-gradient-from: #eab308 var(--tw-gradient-from-position);
  --tw-gradient-to: rgba(234, 179, 8, 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

#webcrumbs .to-red-600 {
  --tw-gradient-to: #dc2626 var(--tw-gradient-to-position);
}

#webcrumbs .to-yellow-100 {
  --tw-gradient-to: #fef9c3 var(--tw-gradient-to-position);
}

#webcrumbs .to-yellow-400 {
  --tw-gradient-to: #facc15 var(--tw-gradient-to-position);
}

#webcrumbs .to-yellow-600 {
  --tw-gradient-to: #ca8a04 var(--tw-gradient-to-position);
}

#webcrumbs .p-4 {
  padding: 16px;
}

#webcrumbs .p-6 {
  padding: 24px;
}

#webcrumbs .py-3 {
  padding-bottom: 12px;
  padding-top: 12px;
}

#webcrumbs .py-6 {
  padding-bottom: 24px;
  padding-top: 24px;
}

#webcrumbs .text-center {
  text-align: center;
}

#webcrumbs .text-4xl {
  font-size: 36px;
  line-height: 41.4px;
}

#webcrumbs .text-lg {
  font-size: 18px;
  line-height: 27px;
}

#webcrumbs .text-sm {
  font-size: 14px;
  line-height: 21px;
}

#webcrumbs .font-bold {
  font-weight: 700;
}

#webcrumbs .font-semibold {
  font-weight: 600;
}

#webcrumbs .tracking-wider {
  letter-spacing: 0.05em;
}

#webcrumbs .text-red-600 {
  --tw-text-opacity: 1;
  color: rgb(220 38 38 / var(--tw-text-opacity));
}

#webcrumbs .text-red-700 {
  --tw-text-opacity: 1;
  color: rgb(185 28 28 / var(--tw-text-opacity));
}

#webcrumbs .text-white {
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity));
}

#webcrumbs .text-yellow-500 {
  --tw-text-opacity: 1;
  color: rgb(234 179 8 / var(--tw-text-opacity));
}

#webcrumbs .shadow-inner {
  --tw-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
  --tw-shadow-colored: inset 0 2px 4px 0 var(--tw-shadow-color);
}

#webcrumbs .shadow-inner,
#webcrumbs .shadow-lg {
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

#webcrumbs .shadow-lg {
  --tw-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);
}

#webcrumbs .shadow-md {
  --tw-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --tw-shadow-colored: 0 4px 6px -1px var(--tw-shadow-color), 0 2px 4px -2px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

#webcrumbs .backdrop-blur-sm {
  --tw-backdrop-blur: blur(4px);
  -webkit-backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
  backdrop-filter: var(--tw-backdrop-blur) var(--tw-backdrop-brightness) var(--tw-backdrop-contrast) var(--tw-backdrop-grayscale) var(--tw-backdrop-hue-rotate) var(--tw-backdrop-invert) var(--tw-backdrop-opacity) var(--tw-backdrop-saturate) var(--tw-backdrop-sepia);
}

#webcrumbs .transition-all {
  transition-duration: 0.15s;
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

#webcrumbs .transition-transform {
  transition-duration: 0.15s;
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

#webcrumbs .duration-300 {
  transition-duration: 0.3s;
}

#webcrumbs .hover\:scale-105:hover {
  --tw-scale-x: 1.05;
  --tw-scale-y: 1.05;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}

#webcrumbs .hover\:bg-white\/90:hover {
  background-color: hsla(0, 0%, 100%, 0.9);
}

#webcrumbs .hover\:from-red-500:hover {
  --tw-gradient-from: #ef4444 var(--tw-gradient-from-position);
  --tw-gradient-to: rgba(239, 68, 68, 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

#webcrumbs .hover\:from-red-600:hover {
  --tw-gradient-from: #dc2626 var(--tw-gradient-from-position);
  --tw-gradient-to: rgba(220, 38, 38, 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

#webcrumbs .hover\:from-yellow-600:hover {
  --tw-gradient-from: #ca8a04 var(--tw-gradient-from-position);
  --tw-gradient-to: rgba(202, 138, 4, 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
}

#webcrumbs .hover\:to-red-700:hover {
  --tw-gradient-to: #b91c1c var(--tw-gradient-to-position);
}

#webcrumbs .hover\:to-yellow-500:hover {
  --tw-gradient-to: #eab308 var(--tw-gradient-to-position);
}

#webcrumbs .hover\:to-yellow-700:hover {
  --tw-gradient-to: #a16207 var(--tw-gradient-to-position);
}

#webcrumbs .active\:scale-95:active {
  --tw-scale-x: 0.95;
  --tw-scale-y: 0.95;
  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));
}
</style>
