<template>
    <div>
      <h1>API Test</h1>
      <button @click="fetchData">Fetch Data</button>
      <button @click="sendData">Send Data</button>
      <p v-if="responseData">Response: {{ responseData }}</p>
      <p v-if="sendResponseData">Send Response: {{ sendResponseData }}</p>
    </div>
  </template>
  
  <script>
  import api from '../api.js'; // api.js 파일을 import
  
  export default {
    data() {
      return {
        responseData: null,
        sendResponseData: null,
      };
    },
    methods: {
      async fetchData() {
        try {
          const response = await api.get('/test/toFront');
          this.responseData = response.data;
        } catch (error) {
          console.error('API 호출 중 오류 발생:', error);
        }
      },
      async sendData() {
        try {
          const dataToSend = {
            // 전송할 데이터 예시
            name: 'John Doe',
            age: 30,
          };
          const response = await api.post('/test/toBack', dataToSend);
          this.sendResponseData = response.data;
        } catch (error) {
          console.error('데이터 전송 중 오류 발생:', error);
        }
      },
    },
  };
  </script>
  
  <style scoped>
  /* 스타일을 원하시면 여기에 작성하세요 */
  </style>
  