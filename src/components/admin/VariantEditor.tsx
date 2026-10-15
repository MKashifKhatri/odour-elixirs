"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import type { ProductVariant } from "@/lib/types";

type VariantEditorProps = {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
};

function stockLabel(variant: ProductVariant) {
  if (!variant.is_active) return { text: "Inactive", state: "inactive" };
  const quantity = Number(variant.stock_quantity ?? variant.stock ?? 0);
  if (quantity === 0) return { text: "Out of stock", state: "empty" };
  if (quantity <= 5) return { text: `Only ${quantity} left`, state: "low" };
  return { text: "In stock", state: "available" };
}

export default function VariantEditor({ variants, onChange }: VariantEditorProps) {
  const [sizeInput, setSizeInput] = useState("");
  const [sizeError, setSizeError] = useState("");
  const [activeId, setActiveId] = useState(variants[0]?.id || "");
  const sizeInputRef = useRef<HTMLInputElement>(null);
  const activeVariant = useMemo(() => variants.find((variant) => variant.id === activeId) || variants[0], [activeId, variants]);

  useEffect(() => {
    if (!activeId && variants[0]?.id) setActiveId(variants[0].id);
    if (activeId && !variants.some((variant) => variant.id === activeId)) setActiveId(variants[0]?.id || "");
  }, [activeId, variants]);

  const updateActive = (updates: Partial<ProductVariant>) => {
    if (!activeVariant) return;
    onChange(variants.map((variant) => variant.id === activeVariant.id ? { ...variant, ...updates } : variant));
  };

  const addSize = () => {
    const sizeMl = Number(sizeInput.trim());
    if (!sizeInput.trim() || !Number.isFinite(sizeMl) || sizeMl <= 0) {
      setSizeError("Enter a size greater than 0.");
      return;
    }
    if (variants.some((variant) => Number(variant.size_ml) === sizeMl || variant.size.trim().toLowerCase() === `${sizeMl} ml`.toLowerCase())) {
      setSizeError("That size is already added.");
      return;
    }

    const id = crypto.randomUUID();
    const size = `${sizeInput.trim()} ml`;
    onChange([...variants, { id, size, size_ml: sizeMl, color: "", cost_price: 0, selling_price: 0, stock_quantity: 0, sku: "", is_active: true }]);
    setActiveId(id);
    setSizeInput("");
    setSizeError("");
  };

  const removeVariant = (id: string) => {
    const next = variants.filter((variant) => variant.id !== id);
    onChange(next);
    if (activeId === id) setActiveId(next[0]?.id || "");
  };

  const changeStock = (raw: string) => {
    const quantity = raw === "" ? 0 : Number(raw);
    if (Number.isInteger(quantity) && quantity >= 0) updateActive({ stock_quantity: quantity });
  };

  const status = activeVariant ? stockLabel(activeVariant) : null;
  const stock = Number(activeVariant?.stock_quantity ?? activeVariant?.stock ?? 0);

  return (
    <section className="oe-variant-editor" aria-labelledby="variant-editor-title">
      <header className="oe-variant-editor-heading">
        <div>
          <p className="oe-admin-eyebrow">Inventory</p>
          <h3 id="variant-editor-title">Sizes</h3>
          <p>Add the sizes you sell</p>
        </div>
      </header>

      <form className="oe-variant-size-form" onSubmit={(event) => { event.preventDefault(); addSize(); }}>
        <label className="sr-only" htmlFor="new-variant-size">Enter size in ml</label>
        <input
          ref={sizeInputRef}
          id="new-variant-size"
          type="number"
          min="0.1"
          step="any"
          inputMode="decimal"
          placeholder="Enter size in ml"
          value={sizeInput}
          aria-describedby={sizeError ? "variant-size-error" : undefined}
          onChange={(event) => { setSizeInput(event.target.value); setSizeError(""); }}
        />
        <span aria-hidden="true">ml</span>
        <button type="submit" className="oe-variant-add-button"><Plus size={17} aria-hidden="true" />Add size</button>
      </form>
      {sizeError && <p className="oe-variant-error" id="variant-size-error" role="alert">{sizeError}</p>}

      {variants.length > 0 && <div className="oe-variant-options" role="group" aria-label="Product sizes">
        {variants.map((variant) => {
          const variantStatus = stockLabel(variant);
          return <div className="oe-variant-pill-wrap" key={variant.id || variant.size}>
            <button type="button" className={`oe-variant-pill${activeVariant?.id === variant.id ? " is-selected" : ""}`} aria-pressed={activeVariant?.id === variant.id} onClick={() => setActiveId(variant.id || "")}>
              {variant.size}
              <span className={`oe-variant-pill-status is-${variantStatus.state}`} aria-label={variantStatus.text} />
            </button>
            <button type="button" className="oe-variant-remove" aria-label={`Remove ${variant.size}`} onClick={() => removeVariant(variant.id || "")}><X size={14} aria-hidden="true" /></button>
          </div>;
        })}
      </div>}

      <button type="button" className="oe-variant-add-another" onClick={() => { setSizeError(""); sizeInputRef.current?.focus(); }}><Plus size={16} aria-hidden="true" />Add another size</button>

      {activeVariant && status && <section className="oe-variant-detail" aria-label={`${activeVariant.size} variant details`}>
        <div className="oe-variant-detail-heading"><div><h4>{activeVariant.size}</h4><p className={`oe-variant-stock is-${status.state}`}><span aria-hidden="true" />{status.text}</p></div><label className="oe-variant-active"><input type="checkbox" checked={activeVariant.is_active !== false} onChange={(event) => updateActive({ is_active: event.target.checked })} /><span>Active</span></label></div>
        <div className="oe-variant-price-grid">
          <label>Cost price<input aria-label={`${activeVariant.size} cost price`} type="number" min="0" step="0.01" value={activeVariant.cost_price ?? 0} onChange={(event) => updateActive({ cost_price: Math.max(0, Number(event.target.value) || 0) })} /></label>
          <label>Selling price<input aria-label={`${activeVariant.size} selling price`} type="number" min="0.01" step="0.01" value={activeVariant.selling_price ?? 0} onChange={(event) => updateActive({ selling_price: Math.max(0, Number(event.target.value) || 0) })} /></label>
        </div>
        <div className="oe-variant-inventory-row">
          <label htmlFor={`stock-${activeVariant.id}`}>Stock quantity</label>
          <div className="oe-stock-stepper">
            <button type="button" aria-label="Decrease stock quantity" disabled={stock <= 0} onClick={() => changeStock(String(stock - 1))}><Minus size={16} aria-hidden="true" /></button>
            <input id={`stock-${activeVariant.id}`} aria-label={`${activeVariant.size} stock quantity`} type="number" min="0" step="1" inputMode="numeric" value={stock} onChange={(event) => changeStock(event.target.value)} />
            <button type="button" aria-label="Increase stock quantity" onClick={() => changeStock(String(stock + 1))}><Plus size={16} aria-hidden="true" /></button>
          </div>
        </div>
        <label className="oe-variant-sku">SKU / Variant ID<input aria-label={`${activeVariant.size} SKU`} type="text" value={activeVariant.sku || ""} onChange={(event) => updateActive({ sku: event.target.value })} placeholder="Optional" /></label>
      </section>}
    </section>
  );
}