import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, Send, Menu, X, Instagram, Youtube } from "lucide-react";
import { Logo } from "./Logo";
import { CATEGORY_NAMES as categories, categorySlug } from "@/lib/categories";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background">
      <div className="hidden border-b border-border/60 md:block">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-6 py-2.5 text-[11px] tracking-[0.14em] uppercase">
          <nav className="flex items-center gap-6 text-muted-foreground">
            <a href="#about" className="hover:text-accent">
              About Us
            </a>
            <a href="#advertise" className="hover:text-accent">
              Advertise
            </a>
            <a href="#contact" className="hover:text-accent">
              Contact
            </a>
          </nav>
          <span className="text-muted-foreground">Saturday, May 17, 2025</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <a href="#instagram" aria-label="Instagram" className="hover:text-accent">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#x" aria-label="X" className="hover:text-accent">
                <XIcon />
              </a>
              <a href="#tiktok" aria-label="TikTok" className="hover:text-accent">
                <TikTokIcon />
              </a>
              <a href="#youtube" aria-label="YouTube" className="hover:text-accent">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
            <label className="flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5">
              <input
                placeholder="Search VibeFreq..."
                className="w-40 bg-transparent text-xs tracking-normal normal-case outline-none placeholder:text-muted-foreground"
              />
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
            </label>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-4 py-4 sm:px-6">
        <Link to="/" className="shrink-0">
          <Logo className="h-9 sm:h-12" />
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold tracking-[0.14em] uppercase lg:flex">
          <Link
            to="/"
            className="border-b-2 border-accent pb-1 text-accent"
            activeOptions={{ exact: true }}
          >
            Home
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              to="/category/$slug"
              params={{ slug: categorySlug(c) }}
              className="pb-1 text-foreground/90 transition-colors hover:text-accent"
            >
              {c}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            aria-label="Search"
            className="inline-flex h-10 w-10 items-center justify-center border border-border text-foreground md:hidden"
          >
            <Search className="h-4 w-4" />
          </button>
          <a
            href="#newsletter"
            className="hidden items-center gap-2 border border-accent px-4 py-2.5 text-xs font-bold tracking-[0.16em] text-accent uppercase transition-colors hover:bg-accent hover:text-accent-foreground sm:inline-flex"
          >
            Newsletter <Send className="h-3.5 w-3.5" />
          </a>
          <button
            aria-label="Open menu"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex h-10 w-10 items-center justify-center border border-border lg:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="grid gap-1 border-t border-border px-4 pb-4 text-sm font-semibold tracking-[0.14em] uppercase lg:hidden">
          {categories.map((c) => (
            <Link
              key={c}
              to="/category/$slug"
              params={{ slug: categorySlug(c) }}
              onClick={() => setOpen(false)}
              className="py-2.5 hover:text-accent"
            >
              {c}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}

export function XIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.9 2H22l-6.8 7.8L23 22h-6.5l-5-6.6L5.6 22H2.5l7.3-8.3L1.5 2H8l4.6 6.1L18.9 2zm-1.1 18h1.7L7.4 3.8H5.6L17.8 20z" />
    </svg>
  );
}

export function TikTokIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.5 2h-3v13a2.5 2.5 0 1 1-2-2.45V9.4A5.5 5.5 0 1 0 16.5 15V9.3a6.6 6.6 0 0 0 4 1.3V7.6a3.9 3.9 0 0 1-4-3.9V2z" />
    </svg>
  );
}
