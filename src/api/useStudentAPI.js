import { API_ERROR } from "../constants/apiError";
import { retryBatch } from "../retryBatch";
import { normalizeAttendanceResult } from "../util/normalizeAttendanceResult";
import { attendanceCache } from "./attendanceCache";
import { shouldCache } from "../util/attendanceCachePolicy";
import { CACHE_TTL } from "../util/cacheTtl";
import { cache } from "react";

export function useStudentAPI() {

    function handleApiError(error) {
        switch (error?.type) {
            case API_ERROR.NETWORK:
                return "네트워크 오류가 발생했습니다";

            case API_ERROR.TIMEOUT:
                return "시간 초과로 오류가 발생했습니다";

            case API_ERROR.UNKNOWN:
                return "알 수 없는 오류입니다";

            default:
                return "출석 실패";
        }
    }

    async function runStudentPatch(targets, bodyBuilder) {
        return Promise.all(
            targets.map(async (student) => {

                const body = bodyBuilder(student);
                const res = await runFetch(student.id, body);

                return {
                    id: student.id,
                    ok: res.ok,
                    errorType: res.ok
                        ? null
                        : res.error?.type ?? API_ERROR.UNKNOWN,
                    errorMessage: res.ok
                        ? null
                        : res.error?.message ?? "출석 실패",
                }

            })
        );
    }

    async function runFetch(id, body) {
        const cacheKey = `${id}_${body.checkedAt ?? "reset"}`;

        if (attendanceCache.has(cacheKey)) {
            const cached = attendanceCache.get(cacheKey);

            const isExpired = Date.now() - cached.cachedAt > CACHE_TTL;

            if (!isExpired) return cached.result;

            attendanceCache.delete(cacheKey);
        }

        let result;

        try {
            const res = await fetch(`http://localhost:3001/students/${id}`, {
                method: "PATCH",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                result = normalizeAttendanceResult({
                    ok: false,
                    error: { type: "NETWORK" }
                })
            } else {
                result = normalizeAttendanceResult({ ok: true });
            }
        } catch {
            result = normalizeAttendanceResult({
                ok: false,
                error: { type: "UNKNOWN" }
            });
        }

        if (shouldCache(result)) {
            attendanceCache.set(cacheKey, {
                result,
                cachedAt: Date.now(),
            });
        }

        return result;
    }

    const checkMany = async (students) => {
        const now = Date.now();

        return retryBatch({
            targets: students,
            maxRetry: 2,
            requestFn: (student) =>
                runFetch(student.id, {
                    checked: true,
                    checkedAt: now,
                })
        })
    }

    const toggleCheck = async (id, nextChecked, checkedAt) => {

        return await runFetch(id, {
            checked: nextChecked,
            checkedAt,
        });
    }

    const resetCheck = async (targets) => {
        return runStudentPatch(targets, () => ({
            checked: false,
            checkedAt: null,
        }))
    }

    return { checkMany, toggleCheck, resetCheck, handleApiError };
}