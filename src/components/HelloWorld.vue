<script setup>
import { ref } from "vue";

const price = ref(200);
const products = ref(["역삼 원룸", "천호 원룸", "마포 원룸"]);
const applyDiscount = () => {
  price.value = price.value / 2; // 가격을 절반으로 줄임
};
</script>

<template>
  <div>
    <h4>{{ products[0] }}</h4>
    <p>{{ price  }} 만원</p>
  </div>
  <div>
    <h4>{{ products[1] }}</h4>
    <p>{{ price + 60 }} 만원</p>
  </div>
  <div>
    <h4>{{ products[2] }}</h4>
    <p>{{ price + 50 }} 만원</p>
  </div>
  <button @click="applyDiscount">반값할인</button>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      price: 200,
      products: ["역삼 원룸", "천호 원룸", "마포원룸"],
    };
  },
  components: {},
};
</script>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
