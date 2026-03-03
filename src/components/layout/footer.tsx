import Link from "next/link";
import { Mail, Phone, MapPin, Clock, Instagram } from "lucide-react";
import { BRAND } from "@/lib/constants";
import { BrandLogo } from "@/components/ui/brand-logo";

function YelpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.16 12.594l-4.995 1.433c-.96.276-1.74-.8-1.176-1.63l2.905-4.308a1.072 1.072 0 0 1 1.596-.206 7.26 7.26 0 0 1 2.054 3.128 1.074 1.074 0 0 1-.384 1.583zm-4.55 3.313l4.63 2.21c.87.413.96 1.63.17 2.17a7.27 7.27 0 0 1-3.4 1.457 1.074 1.074 0 0 1-1.263-.96l-.543-5.18c-.1-.97 1.09-1.54 1.81-.84zm-3.348-1.19l4.63-2.21c.87-.414 1.81.37 1.41 1.29a7.27 7.27 0 0 1-2.054 3.128c-.48.413-1.2.344-1.596-.206l-2.905-4.308c-.563-.83.216-1.906 1.176-1.63zM12.5 13.7l-3.13 3.76c-.62.74-1.84.37-1.93-.59a7.3 7.3 0 0 1 .34-3.36c.21-.57.84-.87 1.4-.67l4.22 1.44c.93.32.76 1.64-.17 1.7zm-.86-2.37L7.42 9.89c-.87-.3-1.1-1.47-.36-2.01a7.27 7.27 0 0 1 3.23-1.76c.59-.13 1.17.24 1.3.83l.98 4.5c.21.97-.84 1.74-1.72 1.23z" />
    </svg>
  );
}

function SnapchatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.922-.214.04-.012.06-.012.08-.012.26 0 .479.168.479.36 0 .24-.239.36-.479.48-.18.09-.42.18-.659.27-.326.12-.69.24-.87.36-.12.06-.18.15-.18.27 0 .03.003.06.012.09.21.96.627 1.86 1.23 2.64.18.24.42.48.69.72.12.09.18.21.18.36 0 .12-.06.24-.18.36-.36.27-.75.48-1.2.63-.45.15-.93.21-1.38.27h-.06c-.45.06-.75.09-.9.36-.12.21-.06.45.06.66.15.3.15.45.09.63-.12.24-.45.36-.78.36-.06 0-.12 0-.21-.03-.63-.15-1.17-.27-1.68-.27-.36 0-.66.06-.93.18-.87.42-1.56.93-2.85.93s-2.01-.51-2.88-.93c-.27-.12-.57-.18-.93-.18-.54 0-1.08.12-1.68.27-.09.03-.15.03-.24.03-.3 0-.63-.12-.75-.36-.06-.18-.06-.39.09-.66.12-.21.18-.33.06-.54-.15-.24-.45-.3-.93-.36h-.06c-.45-.06-.93-.12-1.38-.27-.45-.15-.84-.36-1.2-.63-.12-.12-.18-.24-.18-.36 0-.15.06-.27.18-.36.27-.24.51-.48.69-.72.6-.78 1.02-1.68 1.23-2.64.006-.03.012-.06.012-.09 0-.12-.06-.21-.18-.27-.18-.12-.54-.24-.87-.36-.24-.09-.48-.18-.66-.27-.24-.12-.48-.24-.48-.48 0-.192.216-.36.48-.36.018 0 .036 0 .078.012.27.09.63.198.93.198.204 0 .33-.045.402-.09-.006-.165-.018-.33-.03-.51l-.003-.06c-.105-1.627-.227-3.654.3-4.848C7.447 1.07 10.804.793 11.794.793h.412z" />
    </svg>
  );
}

const quickLinks = [
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/login", label: "Login" },
];

const socialLinks = [
  { href: BRAND.social.instagram, label: "Instagram", icon: Instagram },
  { href: BRAND.social.yelp, label: "Yelp", icon: YelpIcon },
  { href: BRAND.social.snapchat, label: "Snapchat", icon: SnapchatIcon },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center">
              <BrandLogo size="sm" />
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              {BRAND.tagline}
            </p>
            {/* Social Links */}
            <div className="mt-4 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-muted p-2 text-muted-foreground transition-colors hover:bg-brand-ocean/90 hover:text-white"
                  aria-label={social.label}
                >
                  <social.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Quick Links
            </h3>
            <ul className="mt-3 space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Contact</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href={`mailto:${BRAND.email}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="size-4" />
                  {BRAND.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${BRAND.phone}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Phone className="size-4" />
                  {BRAND.phone}
                </a>
              </li>
            </ul>
          </div>

          {/* Location & Hours */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Visit Us</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href={BRAND.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <MapPin className="mt-0.5 size-4 shrink-0" />
                  <span>{BRAND.address}</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Clock className="mt-0.5 size-4 shrink-0" />
                  <span>{BRAND.hours}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
