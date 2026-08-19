import React from "react";
import { GitCompare, Trash2, PlusCircle, Sparkles, Check, X, ShieldCheck, ArrowRight, Globe } from "lucide-react";
import { Tire, UserPersona } from "../types/tyre";
import { getTireMadeIn, getTireCountryFlag, getTireMadeInAndYear } from "../utils/tireOrigin";

interface ProductComparisonSectionProps {
  comparisonList: Tire[];
  persona: UserPersona;
  onRemoveCompare: (tireId: string) => void;
  onClearAllCompare: () => void;
  onAddToQuotation: (tire: Tire) => void;
  onSelectMoreFromSearch: () => void;
}

export const ProductComparisonSection: React.FC<ProductComparisonSectionProps> = ({
  comparisonList,
  persona,
  onRemoveCompare,
  onClearAllCompare,
  onAddToQuotation,
  onSelectMoreFromSearch,
}) => {
  if (comparisonList.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-600">
          <GitCompare className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tiada Tayar Dipilih Untuk Perbandingan</h2>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
            Sila pilih 2 hingga 4 tayar dari modul <strong className="text-red-600">Search</strong> atau <strong className="text-red-600">Padanan</strong> untuk membandingkan spesifikasi & harga serentak.
          </p>
        </div>
        <button
          onClick={onSelectMoreFromSearch}
          className="px-5 py-2.5 bg-red-600 text-white font-bold text-sm rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2 shadow-sm"
        >
          Buka Search Sekarang <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Identify top attributes
  const cheapestPrice = Math.min(...comparisonList.map((t) => t.marketPrice));
  const quietestNoise = Math.min(...comparisonList.map((t) => t.noiseLevelDb));
  const longestLife = Math.max(...comparisonList.map((t) => t.treadLifeKm));

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 mb-2">
            <GitCompare className="w-3.5 h-3.5 text-red-600" /> Product Comparison Matrix
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Perbandingan Produk Tayar Serentak ({comparisonList.length} Model)
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Bandingkan harga pasaran, cengkaman basah, tahap bunyi dB, jangka hayat km dan margin keuntungan secara bersisi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSelectMoreFromSearch}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5"
          >
            + Tambah Lagi Tayar
          </button>

          <button
            onClick={onClearAllCompare}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Kosongkan Senarai
          </button>
        </div>
      </div>

      {/* Comparison Matrix Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="p-4 text-xs font-bold uppercase text-slate-500 w-1/5 tracking-wider">
                Kriteria Perbandingan
              </th>
              {comparisonList.map((tire) => (
                <th key={tire.id} className="p-4 text-center border-l border-slate-200 min-w-[200px]">
                  <div className="space-y-2">
                    <button
                      onClick={() => onRemoveCompare(tire.id)}
                      className="text-rose-600 hover:text-rose-700 text-[10px] font-bold flex items-center gap-1 mx-auto hover:underline"
                    >
                      <X className="w-3 h-3" /> Buang
                    </button>

                    <div className="font-extrabold text-red-600 text-xs uppercase tracking-wider">{tire.brand}</div>
                    <div className="text-xl font-extrabold font-mono text-slate-900">{tire.size}</div>
                    <div className="text-xs font-bold text-slate-700">{tire.model}</div>

                    <button
                      onClick={() => onAddToQuotation(tire)}
                      className="w-full mt-2 px-2.5 py-1.5 bg-red-600 text-white font-bold text-xs rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1 shadow-sm"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Sebut Harga
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 text-sm">
            {/* Row 1: Harga Pasaran */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Harga Cadangan Pasaran</td>
              {comparisonList.map((tire) => {
                const isBest = tire.marketPrice === cheapestPrice;
                return (
                  <td key={tire.id} className="p-4 text-center border-l border-slate-200">
                    <div className="text-2xl font-extrabold text-red-600">RM{tire.marketPrice}</div>
                    {isBest && (
                      <span className="inline-block mt-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                        ★ Harga Paling Penjimatan
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Row: Made In & Tahun Keluaran */}
            <tr className="hover:bg-slate-50 transition-colors bg-slate-50/30">
              <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Made In & Tahun</td>
              {comparisonList.map((tire) => {
                const madeIn = getTireMadeIn(tire);
                const flag = getTireCountryFlag(madeIn);
                const text = getTireMadeInAndYear(tire);
                return (
                  <td key={tire.id} className="p-4 text-center border-l border-slate-200">
                    <span className="inline-flex items-center gap-1 bg-slate-900 text-white text-xs font-black px-2.5 py-1 rounded shadow-xs uppercase font-mono">
                      <span>{flag}</span>
                      <span>{text}</span>
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* Row 2: Margin Untung Kedai (If Persona == Kedai Tayar) */}
            {persona === "Kedai Tayar" && (
              <tr className="hover:bg-slate-50 transition-colors bg-emerald-50/30">
                <td className="p-4 font-bold text-emerald-800 bg-slate-50/50">Kos Kedai & Margin Untung</td>
                {comparisonList.map((tire) => (
                  <td key={tire.id} className="p-4 text-center border-l border-slate-200">
                    <div className="text-xs text-slate-500 font-mono">Kos: RM{tire.costPrice}</div>
                    <div className="text-sm font-bold text-emerald-700 mt-0.5">+RM{tire.profit} Untung</div>
                  </td>
                ))}
              </tr>
            )}

            {/* Row 3: Cengkaman Basah (Wet Grip) */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Prestasi Cengkaman Basah</td>
              {comparisonList.map((tire) => (
                <td key={tire.id} className="p-4 text-center border-l border-slate-200 font-bold">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                    tire.wetGripRating === "A" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-700"
                  }`}>
                    Gred {tire.wetGripRating}
                  </span>
                </td>
              ))}
            </tr>

            {/* Row 4: Bunyi Kabin (Noise Level) */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Tahap Bunyi Pemanduan</td>
              {comparisonList.map((tire) => {
                const isQuietest = tire.noiseLevelDb === quietestNoise;
                return (
                  <td key={tire.id} className="p-4 text-center border-l border-slate-200">
                    <div className="font-bold text-slate-800">{tire.noiseLevelDb} dB</div>
                    {isQuietest && (
                      <span className="inline-block mt-1 text-[10px] bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-bold">
                        🔇 Kabin Paling Senyap
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Row 5: Penjimatan Minyak */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Penjimatan Bahan Api</td>
              {comparisonList.map((tire) => (
                <td key={tire.id} className="p-4 text-center border-l border-slate-200 font-bold text-red-600">
                  Gred {tire.fuelSavingRating}
                </td>
              ))}
            </tr>

            {/* Row 6: Jangka Hayat Anggaran */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Anggaran Jangka Hayat</td>
              {comparisonList.map((tire) => {
                const isLongest = tire.treadLifeKm === longestLife;
                return (
                  <td key={tire.id} className="p-4 text-center border-l border-slate-200">
                    <div className="font-bold text-slate-800 font-mono">{(tire.treadLifeKm / 1000).toFixed(0)}k KM</div>
                    {isLongest && (
                      <span className="inline-block mt-1 text-[10px] bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded font-bold">
                        💪 Bunga Paling Tahan Lama
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Row 7: Kedalaman Bunga Tayar Asal */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Kedalaman Bunga (Tread Depth)</td>
              {comparisonList.map((tire) => (
                <td key={tire.id} className="p-4 text-center border-l border-slate-200 font-mono font-bold text-red-600">
                  {tire.treadDepthMm} mm
                </td>
              ))}
            </tr>

            {/* Row 8: Status Stok Kedai */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Status Stok Inventori</td>
              {comparisonList.map((tire) => (
                <td key={tire.id} className="p-4 text-center border-l border-slate-200 font-bold">
                  <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                    tire.totalStock > 0 ? "text-emerald-700 bg-emerald-50 border border-emerald-200" : "text-rose-700 bg-rose-50 border border-rose-200"
                  }`}>
                    {tire.totalStock} Biji
                  </span>
                </td>
              ))}
            </tr>

            {/* Row 9: Ciri-ciri Teknologi */}
            <tr className="hover:bg-slate-50 transition-colors">
              <td className="p-4 font-bold text-slate-700 bg-slate-50/50">Teknologi Pengeluar</td>
              {comparisonList.map((tire) => (
                <td key={tire.id} className="p-4 text-center border-l border-slate-200">
                  <div className="flex flex-wrap justify-center gap-1">
                    {tire.keyTechnologies.map((tech) => (
                      <span key={tech} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-medium">
                        {tech}
                      </span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
