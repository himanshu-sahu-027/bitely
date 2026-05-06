import { Filter } from "lucide-react";

function FilterButton({ count, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg border bg-white px-4 py-1"
    >
      {count > 0 ? (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 px-1.5 text-xs font-semibold text-white">
          {count}
        </span>
      ) : (
        <Filter size={16} />
      )}

      Filters
    </button>
  );
}

export default FilterButton;