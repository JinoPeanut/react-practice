import StudentItem from "./StudentItem";
import { useState } from "react";
import { useMemo } from "react";

function StudentList({ students, setStudents, filter, setFilter, name, setName }) {

    const sortStudent = [...students].sort((a, b) => {
        if (a.checked === b.checked) {
            return (a.checkedAt ?? 0) - (b.checkedAt ?? 0);
        }
        return b.checked - a.checked;
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

    const resetChecked = async () => {
        await Promise.all(
            students.map(student =>
                fetch(`http://localhost:3001/students/${student.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify({
                        checked: false,
                        checkedAt: null,
                    })
                })
            )
        );

        setStudents(prev => prev.map(
            s => ({
                ...s,
                checked: false,
                checkedAt: null,
            })
        ))
    }

    const handleBtn = (id) => {
        const target = students.find(s => s.id === id);
        if (!target) return;

        const nextChecked = !target.checked;
        const prevStudent = [...students];

        setStudents(prev => prev.map(
            student => student.id === id
                ? {
                    ...student,
                    checked: nextChecked,
                    checkedAt: nextChecked ? Date.now() : null,
                }
                : student
        ))

        fetch(`http://localhost:3001/students/${id}`, {
            method: "PATCH",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify({
                checked: nextChecked,
                checkedAt: nextChecked ? Date.now() : null,
            })
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error("출석체크 실패");
                }
            })
            .catch(() => {
                alert("출석체크 실패");
                setStudents(prevStudent);
            })
    }

    const addStudent = () => {
        if (!name.trim()) return;

        fetch("http://localhost:3001/students", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                name,
                checked: false,
                checkedAt: null,
            })
        })
            .then(() =>
                fetch("http://localhost:3001/students")
                    .then(res => res.json())
                    .then(data => {
                        setStudents(data);
                        setName("");
                    })
            )
    }

    const deleteStudent = (id) => {
        const prevStudent = [...students];

        setStudents(prev => prev.filter(
            s => s.id !== id
        ))

        fetch(`http://localhost:3001/students/${id}`, {
            method: "DELETE",
            headers: {
                "Content-type": "application/json"
            }
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error("삭제 실패");
                }
            })
            .catch(() => {
                alert("삭제 실패");
                setStudents(prevStudent);
            })
    }

    return (
        <div>
            <div>
                <button onClick={() => setFilter("All")}>[전체]</button>
                <button onClick={() => setFilter("Done")}>[출석]</button>
                <button onClick={() => setFilter("Todo")}>[미출석]</button>
            </div>
            <ul>
                {filterStudent.map(student => {
                    const time = student.checked && student.checkedAt
                        ? new Date(student.checkedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })
                        : null;

                    return (
                        <StudentItem
                            key={student.id}
                            student={student}
                            time={time}
                            onToggle={() => handleBtn(student.id)}
                            onDelete={() => deleteStudent(student.id)}
                        />
                    )
                })}
            </ul>

            <div>
                <button onClick={resetChecked}>[전체 출석 초기화]</button>
            </div>

            <p>전체인원: {stats.total}명</p>
            <p>출석완료: {stats.completed}명</p>
            <p>미출석: {stats.unCompleted}명</p>
            <p>출석률: {stats.percent}%</p>

            <div>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <button onClick={addStudent}>[추가]</button>
            </div>
        </div>
    )
}

export default StudentList