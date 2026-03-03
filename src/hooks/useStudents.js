// src/hooks/useStudents.js
import { useState, useEffect, useMemo, useRef } from "react";
import { studentAPI } from "../api/studentAPI";
import { isSuccess, isFailed, isRetryable } from "../utils/attendanceStatus";
import { createAttendanceSummary } from "../utils/attendanceSummary";
import { toast } from "react-toastify";
import { BASE_URL } from "../api/base_url";
import { usePagination } from "./usePagination";

export function useStudents() {
    const LIMIT = 5;
    const [total, setTotal] = useState(0);
    const { page, totalPages, nextPage, prevPage } = usePagination({ total, limit: LIMIT });

    const [students, setStudents] = useState([]);
    const [name, setName] = useState("");
    const [filter, setFilter] = useState("All");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const undoTimers = useRef(new Map());

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

    const fetchStudents = async (page) => {
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`${BASE_URL}?_page=${page}&_limit=${LIMIT}`);

            const totalCount = res.headers.get("X-Total-Count");
            setTotal(Number(totalCount));

            const data = await res.json();
            setStudents(data);

        } catch (err) {
            setError("불러오기 실패");
        } finally {
            setIsLoading(false);
        }
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
        const existingTimer = undoTimers.current.get(id);
        if (existingTimer) {
            clearTimeout(existingTimer);
            undoTimers.current.delete(id);
        }
        const target = students.find(s => s.id === id);
        if (isProcessing || !target || target.isLoading) return;

        const nextChecked = !target.checked;
        const prevChecked = target.checked;
        const now = Date.now();
        const prevStudent = { ...target };

        applyToggle(id, nextChecked, now);


        await syncToggle(id, nextChecked, prevStudent, now);
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

    const syncToggle = async (id, nextChecked, prevStudent, timeStamp) => {
        try {
            const result = await studentAPI.toggleCheck(
                id,
                nextChecked,
                nextChecked ? timeStamp : null
            );

            if (!isSuccess(result)) throw new Error();

            setStudents(prev => prev.map(
                s => s.id === id
                    ? { ...s, isLoading: false, undoable: true }
                    : s
            ));

            const timer = setTimeout(() => {
                setStudents(prev => prev.map(
                    s => s.id === id
                        ? { ...s, undoable: false }
                        : s
                ))
                undoTimers.current.delete(id);
            }, 5000)

            undoTimers.current.set(id, timer);

        } catch (error) {
            //롤백
            setStudents(prev => prev.map(
                s => s.id === id
                    ? {
                        ...s,
                        isLoading: false,
                        undoable: true,
                    }
                    : s
            ));
            toast.error("출석 처리 실패");
        }
    }

    const undoStudent = async (id) => {
        const target = students.find(s => s.id === id);
        if (!target) return;

        const timer = undoTimers.current.get(id);
        if (timer) {
            clearTimeout(timer);
            undoTimers.current.delete(id);
        }

        const revertChecked = !target.checked;
        const now = Date.now();

        setStudents(prev => prev.map(
            s => s.id === id
                ? { ...s, isLoading: true }
                : s
        ));

        try {
            const result = await studentAPI.toggleCheck(
                id, revertChecked, revertChecked ? now : null
            );

            if (!isSuccess(result)) throw new Error();

            setStudents(prev => prev.map(
                s => s.id === id
                    ? {
                        ...s,
                        checked: revertChecked,
                        checkedAt: revertChecked ? now : null,
                        isLoading: false,
                        undoable: false,
                    }
                    : s
            ));
        } catch (err) {
            toast.error("되돌리기 실패");
            setStudents(prev => prev.map(
                s => s.id === id
                    ? { ...s, isLoading: false }
                    : s
            ));
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
        fetchStudents(page);
    };

    const deleteStudent = async (id) => {
        if (id === 1) return toast.warn("1번은 삭제 불가");

        const prev = [...students];
        setStudents(prev => prev.filter(s => s.id !== id));

        try {
            const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();

            await fetchStudents(page);

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
        fetchStudents(page);
    }, [page]);

    return {
        students,
        name,
        setName,
        hasRetryableError,
        resetChecked,
        toggleStudent,
        undoStudent,
        addStudent,
        deleteStudent,
        allCheck,
        retryCheck,
        filterStudent,
        filter,
        setFilter,
        page,
        totalPages,
        nextPage,
        prevPage,
    };
}