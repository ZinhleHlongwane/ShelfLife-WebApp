import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { FoodCard } from "../components/FoodsCard";
import type { FoodItem } from "../models/FoodItem";
import { Unit } from "../models/Unit";
import { inventoryService } from "../features/inventory/inventoryService";

type Category = FoodItem["category"];
type Filter = "all" | Category;

const emptyForm = {
  name: "",
  quantity: "1",
  unit: Unit.COUNT as Unit,
  expiryDate: "",
  category: "fridge" as Category,
};

export const InventoryScreen = () => {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await inventoryService.getAll());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load your inventory.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  const visibleItems = useMemo(
    () => items.filter((item) => filter === "all" || item.category === filter),
    [items, filter],
  );

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const submitItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const quantity = Number(form.quantity);
    if (!form.name.trim() || !Number.isFinite(quantity) || quantity <= 0 || !form.expiryDate) {
      setError("Enter a food name, a quantity greater than zero and an expiry date.");
      return;
    }

    const item = {
      name: form.name.trim(),
      quantity,
      unit: form.unit,
      expiryDate: new Date(`${form.expiryDate}T00:00:00`),
      category: form.category,
    };

    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        const updated = await inventoryService.update(editingId, item);
        setItems((current) => current.map((entry) => entry.id === editingId ? updated : entry));
      } else {
        const created = await inventoryService.create(item);
        setItems((current) => [...current, created].sort(
          (a, b) => a.expiryDate.getTime() - b.expiryDate.getTime(),
        ));
      }
      resetForm();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save this item.");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (item: FoodItem) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      quantity: String(item.quantity),
      unit: item.unit,
      expiryDate: item.expiryDate.toISOString().slice(0, 10),
      category: item.category,
    });
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeItem = async (id: string) => {
    if (!window.confirm("Remove this item from your inventory?")) return;
    setDeletingId(id);
    setError(null);
    try {
      await inventoryService.delete(id);
      setItems((current) => current.filter((item) => item.id !== id));
      if (editingId === id) resetForm();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete this item.");
    } finally {
      setDeletingId(null);
    }
  };

  const expiringCount = items.filter((item) => {
    const days = Math.ceil((item.expiryDate.getTime() - new Date().setHours(0, 0, 0, 0)) / 86_400_000);
    return days >= 0 && days <= 3;
  }).length;

  return (
    <main className="shelf-page">
      <header className="page-header">
        <div className="brand-lockup"><span className="brand-mark">S</span><span>ShelfLife</span></div>
        <span className="header-note">A little less waste, one shelf at a time.</span>
      </header>

      <section className="welcome">
        <p className="eyebrow">YOUR KITCHEN, IN THE KNOW</p>
        <h1>Make room for <em>fresh starts.</em></h1>
        <p className="welcome-copy">Keep track of what you have, see what needs using and make every grocery shop count.</p>
      </section>

      <section className="summary-grid" aria-label="Inventory summary">
        <article className="summary-card"><span className="summary-label">IN YOUR INVENTORY</span><strong>{items.length}</strong><span>items tracked</span></article>
        <article className="summary-card summary-alert"><span className="summary-label">USE SOON</span><strong>{expiringCount}</strong><span>expiring in the next 3 days</span></article>
        <article className="summary-card"><span className="summary-label">STORAGE SPOTS</span><strong>{new Set(items.map((item) => item.category)).size}</strong><span>areas in use</span></article>
      </section>

      <section className="workspace">
        <div className="form-panel">
          <div className="section-heading">
            <div><p className="eyebrow">{editingId ? "UPDATE YOUR FOOD" : "KEEP YOUR SHELVES UP TO DATE"}</p><h2>{editingId ? "Edit an item" : "Add to your inventory"}</h2></div>
            <span className="heading-sparkle" aria-hidden="true">✳</span>
          </div>
          <form onSubmit={submitItem} className="inventory-form">
            <label>Food name<input required maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Fresh milk" /></label>
            <div className="form-row">
              <label>Quantity<input required type="number" min="0.001" step="0.001" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} /></label>
              <label>Unit<select value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value as Unit })}><option value={Unit.COUNT}>Count</option><option value={Unit.GRAM}>Grams (g)</option><option value={Unit.KILOGRAM}>Kilograms (kg)</option><option value={Unit.MILLILITER}>Millilitres (ml)</option><option value={Unit.LITER}>Litres (l)</option></select></label>
            </div>
            <label>Best before / expiry date<input required type="date" value={form.expiryDate} onChange={(event) => setForm({ ...form, expiryDate: event.target.value })} /></label>
            <label>Where do you keep it?<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as Category })}><option value="fridge">Fridge</option><option value="pantry">Pantry</option><option value="freezer">Freezer</option></select></label>
            <div className="form-actions"><button className="primary-button" type="submit" disabled={saving}>{saving ? "Saving…" : editingId ? "Save changes" : "Add to shelf"} <span aria-hidden="true">↗</span></button>{editingId && <button className="secondary-button" type="button" onClick={resetForm}>Cancel</button>}</div>
          </form>
        </div>

        <div className="inventory-panel">
          <div className="section-heading inventory-heading"><div><p className="eyebrow">WHAT'S ON YOUR SHELVES</p><h2>Your inventory</h2></div><span className="item-count">{items.length} {items.length === 1 ? "item" : "items"}</span></div>
          <div className="filter-row" aria-label="Filter inventory">
            {(["all", "fridge", "pantry", "freezer"] as Filter[]).map((value) => <button key={value} type="button" className={filter === value ? "filter-chip active" : "filter-chip"} onClick={() => setFilter(value)}>{value === "all" ? "Everything" : value[0].toUpperCase() + value.slice(1)}</button>)}
          </div>

          {error && <div className="error-banner" role="alert"><span>{error}</span><button type="button" onClick={() => setError(null)} aria-label="Dismiss error">×</button></div>}
          {loading ? <div className="empty-state"><span className="loading-dot" /> Loading your inventory…</div> :
            visibleItems.length === 0 ? <div className="empty-state"><span className="empty-illustration" aria-hidden="true">🥬</span><h3>{items.length === 0 ? "Your shelves are ready." : "Nothing in this section yet."}</h3><p>{items.length === 0 ? "Add your first food item and we'll help you keep an eye on freshness." : "Try another storage filter to see your food."}</p></div> :
            <div className="food-list">{visibleItems.map((item) => <FoodCard key={item.id} item={item} onEdit={startEditing} onDelete={removeItem} deleting={deletingId === item.id} />)}</div>}
        </div>
      </section>
      <footer className="page-footer"><span>Thoughtful kitchens start with what you already have.</span><span>© ShelfLife</span></footer>
    </main>
  );
};
