import StudentItem from "./StudentItem";
import StudentStats from "./StudentStats";
import FilterButton from "./FilterButton"
import ControlPanel from "./ControlPanel";
import { useStudents } from "../hooks/useStudents";

function StudentList({ filter, setFilter }) {

    const {
        students,
        name,
        setName,
        toggleStudent,
        resetChecked,
        addStudent,
        deleteStudent,
        allCheck,
        retryCheck,
        hasRetryableError,
    } = useStudents();

    const sortStudent = [...students].sort((a, b) => {
        if (a.checked === b.checked) {
            return (a.checkedAt ?? 0) - (b.checkedAt ?? 0);
        }
        return b.checked - a.checked;
    })

    const filterStudent = sortStudent.filter(s => {
        if (filter === "All") return true;
        if (filter === "Done") return s.checked;
        if (filter === "Todo") return !s.checked;
    });


    return (
        <div className="min-h-screen bg-gray-100 flex justify-center pt-10">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-8">
                <div className="m-2 space-x-1">
                    <FilterButton
                        label="전체"
                        value="All"
                        currentFilter={filter}
                        onClick={setFilter}
                    />
                    <FilterButton
                        label="출석"
                        value="Done"
                        currentFilter={filter}
                        onClick={setFilter}
                    />
                    <FilterButton
                        label="미출석"
                        value="Todo"
                        currentFilter={filter}
                        onClick={setFilter}
                    />
                </div>
                <ul className="space-y-2">
                    {filterStudent.map(student => {
                        const time = student.checked && student.checkedAt
                            ? new Date(student.checkedAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })
                            : null;

                        return (
                            <StudentItem
                                key={student.id}
                                student={student}
                                time={time}
                                onToggle={() => handleBtn(student.id)}
                                onDelete={() => deleteStudent(student.id)}
                                isLoading={student.isLoading}
                            />
                        )
                    })}
                </ul>

                <div className="mt-6">
                    <div className="flex justify-between items-start">
                        {/*왼쪽영역*/}
                        <ControlPanel
                            name={name}
                            setName={setName}
                            resetValue={resetChecked}
                            retryValue={retryCheck}
                            allValue={allCheck}
                            addValue={addStudent}
                            hasRetryableError={hasRetryableError}
                        />

                        <StudentStats
                            students={students}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StudentList