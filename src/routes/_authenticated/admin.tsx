import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { myAccountQuery } from "@/lib/queries";
import { Logo } from "@/components/vibefreq/Logo";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-3xl uppercase">Newsroom error</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
});

function AdminLayout() {
  const { data } = useQuery(myAccountQuery);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const links = [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/stories", label: "Stories" },
    ...(data?.isEditorial ? ([{ to: "/admin/review", label: "Review Queue" }] as const) : []),
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link to="/">
              <Logo className="h-8" />
            </Link>
            <span className="text-xs font-bold tracking-[0.2em] text-accent uppercase">
              Newsroom
            </span>
          </div>
          <nav className="flex flex-wrap items-center gap-5 text-xs font-bold tracking-[0.16em] uppercase">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="pb-1 text-muted-foreground transition-colors hover:text-accent"
                activeProps={{ className: "border-b-2 border-accent pb-1 text-accent" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-muted-foreground">
              {data?.email}
              {data?.roles.length ? (
                <span className="ml-2 border border-accent/50 px-2 py-0.5 tracking-[0.16em] text-accent uppercase">
                  {data.roles.join(", ")}
                </span>
              ) : null}
            </span>
            <button
              onClick={signOut}
              className="border border-border px-3 py-1.5 tracking-[0.16em] uppercase hover:border-accent hover:text-accent"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
