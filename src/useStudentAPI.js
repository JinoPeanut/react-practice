import { API_ERROR } from "./apiError";

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

    const checkMany = async (targets, maxRetry = 2) => {
        const remaining = targets;
        let lastResults = [];

        for (let i = 0; i < maxRetry; i++) {
            const results = await runStudentPatch(
                remaining, () => ({
                    checked: true,
                    checkedAt: Date.now(),
                })
            );

            lastResults = results;

            const failedIds = results.filter(r => !r.ok).map(r => r.id);

            if (failedIds.length === 0) {
                return results;
            }

            remaining = remaining.filter(s => failedIds.includes(s.id));
        }
        return lastResults;
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