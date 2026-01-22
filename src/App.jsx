import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import StudentItem from "./StudentItem";
import StudentList from "./StudentList";
import TimeDisplay from "./TimeDisplay";

function App() {

  const [filter, setFilter] = useState("All");

  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    fetch("http://localhost:3001/students")
      .then(res => res.json())
      .then(data => setStudents(data))
  }, [])

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
    </div>
  )
}

export default App
