import { useState } from "react";

function CategoryMenu({ categories, onSelect }) {
  const [activeCategory, setActiveCategory] = useState(categories?.[0]);

  const handleClick = (category) => {
    setActiveCategory(category);
    if (onSelect) {
      onSelect(category);
    }
  };

  return (
    <div className="flex gap-3 overflow-x-auto px-4 py-3 bg-white shadow-sm sticky top-0 z-10">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => handleClick(category)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition
          ${
            activeCategory === category
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

export default CategoryMenu;