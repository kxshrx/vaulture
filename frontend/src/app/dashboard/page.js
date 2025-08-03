"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { StatsCard } from "@/components/creator/StatsCard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import {
  Download,
  Calendar,
  DollarSign,
  Package,
  ExternalLink,
} from "lucide-react";

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const purchasesPerPage = 10;

  // Mock data - replace with API calls
  useEffect(() => {
    const mockPurchases = [
      {
        id: 1,
        product: {
          id: 1,
          title: "Digital Art Collection Vol. 1",
          image: "/api/placeholder/100/100",
          creator: { name: "ArtistPro" },
        },
        purchaseDate: "2025-01-15T10:30:00Z",
        amount: 29.99,
        downloadCount: 2,
        maxDownloads: null, // unlimited
      },
      {
        id: 2,
        product: {
          id: 2,
          title: "Web Development Course",
          image: "/api/placeholder/100/100",
          creator: { name: "CodeMaster" },
        },
        purchaseDate: "2025-01-10T14:20:00Z",
        amount: 99.99,
        downloadCount: 1,
        maxDownloads: null,
      },
      {
        id: 3,
        product: {
          id: 3,
          title: "UI/UX Templates Pack",
          image: "/api/placeholder/100/100",
          creator: { name: "DesignStudio" },
        },
        purchaseDate: "2025-01-05T09:15:00Z",
        amount: 49.99,
        downloadCount: 3,
        maxDownloads: null,
      },
      {
        id: 4,
        product: {
          id: 4,
          title: "Photography Presets",
          image: "/api/placeholder/100/100",
          creator: { name: "PhotoPro" },
        },
        purchaseDate: "2024-12-28T16:45:00Z",
        amount: 19.99,
        downloadCount: 0,
        maxDownloads: null,
      },
    ];

    const mockStats = {
      totalPurchases: mockPurchases.length,
      totalSpent: mockPurchases.reduce(
        (sum, purchase) => sum + purchase.amount,
        0
      ),
      lastPurchaseDate: mockPurchases[0]?.purchaseDate,
    };

    setPurchases(mockPurchases);
    setStats(mockStats);
    setLoading(false);
  }, []);

  const handleDownload = (purchaseId) => {
    // TODO: Implement secure download link generation
    console.log("Generating download link for purchase:", purchaseId);
    alert("Download link generated! (45 seconds to download)");
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
                              src={purchase.product.image}
                              alt={purchase.product.title}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/product/${purchase.product.id}`}
                              className="block"
                            >
                              <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors duration-200 truncate">
                                {purchase.product.title}
                              </h3>
                            </Link>
                            <p className="text-sm text-gray-600 mt-1">
                              by {purchase.product.creator.name}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>
                                Purchased {formatDate(purchase.purchaseDate)}
                              </span>
                              <span className="text-gray-300">•</span>
                              <span className="font-medium text-gray-900">
                                ${purchase.amount.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Download Info & Actions */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4">
                          {/* Download Counter */}
                          <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">
                              {purchase.downloadCount} /{" "}
                              {purchase.maxDownloads || "∞"}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="primary"
                              size="small"
                              onClick={() => handleDownload(purchase.id)}
                              className="flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                            >
                              <Download className="w-4 h-4" />
                              <span>Download</span>
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
