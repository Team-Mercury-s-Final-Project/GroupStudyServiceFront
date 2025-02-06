import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";

const store = createStore({
  state: {
    isLoggedIn: false,
    users: [],
  },
  mutations: {
    login(state) {
      state.isLoggedIn = true;
    },
    logout(state) {
      state.isLoggedIn = false;
    },
    setUsers(state, users) {
      state.users = users;
    },
    updateStatus(state, { userId, status }) {
      const updatedUsers = state.users.list.map(user =>
        user.id == userId ? { ...user, status } : user
      );
      state.users.list = updatedUsers;
    },
    clearUsers(state) {
      state.users.list = [];
    }
  },
  actions: {
    login({ commit }) {
      commit("login");
    },
    logout({ commit }) {
      commit("logout");
    },
    fetchUsers({ commit }) {
      commit('setUsers', data);
    },
  },
  plugins: [
    createPersistedState({
      storage: window.localStorage, // 상태를 로컬 스토리지에 저장
    }),
  ],
});

export default store;
