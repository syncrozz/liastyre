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
  CloudCheck,
  CheckCircle2,
  Plus,
  Trash2,
  UserCheck,
  UserX
} from "lucide-react";
import { NavTab, UserPersona } from "../types/tyre";
import { TyreDirectoryLogo } from "./TyreDirectoryLogo";
import { signInWithGoogle, logoutGoogle, onAuthStateChanged, auth, db, doc, setDoc, onSnapshot, User } from "../lib/firebase";

interface NavbarHeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  persona: UserPersona;
  setPersona: (persona: UserPersona) => void;
  comparisonCount: number;
  quotationItemCount: number;
}

// Senarai E-mel Owner Asal (Default Whitelist)
const DEFAULT_AUTHORIZED_OWNERS = ["khaikerr@gmail.com"];

export const NavbarHeader: React.FC<NavbarHeaderProps> = ({
  activeTab,
  setActiveTab,
  persona,
  setPersona,
  comparisonCount,
  quotationItemCount,
}) => {
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  // Google Authentication
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Whitelist Owner
  const [authorizedEmails, setAuthorizedEmails] = useState<string[]>(
    DEFAULT_AUTHORIZED_OWNERS,
  );

  const [unauthorizedModal, setUnauthorizedModal] = useState<{
    show: boolean;
    email: string;
  }>({
    show: false,
    email: "",
  });

  const [showOwnersModal, setShowOwnersModal] = useState(false);
  const [newOwnerEmailInput, setNewOwnerEmailInput] = useState("");

  // Sync Whitelisted Emails with Firestore
  useEffect(() => {
    const docRef = doc(db, "settings", "authorized_owners");

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();

        if (Array.isArray(data.emails) && data.emails.length > 0) {
          setAuthorizedEmails(data.emails);
        }

        return;
      }

      // Seed default whitelist
      setDoc(docRef, {
        emails: DEFAULT_AUTHORIZED_OWNERS,
      }).catch((error) => {
        console.error("Failed to seed authorized owners:", error);
      });
    });

    return unsubscribe;
  }, []);

  // Helper check
  const isAuthorizedOwner = (email: string | null | undefined): boolean => {
    if (!email) return false;
    return authorizedEmails.some((e) => e.trim().toLowerCase() === email.trim().toLowerCase());
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setGoogleUser(user);
      if (user && user.email) {
        if (isAuthorizedOwner(user.email)) {
          setPersona("Kedai Tayar");
        } else {
          setPersona("Pemilik Kenderaan");
          setUnauthorizedModal({ show: true, email: user.email });
        }
      }
    });
    return () => unsubscribe();
  }, [setPersona, authorizedEmails]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoggingIn(true);
      const user = await signInWithGoogle();
      if (user && user.email) {
        if (isAuthorizedOwner(user.email)) {
          setPersona("Kedai Tayar");
          setShowPinModal(false);
        } else {
          setPersona("Pemilik Kenderaan");
          setUnauthorizedModal({ show: true, email: user.email });
        }
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleSignOut = async () => {
    await logoutGoogle();
    setPersona("Pemilik Kenderaan");
  };

  const handleAddOwnerEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = newOwnerEmailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) return;

    if (authorizedEmails.includes(cleanEmail)) {
      setNewOwnerEmailInput("");
      return;
    }

    const updated = [...authorizedEmails, cleanEmail];
    setAuthorizedEmails(updated);
    setNewOwnerEmailInput("");

    try {
      await setDoc(doc(db, "settings", "authorized_owners"), { emails: updated });
    } catch (err) {
      console.error("Error updating authorized owners in Firestore:", err);
    }
  };

  const handleRemoveOwnerEmail = async (emailToRemove: string) => {
    if (authorizedEmails.length <= 1) {
      alert("Sekurang-kurangnya 1 e-mel owner mestilah dikekalkan dalam senarai.");
      return;
    }
    const updated = authorizedEmails.filter((e) => e.toLowerCase() !== emailToRemove.toLowerCase());
    setAuthorizedEmails(updated);

    try {
      await setDoc(doc(db, "settings", "authorized_owners"), { emails: updated });
    } catch (err) {
      console.error("Error removing owner email from Firestore:", err);
    }
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
              {isAuthorizedOwner(googleUser.email) && (
                <button
                  onClick={() => setShowOwnersModal(true)}
                  className="bg-slate-700 hover:bg-slate-600 text-amber-300 text-[10px] px-1.5 py-0.5 rounded font-bold transition-all flex items-center gap-0.5"
                  title="Urus Senarai E-mel Owner Dibenarkan"
                >
                  <UserCheck className="w-3 h-3 text-emerald-400" /> Whitelist
                </button>
              )}
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

      {/* Unauthorized User Attempt Modal */}
      {unauthorizedModal.show && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-rose-500/30 text-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setUnauthorizedModal({ show: false, email: "" })}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <UserX className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Akses Admin Ditolak</h3>
                <p className="text-xs text-rose-400 font-semibold truncate max-w-[260px]">
                  {unauthorizedModal.email}
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs text-slate-300 leading-relaxed">
              <p className="font-semibold text-amber-300">
                🔒 E-mel Google anda bukan pemilik/owner berdaftar Lias Tyre.
              </p>
              <p>
                Sistem SaaS ini dilindungi dengan ketat. Hanya e-mel owner yang telah disahkan sahaja boleh mengakses data harga kos, margin untung, dan pengurusan stok Lias Tyre.
              </p>
              <p className="text-slate-400 text-[11px]">
                Mod akaun anda dikekalkan sebagai <strong className="text-white">Pemilik Kenderaan (Customer/Pelanggan)</strong>.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setUnauthorizedModal({ show: false, email: "" })}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all shadow-md"
              >
                Faham & Teruskan Sebagai Pelanggan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Whitelisted Owner Emails Modal */}
      {showOwnersModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-5">
            <button
              onClick={() => setShowOwnersModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Kawalan SaaS Owner (Whitelist)</h3>
                <p className="text-xs text-slate-400">Tetapkan e-mel Google yang dibenarkan menjadi Owner Lias Tyre</p>
              </div>
            </div>

            {/* Add email form */}
            <form onSubmit={handleAddOwnerEmail} className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">Tambah E-mel Owner Baharu:</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newOwnerEmailInput}
                  onChange={(e) => setNewOwnerEmailInput(e.target.value)}
                  placeholder="contoh: owner@liastyre.com"
                  className="flex-1 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Tambah
                </button>
              </div>
            </form>

            {/* Whitelisted Emails List */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">E-mel Owner Sah ({authorizedEmails.length}):</label>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {authorizedEmails.map((email) => (
                  <div key={email} className="flex items-center justify-between bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="font-mono text-slate-200">{email}</span>
                      {googleUser?.email?.toLowerCase() === email.toLowerCase() && (
                        <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                          Anda
                        </span>
                      )}
                    </div>
                    {authorizedEmails.length > 1 && (
                      <button
                        onClick={() => handleRemoveOwnerEmail(email)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors"
                        title="Padam E-mel dari Whitelist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400">
              💡 <strong>Nota SaaS:</strong> Hanya pengguna yang log masuk Google menggunakan e-mel dalam senarai ini akan diberi hak akses Admin Lias Tyre. Semua pengguna lain secara automatik adalah Pelanggan (Read-only).
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
