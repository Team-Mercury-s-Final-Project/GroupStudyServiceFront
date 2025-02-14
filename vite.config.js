import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  define: {
    global: {},
  },
  server: {
    // 특정 도메인만 허용하려면 배열에 추가합니다.
    allowedHosts: ["mercurystudy.store"],
    // 모든 호스트를 허용하려면 아래와 같이 설정할 수 있습니다.
    // allowedHosts: 'all',
  },
});
