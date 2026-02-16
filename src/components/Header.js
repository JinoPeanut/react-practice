import { useAttendance } from "./context/AttendanceContext";

function Header() {
    const { students } = useAttendance();

    const presentCount = students.filter(
        (student) => student.isPresent
    ).length;

    return <h1>현재 출석 인원: {presentCount}</h1>;
}
