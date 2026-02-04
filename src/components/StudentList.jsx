import StudentItem from "./StudentItem";
import { useState } from "react";
import { useMemo } from "react";
import { studentAPI } from "../api/studentAPI";
import { API_ERROR } from "../constants/apiError";
import { toast } from "react-toastify";
import { RETRYABLE_ERROR_TYPE } from "../constants/retryPolicy";
import { createAttendanceSummary } from "../util/attendanceSummary"
import { isSuccess, isFailed, isRetryable } from "../util/attendanceStatus"


function StudentList({ students, setStudents, filter, setFilter, name, setName }) {

    const { checkMany, toggleCheck, resetCheck, handleApiError } = studentAPI();

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
        const result = await resetCheck(students);
        const hasFail = result.some(r => isFailed(r));

        if (hasFail) {
            alert("초기화 실패");
            return;
        }

        setStudents(prev => prev.map(
            s => ({
                ...s,
                checked: false,
                checkedAt: null,
            })
        ))
    }

    const handleBtn = async (id) => {
        const target = students.find(s => s.id === id);
        if (!target || target.isLoading) return;

        const nextChecked = !target.checked;
        const prevStudent = [...students];

        setStudents(prev => prev.map(
            student => student.id === id
                ? {
                    ...student,
                    checked: nextChecked,
                    checkedAt: nextChecked ? Date.now() : null,
                    isLoading: true,
                }
                : student
        ))

        const checkedAt = nextChecked ? Date.now() : null;
        const result = await toggleCheck(id, nextChecked, checkedAt);

        if (isSuccess(result)) {
            setStudents(prev => prev.map(
                s => s.id === id
                    ? { ...s, isLoading: false }
                    : s
            ))
        } else {
            alert(handleApiError(result.error));
            setStudents(prevStudent);
        }
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
        if (id === 1) {
            alert("1번은 삭제할 수 없습니다");
            return;
        }
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

    const allCheck = async () => {
        const targets = students.filter(s => !s.checked);

        if (targets.length === 0) return;

        const now = Date.now();

        setStudents(prev => prev.map(
            s => s.checked
                ? s
                : {
                    ...s,
                    isLoading: true,
                    error: null,
                }
        ))

        // useStudentAPI.js 호출
        const results = await checkMany(targets, now);

        // attendanceSummary.js 호출
        const summary = createAttendanceSummary(results);

        if (summary.failed === 0) {
            toast.success(`${summary.success} 명 출석 성공`);
        } else {
            toast.warning(`재시도: ${summary.failed}명 출석 실패`);
        }

        const resultMap = new Map(results.map(r => [r.id, r]));

        setStudents(prev => prev.map(
            s => {
                const r = resultMap.get(s.id);
                if (!r) return s;

                return {
                    ...s,
                    checked: isSuccess(r),
                    checkedAt: isSuccess(r) ? now : null,
                    isLoading: false,
                    status: r.status,
                    error: r.error ?? null,
                }
            }
        ))
    }

    const retryCheck = async () => {
        const targets = students.filter(s => isRetryable(s));

        if (targets.length === 0) return;

        const now = Date.now();

        setStudents(prev => prev.map(
            s => isRetryable(s)
                ? { ...s, isLoading: true, error: null }
                : s
        ));

        // useStudentAPI.js 호출
        const results = await checkMany(targets, now);

        // attendanceSummary.js 호출
        const summary = createAttendanceSummary(results);

        if (summary.failed === 0) {
            toast.success(`${summary.success}명 출석 성공`);
        } else {
            toast.warning(`${summary.failed}명 출석 실패`);
        }

        const resultMap = new Map(results.map(r => [r.id, r]));

        setStudents(prev => prev.map(
            s => {
                const r = resultMap.get(s.id);
                if (!r) return s;

                return {
                    ...s,
                    checked: isSuccess(r),
                    checkedAt: isSuccess(r) ? now : null,
                    isLoading: false,
                    status: r.status,
                    error: r.error ?? null,
                }
            }
        ))
    }

    const hasRetryableError = students.some(
        s => isRetryable(s)
    );

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
                            isLoading={student.isLoading}
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
            <div>
                {hasRetryableError
                    ? <button onClick={retryCheck}>[실패한 출석 다시시도]</button>
                    : <button onClick={allCheck}>[전체 출석]</button>
                }
            </div>
        </div>
    )
}

export default StudentList