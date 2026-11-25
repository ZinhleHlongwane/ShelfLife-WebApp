import type { FoodItem } from "../../models/FoodItem";
import { fromInventoryDto, toInventoryPayload, type InventoryItemDto } from "./inventoryTypes";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new Error("We couldn't reach ShelfLife. Check that the API is running and try again.");
  }

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `The request failed (${response.status}). Please try again.`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const inventoryService = {
  async getAll(): Promise<FoodItem[]> {
    const items = await request<InventoryItemDto[]>("/api/inventory");
    return items.map(fromInventoryDto);
  },

  async create(item: Omit<FoodItem, "id">): Promise<FoodItem> {
    const created = await request<InventoryItemDto>("/api/inventory", {
      method: "POST",
      body: JSON.stringify(toInventoryPayload(item)),
    });
    return fromInventoryDto(created);
  },

  async update(id: string, item: Omit<FoodItem, "id">): Promise<FoodItem> {
    const updated = await request<InventoryItemDto>(`/api/inventory/${id}`, {
      method: "PUT",
      body: JSON.stringify(toInventoryPayload(item)),
    });
    return fromInventoryDto(updated);
  },

  delete(id: string): Promise<void> {
    return request<void>(`/api/inventory/${id}`, { method: "DELETE" });
  },
};
