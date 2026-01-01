import { useState } from "react";
import { useEffect } from "react";

function App() {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!isLoading) return;

    const timeId = setTimeout(() => {
      setData({ id: 1, title: "useEffect 연습" });
      setLoading(false);
    }, 2000);

    return () => {
      clearTimeout(timeId);
    }
  }, [isLoading])

  return (
    <div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={() => setLoading(true)} disabled={isLoading}>[데이터 불러오기]</button>

      {isLoading && <p>로딩중...</p>}
      {data && <p>제목: {data.title}</p>}
    </div>
  )
}

export default App
