import { useState } from "react";
import { Search, Filter, ChevronDown } from "lucide-react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Chip } from "../ui/Chip";

export function ProductFilters({
  onSearch,
  onFilterChange,
  categories = [],
  filters = {},
  resultsCount = 0,
}) {
  const [searchQuery, setSearchQuery] = useState(filters.search || "");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({
    min: filters.priceMin || "",
    max: filters.priceMax || "",
  });

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "popular", label: "Most Popular" },
  ];

  const productTypes = [
    "Digital Art",
    "Courses",
    "Templates",
    "Ebooks",
    "Software",
    "Music",
    "Videos",
    "Photos",
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleFilterChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handlePriceChange = () => {
    onFilterChange({
      ...filters,
      priceMin: priceRange.min,
      priceMax: priceRange.max,
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setPriceRange({ min: "", max: "" });
    onFilterChange({});
    onSearch("");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      {/* Main Search Bar */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for digital products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-24 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          />
          <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          <Button
            type="submit"
            variant="primary"
            className="absolute right-2 top-2"
          >
            Search
          </Button>
        </div>
      </form>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2"
        >
          <Filter size={16} />
          <span>Filters</span>
          <ChevronDown
            size={16}
            className={`transition-transform ${
              showFilters ? "rotate-180" : ""
            }`}
          />
        </Button>

        <div className="text-sm text-gray-600">
          {resultsCount} product{resultsCount !== 1 ? "s" : ""} found
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category || ""}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Type
              </label>
              <select
                value={filters.type || ""}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {productTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sort || "newest"}
                onChange={(e) => handleFilterChange("sort", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <Button variant="ghost" onClick={clearFilters} className="w-full">
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, min: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, max: e.target.value })
                }
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button variant="secondary" onClick={handlePriceChange}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters */}
      {Object.keys(filters).length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.category && (
              <Chip active onClick={() => handleFilterChange("category", "")}>
                Category: {filters.category} ×
              </Chip>
            )}
            {filters.type && (
              <Chip active onClick={() => handleFilterChange("type", "")}>
                Type: {filters.type} ×
              </Chip>
            )}
            {(filters.priceMin || filters.priceMax) && (
              <Chip
                active
                onClick={() => {
                  handleFilterChange("priceMin", "");
                  handleFilterChange("priceMax", "");
                  setPriceRange({ min: "", max: "" });
                }}
              >
                Price: ${filters.priceMin || "0"} - ${filters.priceMax || "∞"} ×
              </Chip>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
