"use client";

import { useEffect, useState } from "react";
import { Download, Loader2, X } from "lucide-react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function PwaInstallButton() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [showBrowserHelp, setShowBrowserHelp] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const stateTimer = window.setTimeout(() => {
      setIsStandalone(standalone);
      setIsIos(ios);
    }, 0);

    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    return () => {
      window.clearTimeout(stateTimer);
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
    };
  }, []);

  async function installApp() {
    if (isIos) {
      setShowIosHelp(true);
      return;
    }
    if (!installPrompt) {
      setShowBrowserHelp(true);
      return;
    }

    setInstalling(true);
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
    setInstalling(false);
  }

  if (isStandalone) return null;

  return (
    <>
      <button
        type="button"
        onClick={installApp}
        disabled={installing}
        className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4"
        aria-label="Installer l’application"
      >
        {installing ? <Loader2 size={17} className="animate-spin" /> : <Download size={17} />}
        <span className="hidden sm:inline">{installing ? "Installation..." : "Installer l’app"}</span>
      </button>

      {showIosHelp && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Installer sur iPhone</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Dans Safari, appuyez sur <strong>Partager</strong>, puis choisissez <strong>Ajouter à l’écran d’accueil</strong>.
                </p>
              </div>
              <button type="button" onClick={() => setShowIosHelp(false)} className="rounded-lg p-1 text-gray-500 hover:bg-gray-100" aria-label="Fermer"><X size={18} /></button>
            </div>
            <button type="button" onClick={() => setShowIosHelp(false)} className="mt-5 w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white">Compris</button>
          </div>
        </div>
      )}

      {showBrowserHelp && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Installation disponible dans le navigateur</h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Ouvrez cette application dans Chrome ou Edge, puis utilisez le menu du navigateur et choisissez <strong>Installer l’application</strong> ou <strong>Ajouter à l’écran d’accueil</strong>.
                </p>
                <p className="mt-2 text-xs leading-5 text-gray-500">
                  Si l’option n’apparaît pas, vérifiez que vous utilisez l’adresse HTTPS de production et non un aperçu intégré.
                </p>
              </div>
              <button type="button" onClick={() => setShowBrowserHelp(false)} className="rounded-lg p-1 text-gray-500 hover:bg-gray-100" aria-label="Fermer"><X size={18} /></button>
            </div>
            <button type="button" onClick={() => setShowBrowserHelp(false)} className="mt-5 w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white">Compris</button>
          </div>
        </div>
      )}
    </>
  );
}
