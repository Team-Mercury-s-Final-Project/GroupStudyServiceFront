<template>
  <div class="user-list">
    <h3>접속중인 유저</h3>
    <ul>
      <li v-for="user in users" :key="user.id" :class="user.status">
        <span class="user-icon">P</span>
        <span class="user-name">{{ user.name }}</span>
        <span class="user-status" :class="statusClass(user.status)"></span>
      </li>
    </ul>
    <h3>부재중 유저</h3>
    <ul>
      <li v-for="user in awayUsers" :key="user.id">
        <span class="user-icon">P</span>
        <span class="user-name">{{ user.name }}</span>
        <span class="user-status status-away"></span>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "UserList",
  data() {
    return {
      users: [
        { id: 1, name: "김진우", status: "online" },
        { id: 2, name: "박지은", status: "online" },
        { id: 3, name: "최현우", status: "busy" },
      ],
      awayUsers: [
        { id: 4, name: "이영희", status: "away" },
        { id: 5, name: "정철수", status: "away" },
      ],
    };
  },
  methods: {
    statusClass(status) {
      return `status-${status}`;
    },
  },
};
</script>

<style scoped>
.user-list h3 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.user-list ul {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
}

.user-list li {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.user-icon {
  width: 32px;
  height: 32px;
  background-color: #ccc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
}

.user-name {
  flex: 1;
}

.user-status {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-online {
  background-color: green;
}

.status-busy {
  background-color: red;
}

.status-away {
  background-color: yellow;
}
@media (max-width: 768px) {
  .user-list {
    display: none;
  }
}
</style>
