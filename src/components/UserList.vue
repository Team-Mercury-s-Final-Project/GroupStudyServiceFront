<template>
    <aside class="user-list">
      <h3>접속중인 유저</h3>
      <ul>
        <li v-for="(user, index) in onlineUsers" :key="index">
          <span class="user-icon">P</span> {{ user.name }}
          <span class="status" :class="user.status"></span>
        </li>
      </ul>
    </aside>
  </template>
  
  <script>
  export default {
    name: "UserList",
    data() {
      return {
        onlineUsers: [
          { name: "김진우", status: "online" },
          { name: "박지은", status: "away" },
          { name: "최현우", status: "busy" },
        ],
      };
    },
  };
  </script>
  
  <style scoped>
  .user-list ul {
    list-style: none;
    padding: 0;
  }
  
  .user-list li {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .user-icon {
    width: 24px;
    height: 24px;
    background-color: #ccc;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: 1rem;
  }
  
  .status {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-left: auto;
  }
  
  .status.online {
    background-color: green;
  }
  
  .status.away {
    background-color: yellow;
  }
  
  .status.busy {
    background-color: red;
  }
  </style>