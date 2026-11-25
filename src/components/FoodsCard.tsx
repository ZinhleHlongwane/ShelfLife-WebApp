import type { FoodItem } from "../models/FoodItem";
import { getFoodStatus } from "../features/inventory/inventoryLogic";
import { getStatusColor, getStatusLabel } from "../features/inventory/inventoryDisplay";
import { getDaysUntilExpiry } from "../utils/dateHelpers";

type Props = {
  item: FoodItem;
  onDelete: (id: string) => void;
};

export const FoodCard = ({ item, onDelete }: Props) => {
  const status = getFoodStatus(item);
  const label = getStatusLabel(status);
  const color = getStatusColor(status);
  const daysLeft = getDaysUntilExpiry(item.expiryDate);

  return (
    <article
      style={{
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "12px",
        backgroundColor: "#ffffff",
        textAlign: "left",
      }}
    >
      <h3>{item.name}</h3>
      <p>Quantity: {item.quantity} {item.unit}</p>
      <p>Storage: {item.category}</p>
      <p>Status: {color} {label}</p>
      <p>
        {daysLeft < 0
          ? `Expired ${Math.abs(daysLeft)} day(s) ago`
          : daysLeft === 0
            ? "Expires today"
            : `${daysLeft} day(s) until expiry`}
      </p>
      <button type="button" onClick={() => onDelete(item.id)} aria-label={`Remove ${item.name}`}>
        Remove
      </button>
    </article>
  );
};
