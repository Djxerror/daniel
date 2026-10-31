import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CreatorLock, CreatorStart } from "@/components/daniel/creator";
import { housePack, loadPack } from "@/game/creator";
import { CITIES, LOOKS, PATHS } from "@/game/content";
import { useGame } from "@/game/store";
import type { LookId, Pace, PathId } from "@/game/types";

const FACTS = [
  { k: "The day", v: "You get energy. Spend it in the studio, on socials, at a show, or at work. The yellow moon ends the day." },
  { k: "The morning", v: "After you sleep, songs that are out get plays. Hype makes that number bigger. Rent comes every seventh night." },
  { k: "A song", v: "Create, then Record Song or Write Song. Title, style, who is on it, who writes it, which room. The bill is the last screen. Release it after." },
  { k: "Other people", v: "Orders are paid beats. Feat requests put another artist on your song. Labels send paper. Read it before you sign." },
  { k: "Money", v: "Shifts, shows, beats, and streams pay cash. Food buys energy back. Nothing here charges real money." },
];

export function Title({ ready }: { ready: boolean }) {
  const [creating, setCreating] = useState(false);
  const [creator, setCreator] = useState(false);
  const [ask, setAsk] = useState(false);
  const [about, setAbout] = useState(false);

  if (creator) {
    return <CreatorStart onCancel={() => setCreator(false)} />;
  }

  if (creating) {
    return <NewCareer onCancel={() => setCreating(false)} />;
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <img
        src="/looks/hoodie.jpg"
        alt="Daniel"
        className="absolute inset-0 h-full w-full object-cover object-[center_22%]"
      />
      <div className="absolute inset-0 bg-bg/30" />
      <div className="relative mt-auto bg-bg/90 px-5 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <p className="text-xs tracking-widest text-brass uppercase">Music career</p>
        <h1 className="mt-1 font-display text-6xl leading-none">Daniel</h1>
        <p className="mt-3 text-sm leading-relaxed text-pretty text-muted">
          Write the song. Sleep. The morning tells you if it counted.
        </p>
        <button
          type="button"
          disabled={!ready}
          className="mt-5 h-12 w-full rounded-full bg-ember text-sm font-medium text-bg disabled:opacity-40"
          onClick={() => setCreating(true)}
        >
          Start a career
        </button>
        <button
          type="button"
          className="mt-2 h-11 w-full text-sm text-brass"
          onClick={() => setAsk(true)}
        >
          Creator mode
        </button>
        <button
          type="button"
          className="mt-1 h-11 w-full text-sm text-brass"
          onClick={() => setAbout(true)}
        >
          How it works
        </button>
      </div>
      {ask && (
        <CreatorLock
          onCancel={() => setAsk(false)}
          onOk={() => {
            setAsk(false);
            setCreator(true);
          }}
        />
      )}
      {about && (
        <div className="absolute inset-0 z-30 flex items-end bg-bg/70">
          <div className="app-sheet max-h-[80%] w-full overflow-y-auto bg-surface px-5 pt-2">
            <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-line" />
            <h2 className="font-display text-3xl leading-none">How it works</h2>
            <ul className="mt-4">
              {FACTS.map((fact) => (
                <li key={fact.k} className="border-t border-line py-3">
                  <p className="text-sm text-brass">{fact.k}</p>
                  <p className="mt-1 text-sm leading-relaxed text-pretty">{fact.v}</p>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              An original life sim. Progress saves on this device.
            </p>
            <button
              type="button"
              className="mt-4 h-12 w-full rounded-full bg-ember text-sm font-medium text-bg"
              onClick={() => setAbout(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const AGES = Array.from({ length: 35 }, (_, i) => 16 + i);
const YEARS = Array.from({ length: 2026 - 1972 + 1 }, (_, i) => 1972 + i);

function NewCareer({ onCancel }: { onCancel: () => void }) {
  const start = useGame((s) => s.start);
  const [step, setStep] = useState(0);
  const [nick, setNick] = useState("");
  const [fullName, setFullName] = useState("");
  const [cityAt, setCityAt] = useState(0);
  const [ageAt, setAgeAt] = useState(0);
  const [yearAt, setYearAt] = useState(YEARS.length - 1);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [death, setDeath] = useState<"standard" | "off">("standard");
  const [level, setLevel] = useState<"standard" | "hardcore">("standard");
  const [taxes, setTaxes] = useState<"standard" | "heavy">("standard");
  const [look, setLook] = useState<LookId>("hoodie");
  const [path, setPath] = useState<PathId>("rapper");
  const [pace, setPace] = useState<Pace>("standard");
  const savedPack = loadPack();
  const packChoices =
    savedPack.map((artist) => artist.name).join("\n") !== housePack().map((artist) => artist.name).join("\n")
      ? (["Today's pack", "Saved pack"] as const)
      : (["Today's pack"] as const);
  const [packAt, setPackAt] = useState(0);
  const [packNote, setPackNote] = useState("");

  const city = CITIES[cityAt] ?? CITIES[0]!;

  function spinPack(step: number) {
    if (packChoices.length < 2) {
      setPackNote("Only today's pack is loaded. Edit the artists in Creator if you want another.");
      return;
    }
    setPackNote("");
    setPackAt((n) => (n + step + packChoices.length) % packChoices.length);
  }

  function go() {
    const artists =
      packChoices[packAt] === "Saved pack"
        ? savedPack.map(({ name, title, fee, heat }) => ({ name, title, fee, heat }))
        : undefined;
    start({
      look,
      city: city.id,
      path,
      pace: level === "hardcore" ? "relentless" : pace,
      nick,
      fullName: fullName.trim() || nick,
      age: AGES[ageAt],
      year: YEARS[yearAt],
      gender,
      death,
      level,
      taxes,
      artists,
    });
  }

  return (
    <div className="sim-root flex h-full min-h-0 flex-col">
      <header className="flex items-center px-3 pt-[max(0.7rem,env(safe-area-inset-top))]">
        <button type="button" aria-label="Back" onClick={() => (step === 0 ? onCancel() : setStep((n) => n - 1))} className="grid h-11 w-11 place-items-center">
          <ChevronLeft className="h-6 w-6" />
        </button>
      </header>
      <div className="app-scroll px-4 pb-6">
        {step === 0 && (
          <div className="flex flex-col gap-5 pt-4">
            <Field label="NICKNAME" value={nick} placeholder="type here" onChange={setNick} />
            <Field label="FULL NAME" value={fullName} placeholder="enter a name..." onChange={setFullName} />
            <Dial label="CITY" value={city.id} onPrev={() => setCityAt((n) => (n + CITIES.length - 1) % CITIES.length)} onNext={() => setCityAt((n) => (n + 1) % CITIES.length)} />
          </div>
        )}
        {step === 1 && (
          <div className="flex flex-col gap-6 pt-6">
            <Dial label="AGE" value={String(AGES[ageAt])} onPrev={() => setAgeAt((n) => (n + AGES.length - 1) % AGES.length)} onNext={() => setAgeAt((n) => (n + 1) % AGES.length)} />
            <Dial label="YEAR" value={String(YEARS[yearAt])} onPrev={() => setYearAt((n) => (n + YEARS.length - 1) % YEARS.length)} onNext={() => setYearAt((n) => (n + 1) % YEARS.length)} />
            <Dial label="GENDER" value={gender === "male" ? "Male" : "Female"} onPrev={() => setGender((g) => (g === "male" ? "female" : "male"))} onNext={() => setGender((g) => (g === "male" ? "female" : "male"))} />
            <Dial label="DEATH" value={death === "standard" ? "Standard" : "Off"} danger={death === "standard"} onPrev={() => setDeath((d) => (d === "standard" ? "off" : "standard"))} onNext={() => setDeath((d) => (d === "standard" ? "off" : "standard"))} />
          </div>
        )}
        {step === 2 && (
          <div className="flex flex-col gap-5 pt-2">
            <p className="text-center text-xs font-black tracking-widest text-white/45">LOOK</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {LOOKS.map((item) => (
                <button key={item.id} type="button" onClick={() => setLook(item.id)} className={`w-20 shrink-0 overflow-hidden rounded-2xl ${look === item.id ? "ring-2 ring-white" : ""}`}>
                  <img src={item.src} alt="" className="h-28 w-full object-cover object-[center_16%]" />
                </button>
              ))}
            </div>
            <Dial label="LEVEL" value={level === "hardcore" ? "Hardcore" : "Standard"} danger={level === "hardcore"} onPrev={() => setLevel((v) => (v === "standard" ? "hardcore" : "standard"))} onNext={() => setLevel((v) => (v === "standard" ? "hardcore" : "standard"))} />
            <Dial label="TAXES" value={taxes === "heavy" ? "Heavy" : "Standard"} onPrev={() => setTaxes((v) => (v === "standard" ? "heavy" : "standard"))} onNext={() => setTaxes((v) => (v === "standard" ? "heavy" : "standard"))} />
            <Dial label="ARTISTS" value={packChoices[packAt] ?? "Today's pack"} onPrev={() => spinPack(-1)} onNext={() => spinPack(1)} />
            {packNote ? <p className="text-center text-xs text-white/60">{packNote}</p> : null}
            <div>
              <p className="text-center text-sm font-black tracking-widest">TIME MODE</p>
              <p className="mt-2 text-center text-lg font-bold">Daily</p>
              <p className="mt-1 text-center text-xs text-white/50">Only Daily is available. There is no other mode to switch to.</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(PATHS) as PathId[]).map((id) => (
                <button key={id} type="button" onClick={() => setPath(id)} className={`h-11 rounded-full text-xs font-black ${path === id ? "bg-white text-[#12162a]" : "bg-white/10"}`}>
                  {PATHS[id].label}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setPace((p) => (p === "standard" ? "relentless" : "standard"))} className="text-center text-xs text-white/55">
              Pace: {pace === "relentless" || level === "hardcore" ? "Rent from week one" : "First week free"}
            </button>
          </div>
        )}
      </div>
      <div className="px-6 pb-[max(1.2rem,env(safe-area-inset-bottom))]">
        {step < 2 ? (
          <button type="button" onClick={() => setStep((n) => n + 1)} className="sim-pill sim-pill-cyan text-[16px]">
            NEXT
          </button>
        ) : (
          <button type="button" onClick={go} className="sim-pill sim-pill-cyan text-[16px]">
            OK
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-center">
      <span className="text-sm font-black tracking-widest">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value.slice(0, 28))}
        className="mt-2 w-full bg-transparent text-center text-base outline-none placeholder:text-white/35"
      />
    </label>
  );
}

function Dial({
  label,
  value,
  onPrev,
  onNext,
  danger,
}: {
  label: string;
  value: string;
  onPrev: () => void;
  onNext: () => void;
  danger?: boolean;
}) {
  return (
    <div>
      <p className="text-center text-sm font-black tracking-widest">{label}</p>
      <div className="mt-2 flex items-center justify-center gap-3">
        <button type="button" aria-label={`Previous ${label}`} onClick={onPrev} className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-b from-emerald-300 to-emerald-600 text-[#06210f]">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className={`min-w-[7rem] text-center text-lg font-bold ${danger ? "text-red-400" : ""}`}>{value}</p>
        <button type="button" aria-label={`Next ${label}`} onClick={onNext} className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-b from-emerald-300 to-emerald-600 text-[#06210f]">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
