import Link from "next/link";
import { BRAND } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-12">
      <div className="mb-8">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-primary hover:opacity-80 transition-opacity"
        >
          {BRAND.name}
        </Link>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
