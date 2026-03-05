import { useState, useEffect, useMemo, useRef } from "react";

export function usePagination({ total, limit }) {
    const [page, setPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    const nextPage = () => {
        setPage(prev => Math.min(prev + 1, totalPages));
    };

    const prevPage = () => {
        setPage(prev => Math.max(prev - 1, 1));
    };

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [totalPages, page])

    return {
        page,
        setPage,
        totalPages,
        nextPage,
        prevPage,
    }
}