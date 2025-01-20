<template>
  <fwb-navbar solid class="bg-gray-400">
    <template #logo>
      <router-link to="/" class="logo">
        <fwb-navbar-logo
          alt="S.T.A.R logo"
          image-url="https://blog.kakaocdn.net/dn/b3blpi/btrR8iJj38E/VRPwpmSXMGeBEC16SS34x1/img.png"
        >
          S.T.A.R
        </fwb-navbar-logo>
      </router-link>
    </template>
    <template #default="{ isShowMenu }">
      <fwb-navbar-collapse :is-show-menu="isShowMenu">
        <router-link to="/">Home </router-link>
        <router-link to="#">내 정보 </router-link>
        <router-link to="#">로그아웃 </router-link>
        <!-- <fwb-navbar-link link="#"> Services </fwb-navbar-link>
        <fwb-navbar-link link="#"> Pricing </fwb-navbar-link>
        <fwb-navbar-link link="#"> Contact </fwb-navbar-link> -->
      </fwb-navbar-collapse>
    </template>
  </fwb-navbar>
</template>

<script setup>
import {
  FwbNavbar,
  FwbNavbarCollapse,
  FwbNavbarLink,
  FwbNavbarLogo,
} from "flowbite-vue";
</script>
