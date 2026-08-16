import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { mediaLibraryQuery } from "@/lib/queries";
import { updateMedia, deleteMedia } from "@/lib/media.functions";
import type { MediaAsset } from "@/lib/media.functions";
import { uploadImage } from "@/lib/media-upload";
import { formatDate } from "@/lib/story-types";

export const Route = createFileRoute("/_authenticated/admin/media")({
  component: MediaLibraryPage,
  errorComponent: ({ error }) => <p className="text-sm text-destructive">{error.message}</p>,
});

const field = "w-full border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-accent";
const label = "text-xs font-bold tracking-[0.16em] text-muted-foreground uppercase";

function MediaLibraryPage() {
  const [q, setQ] = useState("");
  const [uploading, setUploading] = useState(false);
  const [active, setActive] = useState<MediaAsset | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(mediaLibraryQuery(q));

  const assets = data?.assets ?? [];

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const result = await uploadImage(file);
        if (!result.ok) toast.error(`${file.name}: ${result.message}`);
      }
      await queryClient.invalidateQueries({ queryKey: ["media"] });
      toast.success("Library updated");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl leading-none uppercase">Media library</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Every image uploaded in the newsroom lands here. Reuse instead of re-uploading.
          </p>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(e) => {
              const files = e.target.files;
              e.target.value = "";
              if (files?.length) void handleFiles(files);
            }}
          />
          <button
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 bg-accent px-5 py-3 text-xs font-bold tracking-[0.16em] text-accent-foreground uppercase disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            {uploading ? "Uploading…" : "Upload images"}
          </button>
        </div>
      </div>

      <input
        className={`${field} mt-6 max-w-md`}
        placeholder="Search by file name, alt text, caption or credit…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {isLoading ? (
        <p className="mt-8 text-sm text-muted-foreground">Loading library…</p>
      ) : !assets.length ? (
        <p className="mt-8 text-sm text-muted-foreground">No images yet.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {assets.map((a) => (
            <button
              key={a.id}
              onClick={() => setActive(a)}
              className="group border border-border/60 text-left hover:border-accent"
            >
              <img src={a.url} alt={a.alt_text ?? ""} className="aspect-square w-full object-cover" />
              <div className="p-3">
                <p className="truncate text-xs">{a.file_name}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{formatDate(a.created_at)}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {active ? <MediaDetail asset={active} onClose={() => setActive(null)} /> : null}
    </div>
  );
}

function MediaDetail({ asset, onClose }: { asset: MediaAsset; onClose: () => void }) {
  const queryClient = useQueryClient();
  const save = useServerFn(updateMedia);
  const remove = useServerFn(deleteMedia);
  const [alt, setAlt] = useState(asset.alt_text ?? "");
  const [caption, setCaption] = useState(asset.caption ?? "");
  const [credit, setCredit] = useState(asset.credit ?? "");
  const [busy, setBusy] = useState(false);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/85 p-4">
      <div className="grid max-h-[90vh] w-full max-w-3xl gap-5 overflow-y-auto border border-border bg-card p-6 md:grid-cols-[1fr_1fr]">
        <img src={asset.url} alt={alt} className="w-full border border-border/60 object-cover" />
        <div className="grid content-start gap-3">
          <p className="text-xs tracking-[0.16em] text-accent uppercase">{asset.file_name}</p>
          <p className="text-[11px] text-muted-foreground">
            {Math.round(asset.size_bytes / 1024)} KB · {asset.mime_type} ·{" "}
            {formatDate(asset.created_at)}
          </p>
          <label className={label} htmlFor="alt">
            Alt text
          </label>
          <input id="alt" className={field} value={alt} onChange={(e) => setAlt(e.target.value)} />
          <label className={label} htmlFor="caption">
            Caption
          </label>
          <textarea
            id="caption"
            rows={2}
            className={field}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
          <label className={label} htmlFor="credit">
            Photographer / credit
          </label>
          <input
            id="credit"
            className={field}
            value={credit}
            onChange={(e) => setCredit(e.target.value)}
          />

          <div className="mt-2 flex flex-wrap gap-2">
            <button
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  const result = await save({
                    data: {
                      id: asset.id,
                      alt_text: alt || null,
                      caption: caption || null,
                      credit: credit || null,
                    },
                  });
                  if (!result.ok) {
                    toast.error(result.message);
                    return;
                  }
                  await queryClient.invalidateQueries({ queryKey: ["media"] });
                  toast.success("Saved");
                  onClose();
                } finally {
                  setBusy(false);
                }
              }}
              className="bg-accent px-4 py-2.5 text-xs font-bold tracking-[0.16em] text-accent-foreground uppercase disabled:opacity-60"
            >
              Save details
            </button>
            <button
              onClick={onClose}
              className="border border-border px-4 py-2.5 text-xs font-bold tracking-[0.16em] uppercase hover:border-accent hover:text-accent"
            >
              Close
            </button>
            <button
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  const result = await remove({ data: { id: asset.id } });
                  if (!result.ok) {
                    toast.error(result.message);
                    return;
                  }
                  await queryClient.invalidateQueries({ queryKey: ["media"] });
                  toast.success("Deleted");
                  onClose();
                } finally {
                  setBusy(false);
                }
              }}
              className="flex items-center gap-2 border border-destructive/60 px-4 py-2.5 text-xs font-bold tracking-[0.16em] text-destructive uppercase disabled:opacity-60"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
