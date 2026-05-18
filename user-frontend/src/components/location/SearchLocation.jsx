import { Search, LoaderCircle, MapPinned } from "lucide-react";
import { useState } from "react";

export default function SearchLocation({
  onSearch,
  results = [],
  isSearching,
  searchError,
  onResultSelect,
}) {
  const [query, setQuery] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSearch?.(query);
  };

  return (
    <div className="rounded-[24px] border border-sky-100 bg-white/90 p-4 shadow-[0_16px_40px_rgba(79,70,229,0.08)] backdrop-blur">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Search className="h-4 w-4 text-sky-500" />
        Search delivery area
      </div>

      <form className="mt-3 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by address, landmark, or locality"
          className="w-full rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-white"
        />

        <button
          type="submit"
          disabled={isSearching}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSearching ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Search
        </button>
      </form>

      {searchError ? (
        <p className="mt-3 rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
          {searchError}
        </p>
      ) : null}

      {results.length > 0 ? (
        <div className="mt-3 space-y-2">
          {results.map((result) => (
            <button
              key={result.id}
              type="button"
              onClick={() => onResultSelect?.(result)}
              className="flex w-full items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-left transition hover:border-sky-200 hover:bg-sky-50"
            >
              <MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-cyan-500" />
              <span className="text-sm text-slate-700">{result.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
