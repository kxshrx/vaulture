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
import {
  creatorApi,
  profileApi,
  getImageUrl,
  mapToStandardCategory,
} from "@/lib/api";
import {
  Package,
  DollarSign,
  TrendingUp,
  Users,
  Plus,
  Eye,
  Calendar,
} from "lucide-react";

export default function CreatorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recentSales, setRecentSales] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch real data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch stats, recent sales, and analytics data in parallel
        const [
          statsResponse,
          salesResponse,
          analyticsResponse,
          productsResponse,
        ] = await Promise.all([
          creatorApi.getStats(),
          creatorApi.getSales(5), // Get last 5 sales
          creatorApi.getSalesAnalytics(),
          creatorApi.getProducts(),
        ]);

        // Format stats
        const formattedStats = {
          totalProducts: productsResponse.length,
          totalSales: statsResponse.total_sales || 0,
          totalRevenue: statsResponse.total_revenue || 0,
          bestProduct:
            statsResponse.product_breakdown &&
            statsResponse.product_breakdown.length > 0
              ? statsResponse.product_breakdown.reduce((prev, current) =>
                  prev.sales > current.sales ? prev : current
                ).product_title
              : "No products yet",
        };

        // Recent sales are already formatted from the API
        const formattedRecentSales = salesResponse || [];

        // Format analytics data
        const formattedAnalyticsData = {
          revenue: analyticsResponse.daily_revenue || [],
          salesByProduct: analyticsResponse.top_products || [],
          salesByCategory: [], // We'll need to implement this if needed
        };

        setStats(formattedStats);
        setRecentSales(formattedRecentSales);
        setAnalyticsData(formattedAnalyticsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Set empty data on error
        setStats({
          totalProducts: 0,
          totalSales: 0,
          totalRevenue: 0,
          bestProduct: "No data available",
        });
        setRecentSales([]);
        setAnalyticsData({
          revenue: [],
          salesByProduct: [],
          salesByCategory: [],
        });
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
                Welcome back, {user.name}! Here's your business overview.
              </p>
            </div>
            <Link href="/creator/upload">
              <Button variant="pink" className="flex items-center space-x-2">
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
              icon={<Package className="w-6 h-6 text-primary-600" />}
              trend="up"
              trendValue="2"
            />
            <StatsCard
              title="Total Sales"
              value={stats.totalSales}
              icon={<TrendingUp className="w-6 h-6 text-green-600" />}
              trend="up"
              trendValue="23"
            />
            <StatsCard
              title="Total Revenue"
              value={`$${stats.totalRevenue?.toFixed(2)}`}
              icon={<DollarSign className="w-6 h-6 text-purple-600" />}
              trend="up"
              trendValue="$234"
            />
            <StatsCard
              title="Best Product"
              value={stats.bestProduct}
              subtitle="89 sales"
              icon={<Users className="w-6 h-6 text-orange-600" />}
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link href="/creator/upload">
              <Card hover className="cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Plus className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">
                    Upload New Product
                  </h3>
                  <p className="text-sm text-gray-600">
                    Add a new digital product to sell
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/creator/products">
              <Card hover className="cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Package className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">
                    Manage Products
                  </h3>
                  <p className="text-sm text-gray-600">
                    Edit and organize your products
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/creator/analytics">
              <Card hover className="cursor-pointer">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">
                    View Analytics
                  </h3>
                  <p className="text-sm text-gray-600">
                    Detailed sales and revenue data
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <AnalyticsChart
                  type="line"
                  data={analyticsData.revenue}
                  title="Revenue Over Time (Last 7 Days)"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <AnalyticsChart
                  type="bar"
                  data={analyticsData.salesByProduct}
                  title="Sales by Product"
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Sales */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Recent Sales
                    </h2>
                    <Link href="/creator/sales">
                      <Button variant="ghost" size="small">
                        View All
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Buyer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {recentSales.map((sale) => (
                          <tr key={sale.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {sale.product}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {sale.buyer}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatDate(sale.saleDate)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-green-600">
                                ${sale.amount.toFixed(2)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sales by Category */}
            <div>
              <Card>
                <CardContent className="p-6">
                  <AnalyticsChart
                    type="pie"
                    data={analyticsData.salesByCategory}
                    title="Sales by Category"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageContainer>
    </ProtectedRoute>
  );
}
