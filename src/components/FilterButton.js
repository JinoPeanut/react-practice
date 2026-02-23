export function FilterButton({ label, value, currentFilter, onClick }) {
    const isActive = currentFilter === value;
    const baseStyle = "px-4 py-2 rounded-lg text-sm transition";
    const activeStyle = "bg-indigo-500 text-white";
    const inactiveStyle = "bg-indigo-200 text-gray-700 hover:bg-gray-300";

    return (
        <button
            onClick={() => onClick(value)}
            className={`
                ${baseStyle}
                ${isActive
                    ? activeStyle
                    : inactiveStyle}
            `}
        >
            {label}
        </button>
    )
}