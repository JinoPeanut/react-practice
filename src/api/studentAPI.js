import { API_ERROR } from "../constants/apiError";
import { retryBatch } from "./retryBatch";
import { normalizeAttendanceResult } from "../utils/normalizeAttendanceResult";
import { attendanceCache } from "./attendanceCache";
import { shouldCache } from "../utils/attendanceCachePolicy";
import { CACHE_TTL } from "../utils/cacheTtl";
import { retryFetch } from "./retryFetch";



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
            }

        })
    );
}

async function runFetch(id, body, options = {}) {
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
            body: JSON.stringify(body),
            signal: options.signal,
        });

        if (!res.ok) {
            result = normalizeAttendanceResult({
                ok: false,
                error: { type: API_ERROR.NETWORK }
            })
        } else {
            result = normalizeAttendanceResult({ ok: true });
        }
    } catch {
        result = normalizeAttendanceResult({
            ok: false,
            error: { type: API_ERROR.UNKNOWN }
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

const toggleCheck = async (id, nextChecked, checkedAt, options = {}) => {
    return retryFetch(() =>
        runFetch(id, {
            checked: nextChecked,
            checkedAt,
        }, options)
    )
}

const resetCheck = async (targets) => {
    return runStudentPatch(targets, () => ({
        checked: false,
        checkedAt: null,
    }))
}

const getStudents = async () => {
    try {
        const res = await fetch("http://localhost:3001/students");

        if (!res.ok) {
            throw new Error("학생 목록 조회 실패");
        }

        return await res.json();
    } catch (error) {
        throw error;
    }
};


export const studentAPI = {
    getStudents,
    checkMany,
    toggleCheck,
    resetCheck,
}