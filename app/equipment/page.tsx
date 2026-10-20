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
    label: "Total assets",
    value: 48,
    description: "Equipment in your fleet",
    icon: Truck,
    iconStyle: "bg-gray-100 text-gray-600",
    href: "/equipment",
  },
  {
    label: "Service due soon",
    value: 5,
    description: "Upcoming maintenance",
    icon: Wrench,
    iconStyle: "bg-amber-50 text-amber-700",
    href: "/maintenance",
  },
  {
    label: "Overdue maintenance",
    value: 2,
    description: "Requires attention",
    icon: AlertTriangle,
    iconStyle: "bg-red-50 text-red-600",
    href: "/maintenance",
  },
  {
    label: "Battery warranties",
    value: 4,
    description: "Warranty alerts to review",
    icon: ShieldAlert,
    iconStyle: "bg-purple-50 text-purple-700",
    href: "/equipment",
  },
];

const quickLinks = [
  {
    title: "Inventaire des équipements",
    description: "Rechercher, filtrer et gérer l'ensemble de votre flotte.",
    href: "/equipment",
    icon: Wrench,
  },
  {
    title: "Avis de maintenance",
    description: "Suivi des maintenances, préventive et corrective.",
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
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-gray-500">
                Inventaire
              </p>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Maintenance Véhicules Et Équipements
              </h1>
            </div>
          </div>

          {/* <Link
            href="/equipment/new"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gray-400 px-5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200"
          >
            <Plus size={19} />
            Nouveau
          </Link> */}
        </header>

        {/* Search / information bar */}
        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <Search size={19} className="shrink-0 text-gray-500" />
          <p className="flex-1 text-sm text-gray-500">
            Véhicules et équipements de maintenance, ordres de travail, et
            garanties de batterie.
          </p>
          <Bell size={18} className="shrink-0 text-gray-500" />
        </div>

        {/* Metrics */}

        {/* Quick navigation */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold tracking-tight">
              Accès rapide
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Accédez rapidement aux outils et aux avis de maintenances
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {quickLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex items-center gap-4 rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm transition duration-200 hover:border-gray-300 hover:shadow-md sm:p-6"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700 transition group-hover:bg-red-50 group-hover:text-red-600">
                    <Icon size={23} strokeWidth={1.8} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      {item.description}
                    </p>
                  </div>

                  <ChevronRight
                    size={20}
                    className="shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-gray-700"
                  />
                </Link>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 pt-5 text-xs text-gray-500"></footer>
      </div>
    </main>
  );
}
