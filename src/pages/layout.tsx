import React from "react";
import { Clock, BarChart2, Settings, TerminalSquare } from "lucide-react";

export default function Layout({ children }: { children: React.JSX.Element }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-200 font-sans flex flex-col md:flex-row antialiased selection:bg-indigo-500/30">
      {/* Sidebar / Navigation */}
      <nav className="bg-[#111111]/80 backdrop-blur-md w-full md:w-72 p-6 border-b md:border-b-0 md:border-r border-white/5 flex flex-col gap-10 shadow-2xl relative z-10 transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20">
            <TerminalSquare className="text-indigo-400" size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
            Punch<span className="text-indigo-400">Master</span>
          </h1>
        </div>
        
        <div className="flex flex-row md:flex-col gap-3 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
          <NavLink href="/" icon={<Clock size={18} />} label="Pointage" />
          <NavLink href="/dashboard" icon={<BarChart2 size={18} />} label="Dashboard" />
          <NavLink href="/admin" icon={<Settings size={18} />} label="Administration" />
        </div>
        
        <div className="mt-auto hidden md:block">
           <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-transparent border border-white/5">
              <p className="text-xs text-slate-400 leading-relaxed font-medium">Connecté en tant que</p>
              <p className="text-sm text-white font-medium mt-1">Utilisateur Demo</p>
           </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-x-hidden overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#0A0A0A] to-[#0A0A0A]">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  // In a real app we would use location hook to determine active state
  // For this static build demo, using basic styling
  return (
    <a 
      href={href} 
      className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-white/5 active:scale-95 transition-all duration-200 text-slate-400 hover:text-white group relative overflow-hidden"
    >
      <div className="group-hover:text-indigo-400 transition-colors duration-200">
        {icon}
      </div>
      <span className="font-medium text-sm tracking-wide whitespace-nowrap">{label}</span>
    </a>
  );
}
