import { isWeekday, money } from "@/game/format";
import type { Career, DegreeId, DegreeProgress, DegreesHeld, Employment, JobPath, PathDays } from "@/game/types";

/** One school year is the weekdays in it. Weekends do not count as class. */
export const WEEKDAYS_IN_YEAR = 260;

export const EMPTY_DEGREES: DegreesHeld = {
  college: false,
  university: false,
  masters: false,
  law: false,
};

export type JobPost = {
  id: string;
  path: JobPath;
  title: string;
  weekly: number;
  energy: number;
  degree: DegreeId | null;
  days: number;
};

export type DegreeSpec = {
  id: DegreeId;
  name: string;
  tuition: number;
  years: number;
  /** Energy taken from the shared bar each weekday. */
  weekdayEnergy: number;
  /** What the card should call the energy cost. */
  energyLabel: string;
  needs: DegreeId | null;
};

export const JOB_PATHS: { id: JobPath; label: string }[] = [
  { id: "starter", label: "Starter" },
  { id: "retail", label: "Retail" },
  { id: "food", label: "Food" },
  { id: "transport", label: "Transport" },
  { id: "health", label: "Health" },
  { id: "business", label: "Business" },
  { id: "tech", label: "Tech" },
  { id: "entertainment", label: "Entertainment" },
  { id: "construction", label: "Construction" },
  { id: "education", label: "Education" },
  { id: "law", label: "Law" },
];

const PATH_NAME: Record<JobPath, string> = {
  starter: "Starter",
  retail: "Retail",
  food: "Food & hospitality",
  transport: "Transportation",
  health: "Healthcare",
  business: "Business",
  tech: "Technology",
  entertainment: "Entertainment",
  construction: "Construction",
  education: "Education",
  law: "Law",
};

export const JOBS: JobPost[] = [
  { id: "sign-holder", path: "starter", title: "Sign Holder", weekly: 245, energy: 15, degree: null, days: 0 },
  { id: "sales-associate", path: "retail", title: "Sales Associate", weekly: 294, energy: 14, degree: null, days: 0 },
  { id: "store-supervisor", path: "retail", title: "Store Supervisor", weekly: 455, energy: 18, degree: "college", days: 0 },
  { id: "asst-store-manager", path: "retail", title: "Assistant Store Manager", weekly: 630, energy: 22, degree: "college", days: 45 },
  { id: "store-manager", path: "retail", title: "Store Manager", weekly: 980, energy: 28, degree: "university", days: 0 },
  { id: "regional-manager", path: "retail", title: "Regional Manager", weekly: 1540, energy: 34, degree: "masters", days: 80 },
  { id: "server", path: "food", title: "Server", weekly: 266, energy: 16, degree: null, days: 0 },
  { id: "restaurant-supervisor", path: "food", title: "Restaurant Supervisor", weekly: 420, energy: 18, degree: "college", days: 0 },
  { id: "restaurant-manager", path: "food", title: "Restaurant Manager", weekly: 700, energy: 24, degree: "college", days: 40 },
  { id: "hotel-manager", path: "food", title: "Hotel Manager", weekly: 1120, energy: 30, degree: "university", days: 0 },
  { id: "hospitality-director", path: "food", title: "Hospitality Director", weekly: 1750, energy: 36, degree: "masters", days: 80 },
  { id: "delivery-driver", path: "transport", title: "Delivery Driver", weekly: 315, energy: 18, degree: null, days: 0 },
  { id: "taxi-driver", path: "transport", title: "Taxi Driver", weekly: 385, energy: 18, degree: null, days: 20 },
  { id: "commercial-driver", path: "transport", title: "Commercial Driver", weekly: 560, energy: 24, degree: "college", days: 0 },
  { id: "fleet-supervisor", path: "transport", title: "Fleet Supervisor", weekly: 840, energy: 28, degree: "college", days: 50 },
  { id: "transport-manager", path: "transport", title: "Transportation Manager", weekly: 1260, energy: 32, degree: "university", days: 0 },
  { id: "medical-assistant", path: "health", title: "Medical Assistant", weekly: 490, energy: 18, degree: "college", days: 0 },
  { id: "lpn", path: "health", title: "Licensed Practical Nurse", weekly: 700, energy: 24, degree: "college", days: 30 },
  { id: "rn", path: "health", title: "Registered Nurse", weekly: 1190, energy: 32, degree: "university", days: 0 },
  { id: "np", path: "health", title: "Nurse Practitioner", weekly: 1820, energy: 36, degree: "masters", days: 0 },
  { id: "health-admin", path: "health", title: "Healthcare Administrator", weekly: 2100, energy: 34, degree: "masters", days: 50 },
  { id: "office-assistant", path: "business", title: "Office Assistant", weekly: 301, energy: 12, degree: null, days: 0 },
  { id: "admin-assistant", path: "business", title: "Administrative Assistant", weekly: 455, energy: 16, degree: "college", days: 0 },
  { id: "admin-manager", path: "business", title: "Administrative Manager", weekly: 770, energy: 22, degree: "college", days: 40 },
  { id: "business-manager", path: "business", title: "Business Manager", weekly: 1260, energy: 28, degree: "university", days: 0 },
  { id: "executive-director", path: "business", title: "Executive Director", weekly: 2240, energy: 36, degree: "masters", days: 80 },
  { id: "it-support", path: "tech", title: "IT Support Technician", weekly: 490, energy: 16, degree: null, days: 0 },
  { id: "junior-developer", path: "tech", title: "Junior Developer", weekly: 735, energy: 22, degree: "college", days: 0 },
  { id: "software-developer", path: "tech", title: "Software Developer", weekly: 1260, energy: 28, degree: "university", days: 0 },
  { id: "senior-developer", path: "tech", title: "Senior Developer", weekly: 1750, energy: 32, degree: "university", days: 70 },
  { id: "tech-director", path: "tech", title: "Technology Director", weekly: 2450, energy: 38, degree: "masters", days: 0 },
  { id: "event-staff", path: "entertainment", title: "Event Staff", weekly: 252, energy: 14, degree: null, days: 0 },
  { id: "event-coordinator", path: "entertainment", title: "Event Coordinator", weekly: 490, energy: 18, degree: "college", days: 0 },
  { id: "talent-manager", path: "entertainment", title: "Talent Manager", weekly: 840, energy: 22, degree: "college", days: 40 },
  { id: "entertainment-manager", path: "entertainment", title: "Entertainment Manager", weekly: 1400, energy: 28, degree: "university", days: 0 },
  { id: "entertainment-exec", path: "entertainment", title: "Entertainment Executive", weekly: 2170, energy: 34, degree: "masters", days: 70 },
  { id: "laborer", path: "construction", title: "Construction Laborer", weekly: 350, energy: 22, degree: null, days: 0 },
  { id: "tradesperson", path: "construction", title: "Skilled Tradesperson", weekly: 595, energy: 26, degree: "college", days: 0 },
  { id: "site-supervisor", path: "construction", title: "Site Supervisor", weekly: 840, energy: 30, degree: "college", days: 45 },
  { id: "construction-manager", path: "construction", title: "Construction Manager", weekly: 1330, energy: 34, degree: "university", days: 0 },
  { id: "project-director", path: "construction", title: "Project Director", weekly: 1960, energy: 38, degree: "masters", days: 80 },
  { id: "teaching-assistant", path: "education", title: "Teaching Assistant", weekly: 350, energy: 14, degree: "college", days: 0 },
  { id: "teacher", path: "education", title: "Teacher", weekly: 700, energy: 24, degree: "university", days: 0 },
  { id: "department-head", path: "education", title: "Department Head", weekly: 910, energy: 26, degree: "university", days: 50 },
  { id: "asst-principal", path: "education", title: "Assistant Principal", weekly: 1190, energy: 28, degree: "masters", days: 0 },
  { id: "principal", path: "education", title: "School Principal", weekly: 1610, energy: 32, degree: "masters", days: 70 },
  { id: "legal-assistant", path: "law", title: "Legal Assistant", weekly: 420, energy: 16, degree: "college", days: 0 },
  { id: "paralegal", path: "law", title: "Paralegal", weekly: 630, energy: 20, degree: "college", days: 30 },
  { id: "associate-attorney", path: "law", title: "Associate Attorney", weekly: 1680, energy: 30, degree: "law", days: 0 },
  { id: "senior-attorney", path: "law", title: "Senior Attorney", weekly: 2450, energy: 34, degree: "law", days: 70 },
  { id: "legal-director", path: "law", title: "Legal Director", weekly: 3220, energy: 38, degree: "law", days: 120 },
];

export const DEGREES: DegreeSpec[] = [
  {
    id: "college",
    name: "College",
    tuition: 1000,
    years: 2,
    weekdayEnergy: 50,
    energyLabel: "50 energy each weekday",
    needs: null,
  },
  {
    id: "university",
    name: "University",
    tuition: 50_000,
    years: 3,
    weekdayEnergy: 44,
    energyLabel: "44 energy each weekday · 220 across the week",
    needs: null,
  },
  {
    id: "masters",
    name: "Master's degree",
    tuition: 25_000,
    years: 1,
    weekdayEnergy: 20,
    energyLabel: "20 energy each weekday",
    needs: "university",
  },
  {
    id: "law",
    name: "Law school",
    tuition: 30_000,
    years: 3,
    weekdayEnergy: 30,
    energyLabel: "30 energy each weekday",
    needs: "university",
  },
];

const DEGREE_NAME: Record<DegreeId, string> = {
  college: "College",
  university: "University",
  masters: "a master's degree",
  law: "law school",
};

export function jobById(id: string | null | undefined): JobPost | null {
  if (!id) return null;
  return JOBS.find((job) => job.id === id) ?? null;
}

export function degreeById(id: string | null | undefined): DegreeSpec | null {
  if (!id) return null;
  return DEGREES.find((item) => item.id === id) ?? null;
}

/** A weekly salary is paid across the 7 mornings of a rent week. Hardcore takes the usual 20% off. */
export function dailyWage(weekly: number, level: Career["level"] | undefined): number {
  const base = Math.round(weekly / 7);
  return level === "hardcore" ? Math.max(1, Math.round(base * 0.8)) : base;
}

export function jobLock(career: Pick<Career, "degrees" | "pathDays">, job: JobPost): string | null {
  const held = career.degrees ?? EMPTY_DEGREES;
  const worked = career.pathDays?.[job.path] ?? 0;
  const needs: string[] = [];
  if (job.degree && !held[job.degree]) needs.push(`Needs ${DEGREE_NAME[job.degree]}`);
  if (job.days > 0 && worked < job.days) {
    needs.push(`Needs ${job.days - worked} more day${job.days - worked === 1 ? "" : "s"} in ${PATH_NAME[job.path]}`);
  }
  return needs.length ? needs.join(" · ") : null;
}

export function degreeLock(career: Pick<Career, "degrees" | "degree">, spec: DegreeSpec): string | null {
  const held = career.degrees ?? EMPTY_DEGREES;
  if (held[spec.id]) return "Already finished";
  if (career.degree?.id === spec.id) return "Already enrolled";
  if (career.degree && career.degree.id !== spec.id) return `Finish ${degreeById(career.degree.id)?.name ?? "the other program"} first`;
  if (spec.needs && !held[spec.needs]) return `Needs ${DEGREE_NAME[spec.needs]} first`;
  return null;
}

export function emptyDegrees(): DegreesHeld {
  return { ...EMPTY_DEGREES };
}

export function jobFrom(raw: unknown): Employment | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<Employment>;
  if (!jobById(row.id)) return null;
  const hiredOn = Math.max(1, Math.round(row.hiredOn ?? 1));
  return {
    id: row.id as string,
    hiredOn,
    paidOn: Math.max(0, Math.round(row.paidOn ?? hiredOn)),
    days: Math.max(0, Math.round(row.days ?? 0)),
  };
}

export function degreeFrom(raw: unknown): DegreeProgress | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<DegreeProgress>;
  const spec = degreeById(row.id);
  if (!spec) return null;
  return {
    id: spec.id,
    year: Math.max(1, Math.min(spec.years, Math.round(row.year ?? 1))),
    attended: Math.max(0, Math.min(WEEKDAYS_IN_YEAR, Math.round(row.attended ?? 0))),
    paidThrough: Math.max(0, Math.round(row.paidThrough ?? 0)),
  };
}

export function degreesFrom(raw: unknown): DegreesHeld {
  const held = emptyDegrees();
  if (!raw || typeof raw !== "object") return held;
  const row = raw as Partial<DegreesHeld>;
  (Object.keys(held) as DegreeId[]).forEach((id) => {
    held[id] = row[id] === true;
  });
  return held;
}

export function pathDaysFrom(raw: unknown): PathDays {
  if (!raw || typeof raw !== "object") return {};
  const next: PathDays = {};
  for (const path of JOB_PATHS) {
    const value = (raw as Record<string, unknown>)[path.id];
    if (typeof value === "number" && value > 0) next[path.id] = Math.round(value);
  }
  return next;
}

export function settleWorkDay(input: {
  job: Employment | null;
  degree: DegreeProgress | null;
  degrees: DegreesHeld;
  pathDays: PathDays;
  day: number;
  startYear: number;
  level: Career["level"];
  cash: number;
  maxEnergy: number;
}): {
  job: Employment | null;
  degree: DegreeProgress | null;
  degrees: DegreesHeld;
  pathDays: PathDays;
  pay: number;
  tuition: number;
  energy: number;
  notes: string[];
} {
  let job = input.job ? { ...input.job } : null;
  let degree = input.degree ? { ...input.degree } : null;
  const degrees = { ...input.degrees };
  const pathDays = { ...input.pathDays };
  const notes: string[] = [];
  let pay = 0;
  let tuition = 0;
  let energy = input.maxEnergy;
  let cash = input.cash;
  const year = input.startYear || undefined;

  if (job) {
    const post = jobById(job.id);
    if (!post) job = null;
    else if (input.day > job.hiredOn && job.paidOn < input.day) {
      pay = dailyWage(post.weekly, input.level);
      cash += pay;
      job = { ...job, paidOn: input.day, days: job.days + 1 };
      pathDays[post.path] = (pathDays[post.path] ?? 0) + 1;
      energy = Math.max(0, energy - post.energy);
      notes.push(`${post.title} paid ${money(pay)}. ${post.energy} energy.`);
    }
  }

  if (degree && isWeekday(input.day, year)) {
    const spec = degreeById(degree.id);
    if (!spec) {
      degree = null;
    } else {
      if (degree.paidThrough < degree.year) {
        if (cash >= spec.tuition) {
          cash -= spec.tuition;
          tuition += spec.tuition;
          degree = { ...degree, paidThrough: degree.year };
          notes.push(`${spec.name} tuition took ${money(spec.tuition)}.`);
        } else {
          notes.push(`${spec.name} is waiting on ${money(spec.tuition)} tuition.`);
        }
      }
      if (degree && degree.paidThrough >= degree.year) {
        if (energy < spec.weekdayEnergy) {
          notes.push(`${spec.name} didn't meet. Not enough energy.`);
        } else {
          energy -= spec.weekdayEnergy;
          const attended = degree.attended + 1;
          if (attended >= WEEKDAYS_IN_YEAR) {
            if (degree.year >= spec.years) {
              degrees[spec.id] = true;
              degree = null;
              notes.push(`You finished ${spec.name}.`);
            } else {
              const done = degree.year;
              degree = { ...degree, year: done + 1, attended: 0 };
              notes.push(`${spec.name} year ${done} is done. Year ${done + 1} tuition is due the next weekday.`);
            }
          } else {
            degree = { ...degree, attended };
          }
        }
      }
    }
  }

  return { job, degree, degrees, pathDays, pay, tuition, energy, notes };
}
