import { useState, useEffect } from "react";
import { Play, Square, Timer } from "lucide-react";
import { useProjects } from "@hooks/project";
import { GET as getTasks } from "@api/task";
import { GET as getPunchState } from "@api/punch";
import { PUT as updateWorktime } from "@api/worktime";
import type { TaskType } from "@db/schema";
import { useAuth } from "@auth";

export default function IndexPage() {
  const [projectId, setProjectId] = useState<number | null>(null);
  const [taskId, setTaskId] = useState<number | null>(null);
  const [isPunching, setIsPunching] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [tasks, setTasks] = useState<TaskType[]>([]);

  const { projects, loading: loadingProjects } = useProjects();
  const auth = useAuth();
  useEffect(() => {
    auth.addInitializationListener("punch-page", (client) => {
      if (!client.isAuthenticated) return;
      getPunchState().then((res) => {
        if (res.success && res.record) {
          const { projectId, taskId, punchIn } = res.record;
          setProjectId(projectId);
          setTaskId(taskId);
          setStartTime(punchIn);
          setIsPunching(!!punchIn);
        }
      });
    });
  }, []);

  useEffect(() => {
    if (!projectId) {
      setTasks([]);
      setTaskId(null);
      return;
    }
    getTasks(projectId).then((res) => setTasks(res as TaskType[]));
  }, [projectId]);

  useEffect(() => {
    let interval: any;
    if (isPunching && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [isPunching, startTime]);

  const handlePunch = async () => {
    if (!isPunching) {
      if (!projectId || !taskId)
        return alert("Veuillez sélectionner un projet et une tâche.");
      const start = Date.now();
      const result = await updateWorktime({
        action: "punch-in",
        payload: {
          status: "active",
          project: projectId,
          task: taskId,
          date: start,
        },
      });
      if (!result.success) {
        return alert(result.error || "Erreur lors du pointage.");
      }
      setStartTime(start);
      setIsPunching(true);
      localStorage.setItem(
        "punch-master-timer",
        JSON.stringify({
          isPunching: true,
          startTime: start,
          projectId,
          taskId,
        }),
      );
    } else {
      const result = await updateWorktime({ action: "punch-out", payload: {} });
      if (!result?.success) {
        return alert(result?.error || "Erreur lors de l'arrêt du pointage.");
      }
      setIsPunching(false);
      setStartTime(null);
      localStorage.removeItem("punch-master-timer");
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-6 md:p-8 w-full flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-center gap-4">
        <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
          <Timer className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Session de travail
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sélectionnez un projet et démarrez votre pointage.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Settings */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/7 rounded-2xl p-6 shadow-sm dark:shadow-none h-full flex flex-col gap-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Paramètres
            </h3>

            <div className="flex flex-col gap-5 flex-1">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Projet
                </label>
                <select
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50"
                  value={projectId || ""}
                  onChange={(e) => setProjectId(Number(e.target.value))}
                  disabled={isPunching || loadingProjects}
                >
                  <option
                    value=""
                    disabled
                    className="dark:bg-zinc-800 text-slate-400"
                  >
                    Sélectionnez un projet...
                  </option>
                  {projects.map((p) => (
                    <option
                      key={p.id}
                      value={p.id}
                      className="dark:bg-zinc-800 dark:text-slate-200"
                    >
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Tâche
                </label>
                <select
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-200 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50"
                  value={taskId || ""}
                  onChange={(e) => setTaskId(Number(e.target.value))}
                  disabled={isPunching || !projectId}
                >
                  <option
                    value=""
                    disabled
                    className="dark:bg-zinc-800 text-slate-400"
                  >
                    Sélectionnez une tâche...
                  </option>
                  <option
                    value={-1}
                    className="dark:bg-zinc-800 dark:text-slate-200"
                  >
                    Aucune tâche (optionnel)
                  </option>
                  {tasks.map((t) => (
                    <option
                      key={t.id}
                      value={t.id}
                      className="dark:bg-zinc-800 dark:text-slate-200"
                    >
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {projectId && taskId && !isPunching && (
              <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-sm">
                Prêt à pointer. Cliquez sur Démarrer.
              </div>
            )}
          </div>
        </div>

        {/* Right: Timer */}
        <div className="lg:col-span-8 xl:col-span-9">
          <div
            className={`bg-white dark:bg-zinc-900 border rounded-2xl shadow-sm dark:shadow-none flex flex-col items-center justify-center p-8 sm:p-12 min-h-72 relative overflow-hidden transition-all duration-500 ${
              isPunching
                ? "border-indigo-200 dark:border-indigo-500/30"
                : "border-slate-200 dark:border-white/7"
            }`}
          >
            {/* Decorative glow (dark only) */}
            <div
              className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
                isPunching ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-600/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full flex flex-col items-center gap-10">
              {/* Timer display */}
              <div
                className={`font-mono font-light tracking-tight transition-colors duration-500 text-6xl sm:text-8xl md:text-9xl ${
                  isPunching
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-900 dark:text-slate-100"
                }`}
              >
                {formatTime(elapsedTime)}
              </div>

              {isPunching && (
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-xs font-semibold uppercase tracking-widest">
                    En cours de pointage
                  </span>
                </div>
              )}

              {/* Action button */}
              <div className="w-full max-w-sm">
                <button
                  onClick={handlePunch}
                  className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 text-base font-bold tracking-wide transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isPunching
                      ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 hover:bg-rose-500 hover:text-white hover:border-rose-500 focus:ring-rose-400 focus:ring-offset-white dark:focus:ring-offset-zinc-900"
                      : "bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-500 focus:ring-offset-white dark:focus:ring-offset-zinc-900 shadow-md shadow-indigo-500/20"
                  }`}
                >
                  {isPunching ? (
                    <>
                      <Square className="fill-current" size={20} />
                      Terminer la session
                    </>
                  ) : (
                    <>
                      <Play className="fill-current" size={20} />
                      Pointer maintenant
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
