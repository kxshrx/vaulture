"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { StatsCard } from "@/components/creator/StatsCard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { buyerApi, ApiError } from "@/lib/api";
import {
  downloadFileWithAuth,
  showDownloadNotification,
  showDownloadError,
} from "@/lib/download";
import {
  Download,
  Package,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

function DashboardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [purchases, setPurchases] = useState([]);
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalSpent: 0,
    lastPurchaseDate: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [downloading, setDownloading] = useState(null);
  const purchasesPerPage = 10;

  // Check for download parameter
  const downloadProductId = searchParams.get("download");

  useEffect(() => {
    // If there's a download parameter, try to download that product
    if (downloadProductId && purchases.length > 0) {
      const purchase = purchases.find(
        (p) => p.product_id.toString() === downloadProductId
      );
      if (purchase) {
        handleDownload(purchase.id);
      }
    }
  }, [downloadProductId, purchases]);

  // Fetch real data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch purchases and stats in parallel
        const [purchasesData, statsData] = await Promise.all([
          buyerApi.getPurchases(),
          buyerApi.getPurchaseStats(),
        ]);

        setPurchases(purchasesData);
        setStats({
          totalPurchases: statsData.total_purchases,
          totalSpent: statsData.total_spent,
          lastPurchaseDate:
            purchasesData.length > 0 ? purchasesData[0].created_at : null,
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");

        // Set empty defaults on error
        setPurchases([]);
        setStats({
          totalPurchases: 0,
          totalSpent: 0,
          lastPurchaseDate: null,
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleDownload = async (purchaseId) => {
    try {
      setDownloading(purchaseId);

      // Find the purchase to get the product_id
      const purchase = purchases.find((p) => p.id === purchaseId);
      if (!purchase) {
        throw new Error("Purchase not found");
      }

      const response = await buyerApi.downloadProduct(purchase.product_id);

      // Download file with authentication
      await downloadFileWithAuth(response.download_url, response.product_title);

      // Show success notification
      showDownloadNotification();
      setError("");
    } catch (error) {
      console.error("Download failed:", error);

      // Show error notification
      showDownloadError(error.message);
      setError(error.message);
    } finally {
      setDownloading(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Pagination
  const totalPages = Math.ceil(purchases.length / purchasesPerPage);
  const startIndex = (currentPage - 1) * purchasesPerPage;
  const endIndex = startIndex + purchasesPerPage;
  const currentPurchases = purchases.slice(startIndex, endIndex);

  if (loading) {
    return (
      <ProtectedRoute requireAuth={true}>
        <PageContainer>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-64"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
              <div className="h-96 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </PageContainer>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <PageContainer>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Purchases
            </h1>
            <p className="text-gray-600">
              Manage your digital product purchases and downloads
            </p>

            {/* Success/Error Messages */}
            {searchParams.get("purchase") === "success" && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <p className="text-green-800">
                    🎉 Purchase completed successfully! You can now download
                    your product below.
                  </p>
                </div>
              </div>
            )}

            {searchParams.get("session_id") &&
              !searchParams.get("purchase") && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <RefreshCw className="w-5 h-5 text-blue-500 mr-2" />
                    <p className="text-blue-800">
                      Verifying your purchase... If your product doesn&apos;t appear
                      shortly, please refresh the page.
                    </p>
                  </div>
                </div>
              )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Total Purchases"
              value={stats.totalPurchases}
              icon={<Package className="w-6 h-6 text-primary-600" />}
            />
            <StatsCard
              title="Total Spent"
              value={`$${stats.totalSpent?.toFixed(2)}`}
              icon={<DollarSign className="w-6 h-6 text-green-600" />}
            />
            <StatsCard
              title="Last Purchase"
              value={
                stats.lastPurchaseDate
                  ? formatDate(stats.lastPurchaseDate).split(",")[0]
                  : "Never"
              }
              subtitle={
                stats.lastPurchaseDate
                  ? formatDate(stats.lastPurchaseDate).split(",")[1]
                  : ""
              }
              icon={<Calendar className="w-6 h-6 text-purple-600" />}
            />
          </div>

          {/* Purchase History */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Purchase History
            </h2>

            {currentPurchases.length > 0 ? (
              <div className="grid gap-4">
                {currentPurchases.map((purchase) => (
                  <Card
                    key={purchase.id}
                    className="hover:shadow-lg transition-shadow duration-200"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Product Info */}
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="flex-shrink-0">
                            <img
                              className="h-16 w-16 rounded-xl object-cover border border-gray-200"
                              src={
                                purchase.product_image_url ||
                                "/placeholder-image.png"
                              }
                              alt={purchase.product_title}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/product/${purchase.product_id}`}
                              className="block"
                            >
                              <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors duration-200 truncate">
                                {purchase.product_title}
                              </h3>
                            </Link>
                            <p className="text-sm text-gray-600 mt-1">
                              by {purchase.creator_name}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>
                                Purchased {formatDate(purchase.created_at)}
                              </span>
                              <span className="text-gray-300">•</span>
                              <span className="font-medium text-gray-900">
                                $
                                {purchase.amount_paid?.toFixed(2) ||
                                  purchase.product_price?.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Download Info & Actions */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4">
                          {/* Product Category */}
                          <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {purchase.product_category}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="primary"
                              size="small"
                              onClick={() => handleDownload(purchase.id)}
                              disabled={downloading === purchase.id}
                              className="flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                            >
                              {downloading === purchase.id ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  <span>Downloading...</span>
                                </>
                              ) : (
                                <>
                                  <Download className="w-4 h-4" />
                                  <span>Download</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-16">
                <CardContent>
                  <div className="max-w-sm mx-auto">
                    <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-xl font-medium text-gray-900 mb-3">
                      No purchases yet
                    </h3>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                      Start exploring our marketplace to find amazing digital
                      products created by talented creators
                    </p>
                    <Link href="/products">
                      <Button
                        variant="primary"
                        className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 px-8 py-3"
                      >
                        Browse Products
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? "primary" : "ghost"}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}

                <Button
                  variant="ghost"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </PageContainer>
    </ProtectedRoute>
  );
}

function LoadingFallback() {
  return (
    <ProtectedRoute requireAuth={true}>
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </PageContainer>
    </ProtectedRoute>
  );
}

export default function BuyerDashboard() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DashboardContent />
    </Suspense>
  );
}
