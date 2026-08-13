import React, { useState } from "react";
import { FileText, Printer, Trash2, Plus, Minus, CheckCircle, Calculator, User, Phone, Car, Tag, Sparkles, CheckCircle2, DollarSign, PackageCheck, AlertCircle } from "lucide-react";
import { Tire, QuotationItem, UserPersona } from "../types/tyre";

interface QuotationInvoiceSectionProps {
  items: QuotationItem[];
  persona?: UserPersona;
  onUpdateQuantity: (tireId: string, delta: number) => void;
  onRemoveItem: (tireId: string) => void;
  onClearAll: () => void;
  onDeductStock?: (itemsToDeduct: { tireId: string; quantity: number }[]) => void;
}

export const QuotationInvoiceSection: React.FC<QuotationInvoiceSectionProps> = ({
  items,
  persona,
  onUpdateQuantity,
  onRemoveItem,
  onClearAll,
  onDeductStock,
}) => {
  const [customerName, setCustomerName] = useState("Encik Hafiz");
  const [customerPhone, setCustomerPhone] = useState("012-3456789");
  const [vehicleModel, setVehicleModel] = useState("Toyota Vios 1.5G (2022)");
  const [vehiclePlate, setVehiclePlate] = useState("VJK 8899");
  const [installationFeePerTire, setInstallationFeePerTire] = useState(10);
  const [balancingFeePerTire, setBalancingFeePerTire] = useState(10);
  const [alignmentFee, setAlignmentFee] = useState(60);
  const [tradeInDiscount, setTradeInDiscount] = useState(40);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Payment state
  const [isPaid, setIsPaid] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState("");

  // Math Calculations
  const tiresSubtotal = items.reduce((sum, item) => sum + item.tire.marketPrice * item.quantity, 0);
  const totalTiresQty = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalInstallation = totalTiresQty * installationFeePerTire;
  const totalBalancing = totalTiresQty * balancingFeePerTire;
  const subtotalAll = tiresSubtotal + totalInstallation + totalBalancing + alignmentFee;
  const grandTotal = Math.max(0, subtotalAll - tradeInDiscount);

  const quotationNo = "LT-QT-" + Math.floor(100000 + Math.random() * 900000);
  const todayDate = new Date().toLocaleDateString("ms-MY", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const handleConfirmPaid = () => {
    if (items.length === 0) return;
    
    // Deduct stock
    if (onDeductStock) {
      const deductionList = items.map((i) => ({
        tireId: i.tire.id,
        quantity: i.quantity,
      }));
      onDeductStock(deductionList);
    }

    setIsPaid(true);
    setPaymentNotice(`Pembayaran RM${grandTotal} Sah & Berjaya! Stok ${totalTiresQty} biji tayar telah dipotong secara automatik dari inventori kedai.`);
  };

  const handleResetPaid = () => {
    setIsPaid(false);
    setPaymentNotice("");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 mb-2">
            <FileText className="w-3.5 h-3.5 text-red-600" /> Penjana Sebut Harga Kaunter (Quotation & Invoice Generator)
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sebut Harga / Invois Jualan Kedai Tayar
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Sediakan resit sebut harga pantas untuk pelanggan kaunter merangkumi tayar, caj pemasangan, balancing, alignment dan diskaun trade-in tayar terpakai.
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPrintModal(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" /> Cetak / Muat Turun Invois PDF
            </button>
            <button
              onClick={onClearAll}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Kosongkan
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer & Vehicle Input Form */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-red-700 border-b border-slate-100 pb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-red-600" /> Maklumat Pelanggan & Kenderaan
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Nama Pelanggan</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="cth: Encik Ahmad"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:border-red-500 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">No Telefon</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="cth: 012-3456789"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:border-red-500 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Model Kenderaan</label>
              <input
                type="text"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="cth: Toyota Vios 2022"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:border-red-500 focus:bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">No Plat Kenderaan</label>
              <input
                type="text"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                placeholder="cth: VJK 8899"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono uppercase focus:border-red-500 focus:bg-white outline-none"
              />
            </div>
          </div>

          <h3 className="text-sm font-bold uppercase tracking-wider text-red-700 border-b border-slate-100 pb-2 pt-4 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-red-600" /> Caj Perkhidmatan & Diskaun (RM)
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 font-bold mb-1">Pasang / Biji</label>
              <input
                type="number"
                value={installationFeePerTire}
                onChange={(e) => setInstallationFeePerTire(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">Balancing / Biji</label>
              <input
                type="number"
                value={balancingFeePerTire}
                onChange={(e) => setBalancingFeePerTire(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">Alignment Kereta</label>
              <input
                type="number"
                value={alignmentFee}
                onChange={(e) => setAlignmentFee(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-bold mb-1">Trade-in Diskaun</label>
              <input
                type="number"
                value={tradeInDiscount}
                onChange={(e) => setTradeInDiscount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-emerald-700 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Quotation Items Table & Summary */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Senarai Tayar Dalam Sebut Harga ({items.length} Item)
              </h3>
              <span className="text-xs text-red-600 font-mono font-bold">
                Jumlah Tayar: {totalTiresQty} Biji
              </span>
            </div>

            {items.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-3">
                <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">Senarai Sebut Harga Masih Kosong</p>
                <p className="text-xs text-slate-500">
                  Sila tekan butang <strong className="text-red-600">+ Sebut Harga</strong> pada mana-mana tayar di direktori untuk menambahkannya ke resit ini.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {items.map((item) => (
                  <div key={item.tire.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 uppercase">
                        {item.tire.brand}
                      </span>
                      <h4 className="text-lg font-extrabold font-mono text-slate-900">{item.tire.size}</h4>
                      <p className="text-xs text-slate-700 font-medium">{item.tire.model} ({item.tire.pattern})</p>
                      <p className="text-xs text-slate-500 font-mono">RM{item.tire.marketPrice} / biji</p>
                    </div>

                    {/* Qty Controls */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-slate-200 bg-slate-50 rounded-lg">
                        <button
                          onClick={() => onUpdateQuantity(item.tire.id, -1)}
                          className="px-2.5 py-1 text-slate-500 hover:text-slate-800"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 py-1 font-bold font-mono text-slate-800 text-sm">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.tire.id, 1)}
                          className="px-2.5 py-1 text-slate-500 hover:text-slate-800"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right min-w-[90px]">
                        <span className="text-xs text-slate-500 block font-medium">Subtotal</span>
                        <span className="text-base font-extrabold text-red-600">
                          RM{item.tire.marketPrice * item.quantity}
                        </span>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.tire.id)}
                        className="text-rose-600 hover:text-rose-700 p-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Calculations Summary & Payment Action */}
          {items.length > 0 && (
            <div className="space-y-4">
              {paymentNotice && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-start gap-3 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-emerald-900">Status Pembayaran: DIBAYAR (PAID)</p>
                    <p>{paymentNotice}</p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 space-y-2 bg-slate-50 p-4 rounded-xl text-xs border">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Tayar ({totalTiresQty} biji):</span>
                  <span className="font-mono font-bold text-slate-900">RM{tiresSubtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Caj Pemasangan Tayar:</span>
                  <span className="font-mono text-slate-900">RM{totalInstallation}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Caj Wheel Balancing ({totalTiresQty} roda):</span>
                  <span className="font-mono text-slate-900">RM{totalBalancing}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Caj Wheel Alignment:</span>
                  <span className="font-mono text-slate-900">RM{alignmentFee}</span>
                </div>
                {tradeInDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Diskaun Trade-in Tayar Terpakai:</span>
                    <span className="font-mono">-RM{tradeInDiscount}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">JUMLAH KESELURUHAN (NETT):</span>
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider mt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Status: Paid (Lunas)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-md text-[10px] font-bold mt-1">
                        <AlertCircle className="w-3 h-3 text-amber-600" /> Belum Dibayar
                      </span>
                    )}
                  </div>
                  <span className="text-2xl font-extrabold text-red-600 font-mono">RM{grandTotal}</span>
                </div>

                {/* Confirm Paid Button */}
                <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row gap-2 justify-end">
                  {!isPaid ? (
                    <button
                      onClick={handleConfirmPaid}
                      className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                      title="Sahkan bayaran dan tolak baki stok secara automatik"
                    >
                      <DollarSign className="w-4 h-4" /> Sahkan Bayaran & Potong Stok (Paid)
                    </button>
                  ) : (
                    <button
                      onClick={handleResetPaid}
                      className="w-full sm:w-auto px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                    >
                      Reset Status Bayaran
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Official Printable Quotation Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-8 shadow-2xl space-y-6">
            {/* Header Slip */}
            <div className="flex items-start justify-between border-b pb-4 border-slate-200">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">LIAS TYRE (PUSAT SERVIS TAYAR & AUTO)</h2>
                <p className="text-xs text-slate-600">No 18, Jalan Industri Tayar Utama, 40000 Shah Alam, Selangor</p>
                <p className="text-xs text-slate-600">Tel: 03-5566 7788 | Email: sales@liastyre.my</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-red-600 block">SEBUT HARGA / INVOIS</span>
                <span className="text-xs font-mono font-bold text-slate-700">{quotationNo}</span>
                <span className="text-[11px] text-slate-500 block">{todayDate}</span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <p className="text-slate-500 font-medium">Pelanggan:</p>
                <p className="font-bold text-slate-900">{customerName}</p>
                <p className="text-slate-700">{customerPhone}</p>
              </div>
              <div>
                <p className="text-slate-500 font-medium">Kenderaan & No Plat:</p>
                <p className="font-bold text-slate-900">{vehicleModel}</p>
                <p className="font-mono font-bold text-red-700 uppercase">{vehiclePlate}</p>
              </div>
            </div>

            {/* Table */}
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-slate-600 uppercase font-bold">
                  <th className="py-2">Penerangan Perkhidmatan / Tayar</th>
                  <th className="py-2 text-center">Kuantiti</th>
                  <th className="py-2 text-right">Harga Unit</th>
                  <th className="py-2 text-right">Jumlah (RM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item) => (
                  <tr key={item.tire.id}>
                    <td className="py-2 font-bold text-slate-900">
                      {item.tire.brand} {item.tire.size} - {item.tire.model}
                    </td>
                    <td className="py-2 text-center font-mono">{item.quantity}</td>
                    <td className="py-2 text-right font-mono">RM{item.tire.marketPrice}</td>
                    <td className="py-2 text-right font-mono font-bold">RM{item.tire.marketPrice * item.quantity}</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2 text-slate-700">Caj Pemasangan & Balancing ({totalTiresQty} Roda)</td>
                  <td className="py-2 text-center font-mono">{totalTiresQty}</td>
                  <td className="py-2 text-right font-mono">RM{installationFeePerTire + balancingFeePerTire}</td>
                  <td className="py-2 text-right font-mono font-bold">RM{totalInstallation + totalBalancing}</td>
                </tr>
                {alignmentFee > 0 && (
                  <tr>
                    <td className="py-2 text-slate-700">Caj Wheel Alignment Kompleks</td>
                    <td className="py-2 text-center font-mono">1</td>
                    <td className="py-2 text-right font-mono">RM{alignmentFee}</td>
                    <td className="py-2 text-right font-mono font-bold">RM{alignmentFee}</td>
                  </tr>
                )}
                {tradeInDiscount > 0 && (
                  <tr className="text-emerald-700 font-semibold">
                    <td className="py-2">Diskaun Trade-in Tayar Terpakai</td>
                    <td className="py-2 text-center font-mono">-</td>
                    <td className="py-2 text-right font-mono">-</td>
                    <td className="py-2 text-right font-mono">-RM{tradeInDiscount}</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Total */}
            <div className="flex justify-between items-center border-t pt-4 border-slate-300">
              <span className="text-sm font-bold text-slate-800">JUMLAH KESELURUHAN:</span>
              <span className="text-2xl font-bold text-red-600 font-mono">RM{grandTotal}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 flex items-center gap-2 shadow-sm"
              >
                <Printer className="w-4 h-4" /> Cetak Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
