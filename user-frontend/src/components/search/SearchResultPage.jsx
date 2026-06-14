import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Store, UtensilsCrossed } from "lucide-react";

import { searchFoodsAndKitchens } from "../../services/searchService";

function SearchResultsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const query = searchParams.get("q") || "";

  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("all");

  const [results, setResults] = useState({
    foods: [],
    kitchens: [],
  });

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults({
          foods: [],
          kitchens: [],
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const data = await searchFoodsAndKitchens(query);

        setResults(data);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Searching...</h1>
      </div>
    );
  }

  const totalResults =
    results.foods.length + results.kitchens.length;

  const displayedResults =
    activeTab === "foods"
      ? results.foods.length
      : activeTab === "kitchens"
        ? results.kitchens.length
        : totalResults;

  const noResults =
    results.foods.length === 0 &&
    results.kitchens.length === 0;

  const showFoodSection =
    (activeTab === "all" || activeTab === "foods") &&
    results.foods.length > 0;

  const showKitchenSection =
    (activeTab === "all" || activeTab === "kitchens") &&
    results.kitchens.length > 0;

  const activeTabHasNoResults =
    activeTab === "foods"
      ? results.foods.length === 0
      : activeTab === "kitchens"
        ? results.kitchens.length === 0
        : false;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2 text-blue-900">
          <Search className="w-6 h-6" />

          <h1 className="text-3xl font-bold ">
            Search Results ({displayedResults})
          </h1>
        </div>

        {query && (
          <p className="text-gray-500">
            Showing results for{" "}
            <span className="font-medium">"{query}"</span>
          </p>
        )}

        <div className="flex gap-3 mt-6">
          {["all", "foods", "kitchens"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100"
              }`}
            >
              {tab === "all"
                ? "All"
                : tab.charAt(0).toUpperCase() +
                  tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {noResults && (
        <div className="bg-white rounded-xl shadow-sm border p-10 text-center">
          <h2 className="text-xl font-semibold mb-2">
            No results found
          </h2>

          <p className="text-gray-500">
            Try searching with a different keyword.
          </p>
        </div>
      )}

      {activeTabHasNoResults && (
        <div className="bg-white border rounded-xl p-8 text-center">
          No {activeTab} found for "{query}"
        </div>
      )}

      {showFoodSection && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <UtensilsCrossed />

            <h2 className="text-2xl font-semibold">Foods</h2>

            <span className="text-gray-500">
              ({results.foods.length})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.foods.map((food) => (
              <div
                key={food._id}
                className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-pointer"
                onClick={() =>
                  navigate(
                    `/food/${food.slug || food._id}`
                  )
                }
              >
                <h3 className="font-semibold text-lg">
                  {food.name}
                </h3>

                {food.description && (
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {food.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {showKitchenSection && (
        <section>
          <div className="flex items-center gap-2 mb-5">
            <Store />

            <h2 className="text-2xl font-semibold">Kitchens</h2>

            <span className="text-gray-500">
              ({results.kitchens.length})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.kitchens.map((kitchen) => (
              <div
                key={kitchen._id}
                className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-pointer"
                onClick={() =>
                  navigate(`/kitchen/${kitchen._id}`)
                }
              >
                <h3 className="font-semibold text-lg">
                  {kitchen.name}
                </h3>

                {kitchen.address && (
                  <p className="text-sm text-gray-500 mt-2">
                    {kitchen.address}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default SearchResultsPage;
