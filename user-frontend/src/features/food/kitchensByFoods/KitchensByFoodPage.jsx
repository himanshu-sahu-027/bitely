import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import KitchenGrid from "../../../components/kitchen/KitchenGrid";
import CategoryFilter from "../../../components/filters/CategoryFilter";
import {
  fetchFoodCategories,
  fetchFoods,
  fetchRestaurantsByFood,
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
  const [food, setFood] = useState(null);
  const { slug } = useParams();

  useEffect(() => {
    let ignore = false;

    async function loadPageData() {
      setIsLoading(true);
      setError("");

      try {
        const [categoriesResponse, foodsResponse] = await Promise.all([
          fetchFoodCategories(),
          fetchFoods({ slug }),
        ]);
        const matchedFood = foodsResponse.data?.[0] ?? null;

        if (!matchedFood) {
          throw new Error("Food not found");
        }

        const kitchensResponse = await fetchRestaurantsByFood(matchedFood.id, {
          sort: filters.sort,
          minRating: filters.rating || undefined,
          categories: filters.categories.length > 0 ? filters.categories.join(",") : undefined,
          tags: filters.tags.length > 0 ? filters.tags.join(",") : undefined,
        });

        if (!ignore) {
          setCategories(categoriesResponse.data ?? []);
          setFood(matchedFood);
          setKitchens(kitchensResponse.data ?? []);
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

  if (!food) {
    return (
      <div
        style={{
          padding: "20px",
          minHeight: "100vh",
          background: "linear-gradient(180deg, #eaecf5, #e4e9ef)",
        }}
      >
        <h1>Food not found</h1>
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
        Kitchens serving {food.name}
      </p>
      {isLoading ? <p className="px-5 text-sm text-slate-600">Loading kitchens...</p> : null}
      {error ? <p className="px-5 text-sm text-red-600">{error}</p> : null}
      {!isLoading && !error ? <KitchenGrid kitchens={kitchens} /> : null}
    </div>
  );
}
