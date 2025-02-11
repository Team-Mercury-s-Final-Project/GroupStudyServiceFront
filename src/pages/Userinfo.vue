<template>
  <div class="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
    <!-- 로딩 상태 화면 -->
    <div
      v-if="isLoading"
      class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-50"
    >
      <fwb-spinner size="12" />
      <div class="text-xl text-gray-800">내 정보 로딩 중...</div>
    </div>

    <div id="container">
      <!-- 메인 화면 -->
      <div id="userInfoAnduserBlackList-container">
        <div
          id="userInfo-container"
          class="max-w-3xl w-full h-[420px] bg-white shadow-lg rounded-lg p-6"
        >
          <div class="flex">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">내 정보</h2>

            <!-- button Section -->

            <button
              @click="toggleEditing('nickname')"
              class="h-[30px] flex items-center justify-center bg-gray-300 text-white hover:bg-blue-600 rounded-full p-2 shadow-md transition duration-200 ease-in-out transform hover:scale-105 relative left-3"
            >
              <!-- isEditing이 true일 경우 완료 아이콘, 아니면 연필 아이콘 -->
              <i
                v-if="!isEditing"
                class="fas fa-pencil-alt"
                style="font-size: 1rem; transition: all 0.3s ease-in-out"
              ></i>
              <i
                v-else="isEditing"
                class="fas fa-check"
                style="font-size: 1rem; transition: all 0.3s ease-in-out"
                @click="saveChanges()"
              ></i>
            </button>

            <button
              v-if="!isEditing"
              @click="openModal"
              class="h-[30px] flex items-center justify-center bg-red-400 text-white hover:bg-red-600 rounded-full p-2 shadow-md transition duration-200 ease-in-out transform hover:scale-105 relative left-7"
            >
              <i
                class="fas fa-user-times"
                style="font-size: 1rem; transition: all 0.3s ease-in-out"
              ></i>
            </button>

            <button
              v-else="isEditing"
              @click="toggleEditing('deactivate')"
              class="h-[30px] flex items-center justify-center bg-gray-300 text-white hover:bg-blue-500 rounded-full p-2 shadow-md transition duration-200 ease-in-out transform hover:scale-105 relative left-7"
            >
              <i
                class="fas fa-times"
                style="font-size: 1rem; transition: all 0.3s ease-in-out"
              ></i>
            </button>
          </div>
          <hr class="border-t-2 border-gray-300 mb-4" />

          <div class="userinfo">
            <!-- Profile Section -->
            <div class="flex items-center space-x-6 mb-6">
              <img
                :src="userInfo.profileImgUrl"
                alt="User Profile Picture"
                class="w-24 h-24 rounded-full object-cover"
              />
              <div class="flex flex-col relative">
                <div class="text-xl font-semibold text-gray-800">
                  {{ userInfo.nickname }}
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <!-- 오류 메시지 출력 -->
              <p
                v-if="nicknameError"
                class="text-red-500 text-sm mt-1"
                style="position: relative; left: 8vw"
              >
                닉네임은 특수문자 제외 3자 이상 설정해주세요.
              </p>

              <!-- 닉네임 수정 -->
              <div class="flex items-center space-x-4">
                <label for="nickname" class="text-gray-700 font-medium w-32"
                  >닉네임</label
                >
                <input
                  id="nickname"
                  v-model="userInfo.nickname"
                  :disabled="!isEditing || editField !== 'nickname'"
                  type="text"
                  :class="{
                    'w-full p-2 border border-gray-200 rounded-md cursor-not-allowed':
                      !isEditing,
                    'w-full p-2 border border-gray-400 rounded-md': isEditing,
                  }"
                  placeholder="닉네임을 입력하세요"
                />
              </div>

              <!-- 이메일 수정 불가 
              <div class="flex items-center space-x-4">
                <label for="email" class="text-gray-700 font-medium w-32"
                  >이메일</label
                >
                <input
                  id="email"
                  v-model="userInfo.email"
                  disabled
                  type="text"
                  class="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              -->

              <!-- 가입일 수정 불가 -->
              <div class="flex items-center space-x-4">
                <label for="created_at" class="text-gray-700 font-medium w-32"
                  >가입날짜</label
                >

                <input
                  id="created_at"
                  v-model="userInfo.created_at"
                  disabled
                  type="text"
                  class="w-full p-2 border border-gray-200 rounded-md cursor-not-allowed"
                />
              </div>
              <!-- 파일 업로드 -->
              <div class="flex items-center space-x-4">
                <label for="profileImg" class="text-gray-700 font-medium w-32"
                  >프로필 사진</label
                >

                <!-- 파일 선택 버튼 디자인 -->
                <input
                  id="profileImg"
                  type="file"
                  @change="handleFileUpload"
                  :disabled="!isEditing"
                  :class="{
                    'w-full p-2 border border-gray-200 rounded-md cursor-not-allowed':
                      !isEditing,
                    'w-full p-2 border border-gray-400 rounded-md': isEditing,
                  }"
                />
              </div>

              <!-- 수정/저장 버튼 
            <div v-if="isEditing" class="flex justify-end space-x-4">
              <button
                @click="saveChanges"
                :disabled="!isEditing"
                class="w-1/3 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-200"
              >
                저장
              </button>
            </div>
            --></div>
          </div>
        </div>
        <!-- 차단 유저 정보 섹션 -->
        <div
          class="max-w-3xl w-full bg-white shadow-lg rounded-lg p-6 relative top-0 left-0 min-h-[415px]"
          id="userBlackList-container"
        >
          <div class="flex">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">
              차단 유저 목록
            </h2>

            <button
              v-if="blackList && blackList.length > 0"
              class="custom-button relative left-3 -top-[10px]"
              @click="deleteAllBlackUser()"
            >
              전체 차단 해제
            </button>
          </div>

          <hr class="border-t-2 border-gray-300 mb-4" />
          <div
            v-if="blackList && blackList.length > 0"
            class="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-4 mt-4 overflow-y-auto max-h-[320px]"
          >
            <div
              v-for="blockUser in blackList"
              :key="blockUser.id"
              class="bg-white border border-gray-200 rounded-lg shadow-lg p-4"
            >
              <fwb-avatar :img="blockUser.image" rounded />
              <button
                class="custom-button relative left-[400px] -top-[20px]"
                @click="deleteBlackUser(blockUser.id)"
              >
                차단 해제
              </button>
              <h3 class="text-sm font-bold text-gray-800">
                {{ blockUser.nickname }}
              </h3>
              <br />
              <!-- 그룹장이면 선택할 수 있는 멤버 목록 -->
            </div>
          </div>

          <div v-else class="text-gray-600 mt-4">차단한 유저가 없습니다.</div>
        </div>
      </div>

      <!-- 탈퇴 그룹 정보 섹션 -->
      <div
        class="max-w-3xl w-full bg-white shadow-lg rounded-lg p-6 min-h-[850px]"
        id="userJoinedGrup-container"
      >
        <div class="flex">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">
            가입된 그룹 목록
          </h2>

          <button
            v-if="groupList && groupList.length > 0"
            class="custom-button relative left-3 -top-[10px]"
            @click="ExitAllGroup()"
          >
            전체 그룹 탈퇴
          </button>
        </div>
        <hr class="border-t-2 border-gray-300 mb-4" />

        <div
          v-if="groupList && groupList.length > 0"
          class="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 mt-4 overflow-y-auto max-h-[700px]"
        >
          <div
            v-for="group in groupList"
            :key="group.groupId"
            class="bg-white border border-gray-200 rounded-lg shadow-lg p-4 h-50"
          >
            <div class="flex">
              <button
                @click="toggleEditingGroup(group.groupId)"
                class="relative left-[200px] h-[30px] bg-gray-300 text-white flex items-center justify-center hover:bg-blue-500 rounded-full p-2 shadow-md transition duration-200 ease-in-out transform hover:scale-105 translate-x-[-50%] translate-y-[-50%]"
              >
                <!-- isEditing이 true일 경우 완료 아이콘, 아니면 연필 아이콘 -->
                <i
                  v-if="!group.isEditing"
                  class="fas fa-pencil-alt w-[12px]"
                  style="font-size: 1rem; transition: all 0.3s ease-in-out"
                ></i>
                <i
                  v-else="group.isEditing"
                  class="fas fa-check"
                  style="font-size: 1rem; transition: all 0.3s ease-in-out"
                  @click="
                    update(
                      group.groupId,
                      group.nickname,
                      group.currentHost.memberId
                    )
                  "
                ></i>
              </button>

              <button
                @click="ExitGroup(group.groupId)"
                class="relative left-[205px] h-[30px] bg-gray-300 text-white flex items-center justify-center hover:bg-blue-500 rounded-full p-2 shadow-md transition duration-200 ease-in-out transform hover:scale-105 translate-x-[-50%] translate-y-[-50%]"
              >
                <i
                  class="fas fa-times"
                  style="font-size: 1rem; transition: all 0.3s ease-in-out"
                ></i>
              </button>

              <fwb-avatar
                :img="group.imageUrl"
                rounded
                class="relative -left-[55px] -top-[10px]"
              />

              <a
                :href="`groups/${group.groupId}`"
                class="block relative -left-[40px] -top-[px]"
              >
                <h3 class="text-sm font-bold text-gray-800">
                  {{ group.name }}
                </h3>
              </a>
            </div>
            <div>
              <h3>닉네임:&nbsp;</h3>
              <input
                id="nickname"
                v-model="group.nickname"
                :disabled="!group.isEditing"
                type="text"
                class="h-[30px] w-[150px] p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div class="relative top-[5px]">
              <h3 class="inline">호스트:&nbsp;</h3>
              <!-- 그룹장이면 선택할 수 있는 멤버 목록 -->

              <input
                v-if="group.isHost === '1' && group.members === undefined"
                id="nickname"
                v-model="group.nickname"
                :disabled="!group.isEditing"
                type="text"
                class="h-[30px] w-[150px] p-2 border border-gray-300 rounded-md"
              />

              <input
                v-else-if="group.isHost === '0' && group.members !== undefined"
                id="nickname"
                v-model="group.currentHost.nickname"
                :disabled="true"
                type="text"
                class="h-[30px] w-[150px] p-2 border border-gray-300 rounded-md"
              />

              <select
                v-else-if="group.isHost === '1' && group.members !== undefined"
                :disabled="!group.isEditing"
                v-model="group.currentHost.memberId"
                class="h-[40px] w-[150px] p-2 border border-gray-300 rounded-md"
              >
                <option
                  v-for="member in group.members"
                  :key="member.memberId"
                  :value="member.memberId"
                >
                  {{ member.nickname }}
                </option>
              </select>

              <!-- 그룹장이 아니면 멤버 닉네임 표시 -->
            </div>
          </div>
        </div>
        <div v-else class="text-gray-600 mt-4">가입된 그룹이 없습니다.</div>
      </div>

      <!-- 탈퇴 버튼 -->
      <!-- 
            <div class="flex justify-end space-x-4 mt-6">
        <button
          @click="deleteAccount"
          class="w-1/3 bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition duration-200"
        >
          탈퇴
        </button>
      </div>
    

          <-- 모달 컴포넌트 연결 -->
      <UserJoinedGroupModal
        v-if="isModalVisible"
        :visible="isModalVisible"
        :modalData="modalData"
        :groupList="orignalGroupList"
        @closeModal="closeModal"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, inject } from "vue";
import axiosInstance from "../api/axiosInstance";
import { computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { FwbSpinner, FwbAvatar } from "flowbite-vue";
import UserJoinedGroupModal from "../components/modal/UserJoinedGroupModal.vue";
import { jsx } from "vue/jsx-runtime";
const store = useStore();
const router = useRouter();
const isLoggedIn = computed(() => store.state.isLoggedIn);
const toast = useToast();
const userInfo = ref({
  nickname: "",
  email: "",
  created_at: "",
  profileImgUrl: "",
});
const originalUserInfo = ref({ ...userInfo.value });
const originalUserJoinedGroupInfo = ref(null);
const isEditing = ref(false);

const isLoading = ref(true);
const selectedFile = ref(null);
const confirmationInput = ref("");
const editField = ref("");
const FileValidError = ref(false);

const orignalGroupList = ref([]); // 모달에 전송할 그룹 데이터터
const groupList = ref([]);
const blackList = ref([]);
const nickname = ref("");
const globalState = inject("globalState");
const groupListEditing = ref([]);
const currentHost = ref({});

const toggleEditing = (field) => {
  if (isEditing.value) {
    userInfo.value = { ...originalUserInfo.value };
  } else {
    editField.value = field;
  }
  isEditing.value = !isEditing.value;
};

const toggleEditingGroup = (groupId) => {
  groupList.value.forEach((group) => {
    if (group.groupId === groupId) {
      group.isEditing = !group.isEditing;
    }
  });
};

// 모달 visibility 상태
const isModalVisible = ref(false);

// 모달에 전달할 데이터
const modalData = ref({
  title: "회원 탈퇴",
  message:
    "※ 현재 가입된 모든 그룹에서 탈퇴 처리되며, 그룹의 위임장인 경우 다른 유저애게 권한이 위임됩니다.",
  type: "탈퇴",
});

// 모달 닫기
const closeModal = () => {
  isModalVisible.value = false;
};

// 모달 열기
const openModal = async () => {
  try {
    const response = await axiosInstance.get("/user/joinGroup-info");
    if (response.status === 200) {
      orignalGroupList.value = response.data.data;
      // console.log("groupList.value: " + JSON.stringify(groupList.value));
      isModalVisible.value = true;
    }
  } catch (error) {
    console.error(error);
  }
};

const toggleCanclegroupList = () => {
  groupList.value = [...originalUserJoinedGroupInfo.value];
  isEditingGroup.value = !isEditingGroup.value;
};

const fetchUserInfo = async () => {
  try {
    const response = await axiosInstance.get("/user-info");
    if (response.status === 200) {
      userInfo.value = response.data;
      userInfo.value.created_at = userInfo.value.created_at
        .replace("T", " ")
        .substring(0, 19);
      originalUserInfo.value = { ...userInfo.value };
      return { status: 200 };
    }
  } catch (error) {
    console.error(error);
    return { status: 401 };
  } finally {
    isLoading.value = false;
  }
};

const fetchUserInfoJoinedGroup = async () => {
  try {
    const response = await axiosInstance.get("/user/joinGroup-info");
    if (response.status === 200) {
      // groupList에 데이터 매핑
      groupList.value = response.data.data.map((group) => {
        // 호스트 정보 추출
        const hostMember =
          group.members?.find((member) => member.host === true) || {};

        return {
          ...group,
          isEditing: false, // 그룹 수정 여부 기본 설정
          currentHost: {
            memberId: hostMember.memberId || null,
            nickname: hostMember.nickname || null,
          },
        };
      });
      // 깊은 복사로 원본 데이터를 복사합니다.
      originalUserJoinedGroupInfo.value = JSON.parse(
        JSON.stringify(groupList.value)
      );

      console.log("groupList.value: ", JSON.stringify(groupList.value));
    }
  } catch (error) {
    console.error("Error fetching user info:", error);
  }
};

const fetchUserBlackListGroup = async () => {
  try {
    const response = await axiosInstance.get("/users/blocks");
    if (response.status === 200) {
      blackList.value = response.data.data;
    }
  } catch (error) {
    console.error(error);
  }
};

const deleteBlackUser = async (targetUserId) => {
  try {
    // const formData = new FormData();
    // formData.append("targetUserId", targetUserId);
    // const response = await axiosInstance.delete("/users/blocks", formData, {
    //   headers: { "Content-Type": "multipart/form-data" },
    // });
    const response = await axiosInstance.delete(
      `/users/blocks/${targetUserId}`
    );

    if (response.status === 200) {
      blackList.value = blackList.value.filter(
        (user) => user.id !== targetUserId
      );
      console.log(JSON.stringify(blackList.value));
      toast.success("차단 해제를 완료하였습니다.");
    }
  } catch (error) {
    toast.error("차단 해제를 실패하였습니다.");
  }
};

const update = async (groupId, newNickname, newHostId) => {
  // alert(
  //   "groupId: " +
  //     groupId +
  //     "newNickname: " +
  //     newNickname +
  //     "newHostId: " +
  //     newHostId
  // );
  //alert("newHostId: " + newHostId);
  try {
    if (newNickname) {
      await updateGroupNickname(groupId, newNickname);
    }

    if (newHostId) {
      await updateGroupHost(groupId, newHostId);
    }

    // 비동기 데이터 최신화 호출
    await fetchUserInfoJoinedGroup();
    console.log("User group info successfully updated.");
  } catch (error) {
    console.error("Error updating group info:", error);
  }
};

const updateGroupNickname = async (groupId, newNickname) => {
  try {
    // groupList에서 groupId에 해당하는 그룹 찾기
    const originalGroup = originalUserJoinedGroupInfo.value.find(
      (group) => group.groupId === groupId
    );
    // 해당 그룹이 존재하고, 닉네임이 변경되었을 때만 업데이트
    if (originalGroup && originalGroup.nickname !== newNickname) {
      const data = {
        nickname: newNickname,
      };

      // API 호출
      const response = await axiosInstance.patch(
        `/users/groups/${groupId}/change-nickname`,
        data
      );

      if (response.status === 200) {
        // 닉네임 변경 성공 시 해당 그룹의 닉네임 업데이트
        originalGroup.nickname = newNickname;
        toast.success("닉네임을 변경하였습니다.");
      }
    }
  } catch (error) {
    toast.error("닉네임 변경을 실패하였습니다.");
  }
};

const updateGroupHost = async (groupId, newHostId) => {
  try {
    const originalGroup = originalUserJoinedGroupInfo.value.find(
      (group) => group.groupId === groupId
    );

    // console.log("newHostId: " + newHostId);
    if (originalGroup && originalGroup.currentHost.memberId !== newHostId) {
      const response = await axiosInstance.put(
        `/groups/${groupId}/change-admin/${newHostId}`
      );
      if (response.status === 200) {
        originalGroup.currentHost.memberId == newHostId;
        // originalGroup.members[0].memberId = newHostId;
        toast.success("호스트를 변경하였습니다.");
      }
    }
  } catch (error) {
    console.log(error);
    toast.error("호스트 변경을 실패하였습니다.");
  }
};

const ExitGroup = async (groupId) => {
  try {
    const response = await axiosInstance.delete(`/groups/${groupId}/exit`);

    if (response.status === 200) {
      groupList.value = groupList.value.filter(
        (group) => group.groupId !== groupId
      );

      const response = await axiosInstance.get("/groups/myGroups");
      if (response.status == 200) {
        globalState.myGroups = response.data.data;
      }
      toast.success("그룹을 탈퇴하였습니다.");
    }
  } catch (error) {
    toast.error("그룹 탈퇴에 실패하였습니다.");
  }
};

const deleteAllBlackUser = async () => {
  try {
    const response = await axiosInstance.delete(`/users/blocks/`);

    if (response.status === 200) {
      blackList.value = [];
      toast.success("전체 차단 해제를 완료하였습니다.");
    }
  } catch (error) {
    toast.error("전체 차단 해제를 실패하였습니다.");
  }
};

const handleFileUpload = async (e) => {
  const file = e.target.files[0];

  if (file) {
    const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/jpg"];
    const maxSize = 10 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      toast.error("허용되지 않는 이미지 형식입니다. (PNG, JPEG, WEBP만 가능)");
      FileValidError.value = true;
      return;
    }

    if (file.size > maxSize) {
      toast.error("이미지 크기는 10MB 이하로 업로드 해주세요.");
      FileValidError.value = true;
      return;
    }

    selectedFile.value = file;
    FileValidError.value = false;
    toast.success("이미지가 선택되었습니다.");
  }
};

const nicknameError = computed(() => {
  const nickname = userInfo.value.nickname;
  return !nickname || !/^[a-zA-Z가-힣\d]{3,}$/.test(nickname);
});

const saveChanges = async () => {
  if (!nicknameError.value && !FileValidError.value) {
    try {
      const formData = new FormData();
      if (editField.value === "nickname")
        formData.append("nickname", userInfo.value.nickname);

      if (selectedFile.value) formData.append("profileImg", selectedFile.value);
      const response = await axiosInstance.post("/user-info", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 200) {
        toast.success("회원 정보 수정이 완료되었습니다.");
        fetchUserInfo();
        originalUserInfo.value = { ...userInfo.value };
        isEditing.value = false;
        editField.value = "";
      } else {
        console.log("response: " + response);
      }
    } catch (error) {
      toast.error("회원 정보 수정이 실패하였습니다.");
      userInfo.value = { ...originalUserInfo.value };
    }
  }
};

const deleteAccount = async () => {
  try {
    const requestData = prepareLeaveData();
    const response = await axiosInstance.delete("/user-info", {
      data: requestData,
    });
    if (response.status === 200) {
      toast.success("회원 탈퇴가 완료되었습니다.");
      localStorage.removeItem("access");
      localStorage.removeItem("redirectUrl");
      localStorage.removeItem("userId");
      store.dispatch("logout");
      setTimeout(() => {
        router.push("/oauth2Login");
      }, 3000);
    }
  } catch (error) {
    console.error(error);
  }
};

// 탈퇴 처리 함수
async function ExitAllGroup() {
  const requestData = prepareLeaveData();
  try {
    const response = await axiosInstance.delete("/userJoinGroup", {
      data: requestData,
    });
    if (response.status === 200) {
      groupList.value = [];
      toast.success("그룹 탈퇴가 완료되었습니다.", { timeout: 2000 });

      const response = await axiosInstance.get("/groups/myGroups");
      if (response.status == 200) {
        globalState.myGroups = response.data.data;
      }
    }
  } catch (e) {
    toast.error(
      "탈퇴가 실패하였습니다: " + (e.response?.data?.message || e.message),
      { timeout: 2000 }
    );
  }
}

function prepareLeaveData() {
  if (groupList.value.length >= 1) {
    const requestPrepareData = {
      groupMemberInfos: groupList.value
        .filter(
          (group) => group.isHost === "1" && group.selectedMembers != undefined
        ) // 그룹장이 아닌 데이터는 제외
        .map((group) => ({
          groupId: group.groupId,
          memberId: group.selectedMembers.memberId,
        })),
    };
    console.log("전송 데이터:", JSON.stringify(requestPrepareData));
    return requestPrepareData;
  } else {
    return null;
  }
}

const showModal = (type) => {
  modalData.value = {
    visible: true,
    title: type === "탈퇴" ? "회원 탈퇴" : "알림",
    message:
      type === "탈퇴" ? '탈퇴하려면 "탈퇴하겠습니다"를 입력해주세요.' : "",
    type,
  };
};

// onMounted(() => {
//   fetchUserInfo();
//   fetchUserInfoJoinedGroup();
//   fetchUserBlackListGroup();
// });

onMounted(async () => {
  try {
    const response = await fetchUserInfo(); // 요청 순서 제어
    if (response.status != 200) {
      return;
    }
    await fetchUserInfoJoinedGroup();
    await fetchUserBlackListGroup();
  } catch (error) {
    console.error("Data fetch error:", error);
  }
});
</script>

<style>
/* Google Fonts 글로벌 적용 */
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap");
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css");

button:hover {
  background-color: #2563eb; /* 호버 시 배경색 */
}
body {
  /* font-family: "Spoqa Han Sans Neo", sans-serif; */
  /* font-family: "Pretendard", sans-serif; */
  font-family: "Pretendard", sans-serif;
  margin: 0;
  padding: 0;
  background-color: white;
}
#container {
  width: 80vw;
  position: relative;
  left: -3vw;
  top: -3vh;
  display: grid;
  grid-template-columns: 50% 50%;
  grid-template-rows: 50% 50%;
  gap: 2vw;
}
#userInfoAnduserBlackList-container {
  display: flex;
  flex-direction: column;
}
#userInfo-container {
  font-size: 1vw;
}

.button-container {
  position: relative;
  left: 80px;
  top: -40px;
  display: flex;
  gap: 1vw;
}
.userinfo {
  position: relative;
}

h2,
h3 {
  display: inline;
}

#userBlackList-container {
  position: relative;
  top: 5vh;
}

.custom-button {
  @apply bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg shadow-md 
         hover:bg-blue-500 hover:shadow-lg
         transition duration-300 ease-in-out transform hover:scale-105;
}

.animate-pulse {
  animation: pulse 1s ease-out infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* 커스텀 스크롤바 디자인 
#userBlackList-container ::-webkit-scrollbar {
  width: 8px;
}

#userBlackList-container ::-webkit-scrollbar-thumb {
  background-color: d3d3d3;
  border-radius: 4px;
}

#userBlackList-container ::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 4px;
}
  */
</style>
