<template>
  <div class="user-list">
    <h3 class="section-title">🔥 나</h3>
    <ul>
      <li class="user-item">
        <fwb-avatar
          img="https://storage.googleapis.com/mercury-star-bucket/f4bf8c32-8dbc-4951-b67a-b9472b61ea0a"
          rounded status-position="top-right" status="online"
        />
        <span class="user-name">신준섭</span>
        <fwb-badge size="xs" type="yellow">👑</fwb-badge>
        <!-- <fwb-badge v-if="user.isHost" size="xs" type="green">접속중</fwb-badge> -->
        <fwb-badge size="xs" type="green">접속중</fwb-badge>
      </li>
    </ul>

    <h3 class="section-title">⚡ 온라인</h3>
    <ul>
      <li v-for="user in users" :key="user.id" class="user-item">
        <fwb-avatar
          img="https://storage.googleapis.com/mercury-star-bucket/f4bf8c32-8dbc-4951-b67a-b9472b61ea0a"
          rounded status-position="top-right" status="online"
        />
        <span class="user-name">{{ user.name }}</span>
        <fwb-badge size="xs" type="green">접속중</fwb-badge>
      </li>
    </ul>

    <h3 class="section-title">🌙 오프라인</h3>
    <ul>
      <li v-for="user in awayUsers" :key="user.id" class="user-item">
        <fwb-avatar
          img="https://storage.googleapis.com/mercury-star-bucket/f4bf8c32-8dbc-4951-b67a-b9472b61ea0a"
          rounded status-position="top-right" status="offline"
        />
        <span class="user-name away">{{ user.name }}</span>
        <fwb-badge size="xs" type="red">부재중</fwb-badge>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { FwbBadge, FwbAvatar } from 'flowbite-vue';
</script>

<script>
export default {
  name: "UserList",
  data() {
    return {
      users: [
        { id: 1, name: "김진우", status: "online" },
        { id: 2, name: "박지은", status: "online" },
        { id: 3, name: "최현우", status: "online" },
      ],
      awayUsers: [
        { id: 4, name: "이영희", status: "offline" },
        { id: 5, name: "정철수", status: "offline" },
      ],
    };
  }
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
