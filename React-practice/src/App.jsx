import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";

function App() {

  const [text, setText] = useState("");
  const isTypingRef = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (text === "") {
      isTypingRef.current = false;
      return;
    }

    if (!isTypingRef.current) {
      console.log("입력 시작");
      isTypingRef.current = true;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      console.log("입력 멈춤");
      isTypingRef.current = false;
    }, 1000)

    return () => {
      clearTimeout(timeoutRef.current);
    }
  }, [text])

  const inputHandler = (e) => {
    setText(e.target.value);
  }

  return (
    <div>
      <input
        value={text}
        onChange={inputHandler}
      />
    </div>
  )
}

export default App
