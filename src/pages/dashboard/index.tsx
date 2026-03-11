import React, { useEffect, useState } from "react";
import { mockTimeLogs, mockProjects, mockTasks } from "../../mocks/data";
import { format, parseISO } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Clock, CalendarDays } from "lucide-react";

const chartData = [
  { name: "Lun", heures: 6.5 },
  { name: "Mar", heures: 7.2 },
  { name: "Mer", heures: 8.0 },
  { name: "Jeu", heures: 6.8 },
  { name: "Ven", heures: 5.5 },
];

export default function DashboardPage() {
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
    <div className="p-6 md:p-8 w-full">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Tableau de bord
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Suivi et analyse de votre temps de travail.
        </p>
      </header>

      {/* Stat cards + chart row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-5">
        {/* Today */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-white/7 shadow-sm dark:shadow-none p-6 flex flex-col gap-3 relative overflow-hidden group">
          <div className="absolute top-4 right-4 text-slate-200 dark:text-white/5 group-hover:text-slate-300 dark:group-hover:text-white/8 transition-colors">
            <Clock size={56} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 relative z-10">
            Aujourd'hui
          </p>
          <div className="relative z-10">
            <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 leading-none">
              8h <span className="text-2xl font-semibold">15m</span>
            </p>
            <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-500 flex items-center gap-1">
              <TrendingUp size={14} /> +2h par rapport à hier
            </p>
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
            <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 leading-none">
              34h <span className="text-2xl font-semibold">00m</span>
            </p>
            <p className="mt-2 text-sm text-slate-400 dark:text-slate-500">
              Objectif : 35h
            </p>
          </div>
        </div>

        {/* Weekly chart */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-white/7 shadow-sm dark:shadow-none p-6 sm:col-span-2 xl:col-span-1 flex flex-col min-h-[200px]">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
            Répartition hebdomadaire
          </p>
          <div className="flex-1 min-h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
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

      {/* History */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-white/7 shadow-sm dark:shadow-none overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Historique des sessions
          </h3>
          <button className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
            Tout voir →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[560px]">
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {mockTimeLogs.map((log) => {
                const task = mockTasks.find((t) => t.id === log.taskId);
                const project = mockProjects.find(
                  (p) => p.id === task?.projectId,
                );
                return (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {project?.name || "Inconnu"}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                        {task?.name || "Sans tâche"}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center py-1 px-2.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-white/5">
                        {format(parseISO(log.startTime), "dd MMM yyyy")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-mono text-slate-500 dark:text-slate-400">
                      {format(parseISO(log.startTime), "HH:mm")}
                      <span className="mx-1.5 text-slate-300 dark:text-slate-600">
                        →
                      </span>
                      {log.endTime ? (
                        format(parseISO(log.endTime), "HH:mm")
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 animate-pulse">
                          En cours
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                        {log.durationMinutes
                          ? `${Math.floor(log.durationMinutes / 60)}h ${(
                              log.durationMinutes % 60
                            )
                              .toString()
                              .padStart(2, "0")}m`
                          : "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
