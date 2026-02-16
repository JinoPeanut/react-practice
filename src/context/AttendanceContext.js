import { createContext, useContext, useState, useEffect } from "react";
import { studentAPI } from "../api/studentAPI";

// 1️⃣ Context 통 만들기
const AttendanceContext = createContext(null);

// 2️⃣ Provider 만들기
export function AttendanceProvider({ children }) {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await studentAPI.getStudents();
            setStudents(data);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }

    const toggleStudent = async (student) => {
        try {
            setError(null);

            const result = await studentAPI.toggleCheck(
                student.id,
                !student.checked,
                Date.now(),
            );

            if (!result.ok) {
                throw new Error("출석 토글 실패");
            }

            await fetchStudents();
        } catch (err) {
            setError(err);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [])

    return (
        <AttendanceContext.Provider value={{
            students,
            loading,
            error,
            fetchStudents,
            toggleStudent,
        }}>
            {children}
        </AttendanceContext.Provider>
    );
}

// 3️⃣ useContext를 감싼 커스텀 훅
export function useAttendance() {
    const context = useContext(AttendanceContext);

    if (!context) {
        throw new Error("AttendanceProvider 안에서 사용해야 합니다.");
    }

    return context;
}
