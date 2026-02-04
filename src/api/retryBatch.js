import { RETRYABLE_ERROR_TYPE } from "../constants/retryPolicy";


export async function retryBatch({ targets, requestFn, maxRetry = 2 }) {
    let remaining = targets;
    let lastResults = [];

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

        lastResults = results;

        const failedIds = results
            .filter(r => !r.ok && r.error && RETRYABLE_ERROR_TYPE.includes(r.error.type))
            .map(r => r.id);
        if (failedIds.length === 0) return results;

        remaining = remaining.filter(t => failedIds.includes(t.id));
    }

    return lastResults;
}
