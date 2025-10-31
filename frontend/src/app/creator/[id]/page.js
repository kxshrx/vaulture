"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Chip } from "@/components/ui/Chip";
import {
  profileApi,
  buyerApi,
  getImageUrl,
  mapToStandardCategory,
  formatCreatorName,
} from "@/lib/api";
import {
  MapPin,
  Calendar,
  Globe,
  Twitter,
  Instagram,
  Star,
  Package,
  Users,
  TrendingUp,
} from "lucide-react";

export default function CreatorProfilePage() {
  const params = useParams();
  const creatorId = params.id;
  const [creator, setCreator] = useState(null);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchCreatorData = async () => {
      try {
        setLoading(true);

        // Fetch creator profile, products, and stats in parallel
        const [profileResponse, productsResponse, statsResponse] =
          await Promise.all([
            profileApi.getPublicProfile(creatorId),
            buyerApi.getCreatorProducts(creatorId),
            buyerApi.getCreatorStats(creatorId),
          ]);

        // Format creator data
        const displayName = formatCreatorName(profileResponse.display_name) || profileResponse.display_name || "Creator";
        const creatorData = {
          id: profileResponse.id,
          name: displayName,
          username: profileResponse.display_name || `creator${profileResponse.id}`,
          avatar: null, // Will use initials-based avatar
          initials: displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
          bio: profileResponse.bio || `Creator specializing in digital products. ${profileResponse.total_products || 0} products available.`,
          location: null,
          joinedDate: profileResponse.member_since,
          website: profileResponse.website,
          twitter: profileResponse.social_links?.twitter,
          instagram: profileResponse.social_links?.instagram,
          verified: profileResponse.total_products >= 10, // Verified if 10+ products
          totalSales: statsResponse.total_sales || 0,
          totalProducts: profileResponse.total_products || 0,
          followers: 0,
          responseTime: statsResponse.total_sales > 50 ? "< 1 hour" : statsResponse.total_sales > 10 ? "< 2 hours" : "< 24 hours",
        };

        // Format products data
        const formattedProducts = productsResponse.map((product) => ({
          id: product.id,
          title: product.title,
          price: product.price,
          image: getImageUrl(product.image_url),
          creator: creatorData,
          category: mapToStandardCategory(product.category),
          purchaseCount: 0, // This would need to be added to the product response
          featured: false, // Default for now
        }));

        setCreator(creatorData);
        setProducts(formattedProducts);
        setStats({
          totalRevenue: 0, // Not exposed in public stats
          totalSales: statsResponse.total_sales || 0,
          responseRate: "98%", // Default for now
        });
      } catch (error) {
        console.error("Error fetching creator data:", error);
        setCreator(null);
      } finally {
        setLoading(false);
      }
    };

    if (creatorId) {
      fetchCreatorData();
    }
  }, [creatorId]);

  // Get unique categories from creator's products
  const categories = ["All", ...new Set(products.map((product) => product.category))];

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  const formatJoinDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="flex items-center space-x-6">
              <div className="w-32 h-32 bg-gray-200 rounded-full"></div>
              <div className="space-y-4 flex-1">
                <div className="h-8 bg-gray-200 rounded w-64"></div>
                <div className="h-4 bg-gray-200 rounded w-96"></div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!creator) {
    return (
      <PageContainer>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl font-bold text-black mb-4">
            Creator Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The creator you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link href="/products">
            <Button variant="primary">Browse All Products</Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Creator Header */}
        <div className="bg-dark-400 rounded-lg shadow-card border border-dark-300 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-neon-400 to-neon-600 flex items-center justify-center border-4 border-dark-400 shadow-neon">
                <span className="text-dark-900 text-4xl font-bold">{creator.initials}</span>
              </div>
              {creator.verified && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-neon-500 rounded-full flex items-center justify-center shadow-neon-sm">
                  <Star className="w-4 h-4 text-dark-900 fill-current" />
                </div>
              )}
            </div>

            {/* Creator Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-4xl font-bold text-white">
                  {creator.name}
                </h1>
                {creator.verified && (
                  <Chip
                    variant="category"
                    size="small"
                    className="bg-neon-500 text-dark-900 border-neon-500"
                  >
                    Verified
                  </Chip>
                )}
              </div>
              <p className="text-gray-300 text-lg mb-4 leading-relaxed">
                {creator.bio}
              </p>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400 mb-6">
                {creator.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{creator.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatJoinDate(creator.joinedDate)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span>{creator.totalSales} total sales</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-4">
                {creator.website && (
                  <a
                    href={creator.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-gray-400 hover:text-neon-500 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Website</span>
                  </a>
                )}
                {creator.twitter && (
                  <a
                    href={`https://twitter.com/${creator.twitter.replace(
                      "@",
                      ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-gray-400 hover:text-neon-500 transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                    <span>{creator.twitter}</span>
                  </a>
                )}
                {creator.instagram && (
                  <a
                    href={`https://instagram.com/${creator.instagram.replace(
                      "@",
                      ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-gray-400 hover:text-neon-500 transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>{creator.instagram}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Contact Button */}
            <div className="flex flex-col space-y-3">
              <Button variant="primary" size="large">
                Contact Creator
              </Button>
              <Button variant="outline" size="large">
                Follow
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Package className="w-8 h-8 text-neon-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">
                {creator.totalProducts}
              </div>
              <div className="text-gray-400 text-sm">Products</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-neon-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">
                {stats.totalSales}
              </div>
              <div className="text-gray-400 text-sm">Total Sales</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-neon-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">
                {creator.followers.toLocaleString()}
              </div>
              <div className="text-gray-400 text-sm">Followers</div>
            </CardContent>
          </Card>
        </div>

        {/* Products Section */}
        <div className="bg-dark-400 rounded-lg shadow-card border border-dark-300 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Products</h2>
            <div className="text-gray-400">
              {filteredProducts.length} products
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 mb-8">
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

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} />
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No products found
              </h3>
              <p className="text-gray-400">
                This creator hasn&apos;t uploaded any products in this category
                yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
