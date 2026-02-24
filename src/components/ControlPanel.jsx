import "../App.css";

function ControlPanel({ name, setName, resetValue, retryValue, allValue, addValue, hasRetryableError }) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex gap-3">
                <button className="btn btn-danger" onClick={resetValue}>[전체 출석 초기화]</button>

                {hasRetryableError
                    ? <button className="btn" onClick={retryValue}>[실패한 출석 다시시도]</button>
                    : <button className="btn btn-primary" onClick={allValue}>[전체 출석]</button>
                }
            </div>
            <div className="flex gap-2">
                <input
                    className="
                    border rounded-lg
                    px-3 py-2
                    focus:outline-none
                    focus:ring-2
                    focus:ring-indigo-400
                    transition"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <button className="btn" onClick={addValue}>[추가]</button>
            </div>
        </div>
    )
}

export default ControlPanel