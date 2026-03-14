// ClientWrapper is used client side only for state management
// you can create your own version of the routerHost

import { RouterHost } from "frame-master-plugin-apply-react/router";
import { StrictMode, useEffect, useRef, useState, type JSX } from "react";
import { createActionFetcher, createClient } from "./auth";
import { QrCode, ShieldCheck, ShieldX } from "lucide-react";

export default function ClientWrapper({ children }: { children: JSX.Element }) {
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const authFlowResolver = useRef<
    ((value: boolean | PromiseLike<boolean>) => void) | null
  >(null);

  const client = useRef(
    createClient({
      redirectURI: process.env.PUBLIC_REDIRECT_URI!,
      qrAuthFlowStartCallback: () => {
        return new Promise<boolean>((resolve) => {
          authFlowResolver.current = resolve;
          setQrDialogOpen(true);
        });
      },
    }),
  ).current;

  useEffect(() => {
    createActionFetcher(client);
  }, [client]);

  const handleQrResponse = (accepted: boolean) => {
    setQrDialogOpen(false);
    authFlowResolver.current?.(accepted);
    authFlowResolver.current = null;
  };

  return (
    <StrictMode>
      <globalThis.AUTH.Provider value={client}>
        <RouterHost>{children}</RouterHost>
        {qrDialogOpen && <QRDialog handleQrResponse={handleQrResponse} />}
      </globalThis.AUTH.Provider>
    </StrictMode>
  );
}

function QRDialog({
  handleQrResponse,
}: {
  handleQrResponse: (accepted: boolean) => void;
}) {
  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#111113] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8 flex flex-col items-center gap-6">
        <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-500/20">
          <QrCode className="text-amber-600 dark:text-amber-400" size={28} />
        </div>

        <div className="text-center">
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Connexion QR Code
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Un appareil tente de se connecter via QR Code.
            <br />
            Confirmez-vous cette connexion ?
          </p>
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={() => handleQrResponse(false)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-200 dark:hover:border-rose-500/30 hover:text-rose-600 dark:hover:text-rose-400 transition-all"
          >
            <ShieldX size={16} />
            Refuser
          </button>
          <button
            onClick={() => handleQrResponse(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-500/20"
          >
            <ShieldCheck size={16} />
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
