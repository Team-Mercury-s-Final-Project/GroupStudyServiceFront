<template>
  <div>
    <h1>Home Page</h1>
    <input v-model="message" placeholder="Enter message" />
    <button @click="sendMessage">Send</button>
    <p>Response: {{ response }}</p>
    <button @click="$router.push('/next')">Go to Next Page</button>
  </div>
</template>

<script>
import api from '../api';

export default {
  data() {
    return {
      message: '',
      response: ''
    };
  },
  methods: {
    async sendMessage() {
      try {
        const res = await api.post('/echo', this.message);
        this.response = res.data;
      } catch (error) {
        console.error("There was an error:", error);
      }
    }
  }
};
</script>