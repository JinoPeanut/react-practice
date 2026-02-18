import { createContext, useContext, useState, useEffect, useRef } from "react";
import { studentAPI } from "../api/studentAPI";

// 1️⃣ Context 통 만들기
const AttendanceContext = createContext(null);

// 2️⃣ Provider 만들기
export function AttendanceProvider({ children }) {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const requestIdRef = useRef(0);
    const abortRef = useRef({});

    const fetchStudents = async () => {
        const request = ++requestIdRef.current;
        try {
            setLoading(true);
            setError(null);

            const data = await studentAPI.getStudents();

            if (request !== requestIdRef.current) return;
            setStudents(data);

        } catch (err) {
            if (request !== requestIdRef.current) return;
            setError(err);

        } finally {
            if (request !== requestIdRef.current) return;
            setLoading(false);
        }
    }

    const toggleStudent = async (student) => {
        const prevStudent = [...students];


        setStudents(prev => prev.map(
            s => s.id === student.id
                ? { ...s, checked: !s.checked }
                : s
        ))

        if (abortRef.current[student.id]) {
            abortRef.current[student.id].abort();
        }

        const controller = new AbortController();
        abortRef.current[student.id] = controller;

        try {
            setError(null);

            const result = await studentAPI.toggleCheck(
                student.id,
                !student.checked,
                Date.now(),
                { signal: controller.signal },
            );

            if (!result.ok) {
                throw new Error("출석 토글 실패");
            }

            fetchStudents();

        } catch (err) {
            if (err.name === "AbortError") return;
            setError(err);
            setStudents(prevStudent);
        } finally {
            delete abortRef.current[student.id];
        }
    }

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
};

// 3️⃣ useContext를 감싼 커스텀 훅
export function useAttendance() {
    const context = useContext(AttendanceContext);

    if (!context) {
        throw new Error("AttendanceProvider 안에서 사용해야 합니다.");
    }

    return context;
}
