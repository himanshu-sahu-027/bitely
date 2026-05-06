import { useState } from "react";

import {
  HeroSection,
  FoodSection,
  KitchenSection,
} from ".";
import CategoryFilter from "../../components/filters/CategoryFilter";
import { defaultKitchenFilters } from "../../utils/filterKitchenGridItems";

function Home() {
  const [filters, setFilters] = useState(defaultKitchenFilters);

  return (
    <div>
      <HeroSection />
      <CategoryFilter onFilterChange={setFilters} />
      <FoodSection />
      <KitchenSection filters={filters} />
    </div>
  );
}

export default Home;
