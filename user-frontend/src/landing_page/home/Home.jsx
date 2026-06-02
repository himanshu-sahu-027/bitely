import { useEffect, useState } from "react";

import {
  HeroSection,
  FoodSection,
  KitchenSection,
} from ".";
import CategoryFilter from "../../components/filters/CategoryFilter";
import { fetchFoodCategories } from "../../services/restaurantService";
import { defaultKitchenFilters } from "../../utils/filterKitchenGridItems";

function Home() {
  const [filters, setFilters] = useState(defaultKitchenFilters);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let ignore = false;

    fetchFoodCategories()
      .then((response) => {
        if (!ignore) {
          setCategories(response.data ?? []);
        }
      })
      .catch(() => {
        if (!ignore) {
          setCategories([]);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div>
      <HeroSection />
      <CategoryFilter categories={categories} onFilterChange={setFilters} />
      <FoodSection />
      <KitchenSection filters={filters} />
    </div>
  );
}

export default Home;
