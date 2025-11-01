"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { StatsCard } from "@/components/creator/StatsCard";
import { AnalyticsChart } from "@/components/creator/AnalyticsChart";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { creatorApi } from "@/lib/api";
import {
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Download,
  Users,
  Package,
  Eye,
} from "lucide-react";

export default function CreatorAnalytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [analyticsData, setAnalyticsData] = useState({});
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);

        // Fetch comprehensive analytics data with error handling
        const [
          statsResponse,
          analyticsResponse,
          salesResponse,
          productsResponse,
        ] = await Promise.allSettled([
          creatorApi.getStats(),
          creatorApi.getSalesAnalytics(),
          creatorApi.getSales(50), // Get more sales for analytics
          creatorApi.getProducts(),
        ]);

        // Handle each response safely
        const stats =
          statsResponse.status === "fulfilled"
            ? statsResponse.value
            : { total_sales: 0, total_revenue: 0, product_breakdown: [] };
        const analytics =
          analyticsResponse.status === "fulfilled"
            ? analyticsResponse.value
            : { daily_revenue: [], top_products: [] };
        const products =
          productsResponse.status === "fulfilled" &&
          Array.isArray(productsResponse.value)
            ? productsResponse.value
            : [];
        const sales =
          salesResponse.status === "fulfilled" &&
          Array.isArray(salesResponse.value)
            ? salesResponse.value
            : [];

        // Comprehensive stats for analytics
        const formattedStats = {
          totalProducts: products.length,
          totalSales: stats.total_sales || 0,
          totalRevenue: stats.total_revenue || 0,
          averageOrderValue:
            stats.total_sales > 0
              ? (stats.total_revenue / stats.total_sales).toFixed(2)
              : 0,
          bestSellingProduct:
            stats.product_breakdown && stats.product_breakdown.length > 0
              ? stats.product_breakdown.reduce((prev, current) =>
                  prev.sales > current.sales ? prev : current
                )
              : null,
          productBreakdown: stats.product_breakdown || [],
          activeProducts: products.filter((p) => p.is_active).length,
          draftProducts: products.filter((p) => !p.is_active).length,
        };

        // Enhanced analytics data
        const formattedAnalyticsData = {
          revenue: Array.isArray(analytics.daily_revenue)
            ? analytics.daily_revenue
            : [],
          salesByProduct: Array.isArray(analytics.top_products)
            ? analytics.top_products
            : [],
          salesByCategory: [], // We can add this later if needed
          conversionRate: 0, // Can be calculated if we track views
          totalViews: 0, // Placeholder for when we add view tracking
        };

        setStats(formattedStats);
        setAnalyticsData(formattedAnalyticsData);
        setRecentSales(sales);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        // Set empty data on error
        setStats({
          totalProducts: 0,
          totalSales: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          bestSellingProduct: null,
          productBreakdown: [],
          activeProducts: 0,
          draftProducts: 0,
        });
        setAnalyticsData({
          revenue: [],
          salesByProduct: [],
          salesByCategory: [],
          conversionRate: 0,
          totalViews: 0,
        });
        setRecentSales([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [selectedTimeRange]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const timeRangeOptions = [
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "90d", label: "Last 3 Months" },
    { value: "1y", label: "Last Year" },
  ];

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

  const hasData = stats.totalSales > 0 || stats.totalProducts > 0;

  return (
    <ProtectedRoute requireAuth={true} requiredRole="creator">
      <PageContainer>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Analytics Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Analytics & Insights
              </h1>
              <p className="text-gray-300 text-lg">
                Deep dive into your sales performance and business metrics
              </p>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center space-x-3 bg-dark-400 px-4 py-2 rounded-xl border border-dark-300 shadow-card">
              <span className="text-sm font-medium text-gray-300 whitespace-nowrap">
                Time Range:
              </span>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-4 py-2 border-0 bg-dark-500 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-500 cursor-pointer hover:bg-dark-400 transition-colors"
              >
                {timeRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!hasData ? (
            /* No Data State */
            <div className="text-center py-16">
              <Card className="max-w-2xl mx-auto border-2 border-neon-500 shadow-neon">
                <CardContent className="p-12">
                  <div className="w-20 h-20 bg-dark-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <BarChart3 className="w-10 h-10 text-neon-500" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    No Analytics Data Yet
                  </h3>
                  <p className="text-gray-300 mb-8 leading-relaxed text-lg">
                    Your analytics will appear here once you start making sales.
                    Upload some products and share them with your audience to
                    get started!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/creator/upload">
                      <Button
                        variant="pink"
                        className="flex items-center space-x-2"
                      >
                        <Package className="w-5 h-5" />
                        <span>Upload Your First Product</span>
                      </Button>
                    </Link>
                    <Link href="/creator/products">
                      <Button
                        variant="outline"
                        className="flex items-center space-x-2"
                      >
                        <Eye className="w-5 h-5" />
                        <span>Manage Products</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <StatsCard
                  title="Total Revenue"
                  value={formatCurrency(stats.totalRevenue)}
                  icon={<DollarSign className="w-6 h-6 text-neon-500" />}
                  trend="up"
                  trendValue="12%"
                />
                <StatsCard
                  title="Total Sales"
                  value={stats.totalSales}
                  icon={<TrendingUp className="w-6 h-6 text-neon-500" />}
                  trend="up"
                  trendValue="8"
                />
                <StatsCard
                  title="Average Order Value"
                  value={formatCurrency(stats.averageOrderValue)}
                  icon={<BarChart3 className="w-6 h-6 text-neon-500" />}
                  trend="up"
                  trendValue="$5.20"
                />
                <StatsCard
                  title="Active Products"
                  value={stats.activeProducts}
                  subtitle={`${stats.draftProducts} drafts`}
                  icon={<Package className="w-6 h-6 text-neon-500" />}
                />
                <StatsCard
                  title="Total Products"
                  value={stats.totalProducts}
                  subtitle="All time"
                  icon={<Package className="w-6 h-6 text-neon-500" />}
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card hover>
                  <CardContent className="p-6">
                    {analyticsData.revenue.length > 0 ? (
                      <AnalyticsChart
                        type="line"
                        data={analyticsData.revenue}
                        title="Revenue Trend"
                      />
                    ) : (
                      <div className="h-64 flex items-center justify-center bg-dark-500 rounded-xl">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-dark-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <TrendingUp className="w-8 h-8 text-neon-500" />
                          </div>
                          <p className="text-gray-300 font-medium">
                            No revenue data for selected period
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card hover>
                  <CardContent className="p-6">
                    {analyticsData.salesByProduct.length > 0 ? (
                      <AnalyticsChart
                        type="bar"
                        data={analyticsData.salesByProduct}
                        title="Sales by Product"
                      />
                    ) : (
                      <div className="h-64 flex items-center justify-center bg-dark-500 rounded-xl">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-dark-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <BarChart3 className="w-8 h-8 text-neon-500" />
                          </div>
                          <p className="text-gray-300 font-medium">
                            No sales data for selected period
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Product Performance Table */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card hover>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white">
                          Product Performance
                        </h2>
                        <Link href="/creator/products">
                          <Button variant="ghost" size="small" className="text-neon-500 hover:text-neon-400">
                            Manage Products
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {stats.productBreakdown.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-dark-500">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Product
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Sales
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Revenue
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                  Performance
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-300">
                              {stats.productBreakdown.map((product, index) => (
                                <tr key={product.product_id} className="hover:bg-dark-500 transition-colors">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-white">
                                      {product.product_title}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-300">
                                      {product.sales}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-semibold text-neon-500">
                                      {formatCurrency(product.revenue)}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="w-16 bg-dark-500 rounded-full h-2 mr-2">
                                        <div
                                          className="bg-neon-500 h-2 rounded-full"
                                          style={{
                                            width: `${Math.min(
                                              (product.sales /
                                                Math.max(
                                                  ...stats.productBreakdown.map(
                                                    (p) => p.sales
                                                  )
                                                )) *
                                                100,
                                              100
                                            )}%`,
                                          }}
                                        ></div>
                                      </div>
                                      <span className="text-xs text-gray-400">
                                        {index === 0
                                          ? "Best"
                                          : index < 3
                                          ? "Good"
                                          : "Average"}
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-8 text-center bg-dark-500 rounded-xl">
                          <div className="w-16 h-16 bg-dark-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Package className="w-8 h-8 text-neon-500" />
                          </div>
                          <p className="text-gray-300 font-medium">
                            No products found
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Best Selling Product Card */}
                <div>
                  <Card hover>
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-white">
                        Top Performer
                      </h3>
                    </CardHeader>
                    <CardContent>
                      {stats.bestSellingProduct ? (
                        <div className="text-center">
                          <div className="w-16 h-16 bg-dark-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <TrendingUp className="w-8 h-8 text-neon-500" />
                          </div>
                          <h4 className="font-semibold text-white mb-2">
                            {stats.bestSellingProduct.product_title}
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Sales:</span>
                              <span className="font-semibold text-white">
                                {stats.bestSellingProduct.sales}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Revenue:</span>
                              <span className="font-semibold text-neon-500">
                                {formatCurrency(
                                  stats.bestSellingProduct.revenue
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center bg-dark-500 rounded-xl p-6">
                          <div className="w-16 h-16 bg-dark-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Package className="w-8 h-8 text-neon-500" />
                          </div>
                          <p className="text-gray-300 font-medium">
                            No sales data yet
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card hover className="mt-6">
                    <CardHeader>
                      <h3 className="text-lg font-semibold text-white">
                        Recent Activity
                      </h3>
                    </CardHeader>
                    <CardContent>
                      {recentSales.length > 0 ? (
                        <div className="space-y-3">
                          {recentSales.slice(0, 5).map((sale) => (
                            <div
                              key={sale.id}
                              className="flex items-center justify-between text-sm p-3 bg-dark-500 rounded-lg hover:bg-dark-400 transition-colors"
                            >
                              <div>
                                <div className="font-medium text-white truncate">
                                  {sale.product}
                                </div>
                                <div className="text-gray-400">
                                  {formatDate(sale.sale_date)}
                                </div>
                              </div>
                              <div className="font-semibold text-neon-500">
                                {formatCurrency(sale.amount)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center bg-dark-500 rounded-xl p-6">
                          <div className="w-16 h-16 bg-dark-400 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-neon-500" />
                          </div>
                          <p className="text-gray-300 font-medium">
                            No recent activity
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </PageContainer>
    </ProtectedRoute>
  );
}
