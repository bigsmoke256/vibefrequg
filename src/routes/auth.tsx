import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Logo } from "@/components/vibefreq/Logo";

const title = "Newsroom Sign In | VibeFreq";
const description =
  "Sign in to the VibeFreq newsroom to write, review and publish stories across music, tech, culture and hustle.";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { name: name.trim() || email.split("@")[0] },
            emailRedirectTo: `${window.location.origin}/admin/dashboard`,
          },
        });
        if (error) throw error;
        const { data: session } = await supabase.auth.getSession();
        if (session.session) {
          navigate({ to: "/admin/dashboard" });
          return;
        }
        setMessage("Account created. Check your email to confirm, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        navigate({ to: "/admin/dashboard" });
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setMessage(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setMessage("Google sign-in failed. Try email instead.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/admin/dashboard" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md border border-border/60 bg-card/60 p-6 sm:p-8">
        <Link to="/" className="inline-block">
          <Logo className="h-10" />
        </Link>
        <h1 className="mt-6 text-4xl leading-none uppercase">
          Newsroom<span className="text-accent">.</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Sign in to write, review and publish."
            : "Create your contributor account."}
        </p>

        <form onSubmit={submit} className="mt-6 grid gap-3">
          {mode === "signup" ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              aria-label="Full name"
              className="border border-border bg-secondary px-4 py-3 text-sm outline-none focus:border-accent"
            />
          ) : null}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            aria-label="Email address"
            className="border border-border bg-secondary px-4 py-3 text-sm outline-none focus:border-accent"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            aria-label="Password"
            className="border border-border bg-secondary px-4 py-3 text-sm outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={busy}
            className="bg-accent px-6 py-3.5 text-xs font-bold tracking-[0.18em] text-accent-foreground uppercase transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          onClick={google}
          className="mt-3 w-full border border-border px-6 py-3.5 text-xs font-bold tracking-[0.18em] uppercase transition-colors hover:border-accent hover:text-accent"
        >
          Continue with Google
        </button>

        {message ? <p className="mt-4 text-xs text-accent">{message}</p> : null}

        <button
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setMessage(null);
          }}
          className="mt-6 text-xs tracking-[0.14em] text-muted-foreground uppercase hover:text-accent"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
