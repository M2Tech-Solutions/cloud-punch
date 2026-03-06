import { useState, useEffect } from "react";
import { mockProjects, mockTasks } from "../mocks/data";
import { Play, Square, Timer } from "lucide-react";

export default function IndexPage() {
  const [projectId, setProjectId] = useState<number | null>(null);
  const [taskId, setTaskId] = useState<number | null>(null);
  const [isPunching, setIsPunching] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const storedState = localStorage.getItem("punch-master-timer");
    if (storedState) {
      const parsed = JSON.parse(storedState);
      if (parsed.isPunching && parsed.startTime) {
        setIsPunching(true);
        setStartTime(parsed.startTime);
        setProjectId(parsed.projectId);
        setTaskId(parsed.taskId);
      }
    }
  }, []);

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

  const handlePunch = () => {
    if (!isPunching) {
      if (!projectId || !taskId)
        return alert("Veuillez sélectionner un projet et une tâche.");
      const start = Date.now();
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

  const availableTasks = mockTasks.filter((t) => t.projectId === projectId);

  return (
    <div className="min-h-screen bg-slate-950 p-6 sm:p-8 md:p-12 font-sans w-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 shadow-inner">
            <Timer className="w-7 h-7 text-indigo-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 tracking-tight">
            Session de travail
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* Colonne Gauche : Paramètres de sélection */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col space-y-6">
          <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-lg flex-1">
            <h3 className="text-xl font-semibold text-white mb-6">
              Paramètres
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Projet
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-slate-950/80 border border-slate-700 text-slate-200 rounded-xl px-4 py-4 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={projectId || ""}
                    onChange={(e) => setProjectId(Number(e.target.value))}
                    disabled={isPunching}
                  >
                    <option value="" disabled className="text-slate-500">
                      Sélectionnez un projet...
                    </option>
                    {mockProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tâche
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-slate-950/80 border border-slate-700 text-slate-200 rounded-xl px-4 py-4 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
                    value={taskId || ""}
                    onChange={(e) => setTaskId(Number(e.target.value))}
                    disabled={isPunching || !projectId}
                  >
                    <option value="" disabled className="text-slate-500">
                      Sélectionnez une tâche...
                    </option>
                    {availableTasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {projectId && taskId && !isPunching && (
              <div className="mt-8 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-sm">
                Prêt à pointer. Cliquez sur Démarrer à droite.
              </div>
            )}
          </div>
        </div>

        {/* Colonne Droite : Chronomètre & Bouton */}
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl flex-1 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background glow décoratif qui s'active pendant le pointage */}
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-3xl blur-[120px] rounded-full pointer-events-none transition-colors duration-1000 ${
                isPunching ? "bg-indigo-600/10" : "bg-slate-800/20"
              }`}
            ></div>

            <div className="relative z-10 w-full flex flex-col items-center">
              <div
                className={`py-12 sm:py-20 px-8 rounded-[3rem] bg-slate-950/60 border ${
                  isPunching
                    ? "border-indigo-500/50 shadow-[0_0_60px_-15px_rgba(79,70,229,0.3)]"
                    : "border-slate-800/80"
                } mb-12 w-full max-w-3xl text-center backdrop-blur-sm transition-all duration-500`}
              >
                <div
                  className={`text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-mono font-light tracking-tight transition-colors duration-500 ${
                    isPunching ? "text-indigo-400" : "text-slate-100"
                  }`}
                >
                  {formatTime(elapsedTime)}
                </div>
                {isPunching && (
                  <div className="mt-8 flex items-center justify-center space-x-3 text-indigo-400 animate-pulse">
                    <div className="w-3 h-3 rounded-full bg-indigo-400"></div>
                    <span className="text-sm font-semibold uppercase tracking-widest">
                      En cours de pointage
                    </span>
                  </div>
                )}
              </div>

              <div className="w-full max-w-xl">
                <button
                  onClick={handlePunch}
                  className={`w-full py-5 sm:py-6 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold tracking-wide transition-all duration-300 transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                    isPunching
                      ? "bg-rose-500/10 text-rose-500 border border-rose-500/30 hover:bg-rose-500 hover:text-white hover:shadow-[0_0_30px_rgba(244,63,94,0.4)] focus:ring-rose-500"
                      : "bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-[0_0_30px_rgba(79,70,229,0.4)] focus:ring-indigo-500"
                  }`}
                >
                  {isPunching ? (
                    <>
                      <Square className="mr-3 fill-current" size={28} />{" "}
                      Terminer la session
                    </>
                  ) : (
                    <>
                      <Play className="mr-3 fill-current" size={28} /> Pointer
                      maintenant
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
