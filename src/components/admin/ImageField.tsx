import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImagePlus, Loader2, X, Library } from "lucide-react";
import { uploadImage } from "@/lib/media-upload";
import { mediaLibraryQuery } from "@/lib/queries";
import { formatDate } from "@/lib/story-types";

const label = "text-xs font-bold tracking-[0.16em] text-muted-foreground uppercase";
const btn =
  "border border-border px-3 py-2 text-[11px] font-bold tracking-[0.16em] uppercase hover:border-accent hover:text-accent disabled:opacity-60";

/**
 * Upload-or-reuse image control. No URL entry anywhere — staff either upload
 * from their device or pick from the media library.
 */
export function ImageField({
  title,
  value,
  onChange,
  aspect = "aspect-[16/9]",
}: {
  title: string;
  value: string;
  onChange: (url: string) => void;
  aspect?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [browsing, setBrowsing] = useState(false);
  const [q, setQ] = useState("");
  const { data: library, isLoading } = useQuery({ ...mediaLibraryQuery(q), enabled: browsing });

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const result = await uploadImage(file);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      onChange(result.asset.url);
      await queryClient.invalidateQueries({ queryKey: ["media"] });
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid gap-2">
      <p className={label}>{title}</p>

      {value ? (
        <div className="relative">
          <img
            src={value}
            alt=""
            className={`${aspect} w-full border border-border/60 object-cover`}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Remove image"
            className="absolute top-2 right-2 border border-accent bg-background/85 p-1.5 text-accent"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div
          className={`${aspect} grid w-full place-items-center border border-dashed border-border/70 bg-secondary/40 text-xs text-muted-foreground uppercase`}
        >
          {uploading ? (
            <span className="flex items-center gap-2 text-accent">
              <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
            </span>
          ) : (
            "No image yet"
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void handleFile(file);
          }}
        />
        <button type="button" disabled={uploading} className={btn} onClick={() => inputRef.current?.click()}>
          {uploading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin" /> Uploading
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <ImagePlus className="h-3 w-3" /> {value ? "Replace" : "Upload from device"}
            </span>
          )}
        </button>
        <button type="button" className={btn} onClick={() => setBrowsing((v) => !v)}>
          <span className="flex items-center gap-2">
            <Library className="h-3 w-3" /> {browsing ? "Close library" : "Media library"}
          </span>
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground">JPG, PNG, WEBP or AVIF · max 10MB</p>

      {browsing ? (
        <div className="border border-border/60 bg-card/50 p-3">
          <input
            className="w-full border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-accent"
            placeholder="Search media…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {isLoading ? (
            <p className="mt-3 text-xs text-muted-foreground">Loading library…</p>
          ) : (
            <div className="mt-3 grid max-h-64 grid-cols-3 gap-2 overflow-y-auto">
              {(library?.assets ?? []).map((a) => (
                <button
                  key={a.id}
                  type="button"
                  title={`${a.file_name} · ${formatDate(a.created_at)}`}
                  onClick={() => {
                    onChange(a.url);
                    setBrowsing(false);
                  }}
                  className={`aspect-square overflow-hidden border ${
                    value === a.url ? "border-accent" : "border-border/60 hover:border-accent"
                  }`}
                >
                  <img src={a.url} alt={a.alt_text ?? ""} className="h-full w-full object-cover" />
                </button>
              ))}
              {!library?.assets.length ? (
                <p className="col-span-3 text-xs text-muted-foreground">
                  Nothing in the library yet.
                </p>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
