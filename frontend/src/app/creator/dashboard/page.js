"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { StatsCard } from "@/components/creator/StatsCard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { creatorApi } from "@/lib/api";
import { Package, DollarSign, TrendingUp, Users, Plus } from "lucide-react";

export default function CreatorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recentSales, setRecentSales] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch essential dashboard data - handle errors gracefully
        const [statsResponse, salesResponse, productsResponse] =
          await Promise.allSettled([
            creatorApi.getStats(),
            creatorApi.getSales(3), // Just get last 3 sales for overview
            creatorApi.getProducts(),
          ]);

        // Handle stats response
        const stats =
          statsResponse.status === "fulfilled"
            ? statsResponse.value
            : { total_sales: 0, total_revenue: 0 };

        // Handle products response
        const products =
          productsResponse.status === "fulfilled" &&
          Array.isArray(productsResponse.value)
            ? productsResponse.value
            : [];

        // Handle sales response
        const sales =
          salesResponse.status === "fulfilled" &&
          Array.isArray(salesResponse.value)
            ? salesResponse.value
            : [];

        // Format basic stats for dashboard overview - ensure we have proper product count
        const formattedStats = {
          totalProducts: products.length,
          totalSales: stats.total_sales || 0,
          totalRevenue: stats.total_revenue || 0,
          activeProducts: products.filter((p) => p.is_active).length,
        };

        // Recent sales for quick overview
        const formattedRecentSales = sales;

        // Recent products for quick management
        const formattedRecentProducts = products
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 3);

        setStats(formattedStats);
        setRecentSales(formattedRecentSales);
        setRecentProducts(formattedRecentProducts);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Set empty data on error
        setStats({
          totalProducts: 0,
          totalSales: 0,
          totalRevenue: 0,
          activeProducts: 0,
        });
        setRecentSales([]);
        setRecentProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    const inrAmount = Math.round((amount || 0) * 83);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(inrAmount);
  };

  const hasData = stats.totalSales > 0 || stats.totalProducts > 0;

  if (loading) {
    return (
      <ProtectedRoute requireAuth={true} requiredRole="creator">
        <PageContainer>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-64"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-96 bg-gray-200 rounded-xl"></div>
                <div className="h-96 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </PageContainer>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth={true} requiredRole="creator">
      <PageContainer>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Dashboard Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Creator Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.name || user?.display_name || "Creator"}!
                Here&apos;s your business overview.
              </p>
            </div>
            <Link href="/creator/upload">
              <Button
                variant="primary"
                className="flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                <span>Upload Product</span>
              </Button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Products"
              value={stats.totalProducts}
              subtitle={`${stats.activeProducts} active`}
              icon={<Package className="w-6 h-6 text-primary-600" />}
            />
            <StatsCard
              title="Total Sales"
              value={stats.totalSales}
              icon={<TrendingUp className="w-6 h-6 text-green-600" />}
            />
            <StatsCard
              title="Total Revenue"
              value={formatCurrency(stats.totalRevenue)}
              icon={<DollarSign className="w-6 h-6 text-purple-600" />}
            />
            <StatsCard
              title="Active Products"
              value={stats.activeProducts}
              subtitle="Ready for sale"
              icon={<Users className="w-6 h-6 text-orange-600" />}
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link href="/creator/upload">
              <Card
                hover
                className="cursor-pointer group transition-all duration-200 hover:shadow-lg border-2 hover:border-primary-200"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Upload New Product
                  </h3>
                  <p className="text-sm text-gray-600">
                    Add a new digital product to sell
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/creator/products">
              <Card
                hover
                className="cursor-pointer group transition-all duration-200 hover:shadow-lg border-2 hover:border-green-200"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Manage Products
                  </h3>
                  <p className="text-sm text-gray-600">
                    Edit and organize your products
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/creator/analytics">
              <Card
                hover
                className="cursor-pointer group transition-all duration-200 hover:shadow-lg border-2 hover:border-purple-200"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    View Analytics
                  </h3>
                  <p className="text-sm text-gray-600">
                    Detailed sales and revenue data
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {!hasData ? (
            /* Getting Started State */
            <div className="text-center py-16">
              <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary-50 via-white to-primary-50 border-2 border-primary-100 shadow-xl">
                <CardContent className="p-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Package className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-4">
                    Welcome to Your Creator Dashboard!
                  </h3>
                  <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                    Ready to start your journey? Upload your first digital
                    product and begin building your creative business today.
                  </p>
                  <Link href="/creator/upload">
                    <Button
                      variant="primary"
                      className="flex items-center space-x-2 mx-auto bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="font-semibold">
                        Upload Your First Product
                      </span>
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {/* Main Dashboard Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Recent Sales Overview */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">
                          Recent Sales
                        </h2>
                        <Link href="/creator/analytics">
                          <Button variant="ghost" size="small">
                            View Full Analytics
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {recentSales.length > 0 ? (
                        <div className="space-y-4 p-6">
                          {recentSales.map((sale) => (
                            <div
                              key={sale.id}
                              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                            >
                              <div>
                                <div className="font-medium text-gray-900">
                                  {sale.product}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {sale.buyer} • {formatDate(sale.sale_date)}
                                </div>
                              </div>
                              <div className="font-semibold text-green-600">
                                {formatCurrency(sale.amount)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p>No sales yet</p>
                          <p className="text-sm mt-2">
                            Your recent sales will appear here
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Overview */}
                <div className="space-y-6">
                  {/* Performance Summary */}
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-gray-900">
                        This Month Summary
                      </h3>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Revenue</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(stats.totalRevenue)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Sales</span>
                          <span className="font-semibold">
                            {stats.totalSales}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Products</span>
                          <span className="font-semibold">
                            {stats.totalProducts}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <Link href="/creator/analytics">
                          <Button
                            variant="secondary"
                            size="small"
                            className="w-full"
                          >
                            View Detailed Analytics
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Recent Products */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Recent Products
                    </h2>
                    <Link href="/creator/products">
                      <Button variant="ghost" size="small">
                        View All Products
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {recentProducts.map((product) => (
                        <Card
                          key={product.id}
                          hover
                          className="cursor-pointer group transition-all duration-200 hover:shadow-lg border hover:border-primary-200"
                        >
                          <CardContent className="p-4">
                            <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mb-3 flex items-center justify-center overflow-hidden border border-gray-200">
                              {product.image_url || product.image ? (
                                <img
                                  src={product.image_url || product.image}
                                  alt={product.title}
                                  className="w-full h-full object-cover rounded-xl transition-transform hover:scale-105"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.parentNode.classList.add(
                                      "bg-gradient-to-br",
                                      "from-primary-50",
                                      "to-primary-100"
                                    );
                                    e.target.nextElementSibling.style.display =
                                      "flex";
                                  }}
                                />
                              ) : null}
                              <div
                                className={`w-full h-full flex items-center justify-center ${
                                  product.image_url || product.image
                                    ? "hidden"
                                    : ""
                                }`}
                              >
                                <Package className="w-10 h-10 text-primary-400" />
                              </div>
                            </div>
                            <h4 className="font-semibold text-gray-900 truncate mb-1 group-hover:text-primary-600 transition-colors">
                              {product.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2 font-medium">
                              {formatCurrency(product.price)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(product.created_at)}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-gray-700 font-medium mb-2">
                        No products yet
                      </p>
                      <p className="text-sm text-gray-500">
                        Upload your first product to get started
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </PageContainer>
    </ProtectedRoute>
  );
}
