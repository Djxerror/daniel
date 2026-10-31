import { fmt } from "@/game/format";
import type { MediaBook, PlatformNight, SocialPost, TikClip } from "@/game/types";

/** Display names for the three audio lanes. Ids stay put so old saves still point at the same lane. */
export const LANE_NAME = {
  wire: "Spotify",
  nightbus: "Apple Music",
  room: "YouTube Music",
} as const;

export function emptyMedia(): MediaBook {
  return {
    tiktok: { followers: 0, views: 0, uses: 0 },
    instagram: { followers: 0, visits: 0, reach: 0 },
    x: { followers: 0, impressions: 0 },
    youtube: { subscribers: 0, views: 0 },
    spotify: { followers: 0, streams: 0, listeners: 0 },
    apple: { plays: 0, listeners: 0 },
    ytmusic: { streams: 0, listeners: 0 },
    notes: [],
    notedOn: 0,
    posts: [],
    clips: [],
    avatar: "",
  };
}

/** Split a platform total across songs so a row cannot show more plays than the profile. */
export function splitPlays(weights: number[], total: number): number[] {
  const clean = weights.map((weight) => Math.max(0, Math.round(weight)));
  const sum = clean.reduce((a, b) => a + b, 0);
  const cap = Math.max(0, Math.round(total));
  if (clean.length === 0) return [];
  if (sum <= 0 || cap <= 0) return clean.map(() => 0);
  let left = cap;
  return clean.map((weight, index) => {
    if (index === clean.length - 1) return left;
    const slice = Math.min(left, Math.round((cap * weight) / sum));
    left -= slice;
    return slice;
  });
}

function avatarFrom(raw: unknown): string {
  if (typeof raw !== "string") return "";
  if (!raw.startsWith("data:image/")) return "";
  if (raw.length < 32 || raw.length > 180_000) return "";
  return raw;
}

function n(value: unknown): number {
  const x = typeof value === "number" ? value : 0;
  if (!Number.isFinite(x) || x < 0) return 0;
  return Math.round(x);
}

/** Split an existing career audience once. The ratios are different on purpose so the apps do not share one number. */
function seedMedia(totals: { fans: number; streams: number }): MediaBook {
  const fans = n(totals.fans);
  const streams = n(totals.streams);
  const spotifyStreams = Math.round(streams * 0.46);
  const applePlays = Math.round(streams * 0.34);
  const ytStreams = Math.max(0, streams - spotifyStreams - applePlays);
  return {
    tiktok: { followers: Math.round(fans * 0.22), views: 0, uses: 0 },
    instagram: { followers: Math.round(fans * 0.46), visits: 0, reach: 0 },
    x: { followers: Math.round(fans * 0.17), impressions: 0 },
    youtube: { subscribers: Math.round(fans * 0.09), views: 0 },
    spotify: {
      followers: Math.round(fans * 0.62),
      streams: spotifyStreams,
      listeners: Math.min(spotifyStreams, Math.round(spotifyStreams * 0.18 + fans * 0.35)),
    },
    apple: { plays: applePlays, listeners: Math.min(applePlays, Math.round(applePlays * 0.34)) },
    ytmusic: { streams: ytStreams, listeners: Math.min(ytStreams, Math.round(ytStreams * 0.36)) },
    notes: [],
    notedOn: 0,
    posts: [],
    clips: [],
    avatar: "",
  };
}

function postsFrom(raw: unknown): SocialPost[] {
  if (!Array.isArray(raw)) return [];
  const out: SocialPost[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Partial<SocialPost>;
    if (row.app !== "instagram" && row.app !== "x") continue;
    const text = typeof row.text === "string" ? row.text.slice(0, 180) : "";
    const title = typeof row.title === "string" && row.title.trim() ? row.title.slice(0, 40) : "Post";
    if (!text) continue;
    out.push({ app: row.app, day: n(row.day), text, title });
  }
  return out.slice(-24);
}

function clipsFrom(raw: unknown): TikClip[] {
  if (!Array.isArray(raw)) return [];
  const out: TikClip[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Partial<TikClip>;
    if (row.kind !== "vlog" && row.kind !== "bts" && row.kind !== "song" && row.kind !== "album") continue;
    const title = typeof row.title === "string" && row.title.trim() ? row.title.slice(0, 40) : row.kind === "album" ? "Album" : row.kind === "song" ? "Song" : row.kind === "vlog" ? "Vlog" : "Behind the song";
    const id = typeof row.id === "string" && row.id.trim() ? row.id.slice(0, 48) : `old-${out.length}-${n(row.day)}`;
    out.push({
      id,
      day: n(row.day),
      title,
      views: n(row.views),
      kind: row.kind,
      trackId: typeof row.trackId === "string" ? row.trackId.slice(0, 48) : "",
    });
  }
  return out.slice(-24);
}

export function mediaFrom(raw: unknown, totals: { fans: number; streams: number }): MediaBook {
  if (!raw || typeof raw !== "object") return seedMedia(totals);
  const o = raw as Partial<MediaBook>;
  if (!o.spotify || typeof o.spotify !== "object") return seedMedia(totals);
  return {
    tiktok: { followers: n(o.tiktok?.followers), views: n(o.tiktok?.views), uses: n(o.tiktok?.uses) },
    instagram: { followers: n(o.instagram?.followers), visits: n(o.instagram?.visits), reach: n(o.instagram?.reach) },
    x: { followers: n(o.x?.followers), impressions: n(o.x?.impressions) },
    youtube: { subscribers: n(o.youtube?.subscribers), views: n(o.youtube?.views) },
    spotify: { followers: n(o.spotify?.followers), streams: n(o.spotify?.streams), listeners: n(o.spotify?.listeners) },
    apple: { plays: n(o.apple?.plays), listeners: n(o.apple?.listeners) },
    ytmusic: { streams: n(o.ytmusic?.streams), listeners: n(o.ytmusic?.listeners) },
    notes: Array.isArray(o.notes) ? o.notes.filter((line): line is string => typeof line === "string").slice(0, 4) : [],
    notedOn: n(o.notedOn),
    posts: postsFrom(o.posts),
    clips: clipsFrom(o.clips),
    avatar: avatarFrom(o.avatar),
  };
}

/**
 * Day 1 through day 21 match the old 10% daily drop.
 * After that, a song people actually liked keeps a short tail instead of vanishing.
 * The tail itself fades, so a hit does not pay forever.
 */
export function catalogDecay(age: number, quality: number, visual: boolean): number {
  const early = Math.pow(0.9, Math.max(0, age - 1));
  if (age <= 21) return early;
  const held = (quality >= 70 ? 0.1 : quality >= 55 ? 0.05 : 0.02) + (visual ? 0.015 : 0);
  const later = held * Math.pow(0.985, age - 21);
  return Math.max(later, early);
}

function bumpFollowers(current: number, raw: number, cap: number): number {
  if (raw <= 0) return 0;
  const soft = raw / (1 + current / 2500);
  return Math.max(0, Math.min(cap, Math.round(soft)));
}

export type ReleasePulse = {
  id?: string;
  title: string;
  kind: "single" | "album" | "video";
  quality: number;
  promo: number;
  visual: boolean;
  age: number;
  night: number;
  justOut: boolean;
};

/** How hard a live TikTok is still pushing this release. Caps so extra posts cannot stack forever. */
export function soundPush(clips: TikClip[] | undefined, track: { id: string; albumOf?: string | null }, day: number): number {
  if (!clips?.length) return 0;
  let push = 0;
  for (const clip of clips) {
    if (clip.kind !== "song" && clip.kind !== "album") continue;
    const age = day - clip.day;
    if (age < 0 || age > 14) continue;
    const hot = age <= 1 ? 0.16 : age <= 4 ? 0.1 : age <= 8 ? 0.06 : 0.03;
    if (clip.kind === "song" && clip.trackId === track.id) push += hot;
    else if (clip.kind === "album" && clip.trackId === track.id) push += hot;
    else if (clip.kind === "album" && track.albumOf && clip.trackId === track.albumOf) push += hot * 0.7;
  }
  return Math.min(0.28, push);
}

function clipWave(age: number): number {
  if (age <= 0 || age > 21) return 0;
  if (age === 1) return 1;
  if (age === 2) return 0.88;
  if (age === 3) return 0.72;
  return Math.pow(0.78, age - 3);
}

function growClips(media: MediaBook, day: number, songs: ReleasePulse[]): { clips: TikClip[]; added: number; note: string } {
  let added = 0;
  const best = { title: "", gain: 0, age: 0 };
  const clips = (media.clips ?? []).map((clip) => {
    const age = day - clip.day;
    const wave = clipWave(age);
    if (wave <= 0) return clip;
    const song = songs.find((row) => row.id && row.id === clip.trackId) ?? songs.find((row) => row.title === clip.title);
    const quality = song?.quality ?? 45;
    const weight = clip.kind === "album" ? 1.35 : clip.kind === "song" ? 1 : 0.45;
    const gain = Math.max(1, Math.round((36 + media.tiktok.followers * 0.04 + quality * 1.1) * wave * weight));
    added += gain;
    if (gain > best.gain) {
      best.title = clip.title;
      best.gain = gain;
      best.age = age;
    }
    return { ...clip, views: clip.views + gain };
  });
  const note = best.gain >= 100 && best.age <= 3 ? `${best.title} picked up ${fmt(best.gain)} TikTok views. That sound is still lifting the release.` : "";
  return { clips, added, note };
}

/**
 * Turns one morning of plays into separate platform stats.
 * Does not pay the player and does not copy one number onto every app.
 */
export function hearReleases(input: {
  media: MediaBook;
  day: number;
  songs: ReleasePulse[];
  parked: PlatformNight;
  reputation: number;
  albumDrops: { title: string; quality: number }[];
}): { media: MediaBook; notes: string[] } {
  const prev = input.media ?? emptyMedia();
  const media = mediaFrom(prev, { fans: 0, streams: 0 });
  // mediaFrom would reseed if spotify were missing. It is present, so totals are kept.
  const songs = input.songs;
  const weight = songs.reduce((sum, song) => sum + song.night, 0);
  const qualityWeight = songs.reduce((sum, song) => sum + song.night * song.quality, 0);
  const avgQ = weight > 0 ? qualityWeight / weight / 100 : 0.4;

  const spotToday = n(input.parked.wire);
  const appleToday = n(input.parked.nightbus);
  const ytMusicToday = n(input.parked.room);
  media.spotify.streams += spotToday;
  media.apple.plays += appleToday;
  media.ytmusic.streams += ytMusicToday;

  const listenRate = 0.22 + avgQ * 0.2;
  const spotListeners = Math.min(spotToday, Math.round(spotToday * listenRate));
  const appleListeners = Math.min(appleToday, Math.round(appleToday * listenRate * 0.86));
  const ytmListeners = Math.min(ytMusicToday, Math.round(ytMusicToday * listenRate * 0.74));
  media.spotify.listeners += spotListeners;
  media.apple.listeners += appleListeners;
  media.ytmusic.listeners += ytmListeners;

  let tiktokUses = 0;
  let tiktokViews = 0;
  let igVisits = 0;
  let xImpressions = 0;
  let ytViews = 0;
  let filmed = false;
  let lowEngage = false;
  let freshTitle = "";

  for (const song of songs) {
    if (song.night <= 0 && !song.justOut) continue;
    const q = Math.max(0, Math.min(1, song.quality / 100));
    const fit = 0.35 + q * 0.65;
    const promo = Math.max(0, Math.min(4, song.promo)) / 4;
    const fresh = song.age <= 7 ? 1 : song.age <= 30 ? 0.55 : 0.28;
    const soft = song.quality < 48 && song.promo >= 2 ? 0.25 : 1;
    if (song.quality < 48 && song.promo >= 2 && song.night > 0) lowEngage = true;
    if (song.justOut && song.kind !== "video" && !freshTitle) freshTitle = song.title;
    if (song.visual) filmed = true;
    const uses = Math.min(
      30 + Math.round(Math.sqrt(Math.max(0, song.night))),
      Math.round(song.night * 0.012 * (song.visual ? 1.7 : 0.5) * (0.45 + promo) * fit * fresh * soft),
    );
    tiktokUses += uses;
    tiktokViews += uses * (36 + Math.round(q * 70));
    igVisits += Math.round(song.night * 0.018 * (0.55 + promo * 0.9) * fit * (song.visual ? 1.25 : 0.75) * fresh * soft);
    xImpressions += Math.round(song.night * 0.2 * (0.35 + promo) * (0.45 + Math.min(1, input.reputation / 100)) * fresh * soft);
    if (song.visual) ytViews += Math.round(song.night * 0.2 * (0.65 + promo * 0.35) * fit * fresh);
    else ytViews += Math.round(song.night * 0.008 * fit);
  }

  const igReach = Math.round(igVisits * (1.6 + avgQ));
  const ttFollow = bumpFollowers(media.tiktok.followers, tiktokUses / 12, 12);
  const igFollow = bumpFollowers(media.instagram.followers, igVisits / 22, 8);
  const xFollow = bumpFollowers(media.x.followers, xImpressions / 360, 6);
  const ytFollow = bumpFollowers(media.youtube.subscribers, ytViews / 80, 10);
  const spFollow = bumpFollowers(media.spotify.followers, spotListeners / 40, 8);
  const brought = Math.min(Math.round(tiktokUses * 0.35), Math.round(spotToday * 0.06));

  media.tiktok.uses += tiktokUses;
  media.tiktok.views += tiktokViews;
  media.tiktok.followers += ttFollow;
  const grown = growClips(media, input.day, songs);
  media.clips = grown.clips;
  media.tiktok.views += grown.added;
  media.tiktok.followers += bumpFollowers(media.tiktok.followers, grown.added / 500, 4);
  media.instagram.visits += igVisits;
  media.instagram.reach += igReach;
  media.instagram.followers += igFollow;
  media.x.impressions += xImpressions;
  media.x.followers += xFollow;
  media.youtube.views += ytViews;
  media.youtube.subscribers += ytFollow;
  media.spotify.followers += spFollow;
  media.spotify.listeners += brought;

  for (const album of input.albumDrops) {
    const extra = 16 + Math.round(album.quality * 0.3);
    media.instagram.visits += extra;
    media.instagram.reach += extra * 2;
  }

  const notes: { score: number; text: string }[] = [];
  if (lowEngage) {
    notes.push({ score: 100, text: "Your promotional campaign increased discovery, but engagement remained low." });
  }
  if (input.albumDrops.length > 0) {
    notes.push({
      score: 92,
      text: `${input.albumDrops[0]!.title} opened a wider campaign. Plays already on those songs were not counted again.`,
    });
  }
  if (freshTitle && igVisits >= 15 && igFollow > 0) {
    notes.push({
      score: 90,
      text: `Your new release brought ${fmt(igVisits)} Instagram profile visits and ${igFollow} new follower${igFollow === 1 ? "" : "s"}.`,
    });
  } else if (igVisits >= 40 && igFollow > 0) {
    notes.push({ score: 70, text: `Instagram saw ${fmt(igVisits)} profile visits and ${igFollow} new follower${igFollow === 1 ? "" : "s"}.` });
  }
  if (grown.note) notes.push({ score: 60, text: grown.note });
  if (tiktokUses >= 5) notes.push({ score: 82, text: `Your song was used in ${fmt(tiktokUses)} TikTok videos.` });
  if (ytViews >= 400 && filmed) notes.push({ score: 76, text: `Your YouTube music video received ${fmt(ytViews)} views.` });
  const audioLead =
    appleToday > spotToday && appleToday >= ytMusicToday
      ? { n: appleToday, name: "Apple Music plays" }
      : ytMusicToday > spotToday
        ? { n: ytMusicToday, name: "YouTube Music streams" }
        : { n: spotToday, name: "Spotify streams" };
  if (audioLead.n >= 80) notes.push({ score: 86, text: `Your release generated ${fmt(audioLead.n)} additional ${audioLead.name}.` });
  if (brought >= 8) {
    notes.push({
      score: 64,
      text: `Those TikTok videos brought ${fmt(brought)} listeners to Spotify. That is separate from the streams.`,
    });
  }
  if (xImpressions >= 200 && xFollow > 0) {
    notes.push({ score: 54, text: `X showed ${fmt(xImpressions)} impressions and ${xFollow} new follower${xFollow === 1 ? "" : "s"}.` });
  }
  if (freshTitle && notes.length === 0) notes.push({ score: 40, text: `${freshTitle} is out. The audience did not move much.` });

  const picked = notes
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((line) => line.text);
  media.notes = picked;
  media.notedOn = input.day;
  return { media, notes: picked };
}
