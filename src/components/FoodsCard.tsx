import type { FoodItem } from "../models/FoodItem";
import { getFoodStatus } from "../features/inventory/inventoryLogic";
import { getStatusLabel } from "../features/inventory/inventoryDisplay";
import { getDaysUntilExpiry } from "../utils/dateHelpers";

type Props = {
  item: FoodItem;
  onEdit: (item: FoodItem) => void;
  onDelete: (id: string) => void;
  deleting: boolean;
};

export const FoodCard = ({ item, onEdit, onDelete, deleting }: Props) => {
  const status = getFoodStatus(item);
  const daysLeft = getDaysUntilExpiry(item.expiryDate);
  const statusClass = status === "expired" ? "expired" : status === "expiringSoon" ? "expiring" : "fresh";
  const expiryLabel = daysLeft < 0 ? `Expired ${Math.abs(daysLeft)} ${Math.abs(daysLeft) === 1 ? "day" : "days"} ago` :
    daysLeft === 0 ? "Expires today" : `${daysLeft} days left`;

  return (
    <article className="food-card">
      <div className="food-card-main">
        <span className={`status-dot ${statusClass}`} aria-label={getStatusLabel(status)} />
        <div className="food-details">
          <h3>{item.name}</h3>
          <p>{item.quantity} {item.unit} <span>·</span> {item.category}</p>
        </div>
      </div>
      <div className="food-card-meta">
        <span className={`expiry-label ${statusClass}`}>{expiryLabel}</span>
        <div className="card-actions">
          <button type="button" className="icon-button" onClick={() => onEdit(item)} aria-label={`Edit ${item.name}`}>Edit</button>
          <button type="button" className="icon-button delete-action" onClick={() => onDelete(item.id)} disabled={deleting} aria-label={`Delete ${item.name}`}>{deleting ? "…" : "Remove"}</button>
        </div>
      </div>
    </article>
  );
};
