import type { ClassSkill, Gear, LookId, MerchId, PathId, PlatformId, Rack, RackId, Skills, StaffId } from "@/game/types";

export const LOOKS: {
  id: LookId;
  name: string;
  line: string;
  bonus: keyof Skills;
  bonusLabel: string;
  src: string;
}[] = [
  {
    id: "hoodie",
    name: "After hours",
    line: "Hoodie, brass chain, quiet heat.",
    bonus: "flow",
    bonusLabel: "Flow",
    src: "/looks/hoodie.jpg",
  },
  {
    id: "leather",
    name: "Night bus",
    line: "Leather, city light, a little mean.",
    bonus: "stage",
    bonusLabel: "Stage",
    src: "/looks/leather.jpg",
  },
  {
    id: "tailor",
    name: "Cut sharp",
    line: "Black coat, brass ear, no wasted motion.",
    bonus: "biz",
    bonusLabel: "Business",
    src: "/looks/tailor.jpg",
  },
  {
    id: "velvet",
    name: "Low room",
    line: "Velvet, gold ring, songs for 2 a.m.",
    bonus: "vocals",
    bonusLabel: "Vocals",
    src: "/looks/velvet.jpg",
  },
];

export const PATHS: Record<PathId, { label: string; line: string; skills: Skills }> = {
  rapper: {
    label: "Rapper",
    line: "Flow and rooms. The songs can be messy if the night is loud.",
    skills: {
      flow: 28,
      pen: 16,
      vocals: 18,
      prod: 12,
      stage: 22,
      biz: 12
    }
  },
  writer: {
    label: "Writer",
    line: "The page first. Hits come slower and stay longer.",
    skills: {
      flow: 14,
      pen: 32,
      vocals: 18,
      prod: 12,
      stage: 12,
      biz: 14
    }
  },
  producer: {
    label: "Producer",
    line: "Beats pay the rent while your name catches up.",
    skills: {
      flow: 12,
      pen: 16,
      vocals: 12,
      prod: 34,
      stage: 10,
      biz: 18
    }
  }
};
export const CITIES: { id: string; rent: number; scene: number; note: string }[] = [
  {
    id: "Chicago",
    rent: 460,
    scene: 1.06,
    note: "Cold rooms, loyal shows."
  },
  {
    id: "Atlanta",
    rent: 400,
    scene: 1.14,
    note: "The scene is crowded and fast."
  },
  {
    id: "Los Angeles",
    rent: 680,
    scene: 1.08,
    note: "Everyone is pitching. Rent knows."
  },
  {
    id: "New York",
    rent: 740,
    scene: 1.12,
    note: "Loud, expensive, worth a chorus."
  },
  {
    id: "London",
    rent: 700,
    scene: 1.02,
    note: "Polite crowds. They remember."
  },
  {
    id: "Lagos",
    rent: 280,
    scene: 1.16,
    note: "Nights run long. Word travels."
  }
];
export const ROSTER: { name: string; title: string; heat: number }[] = [
  {
    name: "Nicki Minaj",
    title: "Super Bass",
    heat: 98
  },
  {
    name: "Drake",
    title: "God's Plan",
    heat: 96
  },
  {
    name: "Beyoncé",
    title: "Cuff It",
    heat: 95
  },
  {
    name: "Taylor Swift",
    title: "Cruel Summer",
    heat: 94
  },
  {
    name: "Lil Wayne",
    title: "A Milli",
    heat: 92
  },
  {
    name: "Jay-Z",
    title: "Empire State of Mind",
    heat: 90
  },
  {
    name: "Kendrick Lamar",
    title: "Not Like Us",
    heat: 88
  },
  {
    name: "Travis Scott",
    title: "SICKO MODE",
    heat: 86
  },
  {
    name: "Cardi B",
    title: "Bodak Yellow",
    heat: 84
  },
  {
    name: "The Weeknd",
    title: "Blinding Lights",
    heat: 82
  },
  {
    name: "Rihanna",
    title: "Umbrella",
    heat: 78
  },
  {
    name: "SZA",
    title: "Kill Bill",
    heat: 76
  },
  {
    name: "Future",
    title: "Mask Off",
    heat: 74
  },
  {
    name: "Megan Thee Stallion",
    title: "Savage",
    heat: 72
  },
  {
    name: "Doja Cat",
    title: "Paint the Town Red",
    heat: 70
  },
  {
    name: "Bad Bunny",
    title: "Me Porto Bonito",
    heat: 68
  },
  {
    name: "Eminem",
    title: "Lose Yourself",
    heat: 66
  },
  {
    name: "Ice Spice",
    title: "Munch",
    heat: 64
  },
  {
    name: "Playboi Carti",
    title: "Magnolia",
    heat: 62
  },
  {
    name: "21 Savage",
    title: "Bank Account",
    heat: 60
  },
  {
    name: "Latto",
    title: "Big Energy",
    heat: 58
  },
  {
    name: "Lil Baby",
    title: "Yes Indeed",
    heat: 56
  },
  {
    name: "Olivia Rodrigo",
    title: "vampire",
    heat: 54
  },
  {
    name: "Tate McRae",
    title: "Housewife",
    heat: 52
  },
  {
    name: "Chappell Roan",
    title: "Good Luck, Babe!",
    heat: 50
  },
  {
    name: "Gunna",
    title: "fukumean",
    heat: 48
  }
];
const LEGACY_NAMES = new Set([
  "nova vale",
  "kite",
  "marlow",
  "june north",
  "saint rio",
  "low voltage",
  "pearl district",
  "ox",
  "mina sol",
  "the afters"
]);
export function isLegacyRoster(names: string[]) {
  return names.length > 0 && names.every((name) => LEGACY_NAMES.has(name.trim().toLowerCase()));
}
/** What a verse costs. Bigger names cost more. */
export function starFee(heat: number) {
  return Math.round(80 + Math.max(0, heat - 50) * 70);
}
/** Percent of that song they keep. */
export function starCut(heat: number) {
  return Math.max(8, Math.min(30, Math.round(10 + (heat - 50) * .3)));
}
export const MERCH: { id: MerchId; name: string; upfront: number; daily: number; perFan: number; note: string }[] = [
  {
    id: "cups",
    name: "Cups",
    upfront: 80,
    daily: 8,
    perFan: .05,
    note: "Cheap to print. Dead stock until people know the name."
  },
  {
    id: "socks",
    name: "Socks",
    upfront: 140,
    daily: 12,
    perFan: .07,
    note: "Small margin. Followers have to actually see them."
  },
  {
    id: "tees",
    name: "T-shirts",
    upfront: 420,
    daily: 22,
    perFan: .12,
    note: "The usual table. Pays once the crowd is real."
  },
  {
    id: "hoodies",
    name: "Hoodies",
    upfront: 980,
    daily: 40,
    perFan: .16,
    note: "Costs more to cut. Worth it when you're on the chart."
  },
  {
    id: "jeans",
    name: "Jeans",
    upfront: 1800,
    daily: 55,
    perFan: .18,
    note: "Slow money. Don't turn this on broke."
  }
];
export const PLATFORMS: { id: PlatformId; name: string; share: number }[] = [
  {
    id: "wire",
    name: "Spotify",
    share: .46
  },
  {
    id: "nightbus",
    name: "Apple Music",
    share: .34
  },
  {
    id: "room",
    name: "YouTube Music",
    share: .2
  }
];
export const CLASSES: { skill: ClassSkill; name: string; tuition: number; sessions: number; note: string }[] = [
  {
    skill: "pen",
    name: "Lyrics",
    tuition: 220,
    sessions: 4,
    note: "Tuition up front. Each class is energy, not another bill."
  },
  {
    skill: "flow",
    name: "Flow",
    tuition: 220,
    sessions: 4,
    note: "The room drills the pocket. Four sessions, energy only after you enroll."
  },
  {
    skill: "vocals",
    name: "Voice",
    tuition: 240,
    sessions: 4,
    note: "Takes and playback. Four sessions."
  },
  {
    skill: "prod",
    name: "Production",
    tuition: 260,
    sessions: 4,
    note: "The board, not a lecture. Four sessions. This one changes the record."
  }
];
export const STAFF: { id: StaffId; name: string; wage: number; fame: number; note: string }[] = [{
  id: "engineer",
  name: "Engineer",
  wage: 90,
  fame: 12,
  note: "Sits the vocal. The next record comes out cleaner. $90 leaves every morning until you let them go."
}, {
  id: "booker",
  name: "Booker",
  wage: 70,
  fame: 28,
  note: "Fills the room. The door pays more. $70 leaves every morning until you let them go."
}];
export const RACK: { id: RackId; name: string; base: number }[] = [
  {
    id: "mic",
    name: "MICROPHONE",
    base: 180
  },
  {
    id: "phones",
    name: "HEADPHONES",
    base: 140
  },
  {
    id: "monitors",
    name: "MONITORS",
    base: 220
  },
  {
    id: "proof",
    name: "SOUNDPROOF.",
    base: 300
  },
  {
    id: "laptop",
    name: "LAPTOP",
    base: 260
  },
  {
    id: "card",
    name: "SOUNDCARD",
    base: 200
  }
];
export function emptyRack(): Rack {
  return {
    mic: 0,
    phones: 0,
    monitors: 0,
    proof: 0,
    laptop: 0,
    card: 0
  };
}
/** 0.0 with a bare room. Six pieces at level 1 reads as 1.0. */
export function rackScore(rack: Rack | null | undefined) {
  if (!rack) return 0;
  const sum = RACK.reduce((total, piece) => total + (rack[piece.id] ?? 0), 0);
  return Math.round(sum / RACK.length * 10) / 10;
}
export function roomRating(gear: Gear, rack: Rack | null | undefined) {
  const legacy = gear.mic * .9 + gear.studio * 1.3;
  return Math.round((legacy + rackScore(rack)) * 10) / 10;
}
/** What you can cut a song as. Arrows on the song sheet. */
export const STYLES = [
  "Hip-Hop",
  "Trap",
  "Drill",
  "R&B",
  "Afrobeats",
  "Pop",
  "K-Pop",
  "Reggae",
  "Soul",
  "Blues"
];
export const THEMES = [
  "Night",
  "Money",
  "Love",
  "Street",
  "Fame",
  "Heartbreak",
  "Party",
  "Addiction",
  "Freedom",
  "Motherland"
];
export const LYRIC_DESKS = [
  {
    name: "You",
    rating: 0,
    price: 0
  },
  {
    name: "Pen pal",
    rating: 1.6,
    price: 120
  },
  {
    name: "Page",
    rating: 5.4,
    price: 2400
  },
  {
    name: "Ghostwriter",
    rating: 9.4,
    price: 15000
  }
];
export const PROD_DESKS = [
  {
    name: "You",
    rating: 0,
    price: 0
  },
  {
    name: "Bard",
    rating: 1.4,
    price: 150
  },
  {
    name: "Booth",
    rating: 4.6,
    price: 900
  },
  {
    name: "Glass Prod",
    rating: 8.6,
    price: 7500
  }
];
export const ROOM_DESKS = [
  {
    name: "My studio",
    rating: 0,
    price: 0
  },
  {
    name: "Rent a booth",
    rating: 2.2,
    price: 180
  },
  {
    name: "Rent studio",
    rating: 6.2,
    price: 650
  },
  {
    name: "Big room",
    rating: 8.1,
    price: 2200
  }
];
export const HOMES: { tier: 0 | 1 | 2; name: string; month: number; quality: number; cost: number }[] = [
  {
    tier: 0,
    name: "Studio apartment",
    month: 200,
    quality: 1,
    cost: 0
  },
  {
    tier: 1,
    name: "One bedroom",
    month: 640,
    quality: 2,
    cost: 4200
  },
  {
    tier: 2,
    name: "House",
    month: 1800,
    quality: 3,
    cost: 14000
  }
];
export const SOFTWARE: { tier: 1 | 2; name: string; cost: number; note: string }[] = [{
  tier: 1,
  name: "Desk DAW",
  cost: 350,
  note: "Your own production rating picks up a little."
}, {
  tier: 2,
  name: "Studio suite",
  cost: 1600,
  note: "The mix comes back cleaner."
}];
export const LABELS = [
  "Northline",
  "Room Tone",
  "Low Desk",
  "Civic",
  "Night Bus",
  "Afterlabel"
];
export const TITLE_LEFT = [
  "Midnight",
  "Gold",
  "After",
  "Quiet",
  "Chrome",
  "Low",
  "North",
  "Glass",
  "Heat",
  "Soft",
  "Late",
  "Brass",
  "Slow",
  "Open",
  "Room"
];
export const TITLE_RIGHT = [
  "Hours",
  "Signal",
  "Mouth",
  "City",
  "Light",
  "Talk",
  "Window",
  "Run",
  "Key",
  "Week",
  "Floor",
  "Call",
  "Name",
  "Door",
  "Line"
];
export const SKILLS: { key: keyof Skills; label: string }[] = [
  {
    key: "pen",
    label: "Lyrics"
  },
  {
    key: "flow",
    label: "Flow"
  },
  {
    key: "vocals",
    label: "Voice"
  },
  {
    key: "prod",
    label: "Production"
  },
  {
    key: "stage",
    label: "Stage"
  },
  {
    key: "biz",
    label: "Business"
  }
];
export const TIERS = [
  {
    name: "Bedroom",
    at: 0
  },
  {
    name: "Local",
    at: 12
  },
  {
    name: "Buzz",
    at: 28
  },
  {
    name: "Roster",
    at: 46
  },
  {
    name: "Headliner",
    at: 68
  },
  {
    name: "Legend",
    at: 88
  }
];
export const SHOP: {
  mic: { name: string; cost: number; blurb: string }[];
  studio: { name: string; cost: number; blurb: string }[];
  wardrobe: { name: string; cost: number; blurb: string }[];
  manager: { name: string; cost: number; blurb: string };
} = {
  mic: [{
    name: "Used condenser",
    cost: 750,
    blurb: "Less hiss. Cleaner takes."
  }, {
    name: "Booth mic",
    cost: 2400,
    blurb: "The vocal sits in the mix."
  }],
  studio: [{
    name: "Bedroom rig",
    cost: 1400,
    blurb: "You stop borrowing rooms."
  }, {
    name: "Proper room",
    cost: 4800,
    blurb: "Tracks leave sounding finished."
  }],
  wardrobe: [{
    name: "One good fit",
    cost: 500,
    blurb: "Photos stop looking accidental."
  }, {
    name: "A look",
    cost: 1800,
    blurb: "The camera knows who you are."
  }],
  manager: {
    name: "A manager",
    cost: 3200,
    blurb: "Someone else answers. Fans tick up every week."
  }
};
export function lookOf(id: string) {
  return LOOKS.find((l) => l.id === id) ?? LOOKS[0];
}
export function cityOf(id: string) {
  return CITIES.find((c) => c.id === id) ?? CITIES[0];
}
export function tierOf(fame: number) {
  let current = TIERS[0];
  for (const tier of TIERS) if (fame >= tier.at) current = tier;
  const next = TIERS.find((t) => t.at > current.at) ?? null;
  return {
    current,
    next
  };
}
export function venueFor(fame: number) {
  if (fame < 15) return {
    name: "Open mic",
    door: 10,
    base: 22,
    need: 0
  };
  if (fame < 34) return {
    name: "The back room",
    door: 16,
    base: 40,
    need: 20
  };
  if (fame < 56) return {
    name: "Club night",
    door: 28,
    base: 90,
    need: 36
  };
  if (fame < 78) return {
    name: "The theater",
    door: 42,
    base: 200,
    need: 52
  };
  return {
    name: "Arena night",
    door: 70,
    base: 760,
    need: 68
  };
}
