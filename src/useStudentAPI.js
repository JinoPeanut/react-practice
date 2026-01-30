import { API_ERROR } from "./apiError";
import { retryBatch } from "./retryBatch";

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
                    error: res.error ?? null,
                }

            })
        );
    }

    async function runFetch(id, body) {
        try {
            const res = await fetch(`http://localhost:3001/students/${id}`, {
                method: "PATCH",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                return {
                    ok: false,
                    error: {
                        type: API_ERROR.NETWORK,
                        message: "요청 실패",
                    }
                }
            }
            return { ok: true };
        } catch {
            return {
                ok: false,
                error: {
                    type: API_ERROR.UNKNOWN,
                    message: "알 수 없는 오류",
                }
            }
        }
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