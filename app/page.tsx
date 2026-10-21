import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  ClipboardList,
  Flag,
  QrCode,
  Truck,
  Wrench,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getMaintenanceProgress } from "@/lib/maintenance/status";
import type { Equipment, MaintenancePlan } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const [equipmentResult, plansResult, alertsResult] = await Promise.all([
    supabase.from("equipment").select("*"),
    supabase.from("maintenance_plans").select("*").eq("active", true),
    supabase.from("equipment_alerts").select("id", { count: "exact", head: true }).eq("status", "open"),
  ]);

  const equipment = (equipmentResult.data ?? []) as Equipment[];
  const plans = (plansResult.data ?? []) as MaintenancePlan[];
  const equipmentById = new Map(equipment.map((item) => [item.id, item]));
  const now = new Date();
  let priorityCount = 0;
  let upcomingCount = 0;

  for (const plan of plans) {
    const vehicle = equipmentById.get(plan.equipment_id);
    if (!vehicle) continue;
    const progress = getMaintenanceProgress(plan, vehicle, now);
    if (progress >= 100) priorityCount += 1;
    else if (progress >= 85) upcomingCount += 1;
  }

  const dataError =
    equipmentResult.error ?? plansResult.error ?? alertsResult.error;
  const stats = [
    {
      label: "Inventaire total",
      value: equipment.length,
      description: "Véhicules, outils et batteries",
      icon: Truck,
      iconStyle: "bg-gray-100 text-gray-600",
      href: "/equipment",
    },
    {
      label: "Entretien prioritaire",
      value: priorityCount,
      description: "Maintenance en retard",
      icon: AlertTriangle,
      iconStyle: "bg-red-50 text-red-600",
      href: "/maintenance",
    },
    {
      label: "Anomalies ouvertes",
      value: alertsResult.count ?? 0,
      description: "Rapports d’inspection à traiter",
      icon: Flag,
      iconStyle: "bg-red-50 text-red-600",
      href: "/equipment",
    },
    {
      label: "Entretien à venir",
      value: upcomingCount,
      description: "Maintenance à planifier",
      icon: Wrench,
      iconStyle: "bg-amber-50 text-amber-700",
      href: "/maintenance",
    },
  ];

  return (
    <main className="min-h-screen bg-[#f8f9fa] text-[#202124]">
      <div className="mx-auto max-w-[1440px] space-y-8 p-5 sm:p-8 lg:p-10">
        <header>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.12em] text-gray-500">
            Accueil
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Maintenance Véhicules et Équipements
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Suivi des équipements et de leur maintenance.
          </p>
        </header>
        {dataError && (
          <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
            Impossible de charger les données: {dataError.message}
          </p>
        )}
        <section aria-label="Equipment statistics">
          <div className="mb-4">
            <h2 className="text-lg font-semibold tracking-tight">
              Vue d&apos;ensemble
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Un aperçu de l&apos;état actuel de votre flotte.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Link
                  key={stat.label}
                  href={stat.href}
                  className="group rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconStyle}`}
                    >
                      <Icon size={21} strokeWidth={1.8} />
                    </div>
                    <ArrowUpRight
                      size={18}
                      className="text-gray-400 group-hover:text-gray-700"
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
