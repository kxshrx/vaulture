"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { useAuth } from "@/contexts/AuthContext";
import {
  buyerApi,
  purchaseApi,
  getImageUrl,
  formatCreatorName,
  mapToStandardCategory,
} from "@/lib/api";
import { User, Star, Download, Shield, Clock } from "lucide-react";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    loadProduct();
  }, [params.id]);

  useEffect(() => {
    if (product) {
      loadRelatedProducts();
    }
  }, [product]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await buyerApi.getProduct(params.id);

      // Transform backend data to match frontend expectations
      const transformedProduct = {
        id: productData.id,
        title: productData.title,
        price: productData.price,
        images: [
          getImageUrl(productData.image_url, "/api/placeholder/600/400"),
          // Add more placeholder images if needed
          "/api/placeholder/600/400",
          "/api/placeholder/600/400",
        ],
        description: productData.description || "No description available",
        creator: {
          id: productData.creator_id,
          name: formatCreatorName(productData.creator_name),
          bio: `Creator on Vaulture platform`, // Simple bio based on creator status
          avatar: "/api/placeholder/100/100", // Will be enhanced when we add creator avatars
          productCount: 0, // Backend doesn't track this yet - can be added later
          totalSales: 0, // Backend doesn't track this yet - can be added later
        },
        category: mapToStandardCategory(productData.category),
        fileType: productData.file_type || "Unknown",
        fileSize: formatFileSize(productData.file_size),
        tags: productData.tags ? productData.tags.split(",") : [],
        reviewCount: 0, // Mock reviews - backend doesn't have this yet
        purchaseCount: 0, // Backend doesn't track this yet
        created_at: productData.created_at,
      };

      setProduct(transformedProduct);
    } catch (error) {
      console.error("Failed to load product:", error);
      // Handle error - maybe redirect to 404
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedProducts = async () => {
    try {
      // Load products from same category
      const response = await buyerApi.getProducts({
        page: 1,
        page_size: 4,
        category: product?.category,
      });

      // Transform and exclude current product
      const transformed = response.products
        .filter((p) => p.id !== parseInt(params.id))
        .slice(0, 4)
        .map((product) => ({
          id: product.id,
          title: product.title,
          price: product.price,
          image: getImageUrl(product.image_url),
          creator: {
            id: product.creator_id,
            name: formatCreatorName(product.creator_name),
          },
          category: mapToStandardCategory(product.category),
        }));

      setRelatedProducts(transformed);
    } catch (error) {
      console.error("Failed to load related products:", error);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const handlePurchase = async () => {
    if (!isAuthenticated()) {
      router.push("/auth/signin");
      return;
    }

    try {
      const checkoutData = await purchaseApi.createCheckoutSession(product.id, {
        success_url: `${window.location.origin}/dashboard?purchase=success`,
        cancel_url: `${window.location.origin}/product/${product.id}?purchase=cancelled`,
      });

      // Redirect to Stripe checkout
      window.location.href = checkoutData.checkout_url;
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("Purchase failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="aspect-video bg-gray-200 rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!product) {
    return (
      <PageContainer>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Product Not Found
            </h1>
            <p className="text-gray-600 mb-8">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/products">
              <Button variant="primary">Browse All Products</Button>
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
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
                        ? "border-primary-500"
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

          {/* Product Details */}
          <div>
            {/* Category */}
            <div className="flex items-center justify-between mb-4">
              <Chip variant="category">{product.category}</Chip>
            </div>

            {/* Title and Price */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.title}
            </h1>
            <div className="text-3xl font-bold text-primary-500 mb-6">
              ${product.price}
            </div>

            {/* Product Info */}
            <div className="flex items-center space-x-6 mb-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Download className="w-4 h-4" />
                <span>{product.fileType}</span>
              </div>
              <div>{product.fileSize}</div>
              <div>{product.purchaseCount} purchases</div>
            </div>

            {/* Security Notice */}
            <Card className="mb-6 bg-primary-50 border-primary-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Shield className="w-6 h-6 text-primary-600" />
                  <div>
                    <h3 className="font-semibold text-primary-900">
                      Secure 45-Second Download
                    </h3>
                    <p className="text-sm text-primary-700">
                      Your download link expires in 45 seconds for maximum
                      security
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Purchase Button */}
            <div className="mb-8">
              {isAuthenticated() ? (
                <Button
                  variant="pink"
                  size="large"
                  onClick={handlePurchase}
                  className="w-full"
                >
                  Buy Now - ${product.price}
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button
                    variant="pink"
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

        {/* Description */}
        <div className="mt-12">
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Product Description
              </h2>
              <div
                className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-a:text-primary-600 prose-strong:text-gray-900"
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
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
