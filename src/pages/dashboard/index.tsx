import React from "react";
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

export default function DashboardPage() {
  const chartData = [
    { name: "Lun", heures: 6.5 },
    { name: "Mar", heures: 7.2 },
    { name: "Mer", heures: 8.0 },
    { name: "Jeu", heures: 6.8 },
    { name: "Ven", heures: 5.5 },
  ];

  return (
    <div className="p-6 md:p-10 w-full">
      <header className="mb-12">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
          Tableau de bord
        </h2>
        <p className="text-slate-400">
          Suivi et analyse de votre temps de travail.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Stats Cards */}
        <div className="bg-[#111111] p-6 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock size={64} />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Aujourdhui
            </h3>
            <div>
              <p className="text-5xl font-bold text-emerald-400 mb-2">
                8h <span className="text-3xl">15m</span>
              </p>
              <p className="text-sm text-emerald-500/80 flex items-center gap-1">
                <TrendingUp size={14} /> +2h par rapport à hier
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#111111] p-6 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CalendarDays size={64} />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Cette semaine
            </h3>
            <div>
              <p className="text-5xl font-bold text-indigo-400 mb-2">
                34h <span className="text-3xl">00m</span>
              </p>
              <p className="text-sm text-slate-500 flex items-center gap-1">
                Objectif: 35h
              </p>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-[#111111] p-6 rounded-2xl border border-white/5 shadow-xl lg:col-span-3 xl:col-span-1 min-h-[250px] flex flex-col">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-6">
            Répartition Hebdomadaire
          </h3>
          <div className="flex-1 w-full min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                width={"100%"}
                height={"100%"}
              >
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}h`}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.02)" }}
                  contentStyle={{
                    backgroundColor: "#1e1e1e",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#fff",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                  }}
                  itemStyle={{ color: "#818cf8" }}
                />
                <Bar
                  dataKey="heures"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* History */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white tracking-tight">
            Historique des sessions
          </h3>
          <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
            Tout voir
          </button>
        </div>
        <div className="bg-[#111111] rounded-2xl border border-white/5 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="p-5 font-semibold">Projet & Tâche</th>
                  <th className="p-5 font-semibold">Date</th>
                  <th className="p-5 font-semibold">Plage Horaire</th>
                  <th className="p-5 font-semibold text-right">Durée</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {mockTimeLogs.map((log) => {
                  const task = mockTasks.find((t) => t.id === log.taskId);
                  const project = mockProjects.find(
                    (p) => p.id === task?.projectId,
                  );
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="p-5">
                        <div className="font-medium text-white mb-1 group-hover:text-indigo-400 transition-colors">
                          {project?.name || "Inconnu"}
                        </div>
                        <div className="text-sm text-slate-500">
                          {task?.name || "Sans tâche"}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="inline-flex py-1 px-3 rounded-full bg-white/5 text-slate-300 text-sm border border-white/5">
                          {format(parseISO(log.startTime), "dd MMM yyyy")}
                        </div>
                      </td>
                      <td className="p-5 text-slate-400 font-mono text-sm">
                        {format(parseISO(log.startTime), "HH:mm")}{" "}
                        <span className="text-slate-600 px-1">→</span>{" "}
                        {log.endTime ? (
                          format(parseISO(log.endTime), "HH:mm")
                        ) : (
                          <span className="text-emerald-400 animate-pulse">
                            En cours
                          </span>
                        )}
                      </td>
                      <td className="p-5 text-right">
                        <span className="font-bold text-white text-lg">
                          {log.durationMinutes
                            ? `${Math.floor(log.durationMinutes / 60)}h ${(
                                log.durationMinutes % 60
                              )
                                .toString()
                                .padStart(2, "0")}m`
                            : "-"}
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
    </div>
  );
}
