import { useEffect, useMemo, useState, type ReactNode } from "react";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock,
  TrendingUp,
} from "lucide-react";
import { GET as getMyWorktime } from "@api/worktime";
import { GET as getProjects } from "@api/projects";
import { GET as getTasks } from "@api/admin/task";
import type { ProjectType, TaskType, WorktimeType } from "@db/schema";

// ─── Helpers ────────────────────────────────────────────────────────────────

function sessionDuration(wt: WorktimeType): number {
  if (!wt.punchIn) return 0;
  return (wt.punchOut ?? Date.now()) - wt.punchIn;
}

function isToday(ts: number): boolean {
  const d = new Date(ts);
  const n = new Date();
  return (
    d.getDate() === n.getDate() &&
    d.getMonth() === n.getMonth() &&
    d.getFullYear() === n.getFullYear()
  );
}

function currentWeekStart(): number {
  const d = new Date();
  const day = d.getDay();
  const mon = new Date(d);
  mon.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  mon.setHours(0, 0, 0, 0);
  return mon.getTime();
}

function formatDuration(ms: number): string {
  const totalMins = Math.floor(ms / 60000);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const WEEK_GOAL_H = 35;

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  active: {
    label: "Actif",
    className:
      "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
  },
  pending: {
    label: "En attente",
    className:
      "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
  },
  approved: {
    label: "Approuvé",
    className:
      "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20",
  },
  rejected: {
    label: "Refusé",
    className:
      "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20",
  },
  fulfilled: {
    label: "Traité",
    className:
      "bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10",
  },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.pending;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${s?.className}`}
    >
      {s?.label}
    </span>
  );
}

function SkeletonRow() {
  return (
    <div className="px-5 py-4 flex items-center gap-4">
      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 animate-pulse shrink-0" />
      <div className="flex flex-col gap-1.5 flex-1">
        <div className="h-3.5 w-32 rounded-full bg-slate-100 dark:bg-white/5 animate-pulse" />
        <div className="h-3 w-20 rounded-full bg-slate-100 dark:bg-white/5 animate-pulse" />
      </div>
      <div className="h-3.5 w-20 rounded-full bg-slate-100 dark:bg-white/5 animate-pulse" />
      <div className="h-3.5 w-24 rounded-full bg-slate-100 dark:bg-white/5 animate-pulse" />
      <div className="h-3.5 w-16 rounded-full bg-slate-100 dark:bg-white/5 animate-pulse ml-auto" />
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [worktimes, setWorktimes] = useState<WorktimeType[]>([]);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(
    typeof document !== "undefined"
      ? document.documentElement.getAttribute("data-theme") !== "light"
      : true,
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(
        document.documentElement.getAttribute("data-theme") !== "light",
      );
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    Promise.all([getMyWorktime(), getProjects()])
      .then(([wtRes, projectList]) => {
        const wts = wtRes.success ? wtRes.workingHours : [];
        setWorktimes(wts);
        setProjects(projectList);
        const projectIds = [
          ...new Set(wts.map((w) => w.project).filter(Boolean) as number[]),
        ];
        return Promise.all(projectIds.map(getTasks));
      })
      .then((taskArrays) => setTasks(taskArrays.flat() as TaskType[]))
      .finally(() => setLoading(false));
  }, []);

  const weekStart = useMemo(() => currentWeekStart(), []);

  const todayMs = useMemo(
    () =>
      worktimes
        .filter((w) => w.punchIn && isToday(w.date))
        .reduce((sum, w) => sum + sessionDuration(w), 0),
    [worktimes],
  );

  const weekMs = useMemo(
    () =>
      worktimes
        .filter((w) => w.punchIn && w.date >= weekStart)
        .reduce((sum, w) => sum + sessionDuration(w), 0),
    [worktimes, weekStart],
  );

  const weeklyChart = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => ({
      name: DAY_LABELS[i],
      heures: 0,
    }));
    for (const w of worktimes) {
      if (!w.punchIn || w.date < weekStart) continue;
      const idx = Math.floor((w.date - weekStart) / 86400000);
      if (idx >= 0 && idx < 7) {
        days[idx]!.heures = +(
          days[idx]!.heures +
          sessionDuration(w) / 3600000
        ).toFixed(2);
      }
    }
    return days;
  }, [worktimes, weekStart]);

  const recentSessions = useMemo(
    () =>
      [...worktimes]
        .filter((w) => w.punchIn)
        .sort((a, b) => (b.punchIn ?? 0) - (a.punchIn ?? 0))
        .slice(0, 10),
    [worktimes],
  );

  const activeSession = worktimes.find((w) => w.status === "active");
  const weekProgress = Math.min((weekMs / 3600000 / WEEK_GOAL_H) * 100, 100);

  const tooltipStyle = isDark
    ? {
        backgroundColor: "#18181b",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "12px",
        color: "#f1f5f9",
        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.5)",
      }
    : {
        backgroundColor: "#fff",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: "12px",
        color: "#0f172a",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.08)",
      };

  return (
    <div className="p-6 md:p-8 w-full flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Tableau de bord
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Suivi et analyse de votre temps de travail.
          </p>
        </div>
        {activeSession && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Session active
          </div>
        )}
      </header>

      {/* Stat cards + chart */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* Today */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-white/7 shadow-sm dark:shadow-none p-6 flex flex-col gap-3 relative overflow-hidden group">
          <div className="absolute top-4 right-4 text-slate-200 dark:text-white/5 group-hover:text-slate-300 dark:group-hover:text-white/8 transition-colors">
            <Clock size={56} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 relative z-10">
            Aujourd'hui
          </p>
          <div className="relative z-10">
            {loading ? (
              <div className="h-10 w-28 rounded-full bg-slate-100 dark:bg-white/5 animate-pulse" />
            ) : todayMs > 0 ? (
              <>
                <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 leading-none">
                  {formatDuration(todayMs)}
                </p>
                <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-500 flex items-center gap-1">
                  <TrendingUp size={14} />
                  {(todayMs / 3600000).toFixed(1)}h enregistrées
                </p>
              </>
            ) : (
              <p className="text-2xl font-semibold text-slate-400 dark:text-slate-500 leading-none">
                Pas encore pointé
              </p>
            )}
          </div>
        </div>

        {/* This week */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-white/7 shadow-sm dark:shadow-none p-6 flex flex-col gap-3 relative overflow-hidden group">
          <div className="absolute top-4 right-4 text-slate-200 dark:text-white/5 group-hover:text-slate-300 dark:group-hover:text-white/8 transition-colors">
            <CalendarDays size={56} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 relative z-10">
            Cette semaine
          </p>
          <div className="relative z-10">
            {loading ? (
              <div className="h-10 w-28 rounded-full bg-slate-100 dark:bg-white/5 animate-pulse" />
            ) : (
              <>
                <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 leading-none">
                  {weekMs > 0 ? formatDuration(weekMs) : "0h"}
                </p>
                <div className="mt-3 flex flex-col gap-1.5">
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                      style={{ width: `${weekProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {(weekMs / 3600000).toFixed(1)}h / {WEEK_GOAL_H}h objectif
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Weekly chart */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-white/7 shadow-sm dark:shadow-none p-6 sm:col-span-2 xl:col-span-1 flex flex-col min-h-[200px]">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
            Répartition hebdomadaire
          </p>
          <div className="flex-1 min-h-35">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyChart}
                margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}h`}
                />
                <Tooltip
                  cursor={{
                    fill: isDark
                      ? "rgba(255,255,255,0.03)"
                      : "rgba(0,0,0,0.04)",
                  }}
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: "#818cf8" }}
                  formatter={(v) => [<span>{v}h</span>, <span>Heures</span>]}
                />
                <Bar
                  dataKey="heures"
                  fill="#6366f1"
                  radius={[5, 5, 0, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Session history */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-white/7 shadow-sm dark:shadow-none overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Historique des sessions
          </h3>
          {!loading && (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {recentSessions.length} session
              {recentSessions.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {loading ? (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        ) : recentSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 dark:text-slate-600">
            <CheckCircle2 size={36} strokeWidth={1.5} />
            <p className="text-sm">Aucune session enregistrée.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-145">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Projet & Tâche
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Date
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Plage horaire
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-right">
                    Durée
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-right">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {recentSessions.map((wt) => {
                  const project = projects.find((p) => p.id === wt.project);
                  const task = tasks.find((t) => t.id === wt.task);
                  const dur = sessionDuration(wt);
                  return (
                    <tr
                      key={wt.id}
                      className="hover:bg-slate-50 dark:hover:bg-white/2 transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                            <Briefcase
                              size={13}
                              className="text-indigo-500 dark:text-indigo-400"
                            />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {project?.name ?? `Projet #${wt.project}`}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                              {task?.name ?? "Sans tâche"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center py-1 px-2.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-white/5">
                          {format(new Date(wt.date), "dd MMM yyyy")}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-mono text-slate-500 dark:text-slate-400">
                        {wt.punchIn
                          ? format(new Date(wt.punchIn), "HH:mm")
                          : "—"}
                        <span className="mx-1.5 text-slate-300 dark:text-slate-600">
                          →
                        </span>
                        {wt.status === "active" ? (
                          <span className="text-emerald-600 dark:text-emerald-400 animate-pulse font-sans text-xs">
                            En cours
                          </span>
                        ) : wt.punchOut ? (
                          format(new Date(wt.punchOut), "HH:mm")
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                          {dur > 0 ? formatDuration(dur) : "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <StatusBadge status={wt.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
