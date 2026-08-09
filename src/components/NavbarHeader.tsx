import React, { useState, useEffect } from "react";
import { 
  Search, 
  Car, 
  ShieldCheck, 
  Layers, 
  GitCompare, 
  FileText, 
  Bot, 
  Store, 
  User as UserIcon, 
  Sparkles,
  Lock,
  Unlock,
  KeyRound,
  X,
  ShieldAlert,
  LogOut,
  Cloud,
  CloudCheck
} from "lucide-react";
import { NavTab, UserPersona } from "../types/tyre";
import { TyreDirectoryLogo } from "./TyreDirectoryLogo";
import { signInWithGoogle, logoutGoogle, onAuthStateChanged, auth, User } from "../lib/firebase";

interface NavbarHeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  persona: UserPersona;
  setPersona: (persona: UserPersona) => void;
  comparisonCount: number;
  quotationItemCount: number;
}

export const NavbarHeader: React.FC<NavbarHeaderProps> = ({
  activeTab,
  setActiveTab,
  persona,
  setPersona,
  comparisonCount,
  quotationItemCount,
}) => {
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<string>("");
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setGoogleUser(user);
      if (user) {
        setPersona("Kedai Tayar");
      }
    });
    return () => unsubscribe();
  }, [setPersona]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoggingIn(true);
      const user = await signInWithGoogle();
      if (user) {
        setPersona("Kedai Tayar");
        setShowPinModal(false);
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await logoutGoogle();
  };

  const handleAdminAuth = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput.trim() === "5313") {
      setPersona("Kedai Tayar");
      setShowPinModal(false);
      setPinInput("");
      setPinError("");
    } else {
      setPinError("PIN tidak sah! Sila masukkan PIN 5313.");
    }
  };

  const handleTabClick = (tabId: NavTab) => {
    if (tabId === "inventory_dashboard" && persona !== "Kedai Tayar") {
      // Prompt PIN if trying to access inventory dashboard in Pemilik Kenderaan mode
      setShowPinModal(true);
      return;
    }
    setActiveTab(tabId);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top Banner & Persona Selection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 border-b border-slate-800/80 flex flex-wrap justify-between items-center text-xs text-slate-300 gap-2">
        {/* Cloud Sync Status */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
            <Cloud className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Google Cloud Database: <strong>Lias Tyre Active</strong></span>
          </span>

          {googleUser && (
            <div className="hidden sm:flex items-center gap-2 bg-slate-800/90 text-slate-200 border border-slate-700 px-2 py-0.5 rounded-md text-[11px]">
              {googleUser.photoURL ? (
                <img src={googleUser.photoURL} alt={googleUser.displayName || "Owner"} className="w-4 h-4 rounded-full" />
              ) : (
                <UserIcon className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="font-bold truncate max-w-[150px]">{googleUser.displayName || googleUser.email}</span>
              <button
                onClick={handleGoogleSignOut}
                className="text-slate-400 hover:text-rose-400 ml-1 font-bold"
                title="Log Keluar Google"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Persona Switcher / Admin Trigger */}
        <div className="flex items-center gap-3">
          {!googleUser && (
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoggingIn}
              className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              title="Sambung ke Google Account Owner Lias Tyre"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isLoggingIn ? "Sambung..." : "Google Login Owner"}</span>
            </button>
          )}

          {persona === "Pemilik Kenderaan" ? (
            <button
              onClick={() => {
                setPinInput("");
                setPinError("");
                setShowPinModal(true);
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
              title="Log masuk Admin Mode"
            >
              <Lock className="w-3.5 h-3.5" /> Admin Mode
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span 
                onClick={() => setPersona("Pemilik Kenderaan")}
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-md text-[11px] font-extrabold flex items-center gap-2 shadow-sm cursor-pointer transition-all hover:scale-105 active:scale-95"
                title="Tekan untuk matikan Admin Mode"
                role="button"
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                Admin Mode On
              </span>

              <button
                onClick={() => setActiveTab("inventory_dashboard")}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-md transition-all transform hover:scale-105"
                title="Buka Menu Auto-Sync Master Data Stok"
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

      {/* Admin PIN Login Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
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
              <h3 className="text-xl font-bold tracking-tight text-white">Log Masuk Mod Admin</h3>
              <p className="text-xs text-slate-400">
                Masukkan PIN Pentadbir Kedai Tayar untuk membuka maklumat kos, margin untung dan dashboard inventori.
              </p>
            </div>

            <form onSubmit={handleAdminAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 text-center">
                  PIN Keselamatan
                </label>
                <input
                  type="password"
                  maxLength={6}
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
                  className="w-1/2 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-xs transition-colors shadow-lg"
                >
                  Sahkan PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
