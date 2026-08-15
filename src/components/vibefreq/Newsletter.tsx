import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { subscribeToNewsletter } from "@/lib/stories.functions";

const schema = z.string().trim().email().max(255);

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<{
    kind: "idle" | "error" | "success";
    message: string;
  }>({ kind: "idle", message: "" });
  const subscribe = useServerFn(subscribeToNewsletter);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(email);
    if (!parsed.success) {
      setState({ kind: "error", message: "Enter a valid email address." });
      return;
    }
    setBusy(true);
    try {
      const result = await subscribe({
        data: { email: parsed.data.toLowerCase(), source: "homepage" },
      });
      setState({
        kind: result.ok ? "success" : "error",
        message: result.message ?? "",
      });
      if (result.ok) setEmail("");
    } catch {
      setState({ kind: "error", message: "Something went wrong. Try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      id="newsletter"
      className="mx-auto max-w-[1500px] px-4 pb-12 sm:px-6"
    >
      <div className="border border-accent/30 bg-gradient-to-r from-accent/10 via-card to-card p-6 sm:p-10">
        <div className="grid items-center gap-8 lg:grid-cols-[auto_1fr_minmax(0,520px)]">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-accent">
            <Mail className="h-9 w-9 text-accent" />
          </div>

          <div>
            <h2 className="text-4xl leading-none uppercase sm:text-5xl">
              Stay in the frequency<span className="text-accent">.</span>
            </h2>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Get the best of culture, music, and hustle delivered straight to
              your inbox.
            </p>
          </div>

          <form onSubmit={submit} noValidate>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={email}
                maxLength={255}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setState({ kind: "idle", message: "" });
                }}
                placeholder="Enter your email address"
                aria-label="Email address"
                className="min-w-0 flex-1 border border-border bg-secondary px-4 py-3.5 text-sm outline-none placeholder:text-muted-foreground focus:border-accent"
              />
              <button
                type="submit"
                className="bg-accent px-7 py-3.5 text-xs font-bold tracking-[0.18em] text-accent-foreground uppercase transition-opacity hover:opacity-90"
              >
                Subscribe
              </button>
            </div>
            <p
              className={`mt-3 flex items-center gap-2 text-xs ${
                state.kind === "error"
                  ? "text-destructive"
                  : state.kind === "success"
                    ? "text-accent"
                    : "text-muted-foreground"
              }`}
            >
              {state.kind === "idle" ? (
                <>
                  <Lock className="h-3 w-3" /> No spam. Unsubscribe anytime.
                </>
              ) : (
                state.message
              )}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
