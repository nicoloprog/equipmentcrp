"use client";

import { BellRing, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
}

export default function PushNotificationSetup() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSupported("serviceWorker" in navigator && "PushManager" in window && "Notification" in window);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!supported) return;
    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setEnabled(Boolean(subscription)))
      .catch(() => undefined);
  }, [supported]);

  async function enableNotifications() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!supported || !publicKey) {
      setMessage("Les notifications ne sont pas configurées pour cette application.");
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage("Permission de notification refusée.");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) });
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });
      if (!response.ok) {
        const details = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(details?.error || "subscription failed");
      }
      setEnabled(true);
      setMessage("Notifications activées.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Impossible d’activer les notifications sur cet appareil.");
    } finally {
      setBusy(false);
    }
  }

  if (!supported || typeof Notification === "undefined") return null;

  if (enabled) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-green-900">Notifications activées</p>
          <p className="mt-1 text-sm text-green-700">Cet appareil peut recevoir les entretiens prioritaires.</p>
          {message && <p className="mt-1 text-xs text-green-800">{message}</p>}
        </div>
        <button type="button" onClick={async () => {
          setBusy(true);
          setMessage(null);
          try {
            const response = await fetch("/api/push/test", { method: "POST" });
            const details = (await response.json().catch(() => null)) as { error?: string } | null;
            if (!response.ok) throw new Error(details?.error || "Test failed");
            setMessage("Notification de test envoyée.");
          } catch (error) {
            setMessage(error instanceof Error ? error.message : "Test impossible.");
          } finally {
            setBusy(false);
          }
        }} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-300 bg-white px-4 py-2 text-sm font-semibold text-green-800 hover:bg-green-100 disabled:opacity-60">
          {busy && <Loader2 size={16} className="animate-spin" />} Tester
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium text-blue-900">Recevoir les entretiens prioritaires</p>
        <p className="mt-1 text-sm text-blue-700">Soyez averti même lorsque l’application est fermée.</p>
        {message && <p className="mt-1 text-xs text-blue-800">{message}</p>}
      </div>
      <button type="button" onClick={enableNotifications} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
        {busy ? <Loader2 size={16} className="animate-spin" /> : <BellRing size={16} />} Activer
      </button>
    </div>
  );
}
