import { Link } from "@tanstack/react-router";
import { Instagram, Youtube, Facebook } from "lucide-react";
import { Logo } from "./Logo";
import { XIcon, TikTokIcon } from "./Header";

const quickLinks = ["About Us", "Advertise", "Contact", "Careers"];
const catsA = ["Music", "Style", "Culture", "Identity"];
const catsB = ["Entertainment", "Tech", "Hustle"];

export function Footer() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto grid max-w-[1500px] gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_1fr_1.2fr_1fr]">
        <div>
          <Logo className="h-14" />
        </div>

        <div>
          <h3 className="text-sm tracking-[0.18em] uppercase">Quick Links</h3>
          <ul className="mt-4 grid gap-2.5 text-sm text-muted-foreground">
            {quickLinks.map((l) => (
              <li key={l}>
                <a href={`#${l.toLowerCase().replace(/\s/g, "-")}`} className="hover:text-accent">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm tracking-[0.18em] uppercase">Categories</h3>
          <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2.5 text-sm text-muted-foreground">
            <ul className="grid gap-2.5">
              {catsA.map((c) => (
                <li key={c}>
                  <Link
                    to="/category/$slug"
                    params={{ slug: c.toLowerCase() }}
                    className="hover:text-accent"
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="grid gap-2.5">
              {catsB.map((c) => (
                <li key={c}>
                  <Link
                    to="/category/$slug"
                    params={{ slug: c.toLowerCase() }}
                    className="hover:text-accent"
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h3 className="text-sm tracking-[0.18em] uppercase">Follow Us</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { label: "Instagram", icon: <Instagram className="h-4 w-4" /> },
              { label: "X", icon: <XIcon /> },
              { label: "TikTok", icon: <TikTokIcon /> },
              { label: "YouTube", icon: <Youtube className="h-4 w-4" /> },
              { label: "Facebook", icon: <Facebook className="h-4 w-4" /> },
            ].map((s) => (
              <a
                key={s.label}
                href={`#${s.label.toLowerCase()}`}
                aria-label={s.label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
