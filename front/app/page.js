"use client";

import { useEffect, useState } from "react";
import {
  createProduct,
  deleteProduct,
  getCategories,
  getErrorMessage,
  getProducts,
  updateProduct,
} from "../lib/api";

const DEFAULT_PAGE_SIZE = 12;
const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category_id: "",
};

function formatPrice(price) {
  return Number(price).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  });
}

function formatDate(date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(date));
}

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

function ProductCard({ product, categoryName, onEdit, onDelete }) {
  return (
    <article className="product-card">
      <div className="product-card__topline">
        <span className="category-tag">{categoryName || "Uncategorized"}</span>
        <span className="product-card__date">{formatDate(product.created_at)}</span>
      </div>
      <h2>{product.name}</h2>
      <p className="product-card__description">{product.description || "No description provided."}</p>
      <div className="product-card__facts">
        <div><span>Price</span><strong>${formatPrice(product.price)}</strong></div>
        <div><span>Stock</span><strong>{product.stock}</strong></div>
      </div>
      <div className="product-card__actions">
        <button className="button button--secondary" type="button" onClick={() => onEdit(product)}>Edit</button>
        <button className="button button--danger" type="button" onClick={() => onDelete(product)}>Delete</button>
      </div>
    </article>
  );
}

function ProductModal({ product, categories, saving, error, onClose, onSubmit }) {
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

function DeleteDialog({ product, deleting, error, onClose, onConfirm }) {
  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal modal--compact" role="alertdialog" aria-modal="true" aria-labelledby="delete-title">
        <p className="eyebrow">Permanent action</p><h2 id="delete-title">Delete {product.name}?</h2>
        <p className="modal__copy">This product will be removed from the catalogue. This action cannot be undone.</p>
        {error && <div className="alert alert--error">{error}</div>}
        <div className="modal__actions"><button className="button button--secondary" type="button" onClick={onClose} disabled={deleting}>Keep product</button><button className="button button--danger" type="button" onClick={onConfirm} disabled={deleting}>{deleting ? "Deleting..." : "Delete product"}</button></div>
      </section>
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [debouncedName, setDebouncedName] = useState("");
  const [debouncedCategoryId, setDebouncedCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [pageError, setPageError] = useState("");
  const [modalProduct, setModalProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [mutationError, setMutationError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.max(1, Math.ceil(count / DEFAULT_PAGE_SIZE));
  const filtersLoading = loadingProducts || loadingCategories;

  useEffect(() => {
    let active = true;
    getCategories().then((data) => active && setCategories(Array.isArray(data) ? data : data.results || [])).catch((error) => active && setPageError(getErrorMessage(error))).finally(() => active && setLoadingCategories(false));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedName(name);
      setDebouncedCategoryId(categoryId);
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [name, categoryId]);

  useEffect(() => {
    let active = true;
    const timeout = window.setTimeout(() => {
      setLoadingProducts(true);
      setPageError("");
      getProducts({ page, pageSize: DEFAULT_PAGE_SIZE, name: debouncedName, categoryId: debouncedCategoryId }).then((data) => {
        if (!active) return;
        setProducts(data.results || []);
        setCount(data.count || 0);
        const availablePages = Math.max(1, Math.ceil((data.count || 0) / DEFAULT_PAGE_SIZE));
        if (page > availablePages) setPage(availablePages);
      }).catch((error) => active && setPageError(getErrorMessage(error))).finally(() => active && setLoadingProducts(false));
    }, 0);
    return () => { active = false; window.clearTimeout(timeout); };
  }, [page, debouncedName, debouncedCategoryId]);

  function categoryName(category) {
    return categories.find((item) => String(item.id) === String(category))?.name;
  }

  async function saveProduct(form) {
    setSaving(true); setMutationError("");
    try {
      if (modalProduct) await updateProduct(modalProduct.id, form); else await createProduct(form);
      setModalProduct(null);
      const data = await getProducts({ page, pageSize: DEFAULT_PAGE_SIZE, name, categoryId });
      setProducts(data.results || []); setCount(data.count || 0);
    } catch (error) { setMutationError(getErrorMessage(error)); }
    finally { setSaving(false); }
  }

  async function confirmDelete() {
    setDeleting(true); setMutationError("");
    try {
      await deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
      const data = await getProducts({ page, pageSize: DEFAULT_PAGE_SIZE, name, categoryId });
      setProducts(data.results || []); setCount(data.count || 0);
      const availablePages = Math.max(1, Math.ceil((data.count || 0) / DEFAULT_PAGE_SIZE));
      if (page > availablePages) setPage(availablePages);
    } catch (error) { setMutationError(getErrorMessage(error)); }
    finally { setDeleting(false); }
  }

  return (
    <main className="app-shell">
      <header className="topbar"><div className="topbar__inner"><span className="brand-mark">ED</span><span className="brand-name">ED Test</span></div></header>
      <section className="main-area">
        <div className="page-heading"><div><h1>Product catalogue</h1></div><button className="button button--primary button--add" type="button" onClick={() => { setMutationError(""); setModalProduct(false); }}><span aria-hidden="true">+</span> Add product</button></div>
        <section className="toolbar" aria-label="Product filters"><label className="search-field"><span className="search-icon" aria-hidden="true">⌕</span><span className="sr-only">Search products by name</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Search products" disabled={filtersLoading ? true : undefined} /></label><label className="select-field"><span className="sr-only">Filter by category</span><select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} disabled={filtersLoading ? true : undefined}><option value="">All categories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><span className="result-count">{count} {count === 1 ? "product" : "products"}</span></section>
        {pageError && <div className="alert alert--error page-alert">{pageError}</div>}
        <section className="products-area" aria-live="polite">{loadingProducts ? <div className="state-panel"><span className="spinner" /> Loading products...</div> : products.length === 0 ? <div className="state-panel"><strong>No products found</strong><span>Try another search or add your first product.</span></div> : <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} categoryName={categoryName(product.category_id)} onEdit={(item) => { setMutationError(""); setModalProduct(item); }} onDelete={(item) => { setMutationError(""); setDeleteTarget(item); }} />)}</div>}</section>
        <nav className="pagination" aria-label="Product pages"><span>Page {page} of {totalPages}</span><div><button type="button" className="page-button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1 || loadingProducts}>Previous</button><button type="button" className="page-button page-button--next" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages || loadingProducts}>Next <span aria-hidden="true">→</span></button></div></nav>
      </section>
      {modalProduct !== null && <ProductModal product={modalProduct || null} categories={categories} saving={saving} error={mutationError} onClose={() => setModalProduct(null)} onSubmit={saveProduct} />}
      {deleteTarget && <DeleteDialog product={deleteTarget} deleting={deleting} error={mutationError} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} />}
    </main>
  );
}

