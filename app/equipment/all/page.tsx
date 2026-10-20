"use client";

import { useState } from "react";
import Link from "next/link";
import { Truck, Wrench, Shield, ArrowRight, Filter } from "lucide-react";

const MOCK_EQUIPMENT = [
  {
    id: "1",
    tag: "TRK-01",
    name: "Freightliner Heavy Transport",
    category: "truck",
    status: "healthy",
    usage: "45,200 miles",
  },
  {
    id: "2",
    tag: "DRL-04",
    name: "Atlas Copco Rig Drill",
    category: "drill",
    status: "due_soon",
    usage: "1,850 hours",
  },
  {
    id: "3",
    tag: "BAT-2024-09",
    name: "Milwaukee 18V High Output Battery",
    category: "battery",
    status: "warranty_expiring",
    usage: "Warranty expires Nov 2026",
  },
  {
    id: "4",
    tag: "TRK-02",
    name: "Ford F-550 Service Truck",
    category: "truck",
    status: "overdue",
    usage: "62,100 miles",
  },
];

export default function EquipmentListPage() {
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredEquipment = MOCK_EQUIPMENT.filter((item) => {
    if (categoryFilter === "all") return true;
    return item.category === categoryFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            Healthy
          </span>
        );
      case "due_soon":
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            Due Soon
          </span>
        );
      case "overdue":
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            Overdue
          </span>
        );
      case "warranty_expiring":
        return (
          <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
            Warranty Alert
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Equipment Fleet</h1>
          <p className="text-xs text-gray-500">
            All registered trucks, heavy drills, and batteries.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          {["all", "truck", "drill", "battery"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition ${
                categoryFilter === cat
                  ? "bg-gray-900 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {cat === "all" ? "All Assets" : cat + "s"}
            </button>
          ))}
        </div>
      </div>

      {/* Inbox-style List Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filteredEquipment.map((item) => (
            <Link
              key={item.id}
              href={`/equipment/${item.id}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/80 transition group"
            >
              <div className="flex items-center gap-4 min-w-[280px]">
                <input
                  type="checkbox"
                  onClick={(e) => e.stopPropagation()}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="font-semibold text-sm text-gray-950 w-24">
                  {item.tag}
                </span>
                <span className="text-sm text-gray-700 truncate max-w-xs">
                  {item.name}
                </span>
              </div>

              <div className="hidden sm:block text-xs text-gray-500 capitalize bg-gray-100 px-2.5 py-1 rounded">
                {item.category}
              </div>

              <div className="text-sm text-gray-600 font-medium">
                {item.usage}
              </div>

              <div className="flex items-center gap-4">
                {getStatusBadge(item.status)}
                <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
