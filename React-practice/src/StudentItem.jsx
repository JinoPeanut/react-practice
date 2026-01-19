import StudentList from "./StudentList"
function StudentItem({ student, setStudents }) {

    const handleBtn = () => {
        setStudents(prev => prev.map(
            s => s.id === student.id
                ? { ...s, checked: !s.checked }
                : s
        ))
    }

    return (
        <div>
            {student.checked && "✅"}
            {student.name}
            <button onClick={handleBtn}>[체크]</button>
        </div>
    )
}

export default StudentItem