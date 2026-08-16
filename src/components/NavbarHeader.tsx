import React, { useState } from "react";
import { 
  Search, 
  Car, 
  ShieldCheck, 
  Layers, 
  GitCompare, 
  FileText, 
  Bot, 
  Sparkles,
  Lock,
  KeyRound,
  X,
  ShieldAlert,
  Cloud,
  CheckCircle2,
  Settings,
  Loader2
} from "lucide-react";
import { NavTab, UserPersona } from "../types/tyre";
import { TyreDirectoryLogo } from "./TyreDirectoryLogo";
import { verifyAdminPin, updateAdminPin } from "../lib/security";

interface NavbarHeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  persona: UserPersona;
  setPersona: (persona: UserPersona) => void;
  comparisonCount: number;
  quotationItemCount: number;
  dbStatus?: "connected" | "quota_exceeded" | "offline";
  quotaUpgradeUrl?: string;
}

export const NavbarHeader: React.FC<NavbarHeaderProps> = ({
  activeTab,
  setActiveTab,
  persona,
  setPersona,
  comparisonCount,
  quotationItemCount,
  dbStatus = "connected",
  quotaUpgradeUrl = "https://console.firebase.google.com/project/gen-lang-client-0739778545/firestore/databases/ai-studio-liastyre-9d3f4484-47ba-4b0e-9b9c-2a079c143533/data?openUpgradeDialog=true",
}) => {
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<string>("");
  const [isVerifyingPin, setIsVerifyingPin] = useState<boolean>(false);

  // Modal Tukar PIN
  const [showChangePinModal, setShowChangePinModal] = useState<boolean>(false);
  const [newPinInput, setNewPinInput] = useState<string>("");
  const [changePinError, setChangePinError] = useState<string>("");
  const [changePinSuccess, setChangePinSuccess] = useState<string>("");

  const handleAdminAuth = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pinInput.trim()) {
      setPinError("Sila masukkan PIN keselamatan.");
      return;
    }

    try {
      setIsVerifyingPin(true);
      setPinError("");
      const isValid = await verifyAdminPin(pinInput);
      if (isValid) {
        setPersona("Kedai Tayar");
        setShowPinModal(false);
        setPinInput("");
        setPinError("");
      } else {
        setPinError("PIN tidak sah! Sila semak PIN keselamatan anda.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setPinError("Gagal mengesahkan PIN. Sila cuba lagi.");
    } finally {
      setIsVerifyingPin(false);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.trim().length < 4) {
      setChangePinError("PIN baharu mestilah sekurang-kurangnya 4 digit/aksara.");
      return;
    }

    try {
      setIsVerifyingPin(true);
      setChangePinError("");
      const success = await updateAdminPin(newPinInput);
      if (success) {
        setChangePinSuccess("PIN keselamatan berjaya dikemas kini dalam Firestore!");
        setTimeout(() => {
          setShowChangePinModal(false);
          setNewPinInput("");
          setChangePinSuccess("");
        }, 1500);
      } else {
        setChangePinError("Gagal mengemas kini PIN. Sila semak sambungan Firebase.");
      }
    } catch (err) {
      console.error("Change PIN error:", err);
      setChangePinError("Ralat sistem semasa menukar PIN.");
    } finally {
      setIsVerifyingPin(false);
    }
  };

  const handleTabClick = (tabId: NavTab) => {
    if (tabId === "inventory_dashboard" && persona !== "Kedai Tayar") {
      // Minta PIN jika cuba akses dashboard inventori semasa mod Pemilik Kenderaan
      setShowPinModal(true);
      return;
    }
    setActiveTab(tabId);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top Banner & Status Indicator */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 border-b border-slate-800/80 flex flex-wrap justify-between items-center text-xs text-slate-300 gap-2">
        {/* Cloud Sync Status */}
        <div className="flex items-center gap-2">
          {dbStatus === "quota_exceeded" ? (
            <a
              href={quotaUpgradeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/30 hover:bg-amber-500/20 transition-all cursor-pointer group"
              title="Had Firestore Free Tier Dicapai. Data beroperasi secara pantas melalui Cache Tempatan Lias Tyre. Klik untuk info kuota / naik taraf."
            >
              <Cloud className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Google Cloud: <strong className="text-amber-200">Had Quota Harian (Mod Cache Tempatan Aktif)</strong></span>
            </a>
          ) : dbStatus === "offline" ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-md border border-sky-500/20">
              <Cloud className="w-3.5 h-3.5 text-sky-400" />
              <span>Database: <strong>Mod Luar Talian (Cache Tempatan)</strong></span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
              <Cloud className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Google Cloud Database: <strong>Lias Tyre Active</strong></span>
            </span>
          )}
        </div>

        {/* Admin Mode Switcher & Actions */}
        <div className="flex items-center gap-3">
          {persona === "Pemilik Kenderaan" ? (
            <button
              onClick={() => {
                setPinInput("");
                setPinError("");
                setShowPinModal(true);
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Log masuk Admin Mode menggunakan PIN"
            >
              <Lock className="w-3.5 h-3.5" /> Admin Mode (PIN)
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPersona("Pemilik Kenderaan")}
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-md text-[11px] font-extrabold flex items-center gap-2 shadow-sm cursor-pointer transition-all hover:scale-105 active:scale-95"
                title="Tekan untuk kunci/keluar daripada Admin Mode"
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                Admin Mode On
              </button>

              <button
                onClick={() => {
                  setNewPinInput("");
                  setChangePinError("");
                  setChangePinSuccess("");
                  setShowChangePinModal(true);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-1 rounded-md text-[11px] font-bold border border-slate-700 transition-all flex items-center gap-1"
                title="Tukar PIN Keselamatan Admin"
              >
                <Settings className="w-3 h-3 text-amber-400" /> Tukar PIN
              </button>

              <button
                onClick={() => setActiveTab("inventory_dashboard")}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-md transition-all transform hover:scale-105"
                title="Buka Menu Pengurusan Stok Master"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" /> Pengurusan Stock
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Logo & Navigation Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab("smart_search")}
          className="cursor-pointer group hover:scale-[1.02] transition-transform"
        >
          <TyreDirectoryLogo showText size={42} textSize="lg" />
        </div>

        {/* Primary Nav Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {[
            { id: "smart_search" as NavTab, label: "Search", icon: Search },
            { id: "vehicle_matching" as NavTab, label: "Padanan", icon: Car },
            { id: "brand_directory" as NavTab, label: "Jenama", icon: ShieldCheck },
            { id: "pattern_directory" as NavTab, label: "Pattern & Saiz", icon: Layers },
            { 
              id: "comparison" as NavTab, 
              label: "Banding", 
              icon: GitCompare,
              badge: comparisonCount > 0 ? comparisonCount : undefined 
            },
            { 
              id: "quotation" as NavTab, 
              label: "Sebut Harga", 
              icon: FileText,
              badge: quotationItemCount > 0 ? quotationItemCount : undefined 
            },
            { id: "ai_advisor" as NavTab, label: "AI Advisor", icon: Bot },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                    isActive ? "bg-white text-red-900" : "bg-red-600 text-white"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Admin PIN Verification Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative space-y-5">
            <button
              onClick={() => {
                setShowPinModal(false);
                setPinInput("");
                setPinError("");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-amber-400">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white">Akses Admin Kedai</h3>
              <p className="text-xs text-slate-400">
                Masukkan PIN Pentadbir Lias Tyre untuk menguruskan harga kos, margin untung dan stok.
              </p>
            </div>

            <form onSubmit={handleAdminAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 text-center">
                  PIN Keselamatan
                </label>
                <input
                  type="password"
                  maxLength={10}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    if (pinError) setPinError("");
                  }}
                  placeholder="• • • •"
                  autoFocus
                  className="w-full text-center tracking-[0.5em] text-2xl font-bold font-mono bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-3 text-white outline-none"
                />
              </div>

              {pinError && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-2.5 rounded-lg text-xs font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{pinError}</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinModal(false);
                    setPinInput("");
                    setPinError("");
                  }}
                  className="w-1/2 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingPin}
                  className="w-1/2 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-xs transition-colors shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isVerifyingPin ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mengesahkan...</span>
                    </>
                  ) : (
                    <span>Sahkan PIN</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tukar PIN Keselamatan */}
      {showChangePinModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative space-y-5">
            <button
              onClick={() => {
                setShowChangePinModal(false);
                setNewPinInput("");
                setChangePinError("");
                setChangePinSuccess("");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-amber-400">
                <Settings className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white">Tukar PIN Keselamatan</h3>
              <p className="text-xs text-slate-400">
                Tetapkan PIN baharu yang akan disimpan secara selamat (SHA-256 Hash) dalam Firestore.
              </p>
            </div>

            <form onSubmit={handleChangePin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 text-center">
                  PIN Baharu
                </label>
                <input
                  type="password"
                  maxLength={10}
                  value={newPinInput}
                  onChange={(e) => {
                    setNewPinInput(e.target.value);
                    if (changePinError) setChangePinError("");
                  }}
                  placeholder="Contoh: 5313"
                  autoFocus
                  className="w-full text-center tracking-[0.5em] text-2xl font-bold font-mono bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-3 text-white outline-none"
                />
              </div>

              {changePinError && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-2.5 rounded-lg text-xs font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{changePinError}</span>
                </div>
              )}

              {changePinSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-2.5 rounded-lg text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{changePinSuccess}</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePinModal(false);
                    setNewPinInput("");
                    setChangePinError("");
                    setChangePinSuccess("");
                  }}
                  className="w-1/2 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingPin}
                  className="w-1/2 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-xs transition-colors shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isVerifyingPin ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan PIN</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
