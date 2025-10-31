"use client";

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
            w-full pl-12 pr-24 border border-dark-300 rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-neon-500 focus:border-neon-500
            transition-all duration-200 bg-dark-400 hover:bg-dark-300 text-white
            placeholder:text-gray-500 ${sizes[size]}
          `}
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
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
