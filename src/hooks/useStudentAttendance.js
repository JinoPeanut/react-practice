import { studentAPI } from "../api/studentAPI";
import { API_ERROR } from "../constants/apiError";

export function useStudentAttendance() {
    const handleApiError = (error) => {
        switch (error?.type) {
            case API_ERROR.NETWORK:
                return "네트워크 오류가 발생했습니다";
            case API_ERROR.TIMEOUT:
                return "시간 초과";
            default:
                return "출석 실패";
        }
    }

    return {
        ...studentAPI,
        handleApiError,
    }
}