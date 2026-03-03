import Link from "next/link";
import { Users, Search } from "lucide-react";
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
import { getAdminCustomers } from "@/actions/admin";

export const metadata = {
  title: "Customers - Admin",
};

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const { search } = await searchParams;
  const result = await getAdminCustomers(search);

  if ("error" in result && result.error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Customers
        </h1>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Failed to load customers: {result.error}
          </CardContent>
        </Card>
      </div>
    );
  }

  const customers = result.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Customers
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage all registered customers.
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent>
          <form className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                name="search"
                type="text"
                defaultValue={search ?? ""}
                placeholder="Search by name or phone..."
                className="flex h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground"
            >
              Search
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-4" />
            All Customers
          </CardTitle>
          <CardDescription>
            {customers.length} customer{customers.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Referrals</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id} className="cursor-pointer">
                    <TableCell>
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {customer.full_name ?? "Unnamed"}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {customer.phone ?? "--"}
                    </TableCell>
                    <TableCell>{customer.orderCount}</TableCell>
                    <TableCell>
                      {customer.totalSpent > 0
                        ? formatCents(customer.totalSpent)
                        : "--"}
                    </TableCell>
                    <TableCell>{customer.referralCount}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(customer.created_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Users className="size-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No customers found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
