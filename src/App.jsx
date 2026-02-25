import { useState } from "react";
import { ToastContainer } from "react-toastify"
import StudentList from "./components/StudentList";
import TimeDisplay from "./components/TimeDisplay";
import "./App.css"

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl p-8">
        <TimeDisplay />
        <StudentList />
        <ToastContainer />
      </div>
    </div>
  )
}

export default App
