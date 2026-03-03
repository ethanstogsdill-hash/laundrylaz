import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg" | "xl";
  /** Show text next to icon */
  showText?: boolean;
  /** Text color override (for dark backgrounds) */
  textClassName?: string;
}

const iconSizes = {
  sm: 48,
  md: 64,
  lg: 80,
  xl: 120,
};

/**
 * Fresh Laundry & Cafe brand logo.
 * Uses the official logo from /logo.jpg.
 */
export function BrandLogo({
  className,
  size = "md",
  showText = false,
  textClassName,
}: BrandLogoProps) {
  const px = iconSizes[size];
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <BrandIcon className={`shrink-0`} size={px} />
    </span>
  );
}

/**
 * The icon-only portion of the logo.
 */
export function BrandIcon({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/logo.jpg"
      alt="Fresh Laundry & Cafe"
      width={size}
      height={size}
      className={cn("rounded-full object-cover", className)}
      priority
    />
  );
}
