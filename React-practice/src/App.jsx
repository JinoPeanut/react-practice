import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";

function App() {

  const [text, setText] = useState(() => {
    return localStorage.getItem("savedText") || "";
  });


  const timeoutRef = useRef(null);

  useEffect(() => {
    if (text === "") return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      localStorage.setItem("savedText", text);
      console.log("자동 저장됨");
    }, 1000)

    return () => {
      clearTimeout(timeoutRef.current);
    }
  }, [text])

  const inputHandle = (e) => {
    const value = e.target.value;
    setText(value);
  }

  return (
    <div>
      <input
        value={text}
        onChange={inputHandle}
      />
    </div>
  )
}

export default App
