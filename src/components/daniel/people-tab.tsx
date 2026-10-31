import { useState } from "react";
import { MOVES, ROOMS, chemistryBetween, personaLine, personaOf, statusLabel, statusOf, styleOf, tiesOf, versePrice } from "@/game/people";
import type { Career } from "@/game/types";
import type { PeopleAction } from "@/game/people";
import { money } from "@/game/format";

const SECTIONS = ["Artists", "Bonds", "Crews", "Mail", "Events", "Doors"] as const;
type Section = (typeof SECTIONS)[number];

export function PeopleScreen(props: { career: Career; onAct: (action: PeopleAction) => void; onPosts: () => void }) {
  const [section, setSection] = useState<Section>("Artists");
  const [open, setOpen] = useState<string | null>(null);
  const career = props.career;
  const names = career.npc.map((artist) => artist.name);
  const met = career.npc.filter((artist) => career.met.includes(artist.name));
  const locked = career.npc.filter((artist) => !career.met.includes(artist.name));
  if (open) {
    const artist = career.npc.find((row) => row.name === open);
    if (!artist) return null;
    const bond = career.bonds[artist.name];
    const known = career.met.includes(artist.name) && bond;
    const status = known ? statusOf(bond) : "stranger";
    const deal = versePrice(career, artist.name, 0);
    const ties = tiesOf(artist.name, names);
    return (
      <div className="flex flex-col gap-3 pb-6">
        <button type="button" onClick={() => setOpen(null)} className="h-10 text-left text-sm font-black">
          Back
        </button>
        <h2 className="text-center text-2xl font-black">{artist.name}</h2>
        <p className="text-center text-xs text-white/60">
          {styleOf(artist.name)} · {personaOf(artist.name)} · heat {artist.score}
        </p>
        <p className="text-center text-xs text-white/55">{personaLine(artist.name)}</p>
        <p className="text-center text-sm font-black">{known ? statusLabel(status) : "Not met"}</p>
        {known ? (
          <>
            <Bar label="Friendship" n={bond.friendship} />
            <Bar label="Respect" n={bond.respect} />
            <Bar label="Trust" n={bond.trust} />
            <p className="text-center text-xs text-white/55">
              Chemistry {chemistryBetween(career, artist.name)}
              {ties.friend ? ` · close with ${ties.friend}` : ""}
              {ties.rival ? ` · cold with ${ties.rival}` : ""}
            </p>
            <p className="text-center text-xs text-white/70">
              Verse {deal.refused ? "refused" : deal.price === 0 ? "free" : money(deal.price)}
              {career.circleAsk?.name === artist.name ? ` · locked until day ${career.circleAsk.until}` : ""}
            </p>
            {bond.romance !== "none" && <p className="text-center text-xs font-black">{bond.romance === "dating" ? "Dating" : "Ex"}</p>}
            <div className="grid grid-cols-2 gap-2">
              {MOVES.filter((move) => (move.id === "intro" ? status === "stranger" : known)).map((move) => (
                <button key={move.id} type="button" disabled={career.energy < move.energy} onClick={() => props.onAct({ type: "move", name: artist.name, move: move.id })} className="rounded-2xl bg-white/10 px-3 py-2 text-left disabled:opacity-40">
                  <span className="block text-sm font-black">{move.label}</span>
                  <span className="block text-[11px] text-white/55">{move.energy} energy</span>
                </button>
              ))}
            </div>
            <button type="button" disabled={career.energy < 6 || !!deal.refused} onClick={() => props.onAct({ type: "deal", name: artist.name, mode: "accept" })} className="sim-pill sim-pill-cyan text-[14px] disabled:opacity-40">
              {deal.refused || `Lock verse · ${deal.price === 0 ? "free" : money(deal.price)} · 6 energy`}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" disabled={career.energy < 6 || !!deal.refused} onClick={() => props.onAct({ type: "deal", name: artist.name, mode: "cut" })} className="sim-pill sim-pill-cyan text-[13px] disabled:opacity-40">
                Offer less · 6 energy
              </button>
              <button type="button" disabled={career.energy < 6 || !!deal.refused} onClick={() => props.onAct({ type: "deal", name: artist.name, mode: "royalty" })} className="sim-pill sim-pill-cyan text-[13px] disabled:opacity-40">
                Offer points · 6 energy
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => props.onAct({ type: "date", name: artist.name })} className="sim-pill sim-pill-pink text-[13px]">
                Date · 16 energy
              </button>
              <button type="button" onClick={() => props.onAct({ type: "break", name: artist.name })} className="sim-pill sim-pill-red text-[13px]">
                Break it off
              </button>
            </div>
            {career.crew && !career.crew.members.includes(artist.name) && (
              <button type="button" onClick={() => props.onAct({ type: "invite", name: artist.name })} className="sim-pill sim-pill-cyan text-[14px]">
                Invite to {career.crew.name}
              </button>
            )}
            {career.crew?.members.includes(artist.name) && (
              <button type="button" onClick={() => props.onAct({ type: "kick", name: artist.name })} className="sim-pill sim-pill-red text-[14px]">
                Remove from crew
              </button>
            )}
            <ul className="flex flex-col gap-1">
              {bond.history.length === 0 && <li className="text-xs text-white/45">No history yet.</li>}
              {bond.history.map((row, index) => (
                <li key={`${row.day}-${index}`} className="text-xs text-white/70">
                  Day {row.day} · {row.text}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-center text-sm text-white/70">
            {deal.refused || "You have not met them. An event or a friend has to walk you in. Money does not skip the door."}
          </p>
        )}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3 pb-4">
      <div className="flex gap-1 overflow-auto">
        {SECTIONS.map((item) => (
          <button key={item} type="button" onClick={() => setSection(item)} className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-black ${section === item ? "bg-white text-[#12121a]" : "bg-white/10"}`}>
            {item}
          </button>
        ))}
        <button type="button" onClick={props.onPosts} className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-[11px] font-black">
          Posts
        </button>
      </div>
      {section === "Artists" && (
        <ul className="flex flex-col gap-2">
          {met.map((artist) => (
            <ArtistRow key={artist.name} career={career} name={artist.name} onOpen={setOpen} />
          ))}
          {locked.length > 0 && <li className="px-1 pt-2 text-[11px] font-black tracking-wide text-white/45">NOT MET · {locked.length}</li>}
          {locked.map((artist) => (
            <li key={artist.name}>
              <button type="button" onClick={() => setOpen(artist.name)} className="flex w-full items-center justify-between rounded-2xl bg-black/30 px-3 py-3 text-left">
                <span>
                  <span className="block text-sm font-bold">{artist.name}</span>
                  <span className="text-[11px] text-white/45">Heat {artist.score} · needs an introduction</span>
                </span>
                <span className="text-[11px] font-black text-white/50">Locked</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {section === "Bonds" && (
        <ul className="flex flex-col gap-2">
          {met.length === 0 && <li className="text-sm text-white/55">Nobody yet. Go to an event.</li>}
          {(["best", "close", "friend", "associate", "acquaintance", "rival", "enemy"] as const).map((status) => {
            const rows = met.filter((artist) => statusOf(career.bonds[artist.name] ?? { friendship: 0, respect: 0, trust: 0, strain: 0, met: career.day, history: [], romance: "none", last: 0 }) === status);
            if (rows.length === 0) return null;
            return (
              <li key={status}>
                <p className="mb-1 text-[11px] font-black tracking-wide text-white/45">{statusLabel(status).toUpperCase()}</p>
                <ul className="flex flex-col gap-2">
                  {rows.map((artist) => (
                    <ArtistRow key={artist.name} career={career} name={artist.name} onOpen={setOpen} />
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
      {section === "Crews" && <Crews career={career} onAct={props.onAct} onOpen={setOpen} />}
      {section === "Mail" && (
        <ul className="flex flex-col gap-2">
          {career.circleMail.length === 0 && <li className="text-sm text-white/55">Nobody has written. Friendships do not text themselves on day one.</li>}
          {career.circleMail.map((note) => (
            <li key={note.id} className="rounded-2xl bg-black/35 px-3 py-3">
              <p className="text-sm font-black">{note.from}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/75">{note.text}</p>
              {note.open ? (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => props.onAct({ type: "note", id: note.id, yes: true })} className="sim-pill sim-pill-cyan text-[13px]">
                    Answer
                  </button>
                  <button type="button" onClick={() => props.onAct({ type: "note", id: note.id, yes: false })} className="sim-pill sim-pill-red text-[13px]">
                    Leave it
                  </button>
                </div>
              ) : (
                <p className="mt-1 text-[11px] text-white/40">Answered</p>
              )}
            </li>
          ))}
        </ul>
      )}
      {section === "Events" && (
        <ul className="flex flex-col gap-2">
          {ROOMS.map((room) => {
            const fameOk = career.fame >= room.fame;
            const respectOk = (career.industry?.respected ?? 0) >= room.respect;
            const cashOk = career.cash >= room.cash;
            const energyOk = career.energy >= room.energy;
            const why = !fameOk ? `Needs fame ${room.fame}` : !respectOk ? `Needs respect ${room.respect}` : !cashOk ? `Needs ${money(room.cash)}` : !energyOk ? `Needs ${room.energy} energy` : `${room.energy} energy${room.cash ? ` · ${money(room.cash)}` : ""}`;
            return (
              <li key={room.id} className="rounded-2xl bg-black/35 px-3 py-3">
                <p className="font-black">{room.name}</p>
                <p className="mt-1 text-xs text-white/65">{room.detail}</p>
                <button type="button" disabled={!fameOk || !respectOk || !cashOk || !energyOk} onClick={() => props.onAct({ type: "event", id: room.id })} className="sim-pill sim-pill-cyan mt-2 text-[14px] disabled:opacity-40">
                  {why}
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {section === "Doors" && <Doors career={career} onAct={props.onAct} onOpen={setOpen} />}
    </div>
  );
}

function Bar({ label, n }: { label: string; n: number }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] font-black">
        <span>{label}</span>
        <span>{n}</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/15">
        <div className="h-full bg-[#3dff8a]" style={{ width: `${n}%` }} />
      </div>
    </div>
  );
}

function ArtistRow({ career, name, onOpen }: { career: Career; name: string; onOpen: (name: string) => void }) {
  const bond = career.bonds[name];
  const artist = career.npc.find((row) => row.name === name);
  const status = bond ? statusOf(bond) : "stranger";
  return (
    <li>
      <button type="button" onClick={() => onOpen(name)} className="flex w-full items-center justify-between rounded-2xl bg-white/10 px-3 py-3 text-left">
        <span>
          <span className="block text-sm font-bold">{name}</span>
          <span className="text-[11px] text-white/50">
            {styleOf(name)} · heat {artist?.score ?? 0}
            {bond ? ` · F${bond.friendship} R${bond.respect} T${bond.trust}` : ""}
          </span>
        </span>
        <span className="text-[11px] font-black">{statusLabel(status)}</span>
      </button>
    </li>
  );
}

function Crews({ career, onAct, onOpen }: { career: Career; onAct: (action: PeopleAction) => void; onOpen: (name: string) => void }) {
  const [name, setName] = useState("");
  if (!career.crew) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-center text-sm text-white/70">No crew. A name costs 8 energy. Members still have to like you.</p>
        <input value={name} onChange={(event) => setName(event.target.value.slice(0, 24))} placeholder="Crew name" className="h-12 rounded-full bg-black/30 px-4 text-center text-sm outline-none" />
        <button type="button" disabled={career.energy < 8} onClick={() => onAct({ type: "crew", name })} className="sim-pill sim-pill-cyan text-[15px] disabled:opacity-40">
          Start the crew
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-center text-xl font-black">{career.crew.name}</h2>
      <p className="text-center text-xs text-white/55">
        Pop {career.crew.pop} · rivalry with {career.crew.rival}
      </p>
      <ul className="flex flex-col gap-2">
        {career.crew.members.length === 0 && <li className="text-center text-sm text-white/50">Just you. Invite someone from Artists.</li>}
        {career.crew.members.map((member) => (
          <ArtistRow key={member} career={career} name={member} onOpen={onOpen} />
        ))}
      </ul>
      <p className="text-[11px] font-black tracking-wide text-white/45">INVITE SOMEONE YOU KNOW</p>
      {career.met
        .filter((person) => !career.crew!.members.includes(person))
        .map((person) => (
          <button key={person} type="button" disabled={career.energy < 6} onClick={() => onAct({ type: "invite", name: person })} className="rounded-2xl bg-white/10 px-3 py-2 text-left text-sm font-bold disabled:opacity-40">
            Ask {person} · 6 energy
          </button>
        ))}
      <button type="button" onClick={() => onAct({ type: "leave" })} className="sim-pill sim-pill-red text-[14px]">
        Leave the crew
      </button>
    </div>
  );
}

function Doors({ career, onAct, onOpen }: { career: Career; onAct: (action: PeopleAction) => void; onOpen: (name: string) => void }) {
  const industry = career.industry ?? { loyal: 0, generous: 0, respected: 0, difficult: 0, controversial: 0, fake: 0 };
  const friends = career.met.filter((name) => {
    const bond = career.bonds[name];
    if (!bond) return false;
    const status = statusOf(bond);
    return status === "friend" || status === "close" || status === "best";
  });
  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-xs text-white/60">How the industry talks about you. It moves when you do, not when the day does.</p>
      <Bar label="Loyal" n={industry.loyal} />
      <Bar label="Generous" n={industry.generous} />
      <Bar label="Respected" n={industry.respected} />
      <Bar label="Difficult" n={industry.difficult} />
      <Bar label="Controversial" n={industry.controversial} />
      <Bar label="Fake" n={industry.fake} />
      <p className="text-[11px] font-black tracking-wide text-white/45">ASK A FRIEND TO INTRODUCE YOU</p>
      {friends.length === 0 && <p className="text-sm text-white/55">No friend yet. Acquaintances will not open a door.</p>}
      {friends.map((name) => (
        <button key={name} type="button" disabled={career.energy < 8} onClick={() => onAct({ type: "intro", name })} className="rounded-2xl bg-white/10 px-3 py-2 text-left disabled:opacity-40">
          <span className="block text-sm font-black">{name}</span>
          <span className="text-[11px] text-white/55">8 energy · walks you to someone you have not met</span>
        </button>
      ))}
      <p className="text-[11px] font-black tracking-wide text-white/45">STILL LOCKED</p>
      {career.npc
        .filter((artist) => !career.met.includes(artist.name))
        .slice(0, 8)
        .map((artist) => (
          <button key={artist.name} type="button" onClick={() => onOpen(artist.name)} className="text-left text-xs text-white/60">
            {artist.name} · heat {artist.score}
          </button>
        ))}
    </div>
  );
}
