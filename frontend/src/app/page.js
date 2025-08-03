"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { SearchBar } from "@/components/forms/SearchBar";
import { ProductCard } from "@/components/product/ProductCard";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

// Mock data - replace with API calls
const mockTrendingProducts = [
  {
    id: 1,
    title: "Digital Art Collection Vol. 1",
    price: 29.99,
    image: "/api/placeholder/400/300",
    creator: { id: 1, name: "ArtistPro" },
    category: "Digital Art",
    purchaseCount: 142,
  },
  {
    id: 2,
    title: "Web Development Course",
    price: 99.99,
    image: "/api/placeholder/400/300",
    creator: { id: 2, name: "CodeMaster" },
    category: "Courses",
    purchaseCount: 89,
  },
  {
    id: 3,
    title: "UI/UX Templates Pack",
    price: 49.99,
    image: "/api/placeholder/400/300",
    creator: { id: 3, name: "DesignStudio" },
    category: "Templates",
    purchaseCount: 234,
  },
  {
    id: 4,
    title: "Photography Presets",
    price: 19.99,
    image: "/api/placeholder/400/300",
    creator: { id: 4, name: "PhotoPro" },
    category: "Photos",
    purchaseCount: 67,
  },
];

const mockNewProducts = [
  {
    id: 5,
    title: "3D Modeling Course",
    price: 79.99,
    image: "/api/placeholder/400/300",
    creator: { id: 5, name: "3DExpert" },
    category: "Courses",
    purchaseCount: 23,
  },
  {
    id: 6,
    title: "Logo Design Templates",
    price: 39.99,
    image: "/api/placeholder/400/300",
    creator: { id: 6, name: "BrandMaker" },
    category: "Templates",
    purchaseCount: 12,
  },
  {
    id: 7,
    title: "Stock Music Pack",
    price: 24.99,
    image: "/api/placeholder/400/300",
    creator: { id: 7, name: "MusicPro" },
    category: "Music",
    purchaseCount: 45,
  },
  {
    id: 8,
    title: "Business Plan Template",
    price: 15.99,
    image: "/api/placeholder/400/300",
    creator: { id: 8, name: "BizTemplate" },
    category: "Templates",
    purchaseCount: 8,
  },
];

const categories = [
  "All",
  "Digital Art",
  "Courses",
  "Templates",
  "Ebooks",
  "Software",
  "Music",
  "Videos",
  "Photos",
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredProducts, setFilteredProducts] = useState(mockNewProducts);

  useEffect(() => {
    // Filter products by category
    if (selectedCategory === "All") {
      setFilteredProducts(mockNewProducts);
    } else {
      setFilteredProducts(
        mockNewProducts.filter(
          (product) => product.category === selectedCategory
        )
      );
    }
  }, [selectedCategory]);

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
                Secure download links that expire help protect your digital
                products
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
            {mockTrendingProducts.map((product) => (
              <div key={product.id} className="flex-none w-72">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>

        {/* Category Filter Chips */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-black mb-6">
            Browse by Category
          </h3>
          <div className="flex flex-wrap gap-3 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Chip
                key={category}
                active={selectedCategory === category}
                onClick={() => setSelectedCategory(category)}
                variant="category"
              >
                {category}
              </Chip>
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
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
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
