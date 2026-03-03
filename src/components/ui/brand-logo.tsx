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

const sizes = {
  sm: "size-6",
  md: "size-8",
  lg: "size-10",
  xl: "size-14",
};

const textSizes = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-xl",
  xl: "text-2xl",
};

/**
 * Fresh Laundry & Cafe brand logo.
 *
 * Combines a water droplet with a coffee steam element
 * to represent the laundry + cafe dual concept.
 *
 * To replace with the real logo later, swap the SVG below
 * with an <Image> tag pointing to the logo file.
 */
export function BrandLogo({
  className,
  size = "md",
  showText = true,
  textClassName,
}: BrandLogoProps) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <BrandIcon className={sizes[size]} />
      {showText && (
        <span
          className={cn(
            "font-bold leading-tight",
            textSizes[size],
            textClassName || "text-foreground"
          )}
        >
          <span className="text-brand-ocean">Fresh</span>{" "}
          <span>Laundry</span>{" "}
          <span className="text-brand-amber">&amp;</span>{" "}
          <span>Cafe</span>
        </span>
      )}
    </span>
  );
}

/**
 * The icon-only portion of the logo.
 * A stylized water droplet with steam/coffee swirl.
 */
export function BrandIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      {/* Water droplet body */}
      <path
        d="M24 4C24 4 10 20 10 30C10 37.732 16.268 44 24 44C31.732 44 38 37.732 38 30C38 20 24 4 24 4Z"
        fill="url(#dropGradient)"
        stroke="#0891B2"
        strokeWidth="1.5"
      />

      {/* Inner shine on droplet */}
      <path
        d="M18 28C18 23 22 16 24 13C22 18 20 23 20 27C20 31.418 22.582 34 27 34C25 35 18 34 18 28Z"
        fill="white"
        opacity="0.3"
      />

      {/* Coffee cup silhouette inside droplet */}
      <rect
        x="17"
        y="28"
        width="14"
        height="10"
        rx="2"
        fill="white"
        opacity="0.9"
      />
      <path
        d="M31 31H33C34.105 31 35 31.895 35 33V33C35 34.105 34.105 35 33 35H31"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* Steam curls above cup */}
      <path
        d="M21 27C21 25.5 22 25 22 23.5"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M24 26C24 24.5 25 24 25 22.5"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M27 27C27 25.5 28 25 28 23.5"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Gradient definition */}
      <defs>
        <linearGradient
          id="dropGradient"
          x1="24"
          y1="4"
          x2="24"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0891B2" />
          <stop offset="1" stopColor="#2DD4BF" />
        </linearGradient>
      </defs>
    </svg>
  );
}
