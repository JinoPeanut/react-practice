import { RETRYABLE_ERROR_TYPE } from "../constants/retryPolicy";


export async function retryBatch({ targets, requestFn, maxRetry = 2 }) {
    let remaining = targets;
    let lastResults = [];

    // 실패한 학생들만 최대 2회 반복
    for (let i = 0; i < maxRetry; i++) {
        const results = await Promise.all(
            remaining.map(async (item) => {
                try {
                    const res = await requestFn(item);
                    return {
                        id: item.id,
                        ok: res.ok,
                        error: res.error ?? null,
                    };
                } catch (e) {
                    return {
                        id: item.id,
                        ok: false,
                        error: e,
                    };
                }
            })
        );

        // 마지막 결과를 빈 배열에 넣기
        lastResults = results;

        // results 의 결과중에 catch 로 실패한 애들만 필터링
        const failedIds = results
            .filter(r => !r.ok && r.error && RETRYABLE_ERROR_TYPE.includes(r.error.type))
            .map(r => r.id);

        // 실패한 애들이 없으면 이제 바로 결과 반환
        if (failedIds.length === 0) return results;

        // 실패한 학생들 remaining 에 담기
        remaining = remaining.filter(t => failedIds.includes(t.id));
    }

    // 2회 시도 후 최종 결과
    return lastResults;
}
