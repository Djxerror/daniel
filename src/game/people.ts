import type { Bond, BondStatus, Career, CircleAsk, CircleNote, Crew, Industry, Npc, Tone } from "@/game/types";

export type MoveId = "intro" | "talk" | "compliment" | "hang" | "support" | "apologize" | "resolve";
export type DealMode = "accept" | "cut" | "royalty";

export type PeopleAction =
  | { type: "move"; name: string; move: MoveId }
  | { type: "event"; id: string }
  | { type: "crew"; name: string }
  | { type: "invite"; name: string }
  | { type: "kick"; name: string }
  | { type: "leave" }
  | { type: "note"; id: string; yes: boolean }
  | { type: "intro"; name: string }
  | { type: "date"; name: string }
  | { type: "break"; name: string }
  | { type: "deal"; name: string; mode: DealMode };

export const MOVES: { id: MoveId; label: string; energy: number; note: string }[] = [
  { id: "intro", label: "Introduce yourself", energy: 4, note: "First hello. Strangers only." },
  { id: "talk", label: "Talk", energy: 6, note: "A real conversation." },
  { id: "compliment", label: "Compliment the music", energy: 4, note: "Respect moves more than friendship." },
  { id: "hang", label: "Hang out", energy: 14, note: "Costs a little cash. Trust moves." },
  { id: "support", label: "Support their song", energy: 8, note: "Post it, mean it." },
  { id: "apologize", label: "Apologize", energy: 8, note: "Only helps if something is strained." },
  { id: "resolve", label: "Settle it", energy: 12, note: "Harder with an enemy. Strain drops." },
];

export const ROOMS: { id: string; name: string; detail: string; energy: number; cash: number; fame: number; respect: number }[] = [
  { id: "party", name: "Release party", detail: "A small room. Somebody new is usually there.", energy: 12, cash: 30, fame: 0, respect: 0 },
  { id: "studio", name: "Open studio", detail: "Sit in. Nobody makes the beat for you.", energy: 14, cash: 0, fame: 0, respect: 0 },
  { id: "mixer", name: "Industry mixer", detail: "Names get traded. The door is not free.", energy: 10, cash: 80, fame: 6, respect: 0 },
  { id: "backstage", name: "Backstage", detail: "After a real show.", energy: 16, cash: 50, fame: 14, respect: 0 },
  { id: "awards", name: "Awards hallway", detail: "They already know the name, or you don't get in.", energy: 18, cash: 120, fame: 26, respect: 0 },
  { id: "vip", name: "VIP room", detail: "Reputation opens it. Money alone does not.", energy: 14, cash: 160, fame: 18, respect: 22 },
];

const PERSONAS = ["friendly", "arrogant", "competitive", "business", "loyal", "jealous", "slick", "respectful"] as const;
const STYLES = ["Hip-Hop", "Trap", "Drill", "R&B", "Pop", "Soul", "Afrobeats"];
const CREW_RIVALS = ["Night Shift", "South Line", "Velvet Room", "Low Desk", "Paper Moon"];
export type Persona = (typeof PERSONAS)[number];

function hash(text: string) {
  let h = 0;
  for (const c of text) h = (h * 33 + c.charCodeAt(0)) >>> 0;
  return h;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function mid() {
  return `c${Date.now().toString(36)}${Math.floor(Math.random() * 999)}`;
}

export function emptyIndustry(): Industry {
  return { loyal: 8, generous: 6, respected: 4, difficult: 0, controversial: 0, fake: 0 };
}

export function emptyBond(day: number | null): Bond {
  return { friendship: 0, respect: 0, trust: 0, strain: 0, met: day, history: [], romance: "none", last: 0 };
}

export function personaOf(name: string): Persona {
  return PERSONAS[hash(name) % PERSONAS.length]!;
}

export function styleOf(name: string) {
  return STYLES[hash(name + ":style") % STYLES.length]!;
}

export function personaLine(name: string) {
  const line: Record<Persona, string> = {
    friendly: "Easy to talk to. Remembers the small things.",
    arrogant: "Hard to impress. Hates being asked twice.",
    competitive: "Keeps score. Respects a real record.",
    business: "Everything has a price, including a favor.",
    loyal: "Slow to open. Stays when it costs them.",
    jealous: "Warm until your numbers pass theirs.",
    slick: "Charming. The promise is the part that slips.",
    respectful: "Judges the music first, the person second.",
  };
  return line[personaOf(name)];
}

export function tiesOf(name: string, names: string[]) {
  const others = names.filter((n) => n !== name);
  if (others.length === 0) return { friend: null as string | null, rival: null as string | null };
  const friend = others[hash(name + ":f") % others.length]!;
  const rest = others.filter((n) => n !== friend);
  const rival = rest.length ? rest[hash(name + ":r") % rest.length]! : null;
  return { friend, rival };
}

export function statusOf(bond: Bond): BondStatus {
  if (bond.strain >= 78 && bond.friendship < 32) return "enemy";
  if (bond.strain >= 55 && bond.friendship < 50) return "rival";
  if (bond.met == null && bond.friendship < 12) return "stranger";
  if (bond.friendship >= 82 && bond.trust >= 68 && bond.respect >= 50 && bond.strain < 30) return "best";
  if (bond.friendship >= 66 && bond.trust >= 48 && bond.respect >= 35 && bond.strain < 40) return "close";
  if (bond.friendship >= 46 && bond.trust >= 28 && bond.strain < 45) return "friend";
  if (bond.friendship >= 28 && bond.trust >= 16) return "associate";
  if (bond.friendship >= 12 || bond.met != null) return "acquaintance";
  return "stranger";
}

export function statusLabel(status: BondStatus) {
  if (status === "close") return "Close friend";
  if (status === "best") return "Best friend";
  return status.slice(0, 1).toUpperCase() + status.slice(1);
}

/** Keeps the old -3..4 mood in step so the band and the desk still read it. */
export function legacyMood(bond: Bond) {
  const status = statusOf(bond);
  if (status === "enemy") return -3;
  if (status === "rival") return -2;
  if (status === "stranger") return 0;
  if (status === "acquaintance") return 1;
  if (status === "associate") return 2;
  if (status === "friend") return 3;
  return 4;
}

function say(c: Career, title: string, body: string, tone: Tone): Career {
  return { ...c, lastResult: { title, body, tone, blocking: false } };
}

function spend(c: Career, cost: number): Career | null {
  if (c.energy < cost) return null;
  return { ...c, energy: c.energy - cost };
}

function bumpIndustry(industry: Industry, key: keyof Industry, n: number): Industry {
  return { ...industry, [key]: clamp(industry[key] + n, 0, 100) };
}

function remember(bond: Bond, day: number, text: string): Bond {
  return { ...bond, history: [{ day, text }, ...bond.history].slice(0, 8), last: day };
}

function putBond(c: Career, name: string, bond: Bond): Career {
  const bonds = { ...c.bonds, [name]: bond };
  const relations = { ...c.relations, [name]: legacyMood(bond) };
  const met = c.met.includes(name) || bond.met == null ? c.met : [...c.met, name];
  return { ...c, bonds, relations, met };
}

export function bondOf(c: Career, name: string): Bond {
  return c.bonds[name] ?? emptyBond(c.met.includes(name) ? c.day : null);
}

function fromMood(mood: number, day: number): Bond {
  const bond = emptyBond(day);
  if (mood <= -3) return { ...bond, friendship: 4, trust: 4, respect: 20, strain: 86 };
  if (mood === -2) return { ...bond, friendship: 16, trust: 12, respect: 28, strain: 62 };
  if (mood === -1) return { ...bond, friendship: 10, trust: 10, respect: 12, strain: 28 };
  if (mood === 1) return { ...bond, friendship: 22, trust: 14, respect: 10, strain: 0 };
  if (mood === 2) return { ...bond, friendship: 36, trust: 22, respect: 16, strain: 0 };
  if (mood === 3) return { ...bond, friendship: 52, trust: 36, respect: 30, strain: 0 };
  if (mood >= 4) return { ...bond, friendship: 74, trust: 58, respect: 48, strain: 0 };
  return bond;
}

export function openCircle(c: Career, seed: boolean): Career {
  const industry = { ...emptyIndustry(), ...(c.industry ?? {}) };
  const bonds: Record<string, Bond> = {};
  for (const [name, raw] of Object.entries(c.bonds ?? {})) {
    if (!raw || typeof raw !== "object") continue;
    bonds[name] = {
      friendship: clamp(Math.round(raw.friendship ?? 0), 0, 100),
      respect: clamp(Math.round(raw.respect ?? 0), 0, 100),
      trust: clamp(Math.round(raw.trust ?? 0), 0, 100),
      strain: clamp(Math.round(raw.strain ?? 0), 0, 100),
      met: typeof raw.met === "number" ? raw.met : null,
      history: Array.isArray(raw.history)
        ? raw.history
            .filter((row) => row && typeof row.text === "string")
            .slice(0, 8)
            .map((row) => ({ day: Math.round(row.day || c.day), text: row.text.slice(0, 140) }))
        : [],
      romance: raw.romance === "dating" || raw.romance === "ex" ? raw.romance : "none",
      last: Math.round(raw.last || 0),
    };
  }
  let met = Array.isArray(c.met) ? c.met.filter((name) => c.npc.some((artist) => artist.name === name)) : [];
  if (seed) {
    const locals = [...c.npc].sort((a, b) => a.score - b.score).slice(0, 5).map((artist) => artist.name);
    for (const name of locals) if (!met.includes(name)) met.push(name);
  }
  for (const [name, mood] of Object.entries(c.relations ?? {})) {
    if (!c.npc.some((artist) => artist.name === name)) continue;
    if (mood !== 0 && !met.includes(name)) met.push(name);
    if (!bonds[name] && mood !== 0) bonds[name] = fromMood(mood, c.day);
  }
  for (const name of met) {
    if (!bonds[name]) bonds[name] = emptyBond(c.day);
    else if (bonds[name]!.met == null) bonds[name] = { ...bonds[name]!, met: c.day };
  }
  const relations = { ...c.relations };
  for (const [name, bond] of Object.entries(bonds)) relations[name] = legacyMood(bond);
  const mail = Array.isArray(c.circleMail) ? c.circleMail.filter((note) => note && typeof note.text === "string").slice(0, 8) : [];
  const crew = c.crew && typeof c.crew.name === "string" && c.crew.name.trim()
    ? {
        name: c.crew.name.trim().slice(0, 24),
        members: (c.crew.members ?? []).filter((name) => typeof name === "string").slice(0, 4),
        pop: clamp(Math.round(c.crew.pop || 0), 0, 100),
        rival: c.crew.rival || CREW_RIVALS[0]!,
      }
    : null;
  const ask = c.circleAsk && typeof c.circleAsk.name === "string"
    ? {
        name: c.circleAsk.name,
        price: Math.max(0, Math.round(c.circleAsk.price || 0)),
        until: Math.round(c.circleAsk.until || 0),
        cut: clamp(Math.round(c.circleAsk.cut || 0), 0, 20),
      }
    : null;
  return { ...c, met, bonds, relations, circleMail: mail, crew, industry, circleAsk: ask };
}

function artist(c: Career, name: string): Npc | null {
  return c.npc.find((row) => row.name === name) ?? null;
}

function grow(bond: Bond, patch: Partial<Bond>, day: number, text: string): Bond {
  const next: Bond = {
    ...bond,
    friendship: clamp(Math.round(bond.friendship + (patch.friendship ?? 0)), 0, 100),
    respect: clamp(Math.round(bond.respect + (patch.respect ?? 0)), 0, 100),
    trust: clamp(Math.round(bond.trust + (patch.trust ?? 0)), 0, 100),
    strain: clamp(Math.round(bond.strain + (patch.strain ?? 0)), 0, 100),
    met: patch.met === undefined ? bond.met : patch.met,
    romance: patch.romance ?? bond.romance,
  };
  return remember(next, day, text);
}

function hard(bond: Bond) {
  return statusOf(bond) === "enemy" || statusOf(bond) === "rival";
}

export function applyMove(c: Career, name: string, move: MoveId): Career {
  const who = artist(c, name);
  if (!who) return c;
  const cost = MOVES.find((row) => row.id === move)?.energy ?? 6;
  const bond = bondOf(c, name);
  const status = statusOf(bond);
  if (move === "intro" && status !== "stranger" && bond.met != null) {
    return say(c, name, "You already know them. Talk, or hang out.", "neutral");
  }
  if (move === "apologize" && bond.strain < 20) {
    return say(c, name, "Nothing is sitting between you.", "neutral");
  }
  if ((move === "talk" || move === "hang" || move === "compliment") && status === "enemy" && personaOf(name) === "arrogant" && bond.friendship < 8) {
    const next = spend(c, cost);
    if (!next) return say(c, "Out of hours", `That takes ${cost} energy. You have ${c.energy}.`, "bad");
    return say(putBond(next, name, grow(bond, { strain: 2 }, c.day, "Brushed the hello off.")), name, `${name} wouldn't hear it. The energy is gone anyway.`, "bad");
  }
  const next = spend(c, cost);
  if (!next) return say(c, "Out of hours", `That takes ${cost} energy. You have ${c.energy}.`, "bad");
  let cash = next.cash;
  let books = next.books;
  let industry = next.industry ?? emptyIndustry();
  const enemy = hard(bond);
  const gain = enemy ? 0.4 : 1;
  let patch: Partial<Bond> = {};
  let text = "Talked.";
  if (move === "intro") {
    patch = { friendship: Math.round(5 * gain), respect: 1, met: c.day };
    text = "You introduced yourself.";
    industry = bumpIndustry(industry, "loyal", 1);
  } else if (move === "talk") {
    patch = { friendship: Math.round(3 * gain), trust: enemy ? 0 : 1 };
    text = "You talked.";
  } else if (move === "compliment") {
    patch = { friendship: Math.round(2 * gain), respect: 3 };
    text = "You complimented the music.";
    industry = bumpIndustry(industry, "generous", 1);
  } else if (move === "hang") {
    const bill = 24 + Math.round(who.score / 10);
    if (cash < bill) return say(c, "Short", `Hanging out is ${bill}. You have ${c.cash}.`, "bad");
    cash -= bill;
    books = { ...books, expenses: books.expenses + bill };
    patch = { friendship: Math.round(6 * gain), trust: enemy ? 1 : 3 };
    text = `Hung out. $${bill} on the night.`;
    industry = bumpIndustry(industry, "loyal", 1);
  } else if (move === "support") {
    patch = { friendship: Math.round(3 * gain), respect: 2, trust: enemy ? 1 : 2 };
    text = "You pushed their song.";
    industry = bumpIndustry(industry, "generous", 2);
    industry = bumpIndustry(industry, "loyal", 1);
  } else if (move === "apologize") {
    patch = { strain: -14, friendship: 4, trust: 4 };
    text = "You apologized.";
    industry = bumpIndustry(industry, "loyal", 2);
    industry = bumpIndustry(industry, "difficult", -2);
  } else {
    patch = { strain: enemy ? -8 : -16, trust: enemy ? 2 : 4, friendship: enemy ? 2 : 4 };
    text = "You settled it.";
    industry = bumpIndustry(industry, "loyal", 1);
    industry = bumpIndustry(industry, "controversial", -1);
  }
  const saved = putBond({ ...next, cash, books, industry }, name, grow(bond, patch, c.day, text));
  const now = statusOf(saved.bonds[name]!);
  return say(saved, name, `${text} ${statusLabel(now)}. Friendship ${saved.bonds[name]!.friendship}.`, now === "enemy" ? "bad" : "neutral");
}

function cutShare(base: number, cutPct: number) {
  const share = clamp(Math.round(cutPct), 0, 80) / 100;
  return Math.max(0, Math.round(Math.max(0, base) * (1 - share * 0.4)));
}

export function versePrice(
  c: Pick<Career, "bonds" | "met" | "fame" | "industry" | "circleAsk" | "day" | "npc">,
  name: string,
  cut: number,
): { price: number; refused: string; status: BondStatus } {
  const npc = c.npc.find((row) => row.name === name);
  const base = npc?.fee ?? 0;
  const heat = npc?.score ?? 40;
  const bond = c.bonds?.[name] ?? emptyBond(c.met?.includes(name) ? 1 : null);
  const met = (c.met ?? []).includes(name) || bond.met != null;
  const status = met ? statusOf(bond) : "stranger";
  const mult: Record<BondStatus, number> = {
    stranger: 1,
    acquaintance: 0.9,
    associate: 0.78,
    friend: 0.62,
    close: 0.4,
    best: bond.trust >= 75 ? 0 : 0.15,
    rival: 1.55,
    enemy: 2.4,
  };
  let price = Math.round(cutShare(base, cut) * mult[status]);
  const ask = c.circleAsk;
  if (ask && ask.name === name && (c.day ?? 1) <= ask.until) price = cutShare(ask.price, cut);
  const respected = c.industry?.respected ?? 0;
  let refused = "";
  if (status === "enemy" && bond.trust < 28) refused = `${name} will not get on a song with you.`;
  else if (status === "rival" && bond.friendship < 16 && personaOf(name) === "arrogant") refused = `${name} laughed the feature off.`;
  else if (heat >= 90 && !met && respected < 28 && bond.friendship < 18) refused = `${name} doesn't take a cold call. You need an introduction.`;
  return { price, refused, status };
}

export function chemistryBetween(c: Career, name: string) {
  const bond = bondOf(c, name);
  const latest = [...c.tracks].reverse().find((track) => track.style);
  const player = latest?.style || (c.path === "producer" ? "Hip-Hop" : c.path === "writer" ? "R&B" : "Hip-Hop");
  const theirs = styleOf(name);
  let score = player === theirs ? 70 : 46;
  const persona = personaOf(name);
  if (persona === "competitive" || persona === "respectful") score += 6;
  if (persona === "arrogant" || persona === "slick") score -= 6;
  score += Math.round((bond.friendship - 50) / 12);
  score += Math.round(bond.respect / 14);
  if (bond.strain > 60) score -= 8;
  if (bond.history.some((row) => /verse|feature|song/i.test(row.text))) score += 8;
  return clamp(score, 8, 99);
}

export function markCollab(c: Career, names: string[]): Career {
  let next = c;
  for (const name of names) {
    if (!artist(next, name)) continue;
    const bond = bondOf(next, name);
    next = putBond(next, name, grow(bond, { respect: 2, friendship: statusOf(bond) === "enemy" ? -2 : 1 }, c.day, "Got on a song together."));
  }
  if (names.length) next = { ...next, industry: bumpIndustry(next.industry ?? emptyIndustry(), "respected", 1) };
  return next;
}

export function negotiate(c: Career, name: string, mode: DealMode): Career {
  const who = artist(c, name);
  if (!who) return c;
  const quote = versePrice(c, name, 0);
  const next = spend(c, 6);
  if (!next) return say(c, "Out of hours", "Asking is 6 energy.", "bad");
  if (quote.refused) return say(next, name, quote.refused, "bad");
  const bond = bondOf(next, name);
  const persona = personaOf(name);
  if (mode === "accept") {
    const ask: CircleAsk = { name, price: quote.price, until: c.day + 14, cut: 0 };
    return say(
      putBond({ ...next, circleAsk: ask }, name, remember(bond, c.day, `Locked a verse at $${quote.price}.`)),
      name,
      quote.price === 0 ? "They'll do it for nothing. The lock lasts 14 days. Pay happens when you record." : `Locked at $${quote.price} for 14 days. You pay when the song is made, not now.`,
      "good",
    );
  }
  if (mode === "royalty") {
    const status = statusOf(bond);
    const ok = bond.trust >= 40 || status === "friend" || status === "close" || status === "best";
    if (!ok) return say(next, name, `${name} wants cash, not a promise of points.`, "bad");
    const ask: CircleAsk = { name, price: 0, until: c.day + 14, cut: 12 };
    return say(
      putBond({ ...next, circleAsk: ask }, name, remember(bond, c.day, "Took 12% instead of a fee.")),
      name,
      "No fee. They keep an extra 12% of that song. Locked for 14 days.",
      "neutral",
    );
  }
  const offer = Math.round(quote.price * 0.75);
  const soft = persona === "friendly" || persona === "loyal" || statusOf(bond) === "close" || statusOf(bond) === "best";
  const willing = soft || bond.friendship + bond.trust / 2 >= 70;
  const locked = willing ? offer : Math.round(quote.price * 0.9);
  const ask: CircleAsk = { name, price: locked, until: c.day + 14, cut: 0 };
  return say(
    putBond({ ...next, circleAsk: ask }, name, remember(bond, c.day, willing ? "Took the lower offer." : "Countered the offer.")),
    name,
    willing ? `They took $${locked}. Locked for 14 days.` : `${name} countered at $${locked}. Take it or leave it. Locked for 14 days.`,
    willing ? "good" : "neutral",
  );
}

export function attendRoom(c: Career, id: string): Career {
  const room = ROOMS.find((row) => row.id === id);
  if (!room) return c;
  if (c.fame < room.fame) return say(c, room.name, `Opens at fame ${room.fame}. You're at ${Math.round(c.fame)}.`, "neutral");
  if ((c.industry?.respected ?? 0) < room.respect) return say(c, room.name, `They want industry respect ${room.respect}. You're at ${c.industry?.respected ?? 0}.`, "neutral");
  if (c.cash < room.cash) return say(c, "Short", `The door is $${room.cash}. You have $${c.cash}.`, "bad");
  const next = spend(c, room.energy);
  if (!next) return say(c, "Out of hours", `${room.name} is ${room.energy} energy.`, "bad");
  let career = {
    ...next,
    cash: next.cash - room.cash,
    books: room.cash > 0 ? { ...next.books, expenses: next.books.expenses + room.cash } : next.books,
  };
  if (room.cash > 0) career = { ...career, industry: bumpIndustry(career.industry ?? emptyIndustry(), "generous", 1) };
  const unmet = c.npc.filter((row) => !career.met.includes(row.name)).sort((a, b) => a.score - b.score);
  const metSomeone = unmet[0];
  if (metSomeone) {
    const bond = grow(emptyBond(c.day), { friendship: 14, respect: 4, trust: 6, met: c.day }, c.day, `Met at ${room.name}.`);
    career = putBond(career, metSomeone.name, bond);
  }
  const known = career.met.filter((n) => n !== metSomeone?.name);
  const host = known[hash(room.id + String(c.day)) % Math.max(1, known.length)];
  if (host) {
    const bond = bondOf(career, host);
    career = putBond(career, host, grow(bond, { friendship: 3, trust: 1 }, c.day, `Saw you at ${room.name}.`));
  }
  career = { ...career, industry: bumpIndustry(career.industry ?? emptyIndustry(), "respected", 1) };
  const line = metSomeone ? `You met ${metSomeone.name}.` : host ? `You caught ${host} there.` : "Nobody new. The room still knows your face.";
  return say(career, room.name, `${line} ${room.energy} energy${room.cash ? `, $${room.cash}` : ""}.`, "good");
}

export function formCrew(c: Career, name: string): Career {
  if (c.crew) return say(c, c.crew.name, "Leave this crew before you start another.", "neutral");
  const title = name.trim().replace(/\s+/g, " ").slice(0, 24);
  if (title.length < 2) return say(c, "Crew", "Give it a name.", "neutral");
  const next = spend(c, 8);
  if (!next) return say(c, "Out of hours", "Starting a crew is 8 energy.", "bad");
  const crew: Crew = { name: title, members: [], pop: 4, rival: CREW_RIVALS[hash(title) % CREW_RIVALS.length]! };
  return say({ ...next, crew }, title, `The crew exists. ${crew.rival} is already talking. Invite people you actually know.`, "good");
}

export function inviteCrew(c: Career, name: string): Career {
  if (!c.crew) return say(c, "No crew", "Start one first.", "neutral");
  const who = artist(c, name);
  if (!who) return c;
  if (!c.met.includes(name)) return say(c, name, "You haven't met them.", "neutral");
  if (c.crew.members.includes(name)) return say(c, name, "Already in the crew.", "neutral");
  if (c.crew.members.length >= 4) return say(c, c.crew.name, "Four members is the cap.", "neutral");
  const next = spend(c, 6);
  if (!next) return say(c, "Out of hours", "An invite is 6 energy.", "bad");
  const bond = bondOf(next, name);
  const status = statusOf(bond);
  const persona = personaOf(name);
  const ok = (status === "friend" || status === "close" || status === "best" || status === "associate") && persona !== "arrogant" || bond.friendship >= 60;
  if (!ok) {
    return say(putBond(next, name, grow(bond, { strain: 2 }, c.day, "Turned down the crew.")), name, `${name} said no. Friendship is ${bond.friendship}.`, "bad");
  }
  const members = [...next.crew!.members, name];
  const pop = clamp(next.crew!.pop + Math.round(who.score / 25), 0, 100);
  return say(
    putBond({ ...next, crew: { ...next.crew!, members, pop } }, name, grow(bond, { trust: 3, friendship: 2 }, c.day, `Joined ${next.crew!.name}.`)),
    name,
    `${name} joined ${next.crew!.name}.`,
    "good",
  );
}

export function kickCrew(c: Career, name: string): Career {
  if (!c.crew?.members.includes(name)) return c;
  const bond = bondOf(c, name);
  const crew = { ...c.crew, members: c.crew.members.filter((member) => member !== name), pop: Math.max(0, c.crew.pop - 6) };
  return say(putBond({ ...c, crew }, name, grow(bond, { strain: 12, trust: -8, friendship: -6 }, c.day, "Cut from the crew.")), name, `${name} is out. Trust took the hit.`, "bad");
}

export function leaveCrew(c: Career): Career {
  if (!c.crew) return c;
  let next = c;
  for (const name of c.crew.members) {
    next = putBond(next, name, grow(bondOf(next, name), { strain: 6, trust: -4 }, c.day, `You left ${c.crew.name}.`));
  }
  return say({ ...next, crew: null, industry: bumpIndustry(next.industry ?? emptyIndustry(), "loyal", -4) }, "Crew", `You left ${c.crew.name}. They will remember.`, "neutral");
}

export function vouch(c: Career, name: string): Career {
  const who = artist(c, name);
  if (!who) return c;
  if (!c.met.includes(name)) return say(c, name, "You don't know them well enough to ask.", "neutral");
  const bond = bondOf(c, name);
  const status = statusOf(bond);
  if (status !== "friend" && status !== "close" && status !== "best") {
    return say(c, name, "A friend will introduce you. An associate won't.", "neutral");
  }
  const names = c.npc.map((row) => row.name);
  const tie = tiesOf(name, names).friend;
  const unmet = c.npc.filter((row) => !c.met.includes(row.name)).sort((a, b) => a.score - b.score);
  const target = (tie && unmet.find((row) => row.name === tie)) || unmet[0];
  if (!target) return say(c, name, "You already know everyone they'll claim.", "neutral");
  const next = spend(c, 8);
  if (!next) return say(c, "Out of hours", "An introduction is 8 energy.", "bad");
  const fresh = grow(emptyBond(c.day), { friendship: 16, trust: 8, respect: 6, met: c.day }, c.day, `${name} introduced you.`);
  const saved = putBond(next, target.name, fresh);
  return say(
    putBond(saved, name, grow(bondOf(saved, name), { trust: 1 }, c.day, `Introduced you to ${target.name}.`)),
    target.name,
    `${name} walked you over to ${target.name}. You're an acquaintance, not a friend.`,
    "good",
  );
}

export function dateArtist(c: Career, name: string): Career {
  const who = artist(c, name);
  if (!who) return c;
  if (!c.met.includes(name)) return say(c, name, "You haven't met.", "neutral");
  const bond = bondOf(c, name);
  if (bond.romance === "dating") return say(c, name, "You're already dating.", "neutral");
  if (statusOf(bond) === "enemy" || statusOf(bond) === "rival" || bond.friendship < 52 || bond.strain >= 45) {
    return say(c, name, "A date needs a real friendship first. This isn't that.", "neutral");
  }
  if (c.cash < 45) return say(c, "Short", "A date is $45.", "bad");
  const next = spend(c, 16);
  if (!next) return say(c, "Out of hours", "A date is 16 energy.", "bad");
  let career: Career = { ...next, cash: next.cash - 45, books: { ...next.books, expenses: next.books.expenses + 45 } };
  const other = Object.entries(career.bonds).find(([whoName, row]) => whoName !== name && row.romance === "dating");
  if (other) {
    career = putBond(career, other[0], grow(other[1], { strain: 18, trust: -10, friendship: -8, romance: "ex" }, c.day, "You went out with someone else."));
    career = { ...career, industry: bumpIndustry(career.industry ?? emptyIndustry(), "fake", 6), reputation: clamp(career.reputation - 2, 0, 100) };
  }
  career = putBond(career, name, grow(bond, { friendship: 5, trust: 3, romance: "dating" }, c.day, "Went on a date."));
  return say(career, name, other ? `You're dating ${name}. ${other[0]} found out.` : `You're dating ${name}. It isn't a contract.`, "neutral");
}

export function breakArtist(c: Career, name: string): Career {
  const bond = bondOf(c, name);
  if (bond.romance !== "dating") return say(c, name, "You aren't together.", "neutral");
  const next = putBond(c, name, grow(bond, { romance: "ex", strain: 14, trust: -10, friendship: -8 }, c.day, "Broke it off."));
  return say({ ...next, industry: bumpIndustry(next.industry ?? emptyIndustry(), "controversial", 2) }, name, "It's over. The history stays.", "bad");
}

export function answerNote(c: Career, id: string, yes: boolean): Career {
  const note = c.circleMail.find((row) => row.id === id);
  if (!note || !note.open) return c;
  if (yes && note.kind === "event" && (c.energy < 12 || c.cash < 30)) {
    return say(c, note.from, "That party is 12 energy and $30. The invite stays until you can go.", "bad");
  }
  if (yes && note.kind === "apology" && c.energy < 12) {
    return say(c, note.from, "Settling it is 12 energy. The note stays.", "bad");
  }
  if (yes && note.kind === "fight" && c.energy < 6) {
    return say(c, note.from, "Clapping back is 6 energy. The note stays.", "bad");
  }
  const mail = c.circleMail.map((row) => (row.id === id ? { ...row, open: false } : row));
  let next: Career = { ...c, circleMail: mail };
  if (!yes) return say(next, note.from, "You left it.", "neutral");
  if (note.kind === "crew" && !next.crew) {
    next = { ...next, crew: { name: `${note.from} crew`, members: [note.from], pop: 8, rival: CREW_RIVALS[hash(note.from) % CREW_RIVALS.length]! } };
    return say(putBond(next, note.from, grow(bondOf(next, note.from), { trust: 2, friendship: 2 }, c.day, "You joined their crew.")), note.from, `You're in with ${note.from}.`, "good");
  }
  if (note.kind === "collab" || note.kind === "help") {
    const ask: CircleAsk = { name: note.from, price: Math.round((artist(c, note.from)?.fee ?? 80) * 0.5), until: c.day + 10, cut: 0 };
    return say(putBond({ ...next, circleAsk: ask }, note.from, grow(bondOf(next, note.from), { friendship: 2 }, c.day, "Said yes to a song.")), note.from, `A verse is locked cheaper for 10 days. Record it from the studio.`, "good");
  }
  if (note.kind === "event") return attendRoom(next, "party");
  if (note.kind === "apology") return applyMove(next, note.from, "resolve");
  if (note.kind === "fight") {
    const spent = spend(next, 6);
    if (!spent) return say(c, note.from, "Clapping back is 6 energy.", "bad");
    const bond = bondOf(spent, note.from);
    const hotter = (artist(spent, note.from)?.score ?? 0) > spent.fame * 2.2;
    const rep = hotter ? -2 : 1;
    const clapped = putBond(spent, note.from, grow(bond, { strain: 8, friendship: -3 }, c.day, "You clapped back."));
    return say(
      { ...clapped, reputation: clamp(clapped.reputation + rep, 0, 100), fame: clamp(clapped.fame + (hotter ? 1 : 0), 0, 100), industry: bumpIndustry(clapped.industry ?? emptyIndustry(), "controversial", 3) },
      note.from,
      hotter ? "Their fans are louder. You picked up a little fame and lost face." : "Your side was louder. Reputation held.",
      hotter ? "bad" : "neutral",
    );
  }
  const bond = bondOf(next, note.from);
  return say(putBond(next, note.from, grow(bond, { friendship: 2, trust: 1 }, c.day, "Answered them.")), note.from, "You wrote back.", "neutral");
}

function pushNote(c: Career, note: CircleNote): Career {
  if (c.circleMail.some((row) => row.open && row.from === note.from && row.kind === note.kind)) return c;
  return { ...c, circleMail: [note, ...c.circleMail].slice(0, 8) };
}

export function peopleMorning(c: Career, released: boolean): { career: Career; notes: string[] } {
  let next = c;
  const notes: string[] = [];
  if (released && next.met.length > 0) {
    for (const name of next.met) {
      const bond = bondOf(next, name);
      next = putBond(next, name, { ...bond, respect: clamp(bond.respect + 1, 0, 100) });
    }
    notes.push("People you know heard the drop. Respect moved. Friendship did not.");
  }
  for (const name of next.met) {
    const bond = bondOf(next, name);
    const persona = personaOf(name);
    const who = artist(next, name);
    const roll = hash(name + ":" + next.day);
    if ((persona === "jealous" || persona === "competitive") && statusOf(bond) !== "stranger" && next.fame > (who?.score ?? 50) / 4 && roll % 17 === 0 && bond.friendship < 80) {
      next = putBond(next, name, grow(bond, { strain: 8, friendship: -2 }, next.day, "Got jealous of the run."));
      next = pushNote(next, { id: mid(), day: next.day, from: name, kind: "jealous", text: `${name} noticed the numbers. It did not sound like a compliment.`, open: true });
      notes.push(`${name} is jealous. Strain moved. Friendship did not get a free pass.`);
    }
    const status = statusOf(bondOf(next, name));
    if ((status === "enemy" || status === "rival") && roll % 11 === 0) {
      const gap = (who?.score ?? 0) - next.fame * 2;
      if (gap > 30) {
        next = { ...next, reputation: clamp(next.reputation - 1, 0, 100) };
        notes.push(`${name} is bigger, and they said your name. Reputation slipped.`);
      } else if (gap < -20) {
        notes.push(`${name} swung at you. Your crowd barely looked up.`);
      } else {
        next = { ...next, fame: clamp(next.fame + 1, 0, 100), hype: clamp(next.hype + 2, 0, 100) };
        notes.push(`You and ${name} are the same size. The argument got both of you heard.`);
      }
      next = pushNote(next, { id: mid(), day: next.day, from: name, kind: "fight", text: `${name} said it in public. Answer, or leave it.`, open: true });
    }
    if ((status === "friend" || status === "close" || status === "best") && roll % 13 === 0) {
      const kind = persona === "loyal" ? "help" : released ? "congrats" : "collab";
      const text =
        kind === "congrats"
          ? `${name} congratulated the drop.`
          : kind === "help"
            ? `${name} offered to jump on something. Friendship price, not the poster price.`
            : `${name} wants to talk about a song.`;
      next = pushNote(next, { id: mid(), day: next.day, from: name, kind, text, open: true });
    }
    if (persona === "slick" && next.crew?.members.includes(name) && bond.strain >= 36 && roll % 23 === 0) {
      next = {
        ...next,
        crew: { ...next.crew, members: next.crew.members.filter((member) => member !== name), pop: Math.max(0, next.crew.pop - 8) },
      };
      next = putBond(next, name, grow(bondOf(next, name), { strain: 16, trust: -18, friendship: -10 }, next.day, "Left the crew with a story."));
      next = { ...next, industry: bumpIndustry(next.industry ?? emptyIndustry(), "fake", 0) };
      notes.push(`${name} left ${c.crew?.name ?? "the crew"} and talked. Trust is the thing that broke.`);
    }
  }
  return { career: next, notes };
}

export function boostPost(c: Career): { fans: number; reputation: number; line: string } {
  const friend = c.met.find((name) => {
    const status = statusOf(bondOf(c, name));
    return status === "best" || status === "close" || (status === "friend" && personaOf(name) === "friendly");
  });
  const enemy = c.met.find((name) => statusOf(bondOf(c, name)) === "enemy");
  let fans = 0;
  let reputation = 0;
  const bits: string[] = [];
  if (friend) {
    const heat = artist(c, friend)?.score ?? 20;
    fans += Math.max(2, Math.round(heat / 18));
    bits.push(`${friend} shared it. +${fans} followers.`);
  }
  if (enemy) {
    const hotter = (artist(c, enemy)?.score ?? 0) > c.fame * 2;
    if (hotter) {
      reputation -= 1;
      bits.push(`${enemy} dragged the post. Reputation slipped.`);
    }
  }
  return { fans, reputation, line: bits.join(" ") };
}

export function runPeople(c: Career, action: PeopleAction): Career {
  if (action.type === "move") return applyMove(c, action.name, action.move);
  if (action.type === "event") return attendRoom(c, action.id);
  if (action.type === "crew") return formCrew(c, action.name);
  if (action.type === "invite") return inviteCrew(c, action.name);
  if (action.type === "kick") return kickCrew(c, action.name);
  if (action.type === "leave") return leaveCrew(c);
  if (action.type === "note") return answerNote(c, action.id, action.yes);
  if (action.type === "intro") return vouch(c, action.name);
  if (action.type === "date") return dateArtist(c, action.name);
  if (action.type === "break") return breakArtist(c, action.name);
  if (action.type === "deal") return negotiate(c, action.name, action.mode);
  return c;
}
