import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "../ui/Button";

export function SearchBar({
  placeholder = "Search for digital products...",
  onSearch,
  size = "large",
  className = "",
}) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const sizes = {
    small: "py-2 text-sm",
    medium: "py-2.5 text-base",
    large: "py-4 text-lg",
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`
            w-full pl-12 pr-24 border border-gray-300 rounded-md 
            focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent
            transition-all duration-150 bg-gray-50 hover:bg-white ${sizes[size]}
          `}
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Button
          type="submit"
          variant="primary"
          size={size === "large" ? "medium" : "small"}
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
        >
          Search
        </Button>
      </div>
    </form>
  );
}
