import { useState } from "react";
import { useEffect } from "react";

function App() {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [resultText, setResult] = useState("");

  useEffect(() => {
    if (text === "") return;

    setLoading(true);

    const timeId = setTimeout(() => {
      setResult(text);
      setLoading(false);
    }, 2000);

    return () => {
      clearTimeout(timeId);
    }
  }, [isLoading, text])

  return (
    <div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}

      />

      {isLoading && <p>로딩중...</p>}
      {resultText && <p>{resultText}</p>}
    </div>
  )
}

export default App
