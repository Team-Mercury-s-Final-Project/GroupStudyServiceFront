<template>
  <div class="user-list">
    <h3 class="section-title">🔥 나</h3>
    <ul>
      <li class="user-item" ref="meRef" @click="openModal(me)">
        <fwb-avatar
          :img="me.image"
          rounded status-position="top-right" status="online"
        />
        <span class="user-name">{{ me.nickname }}</span>
        <fwb-badge v-if="me.isHost" size="xs" type="yellow">👑</fwb-badge>
        <fwb-badge size="xs" :type="me.status === 'ONLINE' ? 'green' : 'red'">
          {{ me.status === "ONLINE" ? "접속중" : "부재중" }}
        </fwb-badge>
      </li>
    </ul>

    <h3 class="section-title">⚡ 온라인 ({{ onlineUsers.length }})</h3>
    <ul>
      <li v-for="user in onlineUsers" :key="user.id" class="user-item" :ref="(el) => setUserRef(user.id, el)" @click="openModal(user)">
        <fwb-avatar
          :img="user.image"
          rounded status-position="top-right"
          status="online"
        />
        <span class="user-name">{{ user.nickname }}</span>
        <fwb-badge v-if="user.isHost" size="xs" type="yellow">👑</fwb-badge>
        <fwb-badge size="xs" type="green">접속중</fwb-badge>
      </li>
    </ul>

    <h3 class="section-title">🌙 오프라인 ({{ offlineUsers.length }})</h3>
    <ul>
      <li v-for="user in offlineUsers" :key="user.id" class="user-item" :ref="(el) => setUserRef(user.id, el)" @click="openModal(user)">
        <fwb-avatar
          :img="user.image"
          rounded status-position="top-right"
          status="offline"
        />
        <span class="user-name away">{{ user.nickname }}</span>
        <fwb-badge v-if="user.isHost" size="xs" type="yellow">👑</fwb-badge>
        <fwb-badge size="xs" type="red">부재중</fwb-badge>
      </li>
    </ul>

    <UserModal 
      v-if="selectedUser" 
      :user="selectedUser" 
      :userId="userId"
      :x="modalX"
      :y="modalY"
      :closeModal="closeModal"
    />
  </div>
</template>

<script setup>
import { computed, ref, nextTick } from "vue";
import { FwbBadge, FwbAvatar } from 'flowbite-vue';
import UserModal from "./UserModal.vue";
import store from "../store/store";

const userId = localStorage.getItem("userId"); // 현재 로그인한 사용자 ID
const selectedUser = ref(null);
const modalX = ref(0);
const modalY = ref(0);
const userRefs = ref({});
const meRef = ref(null);

// 현재 로그인한 유저
const me = computed(() => store.state.users.list.find(user => user.id == userId) || {});

// 온라인 유저 리스트 (현재 유저 제외)
const onlineUsers = computed(() => 
  store.state.users.list.filter(user => user.status === "ONLINE" && user.id != userId)
);

// 오프라인 유저 리스트
const offlineUsers = computed(() => 
  store.state.users.list.filter(user => user.status === "OFFLINE" && user.id != userId)
);

const setUserRef = (id, el) => {
  if (el) userRefs.value[id] = el;
};

const openModal = async (user) => {
  selectedUser.value = user;  
  await nextTick();
  
  let userElement = user.id === me.value.id ? meRef.value : userRefs.value[user.id];
  if (userElement) {
    const userRect = userElement.getBoundingClientRect();
    modalX.value = userRect.left - 260; // 유저 왼쪽에 모달 배치
    modalY.value = userRect.top;
  }
};

const closeModal = () => {
  selectedUser.value = null;
};
</script>

<style scoped>
.user-list {
  padding-top: 1rem;
}

.section-title {
  margin-bottom: 0.5rem;
  margin-left: 0.5rem;
  font-size: 1rem;
  font-weight: bold;
  color: #000000;
  position: relative;
}

.user-list ul {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  transition: background 0.2s ease, transform 0.2s ease;
}

.user-item:hover {
  background: #dadada;
  transform: translateY(-2px);
}

.user-name {
  margin-left: 0.5rem;
  flex: 1;
  font-weight: 600;
  color: #333;
}

.user-name.away {
  color: #888;
}
</style>
