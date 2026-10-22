"use client";

import { useState } from "react";
import type { JSX } from "react";
import { Camera, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewEquipmentPage() {
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("truck");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Handle mock photo capture from device camera
  const handleCapturePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Here you would upload the photo to Supabase storage and save the equipment record
    setTimeout(() => {
      setLoading(false);
      alert("Equipment registered successfully!");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            Register New Equipment
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Assign an ID tag, capture an initial condition photo, and set
            tracking parameters.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="truck">Vehicle / Transport Truck</option>
                <option value="trailer">Remorque</option>
                <option value="drill">Outil</option>
                <option value="battery">Batterie</option>
                <option value="machinery">Machinerie</option>
              </select>
            </div>

            {/* Asset ID Tag */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unique Equipment ID / Asset Tag
              </label>
              <input
                type="text"
                required
                placeholder="e.g. TRK-04 or BAT-2026-09"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Name / Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment Name / Model
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Freightliner Heavy Transport or Milwaukee 18V Battery"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Conditional Fields based on Category */}
            {category === "battery" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warranty Expiry Date
                </label>
                <input
                  type="date"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Odometer / Operating Hours
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 45000"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Type
                  </label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    <option value="hours">Operating Hours</option>
                    <option value="miles">Miles / Kilometers</option>
                  </select>
                </div>
              </div>
            )}

            {/* Photo Capture Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipment Photo ID
              </label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2.5 rounded-lg border border-gray-300 transition font-medium text-sm">
                  <Camera className="w-5 h-5 text-gray-600" />
                  Capture / Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleCapturePhoto}
                    className="hidden"
                  />
                </label>
                {photoPreview && (
                  <span className="text-sm text-green-600 font-medium">
                    Photo attached successfully
                  </span>
                )}
              </div>
              {photoPreview && (
                <div className="mt-3 relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={photoPreview}
                    alt="Equipment preview"
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2 shadow"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              Save & Register Equipment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
