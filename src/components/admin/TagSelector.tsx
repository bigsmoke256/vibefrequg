import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { createTag } from "@/lib/newsroom.functions";
import { tagsQuery } from "@/lib/queries";

export function TagSelector({
  value,
  onChange,
}: {
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  const { data } = useQuery(tagsQuery);
  const queryClient = useQueryClient();
  const addTag = useServerFn(createTag);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const tags = data?.tags ?? [];
  const selected = tags.filter((t) => value.includes(t.id));

  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  const create = async () => {
    const name = draft.trim();
    if (name.length < 2) return;
    setBusy(true);
    try {
      const result = await addTag({ data: { name } });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["tags"] });
      if (!value.includes(result.tag.id)) onChange([...value, result.tag.id]);
      setDraft("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-2">
      <p className="text-xs font-bold tracking-[0.16em] text-muted-foreground uppercase">Tags</p>

      {selected.length ? (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => toggle(t.id)}
              className="flex items-center gap-1 border border-accent px-2 py-1 text-[11px] tracking-[0.12em] text-accent uppercase"
            >
              {t.name} <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex gap-1">
        <input
          className="w-full border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-accent"
          placeholder="New tag name…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void create();
            }
          }}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => void create()}
          aria-label="Create tag"
          className="border border-border px-3 hover:border-accent hover:text-accent disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
        {tags
          .filter((t) => !value.includes(t.id))
          .filter((t) => (draft ? t.name.toLowerCase().includes(draft.toLowerCase()) : true))
          .map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => toggle(t.id)}
              className="border border-border/60 px-2 py-1 text-[11px] tracking-[0.12em] text-muted-foreground uppercase hover:border-accent hover:text-accent"
            >
              {t.name}
            </button>
          ))}
      </div>
    </div>
  );
}
