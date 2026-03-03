import {
  DollarSign,
  TrendingUp,
  Calendar,
  BarChart3,
  CreditCard,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCents } from "@/lib/constants";
import { getRevenueStats } from "@/actions/admin";

export const metadata = {
  title: "Revenue - Admin",
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  succeeded: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

export default async function AdminRevenuePage() {
  const result = await getRevenueStats();

  if ("error" in result && result.error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Revenue
        </h1>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Failed to load revenue data: {result.error}
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = result.data!;

  const summaryCards = [
    {
      label: "Today",
      value: formatCents(stats.todayRevenue),
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "This Week",
      value: formatCents(stats.weekRevenue),
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "This Month",
      value: formatCents(stats.monthRevenue),
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      label: "All Time",
      value: formatCents(stats.allTimeRevenue),
      icon: BarChart3,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Revenue
        </h1>
        <p className="text-muted-foreground mt-1">
          Track revenue and payment history.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <CardContent className="flex items-center gap-4">
                <div
                  className={`flex size-12 items-center justify-center rounded-lg ${card.bgColor}`}
                >
                  <Icon className={`size-6 ${card.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-4" />
              Revenue Chart
            </CardTitle>
            <CardDescription>
              Revenue over time.
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

        {/* Orders by Revenue Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-4" />
              Revenue Breakdown
            </CardTitle>
            <CardDescription>
              Revenue breakdown by category.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48 rounded-md border border-dashed text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="size-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Breakdown chart coming soon</p>
                <p className="text-xs">Recharts integration planned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="size-4" />
            Recent Payments
          </CardTitle>
          <CardDescription>Last 20 payment transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentPayments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentPayments.map(
                  (payment: {
                    id: string;
                    amount_cents: number;
                    status: string;
                    created_at: string;
                    orders: {
                      id: string;
                      profiles: { full_name: string | null } | null;
                    } | null;
                  }) => {
                    const statusColor =
                      PAYMENT_STATUS_COLORS[payment.status] ??
                      "bg-gray-100 text-gray-800";

                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-xs">
                          #{payment.id.slice(0, 8)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {payment.orders?.profiles?.full_name ?? "Unknown"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCents(payment.amount_cents)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}
                          >
                            {payment.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(payment.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            }
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  }
                )}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <CreditCard className="size-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No payments recorded yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
