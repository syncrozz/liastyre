import React, { useState, useMemo } from "react";
import { Car, CheckCircle2, ArrowRight, Shield, Sparkles, Check, GitCompare, PlusCircle, Info, RefreshCw, Warehouse } from "lucide-react";
import { VEHICLE_MAKES, VEHICLE_DATABASE } from "../data/vehiclesData";
import { Tire, UserPersona } from "../types/tyre";
import { TireCardShowcase } from "./TireCardShowcase";

interface VehicleMatchingSectionProps {
  tyres: Tire[];
  persona: UserPersona;
  comparisonList: Tire[];
  onToggleCompare: (tire: Tire) => void;
  onAddToQuotation: (tire: Tire) => void;
  onViewDetail: (tire: Tire) => void;
  onUpdateStock?: (tireId: string, newStock: number) => void;
}

export const VehicleMatchingSection: React.FC<VehicleMatchingSectionProps> = ({
  tyres,
  persona,
  comparisonList,
  onToggleCompare,
  onAddToQuotation,
  onViewDetail,
  onUpdateStock,
}) => {
  const [selectedMake, setSelectedMake] = useState<string>("Toyota");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");

  // Filter vehicles by selected make
  const availableVehicles = useMemo(() => {
    return VEHICLE_DATABASE.filter((v) => v.make.toLowerCase() === selectedMake.toLowerCase());
  }, [selectedMake]);

  // Active vehicle model selection
  const selectedVehicle = useMemo(() => {
    if (selectedVehicleId) {
      return VEHICLE_DATABASE.find((v) => v.id === selectedVehicleId) || availableVehicles[0];
    }
    return availableVehicles[0] || VEHICLE_DATABASE[0];
  }, [selectedVehicleId, availableVehicles]);

  // Find tires matching OEM size or Upgrade sizes
  const matchedTyres = useMemo(() => {
    if (!selectedVehicle) return [];

    const targetSizes = [selectedVehicle.oeSize, ...selectedVehicle.upgradeSizes].map((s) => s.toLowerCase());

    return tyres.filter((t) => {
      return targetSizes.includes(t.size.toLowerCase());
    });
  }, [selectedVehicle, tyres]);

  return (
    <div className="space-y-6">
      {/* Top Explanation Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 mb-2">
              <Car className="w-3.5 h-3.5 text-red-600" /> Padanan Kenderaan Automatik (Vehicle Matching)
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Cari Tayar Mengikut Model Kereta Pelanggan
            </h2>
            <p className="text-slate-500 text-sm mt-1 max-w-2xl">
              Pengguna tidak perlu mengingati saiz tayar asal. Pilih jenama dan model kereta di bawah untuk memaparkan saiz OEM serta tayar serasi secara automatik.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 font-medium space-y-1">
            <p className="flex items-center gap-1 text-red-600 font-bold">
              <Sparkles className="w-4 h-4" /> Contoh Padanan:
            </p>
            <p className="text-slate-600">Toyota → Vios → 2022 = <strong className="text-slate-900 font-mono">205/55R16</strong></p>
            <p className="text-slate-600">Perodua → Myvi → Gen 3 = <strong className="text-slate-900 font-mono">185/55R15</strong></p>
          </div>
        </div>
      </div>

      {/* Step 1 & 2 Selector Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        {/* Make Selector Tabs */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Langkah 1: Pilih Jenama Kenderaan
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
            {VEHICLE_MAKES.map((make) => {
              const isActive = selectedMake === make;
              return (
                <button
                  key={make}
                  onClick={() => {
                    setSelectedMake(make);
                    setSelectedVehicleId("");
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border text-center ${
                    isActive
                      ? "bg-red-600 text-white border-red-600 shadow-sm font-bold"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  {make}
                </button>
              );
            })}
          </div>
        </div>

        {/* Model Selector Cards */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Langkah 2: Pilih Model Kenderaan ({selectedMake})
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {availableVehicles.map((v) => {
              const isSelected = selectedVehicle?.id === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVehicleId(v.id)}
                  className={`p-4 rounded-xl text-left transition-all border flex flex-col justify-between ${
                    isSelected
                      ? "bg-red-50/60 border-red-500 shadow-sm ring-1 ring-red-500/50"
                      : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{v.model}</h4>
                      <p className="text-xs text-slate-500 font-medium">{v.yearRange}</p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-red-600 shrink-0" />}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono">OE: <strong className="text-red-600 font-bold">{v.oeSize}</strong></span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                      {v.recommendedCategory}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Matching Results Header */}
      {selectedVehicle && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900">
                  Tayar Serasi Untuk {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.yearRange})
                </h3>
              </div>
              <p className="text-slate-500 text-xs mt-1">
                Saiz Kilang (OE): <span className="text-red-600 font-mono font-bold">{selectedVehicle.oeSize}</span> | Saiz Naiktaraf (Upgrade): <span className="text-slate-700 font-mono font-semibold">{selectedVehicle.upgradeSizes.join(", ")}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                {matchedTyres.length} Tayar Padan Ditemui
              </span>
            </div>
          </div>

          {/* Matched Tires Grid */}
          {matchedTyres.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              Tiada rekod tayar langsung dalam inventori untuk saiz {selectedVehicle.oeSize}. Sila semak semula modul inventori.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {matchedTyres.map((tire) => {
                const isCompared = comparisonList.some((t) => t.id === tire.id);

                return (
                  <TireCardShowcase
                    key={tire.id}
                    tire={tire}
                    persona={persona}
                    onViewDetail={onViewDetail}
                    isCompared={isCompared}
                    onToggleCompare={onToggleCompare}
                    onAddToQuotation={onAddToQuotation}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
