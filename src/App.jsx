import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { ToastContainer } from "react-toastify"
import { AttendanceProvider } from "./context/AttendanceContext";
import StudentItem from "./StudentItem";
import StudentList from "./StudentList";
import TimeDisplay from "./TimeDisplay";

function App() {

  const [filter, setFilter] = useState("All");
  const [name, setName] = useState("");

  return (
    <div>
      <AttendanceProvider>
        <TimeDisplay />
        <Header />
        <StudentList
          filter={filter}
          setFilter={setFilter}
          name={name}
          setName={setName}
        />
        <ToastContainer />
      </AttendanceProvider>
    </div>
  )
}

export default App
