"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/Button";

// Mock data - replace with API calls
const mockProducts = [
  {
    id: 1,
    title: "Digital Art Collection Vol. 1",
    price: 29.99,
    image: "/api/placeholder/400/300",
    creator: { id: 1, name: "ArtistPro" },
    category: "Digital Art",
    purchaseCount: 142,
    type: "Digital Art",
  },
  {
    id: 2,
    title: "Web Development Course",
    price: 99.99,
    image: "/api/placeholder/400/300",
    creator: { id: 2, name: "CodeMaster" },
    category: "Courses",
    purchaseCount: 89,
    type: "Courses",
  },
  {
    id: 3,
    title: "UI/UX Templates Pack",
    price: 49.99,
    image: "/api/placeholder/400/300",
    creator: { id: 3, name: "DesignStudio" },
    category: "Templates",
    purchaseCount: 234,
    type: "Templates",
  },
  {
    id: 4,
    title: "Photography Presets",
    price: 19.99,
    image: "/api/placeholder/400/300",
    creator: { id: 4, name: "PhotoPro" },
    category: "Photos",
    purchaseCount: 67,
    type: "Photos",
  },
  {
    id: 5,
    title: "3D Modeling Course",
    price: 79.99,
    image: "/api/placeholder/400/300",
    creator: { id: 5, name: "3DExpert" },
    category: "Courses",
    purchaseCount: 23,
    type: "Courses",
  },
  {
    id: 6,
    title: "Logo Design Templates",
    price: 39.99,
    image: "/api/placeholder/400/300",
    creator: { id: 6, name: "BrandMaker" },
    category: "Templates",
    purchaseCount: 12,
    type: "Templates",
  },
  {
    id: 7,
    title: "Stock Music Pack",
    price: 24.99,
    image: "/api/placeholder/400/300",
    creator: { id: 7, name: "MusicPro" },
    category: "Music",
    purchaseCount: 45,
    type: "Music",
  },
  {
    id: 8,
    title: "Business Plan Template",
    price: 15.99,
    image: "/api/placeholder/400/300",
    creator: { id: 8, name: "BizTemplate" },
    category: "Templates",
    purchaseCount: 8,
    type: "Templates",
  },
];

const categories = [
  "Digital Art",
  "Courses",
  "Templates",
  "Ebooks",
  "Software",
  "Music",
  "Videos",
  "Photos",
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  useEffect(() => {
    // Initialize filters from URL parameters
    const initialFilters = {};
    if (searchParams.get("search"))
      initialFilters.search = searchParams.get("search");
    if (searchParams.get("category"))
      initialFilters.category = searchParams.get("category");
    if (searchParams.get("sort"))
      initialFilters.sort = searchParams.get("sort");

    setFilters(initialFilters);
    applyFilters(initialFilters);
  }, [searchParams]);

  const applyFilters = (newFilters) => {
    let filtered = [...mockProducts];

    // Search filter
    if (newFilters.search) {
      filtered = filtered.filter(
        (product) =>
          product.title
            .toLowerCase()
            .includes(newFilters.search.toLowerCase()) ||
          product.creator.name
            .toLowerCase()
            .includes(newFilters.search.toLowerCase())
      );
    }

    // Category filter
    if (newFilters.category) {
      filtered = filtered.filter(
        (product) => product.category === newFilters.category
      );
    }

    // Type filter
    if (newFilters.type) {
      filtered = filtered.filter((product) => product.type === newFilters.type);
    }

    // Price range filter
    if (newFilters.priceMin) {
      filtered = filtered.filter(
        (product) => product.price >= parseFloat(newFilters.priceMin)
      );
    }
    if (newFilters.priceMax) {
      filtered = filtered.filter(
        (product) => product.price <= parseFloat(newFilters.priceMax)
      );
    }

    // Sort
    const sortBy = newFilters.sort || "newest";
    switch (sortBy) {
      case "oldest":
        filtered.sort((a, b) => a.id - b.id);
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "popular":
        filtered.sort((a, b) => b.purchaseCount - a.purchaseCount);
        break;
      default: // newest
        filtered.sort((a, b) => b.id - a.id);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const handleSearch = (query) => {
    const newFilters = { ...filters, search: query };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleLogout = () => {
    setUser(null);
    // TODO: Implement logout logic
  };

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <PageContainer user={user} onLogout={handleLogout}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Digital Products
          </h1>
          <p className="text-gray-600">
            Discover amazing digital products from talented creators
          </p>
        </div>

        {/* Filters */}
        <ProductFilters
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          categories={categories}
          filters={filters}
          resultsCount={filteredProducts.length}
        />

        {/* Products Grid */}
        <ProductGrid products={currentProducts} loading={loading} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "primary" : "ghost"}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                variant="ghost"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="mt-8 text-center text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)}{" "}
          of {filteredProducts.length} products
        </div>
      </div>
    </PageContainer>
  );
}
