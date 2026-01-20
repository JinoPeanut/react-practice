import StudentItem from "./StudentItem";
import { useState } from "react";
import { useMemo } from "react";

function StudentList({ students, setStudents }) {

    const [filter, setFilter] = useState("All");

    const sortStudent = [...students].sort((a, b) => {
        return a.checked - b.checked;
    })

    const stats = useMemo(() => {
        const total = students.length;
        const completed = students.filter(s => s.checked).length;
        const unCompleted = students.filter(s => !s.checked).length;
        const percent = (total === 0) ? 0 : Math.floor((completed / total) * 100);

        return {
            total,
            completed,
            unCompleted,
            percent,
        }
    }, [students])

    const filterStudent = sortStudent.filter(s => {
        if (filter === "All") return true;
        if (filter === "Done") return s.checked;
        if (filter === "Todo") return !s.checked;
    });

    const resetChecked = () => {
        setStudents(students.map(prev => ({
            ...prev,
            checked: false,
        })))
    }

    return (
        <div>
            <div>
                <button onClick={() => setFilter("All")}>[전체]</button>
                <button onClick={() => setFilter("Done")}>[출석]</button>
                <button onClick={() => setFilter("Todo")}>[미출석]</button>
            </div>
            <ul>
                {filterStudent.map(student =>
                    <StudentItem
                        key={student.id}
                        student={student}
                        setStudents={setStudents}
                    />
                )}
            </ul>

            <div>
                <button onClick={resetChecked}>[전체 출석 초기화]</button>
            </div>

            <p>전체인원: {stats.total}명</p>
            <p>출석완료: {stats.completed}명</p>
            <p>미출석: {stats.unCompleted}명</p>
            <p>출석률: {stats.percent}%</p>
        </div>
    )
}

export default StudentList