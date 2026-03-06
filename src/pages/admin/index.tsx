import React, { useState } from "react";
import { mockProjects, mockTasks } from "../../mocks/data";
import { FolderPlus, CheckSquare, Plus } from "lucide-react";

export default function AdminPage() {
  const [newProject, setNewProject] = useState("");
  const [newTask, setNewTask] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<number | "">("");

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

  return (
    <div className="p-6 md:p-10 w-full max-w-5xl mx-auto">
      <header className="mb-12">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Administration</h2>
        <p className="text-slate-400">Configuration de l'environnement de travail.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                <label className="block text-xs font-semibold uppercase tracking-wider mb-3 text-slate-400">Nom du projet</label>
                <input 
                    type="text" 
                    value={newProject}
                    onChange={e => setNewProject(e.target.value)}
                    className="w-full bg-white/5 p-4 rounded-xl border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-slate-600 transition-all outline-none"
                    placeholder="Ex: Refonte Site Web Corp" 
                    required 
                />
                </div>
                <button type="submit" className="w-full p-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all flex justify-center items-center gap-2 active:scale-[0.98] shadow-lg shadow-indigo-500/20">
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
                <label className="block text-xs font-semibold uppercase tracking-wider mb-3 text-slate-400">Projet parent</label>
                <select 
                    value={selectedProjectId}
                    onChange={e => setSelectedProjectId(Number(e.target.value))}
                    className="w-full bg-white/5 p-4 rounded-xl border border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white transition-all outline-none appearance-none"
                    required
                >
                    <option value="" disabled className="bg-[#111] text-slate-500">Sélectionnez un projet de rattachement...</option>
                    {mockProjects.map(p => (
                    <option key={p.id} value={p.id} className="bg-[#111] text-white">{p.name}</option>
                    ))}
                </select>
                </div>
                
                <div className="mb-8 flex-1">
                <label className="block text-xs font-semibold uppercase tracking-wider mb-3 text-slate-400">Nom de la tâche</label>
                <input 
                    type="text" 
                    value={newTask}
                    onChange={e => setNewTask(e.target.value)}
                    className="w-full bg-white/5 p-4 rounded-xl border border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white placeholder-slate-600 transition-all outline-none"
                    placeholder="Ex: Implémentation du panier" 
                    required 
                />
                </div>
                <button type="submit" className="w-full p-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all flex justify-center items-center gap-2 active:scale-[0.98] shadow-lg shadow-emerald-500/20">
                   <Plus size={18} /> Associer la tâche
                </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
