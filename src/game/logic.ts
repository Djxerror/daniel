import {
  cityOf,
  CLASSES,
  isLegacyRoster,
  LABELS,
  lookOf,
  LOOKS,
  MERCH,
  PATHS,
  PLATFORMS,
  ROSTER,
  SHOP,
  SKILLS,
  STAFF,
  starCut,
  starFee,
  TITLE_LEFT,
  TITLE_RIGHT,
  tierOf,
  venueFor,
  HOMES,
  roomRating,
  LYRIC_DESKS,
  PROD_DESKS,
  ROOM_DESKS,
  STYLES,
  THEMES,
  RACK,
  emptyRack,
  rackScore,
} from "@/game/content";
import type {
  ActionId,
  Books,
  Career,
  ChartRow,
  FeedItem,
  Gear,
  LabelDeal,
  LifeItem,
  Lifestyle,
  LookId,
  Mail,
  MerchId,
  Npc,
  Pace,
  PathId,
  Result,
  ShopItem,
  Skills,
  Tone,
  Track,
  FoodTier,
  PlatformId,
  PlatformNight,
  ClassSkill,
  StaffId,
  SongParts,
  PartKey,
  Rack,
  RackId,
  Band,
  Business,
  BizProduct,
  Gig,
} from "@/game/types";
import { careerAge, dateLabel, fmt, isFriday, money, moneyPair } from "@/game/format";
import { boostPost, chemistryBetween, markCollab, openCircle, peopleMorning, versePrice } from "@/game/people";
import { catalogDecay, emptyMedia, hearReleases, mediaFrom, soundPush, type ReleasePulse } from "@/game/media";
import { emptyTrade, finishOffer, labelFile, recordShow, settleTrade, submitEntry, tradeFrom, type GrammyCategory } from "@/game/industry";
import {
  EMPTY_DEGREES,
  WEEKDAYS_IN_YEAR,
  degreeById,
  degreeFrom,
  degreeLock,
  degreesFrom,
  jobById,
  jobFrom,
  jobLock,
  pathDaysFrom,
  settleWorkDay,
} from "@/game/work";
import type { DegreeId } from "@/game/types";

export const COSTS: Record<ActionId, number> = {
  write: 12,
  record: 16,
  drop: 8,
  promo: 8,
  post: 6,
  rehearse: 8,
  show: 18,
  visual: 20,
  beat: 12,
  pitch: 8,
  shift: 14,
  eat: 0,
};

/** One sitting: title through the bill. */
export const SESSION_ENERGY = 60;

export const PROMO_STEPS = [
  { name: "Snippet #1", cost: 20 },
  { name: "Release date", cost: 10 },
  { name: "Snippet #2", cost: 20 },
  { name: "Teaser", cost: 75 },
] as const;

export const PART_ENERGY: Record<PartKey, number> = { lyrics: 4, flow: 3, voice: 5, prod: 5 };

export const TRAIN_ENERGY: Record<keyof Skills, number> = {
  pen: 7,
  flow: 8,
  vocals: 10,
  prod: 10,
  stage: 12,
  biz: 12,
};

const PLATE = 28;
const STREAM_PAY = 0.034;

/** Plays for one song on one morning. Day 1–21 use the original decay. */
export function songPlays(
  c: Career,
  t: Track,
  age: number,
  live?: { fans: number; hype: number; reputation: number },
): number {
  const fans = live?.fans ?? c.fans;
  const hype = live?.hype ?? c.hype;
  const reputation = live?.reputation ?? c.reputation;
  const decay = catalogDecay(age, t.quality, t.visual);
  const studio = 1 + c.gear.studio * 0.12 + rackScore(c.rack) * 0.04;
  const visual = t.visual ? 1.45 : 1;
  const label = c.label ? 1.18 : 1;
  const heat = 0.55 + hype / 130;
  const name = 0.82 + reputation / 240;
  const promo = 1 + Math.min(4, t.promo) * 0.14;
  const feat = featLift(t.feat);
  const dist = 1 + (c.lifestyle?.distributor ?? 0) * 0.12;
  const ice = 1 + (c.lifestyle?.jewelry ?? 0) * 0.06 + (c.lifestyle?.car ?? 0) * 0.04 + (c.lifestyle?.ink ?? 0) * 0.03;
  const shape = t.kind === "album" ? 2.5 : t.kind === "video" ? 1.35 : 1;
  const pushed = t.platform ? 1.12 : 1;
  const sound = 1 + soundPush(c.media?.clips, t, c.day);
  return Math.max(
    0,
    Math.round(
      Math.pow(Math.max(1, t.quality), 1.08) *
        (18 + fans / 80) *
        decay *
        studio *
        visual *
        label *
        heat *
        name *
        promo *
        feat *
        dist *
        ice *
        shape *
        pushed *
        sound *
        cityOf(c.city).scene,
    ),
  );
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function featLift(feat: string | null): number {
  if (!feat) return 1;
  const n = feat.split(",").map((part) => part.trim()).filter(Boolean).length;
  if (n >= 3) return 1.7;
  if (n === 2) return 1.55;
  return 1.35;
}

function rand(min: number, max: number) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function bump(n: number, d: number) {
  return clamp(n + d, 1, 100);
}

function oneDecimal(n: number) {
  return Math.round(n * 10) / 10;
}

function emptyParts(): SongParts {
  return { lyrics: 0, flow: 0, voice: 0, prod: 0, studio: 0, lyricGain: 0, flowGain: 0, voiceGain: 0, prodGain: 0 };
}

function partsFromSkills(skills: Skills, studio = 0): SongParts {
  return {
    lyrics: oneDecimal(skills.pen / 10),
    flow: oneDecimal(skills.flow / 10),
    voice: oneDecimal(skills.vocals / 10),
    prod: oneDecimal(skills.prod / 10),
    studio,
    lyricGain: 0,
    flowGain: 0,
    voiceGain: 0,
    prodGain: 0,
  };
}

function partsScore(parts: SongParts) {
  return parts.lyrics * 4.2 + parts.flow * 3.1 + parts.voice * 2.4 + parts.prod * 3.3 + parts.studio * 2.5;
}

function emptyTrack(partial: Pick<Track, "title" | "status" | "quality">): Track {
  return {
    id: uid(),
    title: partial.title,
    status: partial.status,
    quality: partial.quality,
    streams: 0,
    weekOut: null,
    weeksLive: 0,
    peak: null,
    visual: false,
    weekly: [],
    promo: 0,
    lastNight: 0,
    feat: null,
    featCut: 0,
    earned: 0,
    kind: "single",
    platform: null,
    style: "",
    theme: "",
    parts: emptyParts(),
    dropOn: null,
    albumOf: null,
    made: null,
  };
}

export function emptyPlatforms(): PlatformNight {
  return { wire: 0, nightbus: 0, room: 0 };
}

export function emptyBooks(): Books {
  return { gross: 0, expenses: 0, tourSpent: 0, tourEarned: 0 };
}

export function emptyMerch(): Career["merch"] {
  return {
    cups: { on: false, spent: 0, earned: 0 },
    socks: { on: false, spent: 0, earned: 0 },
    tees: { on: false, spent: 0, earned: 0 },
    hoodies: { on: false, spent: 0, earned: 0 },
    jeans: { on: false, spent: 0, earned: 0 },
  };
}

function addBooks(books: Books | undefined, delta: Partial<Books>): Books {
  const base = books ?? emptyBooks();
  return {
    gross: base.gross + (delta.gross ?? 0),
    expenses: base.expenses + (delta.expenses ?? 0),
    tourSpent: base.tourSpent + (delta.tourSpent ?? 0),
    tourEarned: base.tourEarned + (delta.tourEarned ?? 0),
  };
}

export function blankCareer(): Career {
  return {
    version: 2,
    started: false,
    look: "hoodie",
    city: "Chicago",
    nick: "You",
    fullName: "You",
    age: 16,
    bornAge: 16,
    startYear: 0,
    gender: "male",
    death: "standard",
    level: "standard",
    taxes: "standard",
    sandbox: false,
    homeTier: 0,
    software: 0,
    path: "rapper",
    pace: "standard",
    week: 1,
    day: 1,
    cash: 0,
    fans: 0,
    streams: 0,
    energy: 100,
    maxEnergy: 100,
    fame: 0,
    hype: 6,
    reputation: 4,
    skills: { flow: 1, pen: 1, vocals: 1, prod: 1, stage: 1, biz: 1 },
    gear: { mic: 0, studio: 0, wardrobe: 0, manager: false },
    rack: emptyRack(),
    tracks: [],
    feed: [],
    awards: [],
    awardLog: [],
    label: null,
    bestRank: null,
    shows: 0,
    showBooked: false,
    tourBooked: false,
    videos: 0,
    tab: "home",
    lastResult: null,
    seenIntro: false,
    npc: [],
    lastRanks: {},
    chart: [],
    mail: [],
    relations: {},
    lifestyle: { jewelry: 0, car: 0, house: 0, distributor: 0, ink: 0 },
    merch: emptyMerch(),
    books: emptyBooks(),
    loan: null,
    desk: null,
    school: null,
    job: null,
    degree: null,
    degrees: { ...EMPTY_DEGREES },
    pathDays: {},
    staff: { engineer: false, booker: false },
    platforms: emptyPlatforms(),
    media: emptyMedia(),
    beats: [],
    band: null,
    gigs: [],
    business: null,
    creator: false,
    met: [],
    bonds: {},
    circleMail: [],
    crew: null,
    industry: { loyal: 8, generous: 6, respected: 4, difficult: 0, controversial: 0, fake: 0 },
    trade: emptyTrade(),
    circleAsk: null,
  };
}

export function isCareer(x: unknown): x is Career {
  if (!x || typeof x !== "object") return false;
  const o = x as Partial<Career>;
  return (
    (o.version === 1 || o.version === 2) &&
    o.started === true &&
    typeof o.city === "string" &&
    Array.isArray(o.tracks) &&
    Array.isArray(o.npc) &&
    !!o.skills &&
    !!o.gear
  );
}

export function migrate(raw: Career): Career {
  const base = blankCareer();
  const already = raw.version === 2 && typeof raw.day === "number";
  const day = already ? raw.day : ((raw.week ?? 1) - 1) * 7 + 1;
  const tracks = (raw.tracks ?? []).map((t) => {
    const weekOut = t.weekOut == null ? null : already ? t.weekOut : (t.weekOut - 1) * 7 + 1;
    return {
      ...emptyTrack({ title: t.title, status: t.status, quality: t.quality }),
      ...t,
      weekOut,
      promo: t.promo ?? 0,
      lastNight: t.lastNight ?? 0,
      feat: t.feat ?? null,
      featCut: t.featCut ?? 0,
      earned: t.earned ?? 0,
      weekly: t.weekly ?? [],
      kind: t.kind ?? "single",
      platform: t.platform ?? null,
      style: t.style ?? "",
      theme: t.theme ?? "",
      parts: { ...emptyParts(), ...(t.parts ?? {}) },
      dropOn: t.dropOn ?? null,
      albumOf: t.albumOf ?? null,
      made: t.made ?? null,
    };
  });
  const npc: Npc[] = (raw.npc ?? []).map((n) => ({
    name: n.name,
    title: n.title,
    score: n.score,
    weeksOn: n.weeksOn ?? 1,
    peak: n.peak ?? 10,
    mood: n.mood ?? 0,
    fee: typeof n.fee === "number" ? Math.max(0, Math.round(n.fee)) : 0,
  }));
  const chart: ChartRow[] = (raw.chart ?? []).map((row) => ({
    ...row,
    weeks: row.weeks ?? 1,
    peak: row.peak ?? row.rank,
  }));
  const oldLabel = raw.label as (LabelDeal & { name: string; cut: number }) | null;
  const label: LabelDeal | null = oldLabel
    ? {
        name: oldLabel.name,
        cut: oldLabel.cut,
        due: oldLabel.due ?? 4,
        made: oldLabel.made ?? tracks.filter((t) => t.status === "out").length,
        weeksLeft: oldLabel.weeksLeft ?? 16,
      }
    : null;
  const startYear = typeof raw.startYear === "number" ? clamp(Math.round(raw.startYear), 0, 2026) : 0;
  const bornAge = clamp(Math.round(typeof raw.bornAge === "number" ? raw.bornAge : (raw.age ?? 16)), 16, 80);
  const age = careerAge(bornAge, day, startYear);
  const merged = applyRoster({
    ...base,
    ...raw,
    version: 2,
    day,
    nick: typeof raw.nick === "string" && raw.nick.trim() ? raw.nick.trim().slice(0, 16) : "You",
    fullName: typeof raw.fullName === "string" && raw.fullName.trim() ? raw.fullName.trim().slice(0, 28) : "You",
    age,
    bornAge,
    startYear,
    gender: raw.gender === "female" ? "female" : "male",
    death: raw.death === "off" ? "off" : "standard",
    level: raw.level === "hardcore" ? "hardcore" : "standard",
    taxes: raw.taxes === "heavy" ? "heavy" : "standard",
    sandbox: raw.sandbox === true,
    homeTier: raw.homeTier === 1 || raw.homeTier === 2 ? raw.homeTier : 0,
    software: raw.software === 1 || raw.software === 2 ? raw.software : 0,
    beats: Array.isArray(raw.beats) ? raw.beats.slice(-24) : [],
    band: bandFrom(raw.band),
    gigs: gigsFrom(raw.gigs),
    business: bizFrom(raw.business),
    look: LOOKS.some((item) => item.id === raw.look) ? raw.look : "hoodie",
    week: Math.max(1, Math.ceil(day / 7)),
    hype: raw.hype ?? 10,
    reputation: raw.reputation ?? clamp(Math.round((raw.fame ?? 0) / 2), 4, 80),
    tracks,
    npc,
    chart,
    label,
    mail: raw.mail ?? [],
    relations: raw.relations ?? {},
    lifestyle: {
      jewelry: raw.lifestyle?.jewelry ?? 0,
      car: raw.lifestyle?.car ?? 0,
      house: raw.lifestyle?.house ?? 0,
      distributor: raw.lifestyle?.distributor ?? 0,
      ink: raw.lifestyle?.ink ?? 0,
    },
    merch: { ...emptyMerch(), ...(raw.merch ?? {}) },
    books: { ...emptyBooks(), ...(raw.books ?? {}) },
    loan: raw.loan ?? null,
    desk: raw.desk ?? null,
    school: raw.school && raw.school.left > 0 ? raw.school : null,
    job: jobFrom(raw.job),
    degree: degreeFrom(raw.degree),
    degrees: degreesFrom(raw.degrees),
    pathDays: pathDaysFrom(raw.pathDays),
    staff: { engineer: raw.staff?.engineer === true, booker: raw.staff?.booker === true },
    platforms: { ...emptyPlatforms(), ...(raw.platforms ?? {}) },
    media: mediaFrom(raw.media, { fans: raw.fans ?? 0, streams: raw.streams ?? 0 }),
    showBooked: raw.showBooked === true,
    tourBooked: raw.tourBooked === true,
    rack: { ...emptyRack(), ...(raw.rack ?? {}) },
    gear: {
      mic: raw.gear?.mic ?? 0,
      studio: raw.gear?.studio ?? 0,
      wardrobe: raw.gear?.wardrobe ?? 0,
      manager: raw.gear?.manager === true,
    },
    industry: raw.industry ?? { loyal: 8, generous: 6, respected: 4, difficult: 0, controversial: 0, fake: 0 },
    trade: tradeFrom(raw.trade),
  });
  return openCircle(merged, !Array.isArray(raw.met));
}

export function monthlyBills(c: { homeTier?: number }) {
  const home = HOMES.find((row) => row.tier === (c.homeTier ?? 0)) ?? HOMES[0]!;
  return { food: 100, rent: home.month, home: home.name, quality: home.quality };
}

export function rentFor(c: Pick<Career, "pace" | "day"> & { homeTier?: number; level?: Career["level"] }) {
  const hard = c.pace === "relentless" || c.level === "hardcore";
  if (!hard && c.day <= 7) return 0;
  if (c.day % 7 !== 0) return 0;
  const bills = monthlyBills(c);
  const week = Math.round((bills.food + bills.rent) / 4);
  return hard ? Math.round(week * 1.35) : week;
}

export function nightsUntilRent(c: Pick<Career, "pace" | "day"> & { level?: Career["level"] }) {
  const hard = c.pace === "relentless" || c.level === "hardcore";
  if (!hard && c.day < 7) return 7 - c.day;
  if (c.day % 7 === 0) return 0;
  return 7 - (c.day % 7);
}

function feedItem(week: number, title: string, body: string, tone: Tone): FeedItem {
  return { id: uid(), week, title, body, tone };
}

const AWARD_DEFS: { id: string; name: string; loud: boolean; test: (c: Career) => boolean }[] = [
  { id: "first", name: "First song out", loud: false, test: (c) => c.tracks.some((t) => t.status === "out") },
  { id: "five", name: "Five songs out", loud: false, test: (c) => c.tracks.filter((t) => t.status === "out").length >= 5 },
  { id: "charted", name: "On the Hot 100", loud: true, test: (c) => c.bestRank != null && c.bestRank <= 10 },
  { id: "million", name: "A million plays", loud: true, test: (c) => c.streams >= 1_000_000 },
];

export function gradeLabel(q: number): string {
  if (q < 30) return "Rough";
  if (q < 45) return "Okay";
  if (q < 60) return "Solid";
  if (q < 75) return "Strong";
  return "Hot";
}

/** Gold badge on a song. 8 reads as 0-1. 46 reads as 4-5. */
export function qualityBand(q: number): string {
  const low = Math.max(0, Math.min(9, Math.floor(q / 10)));
  const high = Math.min(10, low + 1);
  return `${low}-${high}`;
}

export function audience(c: {
  fans: number;
  streams: number;
  tracks: { status: string; lastNight: number }[];
}): { n: number; label: "followers" | "listeners" } {
  if (c.streams <= 0) return { n: c.fans, label: "followers" };
  const night = c.tracks.reduce((sum, t) => sum + (t.status === "out" ? t.lastNight : 0), 0);
  return { n: Math.max(c.fans, night), label: "listeners" };
}

function finalize(c: Career): Career {
  const fresh = AWARD_DEFS.filter((a) => !c.awards.includes(a.id) && a.test(c));
  if (fresh.length === 0) return c;
  const awards = [...c.awards, ...fresh.map((a) => a.id)];
  const awardLog = [
    ...fresh.map((a) => ({ id: a.id, name: a.name, week: c.week })),
    ...c.awardLog,
  ].slice(0, 24);
  const loud = fresh.find((a) => a.loud);
  return {
    ...c,
    awards,
    awardLog,
    feed: loud
      ? [feedItem(c.week, loud.name, "That one stays on the wall.", "good"), ...c.feed].slice(0, 28)
      : c.feed,
  };
}

function say(c: Career, title: string, body: string, tone: Tone, blocking = false): Career {
  return finalize({
    ...c,
    feed: [feedItem(c.week, title, body, tone), ...c.feed].slice(0, 28),
    lastResult: { title, body, tone, blocking },
  });
}

export type StartSeed = { name: string; title: string; fee: number; heat: number };

export type StartInput = {
  look: LookId;
  city: string;
  path: PathId;
  pace: Pace;
  nick?: string;
  fullName?: string;
  age?: number;
  year?: number;
  gender?: "male" | "female";
  death?: "standard" | "off";
  level?: "standard" | "hardcore";
  taxes?: "standard" | "heavy";
  sandbox?: boolean;
  /** A chosen artist pack. Does not turn Creator mode on. */
  artists?: StartSeed[];
  creator?: {
    artists: StartSeed[];
    cash: number;
    fans: number;
    hype: number;
    reputation: number;
    skill: number;
  };
};

export type DeskPatch = {
  cash: number;
  fans: number;
  hype: number;
  reputation: number;
  skill: number;
  fillEnergy: boolean;
  train: boolean;
};

function houseSeeds(): StartSeed[] {
  return ROSTER.map((artist) => ({
    name: artist.name,
    title: artist.title,
    fee: starFee(artist.heat),
    heat: artist.heat,
  }));
}

function seedNpcs(seeds: StartSeed[]): Npc[] {
  return seeds.slice(0, 30).map((artist, i) => ({
    name: artist.name,
    title: artist.title,
    score: clamp(Math.round(artist.heat), 10, 99),
    weeksOn: 1,
    peak: i + 1,
    mood: 0,
    fee: clamp(Math.round(artist.fee), 0, 500_000),
  }));
}

function chartKey(name: string, title: string) {
  return `${name}|${title}`;
}

function makeChart(
  npc: Npc[],
  player: { name: string; title: string; score: number; weeks: number; peak: number } | null,
  lastRanks: Record<string, number>,
  fresh: boolean,
): { chart: ChartRow[]; lastRanks: Record<string, number> } {
  const rows: { name: string; title: string; score: number; you: boolean; weeks: number; peak: number }[] = npc.map((n) => ({
    name: n.name,
    title: n.title,
    score: n.score,
    you: false,
    weeks: n.weeksOn,
    peak: n.peak,
  }));
  if (player) {
    rows.push({ name: player.name.trim().slice(0, 16) || "You", title: player.title, score: player.score, you: true, weeks: player.weeks, peak: player.peak });
  }
  rows.sort((a, b) => b.score - a.score);
  const top = rows.slice(0, 10);
  const nextRanks: Record<string, number> = {};
  const chart: ChartRow[] = top.map((row, i) => {
    const rank = i + 1;
    const key = chartKey(row.name, row.title);
    nextRanks[key] = rank;
    const prev = lastRanks[key];
    return {
      rank,
      name: row.name,
      title: row.title,
      score: row.score,
      you: row.you,
      move: fresh || prev == null ? null : prev - rank,
      weeks: row.you ? row.weeks : Math.max(1, row.weeks),
      peak: row.you ? Math.min(row.peak, rank) : Math.min(row.peak || rank, rank),
    };
  });
  return { chart, lastRanks: nextRanks };
}

function placeBoard(npc: Npc[], player: { name?: string; title: string; score: number; weeks: number; peak: number } | null) {
  const named = player ? { name: player.name?.trim() || "You", title: player.title, score: player.score, weeks: player.weeks, peak: player.peak } : null;
  const board = makeChart(npc, named, {}, true);
  const placed = npc.map((n) => {
    const row = board.chart.find((r) => !r.you && r.name === n.name);
    return row ? { ...n, weeksOn: 1, peak: row.rank } : { ...n, weeksOn: 0, peak: 99 };
  });
  return { npc: placed, chart: board.chart, lastRanks: board.lastRanks };
}

function standing(c: Career) {
  const live = c.tracks.filter((t) => t.status === "out" && t.kind !== "video");
  const hottest = [...live].sort((a, b) => b.lastNight - a.lastNight || b.streams - a.streams)[0];
  if (!hottest || (hottest.lastNight < 40 && hottest.streams < 80)) return null;
  const night = Math.max(hottest.lastNight, 40);
  return {
    title: hottest.title,
    score: clamp(
      Math.round(hottest.quality * 0.38 + Math.log10(night + 10) * 16 + c.hype * 0.18 + c.reputation * 0.08),
      8,
      99,
    ),
    weeks: hottest.weeksLive,
    peak: hottest.peak ?? 99,
  };
}

export function chartBid(c: Career) {
  const row = standing(c);
  if (!row) return null;
  return { title: row.title, score: row.score, weeks: row.weeks };
}

export function applyRoster(c: Career): Career {
  if (!c.started || !isLegacyRoster(c.npc.map((n) => n.name))) return c;
  const stood = standing(c);
  const board = placeBoard(seedNpcs(houseSeeds()), stood ? { ...stood, name: c.nick } : null);
  return {
    ...c,
    npc: board.npc,
    chart: board.chart,
    lastRanks: board.lastRanks,
    relations: {},
    mail: c.mail.filter((m) => m.kind !== "feature" && m.kind !== "order"),
  };
}

export function startCareer(input: StartInput): Career {
  const look = lookOf(input.look);
  const city = cityOf(input.city);
  const made = input.creator;
  const skills: Skills = made
    ? { ...PATHS[input.path].skills }
    : { flow: 1, pen: 1, vocals: 1, prod: 1, stage: 1, biz: 1 };
  if (made) {
    skills[look.bonus] = bump(skills[look.bonus], 6);
    const lift = clamp(Math.round(made.skill), 0, 40);
    (Object.keys(skills) as (keyof Skills)[]).forEach((key) => {
      skills[key] = bump(skills[key], lift);
    });
  }
  const custom = input.artists && input.artists.length >= 4 ? input.artists : null;
  const seeds = custom ?? (made && made.artists.length >= 4 ? made.artists : houseSeeds());
  const board = placeBoard(seedNpcs(seeds), null);
  const hard = input.level === "hardcore" || input.pace === "relentless";
  const maxEnergy = hard ? 80 : 100;
  const cash = made ? clamp(Math.round(made.cash), 0, 50_000_000) : hard ? 480 : 750;
  const nick = (input.nick ?? "").trim().replace(/\s+/g, " ").slice(0, 16) || "You";
  const fullName = (input.fullName ?? "").trim().replace(/\s+/g, " ").slice(0, 28) || nick;
  const base = blankCareer();
  return openCircle({
    ...base,
    started: true,
    look: look.id,
    city: city.id,
    path: input.path,
    pace: input.pace,
    creator: !!made || input.sandbox === true,
    sandbox: input.sandbox === true || !!made,
    cash,
    fans: made ? clamp(Math.round(made.fans), 0, 50_000_000) : 12,
    hype: made ? clamp(Math.round(made.hype), 0, 100) : 0,
    reputation: made ? clamp(Math.round(made.reputation), 0, 100) : hard ? 35 : 50,
    energy: maxEnergy,
    maxEnergy,
    skills,
    npc: board.npc,
    chart: board.chart,
    lastRanks: board.lastRanks,
    nick,
    fullName,
    age: clamp(Math.round(input.age ?? 16), 16, 80),
    bornAge: clamp(Math.round(input.age ?? 16), 16, 80),
    startYear: clamp(Math.round(input.year ?? 2026), 1972, 2026),
    gender: input.gender === "female" ? "female" : "male",
    death: input.death === "off" ? "off" : "standard",
    level: input.level === "hardcore" ? "hardcore" : "standard",
    taxes: input.taxes === "heavy" ? "heavy" : "standard",
    seenIntro: false,
  }, true);
}

export function applyDesk(c: Career, patch: DeskPatch): Career {
  const skills = { ...c.skills };
  const lift = patch.train ? 8 : clamp(Math.round(patch.skill), 0, 40);
  if (lift > 0) {
    (Object.keys(skills) as (keyof Skills)[]).forEach((key) => {
      skills[key] = bump(skills[key], lift);
    });
  }
  return {
    ...c,
    cash: clamp(Math.round(patch.cash), 0, 50_000_000),
    fans: clamp(Math.round(patch.fans), 0, 50_000_000),
    hype: clamp(Math.round(patch.hype), 0, 100),
    reputation: clamp(Math.round(patch.reputation), 0, 100),
    energy: patch.fillEnergy ? c.maxEnergy : c.energy,
    skills,
    lastResult: { title: "Creator", body: "Numbers are in. Songs still have to be made.", tone: "neutral", blocking: false },
  };
}

export function installPack(c: Career, artists: StartSeed[]): Career {
  const seeds = artists.length >= 4 ? artists : houseSeeds();
  const stood = standing(c);
  const board = placeBoard(seedNpcs(seeds), stood ? { ...stood, name: c.nick } : null);
  return say(
    { ...c, npc: board.npc, chart: board.chart, lastRanks: board.lastRanks, relations: {}, mail: c.mail.filter((m) => m.kind !== "feature" && m.kind !== "order") },
    "Chart rewritten",
    "The board is the pack you loaded. Old favors are gone.",
    "neutral",
  );
}

function songTitle(taken: string[]) {
  for (let i = 0; i < 24; i++) {
    const title = `${pick(TITLE_LEFT)} ${pick(TITLE_RIGHT)}`;
    if (!taken.some((name) => name.toLowerCase() === title.toLowerCase())) return title;
  }
  return `Untitled ${taken.length + 1}`;
}

function best(tracks: Track[], status: Track["status"]) {
  return [...tracks].reverse().find((t) => t.status === status && t.kind !== "album");
}

function newestOut(tracks: Track[]) {
  return [...tracks].reverse().find((t) => t.status === "out");
}

function promoCost(tracks: Track[]) {
  const target = [...tracks].reverse().find((t) => t.status === "master" || t.status === "out");
  const step = PROMO_STEPS[Math.min(target?.promo ?? 0, PROMO_STEPS.length - 1)];
  return step?.cost ?? COSTS.promo;
}

export function preview(c: Career, id: ActionId): { ok: boolean; reason: string; detail: string } {
  const cost = id === "promo" ? promoCost(c.tracks) : COSTS[id];
  if (id !== "eat" && c.energy < cost) return { ok: false, reason: `Need ${cost} energy. You have ${c.energy}.`, detail: "" };
  if (id === "write") {
    const waiting = c.tracks.filter((t) => t.status !== "out").length;
    if (waiting >= 6) return { ok: false, reason: "Six songs are still sitting here.", detail: "" };
    return { ok: true, reason: "", detail: "A draft. The real session is the plus." };
  }
  if (id === "record") {
    const draft = best(c.tracks, "draft");
    if (!draft) return { ok: false, reason: "Nothing to record.", detail: "" };
    return { ok: true, reason: "", detail: draft.title };
  }
  if (id === "drop") {
    const master = best(c.tracks, "master");
    if (!master) return { ok: false, reason: "Nothing is ready.", detail: "" };
    return { ok: true, reason: "", detail: master.title };
  }
  if (id === "promo") {
    const target = [...c.tracks].reverse().find((t) => (t.status === "master" || t.status === "out") && t.kind !== "album");
    if (!target) return { ok: false, reason: "Record a song before you can push it.", detail: "" };
    if (target.promo >= PROMO_STEPS.length) return { ok: false, reason: "That push is finished.", detail: "" };
    if (c.energy < PROMO_STEPS[target.promo]!.cost) {
      return { ok: false, reason: `Need ${PROMO_STEPS[target.promo]!.cost} energy.`, detail: "" };
    }
    return { ok: true, reason: "", detail: PROMO_STEPS[target.promo]!.name };
  }
  if (id === "post") return { ok: true, reason: "", detail: "A post, not a song" };
  if (id === "rehearse") return { ok: true, reason: "", detail: "Stage and flow" };
  if (id === "show") {
    const venue = venueFor(c.fame);
    if (!c.tracks.some((t) => (t.status === "out" || t.status === "master") && t.kind !== "album")) {
      return { ok: false, reason: "You need a song to play.", detail: "" };
    }
    if (!c.showBooked && c.fame < venue.need) return { ok: false, reason: `${venue.name} isn't booking you yet.`, detail: "" };
    return { ok: true, reason: "", detail: c.showBooked ? `${venue.name} · booked` : venue.name };
  }
  if (id === "visual") {
    const target = newestOut(c.tracks) ?? best(c.tracks, "master");
    if (!target) {
      const draft = best(c.tracks, "draft");
      return { ok: false, reason: draft ? "Record it first." : "Need a song first.", detail: "" };
    }
    if (target.visual) return { ok: false, reason: "That song has a video.", detail: "" };
    return { ok: true, reason: "", detail: target.title };
  }
  if (id === "beat") return { ok: true, reason: "", detail: "Lease it out" };
  if (id === "shift") return { ok: true, reason: "", detail: "Pays cash · 14 energy" };
  if (id === "eat") {
    if (c.energy >= c.maxEnergy) return { ok: false, reason: "You are not hungry.", detail: "" };
    if (c.cash < PLATE) return { ok: false, reason: `A plate is ${money(PLATE)}.`, detail: "" };
    return { ok: true, reason: "", detail: `Street plate · ${money(PLATE)}` };
  }
  if (c.label) return { ok: false, reason: `Signed to ${c.label.name}.`, detail: "" };
  if (c.mail.some((m) => m.kind === "label")) return { ok: false, reason: "An offer is already in the mail.", detail: "" };
  if (!c.tracks.some((t) => t.status === "out")) return { ok: false, reason: "Put a song out first.", detail: "" };
  if (c.fame < 22) return { ok: false, reason: "Labels want more buzz. Chart, post, or play a room.", detail: "" };
  if (c.skills.biz < 18) return { ok: false, reason: "Train Business before you pitch.", detail: "" };
  return { ok: true, reason: "", detail: "Ask for a contract" };
}

function spend(c: Career, cost: number): Career | null {
  if (c.energy < cost) return null;
  return { ...c, energy: c.energy - cost };
}

export type FeatAsk = { name: string; cut: number };

export type Session = {
  title: string;
  style: string;
  theme: string;
  feats: FeatAsk[];
  pen: number;
  prod: number;
  studio: number;
  instrument?: string;
};

export type SessionQuote = {
  lyricName: string;
  lyricRating: number;
  lyricPrice: number;
  prodName: string;
  prodRating: number;
  prodPrice: number;
  studioName: string;
  studioRating: number;
  studioPrice: number;
  feats: { name: string; cut: number; price: number; heat: number; refused?: string }[];
  featCost: number;
  total: number;
  yours: number;
  energy: number;
  penSelf: boolean;
  prodSelf: boolean;
};

export function featPrice(base: number, cutPct: number) {
  const share = clamp(Math.round(cutPct), 0, 80) / 100;
  return Math.max(0, Math.round(Math.max(0, base) * (1 - share * 0.4)));
}

function lyricTen(skills: Skills) {
  return oneDecimal((skills.pen * 0.55 + skills.flow * 0.3 + skills.vocals * 0.15) / 10);
}

function heatFor(name: string, npc: { name: string; score: number }) {
  const known = ROSTER.find((artist) => artist.name === name);
  if (known) return known.heat;
  return clamp(Math.round(npc.score), 20, 99);
}

export function quoteSession(
  c: Pick<Career, "skills" | "nick" | "gear" | "npc" | "path" | "staff"> & {
    rack?: Rack;
    software?: number;
    homeTier?: number;
    bonds?: Career["bonds"];
    met?: Career["met"];
    fame?: number;
    industry?: Career["industry"];
    circleAsk?: Career["circleAsk"];
    day?: number;
  },
  raw: Session,
): SessionQuote {
  const pen = LYRIC_DESKS[clamp(raw.pen, 0, LYRIC_DESKS.length - 1)] ?? LYRIC_DESKS[0];
  const prod = PROD_DESKS[clamp(raw.prod, 0, PROD_DESKS.length - 1)] ?? PROD_DESKS[0];
  const studio = ROOM_DESKS[clamp(raw.studio, 0, ROOM_DESKS.length - 1)] ?? ROOM_DESKS[0];
  const penSelf = raw.pen <= 0;
  const prodSelf = raw.prod <= 0;
  let room = 80;
  const seen = new Set<string>();
  const feats: SessionQuote["feats"] = [];
  for (const ask of raw.feats.slice(0, 3)) {
    const npc = c.npc.find((artist) => artist.name === ask.name);
    if (!npc || seen.has(npc.name)) continue;
    seen.add(npc.name);
    const cut = clamp(Math.round(ask.cut) || 0, 0, room);
    room -= cut;
    const deal = versePrice(
      {
        npc: c.npc,
        bonds: c.bonds ?? {},
        met: c.met ?? c.npc.map((row) => row.name),
        fame: c.fame ?? 0,
        industry: c.industry ?? { loyal: 0, generous: 0, respected: 0, difficult: 0, controversial: 0, fake: 0 },
        circleAsk: c.circleAsk ?? null,
        day: c.day ?? 1,
      },
      npc.name,
      cut,
    );
    feats.push({ name: npc.name, cut, price: deal.price, heat: heatFor(npc.name, npc), refused: deal.refused || undefined });
  }
  const lyricPrice = pen.price;
  const prodPrice = prod.price;
  const studioPrice = studio.price;
  const featCost = feats.reduce((sum, feat) => sum + feat.price, 0);
  const cutSum = feats.reduce((sum, feat) => sum + feat.cut, 0);
  return {
    lyricName: penSelf ? c.nick || "You" : pen.name,
    lyricRating: penSelf ? lyricTen(c.skills) : pen.rating,
    lyricPrice,
    prodName: prodSelf ? c.nick || "You" : prod.name,
    prodRating: prodSelf ? oneDecimal(c.skills.prod / 10 + (c.software ?? 0) * 0.35) : prod.rating,
    prodPrice,
    studioName: studio.name,
    studioRating: raw.studio <= 0 ? oneDecimal(roomRating(c.gear, c.rack) + (c.homeTier ?? 0) * 0.4) : studio.rating,
    studioPrice,
    feats,
    featCost,
    total: lyricPrice + prodPrice + studioPrice + featCost,
    yours: 100 - cutSum,
    energy: SESSION_ENERGY,
    penSelf,
    prodSelf,
  };
}

export function compose(c: Career, raw: Session): Career {
  const quote = quoteSession(c, raw);
  const blocked = quote.feats.find((feat) => feat.refused);
  if (blocked) return say(c, "No", blocked.refused || "They won't get on this song.", "bad");
  const waiting = c.tracks.filter((track) => track.status !== "out" && track.kind !== "album").length;
  if (waiting >= 6) {
    return say(c, "Notebook is full", "Six songs are still sitting here. Release one before you cut another.", "neutral");
  }
  if (c.energy < quote.energy) {
    return say(c, "Not enough hours", `Making the song takes ${quote.energy} energy. You have ${c.energy}. Sleep, then come back.`, "bad");
  }
  if (c.cash < quote.total) {
    return say(
      c,
      "Short",
      `This session is ${money(quote.total)}. You have ${money(c.cash)}. Drop a feature, write it yourself, or use your own room.`,
      "bad",
    );
  }
  const style = STYLES.includes(raw.style as (typeof STYLES)[number]) ? raw.style : STYLES[0];
  const theme = THEMES.includes(raw.theme as (typeof THEMES)[number]) ? raw.theme : THEMES[0];
  const rap = style === "Hip-Hop" || style === "Trap" || style === "Drill" || style === "Afrobeats";
  const page = style === "R&B" || style === "Soul" || style === "Reggae" || style === "Pop" || style === "Blues";
  const styleFit = c.path === "rapper" && rap ? 4 : c.path === "writer" && page ? 4 : c.path === "producer" ? 2 : 0;
  const themeFit =
    (theme === "Love" || theme === "Heartbreak") && c.skills.vocals >= 24
      ? 3
      : (theme === "Street" || theme === "Night" || theme === "Money") && c.path === "rapper"
        ? 2
        : 1;
  const featBoost = quote.feats.reduce((sum, feat) => sum + Math.round(feat.heat / 45), 0);
  const engineer = c.staff?.engineer ? 4 : 0;
  const rawScore = quote.lyricRating * 4.2 + quote.prodRating * 3.3 + quote.studioRating * 2.5;
  const played = raw.instrument && raw.instrument !== "None" ? 2 : 0;
  let quality = clamp(Math.round(rawScore + styleFit + themeFit + featBoost + engineer + played + rand(0, 6)), 8, 99);
  let chemNote = "";
  if (quote.feats.length) {
    const chem = Math.round(quote.feats.reduce((sum, feat) => sum + chemistryBetween(c, feat.name), 0) / quote.feats.length);
    quality = clamp(quality + Math.round((chem - 50) / 10), 8, 99);
    chemNote = ` Chemistry ${chem}.`;
  }
  const typed = raw.title.trim().replace(/\s+/g, " ").slice(0, 28);
  const title = typed || songTitle(c.tracks.map((track) => track.title));
  const track = emptyTrack({ title, status: "master", quality });
  const cutPct = quote.feats.reduce((sum, feat) => sum + feat.cut, 0);
  track.feat = quote.feats.length ? quote.feats.map((feat) => feat.name).join(", ") : null;
  track.featCut = cutPct / 100;
  track.style = style;
  track.theme = theme;
  track.made = c.day;
  const lyricBump = quote.penSelf ? (c.path === "writer" ? 2 : 1) : 0;
  const flowBump = c.path === "rapper" ? 1 : 0;
  const prodBump = quote.prodSelf ? (c.path === "producer" ? 2 : 1) : 0;
  track.parts = {
    lyrics: quote.lyricRating,
    flow: oneDecimal(c.skills.flow / 10),
    voice: oneDecimal(c.skills.vocals / 10),
    prod: quote.prodRating,
    studio: quote.studioRating,
    lyricGain: lyricBump,
    flowGain: flowBump,
    voiceGain: 1,
    prodGain: prodBump,
  };
  const circled = markCollab(c, quote.feats.map((feat) => feat.name));
  const usedAsk = c.circleAsk && quote.feats.some((feat) => feat.name === c.circleAsk!.name) ? c.circleAsk : null;
  if (usedAsk && usedAsk.cut > 0) track.featCut = Math.min(0.8, track.featCut + usedAsk.cut / 100);
  const kept = quote.feats.length ? ` They keep ${Math.round(track.featCut * 100)}% of this song.` : "";
  const band = qualityBand(quality);
  return say(
    {
      ...circled,
      cash: c.cash - quote.total,
      energy: c.energy - quote.energy,
      books: addBooks(c.books, { expenses: quote.total }),
      hype: clamp(c.hype + 2, 0, 100),
      circleAsk: usedAsk ? null : c.circleAsk,
      tracks: [...c.tracks, track],
      skills: {
        ...c.skills,
        pen: quote.penSelf ? bump(c.skills.pen, lyricBump) : c.skills.pen,
        flow: bump(c.skills.flow, flowBump),
        vocals: bump(c.skills.vocals, 1),
        prod: quote.prodSelf ? bump(c.skills.prod, prodBump) : c.skills.prod,
      },
    },
    title,
    `${style} & ${theme}. Badge ${band}. ${money(quote.total)} and ${quote.energy} energy.${kept}${chemNote} Open it to drill a part or pick a Friday.`,
    quality >= 55 ? "good" : "neutral",
  );
}

const PART_SKILL: Record<PartKey, keyof Skills> = { lyrics: "pen", flow: "flow", voice: "vocals", prod: "prod" };
const PART_GAIN: Record<PartKey, keyof Pick<SongParts, "lyricGain" | "flowGain" | "voiceGain" | "prodGain">> = {
  lyrics: "lyricGain",
  flow: "flowGain",
  voice: "voiceGain",
  prod: "prodGain",
};

export function drillPart(c: Career, id: string, key: PartKey): Career {
  const track = c.tracks.find((item) => item.id === id);
  if (!track) return c;
  if (track.status === "out" || track.kind === "album") return say(c, "Too late", "That one is already in the count.", "neutral");
  const cost = PART_ENERGY[key];
  if (c.energy < cost) return say(c, "Too tired", `That pass is ${cost} energy. You have ${c.energy}.`, "bad");
  const parts = { ...emptyParts(), ...track.parts };
  if (parts[key] >= 10) return say(c, "Maxed", "That part of the song is as high as it goes.", "neutral");
  const nextParts: SongParts = { ...parts, [key]: oneDecimal(Math.min(10, parts[key] + 0.8)) };
  nextParts[PART_GAIN[key]] = parts[PART_GAIN[key]] + 2;
  const skillKey = PART_SKILL[key];
  const quality = clamp(Math.round(track.quality + (partsScore(nextParts) - partsScore(parts))), 1, 99);
  return say(
    {
      ...c,
      energy: c.energy - cost,
      skills: { ...c.skills, [skillKey]: bump(c.skills[skillKey], 1) },
      tracks: c.tracks.map((item) => (item.id === id ? { ...item, parts: nextParts, quality } : item)),
    },
    track.title,
    `${key} is ${nextParts[key].toFixed(1)}. ${cost} energy.`,
    "good",
  );
}

export function scheduleDrop(c: Career, id: string, day: number): Career {
  const track = c.tracks.find((item) => item.id === id);
  if (!track) return c;
  if (track.status === "out") return say(c, "Already out", "That one is already in the morning count.", "neutral");
  if (track.kind === "album" && !c.tracks.some((item) => item.albumOf === id)) {
    return say(c, "Empty album", "Add a song before you date it.", "neutral");
  }
  const when = clamp(Math.round(day), c.day + 1, c.day + 21);
  if (track.dropOn === when) return c;
  const announced = track.dropOn == null;
  return say(
    {
      ...c,
      hype: announced ? clamp(c.hype + 6, 0, 100) : c.hype,
      tracks: c.tracks.map((item) => (item.id === id ? { ...item, status: "master", dropOn: when } : item)),
    },
    track.title,
    `Drops ${dateLabel(when, c.startYear || undefined)}. It joins the count the morning you wake up that day. Friday is when the chart moves.`,
    "good",
  );
}

export function filmSong(c: Career, id: string): Career {
  const track = c.tracks.find((item) => item.id === id);
  if (!track || track.kind === "album") return say(c, "Not a song", "Pick a song.", "neutral");
  if (track.status === "draft") return say(c, "Not cut", "Record it before you shoot.", "neutral");
  if (track.visual) return say(c, "Already shot", `${track.title} has a video.`, "neutral");
  const next = spend(c, COSTS.visual);
  if (!next) return say(c, "Out of hours", `A video is ${COSTS.visual} energy.`, "bad");
  return say(
    {
      ...next,
      videos: next.videos + 1,
      hype: clamp(next.hype + 6, 0, 100),
      fans: next.fans + 12,
      media: creditYouTube(next, 4, 120),
      tracks: next.tracks.map((item) => (item.id === id ? { ...item, visual: true } : item)),
    },
    track.title,
    `Video is up. ${COSTS.visual} energy. That song plays harder in the morning.`,
    "good",
  );
}

export function deleteTrack(c: Career, id: string): Career {
  const track = c.tracks.find((item) => item.id === id);
  if (!track) return c;
  if (track.status === "out") return say(c, "It's out", "You can't pull a song that's already in the count.", "neutral");
  return say(
    {
      ...c,
      tracks: c.tracks.filter((item) => item.id !== id).map((item) => (item.albumOf === id ? { ...item, albumOf: null } : item)),
    },
    "Deleted",
    `${track.title} is gone. The money you already spent stays spent.`,
    "neutral",
  );
}

export function makeAlbum(c: Career, title: string): Career {
  const open = c.tracks.filter((item) => item.kind === "album" && item.status !== "out").length;
  if (open >= 4) return say(c, "Enough albums", "Date one of the albums already sitting here.", "neutral");
  const name = title.trim().replace(/\s+/g, " ").slice(0, 28) || "Me";
  const track = emptyTrack({ title: name, status: "master", quality: 1 });
  track.kind = "album";
  return say({ ...c, tracks: [...c.tracks, track] }, name, "Empty album. Open a song and add it, then pick a date.", "neutral");
}

export function fileOnAlbum(c: Career, songId: string, albumId: string, title = "The Record"): Career {
  const song = c.tracks.find((item) => item.id === songId);
  if (!song) return c;
  if (song.kind !== "single") return say(c, "Not a single", "Albums take songs.", "neutral");
  if (song.status === "out") return say(c, "Already out", "That song is already in the count on its own.", "neutral");
  let next = c;
  let target = albumId;
  if (!target) {
    const open = c.tracks.filter((item) => item.kind === "album" && item.status !== "out").length;
    if (open >= 4) return say(c, "Enough albums", "Date one of the albums already sitting here.", "neutral");
    next = makeAlbum(c, title);
    const created = [...next.tracks].reverse().find((item) => item.kind === "album" && item.status !== "out");
    if (!created) return next;
    target = created.id;
  }
  const album = next.tracks.find((item) => item.id === target);
  if (!album || album.kind !== "album") return say(next, "No album", "That album isn't here.", "neutral");
  if (album.status === "out") return say(next, "Already out", "That album is already in the count.", "neutral");
  return say(
    { ...next, tracks: next.tracks.map((item) => (item.id === songId ? { ...item, albumOf: target } : item)) },
    album.title,
    `${song.title} is on ${album.title}.`,
    "neutral",
  );
}

/** A feature added after the song exists. Cash only. Cut is a percent of this song, 0–80, and stacks. */
export function addFeat(c: Career, id: string, name: string, cutPct: number): Career {
  const track = c.tracks.find((item) => item.id === id);
  if (!track) return c;
  if (track.status === "out" || track.kind !== "single") {
    return say(c, "Too late", "Features go on a song that isn't out yet.", "neutral");
  }
  const names = (track.feat ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (names.length >= 3) return say(c, "Full", "Three features is the cap.", "neutral");
  if (names.some((known) => known.toLowerCase() === name.toLowerCase())) {
    return say(c, "Already on it", `${name} is already on ${track.title}.`, "neutral");
  }
  const npc = c.npc.find((artist) => artist.name === name);
  if (!npc) return say(c, "Who?", "That name isn't on the roster.", "neutral");
  const existing = track.featCut > 1 ? track.featCut / 100 : track.featCut;
  const room = Math.max(0, Math.round((0.8 - existing) * 100));
  const cut = clamp(Math.round(cutPct), 0, room);
  const deal = versePrice(c, name, cut);
  if (deal.refused) return say(c, "No", deal.refused, "bad");
  const price = deal.price;
  if (c.cash < price) {
    return say(c, "Short", `${npc.name} is ${money(price)} at ${cut}%. You have ${money(c.cash)}.`, "bad");
  }
  const nextCut = Math.min(0.8, existing + cut / 100);
  const lift = Math.round(heatFor(npc.name, npc) / 50);
  const chem = chemistryBetween(c, npc.name);
  const quality = clamp(track.quality + lift + Math.round((chem - 50) / 12), 1, 99);
  const circled = markCollab({ ...c, circleAsk: c.circleAsk?.name === npc.name ? null : c.circleAsk }, [npc.name]);
  return say(
    {
      ...circled,
      cash: c.cash - price,
      books: addBooks(c.books, { expenses: price }),
      tracks: c.tracks.map((item) =>
        item.id === id ? { ...item, feat: [...names, npc.name].join(", "), featCut: nextCut, quality } : item,
      ),
    },
    npc.name,
    price
      ? `On ${track.title}. They keep ${cut}%. ${money(price)} left today. Chemistry ${chem}. You keep ${Math.round((1 - nextCut) * 100)}% of this song.`
      : `On ${track.title}. They keep ${cut}%. Chemistry ${chem}. You keep ${Math.round((1 - nextCut) * 100)}%.`,
    "good",
  );
}

export function pressAlbum(c: Career, title: string): Career {
  return makeAlbum(c, title);
}

export function act(c: Career, id: ActionId): Career {
  const gate = preview(c, id);
  if (!gate.ok) return say(c, "Not today", gate.reason, "neutral");
  const cost = id === "promo" ? promoCost(c.tracks) : COSTS[id];
  const next = spend(c, cost);
  if (!next) return say(c, "Out of hours", "Sleep, or eat if you can afford a plate.", "bad");

  if (id === "write") {
    const blend = next.skills.pen * 0.45 + next.skills.flow * 0.35 + next.skills.vocals * 0.2;
    const gear = next.gear.mic * 4 + next.gear.studio * 3 + rackScore(next.rack);
    const path = next.path === "writer" ? 6 : next.path === "rapper" ? 3 : 0;
    const quality = clamp(Math.round(blend * 0.72 + gear + path + rand(0, 14)), 8, 99);
    const title = songTitle(next.tracks.map((t) => t.title));
    const track = emptyTrack({ title, status: "draft", quality });
    track.parts = partsFromSkills(next.skills, roomRating(next.gear, next.rack));
    return say(
      {
        ...next,
        hype: clamp(next.hype + 2, 0, 100),
        tracks: [...next.tracks, track],
        skills: {
          ...next.skills,
          pen: bump(next.skills.pen, next.path === "writer" ? 2 : 1),
          flow: bump(next.skills.flow, next.path === "rapper" ? 1 : 0),
        },
      },
      title,
      `Draft saved. Quality ${quality}, ${gradeLabel(quality).toLowerCase()}. The plus button is the full session.`,
      quality >= 55 ? "good" : "neutral",
    );
  }

  if (id === "record") {
    const draft = best(next.tracks, "draft")!;
    const room = next.gear.mic * 5 + next.gear.studio * 3 + rackScore(next.rack);
    const cut = Math.round(next.skills.prod * 0.18);
    const engineer = next.staff?.engineer ? 6 : 0;
    const lift = 4 + room + cut + engineer + (next.path === "producer" ? 2 : 0);
    const quality = clamp(draft.quality + lift + rand(0, 6), 1, 99);
    return say(
      {
        ...next,
        tracks: next.tracks.map((t) => (t.id === draft.id ? { ...t, status: "master", quality } : t)),
        skills: {
          ...next.skills,
          vocals: bump(next.skills.vocals, 1),
          prod: bump(next.skills.prod, next.path === "producer" ? 2 : 1),
        },
      },
      `Ready: ${draft.title}`,
      `Master. Quality ${quality}, ${gradeLabel(quality).toLowerCase()}. Open it and pick a date.`,
      "good",
    );
  }

  if (id === "drop") {
    const master = best(next.tracks, "master")!;
    const label = next.label ? { ...next.label, made: next.label.made + 1 } : null;
    return say(
      {
        ...next,
        label,
        fame: bump(next.fame, 1),
        hype: clamp(next.hype + 14 + master.promo * 3, 0, 100),
        fans: next.fans + 18 + Math.round(master.quality / 5),
        tracks: next.tracks.map((t) => (t.id === master.id ? { ...t, status: "out", weekOut: next.day, dropOn: null } : t)),
      },
      `${master.title} is out`,
      "It's up tonight. Sleep. Plays and pay land in the morning.",
      "good",
    );
  }

  if (id === "promo") {
    const target = [...next.tracks].reverse().find((t) => (t.status === "master" || t.status === "out") && t.kind !== "album")!;
    const step = PROMO_STEPS[Math.min(target.promo, PROMO_STEPS.length - 1)]!;
    const live = target.status === "out";
    return say(
      {
        ...next,
        hype: clamp(next.hype + 4 + target.promo * 2, 0, 100),
        fans: next.fans + 8 + target.promo * 6,
        tracks: next.tracks.map((t) => (t.id === target.id ? { ...t, promo: t.promo + 1 } : t)),
      },
      live ? target.title : step.name,
      live
        ? `${target.title} is already out. Hype moved. The morning already counts it.`
        : `${target.title}. Hype moved. The song still has to be out before the morning counts it.`,
      "good",
    );
  }

  if (id === "post") return finishPost(next, "instagram");

  if (id === "rehearse") {
    return say(
      {
        ...next,
        skills: { ...next.skills, stage: bump(next.skills.stage, 2), flow: bump(next.skills.flow, 1) },
      },
      "Rehearsed",
      "Stage moved. The room pays more when you actually play it.",
      "neutral",
    );
  }

  if (id === "show") {
    const venue = venueFor(next.fame);
    const stageFactor = 0.55 + next.skills.stage / 80;
    const door = Math.round((venue.base + next.fans * 0.02) * stageFactor * (1 + next.gear.wardrobe * 0.08) * cityOf(next.city).scene);
    const merchCut = next.gear.wardrobe * rand(4, 16);
    const room = recordShow(next.trade ?? emptyTrade(), next.day, venue.name, next.fans, next.nick || "You");
    return say(
      {
        ...next,
        cash: next.cash + door + merchCut,
        books: addBooks(next.books, { gross: door + merchCut }),
        fans: next.fans + venue.door,
        fame: bump(next.fame, 1),
        hype: clamp(next.hype + 6, 0, 100),
        shows: next.shows + 1,
        showBooked: false,
        reputation: clamp(next.reputation + 1, 0, 100),
        trade: room.trade,
      },
      venue.name,
      `Door paid ${money(door)}${merchCut ? ` and the table did ${money(merchCut)}` : ""}. ${COSTS.show} energy. ${room.line}`,
      "good",
    );
  }

  if (id === "visual") {
    const target = (newestOut(next.tracks) ?? best(next.tracks, "master"))!;
    return say(
      {
        ...next,
        videos: next.videos + 1,
        hype: clamp(next.hype + 10, 0, 100),
        fans: next.fans + 24,
        media: creditYouTube(next, 6, 240),
        tracks: next.tracks.map((t) => (t.id === target.id ? { ...t, visual: true } : t)),
      },
      target.title,
      "Video is up. That song plays harder in the morning.",
      "good",
    );
  }

  if (id === "beat") {
    const pay = 55 + next.skills.prod * 3 + next.gear.studio * 40 + Math.round(rackScore(next.rack) * 30) + rand(0, 40);
    const titles = ["Late Keys", "Night Loop", "Brass Pocket", "Room 4", "Cold Snare", "Low Choir", "Soft 808"];
    const title = titles[(next.beats?.length ?? 0) % titles.length]!;
    return say(
      {
        ...next,
        cash: next.cash + pay,
        books: addBooks(next.books, { gross: pay }),
        skills: { ...next.skills, prod: bump(next.skills.prod, 1) },
        beats: [...(next.beats ?? []), { id: uid(), title, pay, day: next.day }].slice(-24),
      },
      "Beat leased",
      `${title} went for ${money(pay)}. Not a song of yours.`,
      "neutral",
    );
  }

  if (id === "shift") {
    const pay = 70 + next.skills.biz * 2 + rand(0, 24);
    return say(
      {
        ...next,
        cash: next.cash + pay,
        books: addBooks(next.books, { gross: pay }),
        hype: clamp(next.hype - 2, 0, 100),
      },
      "Shift",
      `${money(pay)}. The job pays. It doesn't move the song.`,
      "neutral",
    );
  }

  if (id === "eat") {
    const gain = Math.min(18, next.maxEnergy - next.energy);
    return say(
      {
        ...next,
        cash: next.cash - PLATE,
        books: addBooks(next.books, { expenses: PLATE }),
        energy: next.energy + gain,
      },
      "Street plate",
      `+${gain} energy. ${money(PLATE)}.`,
      "neutral",
    );
  }

  const name = pick(LABELS);
  const advance = 600 + next.fame * 40 + next.reputation * 10;
  const mail: Mail = {
    id: uid(),
    day: next.day,
    from: name,
    kind: "label",
    title: `${name} sent paper`,
    body: `Advance ${money(advance)}. They want 4 singles in 16 weeks and 25% of the streams.`,
    offer: { name, cut: 0.25, advance, due: 4, weeks: 16 },
  };
  return say({ ...next, mail: [mail, ...next.mail].slice(0, 6) }, "Paper's in", `${name} answered. Read it before you sign.`, "neutral");
}

export function answerMail(c: Career, id: string, yes: boolean): Career {
  const piece = c.mail.find((m) => m.id === id);
  if (!piece) return c;
  const rest = c.mail.filter((m) => m.id !== id);
  if (!yes) return { ...c, mail: rest, lastResult: { title: "Passed", body: piece.title, tone: "neutral", blocking: false } };
  const offer = piece.offer;
  if (piece.kind === "order" && offer) {
    if (c.energy < 10) return say(c, "Too tired", "Delivering the beat is 10 energy.", "bad");
    return say(
      {
        ...c,
        mail: rest,
        energy: c.energy - 10,
        cash: c.cash + offer.advance,
        books: addBooks(c.books, { gross: offer.advance }),
        skills: { ...c.skills, prod: bump(c.skills.prod, 1) },
      },
      "Beat delivered",
      `${offer.name} paid ${money(offer.advance)}. 10 energy.`,
      "good",
    );
  }
  if (piece.kind === "feature" && offer) {
    const master = best(c.tracks, "master") ?? best(c.tracks, "draft");
    if (!master) return say(c, "No song", "Have a song that isn't out yet. This request stays until you can put them on one.", "neutral");
    if (c.energy < 12) return say(c, "Too tired", "A verse is 12 energy.", "bad");
    if (c.cash < offer.advance) return say(c, "Short", `The verse is ${money(offer.advance)}. You have ${money(c.cash)}.`, "bad");
    const names = new Set((master.feat ?? "").split(",").map((s) => s.trim()).filter(Boolean));
    names.add(offer.name);
    const cut = Math.min(0.8, (master.featCut > 1 ? master.featCut / 100 : master.featCut) + offer.cut);
    return say(
      {
        ...c,
        mail: rest,
        energy: c.energy - 12,
        cash: c.cash - offer.advance,
        books: addBooks(c.books, { expenses: offer.advance }),
        relations: { ...c.relations, [offer.name]: clamp((c.relations[offer.name] ?? 0) + 1, -3, 4) },
        tracks: c.tracks.map((t) => (t.id === master.id ? { ...t, feat: [...names].join(", "), featCut: cut } : t)),
      },
      offer.name,
      `They're on ${master.title}. They keep ${Math.round(cut * 100)}%. ${offer.advance ? money(offer.advance) + " left today." : "No fee."}`,
      "good",
    );
  }
  if (piece.kind === "label" && offer) {
    const label: LabelDeal = {
      name: offer.name,
      cut: offer.cut,
      due: offer.due,
      made: c.label?.made ?? c.tracks.filter((t) => t.status === "out").length,
      weeksLeft: offer.weeks,
    };
    return say(
      {
        ...c,
        mail: rest,
        cash: c.cash + offer.advance,
        books: addBooks(c.books, { gross: offer.advance }),
        label,
        fame: bump(c.fame, 4),
        hype: clamp(c.hype + 10, 0, 100),
      },
      `Signed to ${offer.name}`,
      `Advance ${money(offer.advance)}. ${offer.due} singles in ${offer.weeks} weeks. They take ${Math.round(offer.cut * 100)}% and push the record.`,
      "good",
      true,
    );
  }
  if (piece.kind === "event") {
    const tour = piece.title === "Tour offer";
    if (tour) {
      return say(
        { ...c, mail: rest, tourBooked: true },
        "Tour booked",
        "Tour is open under Events. It still spends cash and energy.",
        "neutral",
      );
    }
    const ready = c.tracks.some((t) => (t.status === "out" || t.status === "master") && t.kind !== "album");
    if (!ready) {
      return say(c, "No song", "The invite stays. Record a song, then accept. Play the room opens after that.", "neutral");
    }
    return say(
      { ...c, mail: rest, showBooked: true },
      "Booked",
      "Play the room is open under Events. It still spends energy.",
      "neutral",
    );
  }
  return { ...c, mail: rest, lastResult: null };
}

export function renameTrack(c: Career, id: string, title: string): Career {
  const name = title.trim().replace(/\s+/g, " ").slice(0, 32);
  if (!name) return c;
  if (c.tracks.some((t) => t.id !== id && t.title.toLowerCase() === name.toLowerCase())) {
    return say(c, "Already a song", "Pick a different title.", "neutral");
  }
  const prev = c.tracks.find((t) => t.id === id);
  if (!prev) return c;
  return {
    ...c,
    tracks: c.tracks.map((t) => (t.id === id ? { ...t, title: name } : t)),
    chart: c.chart.map((row) => (row.you && row.title === prev.title ? { ...row, title: name } : row)),
    lastResult: { title: name, body: "Title changed.", tone: "neutral", blocking: false },
  };
}

export function buy(c: Career, item: ShopItem): Career {
  if (item === "manager") {
    if (c.gear.manager) return say(c, "Already covered", "You have a manager.", "neutral");
    const cost = SHOP.manager.cost;
    if (c.cash < cost) return say(c, "Not yet", `${SHOP.manager.name} is ${money(cost)}. You have ${money(c.cash)}.`, "bad");
    return say(
      { ...c, cash: c.cash - cost, books: addBooks(c.books, { expenses: cost }), gear: { ...c.gear, manager: true } },
      "Manager hired",
      "They take calls. A few fans show up every morning even when you don't post.",
      "good",
    );
  }
  const level = c.gear[item];
  if (level >= 2) return say(c, "Maxed", "That lane is finished.", "neutral");
  const offer = SHOP[item][level === 0 ? 0 : 1];
  if (!offer) return c;
  if (c.cash < offer.cost) return say(c, "Not yet", `${offer.name} is ${money(offer.cost)}. You have ${money(c.cash)}.`, "bad");
  const gear: Gear = { ...c.gear, [item]: (level + 1) as 1 | 2 };
  return say({ ...c, cash: c.cash - offer.cost, books: addBooks(c.books, { expenses: offer.cost }), gear }, offer.name, offer.blurb, "good");
}

export function buyRack(c: Career, id: RackId): Career {
  const piece = RACK.find((item) => item.id === id);
  if (!piece) return c;
  const rack: Rack = { ...emptyRack(), ...c.rack };
  const level = rack[id] ?? 0;
  if (level >= 8) return say(c, "Maxed", `${piece.name} doesn't go higher.`, "neutral");
  const cost = piece.base * (level + 1);
  if (c.cash < cost) {
    const [need, have] = moneyPair(cost, c.cash);
    return say(c, "Not yet", `${piece.name} level ${level + 1} is ${need}. You have ${have}.`, "bad");
  }
  rack[id] = level + 1;
  return say(
    { ...c, cash: c.cash - cost, books: addBooks(c.books, { expenses: cost }), rack },
    piece.name,
    `Level ${level + 1}. Your room rates ${rackScore(rack).toFixed(1)}. Songs you cut in your own room use that.`,
    "good",
  );
}

function incoming(c: Career): Mail | null {
  if (c.mail.length >= 4) return null;
  const roll = Math.random();
  if (roll < 0.28 && c.skills.prod >= 12) {
    const pay = 80 + c.skills.prod * 6 + rand(0, 80);
    const who = pick(c.npc).name;
    return {
      id: uid(),
      day: c.day,
      from: who,
      kind: "order",
      title: `Beat order · ${who}`,
      body: `${who} needs a beat. ${money(pay)} if you deliver. Costs 10 energy.`,
      offer: { name: who, cut: 0, advance: pay, due: 1, weeks: 2 },
    };
  }
  if (roll < 0.42 && c.fame >= 8) {
    return {
      id: uid(),
      day: c.day,
      from: "Desk",
      kind: "event",
      title: c.fame >= 30 ? "Tour offer" : "Show tonight",
      body: c.fame >= 30 ? "A tour slot opened. Take it from Events, or pass." : "A room booked you. Take it from Events, or pass.",
    };
  }
  const pool = c.npc.filter((n) => (c.relations[n.name] ?? n.mood) >= -1);
  if (pool.length === 0) return null;
  if (c.reputation < 10 && c.fans < 120) return null;
  if (Math.random() > 0.34) return null;
  const who = pick(pool);
  const friend = (c.relations[who.name] ?? who.mood) >= 3;
  const fee = friend ? 0 : who.fee;
  const pct = friend ? 8 : starCut(who.score);
  const price = friend
    ? `You're cool, so the verse is free. They still keep ${pct}% of that song.`
    : fee > 0
      ? `Pay ${money(fee)}. They keep ${pct}% of that song.`
      : `They keep ${pct}% of that song.`;
  return {
    id: uid(),
    day: c.day,
    from: who.name,
    kind: "feature",
    title: friend ? `${who.name} will jump on it` : `${who.name} wants a verse`,
    body: `${price} Costs 12 energy.`,
    offer: { name: who.name, cut: pct / 100, advance: fee, due: 0, weeks: 0 },
  };
}

export function closeWeek(c: Career): Career {
  const nextDay = c.day + 1;
  const chartMoves = isFriday(nextDay, c.startYear || undefined);
  const rent = rentFor(c);
  let cash = c.cash - rent;
  let books = addBooks(c.books, rent > 0 ? { expenses: rent } : {});
  let fans = c.fans;
  let fame = c.fame;
  let hype = c.hype;
  let reputation = c.reputation;
  let streams = c.streams;
  let tracks = c.tracks.map((t) => ({ ...t, weekly: [...t.weekly] }));
  const cut = c.label?.cut ?? 0;
  let earned = 0;
  const nights: { title: string; n: number }[] = [];
  const platforms = emptyPlatforms();
  const arrive = c.day + 1;
  const dropped: string[] = [];
  let releasedSingles = 0;
  tracks = tracks.map((t) => {
    if (t.status !== "master" || t.dropOn == null || t.dropOn > arrive) return t;
    if (t.kind === "album") {
      const members = tracks.filter((song) => song.albumOf === t.id);
      if (members.length === 0) return t;
      const quality = clamp(Math.round(members.reduce((sum, song) => sum + song.quality, 0) / members.length), 1, 99);
      dropped.push(t.title);
      return { ...t, status: "out" as const, weekOut: arrive, dropOn: null, quality };
    }
    if (t.kind !== "video") releasedSingles += 1;
    dropped.push(t.title);
    return { ...t, status: "out" as const, weekOut: arrive, dropOn: null };
  });
  if (dropped.length > 0) {
    fans += 18 * dropped.length;
    fame = bump(fame, Math.min(3, dropped.length));
    hype = clamp(hype + 8, 0, 100);
  }

  const park = (lane: PlatformId | null, n: number) => {
    if (n <= 0) return;
    if (!lane) {
      let left = n;
      PLATFORMS.forEach((platform, index) => {
        const slice = index === PLATFORMS.length - 1 ? left : Math.round(n * platform.share);
        platforms[platform.id] += Math.max(0, slice);
        left -= slice;
      });
      return;
    }
    const main = Math.round(n * 0.62);
    platforms[lane] += main;
    const others = PLATFORMS.filter((platform) => platform.id !== lane);
    let left = n - main;
    const weight = others.reduce((sum, platform) => sum + platform.share, 0) || 1;
    others.forEach((platform, index) => {
      const slice = index === others.length - 1 ? left : Math.round((n - main) * (platform.share / weight));
      platforms[platform.id] += Math.max(0, slice);
      left -= slice;
    });
  };

  const pulses: ReleasePulse[] = [];
  tracks = tracks.map((t) => {
    if (t.status !== "out" || t.weekOut == null) return { ...t, lastNight: 0 };
    const age = Math.max(1, c.day - t.weekOut + 1);
    const night = songPlays(c, t, age, { fans, hype, reputation });
    const rawCut = t.featCut ?? 0;
    const share = clamp(1 - (rawCut > 1 ? rawCut / 100 : rawCut), 0, 1);
    const tax = c.taxes === "heavy" ? 0.22 : 0;
    const pay = Math.max(0, Math.round(night * STREAM_PAY * share * (1 - cut) * (1 - tax)));
    earned += pay;
    cash += pay;
    books = addBooks(books, { gross: pay });
    streams += night;
    if (night > 0) nights.push({ title: t.title, n: night });
    park(t.platform, night);
    pulses.push({
      id: t.id,
      title: t.title,
      kind: t.kind,
      quality: t.quality,
      promo: t.promo,
      visual: t.visual,
      age,
      night,
      justOut: dropped.includes(t.title),
    });
    return {
      ...t,
      streams: t.streams + night,
      lastNight: night,
      earned: t.earned + pay,
      weeksLive: t.weeksLive + (chartMoves ? 1 : 0),
      weekly: [...t.weekly, night].slice(-8),
    };
  });

  const heard = hearReleases({
    media: c.media ?? emptyMedia(),
    day: nextDay,
    songs: pulses,
    parked: platforms,
    reputation,
    albumDrops: pulses.filter((song) => song.kind === "album" && song.justOut).map((song) => ({ title: song.title, quality: song.quality })),
  });

  if (c.gear.manager) fans += 12 + Math.round(fame * 0.4);

  let merch = { ...c.merch };
  let merchNet = 0;
  let merchLive = false;
  for (const item of MERCH) {
    const row = merch[item.id];
    if (!row?.on) continue;
    merchLive = true;
    const sales = Math.round(fans * item.perFan);
    cash += sales - item.daily;
    books = addBooks(books, { gross: sales, expenses: item.daily });
    merchNet += sales - item.daily;
    merch = { ...merch, [item.id]: { ...row, spent: row.spent + item.daily, earned: row.earned + sales } };
  }

  let desk = c.desk ? { roster: [...c.desk.roster] } : null;
  let deskNet = 0;
  if (desk) {
    for (const name of desk.roster) {
      const artist = c.npc.find((n) => n.name === name);
      deskNet += 80 + Math.round((artist?.score ?? 40) * 0.4);
    }
    if (deskNet > 0) {
      cash += deskNet;
      books = addBooks(books, { gross: deskNet });
    }
  }

  const npc = chartMoves
    ? c.npc.map((n) => ({
        ...n,
        score: clamp(n.score + rand(-3, 3), 8, 99),
        weeksOn: n.weeksOn > 0 ? n.weeksOn + 1 : 0,
      }))
    : c.npc;
  const settledTrade = settleTrade({
    day: nextDay,
    chartMoves,
    npc,
    tracks,
    nick: c.nick || "You",
    lastRanks: c.lastRanks,
    trade: c.trade ?? emptyTrade(),
    media: heard.media,
  });
  const board = chartMoves && settledTrade.board
    ? settledTrade.board
    : chartMoves
      ? makeChart(npc, standing({ ...c, tracks, hype, reputation, fans }) ? { ...standing({ ...c, tracks, hype, reputation, fans })!, name: c.nick || "You" } : null, c.lastRanks, false)
      : { chart: c.chart, lastRanks: c.lastRanks };
  const yours = board.chart.filter((row) => row.you).sort((a, b) => a.rank - b.rank);
  const you = yours[0] ?? null;
  let bestRank = c.bestRank;
  if (chartMoves && you) {
    bestRank = yours.reduce((best, row) => Math.min(best, row.rank), c.bestRank ?? you.rank);
    fame = bump(fame, you.rank <= 5 ? 2 : 1);
    reputation = clamp(reputation + (you.rank <= 10 ? 2 : 1), 0, 100);
    for (const row of yours) {
      const hit = tracks.find((t) => t.status === "out" && t.title === row.title);
      if (!hit) continue;
      tracks = tracks.map((t) => (t.id === hit.id ? { ...t, peak: t.peak == null ? row.rank : Math.min(t.peak, row.rank) } : t));
    }
  } else if (chartMoves && tracks.some((t) => t.status === "out" && t.kind !== "album" && t.kind !== "video")) {
    reputation = clamp(reputation - 1, 0, 100);
  }
  if (settledTrade.fameBump) fame = bump(fame, settledTrade.fameBump);

  const npcPlaced = chartMoves
    ? npc.map((n) => {
        const row = board.chart.find((r) => !r.you && r.name === n.name);
        if (!row) return { ...n, weeksOn: 0 };
        return { ...n, peak: Math.min(n.peak, row.rank), weeksOn: n.weeksOn || 1 };
      })
    : c.npc;

  let label = c.label ? { ...c.label } : null;
  if (label && releasedSingles > 0) label = { ...label, made: label.made + releasedSingles };
  let fine = 0;
  if (label && c.day % 7 === 0) {
    label = { ...label, weeksLeft: label.weeksLeft - 1 };
    if (label.weeksLeft <= 0 && label.made < label.due) {
      fine = 500 + (label.due - label.made) * 400;
      cash -= fine;
      books = addBooks(books, { expenses: fine });
      label = null;
    } else if (label.weeksLeft <= 0) {
      label = null;
    }
  }

  let event = "";
  let eventTone: Tone = "neutral";
  const roll = Math.random();
  const ownsBooth = c.gear.mic > 0 || c.gear.studio > 0 || rackScore(c.rack) >= 1;
  const hottest = [...tracks].filter((t) => t.status === "out").sort((a, b) => b.lastNight - a.lastNight)[0];
  const rival = Object.entries(c.relations).find(([, value]) => value <= -2)?.[0];
  if (roll > 0.9 && rival && hottest) {
    hype = clamp(hype - 5, 0, 100);
    event = `${rival} dragged ${hottest.title}. Hype slipped.`;
    eventTone = "bad";
  } else if (roll > 0.8 && hottest && hottest.quality >= 55) {
    fans += 70;
    hype = clamp(hype + 6, 0, 100);
    event = `${hottest.title} traveled further than a normal night.`;
    eventTone = "good";
  } else if (roll > 0.72 && hottest && hottest.quality >= 50) {
    fame += 1;
    fans += 40;
    event = `Night radio played ${hottest.title}.`;
    eventTone = "good";
  } else if (roll > 0.72 && ownsBooth && cash > 200 && Math.random() < 0.5) {
    cash -= 60;
    books = addBooks(books, { expenses: 60 });
    event = "A cable in the booth blew. Repair was $60.";
    eventTone = "bad";
  }

  let staffBill = 0;
  for (const deal of STAFF) {
    if (c.staff?.[deal.id]) staffBill += deal.wage;
  }
  if (staffBill > 0) {
    cash -= staffBill;
    books = addBooks(books, { expenses: staffBill });
  }

  let business = c.business;
  let bizNote = "";
  if (business) {
    const settled = settleBusiness(business, { fame, fans, level: c.level });
    cash += settled.net;
    books = addBooks(books, { gross: settled.income, expenses: settled.cost });
    business = settled.next;
    bizNote = settled.note;
  }
  const writing = writingPay(c.skills, tracks, c.level);
  if (writing > 0) {
    cash += writing;
    books = addBooks(books, { gross: writing });
  }

  const worked = settleWorkDay({
    job: c.job ?? null,
    degree: c.degree ?? null,
    degrees: c.degrees ?? { ...EMPTY_DEGREES },
    pathDays: c.pathDays ?? {},
    day: nextDay,
    startYear: c.startYear || 0,
    level: c.level,
    cash,
    maxEnergy: c.maxEnergy,
  });
  cash += worked.pay;
  cash -= worked.tuition;
  if (worked.pay > 0) books = addBooks(books, { gross: worked.pay });
  if (worked.tuition > 0) books = addBooks(books, { expenses: worked.tuition });

  let loan = c.loan ?? null;
  const mailPiece = incoming({ ...c, day: c.day + 1, reputation, fans, npc: npcPlaced, tracks });
  const mail = mailPiece ? [mailPiece, ...c.mail].slice(0, 6) : c.mail;
  fame = clamp(Math.round(fame), 0, 100);
  reputation = clamp(Math.round(reputation), 0, 100);
  hype = clamp(Math.round(hype), 0, 100);
  fans = Math.max(0, Math.round(fans));
  cash = Math.round(cash);
  if (loan && nextDay >= loan.dueDay) {
    cash -= loan.owe;
    books = addBooks(books, { expenses: loan.owe });
    loan = null;
    event = event ? `${event} The loan came due.` : "The loan came due. $120 left the account.";
    eventTone = "bad";
  }
  const morning = [...nights].sort((a, b) => b.n - a.n)[0];
  const lines: string[] = [];
  if (!morning || morning.n <= 0) lines.push(dropped.length ? "It just came out. The first count is tonight's sleep, already in." : "Nothing of yours was out. Release a song, then sleep.");
  else if (nights.length === 1) lines.push(`${morning.title} did ${fmt(morning.n)} plays and paid ${money(earned)}.`);
  else lines.push(`${morning.title} led with ${fmt(morning.n)} plays. The songs together paid ${money(earned)}.`);
  if (morning && morning.n > 0) lines.push(you ? `You're #${you.rank} on the Hot 100.` : "Not on the Hot 100.");
  if (rent > 0) lines.push(`Rent took ${money(rent)}.`);
  if (dropped.length > 0) lines.push(`${dropped.join(", ")} came out.`);
  if (fine > 0) lines.push(`The contract lapsed. Fine ${money(fine)}.`);
  if (merchLive) lines.push(merchNet >= 0 ? `Merch cleared ${money(merchNet)}.` : `Merch lost ${money(-merchNet)}.`);
  if (desk && desk.roster.length > 0) lines.push(`Your desk cleared ${money(deskNet)}.`);
  if (staffBill > 0) lines.push(`Staff took ${money(staffBill)}.`);
  if (bizNote) lines.push(bizNote);
  if (writing > 0) lines.push(`Writing royalties paid ${money(writing)}.`);
  for (const note of worked.notes) lines.push(note);
  if (event) lines.push(event);
  for (const note of heard.notes) lines.push(note);
  for (const note of settledTrade.notes) lines.push(note);
  if (cash < 0) lines.push("You're in the red.");
  if (c.death !== "off" && cash < -800) lines.push("Death is on. The hole is too deep. End the career in settings.");
  const social = peopleMorning(
    { ...c, day: nextDay, cash, fans, fame, hype, reputation, tracks, npc: npcPlaced },
    dropped.length > 0,
  );
  fans = social.career.fans;
  fame = social.career.fame;
  hype = social.career.hype;
  reputation = social.career.reputation;
  for (const note of social.notes) lines.push(note);
  const hadOut = c.tracks.some((t) => t.status === "out");
  const droppedAlbum = tracks.some((t) => t.kind === "album" && dropped.includes(t.title));
  const morningTitle = !hadOut && dropped.length > 0 ? (droppedAlbum ? "Premiere" : "Debut") : "Morning";
  const bornAge = c.bornAge || c.age;
  const age = careerAge(bornAge, nextDay, c.startYear || 0);
  const ceremony = nextDay % 84 === 0;
  const body = lines.join(" ");
  return finalize({
    ...c,
    day: nextDay,
    week: Math.max(1, Math.ceil(nextDay / 7)),
    age,
    bornAge,
    cash,
    fans,
    fame,
    hype,
    reputation,
    streams,
    tracks,
    npc: npcPlaced,
    chart: board.chart,
    lastRanks: board.lastRanks,
    bestRank,
    label,
    mail,
    energy: worked.energy,
    books,
    merch,
    desk,
    loan,
    business,
    platforms,
    media: heard.media,
    job: worked.job,
    degree: worked.degree,
    degrees: worked.degrees,
    pathDays: worked.pathDays,
    bonds: social.career.bonds,
    met: social.career.met,
    circleMail: social.career.circleMail,
    crew: social.career.crew,
    industry: social.career.industry,
    trade: settledTrade.trade,
    relations: social.career.relations,
    feed: [feedItem(c.week, morningTitle, body, cash < 0 ? "bad" : eventTone), ...c.feed].slice(0, 28),
    lastResult: {
      title: ceremony ? "The year in the room" : morningTitle !== "Morning" ? morningTitle : you ? `#${you.rank}` : "Morning",
      body,
      tone: cash < 0 || fine > 0 ? "bad" : you && you.rank <= 10 ? "good" : eventTone,
      blocking: true,
    },
  });
}

const LIFE_COST: Record<LifeItem, number[]> = {
  jewelry: [900, 4200],
  car: [6500],
  house: [18000],
  distributor: [1500, 6000],
  ink: [750],
};

const LIFE_NAME: Record<LifeItem, string[]> = {
  jewelry: ["A chain", "Ice"],
  car: ["A coupe"],
  house: ["A place of your own"],
  distributor: ["Desk distro", "Wide distro"],
  ink: ["Ink"],
};

export function buyLife(c: Career, item: LifeItem): Career {
  const level = c.lifestyle[item];
  const costs = LIFE_COST[item];
  if (level >= costs.length) return say(c, "Owned", "That one's already yours.", "neutral");
  const cost = costs[level] ?? costs[0]!;
  if (c.cash < cost) return say(c, "Not yet", `${LIFE_NAME[item][level]} is ${money(cost)}. You have ${money(c.cash)}.`, "bad");
  const lifestyle: Lifestyle = { ...c.lifestyle, [item]: (level + 1) as 0 | 1 | 2 };
  const hype = clamp(c.hype + (item === "jewelry" || item === "car" || item === "ink" ? 6 : 2), 0, 100);
  const reputation = clamp(c.reputation + (item === "house" || item === "distributor" ? 4 : 1), 0, 100);
  return say(
    { ...c, cash: c.cash - cost, books: addBooks(c.books, { expenses: cost }), lifestyle, hype, reputation },
    LIFE_NAME[item][level] ?? "Bought",
    item === "distributor" ? "They push the record. Mornings pay more." : "People can see it. Hype moved.",
    "good",
  );
}

export function trainSkill(c: Career, key: keyof Skills): Career {
  const cost = TRAIN_ENERGY[key];
  const label = SKILLS.find((skill) => skill.key === key)?.label ?? "That skill";
  if (c.skills[key] >= 100) return say(c, label, `${label} is already 100. No energy spent.`, "neutral");
  if (c.energy < cost) return say(c, "Too tired", `That drill is ${cost} energy. You have ${c.energy}.`, "bad");
  const next = bump(c.skills[key], 1);
  return say(
    { ...c, energy: c.energy - cost, skills: { ...c.skills, [key]: next } },
    label,
    `${label} is ${next}. ${cost} energy. The hours are the cost.`,
    "good",
  );
}

const FOOD: Record<FoodTier, { cost: number; gain: number; name: string }> = {
  street: { cost: 28, gain: 18, name: "Street plate" },
  diner: { cost: 90, gain: 36, name: "Diner" },
  table: { cost: 240, gain: 70, name: "A real table" },
};

export function eatAt(c: Career, tier: FoodTier): Career {
  const meal = FOOD[tier];
  if (c.energy >= c.maxEnergy) return say(c, "Full", "You are not hungry.", "neutral");
  if (c.cash < meal.cost) return say(c, "Not yet", `${meal.name} is ${money(meal.cost)}.`, "bad");
  const gain = Math.min(meal.gain, c.maxEnergy - c.energy);
  return say(
    {
      ...c,
      cash: c.cash - meal.cost,
      books: addBooks(c.books, { expenses: meal.cost }),
      energy: c.energy + gain,
      hype: tier === "table" ? clamp(c.hype + 2, 0, 100) : c.hype,
    },
    meal.name,
    `+${gain} energy. ${money(meal.cost)}.`,
    "neutral",
  );
}

export function tourQuote(c: Career) {
  const songs = c.tracks.filter((t) => t.status === "out" && t.kind !== "video").length;
  const stops = c.fame >= 68 ? 5 : 3;
  const cost = stops * 180;
  const draw = stops * (50 + c.fame * 8 + Math.round(c.reputation * 1.2));
  return { songs, need: 3, fameNeed: 12, stops, cost, draw, energy: 22 };
}

export function runTour(c: Career): Career {
  const quote = tourQuote(c);
  const stage = tierOf(c.fame).current.name;
  if (c.fame < quote.fameNeed && !c.tourBooked) return say(c, "Not yet", `Touring opens at Local. You're ${stage}.`, "neutral");
  if (quote.songs < quote.need && !c.tourBooked) return say(c, "Not enough songs", `A tour needs ${quote.need} songs out. You have ${quote.songs}.`, "neutral");
  if (c.energy < quote.energy) return say(c, "Too tired", "A tour leg is 22 energy.", "bad");
  if (c.cash < quote.cost) return say(c, "Short", `Moving ${quote.stops} cities is ${money(quote.cost)}. You have ${money(c.cash)}.`, "bad");
  const door = quote.draw;
  return say(
    {
      ...c,
      tourBooked: false,
      cash: c.cash - quote.cost + door,
      energy: c.energy - quote.energy,
      books: addBooks(c.books, { tourSpent: quote.cost, tourEarned: door, expenses: quote.cost, gross: door }),
      fans: c.fans + quote.stops * 30,
      fame: bump(c.fame, 2),
      hype: clamp(c.hype + 12, 0, 100),
      shows: c.shows + quote.stops,
    },
    "Tour",
    `${quote.stops} cities. You spent ${money(quote.cost)} and the doors paid ${money(door)}.`,
    door >= quote.cost ? "good" : "neutral",
  );
}

export function setMerch(c: Career, id: MerchId, on: boolean): Career {
  const item = MERCH.find((row) => row.id === id);
  if (!item) return c;
  const row = c.merch[id] ?? { on: false, spent: 0, earned: 0 };
  if (!on) {
    return say({ ...c, merch: { ...c.merch, [id]: { ...row, on: false } } }, item.name, "Contract stopped. Tomorrow doesn't bill it.", "neutral");
  }
  const gate = id === "jeans" ? 46 : id === "hoodies" ? 28 : id === "tees" ? 12 : 0;
  if (c.fame < gate) return say(c, "Not yet", `${item.name} opens at ${tierOf(gate).current.name}.`, "neutral");
  if (c.cash < item.upfront) return say(c, "Short", `${item.name} is ${money(item.upfront)} up front. You have ${money(c.cash)}.`, "bad");
  return say(
    {
      ...c,
      cash: c.cash - item.upfront,
      books: addBooks(c.books, { expenses: item.upfront }),
      merch: { ...c.merch, [id]: { on: true, spent: row.spent + item.upfront, earned: row.earned } },
    },
    item.name,
    `${money(item.upfront)} up front. ${money(item.daily)} leaves every morning. Sales depend on followers.`,
    "neutral",
  );
}

export function sidePost(c: Career, kind: "bts" | "vlog"): Career {
  const cost = kind === "bts" ? 14 : 10;
  if (c.energy < cost) return say(c, "Too tired", `That post is ${cost} energy.`, "bad");
  const fans = kind === "bts" ? 16 + Math.round(c.hype / 10) : 10 + Math.round(c.fame / 5);
  const media = c.media ?? emptyMedia();
  const followers = kind === "bts" ? 9 : 6;
  const views = kind === "bts" ? 140 + fans * 4 : 220 + fans * 6;
  const clipTitle = kind === "vlog" ? "Vlog" : "Behind the song";
  const clips = [...(media.clips ?? []), { id: `tik-${c.day}-${kind}-${media.clips?.length ?? 0}`, day: c.day, title: clipTitle, views, kind, trackId: "" }].slice(-24);
  return say(
    {
      ...c,
      energy: c.energy - cost,
      fans: c.fans + fans,
      hype: clamp(c.hype + (kind === "bts" ? 4 : 2), 0, 100),
      media: {
        ...media,
        tiktok: {
          followers: media.tiktok.followers + followers,
          views: media.tiktok.views + views,
          uses: media.tiktok.uses,
        },
        clips,
      },
    },
    clipTitle,
    `Clip posted. +${followers} TikTok followers. ${fmt(views)} views. ${cost} energy. Song uses did not change.`,
    "neutral",
  );
}

export const TIKTOK_POST = 8;

/** Post one song or album to TikTok. Views keep arriving for about three weeks. The release gets a lift while the sound is hot. */
export function postSound(c: Career, trackId: string): Career {
  const track = c.tracks.find((row) => row.id === trackId);
  if (!track || track.status !== "out" || (track.kind !== "single" && track.kind !== "album")) {
    return say(c, "Not out", "Post a song or album that is already out.", "neutral");
  }
  if (c.energy < TIKTOK_POST) return say(c, "Too tired", `That video is ${TIKTOK_POST} energy.`, "bad");
  const media = c.media ?? emptyMedia();
  const album = track.kind === "album";
  const views = Math.round((70 + media.tiktok.followers * 0.05 + track.quality * 1.1) * (album ? 1.25 : 1));
  const followers = album ? 10 : 6;
  const fans = album ? 14 + Math.round(track.quality / 12) : 8 + Math.round(track.quality / 16);
  const clip = {
    id: `tik-${c.day}-${track.id}-${media.clips?.length ?? 0}`,
    day: c.day,
    title: track.title,
    views,
    kind: album ? ("album" as const) : ("song" as const),
    trackId: track.id,
  };
  return say(
    {
      ...c,
      energy: c.energy - TIKTOK_POST,
      fans: c.fans + fans,
      hype: clamp(c.hype + (album ? 5 : 3), 0, 100),
      media: {
        ...media,
        tiktok: {
          followers: media.tiktok.followers + followers,
          views: media.tiktok.views + views,
          uses: media.tiktok.uses,
        },
        clips: [...(media.clips ?? []), clip].slice(-24),
      },
    },
    track.title,
    album
      ? `${fmt(views)} views today. They keep coming for about three weeks, and the songs on this album get a lift while the sound is hot. ${TIKTOK_POST} energy.`
      : `${fmt(views)} views today. They keep coming for about three weeks, and this song gets a lift while the sound is hot. ${TIKTOK_POST} energy.`,
    "good",
  );
}

export function deleteClip(c: Career, id: string): Career {
  const media = c.media ?? emptyMedia();
  const clip = (media.clips ?? []).find((row) => row.id === id);
  if (!clip) return say(c, "Gone", "That video is already off the profile.", "neutral");
  if (c.energy < 1) return say(c, "Too tired", "Deleting a video is 1 energy.", "bad");
  const pushing = clip.kind === "song" || clip.kind === "album";
  return say(
    {
      ...c,
      energy: c.energy - 1,
      media: {
        ...media,
        clips: media.clips.filter((row) => row.id !== id),
        tiktok: { ...media.tiktok, views: Math.max(0, media.tiktok.views - clip.views) },
      },
    },
    "Deleted",
    pushing ? `${clip.title} is off TikTok. The lift on that release stops. 1 energy.` : `${clip.title} is off TikTok. 1 energy.`,
    "neutral",
  );
}

/** A post from the phone. Instagram and X do not share the follower count. Career fans still move the same amount. */
/** One picture, every app. The career look stays until a real image is saved. */
export function setAvatar(c: Career, dataUrl: string): Career {
  const photo = dataUrl.startsWith("data:image/") && dataUrl.length > 32 && dataUrl.length <= 180_000 ? dataUrl : "";
  if (!photo) return say(c, "Photo", "That picture did not fit. Try another one.", "bad");
  const media = c.media ?? emptyMedia();
  return say(
    { ...c, media: { ...media, avatar: photo } },
    "Photo",
    "That picture is now on every app.",
    "good",
  );
}

export function postTo(c: Career, where: "instagram" | "x"): Career {
  if (where === "instagram") return act(c, "post");
  const gate = preview(c, "post");
  if (!gate.ok) return say(c, "Not today", gate.reason, "neutral");
  const next = spend(c, COSTS.post);
  if (!next) return say(c, "Out of hours", "Sleep, or eat if you can afford a plate.", "bad");
  return finishPost(next, "x");
}

function finishPost(next: Career, where: "instagram" | "x"): Career {
  const gain = Math.round((8 + rand(4, 18) + next.gear.wardrobe * 8 + next.hype * 0.15) * cityOf(next.city).scene);
  const shared = boostPost(next);
  const extra = shared.line ? ` ${shared.line}` : "";
  const media = next.media ?? emptyMedia();
  const tone = shared.reputation < 0 ? "bad" : "neutral";
  const song = [...next.tracks].reverse().find((t) => t.status === "out" && t.kind !== "album");
  const post = {
    app: where,
    day: next.day,
    title: song?.title ?? (next.nick || "Post"),
    text: song ? (where === "x" ? `${song.title} is up.` : song.title) : where === "x" ? "In the room tonight." : "Studio",
  };
  const posts = [...(media.posts ?? []), post].slice(-24);
  const base = {
    ...next,
    fans: next.fans + gain + shared.fans,
    hype: clamp(next.hype + 3, 0, 100),
    reputation: clamp(next.reputation + shared.reputation, 0, 100),
  };
  if (where === "x") {
    const followers = Math.max(1, Math.round(gain * 0.45));
    const impressions = gain * 14;
    return say(
      {
        ...base,
        media: {
          ...media,
          x: { followers: media.x.followers + followers, impressions: media.x.impressions + impressions },
          posts,
        },
      },
      "Posted",
      `+${followers} X followers. ${fmt(impressions)} impressions. ${COSTS.post} energy. Instagram did not move.${extra}`,
      tone,
    );
  }
  return say(
    {
      ...base,
      media: {
        ...media,
        instagram: {
          followers: media.instagram.followers + gain,
          visits: media.instagram.visits + gain * 3,
          reach: media.instagram.reach + gain * 6,
        },
        posts,
      },
    },
    "Posted",
    `+${gain} Instagram followers. ${fmt(gain * 3)} profile visits. ${COSTS.post} energy. X did not move.${extra}`,
    tone,
  );
}

function creditYouTube(c: Career, subscribers: number, views: number) {
  const media = c.media ?? emptyMedia();
  return {
    ...media,
    youtube: {
      subscribers: media.youtube.subscribers + subscribers,
      views: media.youtube.views + views,
    },
  };
}

export function submitGrammy(c: Career, trackId: string, category: GrammyCategory): Career {
  const result = submitEntry(c.trade ?? emptyTrade(), c.tracks, c.day, trackId, category);
  if (!result.ok) return say(c, "Not eligible", result.reason, "neutral");
  return say({ ...c, trade: result.trade }, "Submitted", result.reason, "good");
}

export function askLabel(c: Career): Career {
  const result = labelFile(c.trade ?? emptyTrade(), c.tracks, c.day, !!c.label);
  if (!result.ok) return say(c, "Label passed", result.reason, "neutral");
  return say({ ...c, trade: result.trade }, "Label submitted", result.reason, "good");
}

export function takeInterview(c: Career, name?: string): Career {
  const trade = c.trade ?? emptyTrade();
  const invite = (name ? trade.offers?.find((row) => row.name === name) : null) ?? trade.invite;
  if (!invite) return say(c, "No interview", "Nobody has asked yet.", "neutral");
  const cost = invite.cost ?? 0;
  if (cost > 0 && c.cash < cost) return say(c, "Short", `${invite.name} costs ${money(cost)}. You have ${money(c.cash)}.`, "bad");
  const next = spend(c, invite.energy);
  if (!next) return say(c, "Too tired", `${invite.name} is ${invite.energy} energy.`, "bad");
  const sat = finishOffer(next.trade ?? trade, invite.name, next.day);
  return say(
    {
      ...next,
      cash: next.cash - cost,
      books: cost > 0 ? addBooks(next.books, { expenses: cost }) : next.books,
      reputation: clamp(next.reputation + 2, 0, 100),
      trade: sat,
    },
    invite.name,
    `${invite.note || "You sat for it."} Reputation moved. Followers did not.${cost ? ` ${money(cost)} left.` : ""}`,
    "neutral",
  );
}

export function borrow(c: Career): Career {
  if (c.loan) {
    if (c.cash < c.loan.owe) return say(c, "Short", `You owe ${money(c.loan.owe)}. You have ${money(c.cash)}.`, "bad");
    return say(
      { ...c, cash: c.cash - c.loan.owe, books: addBooks(c.books, { expenses: c.loan.owe }), loan: null },
      "Loan cleared",
      `${money(c.loan.owe)} left. You're done with it.`,
      "neutral",
    );
  }
  return say(
    { ...c, cash: c.cash + 100, books: addBooks(c.books, { gross: 100 }), loan: { owe: 120, dueDay: c.day + 184 } },
    "Borrowed $100",
    "You owe $120. It comes out on its own if you don't pay it back.",
    "neutral",
  );
}

export function openDesk(c: Career): Career {
  if (c.desk) return say(c, "Already open", "Your label is on the books.", "neutral");
  if (c.fame < 28) return say(c, "Not yet", `Your own label opens at Buzz. You're ${tierOf(c.fame).current.name}.`, "neutral");
  if (c.cash < 1500) return say(c, "Short", `Opening the desk is ${money(1500)}. You have ${money(c.cash)}.`, "bad");
  return say(
    { ...c, cash: c.cash - 1500, books: addBooks(c.books, { expenses: 1500 }), desk: { roster: [] } },
    "Desk open",
    "Sign people you already get along with. They pay the desk every morning.",
    "good",
  );
}

export function signToDesk(c: Career, name: string): Career {
  if (!c.desk) return say(c, "No desk", "Open your label first.", "neutral");
  if (c.desk.roster.includes(name)) return c;
  if ((c.relations[name] ?? 0) < 1) return say(c, "Not yet", `${name} doesn't know you well enough.`, "neutral");
  if (c.desk.roster.length >= 4) return say(c, "Full", "Four artists is the desk.", "neutral");
  return say(
    { ...c, desk: { roster: [...c.desk.roster, name] } },
    name,
    "They're on your desk. $80 plus a cut of their heat, every morning.",
    "good",
  );
}

export function enroll(c: Career, skill: ClassSkill): Career {
  if (c.school && c.school.left > 0) return say(c, "Already in class", `Finish ${c.school.name} first.`, "neutral");
  const course = CLASSES.find((item) => item.skill === skill);
  if (!course) return c;
  if ((c.skills[skill] ?? 0) >= 100) return say(c, course.name, `${course.name} is already 100. Tuition was not charged.`, "neutral");
  if (c.cash < course.tuition) return say(c, "Short", `${course.name} is ${money(course.tuition)} up front. You have ${money(c.cash)}.`, "bad");
  return say(
    {
      ...c,
      cash: c.cash - course.tuition,
      books: addBooks(c.books, { expenses: course.tuition }),
      school: { skill, name: course.name, left: course.sessions },
    },
    course.name,
    `${money(course.tuition)} is paid. ${course.sessions} sessions, 10 energy, +3 each.`,
    "good",
  );
}

export function attend(c: Career): Career {
  if (!c.school || c.school.left <= 0) return say(c, "Not enrolled", "Pick a class first.", "neutral");
  const skill = c.school.skill;
  if ((c.skills[skill] ?? 0) >= 100) {
    return say(
      { ...c, school: null },
      c.school.name,
      `${c.school.name} is already 100. No energy spent. The class is closed.`,
      "neutral",
    );
  }
  if (c.energy < 10) return say(c, "Too tired", "Class is 10 energy.", "bad");
  const left = c.school.left - 1;
  const next = bump(c.skills[skill], 3);
  return say(
    {
      ...c,
      energy: c.energy - 10,
      skills: { ...c.skills, [skill]: next },
      school: left > 0 ? { ...c.school, left } : null,
    },
    c.school.name,
    left > 0 ? `${c.school.name} is ${next}. ${left} sessions left.` : `${c.school.name} is finished at ${next}.`,
    "good",
  );
}

export function setStaff(c: Career, id: StaffId, on: boolean): Career {
  const deal = STAFF.find((item) => item.id === id);
  if (!deal) return c;
  if (!on) {
    return say({ ...c, staff: { ...c.staff, [id]: false } }, deal.name, "They're off the payroll. Tomorrow doesn't bill them.", "neutral");
  }
  if (c.fame < deal.fame) return say(c, "Not yet", `${deal.name}s take calls at ${tierOf(deal.fame).current.name}.`, "neutral");
  return say(
    { ...c, staff: { ...c.staff, [id]: true } },
    deal.name,
    `${money(deal.wage)} leaves every morning until you let them go.`,
    "neutral",
  );
}

export function pushPlatform(c: Career, id: PlatformId): Career {
  const target = [...c.tracks].reverse().find((t) => t.status === "out" && t.kind !== "album");
  if (!target) return say(c, "Nothing out", "Push a song that's already in the count.", "neutral");
  if (c.energy < 8) return say(c, "Too tired", "A push is 8 energy.", "bad");
  const name = PLATFORMS.find((p) => p.id === id)?.name ?? id;
  return say(
    {
      ...c,
      energy: c.energy - 8,
      tracks: c.tracks.map((t) => (t.id === target.id ? { ...t, platform: id } : t)),
    },
    name,
    `${target.title} is pushed. Most of tonight lands there, and it pays a little more.`,
    "neutral",
  );
}

function bandFrom(raw: Career["band"] | undefined): Career["band"] {
  if (!raw || typeof raw !== "object") return null;
  const name = typeof raw.name === "string" ? raw.name.trim().slice(0, 24) : "";
  if (!name) return null;
  const mates = Array.isArray(raw.mates) ? raw.mates.filter((n): n is string => typeof n === "string").slice(0, 4) : [];
  return { name, mates };
}

const KPOP_HOUSES = ["Glass Line", "Night Train", "Paper Moon", "Afterschool", "Low Room"];
const ROOMS = ["The Back Room", "Night Bus", "Civic Hall", "Low Desk", "After Hours"];

export function royaltyRate(c: Pick<Career, "skills">) {
  return Math.min(28, Math.max(0, Math.round(c.skills.prod / 4)));
}

export function careerSheet(c: Career) {
  const live = c.tracks.filter((track) => track.status === "out" && track.kind !== "video");
  const styles = new Map<string, number>();
  for (const track of c.tracks) {
    if (!track.style) continue;
    styles.set(track.style, (styles.get(track.style) ?? 0) + (track.status === "out" ? 2 : 1));
  }
  let genre = PATHS[c.path].label;
  let best = 0;
  for (const [style, count] of styles) {
    if (count > best) {
      genre = style;
      best = count;
    }
  }
  const life = c.lifestyle;
  const gear = c.gear;
  const assets =
    (life.jewelry >= 1 ? 900 : 0) +
    (life.jewelry >= 2 ? 4200 : 0) +
    (life.car ? 6500 : 0) +
    (life.house ? 18000 : 0) +
    (life.distributor >= 1 ? 1500 : 0) +
    (life.distributor >= 2 ? 6000 : 0) +
    (life.ink ? 750 : 0) +
    (gear.mic >= 1 ? SHOP.mic[0].cost : 0) +
    (gear.mic >= 2 ? SHOP.mic[1].cost : 0) +
    (gear.studio >= 1 ? SHOP.studio[0].cost : 0) +
    (gear.studio >= 2 ? SHOP.studio[1].cost : 0) +
    (gear.wardrobe >= 1 ? SHOP.wardrobe[0].cost : 0) +
    (gear.wardrobe >= 2 ? SHOP.wardrobe[1].cost : 0) +
    (gear.manager ? SHOP.manager.cost : 0);
  const nightly = c.tracks.reduce((sum, track) => sum + (track.status === "out" ? track.lastNight : 0), 0);
  const ages = c.tracks
    .filter((track) => track.status === "out" && track.weekOut != null)
    .map((track) => Math.max(1, c.day - (track.weekOut as number) + 1));
  const span = ages.length ? Math.max(...ages) : 0;
  const window = span === 0 ? 0 : Math.min(30, span);
  const projected = nightly * window;
  const monthly = Math.min(c.streams, projected);
  const monthlyNote = window === 0 ? "" : window < 30 ? "so far" : projected > monthly ? "" : "est.";
  return {
    songs: live.filter((track) => track.kind !== "album").length,
    albums: live.filter((track) => track.kind === "album").length,
    feats: live.filter((track) => Boolean(track.feat)).length,
    monthly,
    monthlyNote,
    genre,
    net: Math.round(c.cash + assets - (c.loan?.owe ?? 0)),
    royalty: royaltyRate(c),
    popularity: Math.round(c.fame),
  };
}

function gigsFrom(raw: Career["gigs"] | undefined): Gig[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((gig) => gig && typeof gig === "object" && typeof gig.id === "string" && typeof gig.from === "string")
    .slice(0, 6)
    .map((gig) => ({
      id: gig.id,
      kind: gig.kind === "kpop" || gig.kind === "feature" || gig.kind === "produce" ? gig.kind : "audition",
      from: gig.from.slice(0, 32),
      pay: Math.max(0, Math.round(gig.pay || 0)),
      cut: Math.max(0, Math.round(gig.cut || 0)),
      energy: Math.max(1, Math.round(gig.energy || 8)),
      blurb: typeof gig.blurb === "string" ? gig.blurb.slice(0, 140) : "",
    }));
}

const BIZ_PRODUCTS: BizProduct[] = ["Tees", "Studio hours", "Beat packs"];

function bizFrom(raw: Career["business"] | undefined): Career["business"] {
  if (!raw || typeof raw !== "object" || typeof raw.name !== "string") return null;
  const product = BIZ_PRODUCTS.includes(raw.product) ? raw.product : "Tees";
  const marketing = raw.marketing === 2 ? 2 : raw.marketing === 1 ? 1 : 0;
  return {
    name: raw.name.trim().slice(0, 24) || "The Shop",
    product,
    employees: clamp(Math.round(raw.employees || 0), 0, 4),
    price: clamp(Math.round(raw.price || 22), 12, 60),
    marketing,
    stock: clamp(Math.round(raw.stock || 0), 0, 40),
    lastIncome: Math.max(0, Math.round(raw.lastIncome || 0)),
    lastCost: Math.max(0, Math.round(raw.lastCost || 0)),
  };
}

function unitCost(product: BizProduct) {
  if (product === "Studio hours") return 9;
  if (product === "Beat packs") return 7;
  return 4;
}

export function shopRates(level: Career["level"], product: BizProduct) {
  return {
    wage: level === "hardcore" ? 26 : 18,
    unit: unitCost(product),
    ads: 12,
    madeBase: 4,
    madePerEmployee: 2,
    madeCap: 10,
  };
}

export function settleBusiness(business: Business, live: { fame: number; fans: number; level: Career["level"] }) {
  const rates = shopRates(live.level, business.product);
  const priceFactor = business.price <= 24 ? 1.15 : business.price <= 40 ? 0.85 : 0.45;
  const demand = Math.max(
    0,
    Math.round((1 + live.fans / 220 + live.fame / 25 + business.marketing * 1.5 + business.employees * 0.4) * priceFactor * (live.level === "hardcore" ? 0.8 : 1)),
  );
  const sold = Math.min(business.stock, demand);
  const made = Math.min(rates.madeCap, rates.madeBase + business.employees * rates.madePerEmployee);
  const restock = made * rates.unit;
  const wage = business.employees * rates.wage;
  const ads = business.marketing * rates.ads;
  const income = sold * business.price;
  const cost = restock + wage + ads;
  const net = income - cost;
  const note = net >= 0 ? `${business.name} cleared ${money(net)}.` : `${business.name} lost ${money(-net)}.`;
  return {
    net,
    income,
    cost,
    note,
    next: { ...business, stock: clamp(business.stock - sold + made, 0, 40), lastIncome: income, lastCost: cost },
  };
}

export function writingPay(skills: Career["skills"], tracks: Career["tracks"], level: Career["level"]) {
  const catalog = tracks.filter((track) => track.status === "out" && track.kind !== "album" && track.kind !== "video").length;
  const rate = royaltyRate({ skills });
  return Math.round(catalog * rate * 0.35 * (level === "hardcore" ? 0.8 : 1));
}

export function businessGate(c: Career) {
  const cost = c.level === "hardcore" ? 700 : 500;
  if (c.business) return { ok: false, reason: "You already have a shop.", cost };
  const known = c.tracks.some((track) => track.status === "out") || c.fame >= 12;
  if (!known) return { ok: false, reason: "Put a song out, or reach Local, before a shop will have customers.", cost };
  const need = c.level === "hardcore" ? 12 : 8;
  if (c.skills.biz < need) return { ok: false, reason: `Business is ${c.skills.biz}. A shop wants ${need}.`, cost };
  if (c.cash < cost) return { ok: false, reason: `Opening costs ${money(cost)}. You have ${money(c.cash)}.`, cost };
  return { ok: true, reason: "", cost };
}

export function openBusiness(c: Career, name: string, product: BizProduct): Career {
  const gate = businessGate(c);
  if (!gate.ok) return say(c, "Not yet", gate.reason, "neutral");
  const title = name.trim().replace(/\s+/g, " ").slice(0, 24) || "The Shop";
  const business: Business = {
    name: title,
    product: BIZ_PRODUCTS.includes(product) ? product : "Tees",
    employees: 0,
    price: 22,
    marketing: 0,
    stock: 6,
    lastIncome: 0,
    lastCost: 0,
  };
  return say(
    { ...c, cash: c.cash - gate.cost, books: addBooks(c.books, { expenses: gate.cost }), business },
    title,
    `${money(gate.cost)} in. Six units on the shelf. Wages and ads come out every morning, and a high price scares people off.`,
    "good",
  );
}

export function tuneBusiness(c: Career, patch: { employees?: number; price?: number; marketing?: 0 | 1 | 2 }): Career {
  if (!c.business) return say(c, "No shop", "Open one first.", "neutral");
  const business: Business = {
    ...c.business,
    employees: patch.employees == null ? c.business.employees : clamp(Math.round(patch.employees), 0, 4),
    price: patch.price == null ? c.business.price : clamp(Math.round(patch.price), 12, 60),
    marketing: patch.marketing == null ? c.business.marketing : patch.marketing,
  };
  return { ...c, business };
}

export function closeBusiness(c: Career): Career {
  if (!c.business) return c;
  const scrap = Math.round(c.business.stock * unitCost(c.business.product) * 0.5);
  const name = c.business.name;
  return say(
    { ...c, business: null, cash: c.cash + scrap, books: scrap ? addBooks(c.books, { gross: scrap }) : c.books },
    "Closed",
    scrap ? `${name} is done. Leftover stock paid ${money(scrap)}.` : `${name} is done. The shelf was empty.`,
    "neutral",
  );
}

export function takeJob(c: Career, id: string): Career {
  const post = jobById(id);
  if (!post) return c;
  if (c.job) return say(c, "Already hired", "Stop the job you have before you take another.", "neutral");
  const locked = jobLock(c, post);
  if (locked) return say(c, "Locked", locked, "neutral");
  return say(
    { ...c, job: { id: post.id, hiredOn: c.day, paidOn: c.day, days: 0 } },
    post.title,
    "You're hired. Nothing is paid today. The first wage is tomorrow morning.",
    "good",
  );
}

export function quitJob(c: Career): Career {
  const post = jobById(c.job?.id);
  if (!post || !c.job) return say(c, "No job", "You are not employed.", "neutral");
  return say({ ...c, job: null }, "Quit", `${post.title} is over. The wage and the energy stop.`, "neutral");
}

export function enrollDegree(c: Career, id: DegreeId): Career {
  const spec = degreeById(id);
  if (!spec) return c;
  const locked = degreeLock(c, spec);
  if (locked) return say(c, "Not yet", locked, "neutral");
  if (c.cash < spec.tuition) return say(c, "Short", `${spec.name} is ${money(spec.tuition)} for the year. You have ${money(c.cash)}.`, "bad");
  return say(
    {
      ...c,
      cash: c.cash - spec.tuition,
      books: addBooks(c.books, { expenses: spec.tuition }),
      degree: { id: spec.id, year: 1, attended: 0, paidThrough: 1 },
    },
    spec.name,
    `${money(spec.tuition)} for year 1. ${spec.years} year${spec.years === 1 ? "" : "s"}, ${WEEKDAYS_IN_YEAR} weekdays each. Class takes energy on weekday mornings. It does not finish today.`,
    "good",
  );
}

export function leaveDegree(c: Career): Career {
  const spec = degreeById(c.degree?.id);
  if (!spec || !c.degree) return say(c, "Not enrolled", "You are not in a program.", "neutral");
  return say({ ...c, degree: null }, spec.name, "You left. The year you paid is not refunded. A finished degree stays.", "neutral");
}

export function workJob(c: Career, kind: "counter" | "intern" | "door"): Career {
  if (kind === "counter") return act(c, "shift");
  if (kind === "intern") {
    if (c.skills.prod < 8) return say(c, "Not yet", "A studio wants Production 8.", "neutral");
    const next = spend(c, 10);
    if (!next) return say(c, "Out of hours", "Studio help is 10 energy.", "bad");
    const pay = Math.round((36 + next.skills.prod) * (next.level === "hardcore" ? 0.8 : 1));
    return say(
      {
        ...next,
        cash: next.cash + pay,
        books: addBooks(next.books, { gross: pay }),
        skills: { ...next.skills, prod: bump(next.skills.prod, 1) },
      },
      "Studio help",
      `${money(pay)}. Production moved 1. Not your song.`,
      "neutral",
    );
  }
  if (!c.tracks.some((track) => track.status === "out") && c.fame < 6) {
    return say(c, "Not yet", "The door wants a song out, or a little fame.", "neutral");
  }
  const next = spend(c, 8);
  if (!next) return say(c, "Out of hours", "The door is 8 energy.", "bad");
  const pay = Math.round((28 + next.fame * 2) * (next.level === "hardcore" ? 0.8 : 1));
  return say(
    {
      ...next,
      cash: next.cash + pay,
      books: addBooks(next.books, { gross: pay }),
      skills: { ...next.skills, stage: bump(next.skills.stage, 1) },
    },
    "Door",
    `${money(pay)}. Stage moved 1.`,
    "neutral",
  );
}

function pushGig(c: Career, gig: Gig): Career {
  const gigs = [gig, ...c.gigs.filter((item) => item.kind !== gig.kind || item.from !== gig.from)].slice(0, 6);
  return { ...c, gigs };
}

export function seekBoard(c: Career, kind: "audition" | "kpop" | "producer"): Career {
  if (kind === "producer") {
    let next = c;
    let found = false;
    if (!next.gigs.some((gig) => gig.kind === "feature")) {
      const feature = producerFeature(next);
      if (feature) {
        next = pushGig(next, feature);
        found = true;
      }
    }
    if (!next.gigs.some((gig) => gig.kind === "produce")) {
      const job = produceJob(next);
      if (job) {
        next = pushGig(next, job);
        found = true;
      }
    }
    if (!found && !next.gigs.some((gig) => gig.kind === "feature" || gig.kind === "produce")) {
      return say(c, "Quiet", "No one wants a feature from you right now, and nobody is hiring a producer.", "neutral");
    }
    return say(next, found ? "Something came in" : "Already on the desk", found ? "Read it before you take the money." : "You already have work waiting.", "neutral");
  }
  if (c.gigs.some((gig) => gig.kind === kind)) return say(c, "Already waiting", "Answer the one on the desk first.", "neutral");
  const gig = kind === "kpop" ? kpopOffer(c) : roomOffer(c);
  if (!gig) {
    return say(c, "Still quiet", "No one wants to audition you right now.", "neutral");
  }
  return say(pushGig(c, gig), gig.from, gig.blurb, "good");
}

function roomOffer(c: Career): Gig | null {
  const skill = (c.skills.vocals + c.skills.stage + c.skills.flow) / 3;
  const gate = (c.level === "hardcore" ? 66 : 58) - c.fame * 0.3;
  if (skill + rand(0, 20) < gate) return null;
  const pay = Math.round((80 + skill * 3 + c.fame * 5 + rand(0, 70)) * (c.level === "hardcore" ? 0.8 : 1));
  const from = pick(ROOMS);
  return {
    id: uid(),
    kind: "audition",
    from,
    pay,
    cut: 0,
    energy: 8,
    blurb: `${from} will put you on tonight. Door is ${money(pay)}. 8 energy.`,
  };
}

function kpopOffer(c: Career): Gig | null {
  const songs = c.tracks.some((track) => track.status === "out");
  if (!songs && c.fame < 14 && c.skills.vocals < 30) return null;
  const skill = c.skills.vocals * 0.6 + c.skills.stage * 0.4;
  const gate = (c.level === "hardcore" ? 72 : 64) - c.fame * 0.25;
  if (skill + rand(0, 16) < gate) return null;
  const pay = Math.round((50 + c.fame * 4 + rand(0, 40)) * (c.level === "hardcore" ? 0.8 : 1));
  const from = pick(KPOP_HOUSES);
  return {
    id: uid(),
    kind: "kpop",
    from,
    pay,
    cut: 0,
    energy: 12,
    blurb: `${from} wants a tryout. ${money(pay)} if you stay. Fame moves more than the money. 12 energy.`,
  };
}

function producerFeature(c: Career): Gig | null {
  if (c.skills.prod < 18 && c.fame < 16) return null;
  if (rand(0, 100) < (c.level === "hardcore" ? 55 : 40)) return null;
  const who = pick(c.npc).name;
  const cut = royaltyRate(c);
  const pay = Math.round((70 + c.skills.prod * 4 + c.fame * 3) * (cut / 18));
  return {
    id: uid(),
    kind: "feature",
    from: who,
    pay,
    cut,
    energy: 8,
    blurb: `${who} wants a feature from you. You keep ${cut}%. ${money(pay)}. 8 energy.`,
  };
}

function produceJob(c: Career): Gig | null {
  if (c.skills.prod < 16) return null;
  if (rand(0, 100) < (c.level === "hardcore" ? 50 : 35)) return null;
  const who = pick(c.npc).name;
  const pay = Math.round((90 + c.skills.prod * 5 + rand(0, 50)) * (c.level === "hardcore" ? 0.8 : 1));
  return {
    id: uid(),
    kind: "produce",
    from: who,
    pay,
    cut: royaltyRate(c),
    energy: 10,
    blurb: `${who} wants you to produce. ${money(pay)}. 10 energy. Your royalty rate is ${royaltyRate(c)}%.`,
  };
}

export function takeGig(c: Career, id: string): Career {
  const gig = c.gigs.find((item) => item.id === id);
  if (!gig) return c;
  const next = spend(c, gig.energy);
  if (!next) return say(c, "Out of hours", `${gig.energy} energy. Sleep, or eat if you can afford a plate.`, "bad");
  const fame = gig.kind === "kpop" ? 2 : 1;
  const fans = gig.kind === "kpop" ? 24 : gig.kind === "audition" ? 12 : 8;
  return say(
    {
      ...next,
      gigs: next.gigs.filter((item) => item.id !== id),
      cash: next.cash + gig.pay,
      books: addBooks(next.books, { gross: gig.pay }),
      fans: next.fans + fans,
      fame: bump(next.fame, fame),
      hype: clamp(next.hype + (gig.kind === "kpop" ? 8 : 4), 0, 100),
      shows: next.shows + (gig.kind === "audition" || gig.kind === "kpop" ? 1 : 0),
      skills: {
        ...next.skills,
        prod: bump(next.skills.prod, gig.kind === "produce" || gig.kind === "feature" ? 1 : 0),
        stage: bump(next.skills.stage, gig.kind === "audition" || gig.kind === "kpop" ? 1 : 0),
      },
    },
    gig.from,
    `${money(gig.pay)} in. ${gig.blurb}`,
    "good",
  );
}

export function passGig(c: Career, id: string): Career {
  if (!c.gigs.some((gig) => gig.id === id)) return c;
  return { ...c, gigs: c.gigs.filter((gig) => gig.id !== id), lastResult: { title: "Passed", body: "The offer is gone.", tone: "neutral", blocking: false } };
}

export type StreetKind = "live" | "meet" | "give";

export function giftAmount(c: Pick<Career, "cash" | "level">) {
  const scaled = 22 + Math.min(40, Math.max(0, Math.round(c.cash * 0.03)));
  return c.level === "hardcore" ? Math.round(scaled * 1.2) : scaled;
}

/** What the street will actually offer. Live and meetings stay locked until the name is real. */
export function streetBoard(c: Career): { kind: StreetKind; label: string; detail: string }[] {
  const rows: { kind: StreetKind; label: string; detail: string }[] = [];
  const out = c.tracks.some((t) => t.status === "out");
  if (out || c.fans >= 40 || c.fame >= 10) rows.push({ kind: "live", label: "IG LIVE", detail: "8 energy" });
  if (c.fans >= 140 || c.fame >= 18) rows.push({ kind: "meet", label: "FAN MEETING", detail: "12 energy" });
  rows.push({ kind: "give", label: "HELP THE HOMELESS", detail: money(giftAmount(c)) });
  return rows;
}

export function street(c: Career, kind: StreetKind): Career {
  const hard = c.level === "hardcore" ? 0.8 : 1;
  if (kind === "give") {
    const cost = giftAmount(c);
    if (c.cash < cost) return say(c, "Short", `That's ${money(cost)}. You have ${money(c.cash)}.`, "bad");
    return say(
      {
        ...c,
        cash: c.cash - cost,
        books: addBooks(c.books, { expenses: cost }),
        reputation: clamp(c.reputation + (c.level === "hardcore" ? 1 : 2), 0, 100),
      },
      "Helped out",
      `${money(cost)} gone. People talk kinder. Nothing came back.`,
      "neutral",
    );
  }
  if (kind === "live") {
    const open = c.tracks.some((t) => t.status === "out") || c.fans >= 40 || c.fame >= 10;
    if (!open) return say(c, "Too quiet", "Put a song out, or get a few followers, before you go live.", "neutral");
    const next = spend(c, 8);
    if (!next) return say(c, "Out of hours", "A live is 8 energy.", "bad");
    const fans = Math.max(4, Math.round((8 + rand(0, 10) + next.hype / 25) * hard));
    const tip = next.fans >= 100 ? Math.round(rand(0, 12) * hard) : 0;
    return say(
      {
        ...next,
        fans: next.fans + fans,
        hype: clamp(next.hype + 4, 0, 100),
        cash: next.cash + tip,
        books: tip ? addBooks(next.books, { gross: tip }) : next.books,
      },
      "IG Live",
      tip ? `+${fans} followers. A tip of ${money(tip)}.` : `+${fans} followers. Hype moved. No tip.`,
      "neutral",
    );
  }
  if (c.fans < 140 && c.fame < 18) return say(c, "Too quiet", "A fan meeting needs more people who already know the name.", "neutral");
  const next = spend(c, 12);
  if (!next) return say(c, "Out of hours", "A fan meeting is 12 energy.", "bad");
  const door = Math.round(Math.min(90, 18 + next.fans * 0.015) * hard);
  const fans = Math.max(8, Math.round(16 * hard));
  return say(
    {
      ...next,
      cash: next.cash + door,
      books: addBooks(next.books, { gross: door }),
      fans: next.fans + fans,
      fame: bump(next.fame, 1),
      reputation: clamp(next.reputation + 1, 0, 100),
      hype: clamp(next.hype + 3, 0, 100),
    },
    "Fan meeting",
    `Door was ${money(door)}. +${fans} followers. One step of fame.`,
    "good",
  );
}

export function practiceInstrument(c: Career): Career {
  if (c.skills.flow >= 100 && c.skills.prod >= 100) {
    return say(c, "Practiced", "Flow and Production are already 100. No energy spent.", "neutral");
  }
  const next = spend(c, 6);
  if (!next) return say(c, "Out of hours", "Sleep, or eat if you can afford a plate.", "bad");
  const flowMax = c.skills.flow >= 100;
  const prodMax = c.skills.prod >= 100;
  const moved = [flowMax ? "" : "Flow", prodMax ? "" : "Production"].filter(Boolean).join(" and ");
  return say(
    {
      ...next,
      skills: {
        ...next.skills,
        prod: prodMax ? next.skills.prod : bump(next.skills.prod, 1),
        flow: flowMax ? next.skills.flow : bump(next.skills.flow, 1),
      },
    },
    "Practiced",
    flowMax || prodMax ? `${moved} moved. The other is already 100.` : "An hour on the instrument. Production and flow moved.",
    "good",
  );
}

export function audition(c: Career): Career {
  const next = spend(c, 8);
  if (!next) return say(c, "Out of hours", "Sleep, or eat if you can afford a plate.", "bad");
  const skill = (next.skills.vocals + next.skills.stage + next.skills.flow) / 3;
  const roll = skill + rand(0, 28) + next.fame * 0.25;
  if (roll < 46) {
    return say(
      { ...next, reputation: clamp(next.reputation - 1, 0, 100) },
      "Passed over",
      "The room wanted someone louder. Vocals and stage move the next audition.",
      "bad",
    );
  }
  const pay = Math.round(160 + skill * 7 + rand(40, 220));
  return say(
    {
      ...next,
      cash: next.cash + pay,
      books: addBooks(next.books, { gross: pay }),
      fans: next.fans + 10 + Math.round(skill / 10),
      shows: next.shows + 1,
      fame: bump(next.fame, 1),
      hype: clamp(next.hype + 4, 0, 100),
    },
    "You booked it",
    `They kept you. The door was ${money(pay)}.`,
    "good",
  );
}

export function formBand(c: Career, name: string): Career {
  const title = name.trim().replace(/\s+/g, " ").slice(0, 24);
  if (!title) return say(c, "Needs a name", "A band without a name is just a group chat.", "neutral");
  if (c.band) return say(c, "Already in one", `${c.band.name} is the band.`, "neutral");
  return say({ ...c, band: { name: title, mates: [] } }, title, "The band exists. Ask people who already like you.", "good");
}

export function contributeBand(c: Career): Career {
  if (!c.band) return say(c, "No band", "Form one first. Then ask people who are warm to you.", "neutral");
  if (c.band.mates.length === 0) return say(c, "Just you", "Find bandmates. Warm artists can join.", "neutral");
  const next = spend(c, 8);
  if (!next) return say(c, "Out of hours", "Sleep, or eat if you can afford a plate.", "bad");
  const pay = 80 + c.band.mates.length * 70 + Math.round(next.skills.prod * 1.4);
  return say(
    {
      ...next,
      cash: next.cash + pay,
      books: addBooks(next.books, { gross: pay }),
      hype: clamp(next.hype + 3, 0, 100),
      fans: next.fans + 6 * c.band.mates.length,
    },
    c.band.name,
    `You put a part on the band track. It cleared ${money(pay)}.`,
    "good",
  );
}

export function askMate(c: Career, name: string): Career {
  if (!c.band) return say(c, "No band", "Form the band before you ask.", "neutral");
  if (c.band.mates.includes(name)) return say(c, "Already in", `${name} is already in ${c.band.name}.`, "neutral");
  if ((c.relations[name] ?? 0) < 1) return say(c, "Too cold", `${name} won't join yet. A feature or a show warms them.`, "bad");
  if (c.band.mates.length >= 4) return say(c, "Full", "Four people is the van.", "neutral");
  return say({ ...c, band: { ...c.band, mates: [...c.band.mates, name] } }, name, `In ${c.band.name}. Contribute from the music menu.`, "good");
}

export function setNick(c: Career, name: string): Career {
  const nick = name.trim().replace(/\s+/g, " ").slice(0, 16);
  if (!nick) return c;
  return { ...c, nick };
}

export function sandboxAdjust(c: Career, cashDelta: number, energyDelta: number): Career {
  if (!c.sandbox) return c;
  return {
    ...c,
    cash: clamp(Math.round(c.cash + cashDelta), -5000, 50_000_000),
    energy: clamp(Math.round(c.energy + energyDelta), 0, c.maxEnergy),
  };
}

export function setLook(c: Career, id: LookId): Career {
  const look = lookOf(id);
  const media = c.media ? { ...c.media, avatar: "" } : c.media;
  if (c.look === look.id && !c.media?.avatar) return c;
  return say({ ...c, look: look.id, media }, look.name, `${look.line} That look is on every app.`, "neutral");
}

export function setHome(c: Career, tier: 0 | 1 | 2): Career {
  const next = HOMES.find((row) => row.tier === tier);
  if (!next) return c;
  if (tier <= c.homeTier) return say(c, "Already there", `${monthlyBills(c).home} is the place you have.`, "neutral");
  if (c.cash < next.cost) return say(c, "Short", `${next.name} is ${money(next.cost)}. You have ${money(c.cash)}.`, "bad");
  return say(
    {
      ...c,
      cash: c.cash - next.cost,
      homeTier: tier,
      books: addBooks(c.books, { expenses: next.cost }),
    },
    next.name,
    `${money(next.month)} a month. Quality ${next.quality}. It comes out with the weekly bills.`,
    "good",
  );
}

export function setSoftware(c: Career, tier: 1 | 2): Career {
  if (tier <= c.software) return say(c, "Installed", "That software is already on the laptop.", "neutral");
  const row = tier === 1 ? { name: "Desk DAW", cost: 350 } : { name: "Studio suite", cost: 1600 };
  if (c.cash < row.cost) return say(c, "Short", `${row.name} is ${money(row.cost)}.`, "bad");
  return say(
    {
      ...c,
      cash: c.cash - row.cost,
      software: tier,
      books: addBooks(c.books, { expenses: row.cost }),
    },
    row.name,
    "Your own production rating is a little higher on the next session.",
    "good",
  );
}

export function setTab(c: Career, tab: Career["tab"]): Career {
  return { ...c, tab };
}

export function dismiss(c: Career): Career {
  return { ...c, lastResult: null };
}

export function ackIntro(c: Career): Career {
  return { ...c, seenIntro: true };
}
