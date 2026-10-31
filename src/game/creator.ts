import { isLegacyRoster, ROSTER, starFee } from "@/game/content";

export type PackArtist = {
  id: string;
  name: string;
  title: string;
  fee: number;
  heat: number;
};

export const PACK_MAX = 30;
export const PACK_MIN = 4;

const KEY = "daniel-creator-pack";

export function housePack(): PackArtist[] {
  return ROSTER.map((artist, i) => ({
    id: `house-${i}`,
    name: artist.name,
    title: artist.title,
    fee: starFee(artist.heat),
    heat: artist.heat,
  }));
}

function clip(n: number, a: number, b: number) {
  if (!Number.isFinite(n)) return a;
  return Math.max(a, Math.min(b, Math.round(n)));
}

function clean(value: string, max: number) {
  return value.trim().replace(/\s+/g, " ").slice(0, max);
}

export function sanitizePack(input: unknown): PackArtist[] {
  if (!Array.isArray(input)) return [];
  const out: PackArtist[] = [];
  const seen = new Set<string>();
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const row = item as Partial<PackArtist>;
    const name = clean(String(row.name ?? ""), 22);
    if (name.length < 2 || name.toLowerCase() === "daniel") continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const title = clean(String(row.title ?? ""), 28) || "Untitled";
    const id = clean(String(row.id ?? ""), 16) || Math.random().toString(36).slice(2, 10);
    out.push({
      id,
      name,
      title,
      fee: clip(Number(row.fee), 0, 500_000),
      heat: clip(Number(row.heat), 10, 99),
    });
    if (out.length >= PACK_MAX) break;
  }
  return out;
}

export function loadPack(): PackArtist[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return housePack();
    const pack = sanitizePack(JSON.parse(raw));
    if (pack.length < PACK_MIN || isLegacyRoster(pack.map((artist) => artist.name))) return housePack();
    return pack;
  } catch {
    return housePack();
  }
}

export function savePack(pack: PackArtist[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(sanitizePack(pack)));
  } catch {
    /* private mode */
  }
}
