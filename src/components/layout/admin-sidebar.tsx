"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  CalendarDays,
  DollarSign,
  LogOut,
  Menu,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { logout } from "@/actions/auth";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { BrandIcon } from "@/components/ui/brand-logo";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: Package },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Schedule", href: "/admin/schedule", icon: CalendarDays },
  { label: "Revenue", href: "/admin/revenue", icon: DollarSign },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  const navContent = (
    <>
      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-slate-700">
        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-3 text-slate-300 hover:text-red-400 hover:bg-white/5"
          >
            <LogOut className="size-4" />
            Log Out
          </Button>
        </form>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-slate-900 text-white">
        {/* Brand */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-700">
          <BrandIcon className="size-7" />
          <span className="text-lg font-bold">Admin Panel</span>
        </div>

        {navContent}
      </aside>

      {/* Mobile header bar with menu trigger */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50 flex items-center h-14 px-4 border-b bg-slate-900 text-white">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Menu className="size-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-slate-900 text-white border-slate-700">
            <SheetHeader className="px-6 py-5 border-b border-slate-700">
              <SheetTitle className="flex items-center gap-2 text-white">
                <BrandIcon className="size-6" />
                Admin Panel
              </SheetTitle>
            </SheetHeader>
            {navContent}
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2 ml-3">
          <BrandIcon className="size-5" />
          <span className="font-semibold text-sm">Admin Panel</span>
        </div>
      </div>
    </>
  );
}
