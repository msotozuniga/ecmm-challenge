import CatalogueClient from "../components/catalogue/CatalogueClient";
import { getCategories, getErrorMessage, getProducts } from "../lib/api";

const PAGE_SIZE = 6;

function getQueryValue(value) {
  return Array.isArray(value) ? value[0] : value || "";
}

function getPage(value) {
  const page = Number.parseInt(getQueryValue(value), 10);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const filters = {
    name: getQueryValue(params?.name).trim(),
    category: getQueryValue(params?.category),
    page: getPage(params?.page),
  };

  let categories = [];
  let products = [];
  let count = 0;
  let error = "";

  try {
    const [categoryData, productData] = await Promise.all([
      getCategories(),
      getProducts({
        page: filters.page,
        pageSize: PAGE_SIZE,
        name: filters.name,
        categoryId: filters.category,
      }),
    ]);
    categories = Array.isArray(categoryData) ? categoryData : categoryData?.results || [];
    products = productData?.results || [];
    count = productData?.count || 0;
  } catch (fetchError) {
    error = getErrorMessage(fetchError);
  }

  return (
    <CatalogueClient
      initialCategories={categories}
      initialProducts={products}
      initialCount={count}
      initialFilters={filters}
      initialError={error}
    />
  );
}