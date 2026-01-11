import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";

function App() {

  const [text, setText] = useState("");
  const textRef = useRef("");

  const inputHandle = (e) => {
    const value = e.target.value;
    setText(value);

    if (value.length > textRef.current.length) {
      console.log("입력됨");
    }
    if (value.length < textRef.current.length) {
      console.log("삭제됨");
    }

    textRef.current = value;
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
