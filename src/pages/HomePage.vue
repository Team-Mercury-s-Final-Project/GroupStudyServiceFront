<template>
  <div>
    <h1>Home Page</h1>
    <fwb-button gradient="purple-pink" @click="$router.push('/next')"
      >nextPage</fwb-button
    >
  </div>
  
</template>
<script setup>
import { FwbButton } from "flowbite-vue";
</script>