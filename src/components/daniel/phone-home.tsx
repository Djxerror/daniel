import { useState, type ReactNode } from "react";
import { ChevronLeft, X } from "lucide-react";
import { fmt } from "@/game/format";
import { splitPlays } from "@/game/media";
import { COSTS, TIKTOK_POST } from "@/game/logic";
import type { ActionId, ChartRow, MediaBook, PlatformId, SocialPost, TikClip } from "@/game/types";
import { GRAMMY_CATEGORIES, certName, type GrammyCategory, type TradeBook } from "@/game/industry";

type Panel =
  | "home"
  | "bio"
  | "shop"
  | "studio"
  | "social"
  | "skills"
  | "world"
  | "chart"
  | "wallet"
  | "orders"
  | "feats"
  | "food"
  | "artists"
  | "events"
  | "analysis"
  | "settings"
  | "creator"
  | "work"
  | "school";

type Release = {
  id?: string;
  title: string;
  streams: number;
  kind: string;
  weekOut: number | null;
  visual: boolean;
  style?: string;
  quality?: number;
};

type Person = {
  nick: string;
  fullName: string;
  city: string;
  age: number;
  photo: string;
  role: string;
  startYear: number;
  fans: number;
  cash: number;
};

const ROLES: Record<string, string> = {
  rapper: "Rapper",
  writer: "Songwriter",
  producer: "Producer",
};

export function PhoneHome(props: {
  cash: number;
  fans: number;
  media: MediaBook;
  platforms: Record<PlatformId, number>;
  chart: ChartRow[];
  city: string;
  nick: string;
  fullName: string;
  age: number;
  photo?: string;
  role?: string;
  startYear?: number;
  releases: Release[];
  videos: number;
  onOpen: (id: Panel) => void;
  onAct: (id: ActionId) => void;
  onPost: (where: "instagram" | "x") => void;
  onPush: (id: PlatformId) => void;
  onClip: (kind: "bts" | "vlog") => void;
  onSound: (trackId: string) => void;
  onDropClip: (id: string) => void;
  energy: number;
  day: number;
  albumOut: boolean;
  trade?: TradeBook;
}) {
  const [app, setApp] = useState<string | null>(null);
  const released = props.releases.filter((track) => track.kind !== "video");
  const person: Person = {
    nick: props.nick || "You",
    fullName: props.fullName || props.nick || "You",
    city: props.city,
    age: props.age,
    photo: props.media.avatar || props.photo || "/looks/hoodie.jpg",
    role: ROLES[props.role ?? ""] ?? props.role ?? "Artist",
    startYear: props.startYear || 2026,
    fans: props.fans,
    cash: props.cash,
  };
  const handle = person.nick.toLowerCase().replace(/[^a-z0-9]+/g, "") || "artist";
  const styles = [...new Set(released.map((track) => track.style).filter((style): style is string => !!style))];
  const debut = [...released].sort((a, b) => (a.weekOut ?? 0) - (b.weekOut ?? 0))[0];

  const apps: { id: string; name: string; mark: ReactNode; tint: string }[] = [
    { id: "sundify", name: "Spotify", mark: <SpotifyMark />, tint: "bg-[#1ed760] text-black" },
    { id: "appel", name: "Apple Music", mark: <span className="text-[22px] leading-none">♫</span>, tint: "bg-gradient-to-b from-[#fb5c74] to-[#fc3c44] text-white" },
    { id: "bboard", name: "Billboard", mark: <span className="font-serif text-[18px] tracking-tight">Bb</span>, tint: "bg-white text-black" },
    { id: "utubemusic", name: "YouTube Music", mark: <YtMark />, tint: "bg-[#0f0f0f] text-white ring-1 ring-white/15" },
    { id: "tweeter", name: "X (Twitter)", mark: <span className="text-[22px] font-black">𝕏</span>, tint: "bg-black text-white ring-1 ring-white/20" },
    { id: "imsta", name: "Instagram", mark: <span className="text-[20px]">◎</span>, tint: "bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white" },
    { id: "tictoc", name: "TikTok", mark: <span className="text-[18px] font-black">♪</span>, tint: "bg-black text-white ring-1 ring-white/20" },
    { id: "utube", name: "YouTube", mark: <span className="grid h-6 w-8 place-items-center rounded bg-white text-[11px] text-[#ff0033]">▶</span>, tint: "bg-white text-[#ff0033]" },
    { id: "grow", name: "GrowMe", mark: "G", tint: "bg-[#7c5cff] text-white" },
    { id: "wiki", name: "Wikipedia", mark: <span className="font-serif text-[20px]">W</span>, tint: "bg-white text-black" },
  ];

  if (app) {
    const shared = { person, handle, released, styles, debut, onBack: () => setApp(null) };
    return (
      <div className="sim-phone overflow-hidden !p-0">
        {app === "sundify" && (
          <SpotifyProfile {...shared} media={props.media} parked={props.platforms.wire ?? 0} onPush={() => props.onPush("wire")} />
        )}
        {app === "appel" && (
          <AppleProfile {...shared} media={props.media} parked={props.platforms.nightbus ?? 0} onPush={() => props.onPush("nightbus")} />
        )}
        {app === "utubemusic" && (
          <YtMusicProfile {...shared} media={props.media} parked={props.platforms.room ?? 0} onPush={() => props.onPush("room")} />
        )}
        {app === "imsta" && (
          <InstagramProfile
            {...shared}
            posts={props.media.posts.filter((post) => post.app === "instagram")}
            followers={props.media.instagram.followers}
            visits={props.media.instagram.visits}
            reach={props.media.instagram.reach}
            verified={props.trade?.verified.instagram === true}
            albumOut={props.albumOut}
            onPost={() => props.onPost("instagram")}
            onVideo={() => props.onAct("visual")}
          />
        )}
        {app === "tweeter" && (
          <XProfile
            {...shared}
            posts={props.media.posts.filter((post) => post.app === "x")}
            followers={props.media.x.followers}
            impressions={props.media.x.impressions}
            verified={props.trade?.verified.x === true}
            onPost={() => props.onPost("x")}
          />
        )}
        {app === "tictoc" && (
          <TikTokProfile
            {...shared}
            followers={props.media.tiktok.followers}
            views={props.media.tiktok.views}
            uses={props.media.tiktok.uses}
            clips={props.media.clips}
            verified={props.trade?.verified.tiktok === true}
            onVlog={() => props.onClip("vlog")}
            onBts={() => props.onClip("bts")}
            onSound={props.onSound}
            onDropClip={props.onDropClip}
            energy={props.energy}
            day={props.day}
            releases={released}
          />
        )}
        {app === "utube" && (
          <YouTubeProfile
            {...shared}
            subscribers={props.media.youtube.subscribers}
            views={props.media.youtube.views}
            videos={props.videos}
            verified={props.trade?.verified.youtube === true}
            onUpload={() => props.onAct("visual")}
          />
        )}
        {app === "bboard" && (
          <BillboardPage
            {...shared}
            chart={props.chart}
            albums={props.trade?.albumChart ?? []}
            onChart={() => props.onOpen("chart")}
          />
        )}
        {app === "wiki" && (
          <WikiArticle
            {...shared}
            history={props.trade?.history ?? []}
            recognition={props.trade?.recognition ?? "Unknown Artist"}
            certs={props.trade?.certs ?? []}
            no1s={props.trade?.no1s?.length ?? 0}
            bestRun={props.trade?.bestRun ?? 0}
            fanNotes={props.trade?.fanNotes ?? []}
            soldOut={props.trade?.soldOut ?? []}
          />
        )}
        {app === "grow" && <GrowMe onBack={() => setApp(null)} onPromo={() => props.onAct("promo")} />}
      </div>
    );
  }

  return (
    <div className="sim-phone">
      <div className="mb-5 flex items-center justify-between px-1 text-[11px] font-semibold text-white/80">
        <span>9:41</span>
        <span className="tracking-widest">●●●</span>
      </div>
      {props.media.notes.length > 0 && (
        <ul className="mb-4 flex flex-col gap-1 rounded-2xl bg-black/35 px-3 py-2">
          {props.media.notes.map((line) => (
            <li key={line} className="text-[11px] leading-snug text-white/80">
              {line}
            </li>
          ))}
        </ul>
      )}
      <div className="grid grid-cols-4 gap-x-2 gap-y-5">
        {apps.map((item) => (
          <button key={item.id} type="button" onClick={() => setApp(item.id)} className="flex flex-col items-center gap-1">
            <span className={`grid h-14 w-14 place-items-center overflow-hidden rounded-[1.15rem] text-lg font-black shadow-md ${item.tint}`}>
              {item.mark}
            </span>
            <span className="text-center text-[10px] leading-tight font-bold text-white">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function lanePlays(tracks: Release[], total: number) {
  return splitPlays(tracks.map((track) => track.streams), total);
}

function playMap(tracks: Release[], total: number) {
  const counts = lanePlays(tracks, total);
  const map = new Map<Release, number>();
  tracks.forEach((track, index) => map.set(track, counts[index] ?? 0));
  return map;
}

function hue(title: string) {
  let n = 0;
  for (const c of title) n = (n * 33 + c.charCodeAt(0)) % 360;
  return n;
}

function Art({ title, className }: { title: string; className?: string }) {
  const h = hue(title || "A");
  return (
    <div
      className={`relative shrink-0 overflow-hidden ${className ?? ""}`}
      style={{ background: `linear-gradient(145deg, hsl(${h} 72% 52%), hsl(${(h + 42) % 360} 62% 18%))` }}
    >
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.55),transparent_52%)]" />
      <span className="absolute right-1 bottom-0.5 font-black text-white/90" style={{ fontSize: 10 }}>
        {(title || "?").slice(0, 1).toUpperCase()}
      </span>
    </div>
  );
}

function Face({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return <img src={src} alt={alt} className={`object-cover object-[center_18%] ${className ?? ""}`} />;
}

export function shrinkPhoto(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve("");
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => resolve("");
      img.onload = () => {
        const size = 256;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx || !img.width || !img.height) return resolve("");
        const scale = Math.max(size / img.width, size / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

function Status({ onBack, light }: { onBack: () => void; light?: boolean }) {
  return (
    <div className={`flex items-center justify-between px-3 pt-2 pb-1 text-[11px] font-semibold ${light ? "text-black" : "text-white"}`}>
      <button type="button" aria-label="Back" onClick={onBack} className={`grid h-7 w-7 place-items-center rounded-full ${light ? "bg-black/10" : "bg-white/15"}`}>
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span>9:41</span>
      <span className="w-7 text-right tracking-widest">●●</span>
    </div>
  );
}

function SpotifyMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="#191414" />
      <path d="M6.5 9.2c3.4-1 6.8-.7 10.2.8" stroke="#1ed760" strokeWidth="1.7" fill="none" strokeLinecap="round" />
      <path d="M7.2 12.2c2.7-.8 5.4-.5 8.1.7" stroke="#1ed760" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M8 15c2-.5 3.8-.3 5.6.5" stroke="#1ed760" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function YtMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path d="M4 8.5c0-1.6 1.6-2.7 3.1-2.2l8.2 2.7c1.6.5 1.6 2.7 0 3.2l-8.2 2.7C5.6 15.4 4 14.3 4 12.7v-4.2z" fill="#ff0033" />
      <circle cx="17.2" cy="16.8" r="3.2" fill="none" stroke="#ff0033" strokeWidth="1.4" />
    </svg>
  );
}

function SpotifyProfile(props: {
  person: Person;
  handle: string;
  released: Release[];
  styles: string[];
  debut?: Release;
  media: MediaBook;
  parked: number;
  onBack: () => void;
  onPush: () => void;
}) {
  const [chip, setChip] = useState<"all" | "albums" | "singles">("all");
  const popular = [...props.released].sort((a, b) => b.streams - a.streams).slice(0, 5);
  const plays = playMap(props.released, props.media.spotify.streams);
  const discs =
    chip === "albums" ? props.released.filter((t) => t.kind === "album") : chip === "singles" ? props.released.filter((t) => t.kind !== "album") : props.released;
  return (
    <div className="bg-[#121212] text-white">
      <div className="relative">
        <div className="relative h-52 overflow-hidden">
          <Face src={props.person.photo} alt="" className="h-full w-full scale-110 blur-[1px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-[#121212]" />
        </div>
        <div className="absolute top-0 right-0 left-0">
          <Status onBack={props.onBack} />
        </div>
        <div className="absolute right-0 bottom-0 left-0 px-4 pb-2">
          <h2 className="text-[32px] leading-none font-black tracking-tight">{props.person.nick}</h2>
        </div>
      </div>
      <div className="px-4 pt-2 pb-6">
        <p className="text-[13px] text-[#b3b3b3]">{fmt(props.media.spotify.listeners)} monthly listeners</p>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-[12px] text-white/80">{fmt(props.media.spotify.followers)} followers</p>
          <button
            type="button"
            onClick={props.onPush}
            className="grid h-12 w-12 place-items-center rounded-full bg-[#1ed760] text-black shadow-lg"
            aria-label="Push next song to Spotify, 8 energy"
          >
            <span className="ml-0.5 text-lg">▶</span>
          </button>
        </div>
        <p className="mt-1 text-[11px] text-[#b3b3b3]">Push the newest song here · 8 energy · {fmt(props.parked)} plays parked last morning</p>

        <h3 className="mt-6 text-[20px] font-black">Popular</h3>
        <ol className="mt-2">
          {popular.length === 0 && <li className="py-3 text-sm text-[#b3b3b3]">Nothing out yet. The popular list fills after a release.</li>}
          {popular.map((track, index) => (
            <li key={`${track.title}-${index}`} className="flex items-center gap-3 py-2">
              <span className="w-4 text-center text-[14px] text-[#b3b3b3]">{index + 1}</span>
              <Art title={track.title} className="h-12 w-12 rounded" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold">{track.title}</span>
                <span className="block truncate text-[12px] text-[#b3b3b3]">{track.kind === "album" ? "Album" : "Single"} · {props.person.nick}</span>
              </span>
              <span className="text-[13px] text-[#b3b3b3]">{fmt(plays.get(track) ?? 0)}</span>
            </li>
          ))}
        </ol>
        <p className="mt-1 text-[11px] text-[#6a6a6a]">{fmt(props.media.spotify.streams)} streams on this profile. Not the same number as the other apps.</p>

        <h3 className="mt-6 text-[20px] font-black">Discography</h3>
        <div className="mt-2 flex gap-2">
          {(["all", "albums", "singles"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setChip(id)}
              className={`rounded-full px-3 py-1 text-[12px] font-bold ${chip === id ? "bg-white text-black" : "bg-white/10 text-white"}`}
            >
              {id === "all" ? "Popular releases" : id === "albums" ? "Albums" : "Singles"}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {discs.length === 0 && <p className="text-sm text-[#b3b3b3]">No {chip === "albums" ? "albums" : "releases"} yet.</p>}
          {discs.map((track, index) => (
            <div key={`${track.title}-d-${index}`} className="w-28 shrink-0">
              <Art title={track.title} className="h-28 w-28 rounded-md" />
              <p className="mt-2 truncate text-[13px] font-bold">{track.title}</p>
              <p className="truncate text-[11px] text-[#b3b3b3]">{track.weekOut ? `Day ${track.weekOut}` : "Out"} · {track.kind === "album" ? "Album" : "Single"}</p>
            </div>
          ))}
        </div>

        <h3 className="mt-6 text-[20px] font-black">About</h3>
        <div className="relative mt-2 h-36 overflow-hidden rounded-lg">
          <Face src={props.person.photo} alt="" className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <p className="absolute right-3 bottom-3 left-3 text-[13px] leading-snug">
            {props.person.fullName} is a {props.person.role.toLowerCase()} from {props.person.city}.
            {props.debut ? ` First release: ${props.debut.title}.` : " No release yet."}
            {props.styles.length ? ` ${props.styles.slice(0, 3).join(", ")}.` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

function AppleProfile(props: {
  person: Person;
  released: Release[];
  styles: string[];
  debut?: Release;
  media: MediaBook;
  parked: number;
  onBack: () => void;
  onPush: () => void;
}) {
  const albums = props.released.filter((t) => t.kind === "album");
  const singles = props.released.filter((t) => t.kind !== "album");
  const songs = [...props.released].sort((a, b) => b.streams - a.streams);
  const plays = playMap(props.released, props.media.apple.plays);
  return (
    <div className="bg-black text-white">
      <Status onBack={props.onBack} />
      <div className="px-4 pt-2 pb-8">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-[34px] leading-[0.95] font-black tracking-tight">{props.person.nick}</h2>
          <Face src={props.person.photo} alt="" className="h-16 w-16 rounded-full" />
        </div>
        <div className="mt-4 flex items-center gap-2">
          <button type="button" onClick={props.onPush} className="rounded-full bg-[#fa2d48] px-5 py-2 text-[15px] font-semibold">
            Push · 8
          </button>
          <p className="text-[12px] text-white/55">{fmt(props.media.apple.listeners)} listeners</p>
        </div>
        <p className="mt-1 text-[11px] text-white/40">{fmt(props.media.apple.plays)} plays · {fmt(props.parked)} parked last morning</p>

        <div className="mt-7 flex items-baseline justify-between">
          <h3 className="text-[22px] font-black">Top Songs</h3>
        </div>
        <ol>
          {songs.length === 0 && <li className="py-4 text-sm text-white/50">Top Songs shows up after something is out.</li>}
          {songs.slice(0, 6).map((track, index) => (
            <li key={`${track.title}-a-${index}`} className="flex items-center gap-3 border-b border-white/10 py-2.5">
              <Art title={track.title} className="h-11 w-11 rounded" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px]">{track.title}</span>
                <span className="block truncate text-[12px] text-white/50">{props.person.nick}</span>
              </span>
              <span className="text-[12px] text-white/40">{fmt(plays.get(track) ?? 0)}</span>
            </li>
          ))}
        </ol>

        <Shelf title="Albums" tracks={albums} />
        <Shelf title="Singles & EPs" tracks={singles} />

        <h3 className="mt-7 text-[22px] font-black">About</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-white/80">
          {props.person.fullName}, {props.person.age}, {props.person.city}. {props.person.role}.
          {props.debut ? ` Debut ${props.debut.title}.` : " Waiting on a debut."}
          {props.styles.length ? ` Known for ${props.styles.slice(0, 3).join(", ")}.` : ""}
        </p>
      </div>
    </div>
  );
}

function Shelf({ title, tracks }: { title: string; tracks: Release[] }) {
  if (tracks.length === 0) return null;
  return (
    <div className="mt-7">
      <h3 className="text-[22px] font-black">{title}</h3>
      <div className="mt-3 flex gap-3 overflow-x-auto">
        {tracks.map((track, index) => (
          <div key={`${title}-${track.title}-${index}`} className="w-[9.5rem] shrink-0">
            <Art title={track.title} className="h-[9.5rem] w-[9.5rem] rounded-md" />
            <p className="mt-1.5 truncate text-[13px]">{track.title}</p>
            <p className="truncate text-[11px] text-white/45">{track.kind === "album" ? "Album" : "Single"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function YtMusicProfile(props: {
  person: Person;
  released: Release[];
  media: MediaBook;
  parked: number;
  onBack: () => void;
  onPush: () => void;
}) {
  const songs = [...props.released].sort((a, b) => b.streams - a.streams);
  const plays = playMap(props.released, props.media.ytmusic.streams);
  return (
    <div className="bg-[#030303] text-white">
      <div className="relative h-40 overflow-hidden bg-[#3d0a12]">
        <Face src={props.person.photo} alt="" className="h-full w-full opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030303] to-transparent" />
        <div className="absolute top-0 right-0 left-0">
          <Status onBack={props.onBack} />
        </div>
      </div>
      <div className="-mt-8 px-4 pb-8">
        <div className="flex items-end gap-3">
          <Face src={props.person.photo} alt="" className="h-20 w-20 rounded-full ring-2 ring-black" />
          <div className="min-w-0 pb-1">
            <h2 className="truncate text-[22px] font-black">{props.person.nick}</h2>
            <p className="text-[12px] text-white/60">{fmt(props.media.ytmusic.listeners)} monthly listeners</p>
          </div>
        </div>
        <button type="button" onClick={props.onPush} className="mt-4 rounded-full bg-white px-4 py-2 text-[13px] font-black text-black">
          Push · 8
        </button>
        <p className="mt-1 text-[11px] text-white/45">{fmt(props.media.ytmusic.streams)} streams · {fmt(props.parked)} parked last morning</p>

        <h3 className="mt-6 text-[16px] font-black">Songs</h3>
        <ul>
          {songs.length === 0 && <li className="py-3 text-sm text-white/50">Songs land here after a release.</li>}
          {songs.slice(0, 8).map((track, index) => (
            <li key={`${track.title}-y-${index}`} className="flex items-center gap-3 py-2">
              <Art title={track.title} className="h-12 w-12 rounded" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold">{track.title}</span>
                <span className="block truncate text-[12px] text-white/50">{props.person.nick} · {fmt(plays.get(track) ?? 0)} streams</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function InstagramProfile(props: {
  person: Person;
  handle: string;
  posts: SocialPost[];
  followers: number;
  visits: number;
  reach: number;
  verified?: boolean;
  albumOut: boolean;
  onBack: () => void;
  onPost: () => void;
  onVideo: () => void;
}) {
  const [tab, setTab] = useState<"grid" | "reels">("grid");
  const posts = props.posts;
  const grid = tab === "reels" ? [] : posts;
  return (
    <div className="bg-black text-white">
      <div className="flex items-center justify-between px-3 pt-2">
        <button type="button" aria-label="Back" onClick={props.onBack} className="grid h-8 w-8 place-items-center">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="text-[16px] font-semibold">{props.handle}</p>
        <span className="w-8 text-right text-[11px] text-white/50">9:41</span>
      </div>
      <div className="flex items-center gap-4 px-4 pt-4">
        <div className="rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] p-[2px]">
          <Face src={props.person.photo} alt="" className="h-[86px] w-[86px] rounded-full border-2 border-black" />
        </div>
        <div className="grid flex-1 grid-cols-3 text-center">
          <Stat n={posts.length} label="posts" />
          <Stat n={props.followers} label="followers" />
          <Stat n={0} label="following" />
        </div>
      </div>
      <div className="px-4 pt-3">
        <p className="text-[14px] font-semibold">{props.person.fullName}{props.verified ? " ✓" : ""}</p>
        <p className="text-[13px] text-white/80">{props.person.role} · {props.person.city}</p>
        <p className="text-[12px] text-white/45">{fmt(props.visits)} profile visits · reach {fmt(props.reach)}</p>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1.5 px-4">
        <IgButton label="Post" cost={COSTS.post} onClick={props.onPost} />
        <IgButton label="Album" cost={COSTS.post} disabled={!props.albumOut} onClick={props.onPost} />
        <IgButton label="Video" cost={COSTS.visual} onClick={props.onVideo} />
      </div>
      <div className="mt-4 flex gap-4 px-4">
        <Highlight photo={props.person.photo} name="Music" />
        <Highlight photo={props.person.photo} name={props.person.city.split(" ")[0] || "City"} />
        <Highlight photo={props.person.photo} name="Video" />
      </div>
      <div className="mt-4 grid grid-cols-2 border-t border-white/15">
        <button type="button" onClick={() => setTab("grid")} className={`py-2 text-[11px] font-black tracking-widest ${tab === "grid" ? "border-t border-white" : "text-white/40"}`}>
          POSTS
        </button>
        <button type="button" onClick={() => setTab("reels")} className={`py-2 text-[11px] font-black tracking-widest ${tab === "reels" ? "border-t border-white" : "text-white/40"}`}>
          REELS
        </button>
      </div>
      {grid.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-white/50">{tab === "reels" ? "No videos on the grid yet." : "No posts yet."}</p>
      ) : (
        <div className="grid grid-cols-3 gap-px bg-white/10">
          {grid.map((post, index) => (
            <div key={`${post.title}-ig-${post.day}-${index}`} className="relative aspect-square">
              <Art title={post.title} className="h-full w-full" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <p>
      <span className="block text-[16px] font-bold">{fmt(n)}</span>
      <span className="text-[12px] text-white/70">{label}</span>
    </p>
  );
}

function IgButton({ label, cost, onClick, disabled }: { label: string; cost: number; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className="rounded-lg bg-[#262626] py-1.5 text-[13px] font-semibold disabled:opacity-40">
      {label}
      <span className="block text-[10px] font-medium text-white/50">{cost} energy</span>
    </button>
  );
}

function Highlight({ photo, name }: { photo: string; name: string }) {
  return (
    <div className="flex w-16 flex-col items-center gap-1">
      <Face src={photo} alt="" className="h-14 w-14 rounded-full border border-white/20" />
      <span className="w-full truncate text-center text-[11px]">{name}</span>
    </div>
  );
}

function XProfile(props: {
  person: Person;
  handle: string;
  posts: SocialPost[];
  followers: number;
  impressions: number;
  verified?: boolean;
  onBack: () => void;
  onPost: () => void;
}) {
  const posts = [...props.posts].reverse();
  return (
    <div className="bg-black text-white">
      <div className="flex items-center gap-6 px-2 pt-2">
        <button type="button" aria-label="Back" onClick={props.onBack} className="grid h-8 w-8 place-items-center rounded-full">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="text-[16px] leading-tight font-black">{props.person.nick}</p>
          <p className="text-[12px] text-white/50">{posts.length} posts</p>
        </div>
      </div>
      <div className="relative mt-2 h-28 overflow-hidden bg-[#333]">
        <Face src={props.person.photo} alt="" className="h-full w-full opacity-90" />
      </div>
      <div className="px-4">
        <div className="flex items-start justify-between">
          <Face src={props.person.photo} alt="" className="relative z-10 -mt-12 h-[78px] w-[78px] rounded-full border-4 border-black" />
          <button type="button" onClick={props.onPost} className="mt-3 rounded-full bg-white px-4 py-1.5 text-[14px] font-black text-black">
            Post · {COSTS.post}
          </button>
        </div>
        <h2 className="mt-2 text-[20px] leading-tight font-black">{props.person.fullName}{props.verified ? " ✓" : ""}</h2>
        <p className="text-[15px] text-[#71767b]">@{props.handle}</p>
        <p className="mt-2 text-[15px]">{props.person.role} out of {props.person.city}.</p>
        <p className="mt-1 text-[14px] text-[#71767b]">📍 {props.person.city} · Joined {props.person.startYear}</p>
        <p className="mt-2 text-[14px]">
          <span className="font-bold">0</span> <span className="text-[#71767b]">Following</span>
          <span className="ml-4 font-bold">{fmt(props.followers)}</span> <span className="text-[#71767b]">Followers</span>
        </p>
        <p className="mt-1 text-[12px] text-[#71767b]">{fmt(props.impressions)} impressions</p>
      </div>
      <div className="mt-3 flex border-b border-white/10">
        <p className="border-b-4 border-[#1d9bf0] px-6 py-3 text-[14px] font-black">Posts</p>
        <p className="px-6 py-3 text-[14px] text-white/40">Media</p>
      </div>
      {posts.length === 0 && (
        <article className="flex gap-3 border-b border-white/10 px-4 py-3">
          <Face src={props.person.photo} alt="" className="h-10 w-10 rounded-full" />
          <p className="text-[15px] text-white/70">Nothing posted yet.</p>
        </article>
      )}
      {posts.map((post, index) => (
        <article key={`${post.title}-x-${post.day}-${index}`} className="flex gap-3 border-b border-white/10 px-4 py-3">
          <Face src={props.person.photo} alt="" className="h-10 w-10 rounded-full" />
          <div className="min-w-0 flex-1">
            <p className="text-[15px]">
              <span className="font-bold">{props.person.nick}</span> <span className="text-[#71767b]">@{props.handle}</span>
            </p>
            <p className="text-[15px] leading-snug">{post.text}</p>
            <Art title={post.title} className="mt-2 h-32 w-full rounded-2xl" />
          </div>
        </article>
      ))}
    </div>
  );
}

function clipHeat(clip: TikClip, day: number): string {
  if (clip.kind !== "song" && clip.kind !== "album") return "This clip does not push a song.";
  const age = day - clip.day;
  const what = clip.kind === "album" ? "the songs on this album" : "this song";
  if (age <= 1) return `This sound is hot. It is lifting ${what} right now.`;
  if (age <= 4) return `Still moving. The lift on ${what} is smaller than the first days.`;
  if (age <= 8) return "The push is cooling. A few more mornings, then it fades.";
  if (age <= 14) return "Almost done. The release barely feels this clip now.";
  return "This clip is old. It no longer moves the release.";
}

function TikTokProfile(props: {
  person: Person;
  handle: string;
  followers: number;
  views: number;
  uses: number;
  clips: TikClip[];
  releases: Release[];
  verified?: boolean;
  energy: number;
  day: number;
  onBack: () => void;
  onVlog: () => void;
  onBts: () => void;
  onSound: (trackId: string) => void;
  onDropClip: (id: string) => void;
}) {
  const [picking, setPicking] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const catalog = props.releases.filter((track) => track.id && (track.kind === "single" || track.kind === "album"));
  const open = props.clips.find((clip) => clip.id === openId) ?? null;
  const live = new Set(props.clips.filter((clip) => props.day - clip.day <= 14 && (clip.kind === "song" || clip.kind === "album")).map((clip) => clip.trackId));

  if (open) {
    return (
      <div className="bg-black text-white">
        <div className="flex items-center justify-between px-3 pt-2">
          <button type="button" aria-label="Back" onClick={() => { setOpenId(null); setNote(""); }} className="grid h-8 w-8 place-items-center">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="truncate px-2 text-[15px] font-black">{open.title}</p>
          <button
            type="button"
            aria-label="Delete video"
            onClick={() => {
              if (props.energy < 1) {
                setNote("Deleting a video is 1 energy.");
                return;
              }
              props.onDropClip(open.id);
              setOpenId(null);
              setNote("");
            }}
            className="grid h-8 w-8 place-items-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <Art title={open.title} className="mt-3 aspect-[3/4] w-full" />
        <div className="px-4 py-4">
          <p className="text-[22px] font-black">{fmt(open.views)} views</p>
          <p className="mt-1 text-[13px] text-white/60">Posted day {open.day} · {open.kind === "album" ? "Album" : open.kind === "song" ? "Song" : open.kind === "vlog" ? "Vlog" : "Behind the song"}</p>
          <p className="mt-3 text-[14px] leading-snug">{clipHeat(open, props.day)}</p>
          <p className="mt-3 text-[12px] text-white/45">The X costs 1 energy. The views on this video come off the profile. Followers stay.</p>
          {note && <p className="mt-2 text-[13px] font-bold text-[#fe2c55]">{note}</p>}
        </div>
      </div>
    );
  }

  if (picking) {
    return (
      <div className="bg-black text-white">
        <div className="flex items-center justify-between px-3 pt-2">
          <button type="button" aria-label="Back" onClick={() => { setPicking(false); setNote(""); }} className="grid h-8 w-8 place-items-center">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="text-[17px] font-black">Post</p>
          <span className="w-8" />
        </div>
        <p className="px-4 pt-3 text-[13px] text-white/60">Pick a song or album that is already out. {TIKTOK_POST} energy. Views arrive for about three weeks and the release gets a lift while the sound is hot.</p>
        {note && <p className="px-4 pt-2 text-[13px] font-bold text-[#fe2c55]">{note}</p>}
        {catalog.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-white/50">Release a song or album before you can post it.</p>
        ) : (
          <ul className="mt-3 flex flex-col">
            {catalog.map((track) => (
              <li key={track.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (props.energy < TIKTOK_POST) {
                      setNote(`That video is ${TIKTOK_POST} energy. You have ${props.energy}.`);
                      return;
                    }
                    props.onSound(track.id!);
                    setPicking(false);
                    setNote("");
                  }}
                  className="flex w-full items-center gap-3 border-b border-white/10 px-4 py-3 text-left"
                >
                  <Art title={track.title} className="h-12 w-12 shrink-0 rounded-md" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-black">{track.title}</span>
                    <span className="block text-[12px] text-white/50">{track.kind === "album" ? "Album" : "Song"}{live.has(track.id!) ? " · already up" : ""} · {TIKTOK_POST} energy</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="bg-black text-white">
      <div className="flex items-center justify-between px-3 pt-2">
        <button type="button" aria-label="Back" onClick={props.onBack} className="grid h-8 w-8 place-items-center">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="text-[17px] font-black">{props.person.nick}</p>
        <span className="w-8" />
      </div>
      <div className="flex flex-col items-center px-4 pt-3">
        <Face src={props.person.photo} alt="" className="h-24 w-24 rounded-full" />
        <p className="mt-2 text-[15px] font-semibold">@{props.handle}{props.verified ? " ✓" : ""}</p>
        <div className="mt-3 grid w-full grid-cols-3 text-center">
          <p><span className="block text-[17px] font-black">0</span><span className="text-[12px] text-white/60">Following</span></p>
          <p><span className="block text-[17px] font-black">{fmt(props.followers)}</span><span className="text-[12px] text-white/60">Followers</span></p>
          <p><span className="block text-[17px] font-black">{fmt(props.views)}</span><span className="text-[12px] text-white/60">Views</span></p>
        </div>
        <p className="mt-2 text-center text-[13px]">{props.person.role} · {props.person.city}</p>
        <p className="text-center text-[12px] text-white/50">{fmt(props.uses)} song uses · {props.clips.length} clips posted</p>
        <button type="button" onClick={() => setPicking(true)} className="mt-3 w-full rounded-md bg-[#fe2c55] py-2 text-[14px] font-black">
          Post a song or album · {TIKTOK_POST}
        </button>
        <div className="mt-2 grid w-full grid-cols-2 gap-2">
          <button type="button" onClick={props.onVlog} className="rounded-md bg-[#2a2a2a] py-2 text-[14px] font-black">
            Vlog · 10
          </button>
          <button type="button" onClick={props.onBts} className="rounded-md border border-[#fe2c55] py-2 text-[14px] font-black">
            Behind the song · 14
          </button>
        </div>
      </div>
      <div className="mt-4 border-t border-white/10 pt-1 text-center text-[12px] font-black tracking-widest text-white/70">VIDEOS</div>
      {props.clips.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm text-white/50">No videos yet.</p>
      ) : (
        <div className="mt-1 grid grid-cols-3 gap-px">
          {[...props.clips].reverse().map((clip) => {
            const hot = (clip.kind === "song" || clip.kind === "album") && props.day - clip.day <= 4;
            return (
              <button type="button" key={clip.id} onClick={() => setOpenId(clip.id)} className="relative aspect-[3/4] text-left">
                <Art title={clip.title} className="h-full w-full" />
                <span className="absolute bottom-1 left-1 text-[10px] font-bold">▶ {fmt(clip.views)}</span>
                {hot && <span className="absolute right-1 top-1 text-[9px] font-black text-[#fe2c55]">HOT</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function YouTubeProfile(props: {
  person: Person;
  handle: string;
  released: Release[];
  subscribers: number;
  views: number;
  videos: number;
  verified?: boolean;
  onBack: () => void;
  onUpload: () => void;
}) {
  const clips = props.released.filter((t) => t.visual);
  const [tab, setTab] = useState<"home" | "videos">("home");
  const shown = tab === "videos" ? (clips.length > 0 ? clips : []) : clips.length > 0 ? clips : props.released.slice(0, 4);
  return (
    <div className="bg-[#0f0f0f] text-white">
      <div className="relative h-24 bg-[#272727]">
        <Face src={props.person.photo} alt="" className="h-full w-full opacity-70" />
        <div className="absolute inset-x-0 top-0">
          <Status onBack={props.onBack} />
        </div>
      </div>
      <div className="px-3 pt-3">
        <div className="flex gap-3">
          <Face src={props.person.photo} alt="" className="h-16 w-16 rounded-full" />
          <div className="min-w-0">
            <h2 className="truncate text-[20px] font-black">{props.person.nick}{props.verified ? " ✓" : ""}</h2>
            <p className="text-[12px] text-[#aaa]">@{props.handle} · {fmt(props.subscribers)} subscribers · {props.videos} videos</p>
            <p className="text-[12px] text-[#aaa]">{fmt(props.views)} video views. Not Spotify streams.</p>
          </div>
        </div>
        <button type="button" onClick={props.onUpload} className="mt-3 rounded-full bg-[#ff0033] px-4 py-2 text-[14px] font-bold">
          Upload · {COSTS.visual} energy
        </button>
      </div>
      <div className="mt-4 flex gap-4 border-b border-white/10 px-3 text-[14px] font-bold">
        <button type="button" onClick={() => setTab("home")} className={`pb-2 ${tab === "home" ? "border-b-2 border-white" : "text-white/40"}`}>Home</button>
        <button type="button" onClick={() => setTab("videos")} className={`pb-2 ${tab === "videos" ? "border-b-2 border-white" : "text-white/40"}`}>Videos</button>
      </div>
      <ul className="px-3 py-3">
        {shown.length === 0 && <li className="text-sm text-white/50">{tab === "videos" ? "No videos uploaded. Upload spends 20 energy and shoots a visual." : "No videos on the channel."}</li>}
        {shown.map((track, index) => (
          <li key={`${track.title}-yt-${index}`} className="mb-4">
            <Art title={track.title} className="aspect-video w-full rounded-xl" />
            <div className="mt-2 flex gap-2">
              <Face src={props.person.photo} alt="" className="h-8 w-8 rounded-full" />
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold">{track.title}</p>
                <p className="text-[12px] text-[#aaa]">{props.person.nick} · {fmt(track.streams)} plays · {track.visual ? "Official video" : "Audio"}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BillboardPage(props: { person: Person; chart: ChartRow[]; albums: ChartRow[]; onBack: () => void; onChart: () => void }) {
  const rows = [...props.chart].sort((a, b) => a.rank - b.rank);
  const preview = rows.slice(0, 15);
  const you = rows.filter((row) => row.you)[0];
  return (
    <div className="bg-[#f6f4ef] text-[#111]">
      <Status onBack={props.onBack} light />
      <div className="px-4 pt-1 pb-6">
        <p className="text-center font-serif text-[28px] leading-none font-black tracking-tight">Billboard</p>
        <p className="mt-3 text-center font-serif text-[34px] leading-none font-black">HOT 100</p>
        <p className="mt-1 text-center text-[12px] tracking-wide text-[#555]">THE WEEK IN {props.person.city.toUpperCase()}</p>
        <article className="mt-4 border-y-2 border-black py-3">
          <p className="text-[10px] font-black tracking-[0.2em]">HOT NEWS</p>
          <p className="mt-1 font-serif text-[18px] leading-snug font-bold">
            {you ? `${you.title} is #${you.rank}.` : "No one is writing about you. The board is still other people's songs."}
          </p>
          <p className="mt-1 text-[13px] leading-snug text-[#333]">
            {rows.length} songs had plays this week. The list is not padded to 100. Top 40 only counts when at least 40 songs are on it. Score is this week's plays, not followers. Radio and ticket sales are not a second ledger.
          </p>
        </article>
        <ol className="mt-2">
          {preview.length === 0 && <li className="py-4 text-sm text-[#666]">The board fills on Friday morning.</li>}
          {preview.map((row) => (
            <li key={`${row.rank}-${row.name}-${row.title}`} className={`flex items-center gap-3 border-b border-black/10 py-2.5 ${row.you ? "bg-[#ffe56a]/70 -mx-2 px-2" : ""}`}>
              <span className="w-8 text-center font-serif text-[22px] font-black">{row.rank}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-black">{row.title}</span>
                <span className="block truncate text-[12px] text-[#444]">{row.name}</span>
              </span>
              <span className="text-right text-[10px] leading-tight text-[#555]">
                {row.back ? "RE" : row.move == null ? "NEW" : row.move > 0 ? `+${row.move}` : row.move < 0 ? `${row.move}` : "—"}
                <br />
                PK {row.peak}
              </span>
            </li>
          ))}
        </ol>
        <button type="button" onClick={props.onChart} className="mt-4 w-full bg-black py-3 text-[13px] font-black tracking-widest text-white">
          FULL CHART
        </button>
        <h3 className="mt-6 font-serif text-[22px] font-black">BILLBOARD 200</h3>
        <p className="text-[12px] text-[#555]">Albums only. A single filed onto an album is not counted again here.</p>
        <ol>
          {props.albums.length === 0 && <li className="py-3 text-sm text-[#666]">No album has enough plays this week.</li>}
          {props.albums.slice(0, 8).map((row) => (
            <li key={`alb-${row.rank}-${row.name}-${row.title}`} className={`flex items-center justify-between gap-2 border-b border-black/10 py-2 text-sm ${row.you ? "font-black" : ""}`}>
              <span className="min-w-0 truncate">{row.rank}. {row.title}</span>
              <span className="shrink-0 text-[#555]">{row.back ? "RE" : row.move == null ? "NEW" : row.move > 0 ? `+${row.move}` : row.move < 0 ? `${row.move}` : "—"}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function WikiArticle(props: {
  person: Person;
  released: Release[];
  styles: string[];
  debut?: Release;
  history: { id: string; day: number; name: string; detail: string }[];
  recognition: string;
  certs: { title: string; level: string; units: number; day: number }[];
  no1s: number;
  bestRun: number;
  fanNotes: { id: string; day: number; text: string }[];
  soldOut: { id: string; day: number; place: string; soldOut: boolean }[];
  onBack: () => void;
}) {
  const songs = props.released.filter((t) => t.kind !== "album");
  const albums = props.released.filter((t) => t.kind === "album");
  return (
    <div className="bg-white text-[#202122]">
      <div className="flex items-center gap-2 border-b border-[#a2a9b1] bg-[#f8f9fa] px-2 py-1.5">
        <button type="button" aria-label="Back" onClick={props.onBack} className="grid h-8 w-8 place-items-center">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="font-serif text-[22px] leading-none">
          <span className="text-[#777]">W</span>ikipedia
        </p>
      </div>
      <article className="px-4 py-3 pb-8">
        <h2 className="border-b border-[#a2a9b1] font-serif text-[28px] leading-tight">{props.person.nick}</h2>
        <aside className="float-right mt-3 mb-2 ml-3 w-[46%] border border-[#a2a9b1] bg-[#f8f9fa] text-[12px]">
          <Face src={props.person.photo} alt="" className="aspect-square w-full" />
          <p className="px-1 py-1 text-center text-[11px]">{props.person.nick} in {props.person.city}</p>
          <table className="w-full">
            <tbody>
              <WikiRow k="Born" v={`${props.person.age} · ${props.person.city}`} />
              <WikiRow k="Occupation" v={props.person.role} />
              <WikiRow k="Years active" v={`${props.person.startYear}–present`} />
              <WikiRow k="Recognition" v={props.recognition} />
              <WikiRow k="No. 1s" v={String(props.no1s)} />
              <WikiRow k="Longest run" v={props.bestRun ? `${props.bestRun} wk` : "—"} />
              <WikiRow k="Genres" v={props.styles.slice(0, 3).join(", ") || "—"} />
            </tbody>
          </table>
        </aside>
        <p className="mt-2 text-[14px] leading-relaxed">
          <b>{props.person.fullName}</b> is a {props.person.role.toLowerCase()} from {props.person.city}.
          {props.debut
            ? ` ${props.debut.kind === "album" ? "Their premiere" : "Their debut"}, "${props.debut.title}," has ${fmt(props.debut.streams)} plays.`
            : " They have not released a recording."}
        </p>
        <h3 className="mt-4 border-b border-[#a2a9b1] font-serif text-[20px]">Career</h3>
        <ul className="mt-2 flex flex-col gap-1 text-[14px]">
          {props.history.length === 0 && <li>Nothing recorded yet. Chart spots, certifications, and awards land here once.</li>}
          {props.history.slice(0, 16).map((row) => (
            <li key={row.id}><b>{row.name}.</b> {row.detail} <span className="text-[#72777d]">Day {row.day}.</span></li>
          ))}
        </ul>
        {props.soldOut.some((row) => row.soldOut) && (
          <>
            <h3 className="mt-4 border-b border-[#a2a9b1] font-serif text-[20px]">Shows</h3>
            <ul className="mt-2 text-[14px]">
              {props.soldOut.filter((row) => row.soldOut).slice(0, 6).map((row) => (
                <li key={row.id}>Sold out {row.place}. <span className="text-[#72777d]">Day {row.day}.</span></li>
              ))}
            </ul>
          </>
        )}
        {props.fanNotes.length > 0 && (
          <>
            <h3 className="mt-4 border-b border-[#a2a9b1] font-serif text-[20px]">Listeners</h3>
            <ul className="mt-2 text-[14px]">
              {props.fanNotes.slice(0, 6).map((row) => (
                <li key={row.id}>{row.text} <span className="text-[#72777d]">Day {row.day}.</span></li>
              ))}
            </ul>
          </>
        )}
        {props.certs.filter((row) => row.level).length > 0 && (
          <>
            <h3 className="mt-4 border-b border-[#a2a9b1] font-serif text-[20px]">Certifications</h3>
            <ul className="mt-2 text-[14px]">
              {props.certs.filter((row) => row.level).map((row) => (
                <li key={`${row.title}-${row.level}`}>{row.title}: {certName(row.level)} · {row.units} units · day {row.day}</li>
              ))}
            </ul>
          </>
        )}
        <h3 className="mt-4 border-b border-[#a2a9b1] font-serif text-[20px]">Discography</h3>
        <h4 className="mt-2 text-[15px] font-bold">Studio albums</h4>
        {albums.length === 0 ? <p className="text-[14px]">None.</p> : <WikiList tracks={albums} />}
        <h4 className="mt-2 text-[15px] font-bold">Singles</h4>
        {songs.length === 0 ? <p className="text-[14px]">None.</p> : <WikiList tracks={songs} />}
      </article>
    </div>
  );
}

function WikiRow({ k, v }: { k: string; v: string }) {
  return (
    <tr className="border-t border-[#a2a9b1]">
      <th className="px-1 py-1 text-left align-top font-bold">{k}</th>
      <td className="px-1 py-1">{v}</td>
    </tr>
  );
}

function WikiList({ tracks }: { tracks: Release[] }) {
  return (
    <ul className="list-disc pl-5 text-[14px]">
      {tracks.map((track, index) => (
        <li key={`${track.title}-w-${index}`}>
          <i>{track.title}</i> — {fmt(track.streams)} plays{track.visual ? " · video" : ""}
        </li>
      ))}
    </ul>
  );
}

function GrowMe({ onBack, onPromo }: { onBack: () => void; onPromo: () => void }) {
  return (
    <div className="bg-[#16122a] px-4 pt-2 pb-8 text-white">
      <Status onBack={onBack} />
      <h2 className="mt-4 text-2xl font-black">GrowMe</h2>
      <p className="mt-2 text-sm leading-snug text-white/70">This is a promo desk, not a profile. It pushes a song that is ready or already out. It is not an awards show.</p>
      <button type="button" onClick={onPromo} className="mt-4 w-full rounded-full bg-[#7c5cff] py-3 text-[15px] font-black">
        PRE-PROMO · {COSTS.promo} ENERGY
      </button>
    </div>
  );
}

function Gramophone({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <path d="M8 42c10-22 24-30 44-26-6 10-14 16-26 20-4-6-10-8-18 6z" fill="#e6c15a" />
      <path d="M30 38v12" stroke="#f6e7a8" strokeWidth="3" strokeLinecap="round" />
      <rect x="18" y="50" width="28" height="5" rx="1" fill="#c9a24a" />
      <circle cx="46" cy="18" r="2.2" fill="#fff6d0" />
    </svg>
  );
}

export function GrammyRoom(props: {
  year: number;
  rows: { name: string; nom: boolean; win: boolean; winner?: string; why?: string }[];
  won: { id: string; name: string; week: number }[];
  tracks?: { id: string; title: string; kind: string }[];
  submitted?: { trackId: string; category: string; season: number }[];
  recognition?: string;
  offers?: { name: string; energy: number; cost?: number; note?: string }[];
  onSubmit?: (trackId: string, category: GrammyCategory) => void;
  onInterview?: (name?: string) => void;
  onLabel?: () => void;
  onBack: () => void;
}) {
  return (
    <div className="relative overflow-hidden bg-[#070605] px-4 pt-2 pb-8 text-[#f6edd4]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_50%_0%,rgba(230,193,90,0.35),transparent_70%)]" />
      <button type="button" onClick={props.onBack} className="relative text-sm font-bold text-[#e6c15a]">
        Back
      </button>
      <Gramophone className="relative mx-auto mt-2 h-16 w-16" />
      <p className="relative mt-2 text-center text-[11px] font-bold tracking-[0.35em] text-[#e6c15a]">THE AWARDS</p>
      <h2 className="relative text-center font-serif text-[28px] leading-none font-black">Grammy Awards</h2>
      <p className="relative text-center font-serif text-[22px] text-[#e6c15a]">{props.year}</p>
      <p className="relative mx-auto mt-2 max-w-[16rem] text-center text-[12px] leading-snug text-[#d9cba8]/80">
        Every 84 mornings the room votes. A nomination is not a win. {props.recognition ?? "Unknown Artist"}.
      </p>
      <ul className="relative mt-5 flex flex-col gap-3">
        {props.rows.map((row) => (
          <li key={row.name} className="border border-[#e6c15a]/40 bg-black/40 px-3 py-3">
            <p className="text-[10px] font-bold tracking-[0.18em] text-[#e6c15a]">CATEGORY</p>
            <p className="font-serif text-[18px] leading-tight">{row.name}</p>
            <p className={`mt-2 text-[12px] font-black tracking-wide ${row.win ? "text-[#ffe58a]" : row.nom ? "text-white" : "text-white/35"}`}>
              {row.win ? "YOU WON" : row.nom ? "YOU ARE NOMINATED" : "NOT NOMINATED"}
            </p>
            {row.winner && <p className="mt-1 text-[12px] text-[#d9cba8]/80">{row.winner}</p>}
            {row.why && row.nom && <p className="mt-1 text-[11px] leading-snug text-[#d9cba8]/70">{row.why}</p>}
          </li>
        ))}
      </ul>
      {props.onSubmit && (props.tracks?.length ?? 0) > 0 && (
        <div className="relative mt-6">
          <p className="text-[10px] font-bold tracking-[0.22em] text-[#e6c15a]">SUBMIT THIS SEASON</p>
          <p className="mt-1 text-[12px] text-[#d9cba8]/80">Only music released in the current 84 days. One recording can sit in a category once. The label files the same list. It cannot file a song twice.</p>
          <ul className="mt-2 flex flex-col gap-2">
            {props.tracks!.slice(0, 6).map((track) => (
              <li key={track.id} className="border border-white/10 px-2 py-2">
                <p className="text-sm font-bold">{track.title}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {GRAMMY_CATEGORIES.filter((category) => (track.kind === "album" ? category.includes("Album") : category !== "Best Rap Album" && category !== "Album of the Year")).map((category) => {
                    const filed = props.submitted?.some((row) => row.trackId === track.id && row.category === category);
                    return (
                      <button
                        key={category}
                        type="button"
                        disabled={filed}
                        onClick={() => props.onSubmit?.(track.id, category)}
                        className="rounded-full border border-[#e6c15a]/50 px-2 py-1 text-[10px] font-bold disabled:opacity-40"
                      >
                        {filed ? "In" : category}
                      </button>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {props.onLabel && (
        <button type="button" onClick={props.onLabel} className="relative mt-3 w-full border border-white/20 py-3 text-[12px] font-bold">
          ASK THE LABEL TO SUBMIT
        </button>
      )}
      {(props.offers ?? []).map((offer) => (
        <button key={offer.name} type="button" onClick={() => props.onInterview?.(offer.name)} className="relative mt-3 w-full border border-[#e6c15a] py-3 text-left px-3">
          <span className="block text-[13px] font-black">{offer.name} · {offer.energy} energy{offer.cost ? ` · $${offer.cost}` : ""}</span>
          {offer.note && <span className="mt-1 block text-[11px] font-normal text-[#d9cba8]/75">{offer.note}</span>}
        </button>
      ))}
      {props.won.length > 0 && (
        <div className="relative mt-6">
          <p className="text-[10px] font-bold tracking-[0.22em] text-[#e6c15a]">ON THE WALL</p>
          <ul className="mt-2 flex flex-col gap-2">
            {props.won.map((award) => (
              <li key={`${award.id}-${award.week}`} className="flex items-center gap-2 text-sm">
                <Gramophone className="h-6 w-6" />
                <span>
                  {award.name}
                  <span className="block text-[11px] text-white/45">Morning {award.week}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function GrammyNight(props: {
  year: number;
  rows: { name: string; nom: boolean; win: boolean }[];
  onOk: () => void;
}) {
  const wins = props.rows.filter((row) => row.win);
  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-black/70 p-4">
      <div className="max-h-[85%] w-full overflow-y-auto bg-[#0b0a08] px-4 py-5 text-[#f6edd4] shadow-2xl">
        <Gramophone className="mx-auto h-14 w-14" />
        <p className="mt-1 text-center text-[11px] tracking-[0.28em] text-[#e6c15a]">GRAMMY AWARDS</p>
        <p className="text-center font-serif text-[40px] leading-none text-[#ffe58a]">{props.year}</p>
        <p className="mt-2 text-center text-[13px] text-[#d9cba8]/80">
          {wins.length ? "You won at least one. The rest of the ballot still belongs to whoever took it." : "No win for you tonight. A nomination is not a trophy."}
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          {props.rows.map((row) => (
            <li key={row.name} className="flex items-center justify-between gap-3 border-t border-[#e6c15a]/25 py-2">
              <span className="font-serif text-[15px]">{row.name}</span>
              <span className={`text-[11px] font-black ${row.win ? "text-[#ffe58a]" : row.nom ? "text-white" : "text-white/30"}`}>
                {row.win ? "WINNER" : row.nom ? "NOMINEE" : "—"}
              </span>
            </li>
          ))}
        </ul>
        <button type="button" onClick={props.onOk} className="mt-4 h-12 w-full bg-[#e6c15a] text-sm font-black text-black">
          OK
        </button>
      </div>
    </div>
  );
}
