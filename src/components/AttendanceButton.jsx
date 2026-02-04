import { useStudentAttendance } from "../hooks/useStudentAttendance";

function AttendanceButton() {
    const { toggleCheck, handleApiError } = useStudentAttendance();

    const handleClick = async () => {
        const result = await toggleCheck(1, true, Date.now());

        if (!result.ok) {
            alert(handleApiError(result.errorType));
        }
    }

    return (
        <div>
            <button onClick={toggleCheck}>[출석 토글]</button>
        </div>
    )
}

export default AttendanceButton