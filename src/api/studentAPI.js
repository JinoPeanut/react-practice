import { API_ERROR } from "../constants/apiError";
import { retryBatch } from "./retryBatch";
import { normalizeAttendanceResult } from "../utils/normalizeAttendanceResult";
import { attendanceCache } from "./attendanceCache";
import { shouldCache } from "../utils/attendanceCachePolicy";
import { CACHE_TTL } from "../utils/cacheTtl";
import { retryFetch } from "./retryFetch";
import { BASE_URL } from "./base_url";



async function runStudentPatch(targets, bodyBuilder) {
    return Promise.all(
        targets.map(async (student) => {

            // 받아온 값을 body로 만들어서 runFetch 에 넘김
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

    // 캐시가 있는지 확인
    if (attendanceCache.has(cacheKey)) {
        // 저장된 데이터 가져옴
        const cached = attendanceCache.get(cacheKey);

        // 캐시가 오래됐는지 확인 (즉 캐시 유통기한)
        const isExpired = Date.now() - cached.cachedAt > CACHE_TTL;

        // 만료안됐으면 그대로 리턴
        if (!isExpired) return cached.result;

        // 만료됐으면 삭제
        attendanceCache.delete(cacheKey);
    }

    let result;

    try {
        const res = await fetch(`${BASE_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(body),
            signal: options.signal,
        });

        // 통신 오류시 조건문
        if (!res.ok) {
            // error 타입이 NETWORK 인데 normalize 에 result.error
            // "NETWORK" 사유가 없어서 normalize 는 작동안함
            result = normalizeAttendanceResult({
                ok: false,
                error: { type: API_ERROR.NETWORK }
            })
        } else {
            // 이부분은 통신 성공시.
            result = normalizeAttendanceResult({ ok: true });
        }
    } catch {
        // 실패시 보낼 데이터들.
        result = normalizeAttendanceResult({
            ok: false,
            error: { type: API_ERROR.UNKNOWN }
        });
    }

    // shouldCache = isSuccess를 리턴
    // 즉 통신이 성공했을때만 캐시를 저장하고 캐시저장 시간을 남겨둔다.
    // res.ok -> status: "Success" 반환 -> true -> if문 동작
    if (shouldCache(result)) {
        attendanceCache.set(cacheKey, {
            result,
            cachedAt: Date.now(),
        });
    }

    return result;
}

// allCheck 로 부터 출석체크 안된 학생들을 넘겨받음
// 또는 retryCheck 로 부터 재시도 상태인 학생을 넘겨받음
const checkMany = async (students) => {
    const now = Date.now();

    return retryBatch({
        targets: students,
        maxRetry: 2,
        requestFn: (student) =>
            runFetch(student.id, {
                id: student.id,
                name: student.name,
                checked: true,
                checkedAt: now,
            })
    })
}

const toggleCheck = async (id, nextChecked, checkedAt, student, options = {}) => {
    // () => 를 쓴 이유는 retryFetch 가 2번의 runFetch 를 실행할 권한을 가지기때문
    // () => 를 쓰지않으면 이미 결과가 실행되어버려서 retry의 의미가 사라짐.
    return retryFetch(() =>
        runFetch(id, {
            id,
            name: student.name,
            checked: nextChecked,
            checkedAt,
        }, options), 2
    )
}

const resetCheck = async (targets) => {
    // runStudentPatch 에 targets 와 bodyBuilder(student) 를 넘김
    // bodyBuilder 에는 resetCheck 가 원하는 동작을 포함하고 있음
    return runStudentPatch(targets, (student) => ({
        id: student.id,
        name: student.name,
        checked: false,
        checkedAt: null,
    }))
}

export const studentAPI = {
    checkMany,
    toggleCheck,
    resetCheck,
}