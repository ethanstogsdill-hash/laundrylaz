import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Gift,
  Copy,
  Users,
  Wallet,
  ArrowRight,
  Share2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
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
import { formatCents, PRICING } from "@/lib/constants";
import { CopyReferralButton } from "./copy-button";

export const metadata = {
  title: "Referrals",
};

export default async function ReferralsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile for referral code and balance
  const { data: profile } = await supabase
    .from("profiles")
    .select("referral_code, credit_balance_cents")
    .eq("id", user.id)
    .single();

  // Fetch referrals made by this user
  const { data: referrals } = await supabase
    .from("referrals")
    .select(
      `
      *,
      profiles!referrals_referee_id_fkey (full_name)
    `
    )
    .eq("referrer_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch credit transactions
  const { data: transactions } = await supabase
    .from("credit_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const referralCode = profile?.referral_code || "";
  const creditBalance = profile?.credit_balance_cents || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Referrals</h1>
        <p className="text-muted-foreground mt-1">
          Invite friends and earn credits toward your next order.
        </p>
      </div>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="size-5" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 mx-auto mb-3">
                <Share2 className="size-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">1. Share Your Code</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Send your unique referral code to friends.
              </p>
            </div>
            <div className="text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 mx-auto mb-3">
                <Users className="size-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">2. Friend Signs Up</h3>
              <p className="text-xs text-muted-foreground mt-1">
                They enter your code when creating their account.
              </p>
            </div>
            <div className="text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 mx-auto mb-3">
                <Wallet className="size-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">3. Both Earn Credits</h3>
              <p className="text-xs text-muted-foreground mt-1">
                You both get {formatCents(PRICING.referralCreditCents)} in
                credits after their first order.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Referral Code Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Code</CardTitle>
          </CardHeader>
          <CardContent>
            {referralCode ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-md border bg-muted/30 px-4 py-3 font-mono text-xl tracking-wider text-center">
                    {referralCode}
                  </div>
                  <CopyReferralButton code={referralCode} />
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No referral code assigned yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Credit Balance */}
        <Card>
          <CardHeader>
            <CardTitle>Credit Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              {formatCents(creditBalance)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Applied automatically to your next order.
            </p>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Referral Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Referrals</span>
                <span className="font-medium">{referrals?.length || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium">
                  {referrals?.filter((r) => r.status === "completed").length ||
                    0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-medium">
                  {referrals?.filter((r) => r.status === "pending").length || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referrals List */}
      {referrals && referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Referrals</CardTitle>
            <CardDescription>
              People who signed up using your code.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((ref) => {
                  const refProfile = ref.profiles as {
                    full_name: string | null;
                  } | null;
                  const statusColors: Record<string, string> = {
                    pending: "bg-yellow-100 text-yellow-800",
                    completed: "bg-green-100 text-green-800",
                    expired: "bg-gray-100 text-gray-800",
                  };
                  return (
                    <TableRow key={ref.id}>
                      <TableCell>
                        {refProfile?.full_name || "Unknown"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            statusColors[ref.status] ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {ref.status.charAt(0).toUpperCase() +
                            ref.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>{formatCents(ref.reward_cents)}</TableCell>
                      <TableCell>
                        {new Date(ref.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Credit Transaction History */}
      {transactions && transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Credit History</CardTitle>
            <CardDescription>
              Your recent credit transactions.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => {
                  const typeLabels: Record<string, string> = {
                    referral_bonus: "Referral Bonus",
                    referral_reward: "Referral Reward",
                    order_payment: "Order Payment",
                  };
                  return (
                    <TableRow key={tx.id}>
                      <TableCell>
                        {new Date(tx.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        {typeLabels[tx.type] || tx.type}
                      </TableCell>
                      <TableCell>
                        {tx.description || "-"}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          tx.amount_cents >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {tx.amount_cents >= 0 ? "+" : ""}
                        {formatCents(tx.amount_cents)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
