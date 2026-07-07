import { useEffect, useState } from "react";

import { KitchenGrid } from "../../components/kitchen";
import EmptyState from "../../components/layout/EmptyState";
import { fetchRestaurants } from "../../services/restaurantService";
import { defaultKitchenFilters } from "../../utils/filterKitchenGridItems";

function KitchenSection({ filters = defaultKitchenFilters }) {
  const [kitchens, setKitchens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadKitchens() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetchRestaurants({
          sort: filters.sort,
          minRating: filters.rating || undefined,
          categories: filters.categories.length > 0 ? filters.categories.join(",") : undefined,
          tags: filters.tags.length > 0 ? filters.tags.join(",") : undefined,
        });

        if (!ignore) {
          setKitchens(response.data ?? []);
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

    loadKitchens();

    return () => {
      ignore = true;
    };
  }, [filters]);

  return (
    <div
      className="py-6 pb-12"
      style={{ background: "#f4f4f6" }}
    >
      <h2 className="text-2xl font-bold px-4 mb-4">
        Popular Kitchens Near You
      </h2>

      {isLoading ? (
        <p className="px-4 text-sm text-slate-600">Loading kitchens...</p>
      ) : null}

      {error ? (
        <p className="px-4 text-sm text-red-600">{error}</p>
      ) : null}

      {!isLoading && !error && kitchens.length > 0 ? (
        <KitchenGrid kitchens={kitchens} />
      ) : null}

      {!isLoading && !error && kitchens.length === 0 ? (
        <div className="px-4">
          <EmptyState />
        </div>
      ) : null}
    </div>
  );
}

export default KitchenSection;
