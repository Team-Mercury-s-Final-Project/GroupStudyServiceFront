<template>
    <div class="container mx-auto overflow-y-auto h-screen" @scroll="handleScroll">
        <div class="p-4">
          <div class="flex items-center bg-gray-200 p-3 rounded-md">
            <div class="flex flex-grow items-center space-x-4">
              <!-- 검색창 -->
              <input
                type="text"
                v-model="searchText"
                @keyup.enter="searchGroups"
                placeholder="검색창"
                class="p-2 w-1/3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              />

              <!-- 정렬 방식 선택 -->
              <div class="flex items-center space-x-2">
                <label for="sort" class="text-gray-700">정렬 방식</label>
                <select
                  id="sort"
                  v-model="sortOption"
                  @change="searchGroups"
                  class="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                >
                  <option value="createdAt_desc">최신순</option>
                  <option value="createdAt_asc">오래된순</option>
                  <option value="memberCount_asc">멤버 적은순</option>
                  <option value="memberCount_desc">멤버 많은순</option>
                  <option value="popular">인기순</option>
                </select>
              </div>
            </div>

            <!-- 그룹 생성 버튼 -->
            <button
              @click="openCreateGroupModal"
              class="ml-auto text-2xl bg-gray-300 px-3 py-1 rounded-md hover:bg-gray-400"
            >
              +
            </button>
          </div>

      
          <!-- 그룹 목록 -->
          <div class="grid grid-cols-3 gap-4 mt-4">
              <div
              v-for="group in studyGroups"
              :key="group.id"
              class="bg-gray-200 h-30 p-4 rounded-md flex transition-transform transform hover:scale-105 hover:bg-gray-300"
              >
                <div class="w-18 mr-3">
                  <fwb-avatar size="lg" :img="group.image" />
                </div>
                <div class="flex flex-col">
                    <span class="font-bold">{{ group.name }}</span>
                    <span class="text-sm text-gray-600">{{ group.description }}</span>
                    <span class="text-xs text-gray-500">개설일자: {{ group.createdAt }}</span>
                    <span class="text-xs text-gray-500">
                    현재인원: {{ group.memberCount }} / {{ group.maxCapacity }}
                    </span>
                    <span v-if="group.hasPassword" class="text-xs text-gray-500 flex items-center">
                      🔒 비밀번호 설정됨
                    </span>
                </div>
              </div>
          </div>
        </div>
    </div>
  </template>
  
  <script setup>
  import { FwbAvatar } from 'flowbite-vue'
  import { ref, onMounted } from "vue";
  import api from "../api";
  
  const page = ref(0);
  const isLoading = ref(false);
  const isLast = ref(false);
  const searchText = ref("");
  const sortOption = ref("createdAt_desc");
  const studyGroups = ref([]);
  
  // ✅ 그룹 목록 불러오기
  const fetchGroups = async () => {
    if (isLoading.value || isLast.value) return; // 요청 중일 때와 마지막 페이지일 때 추가 호출 방지
    isLoading.value = true;
    
    try {
      let sortParam = sortOption.value;
      let orderParam = null;

      if (sortOption.value === "createdAt_desc") {
        sortParam = "createdAt";
        orderParam = "desc";
      } else if (sortOption.value === "createdAt_asc") {
        sortParam = "createdAt";
        orderParam = "asc";
      } else if (sortOption.value === "memberCount_desc") {
        sortParam = "memberCount";
        orderParam = "desc";
      } else if (sortOption.value === "memberCount_asc") {
        sortParam = "memberCount";
        orderParam = "asc";
      }

      const response = await api.get("/groups", {
        params: {
          keyword: searchText.value,
          sort: sortParam,
          direction: orderParam,
          page: page.value
        },
      });
      studyGroups.value.push(...response.data.data.content);
      if (response.data.data.last === true) {
        isLast.value = true;
      }
    } catch (error) {
      console.error("스터디 그룹 목록을 불러오는 중 오류 발생:", error);
    } finally {
      isLoading.value = false;
    }
  };
  
  // ✅ 검색 API 호출 (Enter 입력 시)
  const searchGroups = () => {
    page.value = 0;  // 검색 시 첫 페이지로 초기화
    studyGroups.value = [];  // 기존 데이터 초기화
    isLast.value = false;
    fetchGroups();
  };

  // ✅ 스크롤 이벤트 핸들링
  const handleScroll = (event) => {
    const bottom =
      event.target.scrollHeight === event.target.scrollTop + event.target.clientHeight;
    
    // 스크롤 끝에 도달했을 때 페이지를 증가시키고 데이터를 추가로 요청
    if (bottom && !isLoading.value) {
      page.value++;  // 페이지 증가
      fetchGroups();
    }
  };
  
  // ✅ 모달 오픈 (추후 구현 예정)
  const openCreateGroupModal = () => {
    console.log("그룹 생성 모달 열기");
  };
  
  // ✅ 컴포넌트가 마운트될 때 초기 데이터 가져오기
  onMounted(() => {
    fetchGroups();
  });
  </script>
  
  <style scoped>
  /* 추가적인 스타일이 필요하면 여기에 작성 */
  </style>