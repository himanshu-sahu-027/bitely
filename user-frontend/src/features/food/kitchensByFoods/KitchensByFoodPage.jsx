import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import KitchenGrid from "../../../components/kitchen/KitchenGrid";
import CategoryFilter from "../../../components/filters/CategoryFilter";
import EmptyState from "../../../components/layout/EmptyState";
import {
  fetchFoodCategories,
  fetchRestaurantsByFood,
  fetchRestaurantsByMenu,
} from "../../../services/restaurantService";

const defaultFilters = {
  sort: "popularity",
  categories: [],
  rating: 0,
  tags: [],
};

export default function KitchensByFoodPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [kitchens, setKitchens] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [itemName, setItemName] = useState(null);
  const { slug } = useParams();

  useEffect(() => {
    let ignore = false;

    async function loadPageData() {
      setIsLoading(true);
      setError("");

      try {
        const [categoriesResponse] = await Promise.all([fetchFoodCategories()]);

        const kitchensResponse = await fetchRestaurantsByMenu(slug, {
          sort: filters.sort,
          minRating: filters.rating || undefined,
          categories:
            filters.categories.length > 0
              ? filters.categories.join(",")
              : undefined,
          tags: filters.tags.length > 0 ? filters.tags.join(",") : undefined,
        });

        if (!ignore) {
          setCategories(categoriesResponse.data ?? []);
          
          setItemName(kitchensResponse.menu?.name ?? "Selected menu");

          setKitchens(kitchensResponse.kitchens ?? []);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadPageData();

    return () => {
      ignore = true;
    };
  }, [filters, slug]);

  if (!kitchens || (kitchens.length === 0 && isLoading === false)) {
    return (
      <div
        style={{
          padding: "20px",
          minHeight: "100vh",
          background: "linear-gradient(180deg, #eaecf5, #e4e9ef)",
        }}
      >
        <h1>Item not found</h1>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #eaecf5, #e4e9ef)",
      }}
    >
      <CategoryFilter categories={categories} onFilterChange={setFilters} />
      <p className="ml-5 text-3xl font-semibold tracking-[0.04em] text-black py-3 ">
        Kitchens serving {itemName ?? "Selected menu"}
      </p>
      {isLoading ? (
        <p className="px-5 text-sm text-slate-600">Loading kitchens...</p>
      ) : null}
      {error ? <p className="px-5 text-sm text-red-600">{error}</p> : null}
      {!isLoading && !error ? (
        kitchens.length > 0 ? (
          <KitchenGrid kitchens={kitchens} />
        ) : (
          <div className="px-5 py-8">
            <EmptyState />
          </div>
        )
      ) : null}
    </div>
  );
}
