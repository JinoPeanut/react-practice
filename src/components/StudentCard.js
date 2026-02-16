import ToggleButton from "./ToggleButton";

function StudentCard({ student }) {
    return (
        <div>
            <span>
                {student.name} - {student.isPresent ? "출석" : "결석"}
            </span>
            <ToggleButton id={student.id} />
        </div>
    );
}

export default StudentCard;
