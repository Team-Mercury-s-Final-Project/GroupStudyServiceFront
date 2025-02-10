import axiosInstance from "./axiosInstance";

export async function getMyPageInfo() {
  try {
    const response = await axiosInstance.get("/api/user/my-page");
    return response.data.data;
  } catch (error) {
    console.error("마이페이지 정보 조회 실패:", error);
    throw error;
  }
}
