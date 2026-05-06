import { useMemo } from "react";
import { KitchenGrid } from "../../components/kitchen"
import categories from "../../data/categories";
import foods from "../../data/foods";
import kitchens from "../../data/kitchens";
import menus from "../../data/menus";
import menuTagMap from "../../data/menuTagMap";
import menuTags from "../../data/menuTags";
import {
  applyKitchenGridFilters,
  buildKitchenFilterMetadata,
  defaultKitchenFilters,
} from "../../utils/filterKitchenGridItems";

function KitchenSection({ filters = defaultKitchenFilters }) {
  const kitchensWithFilterMetadata = useMemo(
    () =>
      buildKitchenFilterMetadata({
        kitchens,
        menus,
        foods,
        categories,
        menuTags,
        menuTagMap,
      }),
    [],
  );

  const visibleKitchens = useMemo(
    () => applyKitchenGridFilters(kitchensWithFilterMetadata, filters),
    [filters, kitchensWithFilterMetadata],
  );

  return (
    <div
      className="py-6 pb-12"
      style={{ background: "#f4f4f6" }}
    >
      <h2 className="text-2xl font-bold px-4 mb-4">
        Popular Kitchens Near You
      </h2>
      <KitchenGrid kitchens={visibleKitchens}/>
    </div>
  )
}

export default KitchenSection
