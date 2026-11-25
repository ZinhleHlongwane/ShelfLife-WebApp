import type { FoodItem } from "../../models/FoodItem";
import type { Unit } from "../../models/Unit";

export type StorageCategory = "fridge" | "pantry" | "freezer";

export interface InventoryItemPayload {
  name: string;
  quantity: number;
  unit: "Count" | "Gram" | "Kilogram" | "Milliliter" | "Liter";
  expiryDate: string;
  category: "Fridge" | "Pantry" | "Freezer";
}

export interface InventoryItemDto extends InventoryItemPayload {
  id: string;
  createdAt: string;
  updatedAt: string;
}

const unitToApi: Record<Unit, InventoryItemPayload["unit"]> = {
  count: "Count",
  g: "Gram",
  kg: "Kilogram",
  ml: "Milliliter",
  l: "Liter",
};

const apiToUnit: Record<InventoryItemDto["unit"], Unit> = {
  Count: "count",
  Gram: "g",
  Kilogram: "kg",
  Milliliter: "ml",
  Liter: "l",
};

const categoryToApi: Record<StorageCategory, InventoryItemPayload["category"]> = {
  fridge: "Fridge",
  pantry: "Pantry",
  freezer: "Freezer",
};

export const toInventoryPayload = (item: Omit<FoodItem, "id">): InventoryItemPayload => ({
  name: item.name.trim(),
  quantity: item.quantity,
  unit: unitToApi[item.unit],
  expiryDate: item.expiryDate.toISOString().slice(0, 10),
  category: categoryToApi[item.category],
});

export const fromInventoryDto = (item: InventoryItemDto): FoodItem => ({
  id: item.id,
  name: item.name,
  quantity: item.quantity,
  unit: apiToUnit[item.unit],
  expiryDate: new Date(`${item.expiryDate}T00:00:00`),
  category: item.category.toLowerCase() as StorageCategory,
});
