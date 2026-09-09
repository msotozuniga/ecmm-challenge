"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  createProduct,
  deleteProduct,
  getErrorMessage,
  updateProduct,
} from "../../lib/api";
import { ProductCard } from "../products/ProductCard";
import ProductModal from "../products/ProductModal";
import Navbar from "../layout/Navbar";

const PAGE_SIZE = 6;

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

export default function CatalogueClient({ initialCategories, initialProducts, initialCount, initialFilters, initialError }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(initialFilters.name);
  const [categoryId, setCategoryId] = useState(initialFilters.category);
  const [modalState, setModalState] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [mutationError, setMutationError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const totalPages = Math.max(1, Math.ceil(initialCount / PAGE_SIZE));
  const categoryMap = Object.fromEntries(initialCategories.map((category) => [String(category.id), category.name]));
  const loadingProducts = isPending;

  const navigate = useCallback((params) => {
    const query = new URLSearchParams(window.location.search);
    Object.entries(params).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined || (value === 1 && key === "page")) query.delete(key);
      else query.set(key, String(value));
    });
    const search = query.toString();
    startTransition(() => router.replace(search ? `${pathname}?${search}` : pathname));
  }, [pathname, router]);

  useEffect(() => {
    if (name === initialFilters.name) return undefined;
    const timeout = window.setTimeout(() => navigate({ name: name.trim(), page: 1 }), 350);
    return () => window.clearTimeout(timeout);
  }, [initialFilters.name, name, navigate]);

  function changeCategory(value) {
    setCategoryId(value);
    navigate({ category: value, page: 1 });
  }

  function changePage(nextPage) {
    navigate({ page: nextPage });
  }

  async function saveProduct(form) {
    setSaving(true);
    setMutationError("");
    try {
      if (modalState.product) await updateProduct(modalState.product.id, form);
      else await createProduct(form);
      setModalState(null);
      startTransition(() => router.refresh());
    } catch (error) {
      setMutationError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    setMutationError("");
    try {
      await deleteProduct(deleteTarget.id);
      setDeleteTarget(null);
      startTransition(() => router.refresh());
    } catch (error) {
      setMutationError(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="app-shell">
      <Navbar />
      <section className="main-area">
        <div className="page-heading"><div><h1>Product catalogue</h1></div><button className="button button--primary button--add" type="button" onClick={() => { setMutationError(""); setModalState({ product: null }); }}><span aria-hidden="true">+</span> Add product</button></div>
        <section className="toolbar" aria-label="Product filters"><label className="search-field"><span className="search-icon" aria-hidden="true">⌕</span><span className="sr-only">Search products by name</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Search products" /></label><label className="select-field"><span className="sr-only">Filter by category</span><select value={categoryId} onChange={(event) => changeCategory(event.target.value)}><option value="">All categories</option>{initialCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><span className="result-count">{initialCount} {initialCount === 1 ? "product" : "products"}</span></section>
        {initialError && <div className="alert alert--error page-alert">{initialError}</div>}
        <section className="products-area" aria-live="polite" aria-busy={loadingProducts}>{initialProducts.length === 0 ? <div className="state-panel"><strong>No products found</strong><span>Try another search or add your first product.</span></div> : <div className="product-grid">{initialProducts.map((product) => <ProductCard key={product.id} product={product} categoryName={categoryMap[String(product.category_id)]} onEdit={(item) => { setMutationError(""); setModalState({ product: item }); }} onDelete={(item) => { setMutationError(""); setDeleteTarget(item); }} />)}</div>}</section>
        <nav className="pagination" aria-label="Product pages"><span>Page {initialFilters.page} of {totalPages}</span><div><button type="button" className="page-button" onClick={() => changePage(Math.max(1, initialFilters.page - 1))} disabled={initialFilters.page <= 1 || loadingProducts}>Previous</button><button type="button" className="page-button page-button--next" onClick={() => changePage(Math.min(totalPages, initialFilters.page + 1))} disabled={initialFilters.page >= totalPages || loadingProducts}>Next <span aria-hidden="true">→</span></button></div></nav>
      </section>
      {modalState && <ProductModal product={modalState.product} categories={initialCategories} saving={saving} error={mutationError} onClose={() => setModalState(null)} onSubmit={saveProduct} />}
      {deleteTarget && <DeleteDialog product={deleteTarget} deleting={deleting} error={mutationError} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} />}
    </main>
  );
}