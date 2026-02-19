import { useState } from "react";
import { ToastContainer } from "react-toastify"
import StudentList from "./StudentList";
import TimeDisplay from "./TimeDisplay";

function App() {

  const [students, setStudents] = useState([]);
  const [filter, setFilter] = useState("All");
  const [name, setName] = useState("");

  return (
    <div>
      <TimeDisplay />

      <StudentList
        students={students}
        setStudents={setStudents}
        filter={filter}
        setFilter={setFilter}
        name={name}
        setName={setName}
      />

      <ToastContainer />
    </div>
  )
}

export default App
