import { useMemo, useState } from "react";

import FilterButton from "./FilterButton";
import FilterChips from "./FilterChips";
import QuickTagFilters from "./QuickTagFilters";
import FilterModal from "./filterModal/FilterModal";

import categories from "../../data/categories";

const defaultFilters = {
  sort: "popularity",
  categories: [],
  rating: 0,
  tags: [],
};

const sortLabels = {
  rating: "Top Rated",
  priceLow: "Cost: Low to High",
  priceHigh: "Cost: High to Low",
};

function CategoryFilter({ onFilterChange }) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);

  const appliedFilterCount =
    filters.categories.length +
    filters.tags.length +
    (filters.rating > 0 ? 1 : 0) +
    (filters.sort !== "popularity" ? 1 : 0);

  const updateFilters = (nextFilters) => {
    setFilters(nextFilters);
    onFilterChange?.(nextFilters);
  };

  const appliedFilterChips = useMemo(() => {
    const categoryMap = new Map(
      categories.map((c) => [c.slug, c.name])
    );

    const chips = [];

    if (filters.sort !== "popularity") {
      chips.push({
        key: "sort",
        label: sortLabels[filters.sort],
        onRemove: () =>
          updateFilters({ ...filters, sort: "popularity" }),
      });
    }

    if (filters.rating > 0) {
      chips.push({
        key: "rating",
        label: `Rating ${filters.rating}+`,
        onRemove: () =>
          updateFilters({ ...filters, rating: 0 }),
      });
    }

    filters.categories.forEach((slug) => {
      chips.push({
        key: slug,
        label: categoryMap.get(slug),
        onRemove: () =>
          updateFilters({
            ...filters,
            categories: filters.categories.filter((c) => c !== slug),
          }),
      });
    });

    return chips;
  }, [filters]);

  return (
    <>
      <div className="sticky top-[4.05rem] z-40 flex flex-wrap gap-3 bg-gray-100 px-4 py-2 shadow-sm">

        <FilterButton
          count={appliedFilterCount}
          onClick={() => setOpen(true)}
        />

        <FilterChips chips={appliedFilterChips} />

        <QuickTagFilters
          filters={filters}
          updateFilters={updateFilters}
        />

      </div>

      {open && (
        <FilterModal
          filters={filters}
          applyFilters={updateFilters}
          close={() => setOpen(false)}
        />
      )}
    </>
  );
}

export default CategoryFilter;
