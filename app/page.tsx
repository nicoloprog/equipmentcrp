import Link from "next/link";
import {
  Wrench,
  AlertTriangle,
  ShieldAlert,
  Plus,
  Truck,
  ArrowUpRight,
  ChevronRight,
  ClipboardList,
  Search,
  Bell,
} from "lucide-react";

const stats = [
  {
    label: "Inventaire total",
    value: 48,
    description: "Véhicules, outils et plus",
    icon: Truck,
    iconStyle: "bg-gray-100 text-gray-600",
    href: "/equipment",
  },
  {
    label: "Entretien à venir",
    value: 5,
    description: "Maintenance",
    icon: Wrench,
    iconStyle: "bg-amber-50 text-amber-700",
    href: "/maintenance",
  },
  {
    label: "Entretien en retard",
    value: 2,
    description: "Maintenance essentielle",
    icon: AlertTriangle,
    iconStyle: "bg-red-50 text-red-600",
    href: "/maintenance",
  },
  {
    label: "Garanties de batterie",
    value: 4,
    description: "Batteries en garantie",
    icon: ShieldAlert,
    iconStyle: "bg-purple-50 text-purple-700",
    href: "/equipment",
  },
];

const quickLinks = [
  {
    title: "Equipment inventory",
    description: "Search, filter, and manage your entire fleet.",
    href: "/equipment",
    icon: Truck,
  },
  {
    title: "Maintenance queue",
    description: "Review work orders and track service tasks.",
    href: "/maintenance",
    icon: ClipboardList,
  },
];

export default async function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#f8f9fa] text-[#202124]">
      <div className="mx-auto max-w-[1440px] space-y-8 p-5 sm:p-8 lg:p-10">
        {/* Header */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-red-600 shadow-sm ring-1 ring-gray-200/80">
              <Truck size={24} strokeWidth={1.8} />
            </div>

            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-gray-500">
                Accueil
              </p>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Maintenance Véhicules Et Équipements
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Suivi des entretien, intervalles de maintenance, garrantie des
                batteries et plus.
              </p>
            </div>
          </div>
        </header>
        <section aria-label="Equipment statistics">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Vue d'ensemble
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Un aperçu de l'état actuel de votre flotte.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <Link
                  key={stat.label}
                  href={stat.href}
                  className="group rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconStyle}`}
                    >
                      <Icon size={21} strokeWidth={1.8} />
                    </div>

                    <ArrowUpRight
                      size={18}
                      className="text-gray-400 transition group-hover:text-gray-700"
                    />
                  </div>

                  <div className="mt-5">
                    <p className="text-sm font-medium text-gray-500">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
                      {stat.value}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      {stat.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
