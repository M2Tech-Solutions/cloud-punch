import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, FolderOpen } from "lucide-react";
import { useParams } from "@hooks/params";
import { addProject } from "@hooks/project";
import {
  GET as getProjectById,
  PUT as updateProject,
} from "@api/admin/project";
import { navigate } from "@hooks/navigate";

export default function ProjectFormPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id ? Number(params.id) : null;
  const isEditing = projectId !== null;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditing || !projectId) return;
    setLoading(true);
    getProjectById(projectId)
      .then((project) => {
        if (project) {
          setName(project.name);
          setDescription(project.description ?? "");
        }
      })
      .catch(() => setError("Impossible de charger le projet."))
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (isEditing && projectId) {
        await updateProject(String(projectId), { name, description });
      } else {
        await addProject({ name, description });
      }
      navigate("/admin");
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 w-full max-w-xl mx-auto">
        <div className="h-5 w-36 bg-slate-200 dark:bg-white/5 rounded-lg animate-pulse mb-8" />
        <div className="h-7 w-56 bg-slate-200 dark:bg-white/5 rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-72 bg-slate-100 dark:bg-white/5 rounded animate-pulse mb-8" />
        <div className="h-64 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/7 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 w-full max-w-xl mx-auto">
      {/* Back nav */}
      <a
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-8"
      >
        <ArrowLeft size={15} />
        Administration
      </a>

      {/* Page title */}
      <div className="mb-7">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {isEditing ? "Modifier le projet" : "Nouveau Projet"}
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {isEditing
            ? "Mettez à jour les informations du projet."
            : "Renseignez les détails du nouveau projet."}
        </p>
      </div>

      {error && (
        <div className="mb-5 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-white/7 shadow-sm dark:shadow-none overflow-hidden">
        {/* Card header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <FolderOpen size={16} />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {isEditing ? "Informations du projet" : "Détails du projet"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Nom du projet{" "}
              <span className="text-red-400 normal-case tracking-normal">
                *
              </span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 transition-all outline-none text-sm"
              placeholder="Ex: Refonte Site Web Corp"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-slate-50 dark:bg-white/5 px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 transition-all outline-none resize-none text-sm"
              placeholder="Décrivez le projet..."
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <a
              href="/admin"
              className="flex-1 flex items-center justify-center py-2.5 px-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 text-sm font-semibold transition-colors"
            >
              Annuler
            </a>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-indigo-500/20"
            >
              <Save size={15} />
              {isEditing ? "Enregistrer" : "Créer le projet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
