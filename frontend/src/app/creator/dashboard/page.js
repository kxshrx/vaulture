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

  // Mock data - replace with API calls
  useEffect(() => {
    const mockStats = {
      totalProducts: 12,
      totalSales: 342,
      totalRevenue: 8450.5,
      bestProduct: "Digital Art Collection Vol. 1",
    };

    const mockRecentSales = [
      {
        id: 1,
        product: "Digital Art Collection Vol. 1",
        buyer: "John Doe",
        saleDate: "2025-01-15T10:30:00Z",
        amount: 29.99,
      },
      {
        id: 2,
        product: "UI/UX Templates Pack",
        buyer: "Sarah Wilson",
        saleDate: "2025-01-15T08:15:00Z",
        amount: 49.99,
      },
      {
        id: 3,
        product: "Photography Presets",
        buyer: "Mike Johnson",
        saleDate: "2025-01-14T16:45:00Z",
        amount: 19.99,
      },
      {
        id: 4,
        product: "Logo Design Templates",
        buyer: "Emily Brown",
        saleDate: "2025-01-14T14:20:00Z",
        amount: 39.99,
      },
      {
        id: 5,
        product: "Digital Art Collection Vol. 1",
        buyer: "David Lee",
        saleDate: "2025-01-14T11:30:00Z",
        amount: 29.99,
      },
    ];

    const mockAnalyticsData = {
      revenue: [
        { name: "Jan 1", value: 120 },
        { name: "Jan 2", value: 200 },
        { name: "Jan 3", value: 150 },
        { name: "Jan 4", value: 300 },
        { name: "Jan 5", value: 250 },
        { name: "Jan 6", value: 400 },
        { name: "Jan 7", value: 350 },
      ],
      salesByProduct: [
        { name: "Digital Art Vol. 1", value: 89 },
        { name: "UI/UX Templates", value: 67 },
        { name: "Photo Presets", value: 45 },
        { name: "Logo Templates", value: 34 },
        { name: "Abstract Art", value: 23 },
      ],
      salesByCategory: [
        { name: "Digital Art", value: 156 },
        { name: "Templates", value: 101 },
        { name: "Photography", value: 67 },
        { name: "Graphics", value: 18 },
      ],
    };

    setStats(mockStats);
    setRecentSales(mockRecentSales);
    setAnalyticsData(mockAnalyticsData);
    setLoading(false);
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
              icon={<Package className="w-6 h-6 text-blue-600" />}
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
                  <Plus className="w-8 h-8 text-blue-600 mx-auto mb-2" />
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
