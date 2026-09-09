import { formatDate, formatPrice } from "../../lib/formatters";

export function ProductCard({ product, categoryName, onEdit, onDelete }) {
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