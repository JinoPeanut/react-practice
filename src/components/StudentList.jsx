import StudentItem from "./StudentItem";
import StudentStats from "./StudentStats";
import FilterButton from "./FilterButton"
import ControlPanel from "./ControlPanel";
import { useStudents } from "../hooks/useStudents";

function StudentList() {

    const {
        students,
        name,
        setName,
        toggleStudent,
        resetChecked,
        addStudent,
        deleteStudent,
        undoStudent,
        allCheck,
        retryCheck,
        hasRetryableError,
        filterStudent,
        filter,
        setFilter,
        page,
        totalPages,
        nextPage,
        prevPage,
        isLoading,
        search,
        setSearch,
    } = useStudents();

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center pt-10">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-8">
                <div className="m-2 space-x-1 flex justify-between">
                    <div>
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
                    <div>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="학생 이름 검색"
                            className="border rounded px-2 py-2 text-sm"
                        />
                        <button
                            onClick={() => setSearch("")}
                            className="ml-1 px-3 py-1 border rounded text-sm"
                        >
                            검색
                        </button>
                    </div>
                </div>
                <div className="relative">
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/60 flex item-center justify-center">
                            로딩중...
                        </div>
                    )}
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
                                    onToggle={() => toggleStudent(student.id)}
                                    onUndo={() => undoStudent(student.id)}
                                    onDelete={() => deleteStudent(student.id)}
                                    isLoading={student.isLoading}
                                    retryOne={() => retryCheck(student.id)}
                                    status={student.status}
                                />
                            )
                        })}
                    </ul>
                </div>

                <div className="flex justify-center items-center gap-4 mt-4">
                    <button
                        onClick={prevPage}
                        disabled={page === 1 || isLoading}
                        className="px-3 py-1 border rounded disabled:opacity-40"
                    >
                        이전
                    </button>
                    <span className="text-sm font-medium">
                        {page} / {totalPages}
                    </span>
                    <button
                        onClick={nextPage}
                        disabled={page === totalPages || isLoading}
                        className="px-3 py-1 border rounded disabled:opacity-40"
                    >
                        다음
                    </button>
                </div>

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