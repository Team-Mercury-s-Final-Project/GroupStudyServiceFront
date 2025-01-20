<template>
  <fwb-navbar solid class="bg-gray-400">
    <template #logo>
      <fwb-navbar-logo
        alt="S.T.A.R logo"
        image-url="https://blog.kakaocdn.net/dn/b3blpi/btrR8iJj38E/VRPwpmSXMGeBEC16SS34x1/img.png"
        link=""
      >
        S.T.A.R
      </fwb-navbar-logo>
    </template>
    <template #default="{ isShowMenu }">
      <fwb-navbar-collapse :is-show-menu="isShowMenu">
        <fwb-navbar-link is-active link="#"> Home </fwb-navbar-link>
        <fwb-navbar-link link="#"> Services </fwb-navbar-link>
        <fwb-navbar-link link="#"> Pricing </fwb-navbar-link>
        <fwb-navbar-link link="#"> Contact </fwb-navbar-link>
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
