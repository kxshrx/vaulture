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
      <section className="gradient-neon py-16 md:py-24 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-neon-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Digital Marketplace{" "}
            <span className="neon-text">for Creators</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
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
            <div className="text-center bg-dark-400 border border-dark-300 rounded-xl p-8 card-hover">
              <div className="text-3xl font-bold text-white mb-3">
                Upload. Price. Earn
              </div>
              <div className="text-neon-500 font-medium text-lg mb-2">
                Simple Setup
              </div>
              <p className="text-gray-400 text-sm">
                Upload your files, set your price, and start earning in minutes
              </p>
            </div>
            <div className="text-center bg-dark-400 border-2 border-neon-500 rounded-xl p-8 shadow-neon card-hover">
              <div className="text-3xl font-bold neon-text mb-3">
                Protected Access
              </div>
              <div className="text-white font-medium text-lg mb-2">
                Account-Based Downloads
              </div>
              <p className="text-gray-400 text-sm">
                30-second secure download links protect your digital products
                from unauthorized access
              </p>
            </div>
            <div className="text-center bg-dark-400 border border-dark-300 rounded-xl p-8 card-hover">
              <div className="text-3xl font-bold text-white mb-3">
                5% Commission
              </div>
              <div className="text-neon-500 font-medium text-lg mb-2">
                Fair & Transparent
              </div>
              <p className="text-gray-400 text-sm">
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
              <h2 className="text-4xl font-bold text-white mb-2">
                Popular Products
              </h2>
              <p className="text-gray-400 text-lg">
                Trending digital products this week
              </p>
            </div>
            <Link href="/products?sort=popular">
              <Button variant="ghost" className="text-white hover:text-neon-500">
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
                    <div className="bg-dark-400 aspect-video rounded-xl mb-4"></div>
                    <div className="h-4 bg-dark-400 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-dark-400 rounded w-1/2"></div>
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
          <h3 className="text-2xl font-bold text-white mb-6">
            Browse by Category
          </h3>
          <div className="flex flex-wrap gap-3 overflow-x-auto pb-2">
            {loading
              ? // Loading skeletons for categories
                [...Array(5)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-8 bg-dark-400 rounded-full px-4 py-2 w-20"></div>
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
              <h2 className="text-3xl font-bold text-white mb-2">
                {selectedCategory === "All"
                  ? "Newly Added"
                  : `${selectedCategory} Products`}
              </h2>
              <p className="text-gray-400 text-lg">
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
              <Button variant="ghost" className="text-white hover:text-neon-500">
                View All →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              // Loading skeletons
              [...Array(8)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-dark-400 aspect-video rounded-xl mb-4"></div>
                  <div className="h-4 bg-dark-400 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-dark-400 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-dark-400 rounded w-1/4"></div>
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
        <section className="mt-24 text-center bg-dark-400 border-2 border-neon-500 rounded-2xl p-16 shadow-neon relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-500/5 to-transparent pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to start selling?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
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
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
