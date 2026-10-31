import { create } from "zustand";
import { tone } from "@/game/audio";
import {
  ackIntro,
  act,
  answerMail,
  applyDesk,
  applyRoster,
  blankCareer,
  buy,
  buyLife,
  closeWeek,
  dismiss,
  eatAt,
  installPack,
  isCareer,
  migrate,
  pressAlbum,
  renameTrack,
  runTour,
  setMerch,
  sidePost,
  postSound,
  deleteClip,
  setAvatar,
  postTo,
  borrow,
  openDesk,
  signToDesk,
  enroll,
  attend,
  takeJob,
  quitJob,
  enrollDegree,
  leaveDegree,
  setStaff,
  pushPlatform,
  setNick,
  sandboxAdjust,
  setLook,
  setHome,
  setSoftware,
  setTab,
  startCareer,
  trainSkill,
  compose,
  drillPart,
  scheduleDrop,
  deleteTrack,
  filmSong,
  fileOnAlbum,
  submitGrammy,
  takeInterview,
  askLabel,
  buyRack,
  addFeat,
  practiceInstrument,
  audition,
  formBand,
  contributeBand,
  askMate,
  seekBoard,
  takeGig,
  passGig,
  street as streetAct,
  openBusiness,
  tuneBusiness,
  closeBusiness,
  workJob,
} from "@/game/logic";
import { runPeople, type PeopleAction } from "@/game/people";
import type { ActionId, BizProduct, Career, ClassSkill, FoodTier, LifeItem, LookId, PlatformId, ShopItem, Skills, StaffId, Tab, PartKey, RackId } from "@/game/types";
import type { DeskPatch, Session, StartInput, StartSeed } from "@/game/logic";

const KEY = "daniel-career-v1";

type Store = {
  career: Career;
  hydrate: () => void;
  start: (input: StartInput) => void;
  desk: (patch: DeskPatch) => void;
  install: (artists: StartSeed[]) => void;
  align: () => void;
  act: (id: ActionId) => void;
  buy: (item: ShopItem) => void;
  answer: (id: string, yes: boolean) => void;
  rename: (id: string, title: string) => void;
  train: (key: keyof Skills) => void;
  eatAt: (tier: FoodTier) => void;
  album: (title: string) => void;
  tour: () => void;
  life: (item: LifeItem) => void;
  merch: (id: import("@/game/types").MerchId, on: boolean) => void;
  clip: (kind: "bts" | "vlog") => void;
  sound: (trackId: string) => void;
  dropClip: (id: string) => void;
  avatar: (dataUrl: string) => void;
  postAt: (where: "instagram" | "x") => void;
  borrow: () => void;
  openLabel: () => void;
  sign: (name: string) => void;
  enroll: (skill: ClassSkill) => void;
  attend: () => void;
  staff: (id: StaffId, on: boolean) => void;
  push: (id: PlatformId) => void;
  compose: (session: Session) => void;
  drill: (id: string, key: PartKey) => void;
  schedule: (id: string, day: number) => void;
  removeTrack: (id: string) => void;
  film: (id: string) => void;
  file: (songId: string, albumId: string, title?: string) => void;
  submit: (trackId: string, category: import("@/game/industry").GrammyCategory) => void;
  interview: (name?: string) => void;
  askLabel: () => void;
  feature: (id: string, name: string, cut: number) => void;
  rack: (id: RackId) => void;
  nick: (name: string) => void;
  sandbox: (cashDelta: number, energyDelta: number) => void;
  look: (id: LookId) => void;
  practice: () => void;
  audition: () => void;
  seek: (kind: "audition" | "kpop" | "producer") => void;
  takeGig: (id: string) => void;
  passGig: (id: string) => void;
  street: (kind: "live" | "meet" | "give") => void;
  openBiz: (name: string, product: BizProduct) => void;
  tuneBiz: (patch: { employees?: number; price?: number; marketing?: 0 | 1 | 2 }) => void;
  closeBiz: () => void;
  work: (kind: "counter" | "intern" | "door") => void;
  hire: (id: string) => void;
  quit: () => void;
  study: (id: import("@/game/types").DegreeId) => void;
  leaveSchool: () => void;
  people: (action: PeopleAction) => void;
  band: (name: string) => void;
  contribute: () => void;
  mate: (name: string) => void;
  home: (tier: 0 | 1 | 2) => void;
  software: (tier: 1 | 2) => void;
  close: () => void;
  dismiss: () => void;
  ackIntro: () => void;
  setTab: (tab: Tab) => void;
  reset: () => void;
};

function save(c: Career) {
  try {
    if (c.started) localStorage.setItem(KEY, JSON.stringify(c));
    else localStorage.removeItem(KEY);
  } catch {
    /* private mode */
  }
}

export const useGame = create<Store>((set, get) => ({
  career: blankCareer(),
  hydrate: () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (isCareer(parsed)) set({ career: migrate(parsed) });
    } catch {
      /* ignore bad saves */
    }
  },
  start: (input) => {
    const next = startCareer(input);
    save(next);
    tone("good");
    set({ career: next });
  },
  desk: (patch) => {
    const next = applyDesk(get().career, patch);
    save(next);
    tone("tap");
    set({ career: next });
  },
  install: (artists) => {
    const next = installPack(get().career, artists);
    save(next);
    tone("good");
    set({ career: next });
  },
  align: () => {
    const next = applyRoster(get().career);
    if (next === get().career) return;
    save(next);
    set({ career: next });
  },
  act: (id) => {
    const next = act(get().career, id);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "tap");
    set({ career: next });
  },
  buy: (item) => {
    const next = buy(get().career, item);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "good");
    set({ career: next });
  },
  answer: (id, yes) => {
    const next = answerMail(get().career, id, yes);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "good");
    set({ career: next });
  },
  rename: (id, title) => {
    const next = renameTrack(get().career, id, title);
    save(next);
    set({ career: next });
  },
  train: (key) => {
    const next = trainSkill(get().career, key);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "good");
    set({ career: next });
  },
  eatAt: (tier) => {
    const next = eatAt(get().career, tier);
    save(next);
    tone("tap");
    set({ career: next });
  },
  album: (title) => {
    const next = pressAlbum(get().career, title);
    save(next);
    tone(next.lastResult?.tone === "good" ? "good" : "tap");
    set({ career: next });
  },
  tour: () => {
    const next = runTour(get().career);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "good");
    set({ career: next });
  },
  life: (item) => {
    const next = buyLife(get().career, item);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "good");
    set({ career: next });
  },
  merch: (id, on) => {
    const next = setMerch(get().career, id, on);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "good");
    set({ career: next });
  },
  clip: (kind) => {
    const next = sidePost(get().career, kind);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "tap");
    set({ career: next });
  },
  sound: (trackId) => {
    const next = postSound(get().career, trackId);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "tap");
    set({ career: next });
  },
  dropClip: (id) => {
    const next = deleteClip(get().career, id);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "tap");
    set({ career: next });
  },
  avatar: (dataUrl) => {
    const next = setAvatar(get().career, dataUrl);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "tap");
    set({ career: next });
  },
  postAt: (where) => {
    const next = postTo(get().career, where);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "tap");
    set({ career: next });
  },
  borrow: () => {
    const next = borrow(get().career);
    save(next);
    tone("tap");
    set({ career: next });
  },
  openLabel: () => {
    const next = openDesk(get().career);
    save(next);
    tone(next.lastResult?.tone === "good" ? "good" : "tap");
    set({ career: next });
  },
  sign: (name) => {
    const next = signToDesk(get().career, name);
    save(next);
    tone(next.lastResult?.tone === "good" ? "good" : "tap");
    set({ career: next });
  },
  enroll: (skill) => {
    const next = enroll(get().career, skill);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "good");
    set({ career: next });
  },
  attend: () => {
    const next = attend(get().career);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "good");
    set({ career: next });
  },
  staff: (id, on) => {
    const next = setStaff(get().career, id, on);
    save(next);
    tone("tap");
    set({ career: next });
  },
  push: (id) => {
    const next = pushPlatform(get().career, id);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "tap");
    set({ career: next });
  },
  compose: (session) => {
    const next = compose(get().career, session);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : next.lastResult?.tone === "good" ? "good" : "tap");
    set({ career: next });
  },
  drill: (id, key) => {
    const next = drillPart(get().career, id, key);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "tap");
    set({ career: next });
  },
  schedule: (id, day) => {
    const next = scheduleDrop(get().career, id, day);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "good");
    set({ career: next });
  },
  removeTrack: (id) => {
    const next = deleteTrack(get().career, id);
    save(next);
    tone("tap");
    set({ career: next });
  },
  film: (id) => {
    const next = filmSong(get().career, id);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "good");
    set({ career: next });
  },
  file: (songId, albumId, title) => {
    const next = fileOnAlbum(get().career, songId, albumId, title);
    save(next);
    tone("tap");
    set({ career: next });
  },
  submit: (trackId, category) => {
    const next = submitGrammy(get().career, trackId, category);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "good");
    set({ career: next });
  },
  interview: (name) => {
    const next = takeInterview(get().career, name);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "tap");
    set({ career: next });
  },
  askLabel: () => {
    const next = askLabel(get().career);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "good");
    set({ career: next });
  },
  feature: (id, name, cut) => {
    const next = addFeat(get().career, id, name, cut);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "good");
    set({ career: next });
  },
  rack: (id) => {
    const next = buyRack(get().career, id);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "good");
    set({ career: next });
  },
  nick: (name) => {
    const next = setNick(get().career, name);
    save(next);
    set({ career: next });
  },
  sandbox: (cashDelta, energyDelta) => {
    const next = sandboxAdjust(get().career, cashDelta, energyDelta);
    save(next);
    set({ career: next });
  },
  look: (id) => {
    const next = setLook(get().career, id);
    save(next);
    tone("tap");
    set({ career: next });
  },
  practice: () => {
    const next = practiceInstrument(get().career);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "good");
    set({ career: next });
  },
  audition: () => {
    const next = audition(get().career);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "good");
    set({ career: next });
  },
  seek: (kind) => {
    const next = seekBoard(get().career, kind);
    save(next);
    tone(next.lastResult?.tone === "good" ? "good" : "tap");
    set({ career: next });
  },
  takeGig: (id) => {
    const next = takeGig(get().career, id);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "good");
    set({ career: next });
  },
  passGig: (id) => {
    const next = passGig(get().career, id);
    save(next);
    tone("tap");
    set({ career: next });
  },
  street: (kind) => {
    const next = streetAct(get().career, kind);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "good");
    set({ career: next });
  },
  openBiz: (name, product) => {
    const next = openBusiness(get().career, name, product);
    save(next);
    tone(next.lastResult?.tone === "good" ? "good" : "tap");
    set({ career: next });
  },
  tuneBiz: (patch) => {
    const next = tuneBusiness(get().career, patch);
    if (next === get().career) return;
    save(next);
    set({ career: next });
  },
  closeBiz: () => {
    const next = closeBusiness(get().career);
    save(next);
    tone("tap");
    set({ career: next });
  },
  work: (kind) => {
    const next = workJob(get().career, kind);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "good");
    set({ career: next });
  },
  hire: (id) => {
    const next = takeJob(get().career, id);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "good");
    set({ career: next });
  },
  quit: () => {
    const next = quitJob(get().career);
    save(next);
    tone("tap");
    set({ career: next });
  },
  study: (id) => {
    const next = enrollDegree(get().career, id);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "good");
    set({ career: next });
  },
  leaveSchool: () => {
    const next = leaveDegree(get().career);
    save(next);
    tone("tap");
    set({ career: next });
  },
  band: (name) => {
    const next = formBand(get().career, name);
    save(next);
    tone(next.lastResult?.tone === "good" ? "good" : "tap");
    set({ career: next });
  },
  contribute: () => {
    const next = contributeBand(get().career);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "good");
    set({ career: next });
  },
  mate: (name) => {
    const next = askMate(get().career, name);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "good");
    set({ career: next });
  },
  home: (tier) => {
    const next = setHome(get().career, tier);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "good");
    set({ career: next });
  },
  software: (tier) => {
    const next = setSoftware(get().career, tier);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "good");
    set({ career: next });
  },
  people: (action) => {
    const next = runPeople(get().career, action);
    save(next);
    tone(next.lastResult?.tone === "bad" ? "bad" : "good");
    set({ career: next });
  },
  close: () => {
    const next = closeWeek(get().career);
    save(next);
    tone("week");
    set({ career: next });
  },
  dismiss: () => {
    const next = dismiss(get().career);
    save(next);
    set({ career: next });
  },
  ackIntro: () => {
    const next = ackIntro(get().career);
    save(next);
    set({ career: next });
  },
  setTab: (tab) => {
    set({ career: setTab(get().career, tab) });
  },
  reset: () => {
    const next = blankCareer();
    save(next);
    set({ career: next });
  },
}));
