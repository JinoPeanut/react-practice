import { createContext, useContext, useState } from "react";

// 1️⃣ Context 통 만들기
const AttendanceContext = createContext(null);

// 2️⃣ Provider 만들기
export function AttendanceProvider({ children }) {
    const [students, setStudents] = useState([
        { id: 1, name: "철수", isPresent: false },
        { id: 2, name: "영희", isPresent: true },
    ]);

    const toggleStudent = (id) => {
        setStudents((prev) =>
            prev.map((student) =>
                student.id === id
                    ? { ...student, isPresent: !student.isPresent }
                    : student
            )
        );
    };

    return (
        <AttendanceContext.Provider value={{ students, toggleStudent }}>
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
