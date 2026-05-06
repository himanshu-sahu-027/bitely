import "./ratingfilter.css";

const ratingStops = [
  { value: 0, label: "Any" },
  { value: 3.5, label: "3.5" },
  { value: 4, label: "4.0" },
  { value: 4.5, label: "4.5" },
  { value: 5, label: "5.0" },
];

function RatingFilter({ filters, setFilters }) {
  const selectedIndex = Math.max(
    0,
    ratingStops.findIndex((stop) => stop.value === filters.rating)
  );

  const activeIndex = selectedIndex === -1 ? 0 : selectedIndex;
  const selectedStop = ratingStops[activeIndex];

  const changeRatingByIndex = (index) => {
    setFilters({ ...filters, rating: ratingStops[index].value });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-sky-50 p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
          Rating
        </p>
        <p className="mt-2 text-lg font-semibold text-slate-800">
          {selectedStop.value === 0 ? "Any" : `${selectedStop.label}+`}
        </p>
      </div>

      <div className="rating-filter-scale">
        <div className="rating-filter-track" />

        {activeIndex > 0 && (
          <div
            className="rating-filter-fill"
            style={{
              left: `${(activeIndex / (ratingStops.length - 1)) * 100}%`,
              width: `${((ratingStops.length - 1 - activeIndex) / (ratingStops.length - 1)) * 100}%`,
            }}
          />
        )}

        <div className="rating-filter-marks">
          {ratingStops.map((stop, index) => {
            const isInActiveRange = activeIndex > 0 && index >= activeIndex;
            const isActiveStart = index === activeIndex;

            return (
              <button
                key={stop.label}
                type="button"
                className="rating-filter-mark"
                style={{ left: `${(index / (ratingStops.length - 1)) * 100}%` }}
                onClick={() => changeRatingByIndex(index)}
              >
                <span
                  className={`rating-filter-dot ${
                    isInActiveRange ? "rating-filter-dot-active" : ""
                  } ${isActiveStart ? "rating-filter-dot-current" : ""}`}
                />
                <span
                  className={`rating-filter-label ${
                    isInActiveRange ? "rating-filter-label-active" : ""
                  }`}
                >
                  {stop.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RatingFilter;
