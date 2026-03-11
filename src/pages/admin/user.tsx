import { GET as getUser } from "@api/admin/user";
import { PATCH as updateSalary } from "@api/admin/salary";
import { GET as getUserWorktime } from "@api/admin/user-worktime";
import { useParams } from "@hooks/params";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  format,
  differenceInMinutes,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
} from "date-fns";
import { navigate } from "@hooks/navigate";
import {
  Clock,
  CalendarDays,
  ArrowLeft,
  TrendingUp,
  BadgeDollarSign,
  LogIn,
  LogOut,
} from "lucide-react";

export default function UserPage() {
  const { id } = useParams<{ id: string }>();
  const [userData, setUserData] = useState<any>(null);
  const [worktimes, setWorktimes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [salary, setSalary] = useState<number | string>("");
  const [salaryStatus, setSalaryStatus] = useState("");
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
    if (!id) return;
    Promise.all([getUser(id), getUserWorktime(id)]).then(
      ([userRes, worktimeRes]) => {
        if (userRes.error) setError(userRes.error);
        else {
          setUserData(userRes.user);
          setSalary((userRes.user?.session_private?.salary as number) || 0);
        }
        if (worktimeRes.error) {
          if (!error) setError(worktimeRes.error);
        } else {
          setWorktimes(worktimeRes.worktimes || []);
        }
      },
    );
  }, [id]);

  const handleUpdateSalary = async () => {
    setSalaryStatus("Updating...");
    const res = await updateSalary({ userId: id!, salary: Number(salary) });
    if (!res.success) {
      setSalaryStatus("Error: " + res.message);
    } else {
      setSalaryStatus("Succès !");
      setTimeout(() => setSalaryStatus(""), 2000);
    }
  };

  const tooltipStyle = isDark
    ? {
        backgroundColor: "#18181b",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
        color: "#f1f5f9",
      }
    : {
        backgroundColor: "#fff",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: "10px",
        color: "#0f172a",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.08)",
      };

  // ── Guard: redirect to admin if no id ────────────────────────────────────
  if (!id) {
    navigate("/admin");
    return null;
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 w-full max-w-5xl mx-auto">
        <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
          Erreur : {error}
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-6 md:p-8 w-full max-w-5xl mx-auto">
        <div className="flex flex-col gap-5">
          <div className="h-14 w-64 bg-slate-200 dark:bg-white/5 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 bg-slate-200 dark:bg-white/5 rounded-2xl animate-pulse"
              />
            ))}
          </div>
          <div className="h-72 bg-slate-200 dark:bg-white/5 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // ── Metrics ───────────────────────────────────────────────────────────────
  const userSalary = userData.session_private?.salary || 0;
  const now = new Date();
  const startOfWk = startOfWeek(now, { weekStartsOn: 1 });
  const endOfWk = endOfWeek(now, { weekStartsOn: 1 });

  let totalMinutes = 0;
  let weeklyMinutes = 0;
  let lastPunchIn: Date | null = null;
  let lastPunchOut: Date | null = null;
  const chartDataMap: Record<string, number> = {};

  worktimes.forEach((wt: any) => {
    const pIn = wt.punchIn ? new Date(wt.punchIn) : null;
    const pOut = wt.punchOut ? new Date(wt.punchOut) : null;
    if (pIn && pOut) {
      const duration = differenceInMinutes(pOut, pIn);
      totalMinutes += duration;
      if (isWithinInterval(pIn, { start: startOfWk, end: endOfWk }))
        weeklyMinutes += duration;
      const dayStr = format(pIn, "yyyy-MM-dd");
      chartDataMap[dayStr] = (chartDataMap[dayStr] || 0) + duration / 60;
    }
    if (pIn && (!lastPunchIn || pIn > lastPunchIn)) lastPunchIn = pIn;
    if (pOut && (!lastPunchOut || pOut > lastPunchOut)) lastPunchOut = pOut;
  });

  const chartData = Object.keys(chartDataMap)
    .sort()
    .map((date) => ({ date, hours: Number(chartDataMap[date]!.toFixed(2)) }));

  const userName = userData.name || userData.email || "Utilisateur";
  const initials = userName
    .split(" ")
    .map((n: string) => n[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const statCards = [
    {
      label: "Heures totales",
      value: `${(totalMinutes / 60).toFixed(1)}h`,
      icon: <Clock size={16} />,
      iconBg: "bg-indigo-50 dark:bg-indigo-500/10",
      iconColor: "text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Cette semaine",
      value: `${(weeklyMinutes / 60).toFixed(1)}h`,
      icon: <CalendarDays size={16} />,
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Dernier pointage",
      value: lastPunchIn ? format(lastPunchIn, "d MMM, HH:mm") : "Jamais",
      icon: <LogIn size={16} />,
      iconBg: "bg-amber-50 dark:bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Dernier départ",
      value: lastPunchOut ? format(lastPunchOut, "d MMM, HH:mm") : "Jamais",
      icon: <LogOut size={16} />,
      iconBg: "bg-rose-50 dark:bg-rose-500/10",
      iconColor: "text-rose-600 dark:text-rose-400",
    },
  ];

  return (
    <div className="p-6 md:p-8 w-full max-w-6xl mx-auto flex flex-col gap-6">
      {/* Back + header */}
      <div>
        <a
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={15} />
          Retour aux employés
        </a>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm shrink-0">
            {initials}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {userName}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {userData.email}
            </p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon, iconBg, iconColor }) => (
          <div
            key={label}
            className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-white/7 shadow-sm dark:shadow-none p-5"
          >
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-lg ${iconBg} ${iconColor} mb-3`}
            >
              {icon}
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              {label}
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Chart + Salary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-white/7 shadow-sm dark:shadow-none overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <TrendingUp size={16} />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Heures travaillées
            </h3>
          </div>
          <div className="p-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={
                    isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"
                  }
                />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{
                    fill: isDark
                      ? "rgba(255,255,255,0.03)"
                      : "rgba(0,0,0,0.04)",
                  }}
                />
                <Bar dataKey="hours" fill="#6366f1" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Salary */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-white/7 shadow-sm dark:shadow-none overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <BadgeDollarSign size={16} />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Salaire
            </h3>
          </div>

          <div className="p-5 flex flex-col gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Taux horaire
              </label>
              <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 focus-within:border-amber-500 transition-colors">
                <span className="inline-flex items-center px-3 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 text-sm border-r border-slate-200 dark:border-white/10">
                  $
                </span>
                <input
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="flex-1 bg-white dark:bg-transparent px-4 py-2.5 text-slate-900 dark:text-white outline-none text-sm"
                />
              </div>
            </div>

            <button
              onClick={handleUpdateSalary}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              Mettre à jour
            </button>

            {salaryStatus && (
              <p
                className={`text-xs text-center font-medium ${
                  salaryStatus.includes("Error")
                    ? "text-red-600 dark:text-red-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {salaryStatus}
              </p>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Paie hebdo. estimée
                </p>
                <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                  ${((weeklyMinutes / 60) * Number(userSalary)).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Paie totale estimée
                </p>
                <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                  ${((totalMinutes / 60) * Number(userSalary)).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
