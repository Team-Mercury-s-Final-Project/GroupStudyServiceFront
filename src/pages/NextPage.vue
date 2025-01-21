<template>
  <div>
    <h1>Next Page</h1>
    <button @click="$router.push('/')">Go Back to Home</button>
    <br />

    <fwb-button
      gradient="purple-pink"
      @click="$router.push('/groups/{groupId}')"
      >groupDetailPage</fwb-button
    >
  </div>
</template>
<script setup>
import { FwbButton } from "flowbite-vue";
</script>
