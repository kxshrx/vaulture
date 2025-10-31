"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { SearchBar } from "@/components/forms/SearchBar";
import { ProductCard } from "@/components/product/ProductCard";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  buyerApi,
  getImageUrl,
  formatCreatorName,
  mapToStandardCategory,
  PREDEFINED_CATEGORIES,
} from "@/lib/api";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [popularProducts, setPopularProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Filter products by category
    if (selectedCategory === "All") {
      setFilteredProducts(newProducts);
    } else {
      setFilteredProducts(
        newProducts.filter((product) => product.category === selectedCategory)
      );
    }
  }, [selectedCategory, newProducts]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load popular products (sorted by created_at desc, limited)
      const popularResponse = await buyerApi.getProducts({
        page: 1,
        page_size: 4,
        sort_by: "created_at",
        sort_order: "desc",
      });

      // Load new products (same as popular for now, could be different criteria)
      const newResponse = await buyerApi.getProducts({
        page: 1,
        page_size: 8,
        sort_by: "created_at",
        sort_order: "desc",
      });

      // Transform popular products
      const transformedPopular = popularResponse.products.map((product) => ({
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
      }));

      // Transform new products
      const transformedNew = newResponse.products.map((product) => ({
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
      }));

      // Use predefined categories instead of fetching from backend
      const categoryNames = ["All", ...PREDEFINED_CATEGORIES];

      setPopularProducts(transformedPopular);
      setNewProducts(transformedNew);
      setCategories(categoryNames);
    } catch (error) {
      console.error("Failed to load homepage data:", error);
      // Keep empty arrays as fallback
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    window.location.href = `/products?search=${encodeURIComponent(query)}`;
  };

  return (
    <PageContainer>
      {/* Hero Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-black mb-8 leading-tight">
            Digital Marketplace{" "}
            <span className="text-primary-500">for Creators</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Sell your digital products with confidence. Account-based access and
            secure download links help protect your work while keeping things
            simple for your customers.
          </p>

          {/* Main Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <SearchBar
              placeholder="Find digital products..."
              onSearch={handleSearch}
              size="large"
            />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/auth/signup">
              <Button variant="pink" size="large" className="text-lg px-8 py-4">
                Start Selling
              </Button>
            </Link>
            <Link href="/products">
              <Button
                variant="outline"
                size="large"
                className="text-lg px-8 py-4"
              >
                Browse Products
              </Button>
            </Link>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center bg-gray-50 rounded-xl p-8">
              <div className="text-3xl font-bold text-black mb-3">
                Upload. Price. Earn
              </div>
              <div className="text-gray-600 font-medium text-lg mb-2">
                Simple Setup
              </div>
              <p className="text-gray-500 text-sm">
                Upload your files, set your price, and start earning in minutes
              </p>
            </div>
            <div className="text-center bg-primary-50 rounded-xl p-8">
              <div className="text-3xl font-bold text-primary-600 mb-3 ">
                Protected Access
              </div>
              <div className="text-gray-600 font-medium text-lg mb-2">
                Account-Based Downloads
              </div>
              <p className="text-gray-500 text-sm">
                30-second secure download links protect your digital products
                from unauthorized access
              </p>
            </div>
            <div className="text-center bg-gray-50 rounded-xl p-8">
              <div className="text-3xl font-bold text-black mb-3">
                5% Commission
              </div>
              <div className="text-gray-600 font-medium text-lg mb-2">
                Fair & Transparent
              </div>
              <p className="text-gray-500 text-sm">
                Keep 95% of every sale with no hidden fees or monthly charges
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Trending Products Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold text-black mb-2">
                Popular Products
              </h2>
              <p className="text-gray-600 text-lg">
                Trending digital products this week
              </p>
            </div>
            <Link href="/products?sort=popular">
              <Button variant="ghost" className="text-black hover:text-black">
                View All →
              </Button>
            </Link>
          </div>

          {/* Horizontal scrollable product cards */}
          <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
            {loading ? (
              // Loading skeletons
              [...Array(4)].map((_, index) => (
                <div key={index} className="flex-none w-72">
                  <div className="animate-pulse">
                    <div className="bg-gray-200 aspect-video rounded-xl mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : popularProducts.length > 0 ? (
              popularProducts.map((product) => (
                <div key={product.id} className="flex-none w-72">
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No products available at the moment.
              </div>
            )}
          </div>
        </section>

        {/* Category Filter Chips */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-black mb-6">
            Browse by Category
          </h3>
          <div className="flex flex-wrap gap-3 overflow-x-auto pb-2">
            {loading
              ? // Loading skeletons for categories
                [...Array(5)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded-full px-4 py-2 w-20"></div>
                  </div>
                ))
              : categories.map((category) => (
                  <Link
                    key={category}
                    href={category === "All" ? "/products" : `/products?category=${encodeURIComponent(category)}`}
                  >
                    <Chip
                      active={selectedCategory === category}
                      onClick={() => setSelectedCategory(category)}
                      variant="category"
                    >
                      {category}
                    </Chip>
                  </Link>
                ))}
          </div>
        </section>

        {/* Newly Added Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedCategory === "All"
                  ? "Newly Added"
                  : `${selectedCategory} Products`}
              </h2>
              <p className="text-gray-600 text-lg">
                {selectedCategory === "All"
                  ? "Fresh digital products from our creators"
                  : `Latest ${selectedCategory.toLowerCase()} products`}
              </p>
            </div>
            <Link
              href={`/products${
                selectedCategory !== "All"
                  ? `?category=${selectedCategory}`
                  : ""
              }`}
            >
              <Button variant="ghost" className="text-black hover:text-black">
                View All →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              // Loading skeletons
              [...Array(8)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 aspect-video rounded-xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 col-span-full">
                {selectedCategory === "All"
                  ? "No products available at the moment."
                  : `No products found in "${selectedCategory}" category.`}
              </div>
            )}
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="mt-24 text-center bg-white border border-gray-100 rounded-2xl p-16">
          <h2 className="text-3xl font-bold text-black mb-4">
            Ready to start selling?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join creators who are already using Vaulture to sell their digital
            products with ease and peace of mind.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button variant="pink" size="large" className="px-8">
                Start Selling Today
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" size="large" className="px-8">
                Browse Products
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
