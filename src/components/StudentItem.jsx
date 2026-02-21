function StudentItem({ student, onToggle, time, onDelete }) {

    return (
        <div
            className="
            bg-white
            p-5
            rounded-xl
            shadow-sm
            hover:shadow-lg
            hover:-translate-y-1
            transition
            duration-300
            flex
            justify-between
            items-center
            "
        >
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">
                        {student.name}
                    </span>

                    <span
                        className={`text-xs px-3 py-1 rounded-full
                            ${student.checked
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-600"
                            }`
                        }
                    >
                        {student.checked ? "출석" : "미출석"}
                    </span>
                </div>

                {time && (
                    <span className="text-sm text-gray-500 mt-1">
                        출석 시간: {time}
                    </span>
                )}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={onToggle}
                    disabled={student.isLoading}
                    className="
                        px-4 py-2
                        text-sm
                        rounded-lg
                        bg-indigo-500
                        text-white
                        hover:bg-indigo-600
                        active:scale-95
                        transition
                        duration-150
                        ease-in-out
                        disabled:opacity-50
                    "
                >
                    {student.isLoading ? "출석 완료" : "체크"}
                </button>

                <button
                    onClick={onDelete}
                    className="
                        px-4 py-2
                        text-sm rounded-lg
                        bg-red-500 text-white
                        hover:bg-red-600
                        active:scale-95
                        transition
                    "
                >
                    삭제
                </button>
            </div>
        </div>
    )
}

export default StudentItem