import * as React from "react";
import { useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  Calendar as CalendarIcon,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import {
  getEventsByDay,
  createEvent,
  deleteEvent as apiDeleteEvent,
  updateEvent,
  getCalendarDays,
} from "@/features/events/api";
import type { EventItem } from "@/features/events/types";
import DateTimePopover from "@/components/ui/events/DateTimePopover";
import MonthCalendar from "@/components/ui/events/MonthCalendar";

/* ----------------------------- helpers ----------------------------- */
const fmt2 = (n: number) => String(n).padStart(2, "0");
function fmtHuman(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}
function isoDateOnly(d: Date) {
  return `${d.getFullYear()}-${fmt2(d.getMonth() + 1)}-${fmt2(d.getDate())}`;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function isoAt(d: Date, hh = 10, mm = 0) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), hh, mm, 0).toISOString();
}
function fmtVerboseFromISO(iso: string) {
  const x = new Date(iso);
  const date = x.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${fmt2(x.getHours())}:${fmt2(x.getMinutes())} • ${date}`;
}

/* ----------------------------- component ----------------------------- */
export default function EventsView() {
  const [sp, setSp] = useSearchParams();
  const iso = sp.get("date");
  const date = React.useMemo(() => (iso ? new Date(iso) : new Date()), [iso]);

  const [items, setItems] = React.useState<EventItem[]>([]);
  const [loading, setLoading] = React.useState(false);

  // CREATE form
  const [title, setTitle] = React.useState("");
  const [whenISO, setWhenISO] = React.useState<string | null>(isoAt(date, 10, 0));
  const [openCreatePop, setOpenCreatePop] = React.useState(false);
  const createBtnRef = React.useRef<HTMLButtonElement>(null);

  // EDIT (inline modal)
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editTitle, setEditTitle] = React.useState("");
  const [editWhenISO, setEditWhenISO] = React.useState<string | null>(null);
  const [openEditPop, setOpenEditPop] = React.useState(false);
  const editBtnRef = React.useRef<HTMLButtonElement>(null);

  // CALENDAR (u desnom boxu)
  const [calMonth, setCalMonth] = React.useState<Date>(startOfMonth(date));
  const [marks, setMarks] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    setWhenISO(isoAt(date, 10, 0));
    setCalMonth(startOfMonth(date)); // sync meseca u kalendaru kada se menja izabrani dan
  }, [date]);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const list = await getEventsByDay(isoDateOnly(date));
      list.sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at));
      setItems(list);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load events.");
    } finally {
      setLoading(false);
    }
  }, [date]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  // markeri za kalendar (dani koji imaju event)
  React.useEffect(() => {
    const from = isoDateOnly(calMonth);
    const to = isoDateOnly(addMonths(calMonth, 1)); // [from, to)
    getCalendarDays(from, to)
      .then((ds) => setMarks(new Set(ds)))
      .catch((e) => console.error(e));
  }, [calMonth]);

  const setDateInURL = (d: Date) => {
    const params = new URLSearchParams(sp);
    params.set("date", isoDateOnly(d));
    setSp(params, { replace: false });
  };

  const changeDay = (delta: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDateInURL(d);
  };
  const gotoToday = () => setDateInURL(new Date());

  /* ----------------------------- create ----------------------------- */
  const onCreate = async () => {
    if (!title.trim()) return toast.message("Please enter a title.");
    if (!whenISO) return toast.message("Please pick date & time.");
    try {
      await createEvent({ title: title.trim(), starts_at: whenISO });
      setTitle("");
      setWhenISO(isoAt(date, 10, 0));
      toast.success("Event created.");
      refresh();
      // osveži markere (možda je kreiran drugi dan)
      const from = isoDateOnly(calMonth);
      const to = isoDateOnly(addMonths(calMonth, 1));
      getCalendarDays(from, to).then((ds) => setMarks(new Set(ds)));
    } catch (e) {
      console.error(e);
      toast.error("Failed to create event.");
    }
  };

  /* ----------------------------- delete ----------------------------- */
  const onDelete = async (id: number) => {
    try {
      await apiDeleteEvent(id);
      toast.success("Event removed.");
      refresh();
      const from = isoDateOnly(calMonth);
      const to = isoDateOnly(addMonths(calMonth, 1));
      getCalendarDays(from, to).then((ds) => setMarks(new Set(ds)));
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove event.");
    }
  };

  /* ------------------------------ edit ------------------------------ */
  const startEdit = (ev: EventItem) => {
    setEditingId(ev.id);
    setEditTitle(ev.title);
    setEditWhenISO(ev.starts_at);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditWhenISO(null);
    setOpenEditPop(false);
  };
  const saveEdit = async () => {
    if (editingId == null || !editTitle.trim() || !editWhenISO) {
      toast.message("Title and date/time are required.");
      return;
    }
    try {
      await updateEvent(editingId, { title: editTitle.trim(), starts_at: editWhenISO });
      toast.success("Event updated.");
      cancelEdit();
      refresh();
      const from = isoDateOnly(calMonth);
      const to = isoDateOnly(addMonths(calMonth, 1));
      getCalendarDays(from, to).then((ds) => setMarks(new Set(ds)));
    } catch (e) {
      console.error(e);
      toast.error("Failed to update event.");
    }
  };

  return (
    <div className="mx-auto max-w-[1100px] p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Events</h1>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md border border-zinc-200 px-2 py-1 text-sm hover:bg-zinc-50"
            onClick={gotoToday}
          >
            Today
          </button>
          <div className="flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-1">
            <button className="rounded p-1 hover:bg-zinc-100" onClick={() => changeDay(-1)} title="Previous day">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="px-2 text-sm font-medium text-zinc-800">{fmtHuman(date)}</div>
            <button className="rounded p-1 hover:bg-zinc-100" onClick={() => changeDay(1)} title="Next day">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* LEFT: lista sa full-box overlay-om i skrolom */}
        <div className="md:col-span-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-medium text-zinc-900">Events on this day</div>
            {!!items.length && (
              <div className="text-xs text-zinc-500">
                {items.length} {items.length === 1 ? "event" : "events"}
              </div>
            )}
          </div>

          {/* wrapper da overlay pokrije ceo box ispod headera */}
          <div className="relative min-h-[420px]">
            {/* EMPTY overlay */}
            {!loading && items.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50 text-center">
                <CalendarIcon className="mb-2 h-6 w-6 text-zinc-400" />
                <div className="text-sm font-medium text-zinc-700">No events yet</div>
                <div className="text-xs text-zinc-500">
                  Use the calendar to pick a day and add an event on the right.
                </div>
              </div>
            )}

            {/* Loading overlay */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-500">
                Loading…
              </div>
            )}

            {/* Lista (vidi se samo kada ima stavki) */}
            {!loading && items.length > 0 && (
              <div className="max-h-[420px] overflow-y-auto pr-1">
                <ul className="divide-y divide-zinc-100">
                  {items.map((ev) => (
                    <li key={ev.id} className="flex items-start justify-between py-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-zinc-900">{ev.title}</div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                          <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
                          <span>{fmtVerboseFromISO(ev.starts_at)}</span>
                        </div>
                      </div>
                      <div className="mt-1 flex items-center gap-1">
                        <button
                          className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
                          onClick={() => startEdit(ev)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
                          onClick={() => onDelete(ev.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Edit modal */}
                      {editingId === ev.id && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
                          <div className="w-full max-w-lg rounded-xl border border-zinc-200 bg-white p-4 shadow-xl">
                            <div className="mb-3 text-sm font-medium text-zinc-900">Edit event</div>
                            <div className="flex flex-col gap-3">
                              <input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.currentTarget.value)}
                                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20"
                                placeholder="Title"
                              />
                              <button
                                ref={editBtnRef}
                                type="button"
                                onClick={() => setOpenEditPop(true)}
                                className="flex w-full items-center justify-between rounded-md border border-zinc-300 bg-white px-3 py-2 text-left text-sm hover:bg-zinc-50"
                              >
                                <span className={editWhenISO ? "text-zinc-800" : "text-zinc-400"}>
                                  {editWhenISO ? fmtVerboseFromISO(editWhenISO) : "Pick date & time"}
                                </span>
                                <CalendarIcon className="h-4 w-4 shrink-0 text-zinc-500" />
                              </button>

                              <div className="flex justify-end gap-2">
                                <button
                                  className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm hover:bg-zinc-100"
                                  onClick={cancelEdit}
                                >
                                  Cancel
                                </button>
                                <button
                                  className="rounded-md bg-cyan-500 px-3 py-1.5 text-sm font-medium text-white hover:brightness-95 disabled:opacity-60"
                                  onClick={saveEdit}
                                  disabled={!editTitle.trim() || !editWhenISO}
                                >
                                  Save
                                </button>
                              </div>
                            </div>

                            <DateTimePopover
                              open={openEditPop}
                              anchorRef={editBtnRef}
                              value={editWhenISO}
                              onClose={() => setOpenEditPop(false)}
                              onSave={(r) => setEditWhenISO(r.iso)}
                            />
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: jedan box = Calendar (gore) + Add event (dole) */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          {/* Kalendar */}
          <MonthCalendar
            month={calMonth}
            selected={date}
            marks={marks}
            onSelect={(d) => setDateInURL(d)}
            onMonthChange={(m) => setCalMonth(m)}
          />

          {/* separator */}
          <div className="my-4 h-px w-full bg-zinc-100" />

          {/* Add event forma */}
          <div className="mb-3 text-sm font-medium text-zinc-900">Add event</div>
          <div className="space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:ring-2 focus:ring-cyan-500/20"
              placeholder="Title"
            />

            <button
              ref={createBtnRef}
              type="button"
              onClick={() => setOpenCreatePop(true)}
              className="flex w-full items-center justify-between rounded-lg border border-zinc-300 bg-white px-3 py-2 text-left text-sm hover:bg-zinc-50"
            >
              <span className={whenISO ? "text-zinc-800" : "text-zinc-400"}>
                {whenISO
                  ? (() => {
                      const d = new Date(whenISO);
                      const dt = d.toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                      return `${fmt2(d.getHours())}:${fmt2(d.getMinutes())} – ${dt}`;
                    })()
                  : "Pick date & time"}
              </span>
              <CalendarIcon className="h-4 w-4 shrink-0 text-zinc-500" />
            </button>

            <DateTimePopover
              open={openCreatePop}
              anchorRef={createBtnRef}
              value={whenISO}
              onClose={() => setOpenCreatePop(false)}
              onSave={(r) => setWhenISO(r.iso)}
            />

            <button
              type="button"
              className="h-10 w-full rounded-full bg-cyan-500 text-white shadow-sm hover:brightness-95 disabled:opacity-60"
              onClick={onCreate}
              disabled={!title.trim() || !whenISO}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
