import { useState } from "react";
import { useEffect } from "react";

function App() {

  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (text === "") {
      setResult("");
      setStatus("idle");
      return;
    }
    setStatus("typing");

    const timeId = setTimeout(() => {
      setStatus("saving");

      setTimeout(() => {
        setResult(text);
        setStatus("saved");
      }, 1000)
    }, 2000)

    return () => {
      clearTimeout(timeId);
    }
  }, [text])

  const handleChange = (e) => {
    setText(e.target.value);
  }

  return (
    <div>
      <input
        value={text}
        onChange={handleChange}
      />
      {status === "typing" && <p>입력중...</p>}
      {status === "saving" && <p>저장중...</p>}
      {status === "saved" && <p>저장 완료</p>}

      {result && <p>{result}</p>}
    </div>
  )
}

export default App
