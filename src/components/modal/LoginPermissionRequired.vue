<template>
  <div v-if="modal.isVisible" class="modal">
    <div class="modal-content animate-fadeIn">
      <span class="close" @click="closeModal">×</span>
      <h2>{{ modal.title }}</h2>
      <p>{{ modal.message }}</p>
      <button @click="closeModal">Close</button>
    </div>
  </div>
</template>

<script>
import { useStore } from "vuex";
import { computed, onMounted } from "vue";
export default {
  setup() {
    const store = useStore();
    const modal = computed(() => store.state.modal); // 반응형 연결

    const closeModal = () => {
      store.commit("closeModal");
    };

    onMounted(() => {
      if (modal.value.isVisible) {
        setTimeout(() => {
          closeModal();
          window.location.href = "/oauth2Login"; // 리다이렉트 경로 설정
        }, 3000); // 3초 후 리다이렉트
      }
    });

    return {
      modal,
      closeModal,
    };
  },
};
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  width: 400px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
  position: relative;
  animation: fadeIn 0.5s ease-in-out;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  cursor: pointer;
}

button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover {
  background: #0056b3;
}

/* Fade-in animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
