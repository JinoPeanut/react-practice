import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";

function App() {

  const [text, setText] = useState("");
  const timeId = useRef(null);
  const isSavedRef = useRef(false);

  useEffect(() => {
    if (text === "") return;

    if (timeId.current) {
      clearTimeout(timeId.current);
    }

    timeId.current = setTimeout(() => {
      if (!isSavedRef.current) {
        console.log("자동 저장됨");
        isSavedRef.current = true;
      }
    }, 3000)

    return () => {
      clearTimeout(timeId.current);
    }
  }, [text])

  const handleChange = (e) => {
    setText(e.target.value);
    isSavedRef.current = false;
  }

  return (
    <div>
      <input
        value={text}
        onChange={handleChange}
      />
    </div>
  )
}

export default App
