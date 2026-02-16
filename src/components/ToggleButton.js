import { useAttendance } from "./context/AttendanceContext";

function ToggleButton({ id }) {
    const { toggleStudent } = useAttendance();

    return <button onClick={() => toggleStudent(id)}>출석 토글</button>;
}
