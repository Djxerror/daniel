import { useEffect, useState, type FormEvent } from "react";
import { CITIES, LOOKS, PATHS } from "@/game/content";
import { housePack, loadPack, PACK_MAX, PACK_MIN, savePack, type PackArtist } from "@/game/creator";
import { money } from "@/game/format";
import { useGame } from "@/game/store";
import type { LookId, Pace, PathId } from "@/game/types";

const PRESETS = [
  { id: "street", label: "Street", cash: 750, fans: 24, hype: 8, reputation: 4, skill: 0 },
  { id: "buzz", label: "Buzz", cash: 12_000, fans: 4_000, hype: 46, reputation: 32, skill: 12 },
  { id: "star", label: "Already up", cash: 250_000, fans: 180_000, hype: 78, reputation: 70, skill: 28 },
] as const;

type Numbers = {
  cash: number;
  fans: number;
  hype: number;
  reputation: number;
  skill: number;
};

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

const CREATOR_PASSWORD = "Havefun123!";

export function CreatorLock({ onOk, onCancel }: { onOk: () => void; onCancel: () => void }) {
  const [value, setValue] = useState("");
  const [bad, setBad] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (value === CREATOR_PASSWORD) onOk();
    else {
      setBad(true);
      setValue("");
    }
  }

  return (
    <div className="absolute inset-0 z-40 flex items-end bg-black/70">
      <form className="w-full rounded-t-3xl bg-[#12162a] px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]" onSubmit={submit}>
        <p className="text-center text-xs font-black tracking-widest text-white/50">CREATOR</p>
        <h2 className="mt-1 text-center text-2xl font-black">Password</h2>
        <input
          type="password"
          autoFocus
          autoComplete="current-password"
          aria-label="Creator password"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setBad(false);
          }}
          className="mt-4 h-12 w-full rounded-full bg-black/40 px-4 text-center text-base outline-none"
        />
        <p className="mt-2 h-5 text-center text-xs text-red-400">{bad ? "Wrong password." : ""}</p>
        <button type="submit" className="sim-pill sim-pill-cyan text-[16px]">
          ENTER
        </button>
        <button type="button" onClick={onCancel} className="mt-2 h-11 w-full text-sm text-white/60">
          Cancel
        </button>
      </form>
    </div>
  );
}

export function CreatorStart({ onCancel }: { onCancel: () => void }) {
  const start = useGame((s) => s.start);
  const [pack, setPack] = useState<PackArtist[]>(housePack);
  const [look, setLook] = useState<LookId>("hoodie");
  const [city, setCity] = useState("Chicago");
  const [path, setPath] = useState<PathId>("rapper");
  const [pace, setPace] = useState<Pace>("standard");
  const [nums, setNums] = useState<Numbers>({ cash: 750, fans: 24, hype: 8, reputation: 4, skill: 0 });

  useEffect(() => {
    setPack(loadPack());
  }, []);

  function commit(next: PackArtist[]) {
    setPack(next);
    savePack(next);
  }

  const ready = pack.length >= PACK_MIN;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="app-nav flex items-center justify-between px-4 pb-2">
        <button type="button" className="min-h-11 text-sm text-ember" onClick={onCancel}>
          Cancel
        </button>
        <p className="text-sm font-medium">Creator mode</p>
        <span className="w-14" />
      </header>
      <div className="app-scroll px-4 pb-8">
        <p className="text-sm leading-relaxed text-muted">
          Look and numbers first. The artist pack is below. Songs still have to be written.
        </p>
        <section className="mt-4">
          <h2 className="mb-2 text-xs tracking-widest text-brass uppercase">Look</h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {LOOKS.map((item) => {
              const on = item.id === look;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLook(item.id)}
                  className={`w-24 shrink-0 overflow-hidden rounded-2xl border text-left ${on ? "border-ember" : "border-line"}`}
                >
                  <img src={item.src} alt="" className="h-32 w-full object-cover object-[center_22%]" />
                  <span className="block px-2 py-1.5 text-xs">{item.name}</span>
                </button>
              );
            })}
          </div>
        </section>
        <section className="mt-4">
          <h2 className="mb-2 text-xs tracking-widest text-brass uppercase">City</h2>
          <div className="flex flex-wrap gap-2">
            {CITIES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCity(item.id)}
                className={`h-10 rounded-full px-3 text-sm ${city === item.id ? "bg-ember text-bg" : "bg-surface text-fg"}`}
              >
                {item.id}
              </button>
            ))}
          </div>
        </section>
        <section className="mt-4">
          <h2 className="mb-2 text-xs tracking-widest text-brass uppercase">Lane</h2>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(PATHS) as PathId[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setPath(id)}
                className={`h-11 rounded-2xl text-sm ${path === id ? "bg-ember text-bg" : "bg-surface"}`}
              >
                {PATHS[id].label}
              </button>
            ))}
          </div>
        </section>
        <section className="mt-4">
          <h2 className="mb-2 text-xs tracking-widest text-brass uppercase">Pace</h2>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["standard", "Standard"],
                ["relentless", "Relentless"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setPace(id)}
                className={`h-11 rounded-2xl text-sm ${pace === id ? "bg-ember text-bg" : "bg-surface"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>
        <NumbersForm nums={nums} onChange={setNums} dark={false} />
        <PackEditor pack={pack} onChange={commit} />
      </div>
      <div className="app-tabbar shrink-0 border-t border-line bg-bg px-4 pt-3">
        <button
          type="button"
          disabled={!ready}
          className="h-12 w-full rounded-full bg-ember text-sm font-medium text-bg disabled:opacity-40"
          onClick={() =>
            start({
              look,
              city,
              path,
              pace,
              nick: "Daniel",
              fullName: "Daniel",
              creator: {
                artists: pack,
                cash: nums.cash,
                fans: nums.fans,
                hype: nums.hype,
                reputation: nums.reputation,
                skill: nums.skill,
              },
            })
          }
        >
          {ready ? "Start creator career" : `Need ${PACK_MIN} artists`}
        </button>
      </div>
    </div>
  );
}

export function CreatorDesk({
  cash,
  fans,
  hype,
  reputation,
  onApply,
  onInstall,
}: {
  cash: number;
  fans: number;
  hype: number;
  reputation: number;
  onApply: (patch: Numbers & { fillEnergy: boolean; train: boolean }) => void;
  onInstall: (pack: PackArtist[]) => void;
}) {
  const [pack, setPack] = useState<PackArtist[]>(housePack);
  const [nums, setNums] = useState<Numbers>({ cash, fans, hype, reputation, skill: 0 });
  const [fill, setFill] = useState(true);
  const [train, setTrain] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    setPack(loadPack());
  }, []);

  function commit(next: PackArtist[]) {
    setPack(next);
    savePack(next);
  }

  return (
    <div className="flex flex-col gap-4 pb-6">
      <p className="text-sm leading-relaxed text-white/70">
        Off the clock. Set cash, fans, hype, and who is on the chart. A song still has to be written, recorded, and released.
      </p>
      <NumbersForm nums={nums} onChange={setNums} dark />
      <label className="flex items-center justify-between rounded-2xl bg-white/8 px-4 py-3 text-sm">
        <span>Fill energy</span>
        <input type="checkbox" checked={fill} onChange={(e) => setFill(e.target.checked)} />
      </label>
      <label className="flex items-center justify-between rounded-2xl bg-white/8 px-4 py-3 text-sm">
        <span>Train every skill +8</span>
        <input type="checkbox" checked={train} onChange={(e) => setTrain(e.target.checked)} />
      </label>
      <button
        type="button"
        className="sim-sleep h-12 rounded-full text-sm font-black"
        onClick={() => {
          onApply({ ...nums, fillEnergy: fill, train });
          setNums((current) => ({ ...current, skill: 0 }));
          setTrain(false);
          setNote("Numbers are in.");
        }}
      >
        Apply to this career
      </button>
      <PackEditor pack={pack} onChange={commit} dark />
      <button
        type="button"
        disabled={pack.length < PACK_MIN}
        className="h-12 rounded-full bg-white text-sm font-black text-[#12141c] disabled:opacity-40"
        onClick={() => {
          onInstall(pack);
          setNote("Chart rewritten from this pack.");
        }}
      >
        Put this pack on the chart
      </button>
      {note && <p className="text-center text-sm text-[#ffe14a]">{note}</p>}
    </div>
  );
}

function NumbersForm({
  nums,
  onChange,
  dark,
}: {
  nums: Numbers;
  onChange: (next: Numbers) => void;
  dark: boolean;
}) {
  const chip = dark ? "bg-white/10" : "bg-surface";
  const onChip = dark ? "bg-[#ffe14a] text-[#17191e]" : "bg-ember text-bg";
  return (
    <section className="mt-4">
      <h2 className={`mb-2 text-xs tracking-widest uppercase ${dark ? "text-white/50" : "text-brass"}`}>Numbers</h2>
      <div className="flex gap-2">
        {PRESETS.map((preset) => {
          const on =
            nums.cash === preset.cash && nums.fans === preset.fans && nums.hype === preset.hype && nums.skill === preset.skill;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() =>
                onChange({
                  cash: preset.cash,
                  fans: preset.fans,
                  hype: preset.hype,
                  reputation: preset.reputation,
                  skill: preset.skill,
                })
              }
              className={`h-10 flex-1 rounded-full text-xs font-bold ${on ? onChip : chip}`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Field label="Cash" value={nums.cash} max={50_000_000} dark={dark} onChange={(cash) => onChange({ ...nums, cash })} />
        <Field label="Fans" value={nums.fans} max={50_000_000} dark={dark} onChange={(fans) => onChange({ ...nums, fans })} />
      </div>
      <Slider label="Hype" value={nums.hype} max={100} dark={dark} onChange={(hype) => onChange({ ...nums, hype })} />
      <Slider
        label="Reputation"
        value={nums.reputation}
        max={100}
        dark={dark}
        onChange={(reputation) => onChange({ ...nums, reputation })}
      />
      <Slider label="Skill bump" value={nums.skill} max={40} dark={dark} onChange={(skill) => onChange({ ...nums, skill })} />
    </section>
  );
}

function PackEditor({
  pack,
  onChange,
  dark = false,
}: {
  pack: PackArtist[];
  onChange: (next: PackArtist[]) => void;
  dark?: boolean;
}) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [fee, setFee] = useState(800);
  const [heat, setHeat] = useState(55);
  const [error, setError] = useState("");
  const card = dark ? "bg-white/8" : "bg-surface";
  const field = dark
    ? "h-11 w-full rounded-xl bg-black/30 px-3 text-sm outline-none"
    : "h-11 w-full rounded-xl bg-bg px-3 text-sm outline-none";

  function add() {
    const clean = name.trim().replace(/\s+/g, " ");
    if (clean.length < 2) {
      setError("Name needs 2 letters.");
      return;
    }
    if (clean.toLowerCase() === "daniel") {
      setError("That name is you.");
      return;
    }
    if (pack.some((artist) => artist.name.toLowerCase() === clean.toLowerCase())) {
      setError("Already on the pack.");
      return;
    }
    if (pack.length >= PACK_MAX) {
      setError(`Pack holds ${PACK_MAX}.`);
      return;
    }
    const single = title.trim().replace(/\s+/g, " ").slice(0, 28) || "Untitled";
    onChange([...pack, { id: newId(), name: clean.slice(0, 22), title: single, fee, heat }]);
    setName("");
    setTitle("");
    setError("");
  }

  return (
    <section className="mt-6">
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className={`text-xs tracking-widest uppercase ${dark ? "text-white/50" : "text-brass"}`}>Artist pack</h2>
        <button type="button" className="text-xs text-ember" onClick={() => onChange(housePack())}>
          House pack
        </button>
      </div>
      <ul className="flex flex-col gap-2">
        {pack.map((artist) => (
          <li key={artist.id} className={`flex items-center justify-between gap-3 rounded-2xl px-3 py-2 ${card}`}>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{artist.name}</span>
              <span className={`block truncate text-xs ${dark ? "text-white/50" : "text-muted"}`}>
                {artist.title} · feat {money(artist.fee)} · heat {artist.heat}
              </span>
            </span>
            <button
              type="button"
              className="shrink-0 text-xs text-ember"
              onClick={() => onChange(pack.filter((row) => row.id !== artist.id))}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <input className={field} placeholder="Artist name" value={name} maxLength={22} onChange={(e) => setName(e.target.value)} />
        <input className={field} placeholder="Their single" value={title} maxLength={28} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <Slider label="Feat fee" value={fee} max={20000} step={100} dark={dark} onChange={setFee} />
      <Slider label="Heat" value={heat} max={99} dark={dark} onChange={setHeat} />
      {error && <p className="mt-2 text-xs text-ember">{error}</p>}
      <button type="button" onClick={add} className={`mt-3 h-11 w-full rounded-full text-sm font-bold ${dark ? "bg-white/15" : "bg-surface"}`}>
        Add artist
      </button>
      <p className={`mt-2 text-xs ${dark ? "text-white/45" : "text-muted"}`}>
        {pack.length}/{PACK_MAX}. Need {PACK_MIN} to start or to rewrite the chart. Feat fee is what they charge for a verse.
      </p>
    </section>
  );
}

function Field({
  label,
  value,
  max,
  dark,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  dark: boolean;
  onChange: (n: number) => void;
}) {
  const [text, setText] = useState(String(value));
  useEffect(() => {
    const parsed = Number(text);
    if (!Number.isFinite(parsed) || Math.round(parsed) !== value) setText(String(value));
  }, [value, text]);
  return (
    <label className="block">
      <span className={`text-xs ${dark ? "text-white/50" : "text-muted"}`}>{label}</span>
      <input
        type="text"
        inputMode="decimal"
        value={text}
        onChange={(e) => {
          const cleaned = e.target.value.replace(/[^0-9.]/g, "");
          const parts = cleaned.split(".");
          const next = parts.length > 1 ? `${parts[0]}.${parts.slice(1).join("").slice(0, 2)}` : parts[0] ?? "";
          setText(next);
          if (next === "" || next === ".") {
            onChange(0);
            return;
          }
          const parsed = Number(next);
          if (!Number.isFinite(parsed)) return;
          onChange(Math.max(0, Math.min(max, Math.round(parsed))));
        }}
        className={`mt-1 h-11 w-full rounded-xl px-3 text-sm outline-none ${dark ? "bg-black/30" : "bg-surface"}`}
      />
    </label>
  );
}

function Slider({
  label,
  value,
  max,
  step = 1,
  dark,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  step?: number;
  dark: boolean;
  onChange: (n: number) => void;
}) {
  return (
    <label className="mt-3 block">
      <span className={`flex justify-between text-xs ${dark ? "text-white/50" : "text-muted"}`}>
        <span>{label}</span>
        <span className={dark ? "text-white" : "text-fg"}>{label === "Feat fee" ? money(value) : value}</span>
      </span>
      <input
        type="range"
        min={label === "Heat" ? 10 : 0}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-[#ff5c2a]"
      />
    </label>
  );
}
