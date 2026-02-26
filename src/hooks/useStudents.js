// src/hooks/useStudents.js
import { useState, useEffect, useMemo } from "react";
import { studentAPI } from "../api/studentAPI";
import { isSuccess, isFailed, isRetryable } from "../utils/attendanceStatus";
import { createAttendanceSummary } from "../utils/attendanceSummary";
import { toast } from "react-toastify";
import { BASE_URL } from "../api/base_url";

export function useStudents() {
    const [students, setStudents] = useState([]);
    const [name, setName] = useState("");
    const [filter, setFilter] = useState("All");
    const [isProcessing, setIsProcessing] = useState(false);

    /* ---------------- 상태 계산 ---------------- */

    const filterStudent = useMemo(() => {
        const sorted = [...students].sort((a, b) => {
            if (a.checked === b.checked) {
                return (a.checkedAt ?? 0) - (b.checkedAt ?? 0);
            }
            return b.checked - a.checked;
        });

        return sorted.filter(s => {
            if (filter === "All") return true;
            if (filter === "Done") return s.checked;
            if (filter === "Todo") return !s.checked;
        })
    }, [students, filter]);

    const hasRetryableError = useMemo(
        () => students.some(s => isRetryable(s)),
        [students]
    );

    /* ---------------- 액션 함수 ---------------- */

    const fetchStudents = async () => {
        const res = await fetch(BASE_URL);
        const data = await res.json();
        setStudents(data);
    };

    const resetChecked = async () => {
        if (isProcessing) return;
        setIsProcessing(true);

        try {
            const result = await studentAPI.resetCheck(students);

            if (result.some(isFailed)) {
                toast.error("초기화 실패");
                return;
            }

            setStudents(prev =>
                prev.map(s => ({ ...s, checked: false, checkedAt: null }))
            );

        } catch (error) {
            toast.error("서버 오류 발생");
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleStudent = async (id) => {
        const target = students.find(s => s.id === id);
        if (isProcessing || !target || target.isLoading) return;

        const nextChecked = !target.checked;
        const now = Date.now();
        const prevStudent = { ...target };

        applyToggle(id, nextChecked, now);

        console.log("before sync");
        await syncToggle(id, nextChecked, now, () => setStudents(prev => prev.map(
            s => s.id === id
                ? prevStudent
                : s
        )));

        console.log("after sync");
        console.log("syncToggle is:", syncToggle);
    };

    const applyToggle = (id, nextChecked, timeStamp) => {
        setStudents(prev =>
            prev.map(s =>
                s.id === id
                    ? {
                        ...s,
                        checked: nextChecked,
                        checkedAt: nextChecked ? timeStamp : null,
                        isLoading: true,
                    }
                    : s
            )
        );
    }

    const syncToggle = async (id, nextChecked, timeStamp, rollback) => {
        try {
            const result = await studentAPI.toggleCheck(
                id,
                nextChecked,
                nextChecked ? timeStamp : null
            );

            if (!isSuccess(result)) {
                rollback();
                toast.error("출석 실패");
            } else {
                setStudents(prev =>
                    prev.map(s => (s.id === id
                        ? { ...s, isLoading: false, }
                        : s))
                );
            }
        } catch (error) {
            toast.error("출석 처리 실패");
            rollback();
        }
    }

    const addStudent = async () => {
        if (!name.trim()) return;

        await fetch(BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                checked: false,
                checkedAt: null,
            }),
        });

        setName("");
        fetchStudents();
    };

    const deleteStudent = async (id) => {
        if (id === 1) return toast.warn("1번은 삭제 불가");

        const prev = [...students];
        setStudents(prev => prev.filter(s => s.id !== id));

        try {
            const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
        } catch {
            toast.error("삭제 실패");
            setStudents(prev);
        }
    };

    const allCheck = async () => {
        if (isProcessing) return;

        const targets = students.filter(s => !s.checked);
        if (!targets.length) return;

        setIsProcessing(true);

        const now = Date.now();

        setStudents(prev =>
            prev.map(s => (s.checked ? s : { ...s, isLoading: true }))
        );

        try {
            const results = await studentAPI.checkMany(targets);
            const summary = createAttendanceSummary(results);

            toast[summary.failed ? "warning" : "success"](
                summary.failed
                    ? `재시도 필요: ${summary.failed}명`
                    : `${summary.success}명 출석 성공`
            );

            const map = new Map(results.map(r => [r.id, r]));

            setStudents(prev =>
                prev.map(s => {
                    const r = map.get(s.id);
                    if (!r) return s;
                    return {
                        ...s,
                        checked: isSuccess(r),
                        checkedAt: isSuccess(r) ? now : null,
                        isLoading: false,
                        status: r.status,
                        error: r.error ?? null,
                    };
                })
            );
        } catch (error) {
            toast.error("서버 오류 발생");

            setStudents(prev => prev.map(
                s => s.isLoading ? { ...s, isLoading: false } : s
            ))

        } finally {
            setIsProcessing(false);
        }
    };

    const retryCheck = async () => {
        if (isProcessing) return;

        const targets = students.filter(isRetryable);
        if (!targets.length) return;

        const now = Date.now();

        setIsProcessing(true);

        setStudents(prev =>
            prev.map(s =>
                isRetryable(s) ? { ...s, isLoading: true, error: null } : s
            )
        );

        try {
            const results = await studentAPI.checkMany(targets);
            const map = new Map(results.map(r => [r.id, r]));

            setStudents(prev =>
                prev.map(s => {
                    const r = map.get(s.id);
                    if (!r) return s;
                    return {
                        ...s,
                        checked: isSuccess(r),
                        checkedAt: isSuccess(r) ? now : null,
                        isLoading: false,
                        status: r.status,
                        error: r.error ?? null,
                    };
                })
            );
        } catch (error) {
            toast.error("서버 오류 발생");

            setStudents(prev => prev.map(
                s => s.isLoading ? { ...s, isLoading: false } : s
            ))

        } finally {
            setIsProcessing(false);
        }
    };

    /* ---------------- 초기 로딩 ---------------- */

    useEffect(() => {
        fetchStudents();
    }, []);

    return {
        students,
        name,
        setName,
        hasRetryableError,
        resetChecked,
        toggleStudent,
        addStudent,
        deleteStudent,
        allCheck,
        retryCheck,
        filterStudent,
        filter,
        setFilter,
    };
}