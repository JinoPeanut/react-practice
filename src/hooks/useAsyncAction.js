import { useEffect, useReducer, useRef } from "react";

const initialState = {
    status: "idle",
    errorMessage: null,
    lastUpdatedAt: null,
}

function reducer(state, action) {
    switch (action.type) {
        case "REQUEST":
            if (state.status === "loading") return state;
            return {
                ...state,
                status: "loading",
                error: null,
            }
        case "SUCCESS":
            return {
                status: "success",
                error: null,
                lastUpdatedAt: Date.now(),
            }
        case "ERROR":
            return {
                status: "error",
                error: action.message,
                lastUpdatedAt: Date.now(),
            }
        case "RESET":
            return {
                status: "idle",
                error: null,
                lastUpdatedAt: state.lastUpdatedAt,
            }
        default:
            return state;
    }
}

export function useAsyncAction(asyncFunction, options = {}) {
    const { successDelay = 2000, errorDelay = 3000 } = options;

    const [state, dispatch] = useReducer(reducer, initialState);
    const requestIdRef = useRef(0);

    const execute = async () => {
        const requestId = ++requestIdRef.current;
        dispatch({ type: "REQUEST" });

        try {
            await asyncFunction();

            if (requestId === requestIdRef.current) {
                dispatch({ type: "SUCCESS" });
            }
        } catch (error) {
            if (requestId === requestIdRef.current) {
                dispatch({ type: "ERROR", message: "출석실패" });
            }
        }
    }

    useEffect(() => {
        let timeout;

        if (statusSuccess()) {
            timeout = setTimeout(() => {
                dispatch({ type: "RESET" });
            }, successDelay)
        }

        if (statusError()) {
            timeout = setTimeout(() => {
                dispatch({ type: "RESET" });
            }, errorDelay)
        }

        return () => {
            if (timeout) clearTimeout(timeout);
        }

    }, [state.status, successDelay, errorDelay])

    return {
        ...state,
        execute,
    }
}