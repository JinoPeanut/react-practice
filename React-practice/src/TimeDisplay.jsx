import { useState } from "react"
import { useEffect } from "react"

function TimeDisplay({ }) {

    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => {
            setDate(new Date());
        }, 60000)

        return () => clearInterval(timerId);
    }, [])

    const formatTime = date.toLocaleTimeString();

    return (
        <p>현재시간: {formatTime}</p>
    )
}

export default TimeDisplay