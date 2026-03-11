import { useEffect, useState } from "react";
import {
  User,
  Fingerprint,
  AlertCircle,
  CheckCircle,
  KeyRound,
} from "lucide-react";
import { useAuth } from "../../auth";

export default function ConfigPage() {
  const auth = useAuth();
  const [name, setName] = useState(auth?.data?.public?.name || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Veuillez entrer votre nom complet.");
      return;
    }

    if (!auth.isAuthenticated) {
      setError("Vous devez être connecté pour configurer votre compte.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      if (auth.data.public.name != name)
        await auth.updateUserSession("public", { name });

      const result = await auth.passkey.register({ userDisplayName: name });

      if (!result.success) {
        setError(result.error || "Échec de la création du Passkey.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Une erreur inattendue est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!auth.isAuthenticated) return;
    setName(auth.data.public.name || "");
  }, [auth.isAuthenticated, auth?.data?.public?.name]);

  return (
    <div className="p-6 md:p-8 w-full max-w-xl mx-auto">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Configuration
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Mettez à jour votre profil et configurez votre méthode de connexion
          sécurisée.
        </p>
      </header>

      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/7 rounded-2xl shadow-sm dark:shadow-none overflow-hidden">
        {success ? (
          <div className="flex flex-col items-center justify-center py-14 px-8 text-center">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-full flex items-center justify-center mb-5">
              <CheckCircle className="text-emerald-600 dark:text-emerald-400 w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Configuration terminée !
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Votre profil a été mis à jour et votre Passkey a été enregistré
              avec succès. Vous pouvez désormais l'utiliser pour vous connecter
              rapidement.
            </p>
          </div>
        ) : (
          <>
            {/* Card header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <KeyRound size={16} />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Profil & Passkey
              </h3>
            </div>

            <form onSubmit={handleSetup} className="p-6 flex flex-col gap-6">
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  <User size={13} />
                  Nom complet
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex. Jean Dupont"
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-rose-500/10 border border-red-200 dark:border-rose-500/20 rounded-xl text-red-600 dark:text-rose-400 text-sm">
                  <AlertCircle size={16} className="shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-3 px-6 rounded-xl transition-colors shadow-sm shadow-indigo-500/20"
                >
                  <Fingerprint size={17} />
                  {isSubmitting
                    ? "Création en cours..."
                    : "Enregistrer et configurer mon Passkey"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
