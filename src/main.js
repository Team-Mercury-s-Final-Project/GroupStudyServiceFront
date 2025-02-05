import { createApp } from "vue";
import App from "./App.vue";
import router from "./router"; // 라우터 임포트
import store from "./store/store";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

// add this
import "./index.css";
import "../node_modules/flowbite-vue/dist/index.css";
const app = createApp(App);
const toastOptions = {
  position: "top-right",
  timeout: 3000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
};

app.use(Toast, toastOptions);
app.use(router); // Vue Router 사용 설정
app.use(store); // Vue Router 사용 설정
app.mount("#app");
