export type LookId = "hoodie" | "leather" | "tailor" | "velvet";
export type PathId = "rapper" | "writer" | "producer";
export type Pace = "standard" | "relentless";
export type Tab = "home" | "chart" | "catalog" | "news" | "you";
export type Tone = "good" | "bad" | "neutral";
export type TrackStatus = "draft" | "master" | "out";
export type ActionId =
  | "write"
  | "record"
  | "drop"
  | "promo"
  | "post"
  | "rehearse"
  | "show"
  | "visual"
  | "beat"
  | "pitch"
  | "shift"
  | "eat";
export type ShopItem = "mic" | "studio" | "wardrobe" | "manager";
export type RackId = "mic" | "phones" | "monitors" | "proof" | "laptop" | "card";
export type Rack = Record<RackId, number>;
export type PartKey = "lyrics" | "flow" | "voice" | "prod";
export type SongParts = {
  lyrics: number;
  flow: number;
  voice: number;
  prod: number;
  studio: number;
  lyricGain: number;
  flowGain: number;
  voiceGain: number;
  prodGain: number;
};
export type MailKind = "feature" | "label" | "note" | "order" | "event";
export type ProjectKind = "single" | "album" | "video";
export type FoodTier = "street" | "diner" | "table";
export type LifeItem = "jewelry" | "car" | "house" | "distributor" | "ink";
export type MerchId = "cups" | "socks" | "tees" | "hoodies" | "jeans";

export type MerchRow = {
  on: boolean;
  spent: number;
  earned: number;
};

export type Books = {
  gross: number;
  expenses: number;
  tourSpent: number;
  tourEarned: number;
};

export type Lifestyle = {
  jewelry: 0 | 1 | 2;
  car: 0 | 1;
  house: 0 | 1;
  distributor: 0 | 1 | 2;
  ink: 0 | 1;
};

export type Skills = {
  flow: number;
  pen: number;
  vocals: number;
  prod: number;
  stage: number;
  biz: number;
};

export type Gear = {
  mic: 0 | 1 | 2;
  studio: 0 | 1 | 2;
  wardrobe: 0 | 1 | 2;
  manager: boolean;
};

export type Track = {
  id: string;
  title: string;
  status: TrackStatus;
  quality: number;
  streams: number;
  weekOut: number | null;
  weeksLive: number;
  peak: number | null;
  visual: boolean;
  weekly: number[];
  promo: number;
  lastNight: number;
  feat: string | null;
  featCut: number;
  earned: number;
  kind: ProjectKind;
  platform: PlatformId | null;
  style: string;
  theme: string;
  parts: SongParts;
  /** Morning this master should hit the count. Null until you pick a date. */
  dropOn: number | null;
  /** Album track id, when this song is filed on one. */
  albumOf: string | null;
  /** Day the song was cut. */
  made: number | null;
};

export type FeedItem = {
  id: string;
  week: number;
  title: string;
  body: string;
  tone: Tone;
};

export type Award = {
  id: string;
  name: string;
  week: number;
};

export type Npc = {
  name: string;
  title: string;
  score: number;
  weeksOn: number;
  peak: number;
  mood: number;
  fee: number;
};

export type ChartRow = {
  rank: number;
  name: string;
  title: string;
  score: number;
  you: boolean;
  move: number | null;
  weeks: number;
  peak: number;
  /** Came back after falling off. */
  back?: boolean;
};

export type Mail = {
  id: string;
  day: number;
  from: string;
  title: string;
  body: string;
  kind: MailKind;
  offer?: { name: string; cut: number; advance: number; due: number; weeks: number };
};

export type LabelDeal = {
  name: string;
  cut: number;
  due: number;
  made: number;
  weeksLeft: number;
};

export type PlatformId = "wire" | "nightbus" | "room";
export type ClassSkill = "pen" | "flow" | "vocals" | "prod";
export type DegreeId = "college" | "university" | "masters" | "law";
export type JobPath =
  | "starter"
  | "retail"
  | "food"
  | "transport"
  | "health"
  | "business"
  | "tech"
  | "entertainment"
  | "construction"
  | "education"
  | "law";

export type Employment = {
  id: string;
  hiredOn: number;
  paidOn: number;
  days: number;
};

export type DegreeProgress = {
  id: DegreeId;
  year: number;
  attended: number;
  paidThrough: number;
};

export type DegreesHeld = Record<DegreeId, boolean>;
export type PathDays = Partial<Record<JobPath, number>>;

export type School = {
  skill: ClassSkill;
  name: string;
  left: number;
};

export type Loan = {
  owe: number;
  dueDay: number;
};

export type Desk = {
  roster: string[];
};

export type StaffId = "engineer" | "booker";
export type StaffRoster = Record<StaffId, boolean>;
export type PlatformNight = Record<PlatformId, number>;

export type SocialPost = {
  app: "instagram" | "x";
  day: number;
  text: string;
  title: string;
};

export type TikClip = {
  id: string;
  day: number;
  title: string;
  views: number;
  kind: "vlog" | "bts" | "song" | "album";
  /** The song or album this clip pushes. Empty for a vlog. */
  trackId: string;
};

/** Platform stats are not the career fan count. Each app keeps its own numbers. */
export type MediaBook = {
  tiktok: { followers: number; views: number; uses: number };
  instagram: { followers: number; visits: number; reach: number };
  x: { followers: number; impressions: number };
  youtube: { subscribers: number; views: number };
  spotify: { followers: number; streams: number; listeners: number };
  apple: { plays: number; listeners: number };
  ytmusic: { streams: number; listeners: number };
  /** Posts the player actually sent. Releases are not posts. */
  posts: SocialPost[];
  /** Clips the player posted on TikTok. Song uses are separate. */
  clips: TikClip[];
  /** One picture for every app. Empty means the career look is used. */
  avatar: string;
  /** Last morning's explanation. Saved so a reload does not apply it again. */
  notes: string[];
  notedOn: number;
};

export type BeatCut = {
  id: string;
  title: string;
  pay: number;
  day: number;
};

export type Band = {
  name: string;
  mates: string[];
};

export type Gig = {
  id: string;
  kind: "audition" | "kpop" | "feature" | "produce";
  from: string;
  pay: number;
  cut: number;
  energy: number;
  blurb: string;
};

export type Result = {
  title: string;
  body: string;
  tone: Tone;
  blocking: boolean;
};

export type BizProduct = "Tees" | "Studio hours" | "Beat packs";

export type Business = {
  name: string;
  product: BizProduct;
  employees: number;
  price: number;
  marketing: 0 | 1 | 2;
  stock: number;
  lastIncome: number;
  lastCost: number;
};

export type BondStatus =
  | "stranger"
  | "acquaintance"
  | "associate"
  | "friend"
  | "close"
  | "best"
  | "rival"
  | "enemy";

export type Romance = "none" | "dating" | "ex";

export type Bond = {
  friendship: number;
  respect: number;
  trust: number;
  strain: number;
  met: number | null;
  history: { day: number; text: string }[];
  romance: Romance;
  last: number;
};

export type CircleNote = {
  id: string;
  day: number;
  from: string;
  kind: "friend" | "collab" | "event" | "jealous" | "apology" | "crew" | "intro" | "help" | "congrats" | "fight";
  text: string;
  open: boolean;
};

export type Crew = {
  name: string;
  members: string[];
  pop: number;
  rival: string;
};

export type Industry = {
  loyal: number;
  generous: number;
  respected: number;
  difficult: number;
  controversial: number;
  fake: number;
};

/** A verse price locked by a conversation. Charged later, when the song is made. */
export type CircleAsk = {
  name: string;
  price: number;
  until: number;
  cut: number;
};

export type Career = {
  version: 1 | 2;
  started: boolean;
  look: LookId;
  city: string;
  nick: string;
  fullName: string;
  age: number;
  /** Age on day 1. The shown age is this plus whole calendar years. */
  bornAge: number;
  /** 0 keeps the original March 2026 calendar. A year starts the career on Jan 1. */
  startYear: number;
  gender: "male" | "female";
  death: "standard" | "off";
  level: "standard" | "hardcore";
  taxes: "standard" | "heavy";
  sandbox: boolean;
  homeTier: 0 | 1 | 2;
  software: 0 | 1 | 2;
  path: PathId;
  pace: Pace;
  week: number;
  day: number;
  cash: number;
  fans: number;
  streams: number;
  energy: number;
  maxEnergy: number;
  fame: number;
  hype: number;
  reputation: number;
  skills: Skills;
  gear: Gear;
  rack: Rack;
  tracks: Track[];
  feed: FeedItem[];
  awards: string[];
  awardLog: Award[];
  label: LabelDeal | null;
  bestRank: number | null;
  shows: number;
  /** A room already booked the player. Play the room stays open until they play it. */
  showBooked: boolean;
  /** A tour offer was accepted. The song count stays open until the leg is played. */
  tourBooked: boolean;
  videos: number;
  tab: Tab;
  lastResult: Result | null;
  seenIntro: boolean;
  npc: Npc[];
  lastRanks: Record<string, number>;
  chart: ChartRow[];
  mail: Mail[];
  relations: Record<string, number>;
  lifestyle: Lifestyle;
  merch: Record<MerchId, MerchRow>;
  books: Books;
  loan: Loan | null;
  desk: Desk | null;
  school: School | null;
  job: Employment | null;
  degree: DegreeProgress | null;
  degrees: DegreesHeld;
  pathDays: PathDays;
  staff: StaffRoster;
  platforms: PlatformNight;
  media: MediaBook;
  beats: BeatCut[];
  band: Band | null;
  gigs: Gig[];
  business: Business | null;
  creator: boolean;
  /** Artists the player has actually met. */
  met: string[];
  bonds: Record<string, Bond>;
  circleMail: CircleNote[];
  crew: Crew | null;
  industry: Industry;
  /** Charts, certifications, news, and the award season. Separate from industry reputation. */
  trade: import("@/game/industry").TradeBook;
  circleAsk: CircleAsk | null;
};
