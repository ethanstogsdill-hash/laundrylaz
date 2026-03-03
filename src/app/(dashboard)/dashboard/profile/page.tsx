"use client";

import { useEffect, useState, useTransition } from "react";
import {
  User,
  Mail,
  Phone,
  Copy,
  Check,
  Loader2,
  Gift,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getProfile, updateProfile } from "@/actions/profile";
import { formatCents } from "@/lib/constants";

interface ProfileData {
  id: string;
  email?: string;
  full_name: string | null;
  phone: string | null;
  referral_code: string | null;
  credit_balance_cents: number;
  sms_opt_in: boolean;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getProfile().then((result) => {
      if (result.data) {
        const p = result.data;
        setProfile(p as ProfileData);
        setFullName(p.full_name || "");
        setPhone(p.phone || "");
        setSmsOptIn(p.sms_opt_in);
      } else if (result.error) {
        setError(result.error);
      }
      setLoading(false);
    });
  }, []);

  const handleSave = () => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("full_name", fullName);
      fd.set("phone", phone);
      fd.set("sms_opt_in", smsOptIn ? "true" : "false");

      const result = await updateProfile(fd);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Profile updated successfully.");
        if (result.data) {
          setProfile((prev) =>
            prev ? { ...prev, ...result.data } : prev
          );
        }
      }
    });
  };

  const copyReferralCode = async () => {
    if (!profile?.referral_code) return;
    try {
      await navigator.clipboard.writeText(profile.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API not available
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account details and preferences.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-4" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your name and contact info.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                <Input
                  id="email"
                  value={profile?.email || ""}
                  disabled
                  className="opacity-60"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed here.
              </p>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(352) 555-0123"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">SMS Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Receive text updates about your orders.
                </p>
              </div>
              <Switch
                checked={smsOptIn}
                onCheckedChange={setSmsOptIn}
              />
            </div>

            <Button onClick={handleSave} disabled={isPending} className="w-full">
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Referral & Credits */}
        <div className="space-y-6">
          {/* Credit Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="size-4" />
                Credit Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {formatCents(profile?.credit_balance_cents || 0)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Credits are automatically applied to your next order.
              </p>
            </CardContent>
          </Card>

          {/* Referral Code */}
          {profile?.referral_code && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="size-4" />
                  Referral Code
                </CardTitle>
                <CardDescription>
                  Share your code and earn credits when friends sign up!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-md border bg-muted/30 px-4 py-2 font-mono text-lg tracking-wider text-center">
                    {profile.referral_code}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyReferralCode}
                  >
                    {copied ? (
                      <Check className="size-4 text-green-600" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
