"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/Button";
import {
  buyerApi,
  getImageUrl,
  formatCreatorName,
  mapToStandardCategory,
  mapToBackendCategory,
  PREDEFINED_CATEGORIES,
} from "@/lib/api";

function ProductsContent() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 12;

  useEffect(() => {
    // Initialize filters from URL parameters
    const initialFilters = {};
    if (searchParams.get("search"))
      initialFilters.query = searchParams.get("search");
    if (searchParams.get("category"))
      initialFilters.category = searchParams.get("category");
    if (searchParams.get("sort"))
      initialFilters.sort_by = searchParams.get("sort");

    setFilters(initialFilters);
    loadProducts(initialFilters);
    loadCategories();
  }, [searchParams]);

  const loadProducts = async (filterParams = {}) => {
    try {
      setLoading(true);
      
      // Map frontend parameters to backend API format
      const mappedFilters = {};
      
      // Map category to backend enum
      if (filterParams.category) {
        mappedFilters.category = mapToBackendCategory(filterParams.category);
      }
      
      // Map search query
      if (filterParams.query) {
        mappedFilters.query = filterParams.query;
      }
      
      // Map price range (frontend: priceMin/priceMax -> backend: min_price/max_price)
      if (filterParams.min_price || filterParams.priceMin) {
        mappedFilters.min_price = filterParams.min_price || filterParams.priceMin;
      }
      if (filterParams.max_price || filterParams.priceMax) {
        mappedFilters.max_price = filterParams.max_price || filterParams.priceMax;
      }
      
      // Map sort (frontend: sort with values like 'newest' -> backend: sort_by + sort_order)
      const sortValue = filterParams.sort || filterParams.sort_by || 'newest';
      switch (sortValue) {
        case 'newest':
          mappedFilters.sort_by = 'created_at';
          mappedFilters.sort_order = 'desc';
          break;
        case 'oldest':
          mappedFilters.sort_by = 'created_at';
          mappedFilters.sort_order = 'asc';
          break;
        case 'price-low':
          mappedFilters.sort_by = 'price';
          mappedFilters.sort_order = 'asc';
          break;
        case 'price-high':
          mappedFilters.sort_by = 'price';
          mappedFilters.sort_order = 'desc';
          break;
        case 'title':
          mappedFilters.sort_by = 'title';
          mappedFilters.sort_order = 'asc';
          break;
        default:
          mappedFilters.sort_by = 'created_at';
          mappedFilters.sort_order = 'desc';
      }
      
      const params = {
        page: currentPage,
        page_size: productsPerPage,
        ...mappedFilters,
      };

      const response = await buyerApi.getProducts(params);

      // Transform backend data to match frontend expectations
      const transformedProducts = response.products.map((product) => ({
        id: product.id,
        title: product.title,
        price: product.price,
        image: getImageUrl(product.image_url),
        creator: {
          id: product.creator_id,
          name: formatCreatorName(product.creator_name),
        },
        category: mapToStandardCategory(product.category),
        purchaseCount: 0, // Backend doesn't track this yet
        type: product.category,
        description: product.description,
        fileType: product.file_type,
        fileSize: product.file_size,
        tags: product.tags ? product.tags.split(",") : [],
        created_at: product.created_at,
      }));

      setProducts(transformedProducts);
      setTotalPages(response.total_pages);
      setTotalProducts(response.total);
      setCurrentPage(response.page);
    } catch (error) {
      console.error("Failed to load products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      // Use predefined categories instead of fetching from backend
      setCategories(PREDEFINED_CATEGORIES);
    } catch (error) {
      console.error("Failed to load categories:", error);
      // Fallback to predefined categories
      setCategories(PREDEFINED_CATEGORIES);
    }
  };

  const handleSearch = (query) => {
    const newFilters = { ...filters, query };
    setFilters(newFilters);
    setCurrentPage(1);
    loadProducts(newFilters);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    loadProducts(newFilters);
  };

  const handleLogout = () => {
    setUser(null);
    // TODO: Implement logout logic
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    loadProducts({ ...filters, page });
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
          resultsCount={totalProducts}
        />

        {/* Products Grid */}
        <ProductGrid products={products} loading={loading} />

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
          {loading
            ? "Loading products..."
            : totalProducts > 0
            ? `Showing ${(currentPage - 1) * productsPerPage + 1}-${Math.min(
                currentPage * productsPerPage,
                totalProducts
              )} of ${totalProducts} products`
            : "No products found"}
        </div>
      </div>
    </PageContainer>
  );
}

function LoadingFallback() {
  return (
    <PageContainer>
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    </PageContainer>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ProductsContent />
    </Suspense>
  );
}
