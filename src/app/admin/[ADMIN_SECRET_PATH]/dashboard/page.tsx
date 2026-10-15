"use client"
import { useEffect, useState } from "react";
import { BarChart, DoughnutChart } from '../_components/Charts';
import Table from '../_components/DashboardTable';
import WidgetItem from '../_components/WidgetItem';
import CategoryItem from '../_components/CategoryItem';
import { getDashboardData } from "@/app/services/api";

interface DashboardMetrics {
  summary: {
    revenue: number;
    userCount: number;
    orderCount: number;
    productCount: number;
    pendingPaymentCount: number;
  };
  revenueSeries: {
    labels: string[];
    revenue: number[];
    orders: number[];
  };
  categoryBreakdown: {
    name: string;
    productCount: number;
    percentage: number;
  }[];
  latestOrders: {
    id: string;
    customerName: string;
    total: number;
    paymentStatus: string;
    orderStatus: string;
    createdAt: string;
  }[];
  statusBreakdown: {
    pending: number;
    shipped: number;
    delivered: number;
  };
}

const Dashboard = () => {
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const dashboardData = await getDashboardData();
        setData(dashboardData);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format latest orders for table
  const tableData = data?.latestOrders || [];

  // Format status breakdown for doughnut chart
  const statusLabels = ["Pending", "Shipped", "Delivered"];
  const statusData = data?.statusBreakdown 
    ? [data.statusBreakdown.pending, data.statusBreakdown.shipped, data.statusBreakdown.delivered]
    : [0, 0, 0];

  if (error) {
    return (
      <div className="admin-overview w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">Error loading dashboard: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-overview w-full space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">A quick view of revenue, inventory, and recent activity.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <WidgetItem
            amount={true}
            value={data?.summary.revenue || 0}
            heading="Revenue"
            color="var(--store-accent)"
            loading={loading}
          />
          <WidgetItem 
            value={data?.summary.userCount || 0}
            color="var(--store-accent)"
            heading="Users"
            loading={loading}
          />
          <WidgetItem
            value={data?.summary.orderCount || 0}
            color="var(--store-accent)"
            heading="Orders"
            loading={loading}
          />
          <WidgetItem
            value={data?.summary.pendingPaymentCount || 0}
            color="var(--store-accent)"
            heading="Pending payments"
            loading={loading}
          />
          <WidgetItem
            value={data?.summary.productCount || 0}
            color="var(--store-accent)"
            heading="Products"
            loading={loading}
          />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
            <h2 className="text-lg font-semibold text-gray-900">Revenue & Transaction</h2>
            <p className="text-sm text-gray-500">Weekly movement across revenue and transaction volume.</p>
          </div>
          <div className="p-4 sm:p-6 lg:p-8">
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-500">Loading chart...</p>
                </div>
              ) : (
                <BarChart
                  data_1={data?.revenueSeries.revenue || []}
                  data_2={data?.revenueSeries.orders || []}
                  title_1="Revenue"
                  title_2="Orders"
                  bgColor_1="#111111"
                  bgColor_2="rgba(17, 17, 17, 0.16)"
                  labels={data?.revenueSeries.labels || []}
                />
              )}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
            <h2 className="text-lg font-semibold text-gray-900">Inventory</h2>
            <p className="text-sm text-gray-500">Category mix based on current catalog.</p>
          </div>
          <div className="space-y-3 p-4 sm:p-6">
              {loading ? (
                <p className="text-sm text-gray-500">Loading categories...</p>
              ) : data?.categoryBreakdown && data.categoryBreakdown.length > 0 ? (
                data.categoryBreakdown.map((cat) => (
                  <CategoryItem
                    key={cat.name}
                    value={cat.percentage}
                    heading={cat.name}
                    color="#111111"
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500">No categories available</p>
              )}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <section className="relative rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="border-b border-gray-200 px-2 pb-4">
            <h2 className="text-lg font-semibold text-gray-900">Order Status Split</h2>
            <p className="text-sm text-gray-500">Distribution of order statuses.</p>
          </div>
          <div className="relative px-2 py-6">
            {loading ? (
              <div className="h-40 flex items-center justify-center">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : (
              <>
                <DoughnutChart
                  labels={statusLabels}
                  data={statusData}
                  backgroundColor={[
                    "#111111",
                    "#6e6e73",
                    "#d2d2d7",
                  ]}
                  cutout={90}
                />
                <p className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl text-black/50">
                  <span>{data?.summary.orderCount || 0}</span>
                </p>
              </>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
            <h2 className="text-lg font-semibold text-gray-900">Latest Orders</h2>
            <p className="text-sm text-gray-500">Recent orders and their status snapshots.</p>
          </div>
          <div className="overflow-x-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  Loading orders...
                </div>
              ) : tableData.length > 0 ? (
                <Table data={tableData} />
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No orders yet
                </div>
              )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
