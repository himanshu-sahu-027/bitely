function CategorySelector({ categories = [], filters, setFilters }) {
  const toggleCategory = (slug) => {
    const exists = filters.categories.includes(slug);

    if (exists) {
      setFilters({
        ...filters,
        categories: filters.categories.filter(c => c !== slug)
      });
    } else {
      setFilters({
        ...filters,
        categories: [...filters.categories, slug]
      });
    }
  };

  return (
    <div className="space-y-3">
      {categories.map((cat) => (
        <label key={cat.id} className="flex gap-2 text-slate-700">

          <input
            type="checkbox"
            checked={filters.categories.includes(cat.slug)}
            onChange={() => toggleCategory(cat.slug)}
            className="mt-1 h-4 w-4 accent-indigo-700"
          />

          {cat.name}
        </label>
      ))}
    </div>
  );
}

export default CategorySelector;
