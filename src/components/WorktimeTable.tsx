import { useState, useEffect, useCallback } from "react";
import { Clock, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import type { ProjectType, TaskType, WorktimeType } from "@db/schema";
import type { UserResponseSchemaType } from "openauthster-shared/endpoints";
import {
  GET as getAdminWorktime,
  POST as createWorktime,
  PUT as updateWorktime,
  DELETE as deleteWorktime,
} from "@api/admin/worktime";
import { GET as getProjectTasks } from "@api/admin/task";

type UserItem = Exclude<UserResponseSchemaType["data"], null>["users"][number];

interface WorktimeTableProps {
  users: UserItem[];
  projects: ProjectType[];
}

const STATUS_OPTIONS: { value: WorktimeType["status"]; label: string }[] = [
  { value: "pending", label: "En attente" },
  { value: "active", label: "En cours" },
  { value: "approved", label: "Approuvé" },
  { value: "fulfilled", label: "Payé" },
  { value: "rejected", label: "Rejeté" },
];

const STATUS_BADGE: Record<WorktimeType["status"], string> = {
  pending:
    "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
  active: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
  approved:
    "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  fulfilled:
    "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400",
};

function tsToDatetimeLocal(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(
    d.getHours(),
  )}:${p(d.getMinutes())}`;
}

function formatTime(ts: number | null | undefined): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(ts: number | null | undefined): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDuration(
  punchIn: number | null | undefined,
  punchOut: number | null | undefined,
): string {
  if (!punchIn || !punchOut) return "—";
  const totalMinutes = Math.round((punchOut - punchIn) / (1000 * 60));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

const EMPTY_FORM = {
  userId: "",
  userName: "",
  punchIn: "",
  punchOut: "",
  project: "" as number | "",
  task: "" as number | "",
  status: "pending" as WorktimeType["status"],
};

export default function WorktimeTable({ users, projects }: WorktimeTableProps) {
  const [entries, setEntries] = useState<WorktimeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasksByProject, setTasksByProject] = useState<
    Record<number, TaskType[]>
  >({});

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WorktimeType | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formTasks, setFormTasks] = useState<TaskType[]>([]);
  const [loadingFormTasks, setLoadingFormTasks] = useState(false);
  const [saving, setSaving] = useState(false);

  // Delete
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingInProgress, setDeletingInProgress] = useState(false);

  const fetchTasksForProject = useCallback(
    async (projectId: number): Promise<TaskType[]> => {
      if (tasksByProject[projectId]) return tasksByProject[projectId];
      const tasks = ((await getProjectTasks(projectId)) as TaskType[]) ?? [];
      setTasksByProject((prev) => ({ ...prev, [projectId]: tasks }));
      return tasks;
    },
    [tasksByProject],
  );

  const loadEntries = useCallback(async () => {
    setLoading(true);
    const data = ((await getAdminWorktime()) as WorktimeType[]) ?? [];
    setEntries(data);
    const projectIds = [
      ...new Set(
        data.filter((e) => e.project != null).map((e) => e.project as number),
      ),
    ];
    if (projectIds.length) {
      const pairs = await Promise.all(
        projectIds.map((pid) =>
          getProjectTasks(pid).then(
            (tasks) => [pid, (tasks as TaskType[]) ?? []] as const,
          ),
        ),
      );
      setTasksByProject(Object.fromEntries(pairs));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleFormProjectChange = async (projectId: number | "") => {
    setForm((f) => ({ ...f, project: projectId, task: "" }));
    if (!projectId) {
      setFormTasks([]);
      return;
    }
    setLoadingFormTasks(true);
    const tasks = await fetchTasksForProject(projectId as number);
    setFormTasks(tasks);
    setLoadingFormTasks(false);
  };

  const openAdd = () => {
    setEditingEntry(null);
    setForm({ ...EMPTY_FORM });
    setFormTasks([]);
    setModalOpen(true);
  };

  const openEdit = async (entry: WorktimeType) => {
    setEditingEntry(entry);
    setForm({
      userId: entry.userId,
      userName: entry.userName,
      punchIn: entry.punchIn ? tsToDatetimeLocal(entry.punchIn) : "",
      punchOut: entry.punchOut ? tsToDatetimeLocal(entry.punchOut) : "",
      project: entry.project ?? "",
      task: entry.task ?? "",
      status: entry.status,
    });
    if (entry.project) {
      setLoadingFormTasks(true);
      const tasks = await fetchTasksForProject(entry.project);
      setFormTasks(tasks);
      setLoadingFormTasks(false);
    } else {
      setFormTasks([]);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingEntry(null);
    setForm({ ...EMPTY_FORM });
    setFormTasks([]);
  };

  const handleSubmit = async () => {
    if (!form.userId || !form.punchIn) return;
    setSaving(true);
    const punchIn = new Date(form.punchIn).getTime();
    const punchOut = form.punchOut ? new Date(form.punchOut).getTime() : null;
    const payload: Omit<WorktimeType, "id"> = {
      userId: form.userId,
      userName: form.userName,
      punchIn,
      punchOut,
      date: punchIn,
      project: form.project ? (form.project as number) : null,
      task: form.task ? (form.task as number) : null,
      status: form.status,
    };
    if (editingEntry) {
      await updateWorktime(editingEntry.id, payload);
    } else {
      await createWorktime(payload);
    }
    await loadEntries();
    setSaving(false);
    closeModal();
  };

  const handleDelete = async (id: number) => {
    setDeletingInProgress(true);
    await deleteWorktime(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setDeletingId(null);
    setDeletingInProgress(false);
  };

  const inputCls =
    "w-full bg-slate-50 dark:bg-white/5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none text-sm transition-all disabled:opacity-50 appearance-none";

  return (
    <>
      {/* Table card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-white/7 shadow-sm dark:shadow-none overflow-hidden mb-5">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <Clock size={16} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mr-auto">
            Pointages
          </h3>
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm shadow-sky-500/20"
          >
            <Plus size={13} />
            Ajouter une entrée
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="py-14 text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-500">
                <Clock size={20} />
              </div>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Aucune entrée de pointage.
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/3">
                  {[
                    "Employé",
                    "Date",
                    "Arrivée",
                    "Départ",
                    "Durée",
                    "Projet",
                    "Tâche",
                    "Statut",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const projectName =
                    projects.find((p) => p.id === entry.project)?.name ?? "—";
                  const taskName =
                    entry.task && entry.project
                      ? tasksByProject[entry.project]?.find(
                          (t) => t.id === entry.task,
                        )?.name ?? `#${entry.task}`
                      : "—";

                  return (
                    <tr
                      key={entry.id}
                      className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/3 transition-colors group"
                    >
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {entry.userName}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(entry.punchIn)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap tabular-nums">
                        {formatTime(entry.punchIn)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap tabular-nums">
                        {formatTime(entry.punchOut)}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-200 whitespace-nowrap tabular-nums">
                        {formatDuration(entry.punchIn, entry.punchOut)}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {projectName}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {taskName}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            STATUS_BADGE[entry.status] ?? STATUS_BADGE.pending
                          }`}
                        >
                          {STATUS_OPTIONS.find((s) => s.value === entry.status)
                            ?.label ?? entry.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5 min-w-16">
                          {deletingId === entry.id ? (
                            <>
                              <span className="text-xs text-rose-600 dark:text-rose-400 font-medium mr-1 whitespace-nowrap">
                                Supprimer ?
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDelete(entry.id)}
                                disabled={deletingInProgress}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                              >
                                {deletingInProgress ? (
                                  <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                ) : (
                                  <Check size={13} />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingId(null)}
                                disabled={deletingInProgress}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <X size={13} />
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => openEdit(entry)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                title="Modifier"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeletingId(entry.id);
                                }}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Card */}
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <Clock size={16} />
              </div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex-1">
                {editingEntry ? "Modifier l'entrée" : "Nouvelle entrée"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 flex flex-col gap-4">
              {/* User */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Employé
                </label>
                <select
                  value={form.userId}
                  onChange={(e) => {
                    const user = users.find((u) => u.id === e.target.value);
                    setForm((f) => ({
                      ...f,
                      userId: e.target.value,
                      userName:
                        (user?.session_public!.name as string) ?? "nom inconnu",
                    }));
                  }}
                  disabled={saving}
                  className={inputCls}
                  required
                >
                  <option
                    value=""
                    className="bg-white dark:bg-zinc-800 text-slate-400"
                  >
                    Sélectionner un employé...
                  </option>
                  {users.map((u) => (
                    <option
                      key={u.id}
                      value={u.id}
                      className="bg-white dark:bg-zinc-800 text-slate-900 dark:text-white"
                    >
                      {(u.session_public as { name?: string })?.name ??
                        u.identifier}
                    </option>
                  ))}
                </select>
              </div>

              {/* Punch In / Out */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Arrivée
                  </label>
                  <input
                    type="datetime-local"
                    value={form.punchIn}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, punchIn: e.target.value }))
                    }
                    disabled={saving}
                    className={inputCls}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Départ
                  </label>
                  <input
                    type="datetime-local"
                    value={form.punchOut}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, punchOut: e.target.value }))
                    }
                    disabled={saving}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Project / Task */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Projet
                  </label>
                  <select
                    value={form.project}
                    onChange={(e) =>
                      handleFormProjectChange(
                        e.target.value ? Number(e.target.value) : "",
                      )
                    }
                    disabled={saving}
                    className={inputCls}
                  >
                    <option
                      value=""
                      className="bg-white dark:bg-zinc-800 text-slate-400"
                    >
                      Aucun projet
                    </option>
                    {projects.map((p) => (
                      <option
                        key={p.id}
                        value={p.id}
                        className="bg-white dark:bg-zinc-800 text-slate-900 dark:text-white"
                      >
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Tâche
                  </label>
                  <select
                    value={form.task}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        task: e.target.value ? Number(e.target.value) : "",
                      }))
                    }
                    disabled={saving || !form.project || loadingFormTasks}
                    className={inputCls}
                  >
                    <option
                      value=""
                      className="bg-white dark:bg-zinc-800 text-slate-400"
                    >
                      {loadingFormTasks
                        ? "Chargement..."
                        : !form.project
                        ? "Sélectionner un projet d'abord"
                        : formTasks.length === 0
                        ? "Aucune tâche"
                        : "Aucune tâche sélectionnée"}
                    </option>
                    {formTasks.map((t) => (
                      <option
                        key={t.id}
                        value={t.id}
                        className="bg-white dark:bg-zinc-800 text-slate-900 dark:text-white"
                      >
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Statut
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      status: e.target.value as WorktimeType["status"],
                    }))
                  }
                  disabled={saving}
                  className={inputCls}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option
                      key={s.value}
                      value={s.value}
                      className="bg-white dark:bg-zinc-800 text-slate-900 dark:text-white"
                    >
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving || !form.userId || !form.punchIn}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-colors shadow-sm shadow-sky-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>{editingEntry ? "Enregistrer" : "Ajouter"}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
