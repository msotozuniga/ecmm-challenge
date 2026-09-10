const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

async function request(path, options = {}) {
  const response = await fetch(`${backendUrl}/api${path}`, {
    cache: "no-store",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { detail: text };
    }
  }

  if (!response.ok) {
    const error = new Error(data?.detail || "The request could not be completed.");
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data;
}

export function getErrorMessage(error) {
  if (!error?.payload || typeof error.payload !== "object") {
    return error?.message || "The request could not be completed.";
  }

  if (error.payload.detail) return error.payload.detail;

  return Object.entries(error.payload)
    .map(([field, messages]) => {
      const values = Array.isArray(messages) ? messages : [messages];
      return `${field}: ${values.join(", ")}`;
    })
    .join(" | ");
}

export function getProducts({ page, pageSize, name, categoryId }) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });

  if (name.trim()) params.set("name", name.trim());
  if (categoryId) params.set("category_id", categoryId);

  return request(`/products/?${params.toString()}`);
}

export function getCategories() {
  return request("/categories/");
}

export function createProduct(product) {
  return request("/products/", {
    method: "POST",
    body: JSON.stringify(product),
  });
}

export function updateProduct(id, product) {
  return request(`/products/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(product),
  });
}

export function deleteProduct(id) {
  return request(`/products/${id}/`, { method: "DELETE" });
}