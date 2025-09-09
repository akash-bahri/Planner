import React, { useEffect, useMemo, useState } from "react";

// Weekly Planner — :00/:30 grid, Mon–Thu Work 4–11 pm, mobile-friendly
// Modes: Compact (list with manual check) and Focus (hero current + grey up-next). Default = Focus.

// ---------------------------------
// Category palettes
// ---------------------------------
const CATS = {
  Sleep: "bg-slate-100 border-slate-300 text-slate-900",
  "Wake + Meditate": "bg-amber-100 border-amber-300 text-amber-900",
  Breakfast: "bg-orange-100 border-orange-300 text-orange-900",
  DSA: "bg-indigo-100 border-indigo-300 text-indigo-900",
  Break: "bg-teal-100 border-teal-300 text-teal-900",
  "System Design": "bg-violet-100 border-violet-300 text-violet-900",
  "Job Applications": "bg-blue-100 border-blue-300 text-blue-900",
  Lunch: "bg-lime-100 border-lime-300 text-lime-900",
  "Buffer / Admin": "bg-zinc-100 border-zinc-300 text-zinc-900",
  Commute: "bg-cyan-100 border-cyan-300 text-cyan-900",
  Work: "bg-rose-100 border-rose-300 text-rose-900",
  "Dinner / Wind-down": "bg-pink-100 border-pink-300 text-pink-900",
  Gym: "bg-emerald-100 border-emerald-300 text-emerald-900",
  Chores: "bg-stone-100 border-stone-300 text-stone-900",
  Leisure: "bg-yellow-100 border-yellow-300 text-yellow-900",
  "Weekly Review & Plan": "bg-fuchsia-100 border-fuchsia-300 text-fuchsia-900",
  Brunch: "bg-lime-100 border-lime-300 text-lime-900",
  "Hobby / Reading": "bg-sky-100 border-sky-300 text-sky-900",
  "System Design Review": "bg-violet-100 border-violet-300 text-violet-900",
  "Free / Optional": "bg-white border-gray-300 border-dashed text-gray-700",
};

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

// ---------------------------------
// Schedule builder (fixed :00/:30)
// ---------------------------------
function daySchedule(day) {
  const weekdayMorning = [
    { title: "Wake + Meditate", start: "8:30 AM", end: "9:00 AM", cat: "Wake + Meditate" },
    { title: "Breakfast",       start: "9:00 AM", end: "9:30 AM", cat: "Breakfast" },
    { title: "DSA",             start: "9:30 AM", end: "11:00 AM", cat: "DSA" },
    { title: "Break / Walk",    start: "11:00 AM", end: "11:30 AM", cat: "Break" },
    { title: "System Design",   start: "11:30 AM", end: "12:00 PM", cat: "System Design" },
  ];

  const weekendMorning = [
    { title: "Wake + Meditate", start: "10:00 AM", end: "10:30 AM", cat: "Wake + Meditate" },
    { title: "Breakfast",       start: "10:30 AM", end: "11:00 AM", cat: "Breakfast" },
    { title: "Study (DSA/SD)",  start: "11:00 AM", end: "12:00 PM", cat: "DSA" },
  ];

  if (["Monday","Tuesday","Wednesday","Thursday"].includes(day)) {
    return [
      ...weekdayMorning,
      { title: "Job Applications — Sprint #1", start: "12:00 PM", end: "1:30 PM", cat: "Job Applications" },
      { title: "Lunch",                         start: "1:30 PM", end: "2:00 PM",  cat: "Lunch" },
      { title: "Job Applications — Sprint #2", start: "2:00 PM",  end: "3:00 PM",  cat: "Job Applications" },
      { title: "Buffer + Commute",             start: "3:00 PM",  end: "4:00 PM",  cat: "Commute" },
      { title: "Work (Shift)",                  start: "4:00 PM",  end: "11:00 PM", cat: "Work" },
      { title: "Dinner / Wind-down",           start: "11:30 PM", end: "12:30 AM", cat: "Dinner / Wind-down" },
      { title: "Sleep",                         start: "12:30 AM", end: "8:30 AM",  cat: "Sleep" },
    ];
  }

  if (day === "Friday") {
    return [
      ...weekdayMorning,
      { title: "Job Applications — Deep Sprint", start: "12:00 PM", end: "2:00 PM", cat: "Job Applications" },
      { title: "Lunch",                          start: "2:00 PM",  end: "2:30 PM",  cat: "Lunch" },
      { title: "Chores & Errands + Relax",       start: "2:30 PM",  end: "4:00 PM",  cat: "Chores" },
      { title: "Gym",                            start: "4:00 PM",  end: "5:00 PM",  cat: "Gym" },
      { title: "Leisure / Social",               start: "5:00 PM",  end: "8:00 PM",  cat: "Leisure" },
      { title: "Sleep",                          start: "12:30 AM", end: "8:30 AM",  cat: "Sleep" },
    ];
  }

  if (day === "Saturday") {
    return [
      ...weekendMorning,
      { title: "Gym",            start: "12:30 PM", end: "1:30 PM", cat: "Gym" },
      { title: "Lunch",          start: "1:30 PM",  end: "2:00 PM",  cat: "Lunch" },
      { title: "Free / Optional",start: "2:00 PM",  end: "8:00 PM",  cat: "Free / Optional" },
      { title: "Sleep",          start: "12:30 AM", end: "10:00 AM", cat: "Sleep" },
    ];
  }

  if (day === "Sunday") {
    return [
      ...weekendMorning,
      { title: "Gym",            start: "12:30 PM", end: "1:30 PM", cat: "Gym" },
      { title: "Lunch",          start: "1:30 PM",  end: "2:00 PM",  cat: "Lunch" },
      { title: "Free / Optional",start: "2:00 PM",  end: "8:00 PM",  cat: "Free / Optional" },
      { title: "Sleep",          start: "12:30 AM", end: "10:00 AM", cat: "Sleep" },
    ];
  }

  return weekdayMorning.concat([{ title: "Sleep", start: "12:30 AM", end: "8:30 AM", cat: "Sleep" }]);
}

// ---------------------------------
// Helpers
// ---------------------------------
function parseTimeToMinutes(t) {
  const [time, ampm] = t.split(" ");
  let [hStr, mStr] = time.split(":");
  let h = Number(hStr);
  const m = Number(mStr);
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + m;
}
function isNowInRange(start, end, now) {
  if (end > start) return now >= start && now < end;
  return now >= start || now < end; // wrap
}
function currentBlockIndex(blocks, nowMinutes) {
  for (let i = 0; i < blocks.length; i++) {
    const s = parseTimeToMinutes(blocks[i].start);
    const e = parseTimeToMinutes(blocks[i].end);
    if (isNowInRange(s, e, nowMinutes)) return i;
  }
  const firstStart = parseTimeToMinutes(blocks[0].start);
  if (nowMinutes < firstStart) return 0;
  return blocks.length - 1;
}
function dayNameFromDate(d) {
  const idx = d.getDay();
  const map = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  return map[idx] ?? "Monday";
}
function localDateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}
function fmtLongDate(d = new Date()) {
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}
function blockId(b) { return `${b.title}|${b.start}-${b.end}`; }
function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  const timeStr = now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const tzIana = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  const tzName = new Intl.DateTimeFormat(undefined, { timeZoneName: "short" }).format(now);
  const abbrMatch = tzName.match(/([A-Z]{2,5})$/);
  const tzAbbr = abbrMatch ? abbrMatch[1] : "";
  const minutes = now.getHours() * 60 + now.getMinutes();
  return { timeStr, tzIana, tzAbbr, minutes };
}

// ---------------------------------
// UI
// ---------------------------------
function EventBlock({ e, dense=false, highlight=false, hero=false, muted=false }) {
  const palette = muted ? "bg-gray-50 border-gray-300 text-gray-700" : (CATS[e.cat] || "bg-gray-100 border-gray-300 text-gray-900");
  const pad = hero ? "px-6 py-6" : dense ? "px-3 py-2" : "px-4 py-3";
  const titleSize = hero ? "text-lg sm:text-xl" : dense ? "text-sm" : "text-sm sm:text-base";
  const layout = hero ? "flex flex-col items-center text-center gap-3" : "flex items-center gap-4";
  return (
    <div
      className={`w-full rounded-2xl border ${palette} ${pad} shadow-sm ${layout} ${highlight ? "ring-2 ring-gray-900/10" : ""}`}
    >
      <div className="flex-1">
        <div className={`font-semibold ${titleSize}`}>{e.title}</div>
        <div className="text-xs opacity-80">{e.start} – {e.end}</div>
      </div>
      {!hero && <div className="hidden sm:block text-[10px] uppercase tracking-wide opacity-70">{e.cat}</div>}
    </div>
  );
}

function Segmented({ mode, setMode }) {
  const btn = (m, label) => (
    <button
      onClick={() => setMode(m)}
      className={`px-3 py-1.5 text-sm rounded-lg border transition ${mode === m ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-300 text-gray-700"}`}
    >{label}</button>
  );
  return (
    <div className="inline-flex gap-1 p-1 rounded-xl bg-gray-100 border border-gray-200">
      {btn("compact", "Compact")}
      {btn("focus", "Focus")}
    </div>
  );
}

function FocusPanel({ blocks, nowMinutes }) {
  const idx = currentBlockIndex(blocks, nowMinutes);
  const curr = blocks[idx];
  const next = blocks[Math.min(blocks.length - 1, idx + 1)];
  return (
    <div className="space-y-4">
      <div>
        {curr && (
          <EventBlock
            e={curr}
            highlight
            hero
          />
        )}
      </div>
      <div className="pt-1">
        <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Up next</div>
        {next && (
          <EventBlock
            e={next}
            dense
            muted
          />
        )}
      </div>
    </div>
  );
}

export default function WeeklyPlanner() {
  // default to Focus as requested
  const [mode, setMode] = useState("focus");

  const schedules = useMemo(() => {
    const map = {};
    DAYS.forEach((d) => { map[d] = daySchedule(d); });
    return map;
  }, []);

  const [activeDate, setActiveDate] = useState(new Date());
  const activeDayName = useMemo(() => dayNameFromDate(activeDate), [activeDate]);
  const dateKey = useMemo(() => localDateKey(activeDate), [activeDate]);
  const isToday = dateKey === localDateKey();

  const { timeStr, tzIana, tzAbbr, minutes } = useClock();

  const blocks = schedules[activeDayName] || [];

  const shiftDate = (days) => {
    const d = new Date(activeDate);
    d.setDate(d.getDate() + days);
    setActiveDate(d);
  };

  const dense = mode === "compact";

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Sticky header with live clock */}
      <div className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b">
        <div className="mx-auto max-w-3xl p-4 sm:p-6 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold truncate">Today’s Planner</h1>
            <p className="text-xs sm:text-sm text-gray-600">{fmtLongDate(activeDate)} · {dayNameFromDate(activeDate)}</p>
            <p className="text-[11px] text-gray-500">Timezone: {tzIana}{tzAbbr ? ` (${tzAbbr})` : ""}</p>
          </div>
          <div className="text-right select-none" aria-live="polite" aria-atomic="true">
            <div className="font-semibold tabular-nums text-3xl sm:text-5xl leading-none">{isToday ? timeStr : "--:--"}</div>
            <div className="text-xs text-gray-500">{isToday ? "current time" : "viewing different day"}</div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl p-4 sm:p-6">
        {/* Controls */}
        <section className="print:hidden">
          <div className="w-full flex justify-center gap-2">
            <button onClick={() => shiftDate(-1)} className="rounded-lg border px-3 py-2 text-sm">← Yesterday</button>
            <button onClick={() => setActiveDate(new Date())} className="rounded-lg border px-3 py-2 text-sm">Today</button>
            <button onClick={() => shiftDate(1)} className="rounded-lg border px-3 py-2 text-sm">Tomorrow →</button>
          </div>
          <div className="mt-3 w-full flex justify-center items-center">
            <Segmented mode={mode} setMode={setMode} />
          </div>
        </section>

        {/* Views */}
        {mode !== "focus" ? (
          // Compact list
          <section className="mt-4 sm:mt-6">
            <div className={dense ? "space-y-1" : "space-y-3"}>
              {blocks.map((e, i) => (
                <EventBlock
                  key={i}
                  e={e}
                  dense={dense}
                />
              ))}
            </div>
          </section>
        ) : (
          // Focus hero
          <section className="mt-6">
            <FocusPanel blocks={blocks} nowMinutes={minutes} />
          </section>
        )}

        <footer className="mt-8 text-xs text-gray-500">
          Times are aligned to :00 / :30. <strong>Compact</strong> shows list view; <strong>Focus</strong> highlights current and next task.
          <div className="mt-1">Workdays are Mon–Thu 4:00–11:00 pm; Gym only Fri–Sun.</div>
        </footer>
      </div>

      {/* plain <style>, not styled-jsx */}
      <style>{`
        @media (max-width: 640px) {
          html, body { background: #fff; }
          button { touch-action: manipulation; }
        }
        @media print {
          html, body { background: #fff; }
          button { display: none !important; }
          a { text-decoration: none; }
        }
      `}</style>
    </div>
  );
}
