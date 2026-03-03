import Link from "next/link";
import {
  Package,
  Truck,
  DollarSign,
  Users,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  formatCents,
} from "@/lib/constants";
import { getAdminDashboardStats } from "@/actions/admin";
import type { OrderStatus } from "@/lib/supabase/types";

export const metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const result = await getAdminDashboardStats();

  if ("error" in result && result.error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Admin Dashboard
        </h1>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Failed to load dashboard data: {result.error}
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = result.data!;

  const kpis = [
    {
      label: "Today's Orders",
      value: stats.todayOrders,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Pending Pickups",
      value: stats.pendingPickups,
      icon: Truck,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      label: "Revenue This Week",
      value: formatCents(stats.weekRevenue),
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Total Customers",
      value: stats.totalCustomers,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Overview of Fresh Laundry Cafe operations.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardContent className="flex items-center gap-4">
                <div
                  className={`flex size-12 items-center justify-center rounded-lg ${kpi.bgColor}`}
                >
                  <Icon className={`size-6 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="size-4" />
              Today&apos;s Orders
            </CardTitle>
            <CardDescription>
              Orders received today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.todayOrdersList.length > 0 ? (
              <div className="space-y-3">
                {stats.todayOrdersList.map((order) => {
                  const profile = order.profiles as {
                    full_name: string | null;
                  } | null;
                  const statusKey = order.status as OrderStatus;
                  const statusLabel =
                    ORDER_STATUS_LABELS[
                      statusKey as keyof typeof ORDER_STATUS_LABELS
                    ] ?? order.status;
                  const statusColor =
                    ORDER_STATUS_COLORS[
                      statusKey as keyof typeof ORDER_STATUS_COLORS
                    ] ?? "bg-gray-100 text-gray-800";

                  return (
                    <Link
                      key={order.id}
                      href={`/admin/orders/${order.id}`}
                      className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}
                        >
                          {statusLabel}
                        </span>
                        <span className="text-sm font-medium truncate">
                          {profile?.full_name ?? "Unknown"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          #{order.id.slice(0, 8)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {order.total_cents != null && (
                          <span className="text-sm font-medium">
                            {formatCents(order.total_cents)}
                          </span>
                        )}
                        <ArrowRight className="size-4 text-muted-foreground" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                No orders today yet.
              </p>
            )}
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href="/admin/orders">View All Orders</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Charts placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-4" />
              Revenue Chart
            </CardTitle>
            <CardDescription>
              Weekly revenue overview.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48 rounded-md border border-dashed text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="size-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Charts coming soon</p>
                <p className="text-xs">Recharts integration planned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
