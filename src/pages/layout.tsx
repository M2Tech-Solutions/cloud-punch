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
  Sun,
  Moon,
  KeyRound,
  Fingerprint,
  QrCode,
} from "lucide-react";
import { useAuth } from "../auth";

export default function Layout({ children }: { children: React.JSX.Element }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const auth = useAuth();

  useEffect(() => {
    const saved = (localStorage.getItem("theme") ?? "dark") as "dark" | "light";
    setTheme(saved);
    auth.init().then((client) => {
      if (!client.isAuthenticated) return;
      client.setTokenToCookie();
      client.getUserSession("public").then(() => auth.triggerUpdate());
    });
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#09090B] text-slate-900 dark:text-slate-200 font-sans flex flex-col md:flex-row antialiased selection:bg-indigo-500/30">
      <LoginFloat />
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-[#111113] border-b border-slate-200 dark:border-white/5 sticky top-0 z-40 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-2.5">
          <div className="bg-indigo-50 dark:bg-indigo-500/10 p-1.5 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
            <TerminalSquare
              className="text-indigo-600 dark:text-indigo-400"
              size={18}
            />
          </div>
          <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
            Punch
            <span className="text-indigo-600 dark:text-indigo-400">Master</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <UserLoginStatus />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 transition-colors"
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav
        className={`${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:sticky md:top-0 md:h-screen inset-y-0 left-0 w-60 bg-white dark:bg-[#111113] border-r border-slate-200 dark:border-white/5 flex flex-col shadow-xl md:shadow-none z-[60] transition-transform duration-300 ease-in-out`}
      >
        {/* Logo */}
        <div className="hidden md:flex items-center gap-3 px-5 py-5 border-b border-slate-100 dark:border-white/5">
          <div className="bg-indigo-50 dark:bg-indigo-500/10 p-2 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
            <TerminalSquare
              className="text-indigo-600 dark:text-indigo-400"
              size={18}
            />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-none">
              Punch
              <span className="text-indigo-600 dark:text-indigo-400">
                Master
              </span>
            </h1>
            <div className="mt-1">
              <UserLoginStatus />
            </div>
          </div>
        </div>

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="flex flex-col gap-0.5">
            {auth.isAuthenticated ? (
              <>
                <NavLink
                  href="/"
                  icon={<Clock size={15} />}
                  label="Pointage"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <NavLink
                  href="/dashboard"
                  icon={<BarChart2 size={15} />}
                  label="Dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                {auth.data.public.role == "admin" && (
                  <>
                    <NavLink
                      href="/admin"
                      icon={<Settings size={15} />}
                      label="Administration"
                      onClick={() => setIsMobileMenuOpen(false)}
                    />
                  </>
                )}
                <NavLink
                  href="/config"
                  icon={<ShieldUser size={15} />}
                  label="Configuration"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
              </>
            ) : (
              <NavLink
                href="/login"
                icon={<LogIn size={15} />}
                label="Se connecter"
                onClick={() => auth.login()}
              />
            )}
          </div>
        </div>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-slate-100 dark:border-white/5 flex flex-col gap-1">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors"
          >
            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            <span className="font-medium">
              {theme === "dark" ? "Mode clair" : "Mode sombre"}
            </span>
          </button>

          {/* User info */}
          <div className="mt-1 px-3 py-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/5">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
              Compte
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white truncate">
              {auth.data?.public?.name || "Invité"}
            </p>
            <button
              onClick={() => auth.logout()}
              className="mt-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors font-medium"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-[#09090B]">
        <div className="max-w-6xl mx-auto">{children}</div>
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
  const isActive =
    typeof window !== "undefined" && window.location.pathname === href;

  return (
    <a
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
        isActive
          ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400"
          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
      }`}
    >
      <span
        className={
          isActive
            ? "text-indigo-600 dark:text-indigo-400"
            : "text-slate-400 dark:text-slate-500"
        }
      >
        {icon}
      </span>
      {label}
    </a>
  );
}

function UserLoginStatus() {
  const auth = useAuth();
  const isLogged = auth.isAuthenticated;

  return (
    <div className="inline-flex items-center gap-1.5 text-xs font-medium">
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isLogged ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      <span className="text-slate-400 dark:text-slate-500">
        {isLogged ? "En ligne" : "Hors ligne"}
      </span>
    </div>
  );
}

function LoginFloat() {
  const auth = useAuth();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    auth.addInitializationListener("login-float", () => setInitialized(true));
  }, []);

  if (!initialized || auth.isAuthenticated) return null;

  const methods = [
    {
      id: "password",
      label: "Mot de passe",
      description: "Email et mot de passe",
      icon: <KeyRound size={16} />,
      action: () => auth.login({ provider: "password" }),
    },
    {
      id: "passkey",
      label: "Passkey",
      description: "Clé biométrique / FIDO2",
      icon: <Fingerprint size={16} />,
      action: () => auth.passkey.login(),
    },
    {
      id: "qr",
      label: "QR Code",
      description: "Scanner depuis un appareil mobile",
      icon: <QrCode size={16} />,
      action: () => auth.login({ provider: "qr" }),
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#111113] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
            <TerminalSquare
              className="text-indigo-600 dark:text-indigo-400"
              size={22}
            />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Punch
              <span className="text-indigo-600 dark:text-indigo-400">
                Master
              </span>
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Connectez-vous pour continuer
            </p>
          </div>
        </div>

        {/* Login options */}
        <div className="flex flex-col gap-2.5">
          {methods.map(({ id, label, description, icon, action }) => (
            <button
              key={id}
              onClick={action}
              className="flex items-center gap-4 w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all group"
            >
              <div className="p-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:border-indigo-200 dark:group-hover:border-indigo-500/30 transition-colors">
                {icon}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
