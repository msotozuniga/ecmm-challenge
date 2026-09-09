"use client";

import { useState } from "react";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category_id: "",
};

function validateForm(form) {
  const errors = {};
  const name = form.name.trim();
  const price = form.price.trim();
  const stock = form.stock.trim();

  if (!name) errors.name = "Name is required.";
  else if (name.length > 100) errors.name = "Name must be 100 characters or fewer.";

  if (!price) errors.price = "Price is required.";
  else if (!/^\d+(\.\d{1,3})?$/.test(price) || Number(price) < 0) {
    errors.price = "Use a non-negative number with up to 3 decimals.";
  }

  if (!stock) errors.stock = "Stock is required.";
  else if (!/^\d+$/.test(stock)) errors.stock = "Stock must be a non-negative integer.";

  if (!form.category_id) errors.category_id = "Choose a category.";

  return errors;
}

export default function ProductModal({ product, categories, saving, error, onClose, onSubmit }) {
  const [form, setForm] = useState(() => product ? {
    name: product.name || "",
    description: product.description || "",
    price: String(product.price ?? ""),
    stock: String(product.stock ?? ""),
    category_id: String(product.category_id ?? ""),
  } : EMPTY_FORM);
  const [errors, setErrors] = useState({});

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function submit(event) {
    event.preventDefault();
    const validationErrors = validateForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      price: form.price.trim(),
      stock: Number(form.stock),
      category_id: Number(form.category_id),
    });
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
        <div className="modal__header">
          <div><p className="eyebrow">Catalogue record</p><h2 id="product-modal-title">{product ? "Edit product" : "Add product"}</h2></div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close modal"><span aria-hidden="true">&times;</span></button>
        </div>
        <form onSubmit={submit} noValidate>
          {error && <div className="alert alert--error">{error}</div>}
          <div className="form-grid">
            <label className="field field--wide"><span>Name</span><input name="name" value={form.name} onChange={updateField} disabled={saving} maxLength={100} autoFocus />{errors.name && <small>{errors.name}</small>}</label>
            <label className="field field--wide"><span>Description <em>Optional</em></span><textarea name="description" value={form.description} onChange={updateField} disabled={saving} rows={3} /></label>
            <label className="field"><span>Price</span><input name="price" value={form.price} onChange={updateField} disabled={saving} inputMode="decimal" placeholder="0.000" />{errors.price && <small>{errors.price}</small>}</label>
            <label className="field"><span>Stock</span><input name="stock" value={form.stock} onChange={updateField} disabled={saving} inputMode="numeric" />{errors.stock && <small>{errors.stock}</small>}</label>
            <label className="field field--wide"><span>Category</span><select name="category_id" value={form.category_id} onChange={updateField} disabled={saving}><option value="">Select a category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>{errors.category_id && <small>{errors.category_id}</small>}</label>
          </div>
          <div className="modal__actions"><button className="button button--secondary" type="button" onClick={onClose} disabled={saving}>Cancel</button><button className="button button--primary" type="submit" disabled={saving}>{saving ? "Saving..." : product ? "Save changes" : "Create product"}</button></div>
        </form>
      </section>
    </div>
  );
}