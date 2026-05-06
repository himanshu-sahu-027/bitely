function FilterChips({ chips }) {
  return (
    <>
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={chip.onRemove}
          className="flex items-center gap-2 rounded-lg border border-cyan-200 bg-gradient-to-r from-cyan-50 via-sky-50 to-blue-100 px-4 py-1 text-sky-800"
        >
          {chip.label}
        </button>
      ))}
    </>
  );
}

export default FilterChips;