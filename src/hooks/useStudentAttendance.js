import { useEffect, useReducer, useState, useRef } from "react";
import { useAsyncAction } from "./useAsyncAction";
import { fakeToggleAttendance } from "../api/fakeAttendance";

export function useStudentAttendance() {

    const {
        status,
        error,
        lastUpdatedAt,
        execute,
    } = useAsyncAction(fakeToggleAttendance, {
        successDelay: 2000,
        errorDelay: 3000,
    });

    return {
        status,
        errorMessage: error,
        lastUpdatedAt,
        toggleCheck: execute,
    }
}