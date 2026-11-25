import { useState } from "react";
import { FoodCard } from "../components/FoodsCard";
import type { FoodItem } from "../models/FoodItem";
import { Unit } from "../models/Unit";
import { isValidDateOnly } from "../utils/dateHelpers";

export const InventoryScreen = () => {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState<Unit>(Unit.COUNT);
  const [expiryDate, setExpiryDate] = useState("");
  const [category, setCategory] = useState<"fridge" | "pantry" | "freezer">("fridge");

  const addItem = () => {
    const trimmedName = name.trim();
    const parsedQuantity = Number(quantity);

    if (!trimmedName || !quantity.trim() || !Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      window.alert("Enter a food name and a quantity greater than zero.");
      return;
    }

    if (!isValidDateOnly(expiryDate)) {
      window.alert("Enter a valid expiry date.");
      return;
    }

    const newItem: FoodItem = {
      id: crypto.randomUUID(),
      name: trimmedName,
      quantity: parsedQuantity,
      unit,
      expiryDate,
      category,
    };

    setItems((previous) => [...previous, newItem]);
    setName("");
    setQuantity("");
    setUnit(Unit.COUNT);
    setExpiryDate("");
    setCategory("fridge");
  };

  const deleteItem = (id: string) => {
    setItems((previous) => previous.filter((item) => item.id !== id));
  };

  return (
    <main
      style={{
        maxWidth: "700px",
        margin: "0 auto",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f7f7f7",
        minHeight: "100vh",
      }}
    >
      <h1>ShelfLife Inventory</h1>
      <p>Track food freshness and reduce waste.</p>

      <section style={{ backgroundColor: "#fff", padding: "16px", borderRadius: "12px", marginBottom: "20px" }}>
        <h2>Add Food Item</h2>
        <input
          aria-label="Food name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Food name"
          style={{ display: "block", marginBottom: "8px", width: "100%" }}
        />
        <input
          aria-label="Quantity"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          placeholder="Quantity"
          type="number"
          min="0.01"
          step="any"
          style={{ display: "block", marginBottom: "8px", width: "100%" }}
        />
        <select
          aria-label="Measurement unit"
          value={unit}
          onChange={(event) => setUnit(event.target.value as Unit)}
          style={{ display: "block", marginBottom: "8px", width: "100%" }}
        >
          <option value={Unit.COUNT}>count</option>
          <option value={Unit.GRAM}>g</option>
          <option value={Unit.KILOGRAM}>kg</option>
          <option value={Unit.MILLILITER}>ml</option>
          <option value={Unit.LITER}>l</option>
        </select>
        <input
          aria-label="Expiry date"
          value={expiryDate}
          onChange={(event) => setExpiryDate(event.target.value)}
          type="date"
          style={{ display: "block", marginBottom: "8px", width: "100%" }}
        />
        <select
          aria-label="Storage location"
          value={category}
          onChange={(event) => setCategory(event.target.value as "fridge" | "pantry" | "freezer")}
          style={{ display: "block", marginBottom: "8px", width: "100%" }}
        >
          <option value="fridge">Fridge</option>
          <option value="pantry">Pantry</option>
          <option value="freezer">Freezer</option>
        </select>
        <button onClick={addItem}>Add Item</button>
      </section>

      <section aria-label="Food inventory">
        {items.length === 0 ? (
          <p>Your inventory is empty. Add your first food item above.</p>
        ) : (
          items.map((item) => (
            <FoodCard key={item.id} item={item} onDelete={deleteItem} />
          ))
        )}
      </section>
    </main>
  );
};
