import Link from "next/link";
import { Bell, EyeDashed, Flag, Inspect, QrCode } from "lucide-react";

export default function MobileQuickActions() {
  return (
    <div className="flex shrink-0 items-center gap-2 sm:hidden">
      <Link
        href="/inspection"
        aria-label="Démarrer une inspection rapide"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-green-600 text-white shadow-sm transition hover:bg-green-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-200"
      >
        <EyeDashed size={21} />
      </Link>
      <Link
        href="/anomalie"
        aria-label="Signaler une anomalie"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white shadow-sm transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200"
      >
        <Bell size={20} />
      </Link>
    </div>
  );
}
