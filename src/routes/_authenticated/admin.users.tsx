import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { myAccountQuery, staffQuery } from "@/lib/queries";
import { setUserRole, removeUserRole } from "@/lib/newsroom.functions";
import { formatDate } from "@/lib/story-types";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: StaffPage,
  errorComponent: ({ error }) => <p className="text-sm text-destructive">{error.message}</p>,
});

const ROLES = ["admin", "editor", "reporter"] as const;

function StaffPage() {
  const { data: me } = useQuery(myAccountQuery);
  const { data, isLoading } = useQuery(staffQuery);
  const queryClient = useQueryClient();
  const assign = useServerFn(setUserRole);
  const revoke = useServerFn(removeUserRole);
  const [busy, setBusy] = useState<string | null>(null);

  if (me && !me.isAdmin) {
    return (
      <div>
        <h1 className="text-4xl leading-none uppercase">Staff</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Admins only. The database rejects role changes from non-admin accounts, so this page has
          nothing to show you.
        </p>
      </div>
    );
  }

  const act = async (
    key: string,
    fn: () => Promise<{ ok: boolean; message?: string }>,
    okMessage: string,
  ) => {
    setBusy(key);
    try {
      const result = await fn();
      if (!result.ok) {
        toast.error(result.message ?? "Rejected by the database.");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success(okMessage);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <h1 className="text-4xl leading-none uppercase">Staff &amp; roles</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Role changes are enforced by the database — a non-admin calling these actions directly is
        rejected, not just hidden from.
      </p>

      {data && !data.ok ? (
        <p className="mt-6 text-sm text-destructive">{data.message}</p>
      ) : null}

      {isLoading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading staff…</p>
      ) : (
        <div className="mt-8 overflow-x-auto border border-border/60">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border/60 text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Author profile</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Roles</th>
                <th className="px-4 py-3">Assign</th>
              </tr>
            </thead>
            <tbody>
              {(data?.staff ?? []).map((s) => (
                <tr key={s.user_id} className="border-b border-border/40 align-top">
                  <td className="px-4 py-4">{s.email ?? s.user_id}</td>
                  <td className="px-4 py-4 text-muted-foreground">{s.author_name ?? "—"}</td>
                  <td className="px-4 py-4 text-muted-foreground">{formatDate(s.joined_at)}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {s.roles.length ? (
                        s.roles.map((r) => (
                          <button
                            key={r}
                            disabled={busy === `${s.user_id}-${r}`}
                            onClick={() =>
                              act(
                                `${s.user_id}-${r}`,
                                () => revoke({ data: { userId: s.user_id, role: r as (typeof ROLES)[number] } }),
                                `Removed ${r}`,
                              )
                            }
                            title="Click to remove"
                            className="border border-accent px-2 py-1 text-[11px] tracking-[0.12em] text-accent uppercase hover:border-destructive hover:text-destructive"
                          >
                            {r} ×
                          </button>
                        ))
                      ) : (
                        <span className="text-[11px] text-muted-foreground uppercase">No role</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {ROLES.filter((r) => !s.roles.includes(r)).map((r) => (
                        <button
                          key={r}
                          disabled={busy === `${s.user_id}+${r}`}
                          onClick={() =>
                            act(
                              `${s.user_id}+${r}`,
                              () => assign({ data: { userId: s.user_id, role: r } }),
                              `Granted ${r}`,
                            )
                          }
                          className="border border-border/60 px-2 py-1 text-[11px] tracking-[0.12em] text-muted-foreground uppercase hover:border-accent hover:text-accent"
                        >
                          + {r}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {!data?.staff.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-sm text-muted-foreground">
                    No staff accounts visible.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
