const sortOptions = [
  { value: "popularity", label: "Popularity" },
  { value: "rating", label: "Rating: High to Low" },
  { value: "priceLow", label: "Cost: Low to High" },
  { value: "priceHigh", label: "Cost: High to Low" },
];

function SortFilter({ filters, setFilters }) {
  const updateSort = (value) => {
    setFilters({ ...filters, sort: value });
  };

  return (
    <div className="space-y-4">
      {sortOptions.map((option) => {
        const isActive = filters.sort === option.value;

        return (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-3 text-lg text-slate-700"
          >
            <span
              className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                isActive ? "border-sky-500" : "border-slate-400"
              } border`}
            >
              <input
                type="radio"
                checked={isActive}
                onChange={() => updateSort(option.value)}
                className="sr-only"
              />
              <span
                className={`block h-[0.8rem] w-[0.8rem] rounded-full ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600"
                    : "bg-transparent"
                }`}
              />
            </span>

            <span>{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}

export default SortFilter;
