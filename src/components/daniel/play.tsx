// @ts-nocheck
import { Fragment, useEffect, useRef, useState } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import {
  AudioLines, BarChart3, Bell, Calendar, Check, ChevronLeft, ChevronRight, Clapperboard,
  Disc, Droplet, Globe, Headphones, Home as HomeIcon, House, Megaphone, MessageCircle, Moon, Music,
  Pencil, Radio, Settings, Share2, ShoppingBag, Star, Users, Wallet, X, Zap, Plus, Search, Mic,
} from "lucide-react";
import { CLASSES, HOMES, LOOKS, LYRIC_DESKS, MERCH, PLATFORMS, PROD_DESKS, RACK, ROOM_DESKS, SHOP, SKILLS, SOFTWARE, STAFF, STYLES, THEMES, cityOf, lookOf, rackScore, tierOf } from "@/game/content";
import { CreatorDesk, CreatorLock } from "@/components/daniel/creator";
import { PeopleScreen } from "@/components/daniel/people-tab";
import { PhoneHome, GrammyNight, GrammyRoom, shrinkPhoto } from "@/components/daniel/phone-home";
import { versePrice } from "@/game/people";
import { certName } from "@/game/industry";
import { fmt, money, releaseOffset, shortStamp, simDate, weekdayLong } from "@/game/format";
import { COSTS, PART_ENERGY, PROMO_STEPS, SESSION_ENERGY, TRAIN_ENERGY, audience, businessGate, careerSheet, chartBid, featPrice, gradeLabel, monthlyBills, nightsUntilRent, preview, qualityBand, quoteSession, shopRates, streetBoard, tourQuote, type Session, type StreetKind } from "@/game/logic";
import { DEGREES, JOBS, JOB_PATHS, WEEKDAYS_IN_YEAR, dailyWage, degreeLock, jobById, jobLock } from "@/game/work";
import { setMuted } from "@/game/audio";
import { useGame } from "@/game/store";
import type { ActionId, BizProduct, Career, ChartRow, ClassSkill, DegreeId, FoodTier, Gear, JobPath, LifeItem, LookId, Mail, MediaBook, MerchId, Npc, PartKey, PathId, PlatformId, Rack, RackId, Skills as SkillBag, StaffId, StaffRoster } from "@/game/types";

const TABS = [
  { id: "home", icon: House, label: "Home" },
  { id: "skills", icon: AudioLines, label: "Create" },
  { id: "studio", icon: Music, label: "Music" },
  { id: "world", icon: Globe, label: "World" },
  { id: "wallet", icon: Wallet, label: "Wallet" },
  { id: "settings", icon: Settings, label: "Settings" },
];
const ROOTS = ["home", "skills", "studio", "world", "wallet", "settings"];


export function Play() {
	const career = useGame((s) => s.career);
	const act = useGame((s) => s.act);
	const street = useGame((s) => s.street);
	const openBiz = useGame((s) => s.openBiz);
	const tuneBiz = useGame((s) => s.tuneBiz);
	const closeBiz = useGame((s) => s.closeBiz);
	const answer = useGame((s) => s.answer);
	const buy = useGame((s) => s.buy);
	const close = useGame((s) => s.close);
	const dismiss = useGame((s) => s.dismiss);
	const reset = useGame((s) => s.reset);
	const train = useGame((s) => s.train);
	const eatAt = useGame((s) => s.eatAt);
	const album = useGame((s) => s.album);
	const tour = useGame((s) => s.tour);
	const life = useGame((s) => s.life);
	const rename = useGame((s) => s.rename);
	const desk = useGame((s) => s.desk);
	const install = useGame((s) => s.install);
	const align = useGame((s) => s.align);
	const stock = useGame((s) => s.merch);
	const clip = useGame((s) => s.clip);
	const sound = useGame((s) => s.sound);
	const dropClip = useGame((s) => s.dropClip);
	const setPhoto = useGame((s) => s.avatar);
	const postAt = useGame((s) => s.postAt);
	const borrow = useGame((s) => s.borrow);
	const openLabel = useGame((s) => s.openLabel);
	const sign = useGame((s) => s.sign);
	const mate = useGame((s) => s.mate);
	const enroll = useGame((s) => s.enroll);
	const attendClass = useGame((s) => s.attend);
	const startJob = useGame((s) => s.hire);
	const quitWork = useGame((s) => s.quit);
	const study = useGame((s) => s.study);
	const leaveSchool = useGame((s) => s.leaveSchool);
	const hire = useGame((s) => s.staff);
	const push = useGame((s) => s.push);
	const compose = useGame((s) => s.compose);
	const drill = useGame((s) => s.drill);
	const schedule = useGame((s) => s.schedule);
	const removeTrack = useGame((s) => s.removeTrack);
	const fileSong = useGame((s) => s.file);
	const addFeature = useGame((s) => s.feature);
	const buyRack = useGame((s) => s.rack);
	const setNick = useGame((s) => s.nick);
	const setLookId = useGame((s) => s.look);
	const moveHome = useGame((s) => s.home);
	const installSoft = useGame((s) => s.software);
	const ackIntro = useGame((s) => s.ackIntro);
	const [panel, setPanel] = useState("home");
	const [backTo, setBackTo] = useState("home");
	const [bioOn, setBioOn] = useState(false);
	const [albumName, setAlbumName] = useState("The Record");
	const [help, setHelp] = useState(false);
	const [creatorLock, setCreatorLock] = useState(false);
	const [tip, setTip] = useState(0);
	const [shopView, setShopView] = useState("menu");
	const [peoplePosts, setPeoplePosts] = useState(false);
	const [musicId, setMusicId] = useState(null);
	const people = useGame((s) => s.people);
	const look = lookOf(career.look);
	const year = career.startYear || void 0;
	useEffect(() => {
		align();
	}, [align]);
	useEffect(() => {
		try {
			setMuted(localStorage.getItem("daniel-sound") === "off");
		} catch {}
	}, []);
	function openSub(next) {
		setBioOn(false);
		setBackTo(panel);
		setPanel(next);
	}
	const orders = career.mail.filter((m) => m.kind === "order");
	const features = career.mail.filter((m) => m.kind === "feature");
	const feats = [...career.mail.filter((m) => m.kind === "label"), ...features];
	const events = career.mail.filter((m) => m.kind === "event");
	const lead = career.feed[0];
	const debutLine = lead && (lead.title === "Debut" || lead.title === "Premiere") ? `${lead.title} · ${lead.body.replace(/\s+/g, " ").slice(0, 52)}` : "";
	const streets = streetBoard(career);
	function go(id) {
		act(id);
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "sim-root relative flex h-full min-h-0 flex-col",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex h-full min-h-0 flex-1 flex-col",
				children: [panel === "home" ? /* @__PURE__ */ jsx(Home, {
					date: simDate(career.day, year),
					cash: career.cash,
					energy: career.energy,
					hype: career.hype,
					reputation: career.reputation,
					fame: career.fame,
					look: career.media?.avatar || look.src,
					lookId: career.look,
					creator: career.creator,
					orders: orders.length,
					feats: features.length,
					note: career.mail[0]?.title || debutLine,
					streets,
					onStreet: street,
					onBio: () => setBioOn(true),
					onShop: () => {
						setShopView("menu");
						openSub("shop");
					},
					onNote: () => {
						const mail = career.mail[0];
						if (mail?.kind === "order") openSub("orders");
						else if (mail?.kind === "event") openSub("events");
						else if (mail) openSub("feats");
						else if (debutLine) openSub("studio");
					},
					onOrders: () => openSub("orders"),
					onFeats: () => openSub("feats"),
					onFood: () => openSub("food"),
					onSocial: () => openSub("social"),
					onChart: () => openSub("chart"),
					onAnalysis: () => openSub("analysis"),
					onSleep: close,
					onLook: () => {
						setShopView("character");
						openSub("shop");
					}
				}) : /* @__PURE__ */ jsxs("div", {
					className: "flex h-full min-h-0 flex-col",
					children: [ROOTS.includes(panel) ? /* @__PURE__ */ jsx(Hud, {
						date: simDate(career.day, year),
						cash: career.cash,
						energy: career.energy
					}) : /* @__PURE__ */ jsxs("header", {
						className: "flex items-center gap-2 px-3 pt-[max(0.6rem,env(safe-area-inset-top))] pb-2",
						children: [
							/* @__PURE__ */ jsx("button", {
								type: "button",
								"aria-label": "Back",
								onClick: () => setPanel(backTo),
								className: "grid h-10 w-10 place-items-center rounded-full bg-white/10",
								children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-5 w-5" })
							}),
							/* @__PURE__ */ jsx("div", {
								className: "min-w-0 flex-1 text-center",
								children: /* @__PURE__ */ jsx("p", {
									className: "truncate text-sm font-black tracking-wide",
									children: panel === "shop" && shopView === "character" ? "Avatars" : titleOf(panel)
								})
							}),
							/* @__PURE__ */ jsx("p", {
								className: "flex w-16 items-center justify-end gap-1 text-xs font-black sim-cash",
								children: money(career.cash)
							})
						]
					}), /* @__PURE__ */ jsxs("div", {
						className: "app-scroll px-3 pb-4",
						children: [
							panel === "studio" && (musicId && career.tracks.some((track) => track.id === musicId) ? /* @__PURE__ */ jsx(OpenedTrack, {
								id: musicId,
								tracks: career.tracks,
								certs: career.trade?.certs ?? [],
								day: career.day,
								year,
								energy: career.energy,
								cash: career.cash,
								npc: career.npc,
								onOpen: setMusicId,
								onClose: () => setMusicId(null),
								onDrill: drill,
								onSchedule: schedule,
								onRename: rename,
								onDelete: removeTrack,
								onFile: fileSong,
								onFeat: addFeature
							}) : /* @__PURE__ */ jsx(Catalog, {
								tracks: career.tracks,
								year,
								certs: career.trade?.certs ?? [],
								onOpen: setMusicId
							})),
							panel === "social" && (peoplePosts ? /* @__PURE__ */ jsxs("div", {
								className: "flex flex-col gap-2",
								children: [/* @__PURE__ */ jsx("button", {
									type: "button",
									onClick: () => setPeoplePosts(false),
									className: "h-10 text-left text-sm font-black",
									children: "People"
								}), /* @__PURE__ */ jsx(Social, {
									tracks: career.tracks,
									followers: career.fans,
									onAct: go,
									onClip: clip,
									onPush: push,
									gate: (id) => preview(career, id)
								})]
							}) : /* @__PURE__ */ jsx(PeopleScreen, {
								career,
								onAct: people,
								onPosts: () => setPeoplePosts(true)
							})),
							panel === "skills" && /* @__PURE__ */ jsx(CreateScreen, {
								tracks: career.tracks,
								skills: career.skills,
								cash: career.cash,
								albumName,
								setAlbumName,
								onAct: go,
								onAlbum: () => album(albumName),
								onRename: rename,
								onTrain: train,
								onBeats: () => openSub("orders"),
								onPromo: () => openSub("social"),
								gate: (id) => preview(career, id),
								nick: career.nick,
								gear: career.gear,
								npc: career.npc,
								path: career.path,
								staff: career.staff,
								energy: career.energy,
								day: career.day,
								rack: career.rack,
								onCompose: compose,
								onDrill: drill,
								onSchedule: schedule,
								onDelete: removeTrack,
								onFile: fileSong,
								onFeat: addFeature,
								year,
								homeTier: career.homeTier,
								software: career.software,
								beats: career.beats ?? [],
								onJump: (id) => openSub(id)
							}),
							panel === "shop" && /* @__PURE__ */ jsx(ShopScreen, {
								view: shopView,
								setView: setShopView,
								look: career.look,
								gear: career.gear,
								lifeLevel: career.lifestyle,
								cash: career.cash,
								rack: career.rack,
								homeTier: career.homeTier,
								software: career.software,
								onLook: setLookId,
								avatar: career.media?.avatar || "",
								onPhoto: setPhoto,
								onDone: () => setPanel(backTo),
								onBuy: buy,
								onLife: life,
								onRack: buyRack,
								onHome: moveHome,
								onSoft: installSoft
							}),
							panel === "rack" && /* @__PURE__ */ jsx(RackScreen, {
								rack: career.rack,
								cash: career.cash,
								onBuy: buyRack
							}),
							panel === "wallet" && /* @__PURE__ */ jsx(WalletScreen, {
								career,
								onFood: () => openSub("food"),
								onShop: () => {
									setShopView("menu");
									openSub("shop");
								},
								onDistro: () => {
									setShopView("software");
									openSub("shop");
								},
								onStudio: () => {
									setShopView("estate");
									openSub("shop");
								},
								onPitch: () => go("pitch"),
								onWork: () => openSub("work"),
								onBusiness: () => openSub("business"),
								onMerch: () => openSub("merch"),
								onSchool: () => openSub("school"),
								onStaff: () => openSub("staff"),
								onBeats: () => openSub("orders"),
								onTour: () => openSub("events"),
								onBorrow: borrow,
								onLabel: openLabel,
								pitch: preview(career, "pitch"),
								jobTitle: jobById(career.job?.id)?.title ?? ""
							}),
							panel === "food" && /* @__PURE__ */ jsx(FoodScreen, {
								cash: career.cash,
								energy: career.energy,
								max: career.maxEnergy,
								onEat: eatAt
							}),
							panel === "orders" && /* @__PURE__ */ jsxs("div", {
								className: "flex flex-col gap-2",
								children: [/* @__PURE__ */ jsx(Action, {
									label: "Lease a beat",
									detail: preview(career, "beat").ok ? preview(career, "beat").detail : preview(career, "beat").reason,
									disabled: !preview(career, "beat").ok,
									onClick: () => go("beat")
								}), /* @__PURE__ */ jsx(MailList, {
									items: orders,
									empty: "No custom orders yet. Production skill and a few mornings bring them in.",
									onAnswer: answer
								})]
							}),
							panel === "feats" && /* @__PURE__ */ jsx(MailList, {
								items: feats,
								empty: "No one is asking yet. Release a song and keep reputation up.",
								onAnswer: answer
							}),
							panel === "chart" && /* @__PURE__ */ jsx(ChartScreen, {
								rows: career.chart,
								albums: career.trade?.albumChart ?? [],
								city: career.city,
								npc: career.npc,
								you: chartBid(career),
								youName: career.nick,
								no1s: career.trade?.no1s?.length ?? 0,
								bestRun: career.trade?.bestRun ?? 0
							}),
							panel === "world" && /* @__PURE__ */ jsx(PhoneHome, {
								cash: career.cash,
								fans: career.fans,
								media: career.media,
								platforms: career.platforms,
								chart: career.chart,
								city: career.city,
								nick: career.nick,
								fullName: career.fullName,
								age: career.age,
								photo: career.media?.avatar || look.src,
								role: career.path,
								startYear: career.startYear || 2026,
								releases: career.tracks.filter((track) => track.status === "out").map((track) => ({
									id: track.id,
									title: track.title,
									streams: track.streams,
									kind: track.kind,
									weekOut: track.weekOut,
									visual: track.visual === true,
									style: track.style,
									quality: track.quality
								})),
								videos: career.videos,
								onOpen: (id) => openSub(id),
								onAct: go,
								onPost: postAt,
								onPush: push,
								onClip: clip,
								onSound: sound,
								onDropClip: dropClip,
								energy: career.energy,
								day: career.day,
								albumOut: career.tracks.some((track) => track.status === "out" && track.kind === "album"),
								trade: career.trade
							}),
							panel === "events" && /* @__PURE__ */ jsx(Events, {
								events,
								onAnswer: answer,
								onShow: () => go("show"),
								onTour: tour,
								show: preview(career, "show"),
								quote: tourQuote(career),
								cash: career.cash,
								energy: career.energy,
								stage: tierOf(career.fame).current.name,
								tourBooked: career.tourBooked === true
							}),
							panel === "artists" && /* @__PURE__ */ jsx(Artists, {
								npc: career.npc,
								relations: career.relations,
								desk: career.desk?.roster ?? [],
								deskOpen: !!career.desk,
								band: career.band?.mates ?? [],
								bandOpen: !!career.band,
								onSign: sign,
								onMate: mate
							}),
							panel === "merch" && /* @__PURE__ */ jsx(MerchScreen, {
								career,
								onToggle: stock
							}),
							panel === "business" && /* @__PURE__ */ jsx(BusinessScreen, {
								career,
								onOpen: openBiz,
								onTune: tuneBiz,
								onClose: closeBiz
							}),
							panel === "work" && /* @__PURE__ */ jsx(WorkScreen, {
								career,
								onStart: startJob,
								onStop: quitWork
							}),
							panel === "school" && /* @__PURE__ */ jsx(SchoolScreen, {
								career,
								onEnroll: enroll,
								onAttend: attendClass,
								onStudy: study,
								onLeave: leaveSchool
							}),
							panel === "staff" && /* @__PURE__ */ jsx(StaffScreen, {
								career,
								onToggle: hire
							}),
							panel === "analysis" && /* @__PURE__ */ jsx(Analysis, { career }),
							panel === "bio" && null,
							panel === "settings" && /* @__PURE__ */ jsx(SettingsScreen, {
								city: career.city,
								pace: career.pace,
								nick: career.nick,
								creator: career.creator,
								onHelp: () => setHelp(true),
								onReset: reset,
								onCreator: () => setCreatorLock(true),
								onNick: setNick
							}),
							panel === "creator" && /* @__PURE__ */ jsx(CreatorDesk, {
								cash: career.cash,
								fans: career.fans,
								hype: career.hype,
								reputation: career.reputation,
								onApply: desk,
								onInstall: install
							})
						]
					})]
				}), bioOn && panel === "home" && /* @__PURE__ */ jsx(BioCard, {
					city: career.city,
					nick: career.nick,
					fullName: career.fullName,
					age: career.age,
					level: career.level,
					pace: career.pace,
					sheet: careerSheet(career),
					cash: career.cash,
					fans: career.fans,
					label: career.label,
					onClose: () => setBioOn(false)
				})]
			}),
			!help && career.lastResult && !career.lastResult.blocking && /* @__PURE__ */ jsxs("div", {
				className: "mx-3 mb-2 flex shrink-0 items-start gap-2 rounded-2xl bg-[#243044] px-3 py-2.5 shadow-lg",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-sm font-black text-[#ffe14a]",
						children: career.lastResult.title
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs leading-snug text-white/80",
						children: career.lastResult.body
					})]
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					"aria-label": "Dismiss",
					onClick: dismiss,
					className: "grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10",
					children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" })
				})]
			}),
			ROOTS.includes(panel) && /* @__PURE__ */ jsx("nav", {
				className: "grid shrink-0 grid-cols-6 border-t border-white/10 bg-[#0e1224]/95 pb-[max(0.35rem,env(safe-area-inset-bottom))]",
				children: TABS.map((tab) => {
					const Icon = tab.icon;
					const on = panel === tab.id || tab.id === "world" && [
						"chart",
						"events",
						"artists",
						"analysis"
					].includes(panel);
					return /* @__PURE__ */ jsx("button", {
						type: "button",
						"aria-label": tab.label,
						onClick: () => {
							setBioOn(false);
							setMusicId(null);
							setPanel(tab.id);
						},
						className: `flex min-h-14 items-center justify-center ${on ? "text-white" : "text-white/35"}`,
						children: /* @__PURE__ */ jsx(Icon, {
							className: "h-6 w-6",
							fill: on && tab.id === "home" ? "currentColor" : "none"
						})
					}, tab.id);
				})
			}),
			help && /* @__PURE__ */ jsx(HelpBook, { onClose: () => setHelp(false) }),
			!help && !career.seenIntro && !career.lastResult?.blocking && /* @__PURE__ */ jsxs("div", {
				className: "mx-3 mb-2 flex shrink-0 items-end gap-2",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "min-w-0 flex-1 rounded-2xl bg-[#1c2436] px-3 py-2.5 shadow-lg",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-sm leading-snug",
						children: TIPS[tip]?.body
					}), /* @__PURE__ */ jsx("button", {
						type: "button",
						className: "mt-2 text-xs font-black text-white/60",
						onClick: () => {
							const next = TIPS[tip + 1];
							if (!next) {
								ackIntro();
								setPanel("home");
								return;
							}
							setTip((n) => n + 1);
							setPanel(next.panel);
						},
						children: "tap to continue..."
					})]
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => ackIntro(),
					className: "shrink-0 text-xs font-black text-white/70",
					children: "skip"
				})]
			}),
			!help && career.lastResult?.blocking && career.lastResult.title === "The year in the room" && /* @__PURE__ */ jsx(GrammyNight, {
				year: 2026 + Math.floor((career.day - 1) / 365),
				rows: ceremonyRows(career),
				onOk: dismiss
			}),
			!help && career.lastResult?.blocking && career.lastResult.title !== "The year in the room" && /* @__PURE__ */ jsxs(Scrim, { children: [
				/* @__PURE__ */ jsx("h2", {
					className: "text-lg font-black",
					children: career.lastResult.title
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-sm leading-relaxed text-white/75",
					children: career.lastResult.body
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					className: "sim-sleep mt-4 h-12 w-full rounded-full text-sm font-black",
					onClick: dismiss,
					children: "OK"
				})
			] }),
			creatorLock && /* @__PURE__ */ jsx(CreatorLock, {
				onCancel: () => setCreatorLock(false),
				onOk: () => {
					setCreatorLock(false);
					openSub("creator");
				}
			})
		]
	});
}
var TIPS = [
	{
		panel: "home",
		body: "Tap your character to change the look. Events, posts, and shows move hype and reputation."
	},
	{
		panel: "world",
		body: "Every music app has a chart. They update when you sleep."
	},
	{
		panel: "skills",
		body: "Songs, albums, videos, and beats live here. After a release, the moon waits out the date."
	},
	{
		panel: "skills",
		body: "Skills change the next song. Drills cost energy, not cash."
	},
	{
		panel: "wallet",
		body: "Food and the apartment come out each week. Work pays cash. Tour, merch, and beats are the other doors."
	},
	{
		panel: "settings",
		body: "That's the tour. Make the first song from Create. Record Song or Write Song. There is no Songs button."
	}
];
var HELP = [
	{
		q: "What is hype?",
		a: "Hype is how loud the night is. Posts, shows, and a new release push it. It makes the morning plays bigger. It cools off if you only work a shift."
	},
	{
		q: "What is reputation?",
		a: "Reputation is whether people trust the name. It starts at 50. Charting holds it. A quiet week lets it slip. Features and labels look at it."
	},
	{
		q: "How to change my look?",
		a: "Tap the character on the home screen. Four looks, and a fifth that says upload a picture. That picture replaces the face on every app."
	},
	{
		q: "What is pre-promo?",
		a: "Pre-promo pushes a song that is ready or already out. It spends energy and moves hype. It does not replace the release date."
	},
	{
		q: "What LP/EP means?",
		a: "LP is a full album. EP is a short release, longer than a single and shorter than an LP. S is a single. The label card counts how many of each are out."
	},
	{
		q: "What is a distributor?",
		a: "A distributor takes a cut of the path and sends the song wider. Buy it under Software. It raises morning plays."
	},
	{
		q: "Creation of projects",
		a: "Create, then Record Song or Write Song. Albums, Videos, and Beats are their own doors. A song has a title, a style, a theme, optional features, a writer, a producer, and a room. The bill is last. Then open the song, drill it, and pick a release date."
	}
];
function HelpBook({ onClose }) {
	const [open, setOpen] = useState(null);
	return /* @__PURE__ */ jsxs("div", {
		className: "absolute inset-0 z-40 flex flex-col bg-[#12162a]/95 px-3 pt-[max(0.6rem,env(safe-area-inset-top))]",
		children: [
			/* @__PURE__ */ jsx("button", {
				type: "button",
				"aria-label": "Back",
				onClick: onClose,
				className: "grid h-10 w-10 place-items-center",
				children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-6 w-6" })
			}),
			/* @__PURE__ */ jsx("div", {
				className: "app-scroll pb-8",
				children: HELP.map((item) => /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => setOpen(item.q),
					className: "sim-pill sim-pill-cyan mt-2 justify-between px-4 text-left text-[14px]",
					children: [item.q, /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4 shrink-0" })]
				}, item.q))
			}),
			open && /* @__PURE__ */ jsx("div", {
				className: "absolute inset-0 z-10 flex flex-col justify-end bg-black/50 p-4",
				children: /* @__PURE__ */ jsxs("div", {
					className: "rounded-3xl bg-[#1c2436] p-4",
					children: [
						/* @__PURE__ */ jsx("h2", {
							className: "text-lg font-black",
							children: open
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-2 text-sm leading-relaxed text-white/80",
							children: HELP.find((item) => item.q === open)?.a
						}),
						/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => setOpen(null),
							className: "sim-pill sim-pill-cyan mt-4 text-[15px]",
							children: "OK"
						})
					]
				})
			})
		]
	});
}
function titleOf(panel) {
	return {
		home: "Home",
		bio: "Bio",
		shop: "Shop",
		studio: "Studio",
		social: "People",
		skills: "Skills",
		world: "World",
		chart: "Hot 100",
		wallet: "Wallet",
		orders: "Orders",
		feats: "Requests",
		food: "Food",
		artists: "Artists",
		events: "Events",
		analysis: "Numbers",
		settings: "Settings",
		creator: "Creator",
		merch: "Merch",
		school: "School",
		staff: "Staff",
		rack: "Studio",
		business: "Business",
		work: "Work"
	}[panel];
}
function Hud({ date, cash, energy }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center justify-between gap-2 px-3 pt-[max(0.45rem,env(safe-area-inset-top))] pb-1 text-[12px] font-black",
		children: [
			/* @__PURE__ */ jsx("p", {
				className: "min-w-0 truncate text-[#ffe14a]",
				children: date
			}),
			/* @__PURE__ */ jsx("p", {
				className: "sim-cash shrink-0",
				children: money(cash)
			}),
			/* @__PURE__ */ jsxs("p", {
				className: "sim-bolt flex shrink-0 items-center gap-0.5",
				children: [/* @__PURE__ */ jsx(Zap, { className: "h-3.5 w-3.5 fill-current" }), energy]
			})
		]
	});
}
function Home(props) {
	const tier = tierOf(props.fame);
	const span = tier.next ? tier.next.at - tier.current.at : 1;
	const pct = tier.next ? Math.max(8, Math.min(92, (props.fame - tier.current.at) / span * 100)) : 92;
	const stage = props.fame < 8 ? "Career start" : tier.current.name;
	return /* @__PURE__ */ jsxs("div", {
		className: "flex h-full min-h-0 flex-col px-3 pt-[max(0.45rem,env(safe-area-inset-top))]",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between gap-2 text-[12px] font-black",
				children: [
					/* @__PURE__ */ jsxs("p", {
						className: "min-w-0 truncate text-[#ffe14a]",
						children: [props.date, props.creator ? /* @__PURE__ */ jsx("span", {
							className: "ml-2 text-[10px] tracking-widest text-white/70",
							children: "CREATOR"
						}) : null]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "sim-cash shrink-0",
						children: money(props.cash)
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "sim-bolt flex shrink-0 items-center gap-0.5",
						children: [/* @__PURE__ */ jsx(Zap, { className: "h-3.5 w-3.5 fill-current" }), props.energy]
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-2 grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ jsx("button", {
					type: "button",
					className: "sim-bio h-11 rounded-full text-[15px] font-black tracking-wide text-white",
					onClick: props.onBio,
					children: "BIO"
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					className: "sim-shop h-11 rounded-full text-[15px] font-black tracking-wide text-white",
					onClick: props.onShop,
					children: "SHOP"
				})]
			}),
			/* @__PURE__ */ jsxs("button", {
				type: "button",
				className: "sim-listen relative mt-2 flex h-14 w-full flex-col items-center justify-center rounded-full",
				onClick: props.onAnalysis,
				children: [/* @__PURE__ */ jsx("span", {
					className: "relative z-10 text-[13px] font-black",
					children: stage
				}), /* @__PURE__ */ jsx("span", {
					className: "absolute bottom-2.5 left-[14%] right-[14%] h-[3px] rounded-full bg-white/40",
					children: /* @__PURE__ */ jsx("span", {
						className: "absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow",
						style: { left: `${pct}%` }
					})
				})]
			}),
			props.note ? /* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: props.onNote,
				className: "sim-card mt-2 flex h-14 items-center justify-between gap-2 rounded-full px-4 text-left",
				children: [/* @__PURE__ */ jsx("span", {
					className: "min-w-0 truncate text-[15px] font-bold",
					children: props.note
				}), /* @__PURE__ */ jsx(Bell, { className: "h-5 w-5 shrink-0" })]
			}) : /* @__PURE__ */ jsxs("div", {
				className: "sim-card mt-2 flex h-14 items-center justify-between gap-2 rounded-full px-4 text-left",
				children: [/* @__PURE__ */ jsx("span", {
					className: "min-w-0 truncate text-[15px] font-bold",
					children: "No notifications..."
				}), /* @__PURE__ */ jsx(Bell, { className: "h-5 w-5 shrink-0" })]
			}),
			props.streets.length > 0 && /* @__PURE__ */ jsx("div", {
				className: "mt-2 flex flex-col gap-1.5",
				children: props.streets.map((row) => /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => props.onStreet(row.kind),
					className: "flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 px-3 text-left text-[#06210f]",
					children: [
						/* @__PURE__ */ jsx(Star, { className: "h-4 w-4 shrink-0 fill-current" }),
						/* @__PURE__ */ jsx("span", {
							className: "min-w-0 flex-1 truncate text-[13px] font-black tracking-wide",
							children: row.label
						}),
						/* @__PURE__ */ jsx("span", {
							className: "text-[12px] font-black",
							children: row.detail
						}),
						/* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4 shrink-0" })
					]
				}, row.kind))
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-2 grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ jsx(CountPill, {
					n: props.orders,
					label: "ORDERS",
					klass: "sim-orders",
					onClick: props.onOrders
				}), /* @__PURE__ */ jsx(CountPill, {
					n: props.feats,
					label: "FEAT REQUESTS",
					klass: "sim-feats",
					onClick: props.onFeats
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-2 flex h-[46%] min-h-[220px] shrink-0 items-end justify-center gap-2 pb-1",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex h-[min(100%,380px)] items-stretch gap-1.5",
						children: [/* @__PURE__ */ jsx(VBar, {
							label: "HYPE",
							value: Math.round(props.hype),
							fill: props.hype,
							klass: "sim-hype"
						}), /* @__PURE__ */ jsx(VBar, {
							label: "REPUTATION",
							value: Math.round(props.reputation),
							fill: props.reputation,
							klass: "sim-rep"
						})]
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						"aria-label": "Change look",
						onClick: props.onLook,
						className: "h-[min(100%,380px)]",
						children: /* @__PURE__ */ jsx("img", {
							src: props.look,
							alt: "",
							className: "aspect-[3/4] h-full w-auto max-w-[220px] rounded-[1.7rem] object-cover object-[center_28%]"
						})
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "flex h-[min(100%,380px)] w-14 flex-col items-center justify-between",
						children: [
							/* @__PURE__ */ jsx(Round, {
								label: "Food",
								klass: "sim-food",
								onClick: props.onFood,
								children: /* @__PURE__ */ jsx(Droplet, { className: "h-5 w-5" })
							}),
							/* @__PURE__ */ jsx(Round, {
								label: "People",
								klass: "sim-people",
								onClick: props.onSocial,
								children: /* @__PURE__ */ jsx(Users, { className: "h-5 w-5" })
							}),
							/* @__PURE__ */ jsx(Round, {
								label: "Chart",
								klass: "sim-bars",
								onClick: props.onChart,
								children: /* @__PURE__ */ jsx(BarChart3, { className: "h-5 w-5" })
							}),
							/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: props.onSleep,
								"aria-label": "Next day",
								className: "sim-sleep grid h-14 w-14 shrink-0 place-items-center rounded-[1.15rem]",
								children: /* @__PURE__ */ jsx(Moon, { className: "h-7 w-7 fill-current" })
							})
						]
					})
				]
			})
		]
	});
}
function CountPill({ n, label, klass, onClick }) {
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		className: `${klass} h-[62px] rounded-2xl leading-none`,
		onClick,
		children: [/* @__PURE__ */ jsx("span", {
			className: "block text-[22px] font-black",
			children: n
		}), /* @__PURE__ */ jsx("span", {
			className: "mt-1 block text-[10px] font-black tracking-wide",
			children: label
		})]
	});
}
function VBar({ label, value, fill, klass }) {
	const shown = String(Math.round(value));
	return /* @__PURE__ */ jsxs("div", {
		className: "relative h-full w-[26px] overflow-hidden rounded-full bg-black/45 shadow-inner",
		children: [/* @__PURE__ */ jsx("div", {
			className: `absolute inset-x-0 bottom-0 ${klass}`,
			style: { height: `${Math.max(6, Math.min(100, fill))}%` }
		}), /* @__PURE__ */ jsxs("span", {
			className: "absolute inset-0 flex items-center justify-center text-[9px] font-black tracking-widest text-white [writing-mode:vertical-rl] rotate-180",
			children: [
				shown,
				" ",
				label
			]
		})]
	});
}
function Round({ children, onClick, label, klass, badge }) {
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		"aria-label": label,
		onClick,
		className: `relative grid h-12 w-12 place-items-center rounded-[1.05rem] ${klass}`,
		children: [children, badge ? /* @__PURE__ */ jsx("span", {
			className: "absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white",
			children: badge
		}) : null]
	});
}
function Scrim({ children }) {
	return /* @__PURE__ */ jsx("div", {
		className: "absolute inset-0 z-40 grid place-items-center bg-black/65 p-5",
		children: /* @__PURE__ */ jsx("div", {
			className: "w-full rounded-3xl bg-[#1c2436] p-5 text-center shadow-2xl",
			children
		})
	});
}
function Studio(props) {
	const record = props.gate("record");
	const hasDraft = props.tracks.some((track) => track.status === "draft");
	const songs = props.tracks.filter((track) => track.kind !== "album");
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ jsx("p", {
					className: "text-xs font-black tracking-[0.16em] text-white/50",
					children: "YOUR SONGS"
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					"aria-label": "New song",
					onClick: props.onNew,
					className: "grid h-11 w-16 place-items-center rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 text-[#06210f]",
					children: /* @__PURE__ */ jsx(Plus, {
						className: "h-6 w-6",
						strokeWidth: 2.6
					})
				})]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "text-xs text-white/55",
				children: "Plus builds the song. Open a row to drill it or date the release."
			}),
			hasDraft && /* @__PURE__ */ jsx(Action, {
				label: "Record",
				disabled: !record.ok,
				detail: record.ok ? record.detail : record.reason,
				onClick: () => props.onAct("record")
			}),
			/* @__PURE__ */ jsxs("ul", {
				className: "flex flex-col gap-2",
				children: [songs.length === 0 && /* @__PURE__ */ jsx("p", {
					className: "text-sm text-white/50",
					children: "No songs yet. Hit plus."
				}), [...songs].reverse().map((track) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => props.onOpen(track.id),
					className: "flex w-full items-center gap-3 rounded-2xl bg-black/30 px-3 py-2 text-left",
					children: [/* @__PURE__ */ jsx("span", {
						className: "grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-b from-amber-200 to-amber-500 text-[12px] font-black text-[#2a2108]",
						children: qualityBand(track.quality)
					}), /* @__PURE__ */ jsxs("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "flex items-baseline justify-between gap-2",
							children: [/* @__PURE__ */ jsx("span", {
								className: "truncate font-bold",
								children: track.title
							}), /* @__PURE__ */ jsx("span", {
								className: "text-[10px] font-black tracking-wide text-lime-300 uppercase",
								children: track.dropOn ? "Dated" : track.status === "draft" ? "Draft" : track.status === "master" ? "Ready" : "Out"
							})]
						}), /* @__PURE__ */ jsxs("span", {
							className: "block truncate text-xs text-white/55",
							children: [
								"Single · ",
								shortStamp(track.made || props.day, props.year),
								track.feat ? ` · ft. ${track.feat}` : ""
							]
						})]
					})]
				}) }, track.id))]
			})
		]
	});
}
function SongPage(props) {
	const [dating, setDating] = useState(Boolean(props.startOnDate));
	const [offset, setOffset] = useState(releaseOffset(props.day, props.track.dropOn, props.year));
	const [title, setTitle] = useState(props.track.title);
	const [sure, setSure] = useState(false);
	const [albumOn, setAlbumOn] = useState(false);
	const [albumDraft, setAlbumDraft] = useState("The Record");
	const [titleOn, setTitleOn] = useState(false);
	const [featOn, setFeatOn] = useState(false);
	const [cut, setCut] = useState(0);
	const [query, setQuery] = useState("");
	const parts = props.track.parts ?? {
		lyrics: 0,
		flow: 0,
		voice: 0,
		prod: 0,
		studio: 0,
		lyricGain: 0,
		flowGain: 0,
		voiceGain: 0,
		prodGain: 0
	};
	const when = props.day + offset;
	const locked = props.track.status === "out";
	const taken = new Set((props.track.feat ?? "").split(",").map((name) => name.trim()).filter(Boolean));
	const artists = props.npc.filter((artist, index, list) => list.findIndex((other) => other.name === artist.name) === index).filter((artist) => !taken.has(artist.name)).filter((artist) => artist.name.toLowerCase().includes(query.trim().toLowerCase()));
	if (dating) return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col pb-8",
		children: [
			/* @__PURE__ */ jsx("button", {
				type: "button",
				"aria-label": "Back",
				onClick: () => setDating(false),
				className: "grid h-10 w-10 place-items-center",
				children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-6 w-6" })
			}),
			/* @__PURE__ */ jsx("h2", {
				className: "mt-8 text-center text-2xl font-black tracking-wide",
				children: "RELEASE DATE"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-6 flex items-center justify-center gap-3",
				children: [
					/* @__PURE__ */ jsx("button", {
						type: "button",
						"aria-label": "Earlier date",
						onClick: () => setOffset((n) => Math.max(1, n - 1)),
						className: "grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-b from-emerald-300 to-emerald-600 text-[#06210f]",
						children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-5 w-5" })
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "min-w-[8rem] text-center",
						children: [/* @__PURE__ */ jsx("p", {
							className: "text-lg font-black",
							children: shortStamp(when, props.year)
						}), /* @__PURE__ */ jsx("p", {
							className: "text-sm text-white/70",
							children: weekdayLong(when, props.year)
						})]
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						"aria-label": "Later date",
						onClick: () => setOffset((n) => Math.min(21, n + 1)),
						className: "grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-b from-emerald-300 to-emerald-600 text-[#06210f]",
						children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-5 w-5" })
					})
				]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-4 text-center text-xs text-white/55",
				children: "Charts move on Fridays. The song joins the count the morning you wake up on this date."
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => {
					props.onSchedule(when);
					setDating(false);
				},
				className: "sim-pill sim-pill-cyan mt-8 text-[16px]",
				children: "RELEASE"
			})
		]
	});
	if (featOn) return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-2 pb-6",
		children: [
			/* @__PURE__ */ jsx("button", {
				type: "button",
				"aria-label": "Back",
				onClick: () => setFeatOn(false),
				className: "grid h-10 w-10 place-items-center",
				children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-6 w-6" })
			}),
			/* @__PURE__ */ jsx("h2", {
				className: "text-center text-xl font-black tracking-wide",
				children: "ADD FEATS"
			}),
			/* @__PURE__ */ jsxs("p", {
				className: "text-center text-xs text-white/55",
				children: [
					taken.size ? `On it: ${[...taken].join(", ")}. ` : "",
					"Slide their cut. 0% is the name only. You have ",
					money(props.cash),
					"."
				]
			}),
			/* @__PURE__ */ jsxs("label", {
				className: "flex items-center gap-3 rounded-2xl bg-black/30 px-3 py-2",
				children: [/* @__PURE__ */ jsxs("span", {
					className: "text-xs font-black",
					children: [
						"THEIR CUT ",
						cut,
						"%"
					]
				}), /* @__PURE__ */ jsx("input", {
					type: "range",
					min: 0,
					max: 80,
					value: cut,
					onChange: (e) => setCut(Number(e.target.value)),
					className: "min-w-0 flex-1"
				})]
			}),
			/* @__PURE__ */ jsxs("label", {
				className: "flex items-center gap-2 rounded-full bg-black/40 px-3 py-2",
				children: [/* @__PURE__ */ jsx(Search, { className: "h-4 w-4 text-white/50" }), /* @__PURE__ */ jsx("input", {
					value: query,
					onChange: (e) => setQuery(e.target.value),
					placeholder: "Find an artist",
					className: "min-w-0 flex-1 bg-transparent text-sm outline-none"
				})]
			}),
			/* @__PURE__ */ jsx("ul", {
				className: "flex max-h-[28rem] flex-col gap-2 overflow-auto",
				children: artists.slice(0, 24).map((artist) => {
					const deal = versePrice(useGame.getState().career, artist.name, cut);
					const price = deal.price;
					const short = props.cash < price;
					return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", {
						type: "button",
						disabled: short || taken.size >= 3 || !!deal.refused,
						onClick: () => {
							props.onFeat(artist.name, cut);
							setFeatOn(false);
						},
						className: "flex w-full items-center gap-3 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-3 py-3 text-left disabled:opacity-40",
						children: [
							/* @__PURE__ */ jsx(Face, { name: artist.name }),
							/* @__PURE__ */ jsxs("span", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ jsx("span", {
									className: "block truncate font-black",
									children: artist.name
								}), /* @__PURE__ */ jsx("span", {
									className: "text-xs text-white/85",
									children: deal.refused || `${deal.status} · ${cut}% of this song`
								})]
							}),
							/* @__PURE__ */ jsx("span", {
								className: "text-sm font-black text-[#b6ff4a]",
								children: deal.refused ? "No" : price === 0 ? "Free" : money(price)
							})
						]
					}) }, artist.name);
				})
			})
		]
	});
	if (albumOn) return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-3 pb-8",
		children: [
			/* @__PURE__ */ jsx("button", {
				type: "button",
				"aria-label": "Back",
				onClick: () => setAlbumOn(false),
				className: "grid h-10 w-10 place-items-center",
				children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-6 w-6" })
			}),
			/* @__PURE__ */ jsx("h2", {
				className: "mt-6 text-center text-2xl font-black tracking-wide",
				children: "ADD TO ALBUM"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "text-center text-sm text-white/70",
				children: props.track.title
			}),
			props.albums.length === 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("p", {
					className: "text-center text-sm text-white/70",
					children: "No album yet. Name one and this song goes on it."
				}),
				/* @__PURE__ */ jsx("input", {
					value: albumDraft,
					onChange: (event) => setAlbumDraft(event.target.value.slice(0, 28)),
					className: "h-12 rounded-full bg-black/30 px-4 text-center text-sm"
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => {
						props.onFile("", albumDraft.trim() || "The Record");
						setAlbumOn(false);
					},
					className: "sim-pill sim-pill-cyan text-[16px]",
					children: "CREATE AND ADD"
				})
			] }) : /* @__PURE__ */ jsx("ul", {
				className: "flex flex-col gap-2",
				children: props.albums.map((album) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => {
						props.onFile(album.id);
						setAlbumOn(false);
					},
					className: "flex w-full items-center justify-between rounded-2xl bg-black/35 px-3 py-3 text-left",
					children: /* @__PURE__ */ jsx("span", {
						className: "font-bold",
						children: album.title
					})
				}) }, album.id))
			})
		]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-3 pb-6",
		children: [
			/* @__PURE__ */ jsx("button", {
				type: "button",
				"aria-label": "Back",
				onClick: props.onBack,
				className: "grid h-10 w-10 place-items-center",
				children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-6 w-6" })
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "relative mx-auto grid h-24 w-24 place-items-center",
				children: [/* @__PURE__ */ jsx(Star, {
					className: "h-24 w-24 fill-amber-400 text-amber-500",
					strokeWidth: 1.2
				}), /* @__PURE__ */ jsx("span", {
					className: "absolute text-sm font-black text-[#3a2504]",
					children: qualityBand(props.track.quality)
				})]
			}),
			/* @__PURE__ */ jsx("h2", {
				className: "text-center text-3xl font-black tracking-wide",
				children: props.track.title
			}),
			/* @__PURE__ */ jsxs("p", {
				className: "text-center text-sm text-white/70",
				children: [props.track.style || "Song", props.track.theme ? ` & ${props.track.theme}` : ""]
			}),
			props.albumTitle ? /* @__PURE__ */ jsx("p", {
				className: "text-center text-xs font-bold text-[#3dff8a]",
				children: `On ${props.albumTitle}`
			}) : null,
			props.cert ? /* @__PURE__ */ jsx("p", {
				className: "text-center text-xs font-black tracking-wide text-[#ffe14a]",
				children: props.cert
			}) : null,
			props.track.feat ? /* @__PURE__ */ jsxs("p", {
				className: "text-center text-xs text-white/55",
				children: ["ft. ", props.track.feat]
			}) : null,
			props.track.dropOn ? /* @__PURE__ */ jsxs("p", {
				className: "text-center text-xs font-bold text-[#3dff8a]",
				children: [
					"Drops ",
					shortStamp(props.track.dropOn, props.year),
					" · ",
					weekdayLong(props.track.dropOn, props.year)
				]
			}) : null,
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ jsx(PartBar, {
					label: "LYRICS",
					value: parts.lyrics,
					gain: parts.lyricGain,
					cost: PART_ENERGY.lyrics,
					disabled: locked,
					onClick: () => props.onDrill("lyrics")
				}), /* @__PURE__ */ jsx(PartBar, {
					label: "FLOW",
					value: parts.flow,
					gain: parts.flowGain,
					cost: PART_ENERGY.flow,
					disabled: locked,
					onClick: () => props.onDrill("flow")
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-3 gap-2",
				children: [
					/* @__PURE__ */ jsx(PartChip, {
						label: "VOICE",
						value: parts.voice,
						cost: PART_ENERGY.voice,
						disabled: locked,
						onClick: () => props.onDrill("voice")
					}),
					/* @__PURE__ */ jsx(PartChip, {
						label: "PRODUCTION",
						value: parts.prod,
						cost: PART_ENERGY.prod,
						disabled: locked,
						onClick: () => props.onDrill("prod")
					}),
					/* @__PURE__ */ jsx(PartChip, {
						label: "STUDIO TIME",
						value: parts.studio
					})
				]
			}),
			!locked && /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setDating(true),
				className: "sim-pill sim-pill-cyan text-[16px]",
				children: props.track.dropOn ? "CHANGE DATE" : "RELEASE"
			}),
			!locked && /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setTitleOn((on) => !on),
				className: "sim-pill sim-pill-cyan text-[16px]",
				children: "RENAME SONG"
			}),
			!locked && titleOn && /* @__PURE__ */ jsxs("form", {
				className: "flex gap-2",
				onSubmit: (e) => {
					e.preventDefault();
					props.onRename(title);
					setTitleOn(false);
				},
				children: [/* @__PURE__ */ jsx("input", {
					value: title,
					onChange: (e) => setTitle(e.target.value.slice(0, 28)),
					className: "h-12 min-w-0 flex-1 rounded-full bg-black/30 px-4 text-center text-sm"
				}), /* @__PURE__ */ jsx("button", {
					type: "submit",
					className: "sim-pill sim-pill-cyan w-auto px-4 text-[13px]",
					children: "SAVE"
				})]
			}),
			!locked && (sure ? /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: props.onDelete,
				className: "sim-pill sim-pill-red text-[15px]",
				children: "DELETE THIS SONG"
			}) : /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setSure(true),
				className: "sim-pill sim-pill-cyan text-[16px]",
				children: "DELETE SONG"
			})),
			!locked && /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setAlbumOn(true),
				className: "sim-pill sim-pill-cyan text-[16px]",
				children: "ADD TO ALBUM"
			}),
			!locked && /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setFeatOn(true),
				className: "sim-pill sim-pill-cyan text-[16px]",
				children: "ADD FEATS"
			}),
			locked && /* @__PURE__ */ jsxs("p", {
				className: "text-center text-sm text-white/60",
				children: [
					plaque(props.track.streams) ? `${plaque(props.track.streams)} · ` : "",
					fmt(props.track.streams),
					" plays · ",
					money(props.track.earned)
				]
			})
		]
	});
}
function Face({ name }) {
	let h = 0;
	for (const c of name) h = (h * 33 + c.charCodeAt(0)) % 360;
	const initial = name.split(" ").map((word) => word[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
	return /* @__PURE__ */ jsx("span", {
		className: "grid h-12 w-12 shrink-0 place-items-center rounded-full text-sm font-black text-white shadow-inner",
		style: { background: `linear-gradient(145deg, hsl(${h} 72% 52%), hsl(${(h + 36) % 360} 70% 32%))` },
		children: initial
	});
}
function PartBar(props) {
	const fill = Math.max(6, Math.min(100, props.value * 10));
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		disabled: props.disabled,
		onClick: props.onClick,
		className: "rounded-2xl bg-black/40 p-3 text-left disabled:opacity-60",
		children: [
			/* @__PURE__ */ jsxs("span", {
				className: "flex items-center justify-between text-[11px] font-black tracking-wide",
				children: [/* @__PURE__ */ jsx("span", { children: props.label }), /* @__PURE__ */ jsx("span", { children: props.value.toFixed(1) })]
			}),
			/* @__PURE__ */ jsx("span", {
				className: "mt-2 block h-3 overflow-hidden rounded-full bg-white/15",
				children: /* @__PURE__ */ jsx("span", {
					className: "block h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500",
					style: { width: `${fill}%` }
				})
			}),
			!props.disabled && /* @__PURE__ */ jsxs("span", {
				className: "mt-2 block text-center text-[11px] font-black text-white/70",
				children: [props.cost, " energy"]
			})
		]
	});
}
function PartChip(props) {
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		disabled: props.disabled || !props.onClick,
		onClick: props.onClick,
		className: "rounded-2xl bg-white/10 px-2 py-3 text-center disabled:opacity-70",
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "block text-[10px] font-black tracking-wide",
				children: props.label
			}),
			/* @__PURE__ */ jsx("span", {
				className: "mt-1 block text-sm font-black",
				children: props.value.toFixed(1)
			}),
			props.disabled || !props.onClick ? /* @__PURE__ */ jsx("span", {
				className: "block text-[10px] text-white/35",
				children: props.onClick ? "out" : "room"
			}) : /* @__PURE__ */ jsxs("span", {
				className: "block text-[10px] text-white/45",
				children: [props.cost, " energy"]
			})
		]
	});
}
function SongWizard(props) {
	const opened = useRef(props.trackCount);
	const [view, setView] = useState("sheet");
	const [title, setTitle] = useState("");
	const [styleAt, setStyleAt] = useState(() => {
		const at = STYLES.indexOf(props.initialStyle ?? "");
		return at < 0 ? 0 : at;
	});
	const [themeAt, setThemeAt] = useState(0);
	const [feats, setFeats] = useState([]);
	const [pen, setPen] = useState(0);
	const [prod, setProd] = useState(0);
	const [studio, setStudio] = useState(0);
	const [query, setQuery] = useState("");
	const [byFee, setByFee] = useState(false);
	const [step, setStep] = useState(0);
	const [featAt, setFeatAt] = useState(0);
	const [featCut, setFeatCut] = useState(0);
	const [instrumentAt, setInstrumentAt] = useState(0);
	const instruments = [
		"None",
		"Piano",
		"Guitar",
		"Bass",
		"Drums",
		"Violin"
	];
	useEffect(() => {
		if (props.trackCount > opened.current) props.onClose();
	}, [props.trackCount, props.onClose]);
	const featChoices = ["None", ...props.npc.filter((artist, index, list) => list.findIndex((other) => other.name === artist.name) === index).map((artist) => artist.name)];
	const session = {
		title,
		style: STYLES[styleAt] ?? STYLES[0],
		theme: THEMES[themeAt] ?? THEMES[0],
		feats: (featChoices[featAt] ?? "None") === "None" ? [] : [{
			name: featChoices[featAt],
			cut: featCut
		}],
		pen,
		prod,
		studio,
		instrument: instruments[instrumentAt] ?? "None"
	};
	const quote = quoteSession({
		nick: props.nick,
		skills: props.skills,
		gear: props.gear,
		rack: props.rack,
		npc: props.npc,
		path: props.path,
		staff: props.staff,
		software: props.software,
		homeTier: props.homeTier,
		bonds: useGame.getState().career.bonds,
		met: useGame.getState().career.met,
		fame: useGame.getState().career.fame,
		industry: useGame.getState().career.industry,
		circleAsk: useGame.getState().career.circleAsk,
		day: useGame.getState().career.day
	}, session);
	const cycle = (current, len, dir) => (current + dir + len) % len;
	const taken = new Set(feats.map((feat) => feat.name));
	const artists = props.npc.filter((artist, index, list) => list.findIndex((other) => other.name === artist.name) === index).filter((artist) => artist.name.toLowerCase().includes(query.trim().toLowerCase())).filter((artist) => !taken.has(artist.name)).sort((a, b) => byFee ? b.fee - a.fee : a.name.localeCompare(b.name));
	if (view === "pick") return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-2",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center gap-2",
				children: [
					/* @__PURE__ */ jsx("button", {
						type: "button",
						"aria-label": "Back",
						onClick: () => setView("feats"),
						className: "grid h-10 w-10 place-items-center",
						children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-6 w-6" })
					}),
					/* @__PURE__ */ jsx("p", {
						className: "flex-1 text-sm font-black",
						children: "Add a feature"
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						"aria-label": byFee ? "Sort by name" : "Sort by price",
						onClick: () => setByFee((on) => !on),
						className: `grid h-10 w-10 place-items-center rounded-full ${byFee ? "bg-fuchsia-500" : "bg-white/15"}`,
						children: /* @__PURE__ */ jsx("span", {
							className: "text-sm font-black",
							children: "$"
						})
					})
				]
			}),
			/* @__PURE__ */ jsxs("label", {
				className: "flex items-center gap-2 rounded-full bg-black/40 px-3 py-2",
				children: [/* @__PURE__ */ jsx(Search, { className: "h-4 w-4 text-white/50" }), /* @__PURE__ */ jsx("input", {
					value: query,
					onChange: (e) => setQuery(e.target.value),
					placeholder: "Search",
					className: "w-full bg-transparent text-sm outline-none"
				})]
			}),
			/* @__PURE__ */ jsxs("ul", {
				className: "flex flex-col gap-2 pb-4",
				children: [artists.length === 0 && /* @__PURE__ */ jsx("li", {
					className: "text-sm text-white/50",
					children: "Nobody by that name."
				}), artists.map((artist) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => {
						setFeats((list) => list.length >= 3 ? list : [...list, {
							name: artist.name,
							cut: 0
						}]);
						setView("feats");
					},
					className: "flex w-full items-center justify-between rounded-full bg-[#1a1d27] px-4 py-3 ring-1 ring-white/15",
					children: [/* @__PURE__ */ jsxs("span", {
						className: "text-left text-sm font-bold",
						children: [
							artist.name,
							" ",
							/* @__PURE__ */ jsxs("span", {
								className: "text-[#3dff8a]",
								children: [
									"(",
									money(artist.fee),
									")"
								]
							})
						]
					}), /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" })]
				}) }, artist.name))]
			})
		]
	});
	if (view === "feats") return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: () => setView("sheet"),
				className: "flex h-10 items-center gap-1 text-sm font-black",
				children: [/* @__PURE__ */ jsx(ChevronLeft, { className: "h-5 w-5" }), " Back"]
			}),
			[
				0,
				1,
				2
			].map((slot) => {
				const feat = feats[slot];
				if (!feat) return /* @__PURE__ */ jsxs("div", {
					className: "rounded-3xl bg-gradient-to-br from-fuchsia-500 to-indigo-500 p-3",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex justify-between text-[11px] font-black tracking-wide",
							children: [/* @__PURE__ */ jsxs("span", { children: ["FEAT ", slot + 1] }), /* @__PURE__ */ jsx("span", { children: "REVENUE" })]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-2 text-lg font-black",
							children: "— — —"
						}),
						/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => setView("pick"),
							className: "mt-3 w-full rounded-xl bg-white py-3 text-sm font-black text-fuchsia-700",
							children: "ADD FEAT"
						})
					]
				}, slot);
				const row = quote.feats.find((item) => item.name === feat.name);
				const others = feats.reduce((sum, item) => sum + (item.name === feat.name ? 0 : item.cut), 0);
				const max = Math.max(0, 80 - others);
				return /* @__PURE__ */ jsxs("div", {
					className: "rounded-3xl bg-gradient-to-br from-fuchsia-500 to-indigo-500 p-3",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex justify-between text-[11px] font-black tracking-wide",
							children: [/* @__PURE__ */ jsxs("span", { children: ["FEAT ", slot + 1] }), /* @__PURE__ */ jsx("span", { children: "REVENUE" })]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-1 flex items-baseline justify-between gap-2",
							children: [/* @__PURE__ */ jsx("p", {
								className: "text-lg font-black",
								children: feat.name
							}), /* @__PURE__ */ jsxs("p", {
								className: "text-lg font-black",
								children: [feat.cut, "%"]
							})]
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-3 flex items-center gap-2",
							children: [
								/* @__PURE__ */ jsx("span", {
									className: "rounded-xl bg-white/25 px-3 py-2 text-sm font-black",
									children: money(row?.price ?? 0)
								}),
								/* @__PURE__ */ jsx("button", {
									type: "button",
									"aria-label": `Remove ${feat.name}`,
									onClick: () => setFeats((list) => list.filter((item) => item.name !== feat.name)),
									className: "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-fuchsia-700",
									children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
								}),
								/* @__PURE__ */ jsx("input", {
									"aria-label": `${feat.name} revenue share`,
									type: "range",
									min: 0,
									max,
									value: Math.min(feat.cut, max),
									onChange: (e) => {
										const cut = Number(e.target.value);
										setFeats((list) => list.map((item) => item.name === feat.name ? {
											...item,
											cut
										} : item));
									},
									className: "h-2 flex-1 accent-white"
								})
							]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-2 text-[11px] font-semibold text-white/80",
							children: "More of the song for them, less cash today."
						})
					]
				}, feat.name);
			}),
			/* @__PURE__ */ jsxs("p", {
				className: "sim-pill sim-pill-cyan text-[15px]",
				children: [
					"My share: ",
					quote.yours,
					"%"
				]
			})
		]
	});
	if (view === "bench") return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-2 pb-6",
		children: [
			/* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: () => setView("sheet"),
				className: "flex h-10 items-center gap-1 text-sm font-black",
				children: [/* @__PURE__ */ jsx(ChevronLeft, { className: "h-5 w-5" }), " Back"]
			}),
			/* @__PURE__ */ jsx(DeskDial, {
				label: "LYRICS",
				name: `${quote.lyricName} (${quote.lyricRating.toFixed(1)})`,
				price: money(quote.lyricPrice),
				onPrev: () => setPen((n) => cycle(n, LYRIC_DESKS.length, -1)),
				onNext: () => setPen((n) => cycle(n, LYRIC_DESKS.length, 1))
			}),
			/* @__PURE__ */ jsx(DeskDial, {
				label: "PRODUCER",
				name: `${quote.prodName} (${quote.prodRating.toFixed(1)})`,
				price: money(quote.prodPrice),
				onPrev: () => setProd((n) => cycle(n, PROD_DESKS.length, -1)),
				onNext: () => setProd((n) => cycle(n, PROD_DESKS.length, 1))
			}),
			/* @__PURE__ */ jsx(DeskDial, {
				label: "STUDIO",
				name: `${quote.studioName} (${quote.studioRating.toFixed(1)})`,
				price: money(quote.studioPrice),
				onPrev: () => setStudio((n) => cycle(n, ROOM_DESKS.length, -1)),
				onNext: () => setStudio((n) => cycle(n, ROOM_DESKS.length, 1))
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setView("bill"),
				className: "sim-pill sim-pill-cyan mt-6 text-[16px]",
				children: "NEXT"
			})
		]
	});
	if (view === "bill") {
		const blocked = quote.feats.find((feat) => feat.refused)?.refused;
		const short = blocked ? blocked : props.energy < quote.energy ? `Need ${quote.energy} energy. You have ${props.energy}. Sleep first.` : props.cash < quote.total ? `Need ${money(quote.total)}. You have ${money(props.cash)}.` : "";
		return /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col pb-6",
			children: [
				/* @__PURE__ */ jsx("button", {
					type: "button",
					"aria-label": "Back",
					onClick: () => setView("bench"),
					className: "grid h-10 w-10 place-items-center",
					children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-6 w-6" })
				}),
				/* @__PURE__ */ jsx("h2", {
					className: "mt-4 text-center text-3xl font-black tracking-wide",
					children: "SUMMARY"
				}),
				/* @__PURE__ */ jsxs("dl", {
					className: "mt-8 flex flex-col gap-3 text-sm font-black",
					children: [
						/* @__PURE__ */ jsx(BillRow, {
							k: "GHOSTWRITER",
							v: money(quote.lyricPrice)
						}),
						/* @__PURE__ */ jsx(BillRow, {
							k: "PRODUCED",
							v: money(quote.prodPrice)
						}),
						/* @__PURE__ */ jsx(BillRow, {
							k: "STUDIO",
							v: money(quote.studioPrice)
						}),
						/* @__PURE__ */ jsx(BillRow, {
							k: "FEATS",
							v: money(quote.featCost)
						}),
						/* @__PURE__ */ jsx("div", { className: "my-1 h-px bg-white/25" }),
						/* @__PURE__ */ jsx(BillRow, {
							k: "TOTAL",
							v: money(quote.total)
						})
					]
				}),
				/* @__PURE__ */ jsxs("p", {
					className: "mt-3 text-center text-xs text-white/55",
					children: [
						"You keep ",
						quote.yours,
						"% of what this song pays."
					]
				}),
				/* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => props.onCompose(session),
					className: "sim-pill sim-pill-violet mt-8 text-[18px]",
					children: [/* @__PURE__ */ jsx(Zap, { className: "h-5 w-5" }), quote.energy]
				}),
				short ? /* @__PURE__ */ jsx("p", {
					className: "mt-3 text-center text-xs font-bold text-[#ffe14a]",
					children: short
				}) : null
			]
		});
	}
	const back = () => {
		if (step <= 0) props.onClose();
		else setStep((n) => n - 1);
	};
	const titles = [
		"SONG TITLE",
		"GENRE",
		"THEME",
		"FEATURED ARTIST",
		"SONGWRITER",
		"MUSIC PRODUCER",
		"PLAY INSTRUMENT",
		"RECORDING STUDIO",
		"COST"
	];
	const picked = featChoices[featAt] ?? "None";
	const short = props.energy < quote.energy ? `Need ${quote.energy} energy. You have ${props.energy}. Sleep first.` : props.cash < quote.total ? `Need ${money(quote.total)}. You have ${money(props.cash)}.` : "";
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col pb-8",
		children: [
			/* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: back,
				className: "flex h-10 items-center gap-1 text-sm font-black",
				children: [/* @__PURE__ */ jsx(ChevronLeft, { className: "h-5 w-5" }), " Back"]
			}),
			/* @__PURE__ */ jsx("h2", {
				className: "mt-8 text-center text-2xl font-black tracking-wide",
				children: titles[step] ?? "SONG"
			}),
			step === 0 && /* @__PURE__ */ jsx("input", {
				value: title,
				onChange: (e) => setTitle(e.target.value.slice(0, 28)),
				placeholder: "enter a title...",
				className: "mt-8 bg-transparent text-center text-lg outline-none placeholder:text-white/35"
			}),
			step === 1 && /* @__PURE__ */ jsx(DeskDial, {
				label: " ",
				name: session.style,
				onPrev: () => setStyleAt((n) => cycle(n, STYLES.length, -1)),
				onNext: () => setStyleAt((n) => cycle(n, STYLES.length, 1))
			}),
			step === 2 && /* @__PURE__ */ jsx(DeskDial, {
				label: " ",
				name: session.theme,
				onPrev: () => setThemeAt((n) => cycle(n, THEMES.length, -1)),
				onNext: () => setThemeAt((n) => cycle(n, THEMES.length, 1))
			}),
			step === 3 && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(DeskDial, {
				label: " ",
				name: picked,
				price: picked === "None" ? "" : money(quote.feats.find((item) => item.name === picked)?.price ?? 0),
				onPrev: () => setFeatAt((n) => cycle(n, featChoices.length, -1)),
				onNext: () => setFeatAt((n) => cycle(n, featChoices.length, 1))
			}), picked !== "None" && /* @__PURE__ */ jsxs("label", {
				className: "mt-6 flex items-center gap-3 px-2",
				children: [/* @__PURE__ */ jsxs("span", {
					className: "text-xs font-black",
					children: [
						"THEIR CUT ",
						featCut,
						"%"
					]
				}), /* @__PURE__ */ jsx("input", {
					type: "range",
					min: 0,
					max: 80,
					value: featCut,
					onChange: (e) => setFeatCut(Number(e.target.value)),
					className: "min-w-0 flex-1"
				})]
			})] }),
			step === 4 && /* @__PURE__ */ jsx(DeskDial, {
				label: " ",
				name: `${quote.lyricName} (${quote.lyricRating.toFixed(1)})`,
				price: money(quote.lyricPrice),
				onPrev: () => setPen((n) => cycle(n, LYRIC_DESKS.length, -1)),
				onNext: () => setPen((n) => cycle(n, LYRIC_DESKS.length, 1))
			}),
			step === 5 && /* @__PURE__ */ jsx(DeskDial, {
				label: " ",
				name: `${quote.prodName} (${quote.prodRating.toFixed(1)})`,
				price: money(quote.prodPrice),
				onPrev: () => setProd((n) => cycle(n, PROD_DESKS.length, -1)),
				onNext: () => setProd((n) => cycle(n, PROD_DESKS.length, 1))
			}),
			step === 6 && /* @__PURE__ */ jsx(DeskDial, {
				label: " ",
				name: instruments[instrumentAt] ?? "None",
				onPrev: () => setInstrumentAt((n) => cycle(n, instruments.length, -1)),
				onNext: () => setInstrumentAt((n) => cycle(n, instruments.length, 1))
			}),
			step === 7 && /* @__PURE__ */ jsx(DeskDial, {
				label: " ",
				name: `${quote.studioName} (${quote.studioRating.toFixed(1)})`,
				price: money(quote.studioPrice),
				onPrev: () => setStudio((n) => cycle(n, ROOM_DESKS.length, -1)),
				onNext: () => setStudio((n) => cycle(n, ROOM_DESKS.length, 1))
			}),
			step === 8 && /* @__PURE__ */ jsxs("dl", {
				className: "mt-8 flex flex-col gap-3 text-sm font-black",
				children: [
					/* @__PURE__ */ jsx(BillRow, {
						k: "SONGWRITER",
						v: money(quote.lyricPrice)
					}),
					/* @__PURE__ */ jsx(BillRow, {
						k: "PRODUCER",
						v: money(quote.prodPrice)
					}),
					/* @__PURE__ */ jsx(BillRow, {
						k: "STUDIO",
						v: money(quote.studioPrice)
					}),
					/* @__PURE__ */ jsx(BillRow, {
						k: "FEATS",
						v: money(quote.featCost)
					}),
					/* @__PURE__ */ jsx("div", { className: "my-1 h-px bg-white/25" }),
					/* @__PURE__ */ jsx(BillRow, {
						k: "TOTAL",
						v: money(quote.total)
					})
				]
			}),
			step < 8 ? /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setStep((n) => n + 1),
				className: "sim-pill sim-pill-cyan mt-16 text-[16px]",
				children: "NEXT"
			}) : /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsxs("p", {
					className: "mt-3 text-center text-xs text-white/55",
					children: [
						"You keep ",
						quote.yours,
						"% of what this song pays. ",
						quote.energy,
						" energy."
					]
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => props.onCompose(session),
					className: "sim-pill sim-pill-cyan mt-8 text-[16px]",
					children: "RECORD"
				}),
				short ? /* @__PURE__ */ jsx("p", {
					className: "mt-3 text-center text-xs font-bold text-[#ffe14a]",
					children: short
				}) : null
			] })
		]
	});
}
function DeskDial(props) {
	return /* @__PURE__ */ jsxs("div", {
		className: "mt-4",
		children: [/* @__PURE__ */ jsx("p", {
			className: "text-center text-sm font-black tracking-widest",
			children: props.label
		}), /* @__PURE__ */ jsxs("div", {
			className: "mt-2 flex items-center justify-center gap-3",
			children: [
				/* @__PURE__ */ jsx("button", {
					type: "button",
					"aria-label": `Previous ${props.label}`,
					onClick: props.onPrev,
					className: "grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-b from-emerald-300 to-emerald-600 text-[#06210f]",
					children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-5 w-5" })
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "min-w-[8.5rem] text-center",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-sm font-bold",
						children: props.name
					}), props.price ? /* @__PURE__ */ jsx("p", {
						className: "text-sm font-black text-[#3dff8a]",
						children: props.price
					}) : null]
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					"aria-label": `Next ${props.label}`,
					onClick: props.onNext,
					className: "grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-b from-emerald-300 to-emerald-600 text-[#06210f]",
					children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-5 w-5" })
				})
			]
		})]
	});
}
function BillRow({ k, v }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-baseline justify-between gap-3",
		children: [/* @__PURE__ */ jsx("dt", {
			className: "text-white/70",
			children: k
		}), /* @__PURE__ */ jsx("dd", {
			className: "text-[#3dff8a]",
			children: v
		})]
	});
}
function Action({ label, detail, onClick, disabled }) {
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		disabled,
		onClick,
		className: "rounded-2xl bg-white/10 px-3 py-3 text-left disabled:opacity-40",
		children: [/* @__PURE__ */ jsx("span", {
			className: "block text-sm font-black",
			children: label
		}), /* @__PURE__ */ jsx("span", {
			className: "block text-[11px] text-white/60",
			children: detail
		})]
	});
}
function Social(props) {
	const promo = props.gate("promo");
	const post = props.gate("post");
	const feed = useGame((s) => s.career.feed);
	const target = [...props.tracks].reverse().find((t) => t.status === "master" || t.status === "out");
	const icons = [
		MessageCircle,
		Calendar,
		Music,
		Clapperboard
	];
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-2.5",
		children: [
			/* @__PURE__ */ jsxs("p", {
				className: "text-center text-sm font-black",
				children: [fmt(props.followers), " career fans"]
			}),
			feed.length > 0 && /* @__PURE__ */ jsx("ul", {
				className: "flex flex-col gap-2",
				children: feed.slice(0, 8).map((item) => /* @__PURE__ */ jsxs("li", {
					className: "rounded-2xl bg-black/35 px-3 py-2.5",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-[13px] font-black",
						children: item.title
					}), /* @__PURE__ */ jsx("p", {
						className: "mt-0.5 text-xs leading-relaxed text-white/70",
						children: item.body
					})]
				}, item.id))
			}),
			/* @__PURE__ */ jsx("p", {
				className: "text-center text-[11px] font-bold tracking-wide text-white/50",
				children: target ? target.title : "Record a song before you can push it."
			}),
			!promo.ok && target && target.promo < PROMO_STEPS.length && /* @__PURE__ */ jsx("p", {
				className: "text-center text-xs font-bold text-[#ffe14a]",
				children: promo.reason
			}),
			PROMO_STEPS.map((step, i) => {
				const Icon = icons[i] ?? Music;
				const done = (target?.promo ?? 0) > i;
				const current = !!target && target.promo === i;
				const fill = done ? 100 : current ? 62 : 8;
				return /* @__PURE__ */ jsx("button", {
					type: "button",
					disabled: !current || !promo.ok,
					onClick: () => props.onAct("promo"),
					className: "sim-card rounded-2xl px-3 py-3 text-left disabled:cursor-not-allowed",
					children: /* @__PURE__ */ jsxs("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ jsx(Icon, {
							className: "h-10 w-10 shrink-0",
							strokeWidth: 1.6
						}), /* @__PURE__ */ jsxs("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ jsx("p", {
									className: "text-center text-[12px] font-black tracking-wide",
									children: step.name.toUpperCase()
								}),
								/* @__PURE__ */ jsx("div", {
									className: "mt-1.5 h-2 overflow-hidden rounded-full bg-white/30",
									children: /* @__PURE__ */ jsx("div", {
										className: "h-full rounded-full bg-white",
										style: { width: `${fill}%` }
									})
								}),
								/* @__PURE__ */ jsxs("div", {
									className: "mt-2 flex h-9 items-center justify-center gap-1 rounded-lg bg-white text-[15px] font-black text-[#1c2430]",
									children: [/* @__PURE__ */ jsx(Zap, { className: "h-4 w-4" }), step.cost]
								})
							]
						})]
					})
				}, step.name);
			}),
			/* @__PURE__ */ jsxs("button", {
				type: "button",
				disabled: !post.ok,
				onClick: () => props.onAct("post"),
				className: "flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-left disabled:opacity-40",
				children: [/* @__PURE__ */ jsx("span", {
					className: "text-sm font-black",
					children: "Daily post"
				}), /* @__PURE__ */ jsxs("span", {
					className: "flex items-center gap-1 text-sm font-black",
					children: [/* @__PURE__ */ jsx(Zap, { className: "h-4 w-4" }), COSTS.post]
				})]
			}),
			/* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: () => props.onClip("bts"),
				className: "flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-left",
				children: [/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("span", {
					className: "block text-sm font-black",
					children: "Behind the scenes"
				}), /* @__PURE__ */ jsx("span", {
					className: "text-[11px] text-white/55",
					children: "Not a song. Followers and hype."
				})] }), /* @__PURE__ */ jsxs("span", {
					className: "flex items-center gap-1 text-sm font-black",
					children: [/* @__PURE__ */ jsx(Zap, { className: "h-4 w-4" }), "14"]
				})]
			}),
			/* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: () => props.onClip("vlog"),
				className: "flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-left",
				children: [/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("span", {
					className: "block text-sm font-black",
					children: "Vlog"
				}), /* @__PURE__ */ jsx("span", {
					className: "text-[11px] text-white/55",
					children: "A day, posted. Followers."
				})] }), /* @__PURE__ */ jsxs("span", {
					className: "flex items-center gap-1 text-sm font-black",
					children: [/* @__PURE__ */ jsx(Zap, { className: "h-4 w-4" }), "10"]
				})]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "pt-1 text-center text-[11px] text-white/50",
				children: "Push the newest song that's out. 8 energy. Most of the night lands there, and it pays a little more."
			}),
			PLATFORMS.map((platform) => /* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: () => props.onPush(platform.id),
				className: "flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-left",
				children: [/* @__PURE__ */ jsxs("span", {
					className: "text-sm font-black",
					children: ["Push to ", platform.name]
				}), /* @__PURE__ */ jsxs("span", {
					className: "flex items-center gap-1 text-sm font-black",
					children: [/* @__PURE__ */ jsx(Zap, { className: "h-4 w-4" }), "8"]
				})]
			}, platform.id)),
			/* @__PURE__ */ jsx("p", {
				className: "pt-2 text-center text-[11px] font-black tracking-widest text-white/45",
				children: "PROMOTE YOUR MUSIC"
			})
		]
	});
}
function CreateScreen(props) {
	const [view, setView] = useState("menu");
	const [naming, setNaming] = useState(false);
	const [making, setMaking] = useState(false);
	const [styleSeed, setStyleSeed] = useState();
	const [bandName, setBandName] = useState("");
	const [focus, setFocus] = useState(null);
	const [openAlbum, setOpenAlbum] = useState(null);
	const [adding, setAdding] = useState(false);
	const [shooting, setShooting] = useState(false);
	const practice = useGame((s) => s.practice);
	const seek = useGame((s) => s.seek);
	const takeGig = useGame((s) => s.takeGig);
	const passGig = useGame((s) => s.passGig);
	const gigs = useGame((s) => s.career.gigs);
	const makeBand = useGame((s) => s.band);
	const contribute = useGame((s) => s.contribute);
	const band = useGame((s) => s.career.band);
	const awards = useGame((s) => s.career.awardLog);
	const awardCareer = useGame((s) => s.career);
	const film = useGame((s) => s.film);
	const goTour = useGame((s) => s.tour);
	const answerDeal = useGame((s) => s.answer);
	const submitAward = useGame((s) => s.submit);
	const sitInterview = useGame((s) => s.interview);
	const askTheLabel = useGame((s) => s.askLabel);
	const opened = useRef(props.tracks.length);
	const latest = [...props.tracks].reverse().find((track) => track.status === "out");
	const rawOvr = [
		props.skills.pen,
		props.skills.flow,
		props.skills.vocals,
		props.skills.prod
	].reduce((sum, n) => sum + n, 0) / 4;
	const ovr = Math.max(3, Math.round(rawOvr));
	if (view === "songs" && making) return /* @__PURE__ */ jsx(SongWizard, {
		nick: props.nick,
		skills: props.skills,
		cash: props.cash,
		energy: props.energy,
		gear: props.gear,
		rack: props.rack,
		npc: props.npc,
		path: props.path,
		staff: props.staff,
		trackCount: props.tracks.length,
		homeTier: props.homeTier,
		software: props.software,
		initialStyle: styleSeed,
		onCompose: props.onCompose,
		onClose: () => {
			setMaking(false);
			if (props.tracks.length > opened.current) {
				const newest = props.tracks[props.tracks.length - 1];
				if (newest && newest.kind !== "album") setFocus(newest.id);
			}
		}
	});
	if (view === "songs" && focus) {
		const open = props.tracks.find((track) => track.id === focus);
		if (open && open.kind !== "album") return /* @__PURE__ */ jsx(SongPage, {
			track: open,
			day: props.day,
			energy: props.energy,
			cash: props.cash,
			albums: props.tracks.filter((track) => track.kind === "album" && track.status !== "out"),
			npc: props.npc,
			year: props.year,
			onBack: () => setFocus(null),
			onDrill: (key) => props.onDrill(open.id, key),
			onSchedule: (day) => props.onSchedule(open.id, day),
			onRename: (title) => props.onRename(open.id, title),
			onDelete: () => {
				props.onDelete(open.id);
				setFocus(null);
			},
			onFile: (albumId, title) => props.onFile(open.id, albumId, title),
			albumTitle: props.tracks.find((item) => item.id === open.albumOf)?.title || "",
			onFeat: (name, cut) => props.onFeat(open.id, name, cut)
		});
	}
	if (view === "songs") return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-3",
		children: [/* @__PURE__ */ jsx("button", {
			type: "button",
			onClick: () => setView("menu"),
			className: "h-10 text-left text-sm font-black",
			children: "Back"
		}), /* @__PURE__ */ jsx(Studio, {
			tracks: props.tracks,
			day: props.day,
			year: props.year,
			onAct: props.onAct,
			onOpen: setFocus,
			onNew: () => {
				opened.current = props.tracks.length;
				setMaking(true);
			},
			gate: props.gate
		})]
	});
	if (view === "albums" && naming) return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col pb-8",
		children: [
			/* @__PURE__ */ jsx("button", {
				type: "button",
				"aria-label": "Back",
				onClick: () => setNaming(false),
				className: "grid h-10 w-10 place-items-center",
				children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-6 w-6" })
			}),
			/* @__PURE__ */ jsx("h2", {
				className: "mt-16 text-center text-2xl font-black tracking-wide",
				children: "ALBUM TITLE"
			}),
			/* @__PURE__ */ jsx("input", {
				value: props.albumName,
				onChange: (e) => props.setAlbumName(e.target.value.slice(0, 28)),
				placeholder: "enter a title...",
				className: "mt-3 bg-transparent text-center text-sm outline-none placeholder:text-white/35"
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => {
					props.onAlbum();
					setNaming(false);
				},
				className: "sim-pill sim-pill-cyan mt-16 text-[16px]",
				children: "CREATE"
			})
		]
	});
	if (view === "albums" && openAlbum) {
		const album = props.tracks.find((track) => track.id === openAlbum && track.kind === "album");
		if (album) {
			const members = props.tracks.filter((track) => track.albumOf === album.id);
			const loose = props.tracks.filter((track) => track.kind !== "album" && track.kind !== "video" && track.status !== "out" && track.albumOf !== album.id);
			const locked = album.status === "out";
			return /* @__PURE__ */ jsx(AlbumPage, {
				album,
				members,
				loose,
				adding,
				setAdding,
				day: props.day,
				year: props.year,
				onBack: () => {
					setAdding(false);
					setOpenAlbum(null);
				},
				onSchedule: (day) => props.onSchedule(album.id, day),
				onFile: (songId) => {
					props.onFile(songId, album.id);
					setAdding(false);
				},
				onRename: (title) => props.onRename(album.id, title),
				onDelete: () => {
					props.onDelete(album.id);
					setOpenAlbum(null);
				},
				onOpenSong: (id) => {
					setFocus(id);
					setView("songs");
				},
				locked
			});
		}
	}
	if (view === "albums") {
		const albums = props.tracks.filter((track) => track.kind === "album");
		return /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col gap-3",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => setView("menu"),
					className: "h-10 text-left text-sm font-black",
					children: "Back"
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					"aria-label": "New album",
					onClick: () => setNaming(true),
					className: "grid h-11 w-16 place-items-center rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 text-[#06210f]",
					children: /* @__PURE__ */ jsx(Plus, {
						className: "h-6 w-6",
						strokeWidth: 2.6
					})
				})]
			}), /* @__PURE__ */ jsxs("ul", {
				className: "flex flex-col gap-2",
				children: [albums.length === 0 && /* @__PURE__ */ jsx("li", {
					className: "text-sm text-white/50",
					children: "No albums. Name one and hit plus."
				}), albums.map((album) => {
					const count = props.tracks.filter((track) => track.albumOf === album.id).length;
					return /* @__PURE__ */ jsx("li", {
						className: "flex items-center gap-3 rounded-2xl bg-black/35 px-3 py-2",
						children: /* @__PURE__ */ jsxs("button", {
							type: "button",
							onClick: () => {
								setAdding(false);
								setOpenAlbum(album.id);
							},
							className: "flex min-w-0 flex-1 items-center gap-3 text-left",
							children: [/* @__PURE__ */ jsx("span", {
								className: "grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-emerald-300 to-sky-500 text-[#06210f]",
								children: /* @__PURE__ */ jsx(Disc, { className: "h-5 w-5" })
							}), /* @__PURE__ */ jsxs("span", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ jsx("span", {
									className: "block truncate font-bold",
									children: album.title
								}), /* @__PURE__ */ jsxs("span", {
									className: "block text-xs text-white/55",
									children: [
										"Album · ",
										count,
										" track",
										count === 1 ? "" : "s",
										album.status === "out" ? " · out" : album.dropOn ? ` · ${shortStamp(album.dropOn, props.year)}` : " · unreleased"
									]
								})]
							})]
						})
					}, album.id);
				})]
			})]
		});
	}
	if (view === "videos") {
		const ready = props.tracks.filter((track) => track.kind !== "album" && track.status !== "draft" && !track.visual);
		const clips = props.tracks.filter((track) => track.visual || track.kind === "video");
		if (shooting) return /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col gap-3 pb-4",
			children: [
				/* @__PURE__ */ jsx("button", {
					type: "button",
					"aria-label": "Back",
					onClick: () => setShooting(false),
					className: "grid h-10 w-10 place-items-center",
					children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-6 w-6" })
				}),
				/* @__PURE__ */ jsx("h2", {
					className: "text-center text-xl font-black tracking-wide",
					children: "SHOOT"
				}),
				/* @__PURE__ */ jsxs("p", {
					className: "text-center text-xs text-white/55",
					children: [
						"A video is ",
						COSTS.visual,
						" energy. It makes that song play harder. It does not pay by itself."
					]
				}),
				/* @__PURE__ */ jsxs("ul", {
					className: "flex flex-col gap-2",
					children: [ready.length === 0 && /* @__PURE__ */ jsx("li", {
						className: "text-sm text-white/55",
						children: "Nothing to film. Record a song first, or every cut already has a video."
					}), ready.map((track) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", {
						type: "button",
						disabled: props.energy < COSTS.visual,
						onClick: () => {
							film(track.id);
							setShooting(false);
						},
						className: "flex w-full items-center justify-between rounded-2xl bg-black/35 px-3 py-3 text-left disabled:opacity-40",
						children: [/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("span", {
							className: "block font-bold",
							children: track.title
						}), /* @__PURE__ */ jsxs("span", {
							className: "block text-xs text-white/55",
							children: [
								track.status === "out" ? "Out" : "Ready",
								" · ",
								COSTS.visual,
								" energy"
							]
						})] }), /* @__PURE__ */ jsx(Clapperboard, { className: "h-5 w-5" })]
					}) }, track.id))]
				})
			]
		});
		return /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col gap-3",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ jsx("button", {
						type: "button",
						"aria-label": "Back",
						onClick: () => setView("menu"),
						className: "grid h-10 w-10 place-items-center",
						children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-6 w-6" })
					}), /* @__PURE__ */ jsx("button", {
						type: "button",
						"aria-label": "Shoot a video",
						onClick: () => setShooting(true),
						className: "grid h-11 w-16 place-items-center rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 text-[#06210f]",
						children: /* @__PURE__ */ jsx(Plus, {
							className: "h-6 w-6",
							strokeWidth: 2.6
						})
					})]
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-xs text-white/55",
					children: ready.length ? "Plus picks which song gets the video." : "No song is waiting on a video."
				}),
				/* @__PURE__ */ jsxs("ul", {
					className: "flex flex-col gap-2",
					children: [clips.length === 0 && /* @__PURE__ */ jsx("li", {
						className: "text-sm text-white/50",
						children: "No videos yet."
					}), clips.map((clip) => /* @__PURE__ */ jsxs("li", {
						className: "flex items-center gap-3 rounded-2xl bg-black/35 px-3 py-2",
						children: [/* @__PURE__ */ jsx("span", {
							className: "grid h-11 w-11 place-items-center rounded-xl bg-black/50",
							children: /* @__PURE__ */ jsx(Clapperboard, { className: "h-5 w-5" })
						}), /* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("span", {
							className: "block font-bold",
							children: clip.title
						}), /* @__PURE__ */ jsxs("span", {
							className: "block text-xs text-white/55",
							children: [
								"Video · ",
								fmt(clip.streams),
								" plays"
							]
						})] })]
					}, clip.id))]
				})
			]
		});
	}
	if (view === "beats") {
		const royalty = Math.min(28, Math.max(0, Math.round(props.skills.prod / 4)));
		const work = gigs.filter((gig) => gig.kind === "feature" || gig.kind === "produce");
		return /* @__PURE__ */ jsxs("div", {
			className: "relative flex flex-col gap-3",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ jsx("button", {
						type: "button",
						"aria-label": "Back",
						onClick: () => setView("menu"),
						className: "grid h-10 w-10 place-items-center",
						children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-6 w-6" })
					}), /* @__PURE__ */ jsx("button", {
						type: "button",
						"aria-label": "Look for work",
						onClick: () => seek("producer"),
						className: "grid h-11 w-16 place-items-center rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 text-[#06210f]",
						children: /* @__PURE__ */ jsx(Plus, {
							className: "h-6 w-6",
							strokeWidth: 2.6
						})
					})]
				}),
				/* @__PURE__ */ jsxs("p", {
					className: "text-center text-sm font-black",
					children: [royalty, "% royalty rate"]
				}),
				work.length === 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("p", {
					className: "mt-6 text-center text-base leading-snug text-white/80",
					children: "No one wants a feature from you right now..."
				}), /* @__PURE__ */ jsx("p", {
					className: "text-center text-base leading-snug text-white/80",
					children: "No one wants to hire you to produce a song right now..."
				})] }) : work.map((gig) => /* @__PURE__ */ jsxs("article", {
					className: "rounded-2xl bg-black/35 px-4 py-3",
					children: [
						/* @__PURE__ */ jsxs("p", {
							className: "font-black",
							children: [
								gig.kind === "feature" ? "Feature" : "Produce",
								" · ",
								gig.from
							]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1 text-sm leading-snug text-white/75",
							children: gig.blurb
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "mt-3 flex gap-2",
							children: [/* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => takeGig(gig.id),
								className: "sim-pill sim-pill-cyan text-[14px]",
								children: "TAKE IT"
							}), /* @__PURE__ */ jsx("button", {
								type: "button",
								onClick: () => passGig(gig.id),
								className: "sim-pill sim-pill-red text-[14px]",
								children: "PASS"
							})]
						})
					]
				}, gig.id)),
				props.beats.length > 0 && /* @__PURE__ */ jsx("ul", {
					className: "mt-2 flex flex-col gap-2",
					children: [...props.beats].reverse().map((cut) => /* @__PURE__ */ jsxs("li", {
						className: "flex items-center justify-between rounded-2xl bg-black/35 px-3 py-3",
						children: [/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("span", {
							className: "block font-bold",
							children: cut.title
						}), /* @__PURE__ */ jsxs("span", {
							className: "block text-xs text-white/55",
							children: ["Sold · ", shortStamp(cut.day, props.year)]
						})] }), /* @__PURE__ */ jsx("span", {
							className: "text-sm font-black text-[#3dff8a]",
							children: money(cut.pay)
						})]
					}, cut.id))
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: props.onBeats,
					className: "sim-pill sim-pill-pink text-[15px]",
					children: "CUSTOM ORDERS"
				})
			]
		});
	}
	if (view === "train") return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setView("menu"),
				className: "h-10 text-left text-sm font-black",
				children: "Back"
			}),
			/* @__PURE__ */ jsx("h2", {
				className: "text-center text-xl font-black tracking-wide",
				children: "MUSIC LESSONS"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "text-center text-xs text-white/50",
				children: "Energy only. A point at a time. The paid class is under Wallet, School."
			}),
			/* @__PURE__ */ jsx(SkillScreen, {
				skills: props.skills,
				energy: props.energy,
				onTrain: props.onTrain
			})
		]
	});
	if (view === "band") return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-3",
		children: [/* @__PURE__ */ jsx("button", {
			type: "button",
			onClick: () => setView("menu"),
			className: "h-10 text-left text-sm font-black",
			children: "Back"
		}), band ? /* @__PURE__ */ jsxs(Fragment, { children: [
			/* @__PURE__ */ jsx("h2", {
				className: "text-center text-2xl font-black",
				children: band.name
			}),
			/* @__PURE__ */ jsx("p", {
				className: "text-center text-xs text-white/55",
				children: band.mates.length ? band.mates.join(", ") : "Just you. Ask someone warm."
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => props.onJump("artists"),
				className: "sim-pill sim-pill-cyan text-[15px]",
				children: "FIND BANDMATES"
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: contribute,
				className: "sim-pill sim-pill-pink text-[15px]",
				children: "CONTRIBUTE · 8 ENERGY"
			})
		] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
			/* @__PURE__ */ jsx("h2", {
				className: "text-center text-2xl font-black tracking-wide",
				children: "BAND NAME"
			}),
			/* @__PURE__ */ jsx("input", {
				value: bandName,
				onChange: (e) => setBandName(e.target.value.slice(0, 24)),
				placeholder: "enter a name...",
				className: "mt-2 bg-transparent text-center text-sm outline-none placeholder:text-white/35"
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => makeBand(bandName),
				className: "sim-pill sim-pill-cyan text-[16px]",
				children: "FORM"
			})
		] })]
	});
	if (view === "call" || view === "kpop") {
		const kind = view === "kpop" ? "kpop" : "audition";
		const offers = gigs.filter((gig) => gig.kind === kind);
		return /* @__PURE__ */ jsxs("div", {
			className: "relative flex min-h-[70%] flex-col gap-3",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ jsx("button", {
					type: "button",
					"aria-label": "Back",
					onClick: () => setView("menu"),
					className: "grid h-10 w-10 place-items-center",
					children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-6 w-6" })
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					"aria-label": "Check again",
					onClick: () => seek(kind),
					className: "grid h-11 w-16 place-items-center rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 text-[#06210f]",
					children: /* @__PURE__ */ jsx(Plus, {
						className: "h-6 w-6",
						strokeWidth: 2.6
					})
				})]
			}), offers.length === 0 ? /* @__PURE__ */ jsx("p", {
				className: "mt-28 px-6 text-center text-lg leading-snug text-white/80",
				children: kind === "kpop" ? "No one wants a tryout right now..." : "No one wants to audition you right now..."
			}) : offers.map((gig) => /* @__PURE__ */ jsxs("article", {
				className: "rounded-2xl bg-black/35 px-4 py-3",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "font-black",
						children: gig.from
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-1 text-sm leading-snug text-white/75",
						children: gig.blurb
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-3 flex gap-2",
						children: [/* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => takeGig(gig.id),
							className: "sim-pill sim-pill-cyan text-[14px]",
							children: "TAKE IT"
						}), /* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => passGig(gig.id),
							className: "sim-pill sim-pill-red text-[14px]",
							children: "PASS"
						})]
					})
				]
			}, gig.id))]
		});
	}
	if (view === "instrument") return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-3 pb-4",
		children: [
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setView("menu"),
				className: "h-10 text-left text-sm font-black",
				children: "Back"
			}),
			/* @__PURE__ */ jsx("h2", {
				className: "text-center text-xl font-black tracking-wide",
				children: "PLAY INSTRUMENT"
			}),
			/* @__PURE__ */ jsxs("p", {
				className: "text-center text-xs text-white/55",
				children: [
					"Flow ",
					props.skills.flow,
					" · Production ",
					props.skills.prod,
					". Six energy. Each one moves those two by 1."
				]
			}),
			[
				{
					name: "Piano",
					note: "An hour on the keys."
				},
				{
					name: "Guitar",
					note: "An hour on the guitar."
				},
				{
					name: "Bass",
					note: "An hour on the bass."
				},
				{
					name: "Drums",
					note: "An hour on the kit."
				},
				{
					name: "Violin",
					note: "An hour on the violin."
				}
			].map((axis) => /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: practice,
				disabled: props.energy < 6 || (props.skills.flow >= 100 && props.skills.prod >= 100),
				className: "sim-pill sim-pill-cyan text-left text-[15px] disabled:opacity-40",
				children: /* @__PURE__ */ jsxs("span", {
					className: "flex w-full items-center justify-between gap-3",
					children: [/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("span", {
						className: "block",
						children: axis.name.toUpperCase()
					}), /* @__PURE__ */ jsx("span", {
						className: "block text-[11px] font-bold text-white/70",
						children: props.skills.flow >= 100 && props.skills.prod >= 100 ? "Flow and Production are already 100." : axis.note
					})] }), /* @__PURE__ */ jsx("span", {
						className: "text-[12px]",
						children: props.skills.flow >= 100 && props.skills.prod >= 100 ? "Max" : "6"
					})]
				})
			}, axis.name))
		]
	});
	if (view === "awards") {
		const trade = awardCareer.trade;
		return /* @__PURE__ */ jsx(GrammyRoom, {
			year: 2026 + Math.floor((awardCareer.day - 1) / 365),
			rows: ceremonyRows(awardCareer),
			won: (trade?.grammy?.wins ?? []).filter((row) => row.you).map((row) => ({ id: `${row.season}:${row.category}`, name: `${row.category} · ${row.title}`, week: row.day })),
			tracks: awardCareer.tracks.filter((track) => track.status === "out"),
			submitted: trade?.grammy?.submitted ?? [],
			recognition: trade?.recognition ?? "Unknown Artist",
			offers: trade?.offers ?? [],
			onSubmit: submitAward,
			onInterview: sitInterview,
			onLabel: askTheLabel,
			onBack: () => setView("menu")
		});
	}
	if (view === "contracts") {
		const paper = awardCareer.mail.filter((mail) => mail.kind === "label");
		const pitch = props.gate("pitch");
		const deal = awardCareer.label;
		return /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col gap-3 pb-4",
			children: [
				/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => setView("menu"),
					className: "h-10 text-left text-sm font-black",
					children: "Back"
				}),
				/* @__PURE__ */ jsx("h2", {
					className: "text-center text-xl font-black tracking-wide",
					children: "MUSIC CONTRACTS"
				}),
				/* @__PURE__ */ jsx("article", {
					className: "rounded-2xl bg-black/35 px-4 py-3",
					children: deal ? /* @__PURE__ */ jsxs(Fragment, { children: [
						/* @__PURE__ */ jsx("p", {
							className: "font-black",
							children: deal.name
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "mt-1 text-sm text-white/70",
							children: [
								"They take ",
								Math.round(deal.cut * 100),
								"% of the streams."
							]
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "mt-1 text-sm text-white/70",
							children: [
								deal.made,
								"/",
								deal.due,
								" singles · ",
								deal.weeksLeft,
								" weeks left"
							]
						})
					] }) : /* @__PURE__ */ jsx("p", {
						className: "text-sm leading-snug text-white/70",
						children: "No label. A song has to be out, Business has to be trained, and the name needs buzz before anyone sends paper."
					})
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					disabled: !pitch.ok,
					onClick: () => props.onAct("pitch"),
					className: "sim-pill sim-pill-cyan text-[15px] disabled:opacity-40",
					children: pitch.ok ? "ASK FOR PAPER" : pitch.reason
				}),
				/* @__PURE__ */ jsx(MailList, {
					items: paper,
					empty: deal ? "No new paper." : "Nothing in the mail.",
					onAnswer: answerDeal
				})
			]
		});
	}
	if (view === "tour") {
		const quote = tourQuote(awardCareer);
		const show = props.gate("show");
		const stage = tierOf(awardCareer.fame).current.name;
		const ready = awardCareer.fame >= quote.fameNeed && quote.songs >= quote.need && awardCareer.energy >= quote.energy && awardCareer.cash >= quote.cost;
		const why = quote.songs < quote.need ? `${quote.songs}/${quote.need} songs out` : awardCareer.fame < quote.fameNeed ? `Opens at Local. You're ${stage}.` : awardCareer.energy < quote.energy ? "Need 22 energy" : awardCareer.cash < quote.cost ? `Need ${money(quote.cost)} to move` : `${quote.stops} cities · spend ${money(quote.cost)} · door is not guaranteed`;
		return /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col gap-3 pb-4",
			children: [
				/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => setView("menu"),
					className: "h-10 text-left text-sm font-black",
					children: "Back"
				}),
				/* @__PURE__ */ jsx("h2", {
					className: "text-center text-xl font-black tracking-wide",
					children: "GO ON TOUR"
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					disabled: !show.ok,
					onClick: () => props.onAct("show"),
					className: "sim-pill sim-pill-cyan text-[15px] disabled:opacity-40",
					children: show.ok ? `PLAY ${show.detail.toUpperCase()}` : show.reason
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-center text-xs text-white/50",
					children: show.ok ? `${COSTS.show} energy. One room, not a tour.` : ""
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					disabled: !ready,
					onClick: goTour,
					className: "sim-pill sim-pill-pink text-[15px] disabled:opacity-40",
					children: "START THE LEG"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-center text-xs text-white/55",
					children: why
				})
			]
		});
	}
	const letters = [
		{
			k: "L",
			n: props.skills.pen
		},
		{
			k: "F",
			n: props.skills.flow
		},
		{
			k: "V",
			n: props.skills.vocals
		},
		{
			k: "P",
			n: props.skills.prod
		}
	];
	function write(style) {
		setStyleSeed(style);
		setView("songs");
		setMaking(true);
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-2 pb-2",
		children: [
			/* @__PURE__ */ jsx("p", {
				className: "text-center text-sm font-black tracking-[0.18em] text-white/55",
				children: latest ? latest.title.toUpperCase() : "NOT RELEASED"
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => write(),
				className: "sim-pill sim-pill-cyan text-[15px]",
				children: "RECORD SONG"
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setView("instrument"),
				className: "sim-pill sim-pill-cyan text-[15px]",
				children: "PLAY INSTRUMENT"
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setView("call"),
				className: "sim-pill sim-pill-cyan text-[15px]",
				children: "AUDITION"
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setView("train"),
				className: "sim-pill sim-pill-cyan text-[15px]",
				children: "MUSIC LESSONS"
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setView("band"),
				className: "sim-pill sim-pill-cyan text-[15px]",
				children: "BAND"
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setView("kpop"),
				className: "sim-pill sim-pill-cyan text-[15px]",
				children: "K-POP"
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setView("awards"),
				className: "sim-pill sim-pill-cyan text-[15px]",
				children: "GRAMMY AWARDS"
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => props.onJump("chart"),
				className: "sim-pill sim-pill-cyan text-[15px]",
				children: "MUSIC CHARTS"
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => write(),
				className: "sim-pill sim-pill-cyan text-[15px]",
				children: "WRITE SONG"
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setView("contracts"),
				className: "sim-pill sim-pill-cyan text-[15px]",
				children: "MUSIC CONTRACTS"
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setView("tour"),
				className: "sim-pill sim-pill-pink text-[15px]",
				children: "GO ON TOUR"
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setView("videos"),
				className: "sim-pill sim-pill-cyan text-[15px]",
				children: "MUSIC VIDEO"
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setView("beats"),
				className: "sim-pill sim-pill-cyan text-[15px]",
				children: "MUSIC PRODUCER"
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setView("songs"),
				className: "sim-pill sim-pill-cyan text-[15px]",
				children: "MUSIC STUDIO"
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => props.onJump("studio"),
				className: "sim-pill sim-pill-cyan text-[15px]",
				children: "DISCOGRAPHY"
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setView("albums"),
				className: "sim-pill sim-pill-cyan text-[15px]",
				children: "ALBUMS"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "pt-1 text-center text-xs font-black tracking-[0.2em] text-white/45",
				children: "SKILLS"
			}),
			/* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: () => setView("train"),
				className: "sim-pill sim-pill-violet h-[4.5rem] justify-between px-4 text-left",
				children: [
					/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("span", {
						className: "block text-[11px] tracking-widest",
						children: "OVR"
					}), /* @__PURE__ */ jsx("span", {
						className: "text-3xl leading-none",
						children: ovr
					})] }),
					/* @__PURE__ */ jsx("span", {
						className: "flex flex-1 items-end justify-around px-2",
						children: letters.map((letter) => /* @__PURE__ */ jsxs("span", {
							className: "flex flex-col items-center gap-1",
							children: [/* @__PURE__ */ jsx("span", {
								className: "text-[11px] font-black",
								children: letter.k
							}), /* @__PURE__ */ jsx("span", {
								className: "sim-arch",
								style: { height: `${18 + Math.round(letter.n * .35)}px` }
							})]
						}, letter.k))
					}),
					/* @__PURE__ */ jsx(ChevronRight, { className: "h-5 w-5" })
				]
			})
		]
	});
}
function AlbumPage(props) {
	const [offset, setOffset] = useState(releaseOffset(props.day, props.album.dropOn, props.year));
	const [dating, setDating] = useState(false);
	const [titleOn, setTitleOn] = useState(false);
	const [title, setTitle] = useState(props.album.title);
	const [sure, setSure] = useState(false);
	const when = props.day + offset;
	if (dating) return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col pb-8",
		children: [
			/* @__PURE__ */ jsx("button", {
				type: "button",
				"aria-label": "Back",
				onClick: () => setDating(false),
				className: "grid h-10 w-10 place-items-center",
				children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-6 w-6" })
			}),
			/* @__PURE__ */ jsx("h2", {
				className: "mt-8 text-center text-2xl font-black tracking-wide",
				children: "RELEASE DATE"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-6 flex items-center justify-center gap-3",
				children: [
					/* @__PURE__ */ jsx("button", {
						type: "button",
						"aria-label": "Earlier date",
						onClick: () => setOffset((n) => Math.max(1, n - 1)),
						className: "grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-b from-emerald-300 to-emerald-600 text-[#06210f]",
						children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-5 w-5" })
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "min-w-[8rem] text-center",
						children: [/* @__PURE__ */ jsx("p", {
							className: "text-lg font-black",
							children: shortStamp(when, props.year)
						}), /* @__PURE__ */ jsx("p", {
							className: "text-sm text-white/70",
							children: weekdayLong(when, props.year)
						})]
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						"aria-label": "Later date",
						onClick: () => setOffset((n) => Math.min(21, n + 1)),
						className: "grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-b from-emerald-300 to-emerald-600 text-[#06210f]",
						children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-5 w-5" })
					})
				]
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => {
					props.onSchedule(when);
					setDating(false);
				},
				className: "sim-pill sim-pill-cyan mt-8 text-[16px]",
				children: "RELEASE"
			})
		]
	});
	if (props.adding) return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-3 pb-4",
		children: [
			/* @__PURE__ */ jsx("button", {
				type: "button",
				"aria-label": "Back",
				onClick: () => props.setAdding(false),
				className: "grid h-10 w-10 place-items-center",
				children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-6 w-6" })
			}),
			/* @__PURE__ */ jsx("h2", {
				className: "text-center text-xl font-black tracking-wide",
				children: "ADD SONG"
			}),
			/* @__PURE__ */ jsxs("ul", {
				className: "flex flex-col gap-2",
				children: [props.loose.length === 0 && /* @__PURE__ */ jsx("li", {
					className: "text-sm text-white/55",
					children: "No loose song. Record one that isn't out yet."
				}), props.loose.map((song) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => props.onFile(song.id),
					className: "flex w-full items-center justify-between rounded-2xl bg-black/35 px-3 py-3 text-left",
					children: [/* @__PURE__ */ jsx("span", {
						className: "font-bold",
						children: song.title
					}), /* @__PURE__ */ jsx("span", {
						className: "text-xs text-white/55",
						children: song.status === "master" ? "Ready" : "Draft"
					})]
				}) }, song.id))]
			})
		]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-3 pb-6",
		children: [
			/* @__PURE__ */ jsx("button", {
				type: "button",
				"aria-label": "Back",
				onClick: props.onBack,
				className: "grid h-10 w-10 place-items-center",
				children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-6 w-6" })
			}),
			/* @__PURE__ */ jsx("div", {
				className: "mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-emerald-300 to-sky-500 text-[#06210f]",
				children: /* @__PURE__ */ jsx(Disc, { className: "h-8 w-8" })
			}),
			/* @__PURE__ */ jsx("h2", {
				className: "text-center text-3xl font-black tracking-wide",
				children: props.album.title
			}),
			/* @__PURE__ */ jsx("p", {
				className: "text-center text-xs text-white/55",
				children: props.locked ? `${fmt(props.album.streams)} plays · ${money(props.album.earned)}` : props.album.dropOn ? `Drops ${shortStamp(props.album.dropOn, props.year)}` : "Unreleased"
			}),
			/* @__PURE__ */ jsxs("ul", {
				className: "flex flex-col gap-2",
				children: [props.members.length === 0 && /* @__PURE__ */ jsx("li", {
					className: "text-center text-sm text-white/50",
					children: "No songs on it."
				}), props.members.map((song) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => props.onOpenSong(song.id),
					className: "flex w-full items-center justify-between rounded-2xl bg-black/35 px-3 py-3 text-left",
					children: [/* @__PURE__ */ jsx("span", {
						className: "font-bold",
						children: song.title
					}), /* @__PURE__ */ jsx("span", {
						className: "text-xs text-white/55",
						children: song.status === "out" ? "Out" : "On the album"
					})]
				}) }, song.id))]
			}),
			!props.locked && /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => {
					if (props.members.length === 0) {
						props.onSchedule(props.day);
						return;
					}
					setDating(true);
				},
				className: "sim-pill sim-pill-cyan text-[16px]",
				children: props.album.dropOn ? "CHANGE DATE" : "RELEASE"
			}),
			!props.locked && /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => props.setAdding(true),
				className: "sim-pill sim-pill-cyan text-[16px]",
				children: "ADD SONG"
			}),
			!props.locked && /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setTitleOn((on) => !on),
				className: "sim-pill sim-pill-cyan text-[16px]",
				children: "RENAME ALBUM"
			}),
			!props.locked && titleOn && /* @__PURE__ */ jsxs("form", {
				className: "flex gap-2",
				onSubmit: (event) => {
					event.preventDefault();
					props.onRename(title);
					setTitleOn(false);
				},
				children: [/* @__PURE__ */ jsx("input", {
					value: title,
					onChange: (event) => setTitle(event.target.value.slice(0, 28)),
					className: "h-12 min-w-0 flex-1 rounded-full bg-black/30 px-4 text-center text-sm"
				}), /* @__PURE__ */ jsx("button", {
					type: "submit",
					className: "sim-pill sim-pill-cyan w-auto px-4 text-[13px]",
					children: "SAVE"
				})]
			}),
			!props.locked && (sure ? /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: props.onDelete,
				className: "sim-pill sim-pill-red text-[15px]",
				children: "DELETE THIS ALBUM"
			}) : /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setSure(true),
				className: "sim-pill sim-pill-cyan text-[16px]",
				children: "DELETE ALBUM"
			}))
		]
	});
}
function plaque(streams) {
	if (streams >= 5e6) return "World";
	if (streams >= 5e5) return "Country";
	if (streams >= 5e4) return "City";
	if (streams >= 1e4) return "Room";
	return "";
}

function OpenedTrack(props) {
	const [adding, setAdding] = useState(false);
	const track = props.tracks.find((item) => item.id === props.id);
	if (!track) return null;
	if (track.kind === "album") {
		const members = props.tracks.filter((item) => item.albumOf === track.id);
		const loose = props.tracks.filter((item) => item.kind !== "album" && item.kind !== "video" && item.status !== "out" && item.albumOf !== track.id);
		return jsx(AlbumPage, {
			album: track,
			members,
			loose,
			adding,
			setAdding,
			day: props.day,
			year: props.year,
			onBack: props.onClose,
			onSchedule: (day) => props.onSchedule(track.id, day),
			onFile: (songId) => {
				props.onFile(songId, track.id);
				setAdding(false);
			},
			onRename: (title) => props.onRename(track.id, title),
			onDelete: () => {
				props.onDelete(track.id);
				props.onClose();
			},
			onOpenSong: (id) => props.onOpen(id)
		});
	}
	return jsx(SongPage, {
		track,
		day: props.day,
		energy: props.energy,
		cash: props.cash,
		albums: props.tracks.filter((item) => item.kind === "album" && item.status !== "out"),
		npc: props.npc,
		year: props.year,
		cert: (() => {
			const row = (props.certs ?? []).find((item) => item.trackId === track.id && item.level);
			return row ? `${certName(row.level)} · ${row.units} units` : "";
		})(),
		startOnDate: track.status !== "out" && !track.dropOn,
		onBack: props.onClose,
		onDrill: (key) => props.onDrill(track.id, key),
		onSchedule: (day) => props.onSchedule(track.id, day),
		onRename: (title) => props.onRename(track.id, title),
		onDelete: () => {
			props.onDelete(track.id);
			props.onClose();
		},
		onFile: (albumId, title) => props.onFile(track.id, albumId, title),
		albumTitle: props.tracks.find((item) => item.id === track.albumOf)?.title || "",
		onFeat: (name, cut) => props.onFeat(track.id, name, cut)
	});
}
function Catalog({ tracks, year, onOpen, certs }) {
	const [filter, setFilter] = useState("all");
	const out = tracks.filter((track) => track.status === "out");
	const waiting = tracks.filter((track) => track.status !== "out" && track.kind !== "album" && (track.status === "master" || track.dropOn != null));
	const latest = [...out].reverse()[0];
	const nextUp = [...waiting].filter((track) => track.dropOn).sort((a, b) => (a.dropOn ?? 0) - (b.dropOn ?? 0))[0];
	const featured = latest ?? nextUp ?? waiting[0];
	const released = filter === "albums" ? out.filter((track) => track.kind === "album") : filter === "singles" ? out.filter((track) => track.kind !== "album") : out;
	const queued = filter === "albums" || filter === "certs" ? [] : waiting;
	const list = filter === "certs" ? out : [...released, ...queued];
	const certOf = (track) => (certs ?? []).find((item) => item.trackId === track.id && item.level);
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-3 pb-2",
		children: [
			/* @__PURE__ */ jsx("p", {
				className: "text-center text-xl font-black tracking-wide",
				children: "POPULAR"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-4 text-center text-sm font-black tracking-[0.16em]",
				children: "LATEST RELEASE"
			}),
			/* @__PURE__ */ jsxs("button", {
				type: "button",
				disabled: !featured,
				onClick: () => featured && onOpen(featured.id),
				className: "flex items-center gap-3 text-left disabled:opacity-60",
				children: [/* @__PURE__ */ jsx("span", {
					className: "grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-black/55",
					children: /* @__PURE__ */ jsx(Music, { className: "h-8 w-8" })
				}), /* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("span", {
					className: "block font-black",
					children: latest ? latest.title : nextUp ? nextUp.title : "— — —"
				}), /* @__PURE__ */ jsx("span", {
					className: "block text-xs text-white/55",
					children: latest ? `${fmt(latest.streams)} plays · ${money(latest.earned)}` : nextUp ? `Dated · drops ${shortStamp(nextUp.dropOn ?? 0, year)}` : waiting[0] ? "Cut, not dated. Open it and pick a Friday." : "— — —"
				})] })]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => setFilter("singles"),
					className: "sim-pill sim-pill-cyan text-[15px]",
					children: "SINGLES"
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => setFilter("albums"),
					className: "sim-pill sim-pill-cyan text-[15px]",
					children: "ALBUMS"
				})]
			}),
			/* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: () => setFilter("all"),
				className: "sim-pill sim-pill-pink text-[15px]",
				children: [/* @__PURE__ */ jsx(Music, { className: "h-4 w-4" }), " ALL YOUR SONGS"]
			}),
			/* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: () => setFilter("certs"),
				className: "sim-pill sim-pill-pink text-[15px]",
				children: [/* @__PURE__ */ jsx(Star, { className: "h-4 w-4" }), " CERTIFICATIONS"]
			}),
			/* @__PURE__ */ jsxs("ul", {
				className: "flex flex-col gap-2",
				children: [list.length === 0 && /* @__PURE__ */ jsx("li", {
					className: "text-sm text-white/55",
					children: "Nothing out yet. Songs are on the create tab."
				}), list.map((track) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: () => onOpen(track.id),
					className: "w-full rounded-2xl bg-black/30 px-3 py-2 text-left",
					children: [/* @__PURE__ */ jsx("p", {
						className: "font-bold",
						children: track.title
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs text-white/55",
						children: filter === "certs" ? (certOf(track) ? `${certName(certOf(track).level)} · ${certOf(track).units} units` : `Not yet · ${fmt(track.streams)} plays · 150 plays = 1 unit`) : track.status === "out" ? `${fmt(track.streams)} plays · ${money(track.earned)} · ${gradeLabel(track.quality)}` : track.dropOn ? `Drops ${shortStamp(track.dropOn, year)} · ${weekdayLong(track.dropOn, year)}` : "Ready · pick a release date"
					})]
				}) }, track.id))]
			})
		]
	});
}
function PhoneApp({ title, onBack, children }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-3 pb-4",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ jsx("button", {
				type: "button",
				"aria-label": "Back",
				onClick: onBack,
				className: "grid h-10 w-10 place-items-center",
				children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-6 w-6" })
			}), /* @__PURE__ */ jsx("p", {
				className: "text-sm font-black tracking-wide",
				children: title
			})]
		}), children]
	});
}
function SkillScreen({ skills, energy, onTrain }) {
	return /* @__PURE__ */ jsxs("ul", {
		className: "flex flex-col gap-3",
		children: [SKILLS.map((skill) => {
			const cost = TRAIN_ENERGY[skill.key];
			return /* @__PURE__ */ jsxs("li", {
				className: "rounded-[1.4rem] bg-gradient-to-br from-fuchsia-500 via-violet-500 to-indigo-600 px-4 py-3",
				children: [/* @__PURE__ */ jsx("p", {
					className: "text-right text-xs font-black tracking-[0.16em]",
					children: skill.label.toUpperCase()
				}), /* @__PURE__ */ jsxs("div", {
					className: "mt-1 flex items-center gap-3",
					children: [/* @__PURE__ */ jsx("p", {
						className: "w-14 text-4xl font-black leading-none tabular-nums",
						children: skills[skill.key]
					}), /* @__PURE__ */ jsxs("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ jsx("div", {
							className: "h-2 overflow-hidden rounded-full bg-white/25",
							children: /* @__PURE__ */ jsx("div", {
								className: "h-full rounded-full bg-white/90",
								style: { width: `${Math.min(100, skills[skill.key])}%` }
							})
						}), /* @__PURE__ */ jsxs("button", {
							type: "button",
							disabled: energy < cost || skills[skill.key] >= 100,
							onClick: () => onTrain(skill.key),
							className: "mt-2 flex h-10 w-full items-center justify-center gap-1 rounded-xl bg-white text-sm font-black text-[#3a1468] disabled:opacity-40",
							children: skills[skill.key] >= 100 ? "MAX" : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Zap, {
								className: "h-4 w-4",
								fill: "currentColor"
							}), cost] })
						})]
					})]
				})]
			}, skill.key);
		}), /* @__PURE__ */ jsx("li", {
			className: "text-center text-[11px] text-white/45",
			children: "Energy only. No cash on a drill."
		})]
	});
}
function ShopScreen(props) {
	if (props.view === "character") {
		const uploaded = !!props.avatar;
		const index = Math.max(0, LOOKS.findIndex((item) => item.id === props.look));
		const current = LOOKS[index] ?? LOOKS[0];
		const prev = LOOKS[(index + LOOKS.length - 1) % LOOKS.length];
		const next = LOOKS[(index + 1) % LOOKS.length];
		return /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col gap-3 pb-4",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "relative",
					children: [
						/* @__PURE__ */ jsx("img", {
							src: uploaded ? props.avatar : current.src,
							alt: "",
							className: "mx-auto h-[46vh] w-full rounded-[1.6rem] object-cover object-[center_28%]"
						}),
						/* @__PURE__ */ jsx("button", {
							type: "button",
							"aria-label": "Previous look",
							onClick: () => props.onLook(prev.id),
							className: "absolute top-1/2 left-2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/50",
							children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-6 w-6" })
						}),
						/* @__PURE__ */ jsx("button", {
							type: "button",
							"aria-label": "Next look",
							onClick: () => props.onLook(next.id),
							className: "absolute top-1/2 right-2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/50",
							children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-6 w-6" })
						})
					]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "text-center",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-lg font-black",
						children: uploaded ? "Your picture" : current.name
					}), /* @__PURE__ */ jsx("p", {
						className: "text-xs text-white/60",
						children: uploaded ? "This face is on every app." : current.line
					})]
				}),
				/* @__PURE__ */ jsx("div", {
					className: "flex gap-2 overflow-x-auto pb-1",
					children: [...LOOKS.map((item) => /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => props.onLook(item.id),
						className: `w-16 shrink-0 overflow-hidden rounded-xl ${!uploaded && props.look === item.id ? "ring-2 ring-white" : ""}`,
						children: /* @__PURE__ */ jsx("img", {
							src: item.src,
							alt: "",
							className: "h-20 w-full object-cover object-[center_28%]"
						})
					}, item.id)), /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => {
							const input = document.createElement("input");
							input.type = "file";
							input.accept = "image/*";
							input.onchange = () => {
								const file = input.files && input.files[0];
								if (!file) return;
								shrinkPhoto(file).then((url) => {
									if (url) props.onPhoto(url);
								});
							};
							input.click();
						},
						className: `grid h-20 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/15 px-1 text-center text-[10px] font-black leading-tight ${uploaded ? "ring-2 ring-white" : ""}`,
						children: uploaded ? /* @__PURE__ */ jsx("img", {
							src: props.avatar,
							alt: "",
							className: "h-full w-full object-cover"
						}) : "Upload a picture"
					}, "upload")]
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => props.onDone(),
					className: "mx-auto rounded-full bg-white px-4 py-1.5 text-[12px] font-black text-black",
					children: "Save"
				}),
				/* @__PURE__ */ jsx(GearRow, {
					name: props.gear.wardrobe >= 2 ? "Clothes maxed" : SHOP.wardrobe[props.gear.wardrobe === 0 ? 0 : 1].name,
					cost: props.gear.wardrobe >= 2 ? "" : money(SHOP.wardrobe[props.gear.wardrobe === 0 ? 0 : 1].cost),
					disabled: props.gear.wardrobe >= 2,
					onClick: () => props.onBuy("wardrobe")
				}),
				/* @__PURE__ */ jsx(GearRow, {
					name: props.lifeLevel.jewelry >= 2 ? "Ice owned" : props.lifeLevel.jewelry === 0 ? "A chain" : "Ice",
					cost: props.lifeLevel.jewelry >= 2 ? "" : money(props.lifeLevel.jewelry === 0 ? 900 : 4200),
					disabled: props.lifeLevel.jewelry >= 2,
					onClick: () => props.onLife("jewelry")
				}),
				/* @__PURE__ */ jsx(GearRow, {
					name: "Ink",
					cost: props.lifeLevel.ink ? "Owned" : money(750),
					disabled: props.lifeLevel.ink > 0,
					onClick: () => props.onLife("ink")
				})
			]
		});
	}
	if (props.view === "equipment") return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => props.setView("menu"),
				className: "h-10 text-left text-sm font-black",
				children: "Back"
			}),
			/* @__PURE__ */ jsx(RackScreen, {
				rack: props.rack,
				cash: props.cash,
				onBuy: props.onRack
			}),
			/* @__PURE__ */ jsx(GearRow, {
				name: props.gear.mic >= 2 ? "Mic maxed" : SHOP.mic[props.gear.mic === 0 ? 0 : 1].name,
				cost: props.gear.mic >= 2 ? "" : money(SHOP.mic[props.gear.mic === 0 ? 0 : 1].cost),
				disabled: props.gear.mic >= 2,
				onClick: () => props.onBuy("mic")
			})
		]
	});
	if (props.view === "software") return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-2",
		children: [
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => props.setView("menu"),
				className: "h-10 text-left text-sm font-black",
				children: "Back"
			}),
			SOFTWARE.map((row) => /* @__PURE__ */ jsxs("button", {
				type: "button",
				disabled: props.software >= row.tier,
				onClick: () => props.onSoft(row.tier),
				className: "rounded-2xl bg-gradient-to-r from-emerald-300 to-emerald-500 px-4 py-3 text-left text-[#06210f] disabled:opacity-50",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "block text-sm font-black",
						children: row.name
					}),
					/* @__PURE__ */ jsx("span", {
						className: "block text-xs font-bold",
						children: props.software >= row.tier ? "Installed" : money(row.cost)
					}),
					/* @__PURE__ */ jsx("span", {
						className: "block text-[11px]",
						children: row.note
					})
				]
			}, row.tier)),
			/* @__PURE__ */ jsx(GearRow, {
				name: props.lifeLevel.distributor >= 2 ? "Distro maxed" : props.lifeLevel.distributor === 0 ? "Desk distro" : "Wide distro",
				cost: props.lifeLevel.distributor >= 2 ? "" : money(props.lifeLevel.distributor === 0 ? 1500 : 6e3),
				disabled: props.lifeLevel.distributor >= 2,
				onClick: () => props.onLife("distributor")
			})
		]
	});
	if (props.view === "estate") {
		const here = monthlyBills({ homeTier: props.homeTier });
		return /* @__PURE__ */ jsxs("div", {
			className: "flex flex-col gap-2",
			children: [
				/* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => props.setView("menu"),
					className: "h-10 text-left text-sm font-black",
					children: "Back"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-center text-sm font-black text-[#3dff8a]",
					children: money(props.cash)
				}),
				HOMES.map((home) => {
					const on = props.homeTier === home.tier;
					const owned = props.homeTier > home.tier;
					return /* @__PURE__ */ jsxs("button", {
						type: "button",
						disabled: on || owned,
						onClick: () => props.onHome(home.tier),
						className: "rounded-[1.4rem] bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-4 py-4 text-left disabled:opacity-70",
						children: [/* @__PURE__ */ jsx("span", {
							className: "block text-sm font-black tracking-wide",
							children: home.name.toUpperCase()
						}), /* @__PURE__ */ jsxs("span", {
							className: "mt-1 block text-xs font-bold",
							children: [
								money(home.month),
								"/month · Quality ",
								home.quality,
								on ? " · yours" : home.cost ? ` · ${money(home.cost)}` : ""
							]
						})]
					}, home.tier);
				}),
				/* @__PURE__ */ jsxs("p", {
					className: "text-xs text-white/55",
					children: [
						"Now: ",
						here.home,
						". Food is ",
						money(here.food),
						"/month. Both come out on rent night. First week is free on standard."
					]
				})
			]
		});
	}
	if (props.view === "vehicles") return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-2",
		children: [
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => props.setView("menu"),
				className: "h-10 text-left text-sm font-black",
				children: "Back"
			}),
			/* @__PURE__ */ jsx(GearRow, {
				name: "Coupe",
				cost: props.lifeLevel.car ? "Owned" : money(6500),
				disabled: props.lifeLevel.car > 0,
				onClick: () => props.onLife("car")
			}),
			/* @__PURE__ */ jsx("p", {
				className: "text-xs text-white/55",
				children: "A car adds a little to how the songs travel. Career cash only."
			})
		]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-3 pb-4",
		children: [
			/* @__PURE__ */ jsxs("p", {
				className: "text-center text-xs text-white/55",
				children: [
					"Career cash only. ",
					money(props.cash),
					". Nothing here is a real purchase."
				]
			}),
			[
				{
					id: "character",
					name: "CHARACTER",
					klass: "sim-pill-pink"
				},
				{
					id: "equipment",
					name: "EQUIPMENT",
					klass: "sim-pill-cyan"
				},
				{
					id: "software",
					name: "SOFTWARE",
					klass: "sim-pill-cyan"
				},
				{
					id: "estate",
					name: "REAL ESTATE",
					klass: "sim-pill-cyan"
				},
				{
					id: "vehicles",
					name: "VEHICLES",
					klass: "sim-pill-cyan"
				}
			].map((row) => /* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: () => props.setView(row.id),
				className: `sim-pill ${row.klass} justify-between px-4 text-[16px]`,
				children: [row.name, /* @__PURE__ */ jsx("span", {
					className: "grid h-9 w-12 place-items-center rounded-xl bg-white text-[#16306e]",
					children: /* @__PURE__ */ jsx(ChevronRight, { className: "h-5 w-5" })
				})]
			}, row.id)),
			/* @__PURE__ */ jsx(GearRow, {
				name: "Manager",
				cost: props.gear.manager ? "Hired" : money(SHOP.manager.cost),
				disabled: props.gear.manager,
				onClick: () => props.onBuy("manager")
			})
		]
	});
}
function RackScreen(props) {
	const score = rackScore(props.rack);
	const [info, setInfo] = useState(false);
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-2 pb-4",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-center gap-3",
				children: [/* @__PURE__ */ jsx("p", {
					className: "text-lg font-black text-[#3dff8a]",
					children: score.toFixed(1)
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					"aria-label": "How the room works",
					onClick: () => setInfo((on) => !on),
					className: "grid h-8 w-8 place-items-center rounded-full bg-white text-sm font-black text-black",
					children: "i"
				})]
			}),
			info && /* @__PURE__ */ jsx("p", {
				className: "rounded-2xl bg-black/40 px-3 py-2 text-xs leading-relaxed text-white/70",
				children: "Six pieces, level 0 to 8. A tap buys the next level. The price is the sticker times the level you are buying. 0.0 is a bare room. It only counts when a session uses your studio."
			}),
			RACK.map((piece) => {
				const level = props.rack?.[piece.id] ?? 0;
				const next = level >= 8 ? null : piece.base * (level + 1);
				const short = next != null && next > props.cash;
				return /* @__PURE__ */ jsxs("button", {
					type: "button",
					disabled: level >= 8,
					onClick: () => props.onBuy(piece.id),
					className: "flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-300 to-emerald-500 px-2 py-2 text-left text-[#06210f] disabled:opacity-60",
					children: [/* @__PURE__ */ jsxs("span", {
						className: "grid h-12 w-[4.4rem] shrink-0 place-items-center rounded-xl bg-white text-sm font-black",
						children: ["Lvl. ", level]
					}), /* @__PURE__ */ jsxs("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ jsx("span", {
							className: "block truncate text-sm font-black tracking-wide",
							children: piece.name
						}), /* @__PURE__ */ jsx("span", {
							className: "block text-[11px] font-bold opacity-70",
							children: next == null ? "Maxed" : short ? `${money(next)} · short` : money(next)
						})]
					})]
				}, piece.id);
			})
		]
	});
}
function GearRow({ name, cost, onClick, disabled }) {
	return /* @__PURE__ */ jsxs("button", {
		type: "button",
		disabled,
		onClick,
		className: "flex items-center justify-between rounded-2xl bg-white/8 px-4 py-3 text-left disabled:opacity-40",
		children: [/* @__PURE__ */ jsx("span", {
			className: "text-sm font-bold",
			children: name
		}), /* @__PURE__ */ jsx("span", {
			className: "text-xs font-bold text-emerald-300",
			children: cost
		})]
	});
}
function WalletScreen(props) {
	const bills = monthlyBills({ homeTier: props.career.homeTier ?? 0 });
	const until = nightsUntilRent(props.career);
	const wages = STAFF.reduce((sum, deal) => sum + (props.career.staff?.[deal.id] ? deal.wage : 0), 0);
	const singles = props.career.tracks.filter((track) => track.status === "out" && track.kind !== "album" && track.kind !== "video").length;
	const albums = props.career.tracks.filter((track) => track.status === "out" && track.kind === "album").length;
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-3 pb-2",
		children: [
			/* @__PURE__ */ jsx("p", {
				className: "text-center text-xs font-black tracking-[0.2em] text-white/45",
				children: "DIFFERENT"
			}),
			/* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: props.onShop,
				className: "sim-pill sim-pill-cyan text-[15px]",
				children: [/* @__PURE__ */ jsx(ShoppingBag, { className: "h-5 w-5" }), " GAME STORE"]
			}),
			/* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: props.onDistro,
				className: "sim-pill sim-pill-cyan text-[15px]",
				children: [/* @__PURE__ */ jsx(Share2, { className: "h-5 w-5" }), " DISTRIBUTOR"]
			}),
			/* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: props.onStudio,
				className: "sim-pill sim-pill-cyan text-[15px]",
				children: [/* @__PURE__ */ jsx(Mic, { className: "h-5 w-5" }), " STUDIO"]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ jsxs("button", {
					type: "button",
					onClick: props.onPitch,
					className: "sim-pill-violet rounded-[1.3rem] px-3 py-3 text-left",
					children: [
						/* @__PURE__ */ jsx("p", {
							className: "text-[11px] font-black tracking-wide text-white/70",
							children: "LABEL"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1 text-sm font-black leading-tight",
							children: props.career.label ? props.career.label.name : "LABEL IS ABSENT..."
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "mt-2 text-[11px] text-white/70",
							children: ["Term: ", props.career.label ? `${props.career.label.weeksLeft} weeks` : "—"]
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "mt-2 flex justify-between text-[11px] font-black",
							children: [
								/* @__PURE__ */ jsxs("span", { children: ["LP ", albums] }),
								/* @__PURE__ */ jsx("span", { children: "EP 0" }),
								/* @__PURE__ */ jsxs("span", { children: ["S ", singles] })
							]
						})
					]
				}), /* @__PURE__ */ jsxs("div", {
					className: "sim-pill-violet rounded-[1.3rem] px-3 py-3 text-left",
					children: [
						/* @__PURE__ */ jsx("p", {
							className: "text-[11px] font-black tracking-wide text-white/70",
							children: "COSTS"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-2 text-[11px] font-bold text-white/70",
							children: "FOOD"
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "text-sm font-black",
							children: [
								"−",
								money(bills.food),
								"/month"
							]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-2 text-[11px] font-bold text-white/70",
							children: "REAL ESTATE"
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "text-sm font-black",
							children: [
								"−",
								money(bills.rent),
								"/month"
							]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1 text-[10px] text-white/60",
							children: props.career.level !== "hardcore" && props.career.pace === "standard" && props.career.day <= 7 ? "First week is free." : until === 0 ? "Due tonight." : `Due in ${until} night${until === 1 ? "" : "s"}.`
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-2 text-[11px] font-bold text-white/70",
							children: "CREDIT"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "text-sm font-black",
							children: props.career.loan ? money(props.career.loan.owe) : "$0"
						}),
						wages > 0 && /* @__PURE__ */ jsxs("p", {
							className: "mt-2 text-[11px] text-white/70",
							children: [
								"Staff −",
								money(wages),
								" each morning"
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "grid grid-cols-2 gap-2",
				children: [
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: props.onWork,
						className: "sim-pill sim-pill-blue text-[14px]",
						children: "WORK"
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: props.onBusiness,
						className: "sim-pill sim-pill-blue text-[14px]",
						children: "BUSINESS"
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: props.onTour,
						className: "sim-pill sim-pill-pink text-[14px]",
						children: "START TOUR"
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: props.onBeats,
						className: "sim-pill sim-pill-blue text-[14px]",
						children: "BEATSTAR"
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: props.onMerch,
						className: "sim-pill sim-pill-pink text-[14px]",
						children: "MERCH"
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: props.onSchool,
						className: "sim-pill sim-pill-blue text-[14px]",
						children: props.career.school ? "CLASS" : "SCHOOL"
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: props.onStaff,
						className: "sim-pill sim-pill-pink text-[14px]",
						children: "STAFF"
					})
				]
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: props.onBorrow,
				className: "sim-pill sim-pill-night text-[14px]",
				children: props.career.loan ? `LOAN ${money(props.career.loan.owe)}` : "BORROW $100"
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: props.onLabel,
				className: "sim-pill sim-pill-gold text-[14px]",
				children: props.career.desk ? "YOUR LABEL" : "OPEN YOUR LABEL"
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: props.onFood,
				className: "sim-pill sim-pill-cyan text-[14px]",
				children: "FOOD"
			}),
			/* @__PURE__ */ jsxs("p", {
				className: "text-center text-[11px] text-white/50",
				children: [props.jobTitle ? `${props.jobTitle} is hired.` : "No job yet.", props.career.label ? "" : props.pitch.ok ? "" : ` · ${props.pitch.reason}`]
			})
		]
	});
}
var BIZ_PRODUCTS = [
	"Tees",
	"Studio hours",
	"Beat packs"
];
function BusinessScreen({ career, onOpen, onTune, onClose }) {
	const gate = businessGate(career);
	const shop = career.business;
	const [name, setName] = useState("The Shop");
	const [product, setProduct] = useState("Tees");
	const [sure, setSure] = useState(false);
	const wage = career.level === "hardcore" ? 26 : 18;
	if (!shop) return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ jsxs("p", {
				className: "text-sm leading-relaxed text-white/70",
				children: [
					"A small shop. It restocks itself every morning, pays wages, and only sells if people already know the music. Opening is ",
					money(gate.cost),
					"."
				]
			}),
			!gate.ok && /* @__PURE__ */ jsx("p", {
				className: "text-sm font-bold text-[#ffe14a]",
				children: gate.reason
			}),
			/* @__PURE__ */ jsx("input", {
				value: name,
				maxLength: 24,
				onChange: (event) => setName(event.target.value),
				"aria-label": "Shop name",
				className: "h-12 rounded-full bg-black/30 px-4 text-sm"
			}),
			/* @__PURE__ */ jsx("div", {
				className: "grid grid-cols-3 gap-2",
				children: BIZ_PRODUCTS.map((item) => /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => setProduct(item),
					className: `rounded-2xl px-2 py-3 text-center text-[12px] font-black ${product === item ? "bg-white text-black" : "bg-white/10"}`,
					children: item
				}, item))
			}),
			/* @__PURE__ */ jsxs("button", {
				type: "button",
				disabled: !gate.ok,
				onClick: () => onOpen(name, product),
				className: "sim-pill sim-pill-gold text-[14px] disabled:opacity-40",
				children: ["OPEN FOR ", money(gate.cost)]
			})
		]
	});
	const net = shop.lastIncome - shop.lastCost;
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ jsxs("div", {
				className: "rounded-2xl bg-white/8 px-4 py-3",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "text-sm font-black",
						children: shop.name
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "text-xs text-white/60",
						children: [
							shop.product,
							" · ",
							shop.stock,
							" on the shelf"
						]
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "mt-2 text-xs text-white/70",
						children: [
							"Last morning ",
							money(shop.lastIncome),
							" in, ",
							money(shop.lastCost),
							" out",
							shop.lastIncome + shop.lastCost > 0 ? ` · ${net >= 0 ? "cleared" : "lost"} ${money(Math.abs(net))}` : " · first morning still ahead"
						]
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between rounded-2xl bg-white/8 px-4 py-3",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
					className: "text-sm font-black",
					children: "Employees"
				}), /* @__PURE__ */ jsxs("p", {
					className: "text-[11px] text-white/55",
					children: [money(wage), " each, every morning"]
				})] }), /* @__PURE__ */ jsx(Stepper, {
					value: shop.employees,
					onDown: () => onTune({ employees: shop.employees - 1 }),
					onUp: () => onTune({ employees: shop.employees + 1 })
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex items-center justify-between rounded-2xl bg-white/8 px-4 py-3",
				children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
					className: "text-sm font-black",
					children: "Price"
				}), /* @__PURE__ */ jsx("p", {
					className: "text-[11px] text-white/55",
					children: "High prices sit on the shelf"
				})] }), /* @__PURE__ */ jsx(Stepper, {
					value: shop.price,
					money: true,
					onDown: () => onTune({ price: shop.price - 2 }),
					onUp: () => onTune({ price: shop.price + 2 })
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "rounded-2xl bg-white/8 px-4 py-3",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "text-sm font-black",
						children: "Marketing"
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "text-[11px] text-white/55",
						children: [money(12), " a level, every morning"]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "mt-2 grid grid-cols-3 gap-2",
						children: [
							"Off",
							"Some",
							"Loud"
						].map((label, index) => /* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: () => onTune({ marketing: index }),
							className: `rounded-xl py-2 text-[12px] font-black ${shop.marketing === index ? "bg-white text-black" : "bg-white/10"}`,
							children: label
						}, label))
					})
				]
			}),
			!sure ? /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setSure(true),
				className: "sim-pill sim-pill-red text-[14px]",
				children: "CLOSE THE SHOP"
			}) : /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: onClose,
				className: "sim-pill sim-pill-red text-[14px]",
				children: "SELL THE LEFTOVERS"
			})
		]
	});
}
function Stepper({ value, money: asMoney, onDown, onUp }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex items-center gap-2",
		children: [
			/* @__PURE__ */ jsx("button", {
				type: "button",
				"aria-label": "Less",
				onClick: onDown,
				className: "grid h-9 w-9 place-items-center rounded-full bg-white/15 text-lg font-black",
				children: "−"
			}),
			/* @__PURE__ */ jsx("span", {
				className: "w-12 text-center text-sm font-black",
				children: asMoney ? money(value) : value
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				"aria-label": "More",
				onClick: onUp,
				className: "grid h-9 w-9 place-items-center rounded-full bg-white/15 text-lg font-black",
				children: "+"
			})
		]
	});
}
function WorkScreen({ career, onStart, onStop }) {
	const hired = jobById(career.job?.id);
	const [path, setPath] = useState(hired?.path ?? "starter");
	const rows = JOBS.filter((job) => job.path === path && job.id !== hired?.id);
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-3 pb-4",
		children: [
			/* @__PURE__ */ jsx("p", {
				className: "text-xs leading-relaxed text-white/60",
				children: "One job. Pay starts the morning after you're hired, then every morning until you stop. Energy comes off the same bar."
			}),
			hired && career.job && /* @__PURE__ */ jsxs("article", {
				className: "rounded-2xl bg-white/10 px-4 py-3",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-baseline justify-between gap-2",
						children: [/* @__PURE__ */ jsx("h3", {
							className: "text-sm font-black",
							children: hired.title
						}), /* @__PURE__ */ jsx("span", {
							className: "text-[11px] font-black tracking-widest text-[#3dff8a]",
							children: "HIRED"
						})]
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "mt-2 text-xs text-white/70",
						children: [money(hired.weekly), "/week"]
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "text-xs text-white/70",
						children: [hired.energy, " energy/day"]
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "mt-1 text-[11px] text-white/45",
						children: [money(dailyWage(hired.weekly, career.level)), " each morning. Nothing the day you start."]
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: onStop,
						className: "mt-3 h-9 w-full rounded-full bg-white/15 text-xs font-black",
						children: "STOP"
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "flex gap-2 overflow-x-auto pb-1",
				children: JOB_PATHS.map((item) => /* @__PURE__ */ jsx("button", {
					type: "button",
					onClick: () => setPath(item.id),
					className: `shrink-0 rounded-full px-3 py-1 text-[11px] font-black ${path === item.id ? "bg-white text-black" : "bg-white/10"}`,
					children: item.label
				}, item.id))
			}),
			rows.map((job) => {
				const locked = jobLock(career, job);
				const busy = !!career.job;
				return /* @__PURE__ */ jsxs("article", {
					className: "rounded-2xl bg-white/8 px-4 py-3",
					children: [
						/* @__PURE__ */ jsx("h3", {
							className: "text-sm font-black",
							children: job.title
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "mt-1 text-xs text-white/70",
							children: [money(job.weekly), "/week"]
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "text-xs text-white/70",
							children: [job.energy, " energy/day"]
						}),
						/* @__PURE__ */ jsx("p", {
							className: `mt-1 text-[11px] font-bold ${locked ? "text-white/45" : "text-[#3dff8a]"}`,
							children: locked ? `LOCKED · ${locked}` : busy ? "Quit the job you have first" : "Open"
						}),
						/* @__PURE__ */ jsx("button", {
							type: "button",
							disabled: !!locked || busy,
							onClick: () => onStart(job.id),
							className: "mt-3 h-9 w-full rounded-full bg-white/15 text-xs font-black disabled:opacity-40",
							children: "START"
						})
					]
				}, job.id);
			})
		]
	});
}
function FoodScreen({ cash, energy, max, onEat }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-2",
		children: [/* @__PURE__ */ jsxs("p", {
			className: "text-xs text-white/50",
			children: [
				"Energy ",
				energy,
				"/",
				max,
				" · ",
				money(cash)
			]
		}), [
			{
				tier: "street",
				name: "Street plate",
				cost: 28,
				gain: "+18 energy"
			},
			{
				tier: "diner",
				name: "Diner",
				cost: 90,
				gain: "+36 energy"
			},
			{
				tier: "table",
				name: "A real table",
				cost: 240,
				gain: "Fills you up"
			}
		].map((row) => /* @__PURE__ */ jsxs("button", {
			type: "button",
			disabled: cash < row.cost || energy >= max,
			onClick: () => onEat(row.tier),
			className: "flex items-center justify-between rounded-2xl bg-white/8 px-4 py-3 text-left disabled:opacity-40",
			children: [/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("span", {
				className: "block text-sm font-black",
				children: row.name
			}), /* @__PURE__ */ jsx("span", {
				className: "text-xs text-white/60",
				children: row.gain
			})] }), /* @__PURE__ */ jsx("span", {
				className: "font-bold text-emerald-300",
				children: money(row.cost)
			})]
		}, row.tier))]
	});
}
function MailList({ items, empty, onAnswer }) {
	if (items.length === 0) return /* @__PURE__ */ jsx("p", {
		className: "text-sm text-white/60",
		children: empty
	});
	return /* @__PURE__ */ jsx("ul", {
		className: "flex flex-col gap-3",
		children: items.map((mail) => mail.kind === "label" && mail.offer ? /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(ContractPaper, {
			mail,
			onAnswer
		}) }, mail.id) : /* @__PURE__ */ jsxs("li", {
			className: "rounded-2xl bg-[#2f78ff] p-4",
			children: [
				/* @__PURE__ */ jsx("p", {
					className: "text-sm font-black",
					children: mail.title
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-1 text-xs leading-relaxed text-white/80",
					children: mail.body
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "mt-3 flex gap-2",
					children: [/* @__PURE__ */ jsx("button", {
						type: "button",
						"aria-label": "Pass",
						onClick: () => onAnswer(mail.id, false),
						className: "grid h-11 w-12 place-items-center rounded-xl bg-[#1a1d27] text-white",
						children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" })
					}), /* @__PURE__ */ jsx("button", {
						type: "button",
						"aria-label": "Accept",
						onClick: () => onAnswer(mail.id, true),
						className: "grid h-11 flex-1 place-items-center rounded-xl bg-[#22c55e]",
						children: /* @__PURE__ */ jsx(Check, { className: "h-6 w-6" })
					})]
				})
			]
		}, mail.id))
	});
}
function ContractPaper({ mail, onAnswer }) {
	const offer = mail.offer;
	const fine = 500 + offer.due * 400;
	const cut = Math.round(offer.cut * 100);
	return /* @__PURE__ */ jsxs("article", {
		className: "rounded-2xl bg-[#f4f1ea] p-4 text-[#1a1c1f]",
		children: [
			/* @__PURE__ */ jsx("h3", {
				className: "text-xl font-black",
				children: offer.name
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-2 text-base font-black",
				children: "Agreement"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-1 text-sm",
				children: "You have to release:"
			}),
			/* @__PURE__ */ jsx("ul", {
				className: "mt-1 list-disc pl-5 text-sm",
				children: /* @__PURE__ */ jsxs("li", { children: [offer.due, "x Singles"] })
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-3 text-base font-black",
				children: "Deadline"
			}),
			/* @__PURE__ */ jsxs("p", {
				className: "text-sm",
				children: [offer.weeks, " weeks"]
			}),
			/* @__PURE__ */ jsxs("p", {
				className: "mt-1 text-sm font-bold text-red-600",
				children: ["If late, fine: ", money(fine)]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-3 text-base font-black",
				children: "Label income"
			}),
			/* @__PURE__ */ jsx("ul", {
				className: "mt-1 list-disc pl-5 text-sm",
				children: /* @__PURE__ */ jsxs("li", { children: [cut, "% of profits (Streams)"] })
			}),
			/* @__PURE__ */ jsx("p", {
				className: "mt-3 text-base font-black",
				children: "During the contract:"
			}),
			/* @__PURE__ */ jsxs("ul", {
				className: "mt-1 list-disc pl-5 text-sm",
				children: [
					/* @__PURE__ */ jsxs("li", { children: ["Advance payment: ", /* @__PURE__ */ jsxs("span", {
						className: "font-bold text-emerald-600",
						children: ["+", money(offer.advance)]
					})] }),
					/* @__PURE__ */ jsx("li", { children: "Their push on every record" }),
					/* @__PURE__ */ jsx("li", { children: "Promo while the deal is live" })
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "mt-4 flex gap-2",
				children: [/* @__PURE__ */ jsx("button", {
					type: "button",
					"aria-label": "Pass",
					onClick: () => onAnswer(mail.id, false),
					className: "grid h-12 w-14 place-items-center rounded-xl bg-[#1c1e27] text-white",
					children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5" })
				}), /* @__PURE__ */ jsx("button", {
					type: "button",
					"aria-label": "Sign",
					onClick: () => onAnswer(mail.id, true),
					className: "grid h-12 flex-1 place-items-center rounded-xl bg-[#22c55e] text-white",
					children: /* @__PURE__ */ jsx(Check, { className: "h-7 w-7" })
				})]
			})
		]
	});
}
function ChartScreen({ rows, albums, city, npc, you, youName, no1s, bestRun }) {
	const [tab, setTab] = useState("hot");
	const yours = rows.filter((row) => row.you);
	const ranked = [...(npc ?? []).map((artist) => ({
		name: artist.name,
		title: artist.title,
		score: artist.score,
		you: false,
		weeks: artist.weeksOn,
		peak: artist.peak
	})), ...you ? [{
		name: youName,
		title: you.title,
		score: you.score + 14,
		you: true,
		weeks: you.weeks,
		peak: 99
	}] : []].sort((a, b) => b.score - a.score);
	const local = ranked.slice(0, 10).map((row, i) => {
		const rank = i + 1;
		const national = rows.find((item) => item.name === row.name && item.title === row.title);
		const last = national && national.move != null ? national.rank + national.move : null;
		return {
			rank,
			name: row.name,
			title: row.title,
			score: row.score,
			you: row.you,
			move: last == null ? null : last - rank,
			weeks: row.weeks,
			peak: Math.min(row.peak || rank, rank)
		};
	});
	const history = [...rows].sort((a, b) => a.peak - b.peak || b.weeks - a.weeks);
	const top = tab === "local" ? local[0] : tab === "history" ? history[0] : tab === "albums" ? albums[0] : rows[0];
	const list = tab === "local" ? local : tab === "history" ? history : tab === "albums" ? albums : rows;
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "mb-3 rounded-2xl bg-black/35 px-3 py-2",
			children: [/* @__PURE__ */ jsx("p", {
				className: "text-[10px] font-black tracking-[0.16em] text-white/45",
				children: "HOT NEWS"
			}), /* @__PURE__ */ jsx("p", {
				className: "mt-1 text-sm leading-snug",
				children: yours.length ? `${yours[0].title} is at #${yours[0].rank}. Peak ${yours[0].peak}. ${yours[0].weeks} week${yours[0].weeks === 1 ? "" : "s"} on the board. ${no1s} No. 1${no1s === 1 ? "" : "s"}. Longest run ${bestRun}.` : rows[0] ? `${rows[0].title} by ${rows[0].name} is leading. Nothing of yours is on it. ${rows.length} songs had plays. The list is not padded.` : "The board is empty until Friday morning."
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "mb-3 grid grid-cols-3 text-center text-xs font-bold text-white/45",
			children: [
				/* @__PURE__ */ jsx("button", {
					type: "button",
					className: tab === "hot" ? "text-white" : "",
					onClick: () => setTab("hot"),
					children: "Hot 100"
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					className: tab === "local" ? "text-white" : "",
					onClick: () => setTab("local"),
					children: city
				}),
				/* @__PURE__ */ jsx("button", {
					type: "button",
					className: tab === "history" ? "text-white" : "",
					onClick: () => setTab("history"),
					children: "History"
				})
			]
		}),
		top && /* @__PURE__ */ jsxs("div", {
			className: "pb-3",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "mt-1 flex items-center gap-3",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "w-8 text-3xl font-black",
						children: top.rank
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ jsx("p", {
							className: "truncate font-black",
							children: top.title
						}), /* @__PURE__ */ jsx("p", {
							className: "truncate text-xs text-white/55",
							children: top.you ? youName : top.name
						})]
					}),
					/* @__PURE__ */ jsx("span", {
						className: "h-14 w-14 shrink-0 rounded-md",
						style: { background: cover(top.title) }
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "mt-3 grid grid-cols-3 border-y border-white/10 py-2 text-center",
				children: [
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
						className: "text-[9px] font-bold tracking-wide text-white/45",
						children: "LAST WEEK"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-sm font-black",
						children: top.move == null ? "—" : top.rank + top.move
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
						className: "text-[9px] font-bold tracking-wide text-white/45",
						children: "WKS AT NO.1"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-sm font-black",
						children: top.peak === 1 ? top.weeks : 0
					})] }),
					/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
						className: "text-[9px] font-bold tracking-wide text-white/45",
						children: "WKS ON CHART"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-sm font-black",
						children: top.weeks
					})] })
				]
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "grid grid-cols-[52px_1fr_36px_36px_28px] items-center bg-[#2f78ff] px-2 py-1.5 text-[9px] font-black tracking-wide",
			children: [
				/* @__PURE__ */ jsx("span", { children: "THIS WEEK" }),
				/* @__PURE__ */ jsx("span", {}),
				/* @__PURE__ */ jsx("span", {
					className: "text-center",
					children: "LAST"
				}),
				/* @__PURE__ */ jsx("span", {
					className: "text-center",
					children: "PEAK"
				}),
				/* @__PURE__ */ jsx("span", {
					className: "text-center",
					children: "WKS"
				})
			]
		}),
		/* @__PURE__ */ jsxs("ul", { children: [list.length === 0 && /* @__PURE__ */ jsx("li", {
			className: "py-6 text-center text-sm text-white/50",
			children: "Nothing on the board."
		}), list.map((row) => {
			const up = (row.move ?? 0) > 0;
			const down = (row.move ?? 0) < 0;
			return /* @__PURE__ */ jsxs("li", {
				className: `grid grid-cols-[52px_1fr_36px_36px_28px] items-center gap-1 border-b border-white/10 py-2 ${row.you ? "text-[#ffe14a]" : ""}`,
				children: [
					/* @__PURE__ */ jsxs("span", {
						className: "flex items-center gap-1 pl-1",
						children: [/* @__PURE__ */ jsx("span", {
							className: "w-4 text-sm font-black",
							children: row.rank
						}), /* @__PURE__ */ jsx("span", {
							className: `text-[10px] ${up ? "text-emerald-400" : down ? "text-red-400" : "text-white/30"}`,
							children: row.move == null ? "•" : up ? "↑" : down ? "↓" : "–"
						})]
					}),
					/* @__PURE__ */ jsxs("span", {
						className: "flex min-w-0 items-center gap-2",
						children: [/* @__PURE__ */ jsx("span", {
							className: "h-9 w-9 shrink-0 rounded-sm",
							style: { background: cover(row.title) }
						}), /* @__PURE__ */ jsxs("span", {
							className: "min-w-0",
							children: [/* @__PURE__ */ jsx("span", {
								className: "block truncate text-[13px] font-bold",
								children: row.title
							}), /* @__PURE__ */ jsx("span", {
								className: "block truncate text-[10px] text-white/50",
								children: row.you ? youName : row.name
							})]
						})]
					}),
					/* @__PURE__ */ jsx("span", {
						className: "text-center text-[11px]",
						children: row.move == null ? "—" : row.rank + row.move
					}),
					/* @__PURE__ */ jsx("span", {
						className: "text-center text-[11px]",
						children: row.peak === 1 ? /* @__PURE__ */ jsx(Star, { className: "mx-auto h-3.5 w-3.5 fill-[#ffe14a] text-[#ffe14a]" }) : row.peak
					}),
					/* @__PURE__ */ jsx("span", {
						className: "text-center text-[11px]",
						children: row.weeks
					})
				]
			}, `${row.rank}-${row.name}-${row.title}`);
		})] }),
		/* @__PURE__ */ jsx("p", {
			className: "mt-3 text-xs text-white/55",
			children: `${rows.length} songs on the Hot 100 list. ${albums.length} albums. Not padded. ${city} does not add a hometown bump. 150 plays = 1 certification unit.`
		})
	] });
}
function cover(name) {
	let h = 0;
	for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
	return `hsl(${h} 50% 42%)`;
}
function Events(props) {
	const songsOk = props.tourBooked || props.quote.songs >= props.quote.need;
	const ready = (props.tourBooked || props.stage !== "Bedroom") && songsOk && props.energy >= props.quote.energy && props.cash >= props.quote.cost;
	const detail = !songsOk ? `${props.quote.songs}/${props.quote.need} songs out` : !props.tourBooked && props.stage === "Bedroom" ? "Opens at Local" : props.energy < props.quote.energy ? "Need 22 energy" : props.cash < props.quote.cost ? `Need ${money(props.quote.cost)} to move` : `${props.tourBooked ? "Booked · " : ""}${props.quote.stops} cities · spend ${money(props.quote.cost)} · 22 energy`;
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-2",
		children: [
			/* @__PURE__ */ jsx(Action, {
				label: "Play the room",
				detail: props.show.ok ? `${props.show.detail} · ${COSTS.show} energy` : props.show.reason,
				disabled: !props.show.ok,
				onClick: props.onShow
			}),
			/* @__PURE__ */ jsx(Action, {
				label: "Tour",
				detail,
				disabled: !ready,
				onClick: props.onTour
			}),
			/* @__PURE__ */ jsx(MailList, {
				items: props.events,
				empty: "No invites this morning.",
				onAnswer: props.onAnswer
			})
		]
	});
}
function Artists({ npc, relations, desk, deskOpen, band, bandOpen, onSign, onMate }) {
	return /* @__PURE__ */ jsx("ul", {
		className: "flex flex-col gap-2",
		children: npc.map((artist) => {
			const mood = relations[artist.name] ?? artist.mood;
			const word = mood >= 3 ? "Friend" : mood >= 2 ? "Warm" : mood <= -2 ? "Rival" : mood <= -1 ? "Cold" : "Neutral";
			const signed = desk.includes(artist.name);
			const inBand = band.includes(artist.name);
			const warm = (relations[artist.name] ?? 0) >= 1;
			return /* @__PURE__ */ jsxs("li", {
				className: "rounded-2xl bg-white/8 px-4 py-3",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("span", {
							className: "block text-sm font-bold",
							children: artist.name
						}), /* @__PURE__ */ jsxs("span", {
							className: "text-xs text-white/50",
							children: [artist.title, artist.fee > 0 ? ` · verse ${money(artist.fee)}` : ""]
						})] }), /* @__PURE__ */ jsx("span", {
							className: "text-xs font-black",
							children: word
						})]
					}),
					deskOpen && !signed && warm && /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => onSign(artist.name),
						className: "mt-2 h-8 rounded-full bg-white/15 px-3 text-xs font-bold",
						children: "Sign to your label"
					}),
					bandOpen && !inBand && warm && /* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => onMate(artist.name),
						className: "mt-2 h-8 rounded-full bg-white/15 px-3 text-xs font-bold",
						children: "Ask into the band"
					}),
					signed && /* @__PURE__ */ jsx("p", {
						className: "mt-1 text-[11px] text-emerald-300",
						children: "On your desk. $80 a morning, a cut of their heat."
					}),
					inBand && /* @__PURE__ */ jsx("p", {
						className: "mt-1 text-[11px] text-emerald-300",
						children: "In the band."
					})
				]
			}, artist.name);
		})
	});
}
function Analysis({ career }) {
	const look = LOOKS.find((l) => l.id === career.look);
	const live = career.tracks.filter((t) => t.status === "out").sort((a, b) => b.streams - a.streams);
	const heard = audience(career);
	const night = live.reduce((sum, track) => sum + track.lastNight, 0);
	const books = career.books ?? {
		gross: 0,
		expenses: 0,
		tourEarned: 0,
		tourSpent: 0
	};
	const profit = books.gross - books.expenses;
	const stage = tierOf(career.fame).current.name;
	return /* @__PURE__ */ jsxs("div", { children: [
		/* @__PURE__ */ jsx("img", {
			src: look?.src,
			alt: "",
			className: "mx-auto h-28 w-28 rounded-full object-cover object-[center_22%] shadow-[0_0_0_8px_#c026d3]"
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "mt-4 flex items-end justify-between gap-3",
			children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("h2", {
				className: "text-2xl font-black",
				children: career.nick || "You"
			}), /* @__PURE__ */ jsx("p", {
				className: "text-sm text-white/60",
				children: heard.label === "listeners" ? `${fmt(heard.n)} listeners · ${fmt(career.fans)} followers · ${stage}` : `${fmt(heard.n)} followers · ${stage}`
			})] }), career.bestRank != null && career.bestRank <= 50 && /* @__PURE__ */ jsxs("span", {
				className: "rounded-full bg-violet-600 px-3 py-1 text-xs font-black",
				children: ["Top ", career.bestRank <= 10 ? 10 : 50]
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "mt-4 grid grid-cols-3 gap-2 text-center",
			children: [
				/* @__PURE__ */ jsxs("div", {
					className: "rounded-2xl bg-white/10 py-2",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-[10px] text-white/50",
						children: "Money in"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-sm font-black",
						children: money(books.gross)
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "rounded-2xl bg-white/10 py-2",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-[10px] text-white/50",
						children: "Costs"
					}), /* @__PURE__ */ jsx("p", {
						className: "text-sm font-black",
						children: money(books.expenses)
					})]
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "rounded-2xl bg-white/10 py-2",
					children: [/* @__PURE__ */ jsx("p", {
						className: "text-[10px] text-white/50",
						children: "Profit"
					}), /* @__PURE__ */ jsx("p", {
						className: `text-sm font-black ${profit >= 0 ? "text-emerald-300" : "text-red-300"}`,
						children: money(profit)
					})]
				})
			]
		}),
		night > 0 && /* @__PURE__ */ jsx("ul", {
			className: "mt-3 flex flex-col gap-1 text-xs text-white/70",
			children: PLATFORMS.map((platform) => {
				const logged = career.platforms?.[platform.id] ?? 0;
				const n = (career.platforms?.wire ?? 0) + (career.platforms?.nightbus ?? 0) + (career.platforms?.room ?? 0) > 0 ? logged : Math.round(night * platform.share);
				return /* @__PURE__ */ jsxs("li", {
					className: "flex justify-between",
					children: [/* @__PURE__ */ jsx("span", { children: platform.name }), /* @__PURE__ */ jsxs("span", { children: [fmt(n), " last night"] })]
				}, platform.id);
			})
		}),
		books.tourEarned > 0 && /* @__PURE__ */ jsxs("p", {
			className: "mt-2 text-xs text-white/60",
			children: [
				"Tours took ",
				money(books.tourSpent),
				" and the doors paid ",
				money(books.tourEarned),
				"."
			]
		}),
		/* @__PURE__ */ jsx("h3", {
			className: "mt-5 text-lg font-black",
			children: "Popular"
		}),
		/* @__PURE__ */ jsxs("ul", {
			className: "mt-2",
			children: [live.length === 0 && /* @__PURE__ */ jsx("li", {
				className: "py-3 text-sm text-white/50",
				children: "Nothing out yet."
			}), live.map((track, i) => /* @__PURE__ */ jsxs("li", {
				className: "flex items-center gap-3 border-b border-white/10 py-2",
				children: [
					/* @__PURE__ */ jsx("span", {
						className: "w-4 text-sm text-white/50",
						children: i + 1
					}),
					/* @__PURE__ */ jsx("span", {
						className: "h-10 w-10 shrink-0 rounded-md",
						style: { background: cover(track.title) }
					}),
					/* @__PURE__ */ jsxs("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "block truncate text-sm font-bold",
							children: [track.title, track.feat ? ` (ft. ${track.feat})` : ""]
						}), /* @__PURE__ */ jsxs("span", {
							className: "block text-xs text-white/50",
							children: [
								fmt(track.streams),
								" plays · ",
								money(track.earned)
							]
						})]
					})
				]
			}, track.title))]
		})
	] });
}
function SchoolScreen({ career, onEnroll, onAttend, onStudy, onLeave }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-3 pb-4",
		children: [
			/* @__PURE__ */ jsxs("p", {
				className: "text-xs leading-relaxed text-white/60",
				children: [
					"You have ",
					money(career.cash),
					". Skill classes are short and paid up front. A degree takes years of weekday mornings, tuition each year, and energy off the same bar. Work stays on its own button."
				]
			}),
			/* @__PURE__ */ jsx("p", {
				className: "text-[11px] font-black tracking-widest text-white/45",
				children: "DEGREES"
			}),
			DEGREES.map((spec) => {
				const active = career.degree?.id === spec.id;
				const done = career.degrees?.[spec.id] === true;
				const locked = degreeLock(career, spec);
				const left = active && career.degree ? 260 - career.degree.attended : 260;
				return /* @__PURE__ */ jsxs("article", {
					className: "rounded-2xl bg-white/8 px-4 py-3",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-baseline justify-between gap-2",
							children: [/* @__PURE__ */ jsx("h3", {
								className: "text-sm font-black",
								children: spec.name
							}), /* @__PURE__ */ jsx("span", {
								className: "text-[11px] font-bold text-white/50",
								children: done ? "DONE" : active ? `Year ${career.degree?.year} of ${spec.years}` : locked ? "LOCKED" : "Open"
							})]
						}),
						/* @__PURE__ */ jsxs("ul", {
							className: "mt-2 space-y-1 text-xs text-white/70",
							children: [
								/* @__PURE__ */ jsxs("li", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ jsx("span", { children: "Tuition" }), /* @__PURE__ */ jsxs("span", { children: [money(spec.tuition), "/year"] })]
								}),
								/* @__PURE__ */ jsxs("li", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ jsx("span", { children: "Energy" }), /* @__PURE__ */ jsx("span", { children: spec.energyLabel })]
								}),
								/* @__PURE__ */ jsxs("li", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ jsx("span", { children: "Duration" }), /* @__PURE__ */ jsxs("span", { children: [
										spec.years,
										" year",
										spec.years === 1 ? "" : "s"
									] })]
								})
							]
						}),
						active && /* @__PURE__ */ jsxs("p", {
							className: "mt-2 text-[11px] text-white/50",
							children: [
								left,
								" weekday",
								left === 1 ? "" : "s",
								" left this year. Weekends don't count."
							]
						}),
						locked && !done && !active && /* @__PURE__ */ jsx("p", {
							className: "mt-2 text-[11px] text-white/45",
							children: locked
						}),
						done ? null : active ? /* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: onLeave,
							className: "mt-3 h-9 w-full rounded-full bg-white/15 text-xs font-black",
							children: "LEAVE"
						}) : /* @__PURE__ */ jsx("button", {
							type: "button",
							disabled: !!locked,
							onClick: () => onStudy(spec.id),
							className: "mt-3 h-9 w-full rounded-full bg-white/15 text-xs font-black disabled:opacity-40",
							children: "ENROLL"
						})
					]
				}, spec.id);
			}),
			/* @__PURE__ */ jsx("p", {
				className: "pt-2 text-[11px] font-black tracking-widest text-white/45",
				children: "SKILL CLASSES"
			}),
			CLASSES.map((course) => {
				const active = career.school?.skill === course.skill && career.school.left > 0;
				const maxed = (career.skills?.[course.skill] ?? 0) >= 100;
				return /* @__PURE__ */ jsxs("article", {
					className: "rounded-2xl bg-white/8 px-4 py-3",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "flex items-baseline justify-between gap-2",
							children: [/* @__PURE__ */ jsx("h3", {
								className: "text-sm font-black",
								children: course.name
							}), /* @__PURE__ */ jsx("span", {
								className: "text-[11px] font-bold text-white/50",
								children: active ? `${career.school?.left} left` : "Open"
							})]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1 text-xs text-white/60",
							children: course.note
						}),
						/* @__PURE__ */ jsxs("ul", {
							className: "mt-2 space-y-1 text-xs",
							children: [/* @__PURE__ */ jsxs("li", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ jsx("span", { children: "Up front" }), /* @__PURE__ */ jsx("span", { children: money(course.tuition) })]
							}), /* @__PURE__ */ jsxs("li", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ jsx("span", { children: "Sessions" }), /* @__PURE__ */ jsxs("span", { children: [course.sessions, " · 10 energy · +3"] })]
							})]
						}),
						active ? /* @__PURE__ */ jsx("button", {
							type: "button",
							onClick: onAttend,
							className: "mt-3 h-9 w-full rounded-full bg-white/15 text-xs font-black",
							children: maxed ? "Already 100" : "Go to class"
						}) : /* @__PURE__ */ jsx("button", {
							type: "button",
							disabled: maxed,
							onClick: () => onEnroll(course.skill),
							className: "mt-3 h-9 w-full rounded-full bg-white/15 text-xs font-black disabled:opacity-40",
							children: maxed ? "Already 100" : "Enroll"
						})
					]
				}, course.skill);
			})
		]
	});
}
function StaffScreen({ career, onToggle }) {
	const stage = tierOf(career.fame).current.name;
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-3",
		children: [/* @__PURE__ */ jsxs("p", {
			className: "text-xs text-white/60",
			children: [stage, ". A wage leaves every morning, including mornings you do nothing. Let them go and it stops."]
		}), STAFF.map((deal) => {
			const on = career.staff?.[deal.id] === true;
			const open = career.fame >= deal.fame;
			return /* @__PURE__ */ jsxs("article", {
				className: "rounded-2xl bg-white/8 px-4 py-3",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-baseline justify-between gap-2",
						children: [/* @__PURE__ */ jsx("h3", {
							className: "text-sm font-black",
							children: deal.name
						}), /* @__PURE__ */ jsx("span", {
							className: "text-[11px] font-bold text-white/50",
							children: on ? "On payroll" : open ? "Open" : tierOf(deal.fame).current.name
						})]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-1 text-xs text-white/60",
						children: deal.note
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "mt-2 text-xs",
						children: ["Every morning ", money(deal.wage)]
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => onToggle(deal.id, !on),
						className: "mt-3 h-9 w-full rounded-full bg-white/15 text-xs font-black",
						children: on ? "Let them go" : "Hire"
					})
				]
			}, deal.id);
		})]
	});
}
function MerchScreen({ career, onToggle }) {
	const stage = tierOf(career.fame).current.name;
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-3",
		children: [/* @__PURE__ */ jsxs("p", {
			className: "text-xs text-white/60",
			children: [
				fmt(career.fans),
				" followers · ",
				stage,
				". The daily cost leaves every morning. Sales only show up if people already follow you. Turn it off if it's losing."
			]
		}), MERCH.map((item) => {
			const row = career.merch?.[item.id] ?? {
				on: false,
				spent: 0,
				earned: 0
			};
			const guess = Math.round(career.fans * item.perFan);
			const net = guess - item.daily;
			return /* @__PURE__ */ jsxs("article", {
				className: "rounded-2xl bg-white/8 px-4 py-3",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-baseline justify-between gap-2",
						children: [/* @__PURE__ */ jsx("h3", {
							className: "text-sm font-black",
							children: item.name
						}), /* @__PURE__ */ jsx("span", {
							className: "text-[11px] font-bold text-white/50",
							children: row.on ? "On" : "Off"
						})]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-1 text-xs text-white/60",
						children: item.note
					}),
					/* @__PURE__ */ jsxs("ul", {
						className: "mt-2 space-y-1 text-xs",
						children: [
							/* @__PURE__ */ jsxs("li", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ jsx("span", { children: "Up front" }), /* @__PURE__ */ jsx("span", { children: money(item.upfront) })]
							}),
							/* @__PURE__ */ jsxs("li", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ jsx("span", { children: "Every morning" }), /* @__PURE__ */ jsx("span", { children: money(item.daily) })]
							}),
							/* @__PURE__ */ jsxs("li", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ jsx("span", { children: "Sales at your followers" }), /* @__PURE__ */ jsx("span", { children: money(guess) })]
							}),
							/* @__PURE__ */ jsxs("li", {
								className: `flex justify-between font-bold ${net >= 0 ? "text-emerald-300" : "text-red-300"}`,
								children: [/* @__PURE__ */ jsx("span", { children: "Looks like" }), /* @__PURE__ */ jsxs("span", { children: [
									net >= 0 ? "profit" : "loss",
									" ",
									money(Math.abs(net))
								] })]
							}),
							(row.spent > 0 || row.earned > 0) && /* @__PURE__ */ jsxs("li", {
								className: "flex justify-between text-white/70",
								children: [/* @__PURE__ */ jsx("span", { children: "So far" }), /* @__PURE__ */ jsxs("span", { children: [
									"in ",
									money(row.earned),
									" · out ",
									money(row.spent)
								] })]
							})
						]
					}),
					/* @__PURE__ */ jsx("button", {
						type: "button",
						onClick: () => onToggle(item.id, !row.on),
						className: "mt-3 h-9 w-full rounded-full bg-white/15 text-xs font-black",
						children: row.on ? "Stop this contract" : "Start this contract"
					})
				]
			}, item.id);
		})]
	});
}
function BioCard({ city, nick, fullName, age, level, pace, cash, fans, label, sheet, onClose }) {
	const rows = [
		["POPULARITY", String(sheet.popularity)],
		["DISCOGRAPHY", `${sheet.albums} albums · ${sheet.songs} songs · ${sheet.feats} feats`],
		["BANK BALANCE", money(cash)],
		["NET WORTH", money(sheet.net)],
		["GENRE", sheet.genre],
		["FANS", fmt(fans)],
		["MONTHLY LISTENERS", fmt(sheet.monthly)],
		["RECORD LABEL", label ? label.name : "None"],
		["RECORD DEAL", label ? `${Math.round(label.cut * 100)}% · ${label.due} singles · ${label.weeksLeft} weeks` : "None"],
		["SONGWRITING ROYALTY", `${sheet.royalty}%`]
	];
	return /* @__PURE__ */ jsx("div", {
		className: "absolute inset-0 z-30 overflow-y-auto bg-black/55 px-4 py-8",
		onClick: onClose,
		children: /* @__PURE__ */ jsxs("article", {
			className: "sim-bio-card rounded-[1.6rem] px-4 py-2 text-white",
			onClick: (event) => event.stopPropagation(),
			children: [
				/* @__PURE__ */ jsx("p", {
					className: "pt-3 text-center text-2xl font-black",
					children: fullName || nick
				}),
				/* @__PURE__ */ jsxs("p", {
					className: "pb-2 text-center text-xs font-bold text-white/80",
					children: [
						nick,
						" · ",
						age,
						" · ",
						city,
						" · ",
						level === "hardcore" ? "Hardcore" : pace === "relentless" ? "Relentless" : "Standard"
					]
				}),
				rows.map(([k, v], i) => /* @__PURE__ */ jsxs("div", {
					className: `flex items-center justify-between gap-3 py-3 ${i < rows.length - 1 ? "border-b border-white/50" : ""}`,
					children: [/* @__PURE__ */ jsx("span", {
						className: "text-[13px] font-black tracking-wide",
						children: k
					}), /* @__PURE__ */ jsx("span", {
						className: "text-right text-[14px] font-bold",
						children: v
					})]
				}, k))
			]
		})
	});
}
function SettingsScreen({ city, pace, nick, creator, onHelp, onReset, onCreator, onNick }) {
	const [sure, setSure] = useState(false);
	const [draft, setDraft] = useState(nick);
	const [editing, setEditing] = useState(false);
	const [sound, setSound] = useState(true);
	useEffect(() => {
		try {
			setSound(localStorage.getItem("daniel-sound") !== "off");
		} catch {}
	}, []);
	function toggleSound() {
		const next = !sound;
		setSound(next);
		setMuted(!next);
		try {
			localStorage.setItem("daniel-sound", next ? "on" : "off");
		} catch {}
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col gap-3 pb-4",
		children: [
			/* @__PURE__ */ jsxs("p", {
				className: "text-center text-xs text-white/55",
				children: [
					city,
					" · ",
					pace === "relentless" ? "Relentless" : "Standard",
					creator ? " · Creator" : ""
				]
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: onHelp,
				className: "sim-pill sim-pill-pink text-[15px]",
				children: "HELP"
			}),
			/* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: toggleSound,
				className: "sim-pill sim-pill-cyan text-[15px]",
				children: [
					/* @__PURE__ */ jsx(Music, { className: "h-4 w-4" }),
					" MUSIC ",
					sound ? "ON" : "OFF"
				]
			}),
			editing ? /* @__PURE__ */ jsxs("form", {
				className: "flex gap-2",
				onSubmit: (event) => {
					event.preventDefault();
					onNick(draft);
					setEditing(false);
				},
				children: [/* @__PURE__ */ jsx("input", {
					value: draft,
					onChange: (event) => setDraft(event.target.value),
					maxLength: 16,
					className: "h-12 min-w-0 flex-1 rounded-full bg-black/30 px-4 text-sm"
				}), /* @__PURE__ */ jsx("button", {
					type: "submit",
					className: "sim-pill sim-pill-cyan w-auto px-4 text-[14px]",
					children: "SAVE"
				})]
			}) : /* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: () => setEditing(true),
				className: "sim-pill sim-pill-cyan text-[15px]",
				children: [/* @__PURE__ */ jsx(Pencil, { className: "h-4 w-4" }), " EDIT NICK"]
			}),
			/* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: onCreator,
				className: "sim-pill sim-pill-cyan text-[15px]",
				children: "CREATOR"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "text-center text-[11px] text-white/45",
				children: "Creator asks for the password. It is not a purchase."
			}),
			!sure ? /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: () => setSure(true),
				className: "sim-pill sim-pill-red text-[15px]",
				children: "END CAREER"
			}) : /* @__PURE__ */ jsx("button", {
				type: "button",
				onClick: onReset,
				className: "sim-pill sim-pill-red text-[15px]",
				children: "WIPE THIS SAVE"
			})
		]
	});
}
function ceremonyRows(c) {
	const cats = ["Best Rap Song", "Best Rap Performance", "Best Rap Album", "Record of the Year", "Album of the Year", "Best New Artist"];
	const grammy = c.trade?.grammy;
	return cats.map((name) => {
		const nominated = (grammy?.noms ?? []).find((row) => row.category === name && row.you);
		const winner = (grammy?.wins ?? []).find((row) => row.category === name && row.season === grammy?.settledSeason);
		return {
			name,
			nom: !!nominated,
			win: !!(winner && winner.you),
			winner: winner ? `${winner.artist} — ${winner.title}` : "",
			why: nominated?.why || ""
		};
	});
}
var FACTS = [
	{
		k: "The day",
		v: "You get energy. Spend it in the studio, on socials, at a show, or at work. The yellow moon ends the day."
	},
	{
		k: "The morning",
		v: "After you sleep, songs that are out get plays. Hype makes that number bigger. Rent comes every seventh night."
	},
	{
		k: "A song",
		v: "Create, then Record Song or Write Song. Title, style, who is on it, who writes it, which room. The bill is the last screen. Release it after."
	},
	{
		k: "Other people",
		v: "Orders are paid beats. Feat requests put another artist on your song. Labels send paper. Read it before you sign."
	},
	{
		k: "Money",
		v: "Shifts, shows, beats, and streams pay cash. Food buys energy back. Nothing here charges real money."
	}
];