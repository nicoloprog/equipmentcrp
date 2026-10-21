import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import MobileQuickActions from "@/app/components/MobileQuickActions";
import {
  Truck,
  Wrench,
  EyeDashed,
  Home,
  Bell,
  Search,
  Plus,
  QrCode,
  Flag,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Maintenance CRP",
  description:
    "Suivi de l'entretien et de la maintenance des équipements pour le CRP.",
};

const navigation = [
  {
    label: "Accueil",
    href: "/",
    icon: Home,
  },
  {
    label: "Inventaire",
    href: "/equipment",
    icon: Plus,
  },
  {
    label: "Maintenance",
    href: "/maintenance",
    icon: Wrench,
  },
];

const quickActions = [
  {
    label: "Inspection rapide",
    href: "/inspection",
    icon: EyeDashed,
    className: "bg-green-600 text-white hover:bg-green-700",
  },
  {
    label: "Signaler une anomalie",
    href: "/anomalie",
    icon: Bell,
    className: "bg-red-600 text-white hover:bg-red-700",
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f8f9fa] font-sans antialiased text-[#202124] pb-18">
        <div className="min-h-screen">
          {/* Top navigation */}
          <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 backdrop-blur-md">
            <div className="flex h-[68px] items-center gap-3 px-4 sm:gap-6 sm:px-6">
              {/* Brand */}
              <Link
                href="/"
                className="flex w-auto shrink-0 items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-red-500 md:w-[280px]"
                aria-label="CRP home"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-600 text-white shadow-sm shadow-red-900/10">
                  <Wrench size={21} strokeWidth={1.9} />
                </div>

                <span className="hidden text-lg tracking-tight text-gray-600 sm:block">
                  Concept
                  <span className="font-bold text-gray-900">
                    RénovationPrestige
                  </span>
                </span>
              </Link>

              {/* Search */}
              <div className="flex min-w-0 flex-1 justify-center">
                <form
                  action="/equipment"
                  method="GET"
                  role="search"
                  className="relative w-full max-w-2xl"
                >
                  <Search
                    size={19}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  />

                  <input
                    type="search"
                    name="q"
                    placeholder="Recherche..."
                    aria-label="Rechercher un équipement, une maintenance ou un actif"
                    className="h-11 w-full rounded-full border border-transparent bg-[#f1f3f4] pl-11 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-500 hover:bg-[#e9edf6] focus:border-gray-200 focus:bg-white focus:shadow-sm focus:ring-4 focus:ring-gray-100"
                  />
                </form>
              </div>

              {/* New equipment action */}

              <MobileQuickActions />
            </div>
          </header>

          {/* Application layout */}
          <div className="mx-auto flex min-h-[calc(100vh-68px)] max-w-[1800px]">
            {/* Sidebar */}
            <aside className="sticky top-[68px] hidden h-[calc(100vh-68px)] w-[248px] shrink-0 flex-col border-r border-gray-200/80 bg-[#f8f9fa] p-4 md:flex">
              <div className="mb-7 flex flex-col gap-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      className={`inline-flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-semibold shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gray-200 ${action.className}`}
                    >
                      <Icon size={20} />
                      <span>{action.label}</span>
                    </Link>
                  );
                })}
              </div>

              <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                Workspace
              </p>

              <nav aria-label="Main navigation" className="flex flex-col gap-1">
                {navigation.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex min-h-11 items-center gap-3 rounded-full px-4 text-sm font-medium text-gray-600 transition hover:bg-[#e9edf6] hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      <Icon
                        size={19}
                        strokeWidth={1.8}
                        className="shrink-0 text-gray-500 transition group-hover:text-gray-800"
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </aside>

            {/* Page content */}
            <main className="min-w-0 flex-1 bg-[#f8f9fa]">{children}</main>
          </div>

          {/* Mobile bottom navigation */}
          <nav
            aria-label="Mobile navigation"
            className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-gray-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-md md:hidden"
          >
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-0.5 text-[10px] font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  <Icon size={20} strokeWidth={1.8} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </body>
    </html>
  );
}
