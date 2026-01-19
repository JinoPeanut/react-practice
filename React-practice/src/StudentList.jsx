import StudentItem from "./StudentItem";

function StudentList({ students, setStudents }) {

    const completedCount = students.filter(s => s.checked).length;

    return (
        <div>
            <ul>
                {students.map(student =>
                    <StudentItem
                        key={student.id}
                        student={student}
                        setStudents={setStudents}
                    />
                )}
            </ul>

            <p>출석완료: {completedCount}명</p>
        </div>
    )
}

export default StudentList