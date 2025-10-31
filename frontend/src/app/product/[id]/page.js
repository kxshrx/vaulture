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
  mapToBackendCategory,
  formatPriceINR,
} from "@/lib/api";
import {
  ShoppingCart,
  Download,
  Share2,
  Heart,
  Star,
  CheckCircle,
  Shield,
  RefreshCw,
} from "lucide-react";

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

      // Fetch creator profile and stats
      let creatorData = {
        id: productData.creator_id,
        name: formatCreatorName(productData.creator_name),
        bio: null,
        avatar: "/api/placeholder/100/100",
        productCount: 0,
        totalSales: 0,
      };

      try {
        const [profileResponse, statsResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/profile/${productData.creator_id}`).then(r => r.json()),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/creator/${productData.creator_id}/stats`).then(r => r.json()),
        ]);

        const displayName = formatCreatorName(profileResponse.display_name || productData.creator_name);
        creatorData = {
          id: productData.creator_id,
          name: displayName,
          bio: profileResponse.bio,
          avatar: null,
          initials: displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
          productCount: profileResponse.total_products || 0,
          totalSales: statsResponse.total_sales || 0,
        };
      } catch (error) {
        console.warn("Could not fetch creator details:", error);
        const displayName = formatCreatorName(productData.creator_name);
        creatorData.initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      }

      // Build images array: main image + additional images
      const images = [getImageUrl(productData.image_url, "/api/placeholder/600/400")];
      
      // Add additional images if available
      if (productData.image_urls && Array.isArray(productData.image_urls)) {
        productData.image_urls.forEach(url => {
          images.push(getImageUrl(url, "/api/placeholder/600/400"));
        });
      }
      
      // If we only have one image, don't show thumbnails
      // But ensure we have at least one image
      if (images.length === 1) {
        // Keep just the main image, no need for duplicates
      }

      // Transform backend data to match frontend expectations
      const transformedProduct = {
        id: productData.id,
        title: productData.title,
        price: productData.price,
        images: images,
        description: productData.description || "No description available",
        creator: creatorData,
        category: mapToStandardCategory(productData.category),
        fileType: productData.file_type || "Unknown",
        fileSize: formatFileSize(productData.file_size),
        tags: productData.tags ? productData.tags.split(",") : [],
        reviewCount: 0,
        purchaseCount: 0,
        created_at: productData.created_at,
      };

      setProduct(transformedProduct);
    } catch (error) {
      console.error("Failed to load product:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedProducts = async () => {
    try {
      console.log("Loading related products for category:", product?.category);

      // Convert frontend category back to backend format
      const backendCategory = mapToBackendCategory(product?.category);
      console.log("Converted to backend category:", backendCategory);

      // Load products from same category
      const response = await buyerApi.getProducts({
        page: 1,
        page_size: 4,
        category: backendCategory,
      });

      console.log("Related products response:", response);

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
      console.error("Error details:", {
        message: error.message,
        status: error.status,
        data: error.data,
        endpoint: "/products",
      });
      // Don't set related products on error, just log it
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const [purchasing, setPurchasing] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  // Check if user has already purchased this product
  useEffect(() => {
    const checkPurchaseStatus = async () => {
      if (isAuthenticated() && product) {
        try {
          const purchases = await buyerApi.getPurchases();
          const purchased = purchases.some((p) => p.product_id === product.id);
          setHasPurchased(purchased);
        } catch (error) {
          console.error("Error checking purchase status:", error);
        }
      }
    };

    checkPurchaseStatus();
  }, [isAuthenticated, product]);

  const handlePurchase = async () => {
    if (!isAuthenticated()) {
      router.push(
        `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }

    if (hasPurchased) {
      router.push("/dashboard");
      return;
    }

    // Check if user is trying to buy their own product
    if (user && product.creator.id === user.id) {
      alert("You cannot purchase your own product.");
      return;
    }

    try {
      setPurchasing(true);

      const checkoutData = await purchaseApi.createCheckoutSession(product.id, {
        success_url: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/checkout/cancel?product_id=${product.id}&session_id={CHECKOUT_SESSION_ID}`,
      });

      // Redirect to Stripe checkout
      window.location.href = checkoutData.checkout_url;
    } catch (error) {
      console.error("Purchase failed:", error);

      let errorMessage = "Purchase failed. Please try again.";
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }

      alert(errorMessage);
      setPurchasing(false);
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
              The product you&apos;re looking for doesn&apos;t exist or has been
              removed.
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
              {formatPriceINR(product.price)}
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
                      Secure 30-Second Download
                    </h3>
                    <p className="text-sm text-primary-700">
                      Your download link expires in 30 seconds for maximum
                      security
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Purchase Button */}
            <div className="mb-8">
              {!isAuthenticated() ? (
                <div className="space-y-3">
                  <Button
                    variant="pink"
                    size="large"
                    onClick={handlePurchase}
                    className="w-full"
                  >
                    Sign In to Purchase - {formatPriceINR(product.price)}
                  </Button>
                  <p className="text-sm text-gray-600 text-center">
                    Instant download after purchase
                  </p>
                </div>
              ) : hasPurchased ? (
                <div className="space-y-3">
                  <Button
                    variant="secondary"
                    size="large"
                    onClick={() => router.push("/dashboard")}
                    className="w-full bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Already Purchased - Download Now
                  </Button>
                  <p className="text-sm text-green-600 text-center">
                    You can download this product from your dashboard
                  </p>
                </div>
              ) : user && product.creator.id === user.id ? (
                <div className="space-y-3">
                  <Button
                    variant="secondary"
                    size="large"
                    disabled
                    className="w-full"
                  >
                    Your Product
                  </Button>
                  <p className="text-sm text-gray-600 text-center">
                    This is your own product
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button
                    variant="pink"
                    size="large"
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className="w-full relative overflow-hidden"
                  >
                    {purchasing ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>Buy Now - {formatPriceINR(product.price)}</>
                    )}
                  </Button>
                  <p className="text-sm text-gray-600 text-center">
                    Secure payment • Instant download • 30-day support
                  </p>

                  {/* Security badges */}
                  <div className="flex items-center justify-center space-x-4 pt-2">
                    <div className="flex items-center text-xs text-gray-500">
                      <svg
                        className="w-4 h-4 mr-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9 12L11 14L15 10"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      SSL Secured
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <svg
                        className="w-4 h-4 mr-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect
                          x="1"
                          y="4"
                          width="22"
                          height="16"
                          rx="2"
                          ry="2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <line
                          x1="1"
                          y1="10"
                          x2="23"
                          y2="10"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                      Stripe Protected
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Creator Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">{product.creator.initials}</span>
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

                {product.creator.bio && (
                  <p className="text-gray-600 text-sm mb-4">
                    {product.creator.bio}
                  </p>
                )}

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
