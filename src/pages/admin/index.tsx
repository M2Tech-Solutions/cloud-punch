import React, { useState, useEffect } from "react";
import { mockProjects, mockTasks } from "../../mocks/data";
import { GET as getEmployees } from "@api/employe";
import { FolderPlus, CheckSquare, Plus, Banknote } from "lucide-react";

export default function AdminPage() {
  const [newProject, setNewProject] = useState("");
  const [newTask, setNewTask] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<number | "">("");

  const [employees, setEmployees] = useState<any[]>([]);
  const [payPeriod, setPayPeriod] = useState("");
  // Mocking payment status state: { employeeId: { week1: status, week2: status, ... } }
  const [paymentsState, setPaymentsState] = useState<
    Record<string, Record<string, string>>
  >({});

  useEffect(() => {
    getEmployees().then((res: any) => {
      if (res && res.success && res.data) {
        const fetchedEmployees = Array.isArray(res.data)
          ? res.data
          : res.data.items || res.data.users || [];
        setEmployees(fetchedEmployees);

        // Initialize mock payments state
        const initialPayments: Record<string, Record<string, string>> = {};
        fetchedEmployees.forEach((emp: any) => {
          initialPayments[emp.id] = {
            1: "pending",
            2: "pending",
            3: "pending",
            4: "pending",
            5: "pending",
          };
        });
        setPaymentsState(initialPayments);
      }
    });
  }, []);

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.trim()) {
      alert(`Projet "${newProject}" ajouté (Mock)`);
      setNewProject("");
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim() && selectedProjectId) {
      alert(`Tâche "${newTask}" ajoutée au projet (Mock)`);
      setNewTask("");
    }
  };

  const handleUpdatePayment = (
    employeeId: string,
    week: string,
    currentStatus: string,
  ) => {
    if (!payPeriod) {
      alert(
        "Veuillez sélectionner une période (Mois/Année) avant de modifier un paiement.",
      );
      return;
    }

    const nextStatus = currentStatus === "paid" ? "pending" : "paid";
    setPaymentsState((prev) => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [week]: nextStatus,
      },
    }));

    // In a real app, this would be an API call
    console.log(
      `Updated payment for employee ${employeeId}, week ${week} in ${payPeriod} to ${nextStatus}`,
    );
  };

  return (
    <div className="p-6 md:p-10 w-full max-w-5xl mx-auto">
      <header className="mb-12">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
          Administration
        </h2>
        <p className="text-slate-400">
          Configuration de l'environnement de travail.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Project Form */}
        <div className="bg-[#111111] rounded-2xl border border-white/5 shadow-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-4">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <FolderPlus size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Nouveau Projet</h3>
          </div>

          <div className="p-6 flex-1">
            <form onSubmit={handleAddProject} className="flex flex-col h-full">
              <div className="mb-8 flex-1">
                <label className="block text-xs font-semibold uppercase tracking-wider mb-3 text-slate-400">
                  Nom du projet
                </label>
                <input
                  type="text"
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  className="w-full bg-white/5 p-4 rounded-xl border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-slate-600 transition-all outline-none"
                  placeholder="Ex: Refonte Site Web Corp"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full p-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all flex justify-center items-center gap-2 active:scale-[0.98] shadow-lg shadow-indigo-500/20"
              >
                <Plus size={18} /> Créer le projet
              </button>
            </form>
          </div>
        </div>

        {/* Task Form */}
        <div className="bg-[#111111] rounded-2xl border border-white/5 shadow-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <CheckSquare size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Nouvelle Tâche</h3>
          </div>

          <div className="p-6 flex-1">
            <form onSubmit={handleAddTask} className="flex flex-col h-full">
              <div className="mb-5">
                <label className="block text-xs font-semibold uppercase tracking-wider mb-3 text-slate-400">
                  Projet parent
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                  className="w-full bg-white/5 p-4 rounded-xl border border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white transition-all outline-none appearance-none"
                  required
                >
                  <option
                    value=""
                    disabled
                    className="bg-[#111] text-slate-500"
                  >
                    Sélectionnez un projet de rattachement...
                  </option>
                  {mockProjects.map((p) => (
                    <option
                      key={p.id}
                      value={p.id}
                      className="bg-[#111] text-white"
                    >
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-8 flex-1">
                <label className="block text-xs font-semibold uppercase tracking-wider mb-3 text-slate-400">
                  Nom de la tâche
                </label>
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  className="w-full bg-white/5 p-4 rounded-xl border border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-600 transition-all outline-none"
                  placeholder="Ex: Implémentation du panier"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full p-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all flex justify-center items-center gap-2 active:scale-[0.98] shadow-lg shadow-emerald-500/20"
              >
                <Plus size={18} /> Associer la tâche
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Payment Status Table */}
      <div className="bg-[#111111] rounded-2xl border border-white/5 shadow-xl overflow-hidden flex flex-col w-full mb-8">
        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <Banknote size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">
              Salaires & Paiements
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Période
            </span>
            <input
              type="month"
              value={payPeriod}
              onChange={(e) => setPayPeriod(e.target.value)}
              className="bg-white/5 p-2 px-4 rounded-xl border border-white/10 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white placeholder-slate-600 transition-all outline-none"
              required
            />
          </div>
        </div>

        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-4 text-sm font-semibold text-slate-300 whitespace-nowrap">
                  Employé
                </th>
                {[1, 2, 3, 4, 5].map((week) => (
                  <th
                    key={week}
                    className="p-4 text-sm text-center font-semibold text-slate-300"
                  >
                    Semaine {week}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    Chargement des employés ou aucun employé trouvé...
                  </td>
                </tr>
              ) : (
                employees.map((emp: any) => {
                  const empPayments = paymentsState[emp.id] || {
                    1: "pending",
                    2: "pending",
                    3: "pending",
                    4: "pending",
                    5: "pending",
                  };
                  return (
                    <tr
                      key={emp.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="p-4 font-medium text-white whitespace-nowrap">
                        {emp.name || emp.email || emp.id}
                      </td>
                      {[1, 2, 3, 4, 5].map((week) => {
                        const status = empPayments[week.toString()]!;
                        const isPaid = status === "paid";
                        return (
                          <td key={week} className="p-4 text-center">
                            <button
                              onClick={() =>
                                handleUpdatePayment(
                                  emp.id,
                                  week.toString(),
                                  status,
                                )
                              }
                              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                isPaid
                                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                                  : "bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20"
                              }`}
                            >
                              {isPaid ? "Payé" : "En attente"}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
