import { Store, UtensilsCrossed } from "lucide-react";

function SearchResultDropdown({
  loading,
  query,
  results,
  onFoodClick,
  onKitchenClick,
}) {
  const noResults =
    !loading &&
    query &&
    results.foods.length === 0 &&
    results.kitchens.length === 0;

  if (!query) return null;

  return (
    <div className="absolute top-full left-0 mt-2 w-full bg-gray-100 rounded-xl shadow-xl border z-50 max-h-[400px] overflow-y-auto">
      {loading && (
        <div className="p-4 text-center text-gray-500">Searching... </div>
      )}
      
      {!loading && (
        <>
          {results.foods.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase border-b">
                Foods
              </div>

              {results.foods.map((food) => (
                <button
                  key={food._id}
                  onClick={() => onFoodClick(food)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
                >
                  <UtensilsCrossed size={18} />
                  <span>{food.name}</span>
                </button>
              ))}
            </div>
          )}

          {results.kitchens.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase border-y">
                Kitchens
              </div>

              {results.kitchens.map((kitchen) => (
                <button
                  key={kitchen._id}
                  onClick={() => onKitchenClick(kitchen)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
                >
                  <Store size={18} />
                  <span>{kitchen.name}</span>
                </button>
              ))}
            </div>
          )}

          {noResults && (
            <div className="p-4 text-center text-gray-500">
              No foods or kitchens found
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SearchResultDropdown;
