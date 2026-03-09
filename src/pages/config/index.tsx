import { useEffect, useState } from "react";
import { User, Fingerprint, AlertCircle, CheckCircle } from "lucide-react";
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

      // Create passkey representing the user's secure access method
      const result = await auth.passkey.register({
        userDisplayName: name,
      });

      if (!result.success) {
        setError(result.error || "Échec de la création du Passkey.");
      } else {
        setSuccess(true);
      }
    } catch (err) {
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
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold bg-linear-to-br from-white to-slate-400 bg-clip-text text-transparent">
          Configuration Employé
        </h1>
        <p className="text-slate-400 mt-2">
          Configurez votre profil, vos disponibilités et votre méthode de
          connexion sécurisée (Passkey).
        </p>
      </div>

      <div className="bg-[#111111]/80 backdrop-blur-md border border-white/5 rounded-2xl shadow-2xl overflow-hidden p-6 md:p-8">
        {success ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="bg-emerald-500/10 p-4 rounded-full border border-emerald-500/20 mb-6">
              <CheckCircle className="text-emerald-400 w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Configuration terminée !
            </h2>
            <p className="text-slate-400 max-w-md">
              Votre profil a été mis à jour et votre Passkey a été enregistré
              avec succès. Vous pouvez désormais l'utiliser pour vous connecter
              rapidement.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSetup} className="space-y-8">
            {/* Input: Nom */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <User size={18} className="text-indigo-400" />
                Nom complet
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex. Jean Dupont"
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
                <AlertCircle size={18} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="pt-4 border-t border-white/5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
              >
                <Fingerprint size={20} />
                {isSubmitting
                  ? "Création en cours..."
                  : "Enregistrer et configurer mon Passkey"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
