import { createClient, createAdminClient } from "@/lib/supabase/server";
import { error, success } from "@/helpers/apiResponseWrapper";
import { NextRequest } from "next/server";

export const dynamic = 'force-dynamic';

interface DashboardData {
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

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return Response.json(error(401, "Token Expired"), { status: 401 });
    }

    const adminSupabase = createAdminClient();

    // Check admin status
    const { data: profile, error: profileError } = await adminSupabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single() as { data: { is_admin: boolean } | null; error: any };

    if (profileError || !profile?.is_admin) {
      console.error("Admin check error:", profileError);
      return Response.json(error(401, "You are not an Admin"), { status: 401 });
    }

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const [profileRes, productRes, orderRes, paidOrdersRes, last7DaysOrdersRes, categoriesRes, latestOrdersRes, pendingRes, shippedRes, deliveredRes, pendingPaymentsRes] = await Promise.all([
      adminSupabase.from("profiles").select("*", { count: "exact", head: true }),
      adminSupabase.from("products").select("*", { count: "exact", head: true }),
      adminSupabase.from("orders").select("*", { count: "exact", head: true }),
      adminSupabase.from("orders").select("total").in("payment_status", ["CAPTURED", "COMPLETED"]),
      adminSupabase.from("orders").select("created_at, total, status, payment_status").gte("created_at", last7Days.toISOString()),
      adminSupabase.from("categories").select("id, name, products(id)"),
      adminSupabase.from("orders").select("id, user_id, total, status, payment_status, created_at, user:profiles(name)").order("created_at", { ascending: false }).limit(5),
      adminSupabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
      adminSupabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "shipped"),
      adminSupabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "delivered"),
      adminSupabase.from("orders").select("id", { count: "exact", head: true }).eq("payment_status", "PENDING"),
    ]);

    const profileCount = profileRes.count || 0;
    const productCount = productRes.count || 0;
    const orderCount = orderRes.count || 0;

    // Calculate total revenue from paid/captured orders
    const paidOrders = paidOrdersRes.data;
    if (paidOrdersRes.error) console.error("Error fetching revenue:", paidOrdersRes.error);

    const totalRevenue = (paidOrders || []).reduce((sum: number, order: any) => sum + (parseFloat(order.total) || 0), 0);

    const last7DaysOrders = last7DaysOrdersRes.data;
    if (last7DaysOrdersRes.error) console.error("Error fetching 7-day orders:", last7DaysOrdersRes.error);

    // Group by day for last 7 days
    const dayData: { [key: string]: { revenue: number; count: number } } = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      dayData[dateStr] = { revenue: 0, count: 0 };
    }

    (last7DaysOrders || []).forEach((order: any) => {
      const dateStr = new Date(order.created_at).toISOString().split("T")[0];
      if (dayData[dateStr]) {
        dayData[dateStr].count += 1;
        if (["CAPTURED", "COMPLETED"].includes(order.payment_status)) {
          dayData[dateStr].revenue += parseFloat(order.total) || 0;
        }
      }
    });

    const labels = Object.keys(dayData);
    const revenueSeries = labels.map((date) => dayData[date].revenue);
    const orderSeries = labels.map((date) => dayData[date].count);

    const categories = categoriesRes.data;
    if (categoriesRes.error) console.error("Error fetching categories:", categoriesRes.error);

    const categoryBreakdown = (categories || [])
      .map((cat: any) => ({
        name: cat.name,
        productCount: (cat.products || []).length,
        percentage: productCount > 0 ? Math.round(((cat.products || []).length / productCount) * 100) : 0,
      }))
      .sort((a: any, b: any) => b.productCount - a.productCount);

    const latestOrders = latestOrdersRes.data;
    if (latestOrdersRes.error) console.error("Error fetching latest orders:", latestOrdersRes.error);

    const formattedLatestOrders = (latestOrders || []).map((order: any) => ({
      id: order.id.substring(0, 8),
      customerName: order.user?.name || "Unknown",
      total: parseFloat(order.total) || 0,
      paymentStatus: order.payment_status,
      orderStatus: order.status,
      // Keep timestamps machine-readable; the dashboard formats them for display.
      createdAt: order.created_at,
    }));

    const statusBreakdown = {
      pending: pendingRes.count || 0,
      shipped: shippedRes.count || 0,
      delivered: deliveredRes.count || 0,
    };

    const dashboardData: DashboardData = {
      summary: {
        revenue: Math.round(totalRevenue),
        userCount: profileCount,
        orderCount: orderCount,
        productCount: productCount,
        pendingPaymentCount: pendingPaymentsRes.count || 0,
      },
      revenueSeries: {
        labels: labels.map((d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })),
        revenue: revenueSeries,
        orders: orderSeries,
      },
      categoryBreakdown,
      latestOrders: formattedLatestOrders,
      statusBreakdown,
    };

    return Response.json(success(200, dashboardData));
  } catch (err) {
    console.error("Dashboard API error:", err);
    return Response.json(error(500, "Something went wrong"), { status: 500 });
  }
}
