import { useState } from "react";
import { useEffect } from "react";

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timerId = setInterval(() => {
      setCount(prev => prev + 1)
    }, 1000)

    return () => {
      clearInterval(timerId);
      console.log("Interval 정리됨");
    }

  }, [])

  const resetCount = () => {
    setCount(0);
  }

  return (
    <div>
      <p>count: {count}</p>
      <button onClick={resetCount}>[초기화]</button>
    </div>
  )
}

export default App
