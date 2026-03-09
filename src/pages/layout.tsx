import { useEffect, useState } from "react";
import {
  Clock,
  BarChart2,
  Settings,
  TerminalSquare,
  Menu,
  X,
  ShieldUser,
  LogIn,
} from "lucide-react";
import { useAuth } from "../auth";

export default function Layout({ children }: { children: React.JSX.Element }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const auth = useAuth();
  useEffect(() => {
    auth.init().then((client) => {
      if (!client.isAuthenticated) return;
      client.setTokenToCookie();
      client.getUserSession("public").then(() => auth.triggerUpdate());
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-200 font-sans flex flex-col md:flex-row antialiased selection:bg-indigo-500/30">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#111111]/90 backdrop-blur-md border-b border-white/5 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/10 p-1.5 rounded-lg border border-indigo-500/20">
            <TerminalSquare className="text-indigo-400" size={20} />
          </div>
          <h1 className="text-lg font-bold tracking-tight bg-linear-to-br from-white to-slate-400 bg-clip-text text-transparent">
            Punch<span className="text-indigo-400">Master</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <UserLoginStatus />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-lg border border-white/10 transition-colors"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar / Navigation */}
      <nav
        className={`${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static inset-y-0 left-0 w-72 bg-[#111111]/95 md:bg-[#111111]/80 backdrop-blur-xl p-6 border-r border-white/5 flex flex-col gap-8 shadow-2xl z-[60] transition-transform duration-300 ease-in-out`}
      >
        <div className="flex gap-2 flex-col">
          <div className="hidden md:flex flex-col gap-4 mb-6">
            <div className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20 w-fit">
              <TerminalSquare className="text-indigo-400" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-linear-to-br from-white to-slate-400 bg-clip-text text-transparent mb-2">
                Punch<span className="text-indigo-400">Master</span>
              </h1>
              <UserLoginStatus />
            </div>
          </div>

          <div className="flex flex-col gap-1 space-y-2 mt-4 md:mt-0">
            {auth.isAuthenticated ? (
              <>
                <NavLink
                  href="/"
                  icon={<Clock size={18} />}
                  label="Pointage"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <NavLink
                  href="/dashboard"
                  icon={<BarChart2 size={18} />}
                  label="Dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <NavLink
                  href="/admin"
                  icon={<Settings size={18} />}
                  label="Administration"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <NavLink
                  href="/config"
                  icon={<ShieldUser size={18} />}
                  label="Configuration"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              </>
            ) : (
              <>
                <NavLink
                  href="/login"
                  icon={<LogIn size={18} />}
                  label="Se connecter"
                  onClick={() => auth.login()}
                />
              </>
            )}
          </div>
        </div>

        <div className="mt-auto">
          <div className="p-4 rounded-xl bg-linear-to-br from-indigo-500/10 to-transparent border border-white/5">
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Connecté en tant que
            </p>
            <p className="text-sm text-white font-medium mt-1">
              {auth.data?.public?.name || "Invité"}
              <button
                className="ml-2 cursor-pointer text-indigo-400 border border-indigo-400/20 rounded-full px-2 py-0.5 text-xs hover:bg-indigo-400/10 transition-colors"
                onClick={() => auth.logout()}
              >
                Se Déconnecter
              </button>
            </p>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-x-hidden overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-indigo-900/10 via-[#0A0A0A] to-[#0A0A0A]">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

function NavLink({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  // In a real app we would use location hook to determine active state
  // For this static build demo, using basic styling
  return (
    <a
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 p-3.5 rounded-xl hover:bg-white/5 active:scale-95 transition-all duration-200 text-slate-400 hover:text-white group relative overflow-hidden"
    >
      <div className="group-hover:text-indigo-400 transition-colors duration-200">
        {icon}
      </div>
      <span className="font-medium text-sm tracking-wide whitespace-nowrap">
        {label}
      </span>
    </a>
  );
}

function UserLoginStatus() {
  // Simple mock state for the demo, replace with actual auth logic
  const auth = useAuth();

  const isLogged = auth.isAuthenticated;

  return (
    <div className="ml-auto flex items-center gap-2 text-xs font-medium bg-white/5 px-2 py-1 rounded-full border border-white/5">
      <div
        className={`h-2.5 w-2.5 rounded-full shadow-md ${
          isLogged
            ? "bg-emerald-400 shadow-emerald-400/20"
            : "bg-rose-400 shadow-rose-400/20"
        }`}
      />
      <span className="text-slate-300 pr-1">
        {isLogged ? "Online" : "Offline"}
      </span>
    </div>
  );
}
