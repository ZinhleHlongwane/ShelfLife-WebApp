import type { Unit } from "./Unit";

export type StorageCategory = "fridge" | "pantry" | "freezer";

// Expiry dates are stored as YYYY-MM-DD calendar dates, not timestamps.
// This keeps web and mobile behaviour consistent across time zones.
export interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  expiryDate: string;
  category: StorageCategory;
}
