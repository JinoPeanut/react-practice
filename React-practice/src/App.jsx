import { useState } from "react";
import FoodItem from "./FoodItem";

function App() {
  const [foods, setFoods] = useState([
    { id: 1, name: "치킨" },
    { id: 2, name: "라면" },
    { id: 3, name: "라면" },
    { id: 4, name: "햄버거" },
  ]);


  const onDelete = (id) => {
    //받아온 id 와 동일하지 않는것들만 setFoods 에 남겨둔다(즉 같으면 삭제)
    setFoods(prev => prev.filter(food => food.id !== id));
  }

  return (
    <div>
      <ul>
        {foods.map(food => (
          <FoodItem
            key={food.id}
            food={food}
            onDelete={onDelete}
          ></FoodItem>
        ))}
      </ul>
    </div>
  )
}

export default App
