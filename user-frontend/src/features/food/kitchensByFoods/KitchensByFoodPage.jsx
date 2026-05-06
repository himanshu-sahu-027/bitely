import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import KitchenGrid from "../../../components/kitchen/KitchenGrid";
import FilteredKitchensByFood from "./FilteredKitchensByFood";
import foods from "../../../data/foods";  
import CategoryFilter from "../../../components/filters/CategoryFilter";

const defaultFilters = {
  sort: "popularity",
  categories: [],
  rating: 0,
  tags: [],
};

export default function KitchensByFoodPage() {
  const [filters, setFilters] = useState(defaultFilters);
  // Read the food slug (food name) from the current route
  const { slug } = useParams();

  // find food using slug
  const food = foods.find((f) => f.slug === slug);

  // if food not found
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

  // Build the kitchen list that can serve the selected food.
  const kitchens = useMemo(
    () => FilteredKitchensByFood({ foodId: food.id, filters }),
    [food.id, filters],
  );

  return (
    <div
      style={{
        
        minHeight: "100vh",
        background: "linear-gradient(180deg, #eaecf5, #e4e9ef)",
      }}
    >
        <CategoryFilter onFilterChange={setFilters} />
      <p className="ml-5 text-3xl font-semibold tracking-[0.04em] text-black py-3 ">
        Kitchens serving {food.name}
      </p>
      <KitchenGrid kitchens={kitchens} />
    </div>
  );
}
