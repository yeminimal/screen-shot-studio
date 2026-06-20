import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Laptop,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";
import {
  DEVICE_GROUPS,
  type DeviceCategory,
  type DeviceConfig,
} from "@/lib/devices";

type Props = {
  value: DeviceConfig;
  onChange: (device: DeviceConfig) => void;
};

function CategoryIcon({
  category,
  className,
}: {
  category: DeviceCategory;
  className?: string;
}) {
  if (category === "mobile") return <Smartphone className={className} />;
  if (category === "tablet") return <Tablet className={className} />;
  // Desktop: pick laptop vs monitor heuristically — both fine; use Laptop.
  return <Laptop className={className} />;
}

export function DeviceDropdown({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    // Focus the search input shortly after open so mobile keyboards behave.
    const t = setTimeout(() => searchRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClickOutside(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  function pick(d: DeviceConfig) {
    onChange(d);
    setOpen(false);
    setQuery("");
  }

  const q = query.trim().toLowerCase();
  const filteredGroups = DEVICE_GROUPS.map((g) => ({
    ...g,
    devices: q ? g.devices.filter((d) => d.label.toLowerCase().includes(q)) : g.devices,
  })).filter((g) => g.devices.length > 0);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex h-[52px] w-full items-center gap-3 rounded-xl border bg-card px-4 text-left transition-colors sm:h-14 ${
          open
            ? "border-[#7C6EF7] ring-2 ring-[#7C6EF7]/30"
            : "border-white/10 hover:border-white/20"
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <CategoryIcon
          category={value.category}
          className="h-4 w-4 shrink-0 text-muted-foreground"
        />
        <span className="truncate text-sm font-medium text-foreground sm:text-[15px]">
          {value.label}
        </span>
        <span className="ml-auto shrink-0 font-mono text-[11px] text-muted-foreground sm:text-xs">
          {value.width}×{value.height}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          {/* Mobile backdrop */}
          <button
            type="button"
            aria-label="Close device picker"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 sm:hidden"
          />

          <div
            className={[
              // Mobile: bottom sheet
              "fixed inset-x-0 bottom-0 z-50 max-h-[65vh] overflow-y-auto rounded-t-[20px] border border-white/10 bg-[#1A1A1F] pb-[env(safe-area-inset-bottom)] shadow-[0_-24px_64px_rgba(0,0,0,0.5)]",
              // Desktop: anchored dropdown
              "sm:absolute sm:inset-x-0 sm:bottom-auto sm:top-[calc(100%+8px)] sm:max-h-80 sm:rounded-2xl sm:pb-0 sm:shadow-[0_24px_64px_rgba(0,0,0,0.5)]",
            ].join(" ")}
            role="listbox"
          >
            <div className="sticky top-0 z-10 border-b border-white/5 bg-[#1A1A1F] px-4 py-3">
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search devices…"
                className="h-10 w-full rounded-lg border border-white/10 bg-[#0F0F11] px-3 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:border-[#7C6EF7] focus:outline-none focus:ring-2 focus:ring-[#7C6EF7]/30"
              />
            </div>

            {filteredGroups.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No devices match “{query}”.
              </div>
            ) : (
              <div className="pb-2">
                {filteredGroups.map((group) => (
                  <div key={group.category}>
                    <div className="px-4 pb-1 pt-3 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                      {group.label}
                    </div>
                    {group.devices.map((d) => {
                      const selected = d.id === value.id;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => pick(d)}
                          className={`flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                            selected
                              ? "bg-[#7C6EF7]/10"
                              : "hover:bg-white/[0.04]"
                          }`}
                          role="option"
                          aria-selected={selected}
                        >
                          <span
                            className={`truncate text-sm ${selected ? "text-[#7C6EF7]" : "text-foreground"}`}
                          >
                            {d.label}
                          </span>
                          <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                            {d.width}×{d.height}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Re-export for convenience
export { Monitor };
