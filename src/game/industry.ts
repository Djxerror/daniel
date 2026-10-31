import type { ChartRow, MediaBook, Npc, Track } from "@/game/types";

/**
 * Chart and certification rules. The game has no radio spins and no paid-sales counter,
 * so the chart uses this week's actual plays. Followers are not part of the score.
 * 150 plays = 1 certification unit. Gold is 500 units. Units only move forward.
 */
export const STREAMS_PER_UNIT = 150;

export const CERT_LADDER: { id: CertLevel; name: string; units: number }[] = [
  { id: "gold", name: "Gold", units: 500 },
  { id: "platinum", name: "Platinum", units: 1_000 },
  { id: "2x", name: "2× Platinum", units: 2_000 },
  { id: "3x", name: "3× Platinum", units: 3_000 },
  { id: "4x", name: "4× Platinum", units: 4_000 },
  { id: "5x", name: "5× Platinum", units: 5_000 },
  { id: "diamond", name: "Diamond", units: 10_000 },
];

export const GRAMMY_CATEGORIES = [
  "Best Rap Song",
  "Best Rap Performance",
  "Best Rap Album",
  "Record of the Year",
  "Album of the Year",
  "Best New Artist",
] as const;

export type GrammyCategory = (typeof GRAMMY_CATEGORIES)[number];

export type CertLevel = "gold" | "platinum" | "2x" | "3x" | "4x" | "5x" | "diamond";

export type Recognition =
  | "Unknown Artist"
  | "Underground Artist"
  | "Rising Star"
  | "Recognized Artist"
  | "Celebrity"
  | "Superstar"
  | "Global Icon";

export type CertRow = {
  trackId: string;
  title: string;
  kind: "single" | "album";
  units: number;
  counted: number;
  level: CertLevel | "";
  day: number;
};

export type RivalCut = {
  title: string;
  kind: "single" | "album";
  quality: number;
  dayOut: number;
  streams: number;
  counted: number;
  lastWeek: number;
  priorWeek: number;
  units: number;
  cert: CertLevel | "";
  certDay: number;
};

export type RivalFile = {
  name: string;
  heat: number;
  cuts: RivalCut[];
  /** Empty until a deal actually happens. Not backfilled. */
  deal: "" | "indie" | "major";
  tourUntil: number;
};

export type ChartMark = {
  day: number;
  kind: "single" | "album";
  rank: number;
  name: string;
  title: string;
  you: boolean;
  move: number | null;
};

export type Offer = {
  id: string;
  name: string;
  energy: number;
  cost: number;
  note: string;
};

export type FanNote = { id: string; day: number; text: string };

export type SoldShow = { id: string; day: number; place: string; soldOut: boolean };

export type NewsStory = {
  id: string;
  day: number;
  outlet: string;
  headline: string;
  body: string;
  artist: string;
  subject: string;
};

export type HistoryRow = {
  id: string;
  day: number;
  name: string;
  detail: string;
};

export type GrammyEntry = {
  category: GrammyCategory;
  title: string;
  artist: string;
  you: boolean;
  trackId: string;
  /** Why this recording made the ballot. Not a promise that it wins. */
  why?: string;
};

export type GrammyBook = {
  settledSeason: number;
  submitted: { trackId: string; category: GrammyCategory; season: number }[];
  noms: GrammyEntry[];
  wins: (GrammyEntry & { day: number; season: number })[];
};

export type TradeBook = {
  settledOn: number;
  rivals: RivalFile[];
  certs: CertRow[];
  news: NewsStory[];
  history: HistoryRow[];
  seen: Record<string, number>;
  albumChart: ChartRow[];
  albumRanks: Record<string, number>;
  albumSeen: Record<string, number>;
  archive: ChartMark[];
  runs: Record<string, number>;
  peaks: Record<string, number>;
  bestRun: number;
  recognition: Recognition;
  verified: { x: boolean; instagram: boolean; tiktok: boolean; youtube: boolean };
  grammy: GrammyBook;
  invite: { id: string; name: string; energy: number; cost?: number; note?: string } | null;
  offers: Offer[];
  fanNotes: FanNote[];
  soldOut: SoldShow[];
  no1s: string[];
};

export function emptyTrade(): TradeBook {
  return {
    settledOn: 0,
    rivals: [],
    certs: [],
    news: [],
    history: [],
    seen: {},
    albumChart: [],
    albumRanks: {},
    albumSeen: {},
    archive: [],
    runs: {},
    peaks: {},
    bestRun: 0,
    recognition: "Unknown Artist",
    verified: { x: false, instagram: false, tiktok: false, youtube: false },
    grammy: { settledSeason: -1, submitted: [], noms: [], wins: [] },
    invite: null,
    offers: [],
    fanNotes: [],
    soldOut: [],
    no1s: [],
  };
}

export function certName(level: string): string {
  return CERT_LADDER.find((row) => row.id === level)?.name ?? "";
}

export function seasonOf(day: number): number {
  return Math.floor(Math.max(0, day - 1) / 84);
}

/** Current demand, not career fame. Older songs leave unless this week spikes. */
export function performanceScore(weekPlays: number, quality: number, age: number, priorWeek: number): number {
  if (weekPlays <= 0) return 0;
  const spike = weekPlays >= Math.max(80, priorWeek * 1.8);
  if (age > 49 && !spike) return 0;
  const demand = Math.log10(weekPlays + 10) * 24;
  const craft = Math.max(0, quality) * 0.12;
  return Math.round((demand + craft) * 10) / 10;
}

function hashUnit(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
}

function levelFor(units: number): CertLevel | "" {
  let found: CertLevel | "" = "";
  for (const step of CERT_LADDER) if (units >= step.units) found = step.id;
  return found;
}

function pushHistory(book: TradeBook, row: HistoryRow) {
  if (book.history.some((item) => item.id === row.id)) return;
  book.history = [row, ...book.history].slice(0, 80);
}

function pushNews(book: TradeBook, story: NewsStory) {
  if (book.news.some((item) => item.id === story.id)) return;
  book.news = [story, ...book.news].slice(0, 40);
}

function pushFan(book: TradeBook, note: FanNote) {
  if (book.fanNotes.some((item) => item.id === note.id)) return;
  book.fanNotes = [note, ...book.fanNotes].slice(0, 24);
}

/** Chart-only acts. They are not added to the people list, so fees and desk heat stay put. */
const BENCH: [string, number][] = [
  ["Ada Quill", 34],
  ["June Pocket", 22],
  ["Saint Cable", 28],
  ["Low Harbor", 19],
  ["Pearl Room", 31],
  ["Ox Marin", 24],
  ["Brass Kid", 32],
  ["Ivory Lane", 35],
  ["Ember West", 16],
  ["Cinder Park", 28],
  ["Hollow Kay", 22],
  ["Vesper Noon", 31],
  ["Night Ledger", 27],
  ["Soft Circuit", 18],
  ["Red Mezzanine", 33],
  ["Glass County", 21],
  ["Minor Saint", 26],
  ["Yard Radio", 20],
  ["Copper Hall", 29],
  ["Static June", 23],
  ["Pale Motor", 17],
  ["Kindling", 30],
  ["Room Tone", 25],
  ["Late Filing", 36],
];

function freshCut(title: string, kind: "single" | "album", quality: number, day: number): RivalCut {
  return {
    title,
    kind,
    quality,
    dayOut: day,
    streams: 0,
    counted: 0,
    lastWeek: 0,
    priorWeek: 0,
    units: 0,
    cert: "",
    certDay: 0,
  };
}

function ensureRivals(book: TradeBook, npc: Npc[], day: number) {
  const names = new Set(book.rivals.map((rival) => rival.name));
  for (const artist of npc) {
    if (names.has(artist.name)) continue;
    book.rivals.push({
      name: artist.name,
      heat: artist.score,
      deal: "",
      tourUntil: 0,
      cuts: [freshCut(artist.title || "Untitled", "single", Math.max(20, Math.min(99, Math.round(artist.score))), day)],
    });
    names.add(artist.name);
  }
  for (const [name, heat] of BENCH) {
    if (names.has(name)) continue;
    book.rivals.push({
      name,
      heat,
      deal: "",
      tourUntil: 0,
      cuts: [freshCut(`${name.split(" ")[0]}`, "single", heat, day)],
    });
    names.add(name);
  }
  for (const artist of npc) {
    const rival = book.rivals.find((row) => row.name === artist.name);
    if (rival && !BENCH.some((row) => row[0] === rival.name)) rival.heat = artist.score;
  }
}

function rivalWeekPlays(cut: RivalCut, heat: number, day: number, touring: boolean, deal: RivalFile["deal"]): number {
  const age = Math.max(1, day - cut.dayOut + 1);
  const decay = Math.pow(0.9, Math.max(0, Math.floor(age / 7)));
  const roll = 0.82 + hashUnit(`${cut.title}|${day}`) * 0.36;
  const body = Math.pow(Math.max(1, cut.quality), 1.08) * (10 + heat * 0.55) * (cut.kind === "album" ? 1.35 : 1);
  const tour = touring ? 1.06 : 1;
  const paper = deal === "major" ? 1.04 : deal === "indie" ? 1.02 : 1;
  return Math.max(0, Math.round(body * 7 * decay * roll * tour * paper));
}

function advanceRivals(book: TradeBook, day: number, notes: string[]) {
  const bench = new Set(BENCH.map((row) => row[0]));
  for (const rival of book.rivals) {
    const age = day - (rival.cuts[0]?.dayOut ?? day);
    if (!rival.deal && rival.heat >= 58 && hashUnit(`${rival.name}|deal|${day}`) > 0.72) {
      rival.deal = rival.heat >= 82 ? "major" : "indie";
      pushNews(book, {
        id: `deal:${rival.name}:${rival.deal}`,
        day,
        outlet: "City Ear",
        headline: `${rival.name} signs ${rival.deal === "major" ? "a major" : "an indie"}`,
        body: "The deal is theirs. It does not pay you.",
        artist: rival.name,
        subject: rival.deal,
      });
    }
    if (rival.tourUntil < day && rival.heat >= 50 && age > 14 && hashUnit(`${rival.name}|tour|${day}`) > 0.84) {
      rival.tourUntil = day + 14;
      pushNews(book, {
        id: `tour:${rival.name}:${rival.tourUntil}`,
        day,
        outlet: "Room Report",
        headline: `${rival.name} is on the road`,
        body: "Their current single gets a small lift this run. Your door money is unchanged.",
        artist: rival.name,
        subject: "tour",
      });
      notes.push(`${rival.name} went on tour.`);
    }
    if (age > 0 && age % 28 === 0 && rival.cuts.filter((cut) => cut.kind === "single").length < 6) {
      if (hashUnit(`${rival.name}|drop|${day}`) > 0.45) {
        const cap = bench.has(rival.name) ? 42 : 99;
        rival.cuts.unshift(freshCut(
          `${rival.name.split(" ")[0]} ${rival.cuts.length + 1}`,
          "single",
          Math.max(16, Math.min(cap, rival.heat + Math.round(hashUnit(`${rival.name}|q|${day}`) * 12 - 4))),
          day,
        ));
      }
    }
    if (age > 20 && age % 56 === 0 && !rival.cuts.some((cut) => cut.kind === "album")) {
      const cap = bench.has(rival.name) ? 42 : 99;
      rival.cuts.unshift(freshCut(`${rival.name.split(" ")[0]} LP`, "album", Math.max(16, Math.min(cap, rival.heat)), day));
    }
    const touring = rival.tourUntil >= day;
    for (const cut of rival.cuts) {
      if (day < cut.dayOut) continue;
      const plays = rivalWeekPlays(cut, rival.heat, day, touring, rival.deal || "");
      cut.priorWeek = cut.lastWeek;
      cut.lastWeek = plays;
      cut.streams += plays;
      const fresh = cut.streams - cut.counted;
      const add = Math.floor(fresh / STREAMS_PER_UNIT);
      if (add > 0) {
        cut.counted += add * STREAMS_PER_UNIT;
        cut.units += add;
        const next = levelFor(cut.units);
        if (next && next !== cut.cert) {
          cut.cert = next;
          cut.certDay = day;
          const label = certName(next);
          pushNews(book, {
            id: `rcert:${rival.name}:${cut.title}:${next}`,
            day,
            outlet: "City Ear",
            headline: `${rival.name} earns ${label}`,
            body: `${cut.title} reached ${cut.units} units. Followers were not counted.`,
            artist: rival.name,
            subject: cut.title,
          });
          notes.push(`${rival.name} took ${cut.title} to ${label}.`);
        }
      }
    }
  }
}

function applyPlayerCerts(book: TradeBook, tracks: Track[], day: number, nick: string, notes: string[]) {
  for (const track of tracks) {
    if (track.status !== "out" || track.kind === "video") continue;
    let row = book.certs.find((item) => item.trackId === track.id);
    if (!row) {
      row = {
        trackId: track.id,
        title: track.title,
        kind: track.kind === "album" ? "album" : "single",
        units: 0,
        counted: Math.max(0, track.streams - track.lastNight),
        level: "",
        day: 0,
      };
      book.certs.push(row);
    }
    row.title = track.title;
    const fresh = Math.max(0, track.streams - row.counted);
    const add = Math.floor(fresh / STREAMS_PER_UNIT);
    if (add <= 0) continue;
    row.counted += add * STREAMS_PER_UNIT;
    row.units += add;
    const next = levelFor(row.units);
    if (!next || next === row.level) continue;
    const prev = row.level;
    row.level = next;
    row.day = day;
    const label = certName(next);
    pushHistory(book, {
      id: `cert:${track.id}:${next}`,
      day,
      name: label,
      detail: `${track.title} · ${row.units} units${prev ? ` · was ${certName(prev)}` : ""}`,
    });
    pushNews(book, {
      id: `cert:${track.id}:${next}`,
      day,
      outlet: "Brass Page",
      headline: `${nick} earns ${label}`,
      body: `${track.title} reached ${row.units} eligible units. The same plays were not counted twice.`,
      artist: nick,
      subject: track.title,
    });
    notes.push(`${track.title} is ${label}. ${row.units} units.`);
    pushFan(book, {
      id: `fan:cert:${track.id}:${next}`,
      day,
      text: `Listeners kept ${track.title} on long enough for ${label}. ${row.units} units. The same plays were not counted twice.`,
    });
  }
}

type Contender = { name: string; title: string; you: boolean; score: number; weeks: number; peak: number; kind: "single" | "album" };

function rank(
  entries: Contender[],
  lastRanks: Record<string, number>,
  seen: Record<string, number>,
  peaks: Record<string, number>,
  runs: Record<string, number>,
  kind: "single" | "album",
  cap: number,
): { chart: ChartRow[]; lastRanks: Record<string, number> } {
  const rows = entries.filter((row) => row.score > 0).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, cap);
  const nextRanks: Record<string, number> = {};
  const live = new Set<string>();
  const chart: ChartRow[] = rows.map((row, index) => {
    const rankNo = index + 1;
    const posKey = `${row.name}|${row.title}`;
    const runKey = `${kind}|${posKey}`;
    nextRanks[posKey] = rankNo;
    live.add(runKey);
    const prev = lastRanks[posKey];
    const back = prev == null && (seen[posKey] ?? 0) > 0;
    seen[posKey] = rankNo;
    const streak = prev == null ? 1 : Math.max(1, (runs[runKey] ?? 0) + (runs[runKey] ? 1 : 1));
    runs[runKey] = prev == null ? 1 : (runs[runKey] || 0) + 1;
    peaks[runKey] = Math.min(peaks[runKey] ?? rankNo, rankNo);
    return {
      rank: rankNo,
      name: row.name,
      title: row.title,
      score: row.score,
      you: row.you,
      move: prev == null ? null : prev - rankNo,
      weeks: runs[runKey] || streak,
      peak: peaks[runKey] ?? rankNo,
      back,
    };
  });
  for (const key of Object.keys(runs)) {
    if (key.startsWith(`${kind}|`) && !live.has(key)) runs[key] = 0;
  }
  return { chart, lastRanks: nextRanks };
}

function playerWeek(track: Track): { recent: number; prior: number; age: number } {
  const recent = track.weekly.reduce((sum, night) => sum + night, 0) || track.lastNight;
  const prior = track.weekly.slice(0, -1).reduce((sum, night) => sum + night, 0);
  const age = track.weekOut == null ? 1 : Math.max(1, (track.weekly.length > 0 ? track.weeksLive * 7 : 1));
  return { recent, prior, age: track.weekOut == null ? 1 : age };
}

function chartAge(track: Track, day: number): number {
  if (track.weekOut == null) return 1;
  return Math.max(1, day - track.weekOut + 1);
}

function voteScore(quality: number, streams: number, seed: string, commercial: number): number {
  const craft = quality * 0.62;
  const write = quality * 0.18;
  const noise = hashUnit(seed) * 14;
  const upset = hashUnit(`${seed}|upset`) > 0.94 ? 22 : 0;
  const sales = Math.log10(streams + 10) * commercial;
  return craft + write + noise + upset + sales;
}

function settleGrammy(book: TradeBook, tracks: Track[], day: number, nick: string, notes: string[]): number {
  if (day % 84 !== 0) return 0;
  const season = seasonOf(day);
  if (book.grammy.settledSeason >= season) return 0;
  const windowStart = day - 83;
  const yours = tracks.filter((track) => track.status === "out" && track.weekOut != null && track.weekOut >= windowStart && track.weekOut <= day);
  const filed = book.grammy.submitted.filter((row) => row.season === season);
  const pool: { category: GrammyCategory; title: string; artist: string; you: boolean; trackId: string; score: number }[] = [];

  const add = (category: GrammyCategory, title: string, artist: string, you: boolean, trackId: string, quality: number, streams: number, commercial: number) => {
    pool.push({
      category,
      title,
      artist,
      you,
      trackId,
      score: voteScore(quality, streams, `${season}|${category}|${artist}|${title}`, commercial),
    });
  };

  for (const entry of filed) {
    const track = yours.find((item) => item.id === entry.trackId);
    if (!track) continue;
    if ((entry.category === "Best Rap Album" || entry.category === "Album of the Year") && track.kind !== "album") continue;
    if ((entry.category === "Best Rap Song" || entry.category === "Best Rap Performance" || entry.category === "Record of the Year") && track.kind === "album") continue;
    if (entry.category === "Best New Artist") {
      const older = tracks.some((item) => item.status === "out" && item.weekOut != null && item.weekOut < windowStart);
      if (older) continue;
    }
    add(entry.category, track.title, nick, true, track.id, track.quality, track.streams, entry.category === "Record of the Year" ? 6 : 3);
  }

  for (const rival of book.rivals) {
    const eligible = rival.cuts.filter((cut) => cut.dayOut >= windowStart && cut.dayOut <= day && cut.streams > 0);
    const single = [...eligible].filter((cut) => cut.kind === "single").sort((a, b) => b.quality - a.quality)[0];
    const album = eligible.find((cut) => cut.kind === "album");
    const debut = rival.cuts.every((cut) => cut.dayOut >= windowStart);
    if (single) {
      add("Best Rap Song", single.title, rival.name, false, `rival:${rival.name}:${single.title}`, single.quality, single.streams, 3);
      add("Best Rap Performance", single.title, rival.name, false, `rival:${rival.name}:${single.title}:p`, single.quality, single.streams, 2);
      add("Record of the Year", single.title, rival.name, false, `rival:${rival.name}:${single.title}:r`, single.quality, single.streams, 6);
    }
    if (album) {
      add("Best Rap Album", album.title, rival.name, false, `rival:${rival.name}:${album.title}`, album.quality, album.streams, 3);
      add("Album of the Year", album.title, rival.name, false, `rival:${rival.name}:${album.title}:a`, album.quality, album.streams, 5);
    }
    if (debut && single && rival.heat < 72) {
      add("Best New Artist", single.title, rival.name, false, `rival:${rival.name}:new`, single.quality, single.streams, 2);
    }
  }

  const noms: GrammyEntry[] = [];
  const wins: GrammyBook["wins"] = [...book.grammy.wins];
  let fameBump = 0;
  for (const category of GRAMMY_CATEGORIES) {
    const field = pool.filter((row) => row.category === category).sort((a, b) => b.score - a.score).slice(0, 4);
    for (const row of field.slice(0, 3)) {
      const why = `Ballot score ${row.score.toFixed(1)}: craft, a commercial bump from plays, and scatter. The final vote is a second pass, so the favorite can lose.`;
      noms.push({ category, title: row.title, artist: row.artist, you: row.you, trackId: row.trackId, why });
      if (row.you) {
        pushHistory(book, {
          id: `grammy:nom:${season}:${category}`,
          day,
          name: `Nominated · ${category}`,
          detail: row.title,
        });
        pushNews(book, {
          id: `grammy:nom:${season}:${category}:${nick}`,
          day,
          outlet: "Night Desk",
          headline: `${nick} is nominated for ${category}`,
          body: `${row.title} made the ballot. A nomination is not a win.`,
          artist: nick,
          subject: row.title,
        });
      }
    }
    const finalists = field.slice(0, 3).map((row) => ({
      ...row,
      final: voteScore(row.score, 0, `${season}|final|${category}|${row.artist}|${row.title}`, 0),
    }));
    finalists.sort((a, b) => b.final - a.final);
    const winner = finalists[0];
    if (!winner) continue;
    wins.push({ category, title: winner.title, artist: winner.artist, you: winner.you, trackId: winner.trackId, day, season });
    if (winner.you) {
      fameBump += 1;
      pushHistory(book, {
        id: `grammy:win:${season}:${category}`,
        day,
        name: `Won · ${category}`,
        detail: winner.title,
      });
      pushNews(book, {
        id: `grammy:win:${season}:${category}:${nick}`,
        day,
        outlet: "Night Desk",
        headline: `${nick} wins ${category}`,
        body: `${winner.title} took the award. The other nominees lost it.`,
        artist: nick,
        subject: winner.title,
      });
      notes.push(`You won ${category}.`);
    } else {
      pushNews(book, {
        id: `grammy:win:${season}:${category}:${winner.artist}`,
        day,
        outlet: "Night Desk",
        headline: `${winner.artist} wins ${category}`,
        body: `${winner.title} beat the rest of the ballot.`,
        artist: winner.artist,
        subject: winner.title,
      });
      notes.push(`${winner.artist} won ${category}.`);
    }
  }
  book.grammy = { settledSeason: season, submitted: book.grammy.submitted, noms, wins };
  return Math.min(1, fameBump);
}

function recognize(book: TradeBook, hasSong: boolean): Recognition {
  const youWin = book.grammy.wins.some((row) => row.you);
  const youNom = book.grammy.noms.some((row) => row.you) || book.history.some((row) => row.id.startsWith("grammy:nom:"));
  const diamond = book.certs.some((row) => row.level === "diamond");
  const platinum = book.certs.some((row) => row.level && row.level !== "gold");
  const gold = book.certs.some((row) => row.level);
  const no1 = book.no1s.length;
  const charted = book.history.some((row) => row.id === "chart:first");
  const top10 = book.history.some((row) => row.id === "chart:top10");
  if (youWin && no1 > 0) return "Global Icon";
  if (youWin || no1 >= 2 || diamond) return "Superstar";
  if (no1 > 0 || platinum || youNom) return "Celebrity";
  if (top10 || gold) return "Recognized Artist";
  if (charted) return "Rising Star";
  if (hasSong) return "Underground Artist";
  return "Unknown Artist";
}

const APPEARANCES: { min: Recognition; name: string; energy: number; cost: number; note: string }[] = [
  { min: "Rising Star", name: "Campus blog", energy: 4, cost: 0, note: "A student page. No followers are added." },
  { min: "Recognized Artist", name: "Local podcast", energy: 6, cost: 0, note: "You talk about the work. No followers are added." },
  { min: "Celebrity", name: "Night Desk interview", energy: 8, cost: 40, note: "The desk charges $40. No followers are added." },
  { min: "Superstar", name: "Late show", energy: 12, cost: 80, note: "Cash and energy. No followers are added." },
  { min: "Global Icon", name: "World feed", energy: 14, cost: 120, note: "A worldwide appearance. It does not mint fans." },
];

const RANK_ORDER: Recognition[] = ["Unknown Artist", "Underground Artist", "Rising Star", "Recognized Artist", "Celebrity", "Superstar", "Global Icon"];

function syncOffers(book: TradeBook, day: number, nick: string, notes: string[]) {
  const at = RANK_ORDER.indexOf(book.recognition);
  const pending = APPEARANCES.filter((row) => {
    const need = RANK_ORDER.indexOf(row.min);
    return need >= 2 && need <= at && !book.history.some((item) => item.id === `sat:${row.name}`);
  }).slice(-2);
  book.offers = pending.map((row) => ({ id: `offer:${row.name}`, name: row.name, energy: row.energy, cost: row.cost, note: row.note }));
  const next = book.offers[0] ?? null;
  if (next && !book.news.some((item) => item.id === `ask:${next.name}:${nick}`)) {
    pushNews(book, {
      id: `ask:${next.name}:${nick}`,
      day,
      outlet: "Night Desk",
      headline: `${nick} is asked onto ${next.name}`,
      body: `${next.note} Energy ${next.energy}${next.cost ? `. Cash ${next.cost}` : ""}.`,
      artist: nick,
      subject: next.name,
    });
    notes.push(`${next.name} is open.`);
  }
  book.invite = next;
}

function verify(book: TradeBook, media: MediaBook, notes: string[]) {
  const flags = book.verified;
  const known = book.recognition === "Celebrity" || book.recognition === "Superstar" || book.recognition === "Global Icon";
  const charted = book.history.some((row) => row.id === "chart:top10" || row.id === "chart:first");
  if (!flags.x && known && book.history.some((row) => row.id === "chart:top10")) {
    flags.x = true;
    notes.push("X verified this name. The other apps did not.");
  }
  if (!flags.instagram && (book.certs.some((row) => row.level) || known) && media.instagram.followers >= 500) {
    flags.instagram = true;
    notes.push("Instagram verified this name.");
  }
  if (!flags.tiktok && charted && media.tiktok.followers >= 800 && media.clips.length >= 3) {
    flags.tiktok = true;
    notes.push("TikTok verified this name.");
  }
  if (!flags.youtube && charted && media.youtube.subscribers >= 400 && media.youtube.views > 0) {
    flags.youtube = true;
    notes.push("YouTube verified this name.");
  }
  book.verified = flags;
}

export function tradeFrom(raw: unknown): TradeBook {
  const base = emptyTrade();
  if (!raw || typeof raw !== "object") return base;
  const row = raw as Partial<TradeBook>;
  return {
    ...base,
    ...row,
    rivals: Array.isArray(row.rivals) ? row.rivals.map((rival) => rivalFile(rival)) : [],
    certs: Array.isArray(row.certs) ? row.certs : [],
    news: Array.isArray(row.news) ? row.news : [],
    history: Array.isArray(row.history) ? row.history : [],
    seen: row.seen && typeof row.seen === "object" ? row.seen : {},
    albumChart: Array.isArray(row.albumChart) ? row.albumChart : [],
    albumRanks: recordOf(row.albumRanks),
    albumSeen: recordOf(row.albumSeen),
    archive: Array.isArray(row.archive) ? row.archive : [],
    runs: recordOf(row.runs),
    peaks: recordOf(row.peaks),
    bestRun: Number(row.bestRun) || 0,
    recognition: row.recognition ?? "Unknown Artist",
    verified: { ...base.verified, ...(row.verified ?? {}) },
    grammy: {
      ...base.grammy,
      ...(row.grammy ?? {}),
      submitted: Array.isArray(row.grammy?.submitted) ? row.grammy.submitted : [],
      noms: Array.isArray(row.grammy?.noms) ? row.grammy.noms : [],
      wins: Array.isArray(row.grammy?.wins) ? row.grammy.wins : [],
    },
    no1s: Array.isArray(row.no1s) ? row.no1s : [],
    offers: Array.isArray(row.offers) ? row.offers : [],
    fanNotes: Array.isArray(row.fanNotes) ? row.fanNotes : [],
    soldOut: Array.isArray(row.soldOut) ? row.soldOut : [],
    invite: row.invite ?? null,
  };
}

function recordOf(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, number> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    const n = Number(item);
    if (Number.isFinite(n)) out[key] = n;
  }
  return out;
}

function rivalFile(raw: Partial<RivalFile> | undefined): RivalFile {
  const cuts = Array.isArray(raw?.cuts) ? raw.cuts : [];
  return {
    name: String(raw?.name || "Artist"),
    heat: Number(raw?.heat) || 20,
    deal: raw?.deal === "major" || raw?.deal === "indie" ? raw.deal : "",
    tourUntil: Number(raw?.tourUntil) || 0,
    cuts: cuts.map((cut) => ({
      title: String(cut?.title || "Untitled"),
      kind: cut?.kind === "album" ? "album" : "single",
      quality: Number(cut?.quality) || 20,
      dayOut: Number(cut?.dayOut) || 1,
      streams: Number(cut?.streams) || 0,
      counted: Number(cut?.counted) || 0,
      lastWeek: Number(cut?.lastWeek) || 0,
      priorWeek: Number(cut?.priorWeek) || 0,
      units: Number(cut?.units) || 0,
      cert: (cut?.cert as CertLevel) || "",
      certDay: Number(cut?.certDay) || 0,
    })),
  };
}

export function settleTrade(input: {
  day: number;
  chartMoves: boolean;
  npc: Npc[];
  tracks: Track[];
  nick: string;
  lastRanks: Record<string, number>;
  trade: TradeBook;
  media: MediaBook;
}): { trade: TradeBook; board: { chart: ChartRow[]; lastRanks: Record<string, number> } | null; notes: string[]; fameBump: number } {
  const book = tradeFrom(input.trade);
  if (book.settledOn === input.day) {
    return { trade: book, board: null, notes: [], fameBump: 0 };
  }
  const notes: string[] = [];
  ensureRivals(book, input.npc, input.day);
  if (input.chartMoves) advanceRivals(book, input.day, notes);
  applyPlayerCerts(book, input.tracks, input.day, input.nick, notes);

  let board: { chart: ChartRow[]; lastRanks: Record<string, number> } | null = null;
  if (input.chartMoves) {
    const singles: Contender[] = [];
    const albums: Contender[] = [];
    for (const track of input.tracks) {
      if (track.status !== "out" || track.kind === "video" || track.weekOut == null) continue;
      const week = playerWeek(track);
      const age = chartAge(track, input.day);
      const score = performanceScore(week.recent, track.quality, age, week.prior);
      const row: Contender = {
        name: input.nick,
        title: track.title,
        you: true,
        score,
        weeks: Math.max(1, track.weeksLive || 1),
        peak: track.peak ?? 99,
        kind: track.kind === "album" ? "album" : "single",
      };
      if (track.kind === "album") albums.push(row);
      else singles.push(row);
    }
    for (const rival of book.rivals) {
      for (const cut of rival.cuts) {
        const age = Math.max(1, input.day - cut.dayOut + 1);
        const score = performanceScore(cut.lastWeek, cut.quality, age, cut.priorWeek);
        const row: Contender = {
          name: rival.name,
          title: cut.title,
          you: false,
          score,
          weeks: Math.max(1, Math.floor(age / 7) || 1),
          peak: 99,
          kind: cut.kind,
        };
        if (cut.kind === "album") albums.push(row);
        else singles.push(row);
      }
    }
    const albumBoard = rank(albums, book.albumRanks, book.albumSeen, book.peaks, book.runs, "album", 50);
    book.albumChart = albumBoard.chart;
    book.albumRanks = albumBoard.lastRanks;
    board = rank(singles, input.lastRanks, book.seen, book.peaks, book.runs, "single", 100);
    const yours = board.chart.filter((row) => row.you).sort((a, b) => a.rank - b.rank);
    const best = yours[0];
    if (best && !book.history.some((row) => row.id === "chart:first")) {
      pushHistory(book, { id: "chart:first", day: input.day, name: "First chart appearance", detail: `${best.title} · #${best.rank}` });
      pushNews(book, {
        id: `chart:first:${input.nick}`,
        day: input.day,
        outlet: "Room Report",
        headline: `${input.nick} enters the chart`,
        body: `${best.title} opened at #${best.rank}. Ranked on this week's plays.`,
        artist: input.nick,
        subject: best.title,
      });
      notes.push(`${best.title} entered at #${best.rank}.`);
      pushFan(book, {
        id: `fan:chart:first:${best.title}`,
        day: input.day,
        text: `Fans played ${best.title} enough to open at #${best.rank}. Followers were not the score.`,
      });
    }
    if (best && board.chart.length >= 40 && best.rank <= 40 && !book.history.some((row) => row.id === "chart:top40")) {
      pushHistory(book, { id: "chart:top40", day: input.day, name: "First Top 40", detail: `${best.title} · #${best.rank} on a board of ${board.chart.length}` });
    }
    if (best && best.rank <= 10 && !book.history.some((row) => row.id === "chart:top10")) {
      pushHistory(book, { id: "chart:top10", day: input.day, name: "First Top 10", detail: `${best.title} · #${best.rank}` });
    }
    if (best && best.rank <= 5 && !book.history.some((row) => row.id === "chart:top5")) {
      pushHistory(book, { id: "chart:top5", day: input.day, name: "First Top 5", detail: `${best.title} · #${best.rank}` });
    }
    for (const row of yours) {
      if (row.rank !== 1 || book.no1s.includes(row.title)) continue;
      book.no1s = [...book.no1s, row.title];
      pushHistory(book, { id: `chart:no1:${row.title}`, day: input.day, name: "No. 1 single", detail: row.title });
      pushNews(book, {
        id: `chart:no1:${row.title}:${input.day}`,
        day: input.day,
        outlet: "Room Report",
        headline: `${input.nick} hits No. 1`,
        body: `${row.title} is the week's most played single. It is not a Grammy.`,
        artist: input.nick,
        subject: row.title,
      });
      notes.push(`${row.title} is No. 1.`);
    }
    const albumBest = book.albumChart.find((row) => row.you && row.rank === 1);
    if (albumBest && book.albumChart.length >= 2 && !book.history.some((row) => row.id === `album:no1:${albumBest.title}`)) {
      pushHistory(book, { id: `album:no1:${albumBest.title}`, day: input.day, name: "No. 1 album", detail: albumBest.title });
      pushNews(book, {
        id: `album:no1:${albumBest.title}`,
        day: input.day,
        outlet: "Room Report",
        headline: `${albumBest.title} is the No. 1 album`,
        body: "Album rank uses the album's own plays, not the singles already counted. Another album was on the board.",
        artist: input.nick,
        subject: albumBest.title,
      });
      notes.push(`${albumBest.title} is the No. 1 album.`);
    }
    const marks: ChartMark[] = [];
    for (const row of board.chart) {
      if (row.rank <= 15 || row.you) marks.push({ day: input.day, kind: "single", rank: row.rank, name: row.name, title: row.title, you: row.you, move: row.move });
    }
    for (const row of book.albumChart) {
      if (row.rank <= 10 || row.you) marks.push({ day: input.day, kind: "album", rank: row.rank, name: row.name, title: row.title, you: row.you, move: row.move });
    }
    book.archive = [...marks, ...book.archive].slice(0, 240);
    const yoursWeeks = [...board.chart, ...book.albumChart].filter((row) => row.you).reduce((best, row) => Math.max(best, row.weeks), 0);
    if (yoursWeeks > book.bestRun) {
      book.bestRun = yoursWeeks;
      const holder = [...board.chart, ...book.albumChart].find((row) => row.you && row.weeks === yoursWeeks);
      const existing = book.history.find((row) => row.id === "chart:longrun");
      const detail = holder ? `${holder.title} · ${yoursWeeks} week${yoursWeeks === 1 ? "" : "s"}` : `${yoursWeeks} weeks`;
      if (existing) {
        existing.day = input.day;
        existing.detail = detail;
      } else {
        pushHistory(book, { id: "chart:longrun", day: input.day, name: "Longest chart run", detail });
      }
    }
  }

  const fameBump = settleGrammy(book, input.tracks, input.day, input.nick, notes);
  const hasSong = input.tracks.some((track) => track.status === "out");
  const nextRank = recognize(book, hasSong);
  if (nextRank !== book.recognition) {
    pushHistory(book, { id: `rank:${nextRank}`, day: input.day, name: nextRank, detail: "Recognition moved because of the work, not a menu." });
    book.recognition = nextRank;
    notes.push(`Recognition: ${nextRank}.`);
  }
  syncOffers(book, input.day, input.nick, notes);
  if (input.tracks.some((track) => track.status === "out") && !book.history.some((row) => row.id.startsWith("debut:"))) {
    const debut = input.tracks.find((track) => track.status === "out" && track.kind !== "album");
    if (debut) pushHistory(book, { id: `debut:${debut.id}`, day: debut.weekOut ?? input.day, name: "Debut single", detail: debut.title });
  }
  verify(book, input.media, notes);
  book.settledOn = input.day;
  return { trade: book, board, notes, fameBump };
}

export function submitEntry(trade: TradeBook, tracks: Track[], day: number, trackId: string, category: GrammyCategory): { trade: TradeBook; ok: boolean; reason: string } {
  const book = tradeFrom(trade);
  const season = seasonOf(day);
  if (book.grammy.settledSeason >= season) {
    return { trade: book, ok: false, reason: "This season already voted. The next one opens after the ceremony morning." };
  }
  const track = tracks.find((item) => item.id === trackId);
  if (!track || track.status !== "out" || track.weekOut == null) {
    return { trade: book, ok: false, reason: "Only a song that is already out can be submitted." };
  }
  const windowStart = season * 84 + 1;
  if (track.weekOut < windowStart) {
    return { trade: book, ok: false, reason: "That release is outside this 84-day season." };
  }
  const albumCat = category === "Best Rap Album" || category === "Album of the Year";
  const songCat = category === "Best Rap Song" || category === "Best Rap Performance" || category === "Record of the Year";
  if (albumCat && track.kind !== "album") return { trade: book, ok: false, reason: "That category takes an album." };
  if (songCat && track.kind === "album") return { trade: book, ok: false, reason: "That category takes a single." };
  if (category === "Best New Artist" && tracks.some((item) => item.status === "out" && item.weekOut != null && item.weekOut < windowStart)) {
    return { trade: book, ok: false, reason: "Best New Artist is closed. A release from an earlier season is already out." };
  }
  if (book.grammy.submitted.some((row) => row.season === season && row.trackId === trackId && row.category === category)) {
    return { trade: book, ok: false, reason: "That recording is already submitted in this category." };
  }
  book.grammy = {
    ...book.grammy,
    submitted: [...book.grammy.submitted, { trackId, category, season }],
  };
  return { trade: book, ok: true, reason: `${track.title} is submitted for ${category}.` };
}

export function labelFile(trade: TradeBook, tracks: Track[], day: number, signed: boolean): { trade: TradeBook; ok: boolean; reason: string } {
  if (!signed) return { trade: tradeFrom(trade), ok: false, reason: "No label is on the contract. Submit the song yourself." };
  let book = tradeFrom(trade);
  const filed: string[] = [];
  for (const category of GRAMMY_CATEGORIES) {
    const albumCat = category === "Best Rap Album" || category === "Album of the Year";
    const songCat = category === "Best Rap Song" || category === "Best Rap Performance" || category === "Record of the Year";
    const season = seasonOf(day);
    const windowStart = season * 84 + 1;
    const eligible = tracks.filter((track) => {
      if (track.status !== "out" || track.weekOut == null || track.weekOut < windowStart) return false;
      if (albumCat && track.kind !== "album") return false;
      if (songCat && track.kind === "album") return false;
      if (category === "Best New Artist" && tracks.some((item) => item.status === "out" && item.weekOut != null && item.weekOut < windowStart)) return false;
      return !book.grammy.submitted.some((row) => row.season === season && row.trackId === track.id && row.category === category);
    });
    eligible.sort((a, b) => b.quality - a.quality || b.streams - a.streams);
    const best = eligible[0];
    if (!best) continue;
    const result = labelPush(book, tracks, day, best.id, category);
    if (!result.ok) continue;
    book = result.trade;
    filed.push(`${category}: ${best.title}`);
  }
  if (!filed.length) {
    return { trade: book, ok: false, reason: "The label had nothing eligible. A song has to be out inside these 84 days, and not already filed." };
  }
  return { trade: book, ok: true, reason: `The label submitted ${filed.join("; ")}. A nomination is not a win.` };
}

function labelPush(trade: TradeBook, tracks: Track[], day: number, trackId: string, category: GrammyCategory) {
  return submitEntry(trade, tracks, day, trackId, category);
}

const SEATS: Record<string, number> = {
  "Open mic": 40,
  "The back room": 80,
  "Club night": 220,
  "The theater": 900,
  "Arena night": 8000,
};

export function recordShow(trade: TradeBook, day: number, place: string, fans: number, nick: string): { trade: TradeBook; soldOut: boolean; line: string } {
  const book = tradeFrom(trade);
  const seats = SEATS[place] ?? 80;
  const soldOut = fans >= seats;
  const id = `show:${day}:${place}`;
  if (!book.soldOut.some((row) => row.id === id)) book.soldOut = [{ id, day, place, soldOut }, ...book.soldOut].slice(0, 24);
  if (soldOut) {
    pushHistory(book, { id, day, name: "Sold out", detail: `${place} · ${seats} seats` });
    pushNews(book, {
      id,
      day,
      outlet: "Room Report",
      headline: `${nick} sells out ${place}`,
      body: `${fans} fans filled ${seats} seats. The door price did not change.`,
      artist: nick,
      subject: place,
    });
  }
  pushFan(book, {
    id: `fan:${id}`,
    day,
    text: soldOut ? `${place} sold out. ${fans} people against ${seats} seats.` : `${place} was not full. ${fans} fans, ${seats} seats.`,
  });
  return { trade: book, soldOut, line: soldOut ? `${place} sold out.` : `${place} had empty seats.` };
}

export function finishOffer(trade: TradeBook, name: string, day: number): TradeBook {
  const book = tradeFrom(trade);
  pushHistory(book, { id: `sat:${name}`, day, name, detail: "You sat for it. Followers did not move." });
  book.offers = book.offers.filter((row) => row.name !== name);
  book.invite = book.offers[0] ?? null;
  return book;
}
