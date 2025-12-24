function FoodItem({ food, onDelete }) {
    return (
        <li>
            {food.name}
            <button onClick={() => onDelete(food.id)}>❌</button>
        </li>
    )
}
export default FoodItem