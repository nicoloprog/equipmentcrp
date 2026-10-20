"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

// Mock maintenance work orders
const MOCK_WORK_ORDERS = [
  {
    id: "WO-101",
    assetTag: "TRK-02",
    assetName: "Ford F-550 Service Truck",
    taskName: "Regular Oil Change & Filter Replacement",
    category: "truck",
    dueDate: "2026-04-10",
    status: "overdue",
    priority: "high",
  },
  {
    id: "WO-102",
    assetTag: "DRL-04",
    assetName: "Atlas Copco Rig Drill",
    taskName: "Hydraulic Fluid Flush",
    category: "drill",
    dueDate: "2026-04-25",
    status: "due_soon",
    priority: "medium",
  },
  {
    id: "WO-103",
    assetTag: "BAT-2024-09",
    assetName: "Milwaukee 18V High Output Battery",
    category: "battery",
    taskName: "Warranty Expiration Review / Claim",
    categoryType: "battery",
    dueDate: "2026-05-01",
    status: "due_soon",
    priority: "high",
  },
  {
    id: "WO-104",
    assetTag: "TRK-01",
    assetName: "Freightliner Heavy Transport",
    taskName: "Annual Safety Inspection",
    category: "truck",
    dueDate: "2026-05-15",
    status: "upcoming",
    priority: "low",
  },
];

export default function MaintenanceQueuePage() {
  const [workOrders, setWorkOrders] = useState(MOCK_WORK_ORDERS);
  const [filter, setFilter] = useState("all");

  const handleCompleteTask = (id: string) => {
    setWorkOrders((prev) =>
      prev.map((wo) => (wo.id === id ? { ...wo, status: "completed" } : wo)),
    );
  };

  const filteredOrders = workOrders.filter((wo) => {
    if (filter === "all") return true;
    if (filter === "overdue") return wo.status === "overdue";
    if (filter === "due_soon") return wo.status === "due_soon";
    if (filter === "completed") return wo.status === "completed";
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "overdue":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            Overdue
          </span>
        );
      case "due_soon":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
            Due Soon
          </span>
        );
      case "upcoming":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            Upcoming
          </span>
        );
      case "completed":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Maintenance Queue & Work Orders
            </h1>
            <p className="text-sm text-gray-500">
              Track oil changes, fluid flushes, safety inspections, and battery
              warranty limits.
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2 overflow-x-auto">
          {["all", "due_soon", "overdue", "completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition whitespace-nowrap ${
                filter === tab
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab === "all" ? "All Work Orders" : tab.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Work Orders List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Asset / ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Maintenance Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((wo) => (
                    <tr key={wo.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                            <Wrench className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {wo.assetTag}
                            </div>
                            <div className="text-sm text-gray-500">
                              {wo.assetName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {wo.taskName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex items-center gap-1.5 mt-3">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {wo.dueDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(wo.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {wo.status !== "completed" ? (
                          <button
                            onClick={() => handleCompleteTask(wo.id)}
                            className="inline-flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 font-medium px-3 py-1.5 rounded-lg border border-green-200 transition"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark Complete
                          </button>
                        ) : (
                          <span className="text-gray-400 font-medium text-xs">
                            Done
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500 text-sm"
                    >
                      No maintenance tasks found for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
