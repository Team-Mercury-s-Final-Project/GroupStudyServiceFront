import { createApp } from "vue";
import App from "./App.vue";
import router from "./router"; // 라우터 임포트
// add this
import "./index.css";
import "../node_modules/flowbite-vue/dist/index.css";
const app = createApp(App);
app.use(router); // Vue Router 사용 설정
app.mount("#app");
