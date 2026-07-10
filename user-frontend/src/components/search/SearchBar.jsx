import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import SearchResultDropdown from "./SearchResultDropdown";
import { searchMenusAndKitchens } from "../../services/searchService";
import "./SearchBar.css";

function SearchBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [results, setResults] = useState({
    menus: [],
    kitchens: [],
  });

  const searchRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const trimmed = query.trim();

      if (!trimmed) {
        setResults({
          menus: [],
          kitchens: [],
        });
        return;
      }

      try {
        setLoading(true);

        const data = await searchMenusAndKitchens(trimmed);

        setResults(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q");

    if (q) {
      setQuery(q);
      setShowDropdown(false);
    }
  }, [location.search]);

  const handleMenuClick = (menu) => {
  setShowDropdown(false);
  setQuery("");

  navigate(`/menu/${menu.slug}`);
};

  const handleKitchenClick = (kitchen) => {
    setShowDropdown(false);
    setQuery("");
    navigate(`/kitchen/${kitchen.id}`);
  };

  const handleEnter = (e) => {
    if (e.key !== "Enter") return;

    const trimmed = query.trim();
    if (!trimmed) return;

    const recentSearches =
      JSON.parse(localStorage.getItem("recentSearches")) || [];

    const updated = [
      trimmed,
      ...recentSearches.filter((item) => item !== trimmed),
    ].slice(0, 5);

    localStorage.setItem("recentSearches", JSON.stringify(updated));

    setShowDropdown(false);
    inputRef.current?.blur();

    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div ref={searchRef} className="navbar-search">
      <Search size={18} className="search-icon" />

      <input
        ref={inputRef}
        type="text"
        value={query}
        onFocus={() => setShowDropdown(true)}
        onKeyDown={handleEnter}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search food or kitchen..."
        className="search-input"
      />

      {showDropdown && (
        <SearchResultDropdown
          loading={loading}
          query={query}
          results={results}
          onMenuClick={handleMenuClick}
          onKitchenClick={handleKitchenClick}
        />
      )}
    </div>
  );
}

export default SearchBar;
