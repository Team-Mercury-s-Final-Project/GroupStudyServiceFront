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
      <div id="userInfoAnduserblockList-container">
        <div
          id="userInfo-container"
          class="max-w-3xl w-full h-[420px] bg-white shadow-lg rounded-lg p-6"
        >
          <div class="flex">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">내 정보</h2>

            <!-- button Section -->

            <button
              @click="handleUserEditClick"
              class="h-[30px] flex items-center justify-center bg-gray-300 text-white hover:bg-blue-600 rounded-full p-2 shadow-md transition duration-200 ease-in-out transform hover:scale-105 relative left-3"
            >
              <i
                v-if="!isEditing"
                class="fas fa-pencil-alt"
                style="font-size: 1rem; transition: all 0.3s ease-in-out"
              ></i>
              <i
                v-else
                class="fas fa-check"
                style="font-size: 1rem; transition: all 0.3s ease-in-out"
              ></i>
            </button>

            <button
              v-if="!isEditing"
              @click="openModal('회원탈퇴')"
              class="h-[30px] flex items-center justify-center bg-red-400 text-white hover:bg-red-600 rounded-full p-2 shadow-md transition duration-200 ease-in-out transform hover:scale-105 relative left-7"
            >
              <i
                class="fas fa-user-times"
                style="font-size: 1rem; transition: all 0.3s ease-in-out"
              ></i>
            </button>

            <button
              v-else
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
            </div>
          </div>
        </div>
        <!-- 차단 유저 정보 섹션 -->
        <div
          class="max-w-3xl w-full bg-white shadow-lg rounded-lg p-6 relative top-0 left-0 min-h-[415px]"
          id="userblockList-container"
        >
          <div class="flex">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">
              차단 유저 목록
            </h2>

            <button
              v-if="blockList && blockList.length > 0"
              class="custom-button relative left-3 -top-[10px]"
              @click="openModal('전체차단해제')"
            >
              전체 차단 해제
            </button>
          </div>

          <hr class="border-t-2 border-gray-300 mb-4" />
          <div
            v-if="blockList && blockList.length > 0"
            class="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-4 mt-4 overflow-y-auto max-h-[320px]"
          >
            <div
              v-for="blockUser in blockList"
              :key="blockUser.id"
              class="bg-white border border-gray-200 rounded-lg shadow-lg p-4"
            >
              <div class="flex gap-2 relative top-5">
                <fwb-avatar :img="blockUser.image" rounded />
                <h3 class="text-sm font-bold text-gray-800 relative top-3">
                  {{ blockUser.nickname }}
                </h3>
              </div>
              <button
                class="custom-button relative left-[400px] -top-[20px]"
                @click="UnblockUser(blockUser.id)"
              >
                차단 해제
              </button>

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
            @click="openModal('전체그룹탈퇴')"
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
                @click="handleGroupEditClick(group)"
                class="relative left-[200px] h-[30px] bg-gray-300 text-white flex items-center justify-center hover:bg-blue-500 rounded-full p-2 shadow-md transition duration-200 ease-in-out transform hover:scale-105 translate-x-[-50%] translate-y-[-50%]"
              >
                <i
                  v-if="!group.isEditing"
                  class="fas fa-pencil-alt w-[12px]"
                  style="font-size: 1rem; transition: all 0.3s ease-in-out"
                ></i>
                <i
                  v-else
                  class="fas fa-check"
                  style="font-size: 1rem; transition: all 0.3s ease-in-out"
                ></i>
              </button>

              <button
                v-if="!group.isEditing"
                @click="ExitGroup(group.groupId)"
                class="relative left-[205px] h-[30px] bg-gray-300 text-white flex items-center justify-center hover:bg-red-500 rounded-full p-2 shadow-md transition duration-200 ease-in-out transform hover:scale-105 translate-x-[-50%] translate-y-[-50%]"
              >
                <i
                  class="fas fa-user-times w-[15px]"
                  style="font-size: 1rem; transition: all 0.3s ease-in-out"
                ></i>
              </button>

              <button
                v-else-if="group.isEditing"
                @click="toggleEditCancelGroup(group.groupId)"
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
                class="block relative -left-[40px] w-[100px]"
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

      <!-- 모달 컴포넌트 연결 -->
      <UserCheckExitGroupAll
        v-if="isModalVisible"
        :visible="isModalVisible"
        :modalData="modalData"
        :groupList="orignalGroupList"
        @closeModal="closeModal"
        @updateUserJoinedGroupList="updateUserJoinedGroupList"
      />

      <UserCheckUnblockAll
        v-if="isModalVisible2"
        :visible="isModalVisible2"
        :modalData="modalData2"
        :blockList="blockList"
        @closeModal="closeModal2"
        @updateBlockList="updateBlockList"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject, computed } from "vue";
import { useToast } from "vue-toastification";
import { FwbSpinner, FwbAvatar } from "flowbite-vue";
import axiosInstance from "../api/axiosInstance";
import UserCheckExitGroupAll from "../components/modal/UserCheckExitGroupAll.vue";
import UserCheckUnblockAll from "../components/modal/UserCheckUnblockAll.vue";

// -----------------------------------------------------------------
// 변수 초기화
const toast = useToast();
const userInfo = ref({
  nickname: "",
  email: "",
  created_at: "",
  profileImgUrl: "",
});
const originalUserInfo = ref(null);
const originalUserJoinedGroupInfo = ref(null);
const orignalGroupList = ref([]); // (회원탈퇴 & 전체 그룹 탈퇴) 모달 시 보여주기 위한 데이터
const isEditing = ref(false);
const isLoading = ref(true);
const selectedFile = ref(null);
const editField = ref("");
const FileValidError = ref(false);
const groupList = ref([]);
const blockList = ref([]);
const globalState = inject("globalState");
// -----------------------------------------------------------------
// 함수
// 초기화 시
onMounted(async () => {
  try {
    const response = await fetchUserInfo(); // 요청 순서 제어 -> 리프레쉬 토큰 만료시간이 끝난 경우를 위해
    if (response.status != 200) {
      return;
    }
    await fetchUserInfoJoinedGroup();
    await fetchUserblockListGroup();
  } catch (error) {
    console.error("Data fetch error:", error);
  }
});

const handleUserEditClick = () => {
  if (isEditing.value) {
    // 편집 상태이면 저장 동작 실행
    saveChanges();
  } else {
    // 편집 상태가 아니면 편집 모드로 전환
    toggleEditing("nickname");
  }
};

const toggleEditing = (field) => {
  console.log("toggle clicked");
  if (isEditing.value) {
    userInfo.value = { ...originalUserInfo.value };
  } else {
    editField.value = field;
  }
  isEditing.value = !isEditing.value;
};

const handleGroupEditClick = (group) => {
  if (group.isEditing) {
    // 편집 중이면 업데이트 함수를 호출합니다.
    update(group.groupId, group.nickname, group.currentHost.memberId);
  } else {
    // 편집 모드가 아니면 편집 모드로 전환합니다.
    toggleEditGroup(group.groupId);
  }
};

/**  toggleEditGroup 와 toggleEditCancelGroup 따로 분리시킨 이유: 편집버튼 클릭 시
        toggleEditGroup 함수에 의해 해당 그룹을 편집 중으로 바꿔주기 위헤
        toggleEditCancelGroup 함수는 편집 도중 취소를 위해
*/
const toggleEditGroup = (groupId) => {
  // 1. groupList에서 해당 groupId에 대해 isEditing을 토글
  const groupToEdit = groupList.value.find(
    (group) => group.groupId === groupId
  );
  if (groupToEdit) {
    groupToEdit.isEditing = !groupToEdit.isEditing;
  }
};

const toggleEditCancelGroup = (groupId) => {
  toggleEditGroup(groupId);

  // 2. originalUserJoinedGroupInfo에서 해당 groupId에 대한 정보를 업데이트
  const originalGroup = originalUserJoinedGroupInfo.value.find(
    (group) => group.groupId === groupId
  );
  if (originalGroup) {
    const groupToUpdate = groupList.value.find(
      (group) => group.groupId === groupId
    );
    if (groupToUpdate) {
      Object.assign(groupToUpdate, originalGroup); // groupToUpdate를 originalGroup으로 덮어씀
    }
  }
};

// 모달 visibility 상태
const isModalVisible = ref(false);
const isModalVisible2 = ref(false);

// 모달에 전달할 데이터
const modalData = ref({
  title: "회원 탈퇴",
  message:
    "※ 현재 가입된 모든 그룹에서 탈퇴 처리되며, 그룹의 위임장인 경우 다른 유저애게 권한이 위임됩니다.",
  type: "탈퇴",
});

const modalData2 = ref({
  title: "전체 차단 해제",
  message: "※ 현재 차단한 모든 유저가 차단 해제 되며 대화가 다시 가능합니다.",
  type: "전체 차단 해제",
});

// 모달 닫기
const closeModal = () => {
  isModalVisible.value = false;
};

const closeModal2 = () => {
  isModalVisible2.value = false;
};

// 모달 열기
const openModal = async (status) => {
  try {
    if (status === "회원탈퇴" || status === "전체그룹탈퇴") {
      const response = await axiosInstance.get("/user/joinGroup-info");
      if (response.status === 200) {
        orignalGroupList.value = response.data.data;
        isModalVisible.value = true;
      }

      if (status === "전체그룹탈퇴") modalData.value.title = "전체 그룹 탈퇴";
      else if (status === "회원탈퇴") modalData.value.title = "회원 탈퇴";
    } else if (status === "전체차단해제") {
      isModalVisible2.value = true;
    }
  } catch (error) {
    console.error(error);
  }
};

const updateBlockList = () => {
  blockList.value = [];
};

const updateUserJoinedGroupList = () => {
  groupList.value = [];
  originalUserJoinedGroupInfo.value = { ...groupList.value };
};

// 조회(Read) ---------------------------------------------------------------------------
// 유저 정보 조회
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
    console.log(userInfo.value);
    isLoading.value = false;
  }
};

// 유저 그룹 조회
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

// 차단 유저 조회
const fetchUserblockListGroup = async () => {
  try {
    const response = await axiosInstance.get("/users/blocks");
    if (response.status === 200) {
      blockList.value = response.data.data;
    }
  } catch (error) {
    console.error(error);
  }
};
// -------------------------------------------------------------------------------

// 변경(Update) ---------------------------------------------------------------------------
// 유저 파일 유효성 검사
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
// 유저 닉네임 유효성 검사
const nicknameError = computed(() => {
  const nickname = userInfo.value.nickname;
  return !nickname || !/^[a-zA-Z가-힣\d]{3,}$/.test(nickname);
});

// 유저 정보 수정
const saveChanges = async () => {
  if (!nicknameError.value && !FileValidError.value) {
    try {
      const formData = new FormData();
      if (editField.value === "nickname")
        formData.append("nickname", userInfo.value.nickname);

      if (selectedFile.value) formData.append("profileImg", selectedFile.value);
      // 닉네임, 이미지 변경이 된 경우만 API 요청
      if (formData.has("nickname") || formData.has("profileImg")) {
        const response = await axiosInstance.post("/user-info", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.status === 200) {
          if (
            selectedFile.value !== null ||
            originalUserInfo.value.nickname !== userInfo.value.nickname
          ) {
            toast.success("회원 정보 수정이 완료되었습니다.");
          }
          selectedFile.value = null;
        } else {
          toast.error("회원 정보 수정이 실패하였습니다.");
        }
      }
    } catch (error) {
      toast.error("회원 정보 수정이 실패하였습니다.");
    } finally {
      isEditing.value = false;
      editField.value = "";
      fetchUserInfo();
    }
  }
};

/** 함수 호출
 *  - 그룹 닉네임 변경
 *  - 그룹 호스트 변경
 */
const update = async (groupId, newNickname, newHostId) => {
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

// 그룹 닉네임 변경
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

// 그룹 호스트 변경
const updateGroupHost = async (groupId, newHostId) => {
  try {
    const originalGroup = originalUserJoinedGroupInfo.value.find(
      (group) => group.groupId === groupId
    );

    if (originalGroup && originalGroup.currentHost.memberId !== newHostId) {
      const response = await axiosInstance.put(
        `/groups/${groupId}/change-admin/${newHostId}`
      );
      if (response.status === 200) {
        originalGroup.currentHost.memberId == newHostId;
        toast.success("호스트를 변경하였습니다.");
      }
    }
  } catch (error) {
    console.log(error);
    toast.error("호스트 변경을 실패하였습니다.");
  }
};

// ---------------------------------------------------------------------------------------

// 탈퇴(Delete) ---------------------------------------------------------------------------
// 그룹 탈퇴
const ExitGroup = async (groupId) => {
  try {
    const response = await axiosInstance.delete(`/groups/${groupId}/exit`);
    const exitGroupName = groupList.value.find(
      (group) => group.groupId == groupId
    )?.name;

    if (response.status === 200) {
      groupList.value = groupList.value.filter(
        (group) => group.groupId !== groupId
      );

      const response = await axiosInstance.get("/groups/myGroups");
      if (response.status == 200) {
        globalState.myGroups = response.data.data;
      }
      toast.success(`'${exitGroupName}' 그룹을 탈퇴하였습니다.`);
    }
  } catch (error) {
    toast.error(`'${exitGroupName}' 그룹 탈퇴에 실패하였습니다.`);
  }
};

// 차단 유저 1명 해제
const UnblockUser = async (targetUserId) => {
  try {
    const response = await axiosInstance.delete(
      `/users/blocks/${targetUserId}`
    );

    if (response.status === 200) {
      const blockuserNickname = blockList.value.find(
        (user) => user.id == targetUserId
      )?.nickname;

      blockList.value = blockList.value.filter(
        (user) => user.id !== targetUserId
      );

      toast.success(`'${blockuserNickname}' 님을 차단 해제하였습니다.`);
    }
  } catch (error) {
    toast.error(`'${blockuserNickname}' 님 차단 해제를 실패하였습니다.`);
  }
};
// ---------------------------------------------------------------------------------------
</script>

<style>
/* Google Fonts 글로벌 적용 */
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap");
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css");

button:hover {
  background-color: #2563eb; /* 호버 시 배경색 */
}
body {
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
#userInfoAnduserblockList-container {
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

#userblockList-container {
  position: relative;
  top: 5vh;
}

.custom-button {
  @apply bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg shadow-md 
         hover:bg-red-500 hover:shadow-lg
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
</style>
