const quickTagOptions = [
  { key: "veg", label: "Pure Veg" },
  { key: "nonveg", label: "Non Veg" },
];

function QuickTagFilters({ filters, updateFilters }) {

  const toggleTag = (tag) => {
    const nextTags = filters.tags.includes(tag) ? [] : [tag];

    updateFilters({
      ...filters,
      tags: nextTags,
    });
  };

  return (
    <>
      {quickTagOptions.map((option) => {
        const active = filters.tags.includes(option.key);

        return (
          <button
            key={option.key}
            onClick={() => toggleTag(option.key)}
            className={`rounded-lg border px-4 py-1 ${
              active
                ? "border-cyan-200 bg-gradient-to-r from-cyan-50 via-sky-50 to-blue-100 text-sky-800"
                : "bg-white text-slate-700"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </>
  );
}

export default QuickTagFilters;