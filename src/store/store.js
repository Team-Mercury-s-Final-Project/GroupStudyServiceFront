import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";

const store = createStore({
  state: {
    modal: {
      isVisible: false,
      title: "",
      message: "",
    },
    isLoggedIn: false,
  },
  mutations: {
    setModal(state, modalInfo) {
      state.modal = modalInfo;
    },
    closeModal(state) {
      state.modal.isVisible = false;
    },
    login(state) {
      state.isLoggedIn = true;
    },
    logout(state) {
      state.isLoggedIn = false;
    },
  },
  actions: {
    showModal({ commit }, modalInfo) {
      commit("setModal", modalInfo);
    },
    hideModal({ commit }) {
      commit("closeModal");
    },

    login({ commit }) {
      commit("login");
    },
    logout({ commit }) {
      commit("logout");
    },
  },
  plugins: [
    createPersistedState({
      storage: window.localStorage, // 상태를 로컬 스토리지에 저장
    }),
  ],
});

export default store;
