import { useState, useEffect } from "react";
import {
  CheckSquare,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  FolderOpen,
} from "lucide-react";
import type { ProjectType, TaskType } from "@db/schema";
import {
  GET as getTasks,
  POST as createTask,
  PUT as updateTask,
  DELETE as deleteTask,
} from "@api/admin/task";

const STATUS_CONFIG: Record<
  TaskType["status"],
  { label: string; className: string }
> = {
  pending: {
    label: "En attente",
    className:
      "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400",
  },
  in_progress: {
    label: "En cours",
    className:
      "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  },
  completed: {
    label: "Terminé",
    className:
      "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
};

type Props = {
  projects: ProjectType[];
  loadingProjects: boolean;
};

export default function ProjectTasksCard({ projects, loadingProjects }: Props) {
  const [projectId, setProjectId] = useState<number | "">("");
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Add task inline state
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [newTaskStatus, setNewTaskStatus] =
    useState<TaskType["status"]>("pending");
  const [savingTask, setSavingTask] = useState(false);

  // Edit task inline state
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTaskName, setEditingTaskName] = useState("");
  const [editingTaskDeadline, setEditingTaskDeadline] = useState("");
  const [editingTaskStatus, setEditingTaskStatus] =
    useState<TaskType["status"]>("pending");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete confirmation state
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
  const [deletingInProgress, setDeletingInProgress] = useState(false);

  useEffect(() => {
    if (!projectId) {
      setTasks([]);
      return;
    }
    setLoadingTasks(true);
    getTasks(projectId as number)
      .then((res) => setTasks((res as TaskType[]) ?? []))
      .finally(() => setLoadingTasks(false));
  }, [projectId]);

  const handleAddTask = async () => {
    if (!newTaskName.trim() || !projectId) return;
    setSavingTask(true);
    const created = await createTask({
      projectId: projectId as number,
      name: newTaskName.trim(),
      status: newTaskStatus,
      deadLine: newTaskDeadline ? new Date(newTaskDeadline).getTime() : null,
      createdAt: Date.now() as any,
    });
    if (created) setTasks((prev) => [...prev, created as TaskType]);
    setNewTaskName("");
    setNewTaskDeadline("");
    setNewTaskStatus("pending");
    setAddingTask(false);
    setSavingTask(false);
  };

  const startEdit = (task: TaskType) => {
    setEditingTaskId(task.id);
    setEditingTaskName(task.name);
    setEditingTaskDeadline(
      task.deadLine
        ? new Date(task.deadLine).toISOString().split("T")[0] ?? ""
        : "",
    );
    setEditingTaskStatus(task.status);
  };

  const handleEditTask = async () => {
    if (!editingTaskId || !editingTaskName.trim()) return;
    setSavingEdit(true);
    const updated = await updateTask(editingTaskId, {
      name: editingTaskName.trim(),
      status: editingTaskStatus,
      deadLine: editingTaskDeadline
        ? new Date(editingTaskDeadline).getTime()
        : null,
    });
    if (updated)
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTaskId ? (updated as TaskType) : t)),
      );
    setEditingTaskId(null);
    setSavingEdit(false);
  };

  const handleDeleteTask = async (id: number) => {
    setDeletingInProgress(true);
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setDeletingTaskId(null);
    setDeletingInProgress(false);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-white/7 shadow-sm dark:shadow-none overflow-hidden mb-5">
      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 mr-auto">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckSquare size={16} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Projets & Tâches
          </h3>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <FolderOpen
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
            />
            <select
              value={projectId}
              onChange={(e) =>
                setProjectId(e.target.value ? Number(e.target.value) : "")
              }
              className="bg-slate-50 dark:bg-white/5 pl-8 pr-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-slate-900 dark:text-white transition-all outline-none appearance-none text-sm min-w-42.5"
            >
              <option
                value=""
                className="bg-white dark:bg-zinc-800 text-slate-400"
              >
                {loadingProjects ? "Chargement..." : "Sélectionner un projet"}
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

          <a
            href="/admin/project"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm shadow-indigo-500/20 whitespace-nowrap"
          >
            <Plus size={13} />
            Nouveau projet
          </a>

          {projectId !== "" && (
            <button
              type="button"
              onClick={() => {
                setAddingTask(true);
                setEditingTaskId(null);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm shadow-emerald-500/20 whitespace-nowrap"
            >
              <Plus size={13} />
              Nouvelle tâche
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {!projectId ? (
          <div className="py-14 text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-500">
              <FolderOpen size={20} />
            </div>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Sélectionnez un projet pour afficher ses tâches.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Tâche
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-32">
                  Statut
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-36">
                  Échéance
                </th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody>
              {addingTask && (
                <tr className="border-b border-slate-100 dark:border-white/5 bg-emerald-50/50 dark:bg-emerald-500/5">
                  <td className="px-5 py-2.5">
                    <input
                      autoFocus
                      type="text"
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      placeholder="Nom de la tâche..."
                      disabled={savingTask}
                      className="w-full bg-white dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none text-sm transition-all disabled:opacity-50"
                      onKeyDown={(e) =>
                        e.key === "Escape" &&
                        !savingTask &&
                        setAddingTask(false)
                      }
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <select
                      value={newTaskStatus}
                      onChange={(e) =>
                        setNewTaskStatus(e.target.value as TaskType["status"])
                      }
                      disabled={savingTask}
                      className="bg-slate-50 dark:bg-white/5 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs outline-none appearance-none w-full disabled:opacity-50"
                    >
                      <option
                        value="pending"
                        className="bg-white dark:bg-zinc-800"
                      >
                        En attente
                      </option>
                      <option
                        value="in_progress"
                        className="bg-white dark:bg-zinc-800"
                      >
                        En cours
                      </option>
                      <option
                        value="completed"
                        className="bg-white dark:bg-zinc-800"
                      >
                        Terminé
                      </option>
                    </select>
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      type="date"
                      value={newTaskDeadline}
                      onChange={(e) => setNewTaskDeadline(e.target.value)}
                      disabled={savingTask}
                      className="bg-slate-50 dark:bg-white/5 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs outline-none w-full disabled:opacity-50"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={handleAddTask}
                        disabled={savingTask}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {savingTask ? (
                          <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Check size={13} />
                        )}
                      </button>
                      <button
                        type="button"
                        disabled={savingTask}
                        onClick={() => {
                          setAddingTask(false);
                          setNewTaskName("");
                          setNewTaskDeadline("");
                          setNewTaskStatus("pending");
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {loadingTasks ? (
                [1, 2, 3].map((i) => (
                  <tr
                    key={i}
                    className="border-b border-slate-100 dark:border-white/5"
                  >
                    <td className="px-5 py-3.5">
                      <div className="h-4 rounded-md bg-slate-100 dark:bg-white/5 animate-pulse w-3/4" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-5 rounded-full bg-slate-100 dark:bg-white/5 animate-pulse w-20" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="h-4 rounded-md bg-slate-100 dark:bg-white/5 animate-pulse w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : tasks.length === 0 && !addingTask ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-10 text-center text-sm text-slate-400 dark:text-slate-500"
                  >
                    Aucune tâche pour ce projet. Cliquez sur "Nouvelle tâche"
                    pour en ajouter une.
                  </td>
                </tr>
              ) : (
                tasks.map((task) =>
                  editingTaskId === task.id ? (
                    <tr
                      key={task.id}
                      className="border-b border-slate-100 dark:border-white/5 bg-indigo-50/50 dark:bg-indigo-500/5"
                    >
                      <td className="px-5 py-2.5">
                        <input
                          autoFocus
                          type="text"
                          value={editingTaskName}
                          onChange={(e) => setEditingTaskName(e.target.value)}
                          disabled={savingEdit}
                          className="w-full bg-white dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-slate-900 dark:text-white outline-none text-sm transition-all disabled:opacity-50"
                          onKeyDown={(e) =>
                            e.key === "Escape" &&
                            !savingEdit &&
                            setEditingTaskId(null)
                          }
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <select
                          value={editingTaskStatus}
                          onChange={(e) =>
                            setEditingTaskStatus(
                              e.target.value as TaskType["status"],
                            )
                          }
                          disabled={savingEdit}
                          className="bg-slate-50 dark:bg-white/5 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs outline-none appearance-none w-full disabled:opacity-50"
                        >
                          <option
                            value="pending"
                            className="bg-white dark:bg-zinc-800"
                          >
                            En attente
                          </option>
                          <option
                            value="in_progress"
                            className="bg-white dark:bg-zinc-800"
                          >
                            En cours
                          </option>
                          <option
                            value="completed"
                            className="bg-white dark:bg-zinc-800"
                          >
                            Terminé
                          </option>
                        </select>
                      </td>
                      <td className="px-4 py-2.5">
                        <input
                          type="date"
                          value={editingTaskDeadline}
                          onChange={(e) =>
                            setEditingTaskDeadline(e.target.value)
                          }
                          disabled={savingEdit}
                          className="bg-slate-50 dark:bg-white/5 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs outline-none w-full disabled:opacity-50"
                        />
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={handleEditTask}
                            disabled={savingEdit}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                          >
                            {savingEdit ? (
                              <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            ) : (
                              <Check size={13} />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingTaskId(null)}
                            disabled={savingEdit}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr
                      key={task.id}
                      className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/3 transition-colors group"
                    >
                      <td className="px-5 py-3.5 text-slate-700 dark:text-slate-200 font-medium">
                        {task.name}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            STATUS_CONFIG[task.status]?.className ??
                            STATUS_CONFIG.pending.className
                          }`}
                        >
                          {STATUS_CONFIG[task.status]?.label ?? task.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {task.deadLine ? (
                          new Date(task.deadLine).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {deletingTaskId === task.id ? (
                            <>
                              <span className="text-xs text-rose-600 dark:text-rose-400 font-medium mr-1">
                                Supprimer ?
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteTask(task.id)}
                                disabled={deletingInProgress}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                title="Confirmer la suppression"
                              >
                                {deletingInProgress ? (
                                  <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                ) : (
                                  <Check size={13} />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingTaskId(null)}
                                disabled={deletingInProgress}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Annuler"
                              >
                                <X size={13} />
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => {
                                  startEdit(task);
                                  setDeletingTaskId(null);
                                }}
                                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                title="Modifier"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeletingTaskId(task.id);
                                  setEditingTaskId(null);
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
                  ),
                )
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
