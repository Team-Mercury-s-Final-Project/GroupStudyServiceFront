<template>
  <div class="chat-message">
    <span>{{ message.senderId }}: </span>{{ message.messageContent }}
  </div>
</template>

<script>
export default {
  props: {
    message: Object,
  },
};
</script>

<style scoped>
.chat-message {
  margin: 5px 0;
}
</style>
