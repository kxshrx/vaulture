"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { User, Star, Download, Shield, Clock } from "lucide-react";

export default function ProductPage() {
  const params = useParams();
  const [user, setUser] = useState(null);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  // Mock data - replace with API call
  useEffect(() => {
    const mockProduct = {
      id: params.id,
      title: "Digital Art Collection Vol. 1",
      price: 29.99,
      images: [
        "/api/placeholder/600/400",
        "/api/placeholder/600/400",
        "/api/placeholder/600/400",
      ],
      description: `
        <h3>Professional Digital Art Collection</h3>
        <p>This comprehensive collection includes 50+ high-quality digital artworks perfect for your creative projects. Each piece is carefully crafted and available in multiple formats.</p>
        
        <h4>What's Included:</h4>
        <ul>
          <li>50+ unique digital art pieces</li>
          <li>High resolution (4K) files</li>
          <li>Multiple formats: PNG, JPG, PSD</li>
          <li>Commercial license included</li>
          <li>Layered PSD files for customization</li>
        </ul>
        
        <h4>Perfect for:</h4>
        <ul>
          <li>Web designers</li>
          <li>Print designers</li>
          <li>Content creators</li>
          <li>Social media managers</li>
        </ul>
      `,
      creator: {
        id: 1,
        name: "ArtistPro",
        bio: "Professional digital artist with 10+ years of experience creating stunning visual content for brands worldwide.",
        avatar: "/api/placeholder/100/100",
        productCount: 25,
        totalSales: 1420,
        socialLinks: {
          twitter: "https://twitter.com/artistpro",
          instagram: "https://instagram.com/artistpro",
        },
      },
      category: "Digital Art",
      purchaseCount: 142,
      fileSize: "245 MB",
      fileType: "ZIP Archive",
      rating: 4.8,
      reviewCount: 23,
      tags: ["digital art", "graphics", "design", "commercial license"],
    };

    const mockRelatedProducts = [
      {
        id: 2,
        title: "Digital Art Collection Vol. 2",
        price: 34.99,
        image: "/api/placeholder/400/300",
        creator: { id: 1, name: "ArtistPro" },
        category: "Digital Art",
        purchaseCount: 98,
      },
      {
        id: 3,
        title: "Abstract Art Pack",
        price: 24.99,
        image: "/api/placeholder/400/300",
        creator: { id: 2, name: "AbstractMaster" },
        category: "Digital Art",
        purchaseCount: 76,
      },
      {
        id: 4,
        title: "Vintage Design Elements",
        price: 19.99,
        image: "/api/placeholder/400/300",
        creator: { id: 3, name: "VintageDesign" },
        category: "Digital Art",
        purchaseCount: 154,
      },
      {
        id: 5,
        title: "Modern Art Collection",
        price: 39.99,
        image: "/api/placeholder/400/300",
        creator: { id: 4, name: "ModernArtist" },
        category: "Digital Art",
        purchaseCount: 67,
      },
    ];

    setProduct(mockProduct);
    setRelatedProducts(mockRelatedProducts);
    setLoading(false);
  }, [params.id]);

  const handleLogout = () => {
    setUser(null);
  };

  const handlePurchase = () => {
    if (!user) {
      // Show auth modal or redirect to login
      alert("Please sign in to purchase");
      return;
    }

    // TODO: Implement purchase flow
    console.log("Purchasing product:", product.id);
    alert("Purchase flow not implemented yet");
  };

  if (loading) {
    return (
      <PageContainer user={user} onLogout={handleLogout}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="bg-gray-200 aspect-video rounded-xl"></div>
                <div className="flex space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-gray-200 w-20 h-20 rounded-lg"
                    ></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!product) {
    return (
      <PageContainer user={user} onLogout={handleLogout}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The product you're looking for doesn't exist.
          </p>
          <Link href="/products">
            <Button variant="primary">Browse Products</Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer user={user} onLogout={handleLogout}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900">
              Home
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-gray-900">
              Products
            </Link>
            <span>/</span>
            <span className="text-gray-900">{product.title}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            {/* Main Image */}
            <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden mb-4">
              <Image
                src={product.images[selectedImage]}
                alt={product.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Image Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex space-x-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? "border-blue-500"
                        : "border-gray-200"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div>
            {/* Category & Rating */}
            <div className="flex items-center justify-between mb-4">
              <Chip variant="category">{product.category}</Chip>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{product.rating}</span>
                <span className="text-sm text-gray-600">
                  ({product.reviewCount} reviews)
                </span>
              </div>
            </div>

            {/* Title & Price */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.title}
            </h1>
            <div className="text-3xl font-bold text-blue-600 mb-6">
              ${product.price}
            </div>

            {/* File Info */}
            <div className="flex items-center space-x-6 mb-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Download className="w-4 h-4" />
                <span>{product.fileType}</span>
              </div>
              <div>{product.fileSize}</div>
              <div>{product.purchaseCount} purchases</div>
            </div>

            {/* Security Features */}
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Shield className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-900">
                      Secure 45-Second Download
                    </h3>
                    <p className="text-sm text-blue-700">
                      Your download link expires in 45 seconds for maximum
                      security
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Purchase Button */}
            <div className="mb-8">
              {user ? (
                <Button
                  variant="primary"
                  size="large"
                  onClick={handlePurchase}
                  className="w-full"
                >
                  Buy Now - ${product.price}
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    size="large"
                    onClick={handlePurchase}
                    className="w-full"
                  >
                    Sign In to Purchase
                  </Button>
                  <p className="text-sm text-gray-600 text-center">
                    Instant download after purchase
                  </p>
                </div>
              )}
            </div>

            {/* Creator Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative w-12 h-12">
                    <Image
                      src={product.creator.avatar}
                      alt={product.creator.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {product.creator.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{product.creator.productCount} products</span>
                      <span>{product.creator.totalSales} sales</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  {product.creator.bio}
                </p>

                <Link href={`/creator/${product.creator.id}`}>
                  <Button variant="secondary" size="small" className="w-full">
                    View Creator Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-12">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Product Description
              </h2>
              <div
                className="prose prose-blue max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Tags */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <Chip key={tag} variant="category" size="small">
                {tag}
              </Chip>
            ))}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Related Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <div key={relatedProduct.id}>
                <ProductGrid products={[relatedProduct]} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
