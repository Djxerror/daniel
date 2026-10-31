import { useState } from "react";
import { Meter } from "@/components/daniel/bits";
import { lookOf, PATHS, SHOP, SKILLS, tierOf } from "@/game/content";
import { fmt, money } from "@/game/format";
import { useGame } from "@/game/store";
import type { ShopItem } from "@/game/types";

export function Dossier() {
  const tab = useGame((s) => s.career.tab);
  if (tab === "chart") return <Chart />;
  if (tab === "catalog") return <Catalog />;
  if (tab === "news") return <News />;
  return <You />;
}

function Chart() {
  const career = useGame((s) => s.career);
  const you = career.chart.some((row) => row.you);
  return (
    <section>
      <h2 className="font-display text-4xl leading-none">The ten</h2>
      <p className="mt-2 text-sm text-muted">
        {you ? "You are on it." : "You are not on it. Drop something and close a week."}
      </p>
      <ol className="group-card mt-4">
        {career.chart.map((row) => (
          <li
            key={row.you ? "you" : row.name}
            className={`flex items-center gap-3 px-4 py-3 ${row.you ? "text-ember" : ""}`}
          >
            <span className="w-8 font-display text-3xl tabular-nums leading-none">{row.rank}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm">{row.name}</span>
              <span className={`block truncate text-xs ${row.you ? "text-ember" : "text-muted"}`}>
                {row.title}
              </span>
            </span>
            <span className="text-right text-xs tabular-nums text-muted">
              <span className="block text-brass">
                {row.move == null ? "New" : row.move === 0 ? "—" : row.move > 0 ? `+${row.move}` : row.move}
              </span>
              <span className="block">{row.weeks}w · pk {row.peak}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Catalog() {
  const tracks = useGame((s) => s.career.tracks);
  const rename = useGame((s) => s.rename);
  if (tracks.length === 0) {
    return (
      <section>
        <h2 className="font-display text-4xl leading-none">Songs</h2>
        <p className="mt-3 text-sm text-muted">The notebook is empty. Write something.</p>
      </section>
    );
  }
  const ordered = [...tracks].reverse();
  return (
    <section>
      <h2 className="font-display text-4xl leading-none">Songs</h2>
      <ul className="group-card mt-4">
        {ordered.map((track) => (
          <li key={track.id} className="px-4 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-display text-2xl leading-none">{track.title}</p>
              <p className="shrink-0 text-xs text-brass uppercase">
                {track.status === "out" ? "Out" : track.status === "master" ? "Master" : "Draft"}
              </p>
            </div>
            <p className="mt-2 text-xs text-muted">
              Quality {track.quality}
              {track.feat ? ` · feat ${track.feat}` : ""}
              {track.status === "out" ? ` · ${fmt(track.streams)} plays` : ""}
              {track.lastNight > 0 ? ` · ${fmt(track.lastNight)} last night` : ""}
              {track.peak ? ` · peaked #${track.peak}` : ""}
              {track.visual ? " · visual" : ""}
              {track.promo > 0 ? ` · push ${track.promo}/3` : ""}
            </p>
            <div className="mt-2">
              <Meter value={track.quality} />
            </div>
            {track.status !== "out" && (
              <Rename
                current={track.title}
                onSave={(title) => rename(track.id, title)}
              />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Rename({ current, onSave }: { current: string; onSave: (title: string) => void }) {
  const [value, setValue] = useState(current);
  return (
    <form
      className="mt-3 flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(value);
      }}
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={32}
        aria-label="Song title"
        className="h-10 min-w-0 flex-1 rounded-xl bg-surface-2 px-3 text-sm text-fg"
      />
      <button type="submit" className="h-10 rounded-full bg-surface-2 px-3 text-xs text-brass">
        Rename
      </button>
    </form>
  );
}

function News() {
  const feed = useGame((s) => s.career.feed);
  return (
    <section>
      <h2 className="font-display text-4xl leading-none">News</h2>
      <ul className="group-card mt-4">
        {feed.map((item) => (
          <li key={item.id} className="px-4 py-4">
            <p className="text-xs text-brass">
              Week {item.week} · {item.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-pretty text-muted">{item.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function You() {
  const career = useGame((s) => s.career);
  const buy = useGame((s) => s.buy);
  const reset = useGame((s) => s.reset);
  const [ask, setAsk] = useState(false);
  const look = lookOf(career.look);
  const tier = tierOf(career.fame);
  const lane = PATHS[career.path];

  return (
    <section>
      <h2 className="font-display text-4xl leading-none">{career.nick || "You"}</h2>
      <p className="mt-2 text-sm text-muted">
        {look.name} · {lane.label} · {career.city} · {career.pace === "relentless" ? "Relentless" : "Standard"} · {tier.current.name}
      </p>
      <img src={look.src} alt="" className="mt-4 h-48 w-full rounded-3xl object-cover" />

      <h3 className="mt-8 font-display text-2xl">Skills</h3>
      <ul className="mt-3 flex flex-col gap-3">
        {SKILLS.map((skill) => (
          <li key={skill.key}>
            <div className="mb-1 flex justify-between text-xs">
              <span>{skill.label}</span>
              <span className="tabular-nums text-muted">{career.skills[skill.key]}</span>
            </div>
            <Meter value={career.skills[skill.key]} />
          </li>
        ))}
      </ul>

      <h3 className="mt-8 font-display text-2xl">Shop</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Cash you earned. Nothing here spends real money.
      </p>
      <ul className="group-card mt-3">
        <GearRow item="mic" level={career.gear.mic} onBuy={() => buy("mic")} cash={career.cash} />
        <GearRow item="studio" level={career.gear.studio} onBuy={() => buy("studio")} cash={career.cash} />
        <GearRow
          item="wardrobe"
          level={career.gear.wardrobe}
          onBuy={() => buy("wardrobe")}
          cash={career.cash}
        />
        <li>
          <button
            type="button"
            disabled={career.gear.manager || career.cash < SHOP.manager.cost}
            onClick={() => buy("manager")}
            className="flex min-h-14 w-full items-center justify-between px-4 text-left disabled:opacity-40"
          >
            <span>
              <span className="block text-sm">
                {career.gear.manager ? "Manager on the books" : SHOP.manager.name}
              </span>
              <span className="block text-xs text-muted">{SHOP.manager.blurb}</span>
            </span>
            {!career.gear.manager && (
              <span className="ml-3 shrink-0 text-xs tabular-nums text-brass">
                {money(SHOP.manager.cost)}
              </span>
            )}
          </button>
        </li>
      </ul>

      <h3 className="mt-8 font-display text-2xl">Shelf</h3>
      {career.awardLog.length === 0 ? (
        <p className="mt-2 text-sm text-muted">Nothing on the shelf yet.</p>
      ) : (
        <ul className="group-card mt-3">
          {career.awardLog.map((award) => (
            <li key={award.id} className="flex items-baseline justify-between px-4 py-3">
              <span className="text-sm">{award.name}</span>
              <span className="text-xs text-muted">Week {award.week}</span>
            </li>
          ))}
        </ul>
      )}

      <h3 className="mt-8 font-display text-2xl">How the career works</h3>
      <div className="mt-3 flex flex-col gap-4 text-sm leading-relaxed text-pretty text-muted">
        <p>
          Energy is the day. Sleep refills it. Every seventh night the rent comes out. Plays are counted in the morning. Hype makes that number louder. Reputation is why other artists write.
        </p>
        <p>
          Write a draft and rename it. Record a master. Push a snippet, a date, and a teaser before you release. A visual and a feature both ride the next morning. A label deal arrives as paper: an advance, a cut, and four singles due. Miss the quota and they fine you.
        </p>
        <p>
          The chart scores quality, last night's plays, hype, and whether a picture or a feature exists. Ten other names drift every morning. Weeks on chart and peak sit on the row. Fame is the tier under your name: Bedroom, Local, Buzz, Roster, Headliner, Legend.
        </p>
        <p>
          A shift pays before the songs do. Food buys energy back. Shows pay the door. Book past your stage skill and people leave. Beats pay cash from production.
        </p>
        <p>
          Money in the game is career money. Standard pace skips the first rent. Relentless charges on night seven and cuts your energy. Once a year the room holds a ceremony. Nominations are not wins.
        </p>
        <p>
          If this shipped in a store, the paid layer would be tempo, not power: an energy refill, a cash advance with a worse cut, extra looks. No paid skill points. A song would still have to be good. This build does not charge anything.
        </p>
      </div>

      <div className="mt-10">
        {ask ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={reset}
              className="h-12 flex-1 rounded-full bg-ember text-sm text-bg"
            >
              Erase the career
            </button>
            <button
              type="button"
              onClick={() => setAsk(false)}
              className="h-12 flex-1 rounded-full border border-line text-sm"
            >
              Keep it
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setAsk(true)} className="text-sm text-ember">
            Start over
          </button>
        )}
      </div>
    </section>
  );
}

function GearRow({
  item,
  level,
  cash,
  onBuy,
}: {
  item: Exclude<ShopItem, "manager">;
  level: 0 | 1 | 2;
  cash: number;
  onBuy: () => void;
}) {
  if (level >= 2) {
    const owned = SHOP[item][1];
    return (
      <li className="flex min-h-14 items-center px-4">
        <span>
          <span className="block text-sm">{owned.name}</span>
          <span className="block text-xs text-muted">Owned</span>
        </span>
      </li>
    );
  }
  const offer = SHOP[item][level === 0 ? 0 : 1];
  return (
    <li>
      <button
        type="button"
        disabled={cash < offer.cost}
        onClick={onBuy}
        className="flex min-h-14 w-full items-center justify-between px-4 text-left disabled:opacity-40"
      >
        <span>
          <span className="block text-sm">{offer.name}</span>
          <span className="block text-xs text-muted">{offer.blurb}</span>
        </span>
        <span className="ml-3 shrink-0 text-xs tabular-nums text-brass">{money(offer.cost)}</span>
      </button>
    </li>
  );
}
