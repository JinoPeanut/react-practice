import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import StudentItem from "./StudentItem";
import StudentList from "./StudentList";
import TimeDisplay from "./TimeDisplay";

function App() {

  const [students, setStudents] = useState([
    { id: 1, name: "철수", checked: false },
    { id: 2, name: "영희", checked: false },
    { id: 3, name: "민수", checked: false },
  ]);

  return (
    <div>
      <TimeDisplay />
      <StudentList
        students={students}
        setStudents={setStudents}
      />
    </div>
  )
}

export default App
