import { useEffect, useState } from "react";
import { X } from "lucide-react";
import SortFilter from "./SortFilter";
import CategorySelector from "./CategorySelector";
import RatingFilter from "./RatingFilter";

function FilterModal({ close, applyFilters, filters: initialFilters }) {
  const [tab, setTab] = useState("sort");
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 "
      onClick={close}
    >
      <div
        className="flex h-[420px] w-[620px] flex-col overflow-hidden rounded-lg bg-white shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-3 border-b shrink-0">
          <h2 className="text-xl font-semibold">Filters</h2>
          <button onClick={close}>
            <X />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">

          {/* Sidebar */}
          <div className="w-1/3 border-r shrink-0 overflow-y-auto">

            <button
              onClick={() => setTab("sort")}
              className={`relative block w-full px-6 py-4 text-left transition ${
                tab === "sort"
                  ? "bg-sky-100 text-sky-800 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-cyan-400 before:to-pink-400"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              Sort by
            </button>

            <button
              onClick={() => setTab("categories")}
              className={`relative block w-full px-6 py-4 text-left transition ${
                tab === "categories"
                  ? "bg-sky-100 text-sky-800 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-cyan-400 before:to-pink-400"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              Categories
            </button>

            <button
              onClick={() => setTab("rating")}
              className={`relative block w-full px-6 py-4 text-left transition ${
                tab === "rating"
                  ? "bg-sky-100 text-sky-800 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-cyan-400 before:to-pink-400"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              Rating
            </button>

          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 overflow-y-auto p-6">

            {tab === "sort" && (
              <SortFilter filters={filters} setFilters={setFilters} />
            )}

            {tab === "categories" && (
              <CategorySelector filters={filters} setFilters={setFilters} />
            )}

            {tab === "rating" && (
              <RatingFilter filters={filters} setFilters={setFilters} />
            )}

          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-between px-6 py-4 border-t shrink-0">

          <button
            onClick={() => setFilters({ sort: "popularity", categories: [], rating: 0, tags: [] })}
          >
            Clear all
          </button>

          <button
            onClick={() => {
              applyFilters(filters);
              close();
            }}
            className="rounded-lg bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 px-5 py-2 text-white shadow-[0_10px_24px_rgba(59,130,246,0.25)] transition hover:opacity-90"
          >
            Apply
          </button>

        </div>

      </div>

    </div>
  );
}

export default FilterModal;
