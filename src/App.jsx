import { ToastContainer } from "react-toastify"
import StudentList from "./components/StudentList";
import TimeDisplay from "./components/TimeDisplay";
import "./App.css"

function App() {
  return (
    // 가장 바깥쪽 배경
    <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10">
      {/* 가장 첫 카드배경 */}
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl p-8">
        {/* 현재시간 표시 */}
        <TimeDisplay />
        <StudentList />
        <ToastContainer />
      </div>
    </div>
  )
}

export default App
