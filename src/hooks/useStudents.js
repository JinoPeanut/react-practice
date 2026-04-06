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
    const { page, setPage, totalPages, nextPage, prevPage } = usePagination({ total, limit: LIMIT });

    const [students, setStudents] = useState([]);
    const [name, setName] = useState("");
    const [filter, setFilter] = useState("All");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cache, setCache] = useState({});
    const [search, setSearch] = useState("");

    const undoTimers = useRef(new Map());

    /* ---------------- 상태 계산 ---------------- */

    const filterStudent = useMemo(() => {
        const sorted = [...students].sort((a, b) => {
            // a학생 b학생 출석이 똑같으면 출석시간에 따라서 정렬
            if (a.checked === b.checked) {
                return (a.checkedAt ?? 0) - (b.checkedAt ?? 0);
            }
            // 그 외에는 출석한사람이 앞에 (b-a 는 큰값정렬)
            // b가 true면 1 a 가 false면 0 이라서 1-0 = 1
            // 큰값정렬이라 더 높은 true(1) 이 앞으로 정렬
            return b.checked - a.checked;
        });

        return sorted.filter(s => {
            // true는 전체학생을 뜻함
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

    /* 현재 페이지 패치*/
    const fetchStudents = async (page, searchQuery = "") => {
        setIsLoading(true);
        setError(null);

        try {
            const searchParam = searchQuery
                ? `&name=${encodeURIComponent(searchQuery)}`
                : "";

            /* 전체 개수 먼저 가져오기 */
            const countRes = await fetch(`${BASE_URL}?${searchParam}`);
            const allData = await countRes.json();
            const totalCount = allData.length;
            setTotal(totalCount);

            /* 현재 페이지 데이터 가져오기 */
            const res = await fetch(`${BASE_URL}?page=${page}&limit=${LIMIT}${searchParam}`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            setStudents(data);

            const newTotalPages = Math.ceil(totalCount / LIMIT);
            const cacheKey = `${page}_${searchQuery}`;
            //캐시에 저장
            setCache(prev => ({
                ...prev,
                [cacheKey]: data,
            }));

            return newTotalPages;

        } catch (err) {
            setError("불러오기 실패");
        } finally {
            setIsLoading(false);
        }
    };

    // 페이지 또는 검색한 페이지를 기억해서 로딩없이 보여주는 역할
    const prefetchStudents = async (page, searchQuery = "") => {
        const cacheKey = `${page}_${searchQuery}`;

        // 캐시 키 있으면 바로 리턴 (불필요한 API 호출 방지)
        if (cache[cacheKey]) return;

        try {
            // 검색어있으면 쿼리 붙이고 없으면 안붙임
            // encodeURIComponent 는 한글/공백 안전하게 URL로 변환
            const searchParam = searchQuery
                ? `&name_like=${encodeURIComponent(searchQuery)}`
                : "";

            // fetch 요청
            const res = await fetch(`${BASE_URL}?_page=${page}&_limit=${LIMIT}${searchParam}`);

            // 서버응답 실패시 바로 catch 로 이동
            if (!res.ok) throw new Error();

            // 서버응답(JSON) 을 JS 객체로 변환
            const data = await res.json();

            // 캐시에 저장
            setCache(prev => ({
                ...prev,
                [cacheKey]: data,
            }));

        } catch (err) {
            console.warn("prefetch 실패", err);
        }
    }

    const resetChecked = async () => {
        if (isProcessing) return;
        setIsProcessing(true);

        try {
            const result = await studentAPI.resetCheck(students);

            // isFailed 는 내부적으로 result.some((item) => isFailed(item)) 이렇게 됨
            // isFailed() 이렇게 하면 함수를 넘기는것이 아닌 바로 실행이 되어버림
            if (result.some(isFailed)) {
                toast.error("초기화 실패");
                return;
            }

            // 화면 UI 변경
            setStudents(prev =>
                prev.map(s => ({ ...s, checked: false, checkedAt: null }))
            );

        } catch (error) {
            toast.error("서버 오류 발생");
            console.log("에러내용: ", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleStudent = async (id) => {
        const target = students.find(s => s.id === id);
        if (isProcessing || !target || target.isLoading) return;

        const nextChecked = !target.checked;
        const now = Date.now();

        // 1번만 호출
        setStudents(prev => prev.map(s =>
            s.id === id
                ? { ...s, checked: nextChecked, checkedAt: nextChecked ? now : null, isLoading: true }
                : s
        ));

        try {
            const result = await studentAPI.toggleCheck(id, nextChecked, nextChecked ? now : null, target);
            if (!isSuccess(result)) throw new Error();

            // 성공 시 isLoading만 끄고 undoable 켜기
            setStudents(prev => prev.map(s =>
                s.id === id ? { ...s, isLoading: false, undoable: true } : s
            ));

            // 5초 후 undoable 끄기
            const timer = setTimeout(() => {
                setStudents(prev => prev.map(s =>
                    s.id === id ? { ...s, undoable: false } : s
                ));
                undoTimers.current.delete(id);
            }, 5000);

            undoTimers.current.set(id, timer);

        } catch {
            // 실패 시 롤백
            setStudents(prev => prev.map(s =>
                s.id === id
                    ? { ...s, checked: target.checked, checkedAt: target.checkedAt, isLoading: false, undoable: false, status: "Retryable" }
                    : s
            ));
            toast.error("출석 처리 실패");
        }
    };

    const undoStudent = async (id) => {
        // 학생찾기
        const target = students.find(s => s.id === id);
        if (!target) return;

        // 이미 타이머 작동중이면 취소시킴
        const timer = undoTimers.current.get(id);
        if (timer) {
            clearTimeout(timer);
            undoTimers.current.delete(id);
        }

        // 되돌리기 위한 변수
        // 출석체크 -> 되돌리기 -> !출석체크
        const revertChecked = !target.checked;
        const now = Date.now();

        setStudents(prev => prev.map(
            s => s.id === id
                ? { ...s, isLoading: true }
                : s
        ));

        try {
            // 출석 상태 변경 요청
            // undo는 되돌리려는 함수니까 체크상태 변수는 항상
            // !target.checked 가 맞다 (undo 는 출석체크 또는 취소 이후에만 나오기때문)
            const result = await studentAPI.toggleCheck(
                id, revertChecked, revertChecked ? now : null, target
            );

            // 서버통신엔 성공했지만 결과가 실패라면 catch로 보냄
            if (!isSuccess(result)) throw new Error();

            // 성공시 상태 변경
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

            // 단일 대상으로 하는 함수에는 굳이 서버상태 필요없음
            setStudents(prev => prev.map(
                s => s.id === id
                    ? { ...s, isLoading: false, undoable: false }
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
        setCache({});
        fetchStudents(page, search);
    };

    const deleteStudent = async (id) => {
        const prev = students;
        setStudents(prev => prev.filter(s => s.id !== id));

        try {
            const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();

            const newTotalPages = await fetchStudents(page, search);

            if (page > newTotalPages) {
                setPage(prev => Math.max(prev - 1, 1));
            }

        } catch {
            toast.error("삭제 실패");
            setStudents(prev);
        }
    };

    const allCheck = async () => {
        if (isProcessing) return;

        // 출석체크 안된 학생만 필터링
        const targets = students.filter(s => !s.checked);
        if (!targets.length) return;

        setIsProcessing(true);

        const now = Date.now();

        setStudents(prev =>
            prev.map(s => (s.checked ? s : { ...s, isLoading: true }))
        );

        try {
            // 해당 변수는 checkMany 의 결과값을 저장한 변수
            const results = await studentAPI.checkMany(targets);
            const summary = createAttendanceSummary(results);

            toast[summary.failed ? "warning" : "success"](
                summary.failed
                    ? `재시도 필요: ${summary.failed}명`
                    : `${summary.success}명 출석 성공`
            );

            // id 를 기준으로 찾기위한것
            // 예시) { id: 1, ok: true } -> [1, { id: 1, ok: true }]
            // 즉 대괄호 안에 key는 1 로 value 는 {} 안에 값들
            const map = new Map(results.map(r => [r.id, r]));

            setStudents(prev =>
                prev.map(s => {
                    //변수 r을 쓴 이유는 반환할 데이터에 status 랑 error 를 추가하기 위해
                    const r = map.get(s.id);
                    if (!r) return s;
                    return {
                        ...s,
                        checked: isSuccess(r),
                        checkedAt: isSuccess(r) ? now : null,
                        isLoading: false,
                        // 성공시에 status 랑 error 는 필요없지만
                        // 실패시에는 필요함으로 결국은 전체적인 데이터의
                        // 일관성을 맞추기위해 사용
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

        // 재시도 상태인 학생만 필터링해서 저장
        const targets = students.filter(isRetryable);

        // 재시도 학생이 없으면 리턴
        if (!targets.length) return;

        const now = Date.now();

        setIsProcessing(true);

        // 재시도 시작 표시
        setStudents(prev =>
            prev.map(s =>
                isRetryable(s) ? { ...s, isLoading: true, error: null } : s
            )
        );

        try {
            // 서버 결과 요청
            const results = await studentAPI.checkMany(targets);
            // 값을 빠르게찾기위한 맵 생성
            const map = new Map(results.map(r => [r.id, r]));

            // 화면 UI 반영
            setStudents(prev =>
                prev.map(s => {
                    const r = map.get(s.id);
                    if (!r) return s;
                    return {
                        ...s,
                        checked: isSuccess(r),
                        checkedAt: isSuccess(r) ? now : null,
                        isLoading: false,
                        // r.status 는 서버상태 r 을 기반으로 결과 저장
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

    /* 검색어 변경시 - 1페이지로 초기화 + 캐시비우기 + 재검색 */
    useEffect(() => {
        setPage(1);
        setCache({});
        fetchStudents(1, search);
    }, [search])

    useEffect(() => {
        const cacheKey = `${page}_${search}`;
        if (cache[cacheKey]) {
            // 캐시있으면 UI 바로 업데이트
            setStudents(cache[cacheKey]);
        } else {
            // 캐시없으면 서버에서 데이터가져오고 캐시저장
            fetchStudents(page, search);
        }

        // 다음페이지 미리 가져오기
        if (page < totalPages && !search) {
            prefetchStudents(page + 1, search);
        }
    }, [page, totalPages]);

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
        isLoading,
        search,
        setSearch,
    };
}