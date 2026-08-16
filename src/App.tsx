import React, { useState, useEffect } from "react";
import { NavbarHeader } from "./components/NavbarHeader";
import { SmartSearchSection } from "./components/SmartSearchSection";
import { VehicleMatchingSection } from "./components/VehicleMatchingSection";
import { BrandDirectorySection } from "./components/BrandDirectorySection";
import { PatternSizeDirectorySection } from "./components/PatternSizeDirectorySection";
import { ProductComparisonSection } from "./components/ProductComparisonSection";
import { QuotationInvoiceSection } from "./components/QuotationInvoiceSection";
import { InventoryDashboardSection } from "./components/InventoryDashboardSection";
import { AiTyreAdvisorSection } from "./components/AiTyreAdvisorSection";
import { TireDetailModal } from "./components/TireDetailModal";
import { INITIAL_TYRES } from "./data/tyresData";
import { Tire, NavTab, UserPersona, QuotationItem } from "./types/tyre";
import {
  db,
  collection,
  doc,
  setDoc,
  onSnapshot,
  writeBatch
} from "./lib/firebase";

const LOCAL_STORAGE_TYRES_KEY = "liastyre_pro_inventory_v1";

function getStoredTyres(): Tire[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_TYRES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to load inventory from local cache:", e);
  }
  return INITIAL_TYRES;
}

function saveStoredTyres(data: Tire[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_TYRES_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to save inventory to local cache:", e);
  }
}

export default function App() {
  const [tyres, setTyres] = useState<Tire[]>(getStoredTyres);
  const [activeTab, setActiveTab] = useState<NavTab>("smart_search");
  const [persona, setPersona] = useState<UserPersona>("Pemilik Kenderaan");
  const [dbStatus, setDbStatus] = useState<"connected" | "quota_exceeded" | "offline">("connected");

  // Comparison State
  const [comparisonList, setComparisonList] = useState<Tire[]>([]);

  // Quotation Cart State
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);

  // Detail Modal State
  const [selectedDetailTire, setSelectedDetailTire] = useState<Tire | null>(null);

  // Firestore Real-Time Listener with Quota & Offline fallback
  useEffect(() => {
    let unsubscribe = () => {};
    try {
      const tyresColRef = collection(db, "tyres");
      unsubscribe = onSnapshot(
        tyresColRef,
        (snapshot) => {
          setDbStatus("connected");
          if (snapshot.empty) {
            // Empty Cloud collection: Seed initial tyres data to Firestore
            const batch = writeBatch(db);
            INITIAL_TYRES.forEach((item) => {
              const docRef = doc(db, "tyres", item.id);
              batch.set(docRef, item);
            });
            batch.commit().catch((err) => console.warn("Notice: Initial cloud seed:", err));
            setTyres(INITIAL_TYRES);
            saveStoredTyres(INITIAL_TYRES);
          } else {
            const cloudData: Tire[] = snapshot.docs.map((d) => d.data() as Tire);
            setTyres(cloudData);
            saveStoredTyres(cloudData);
          }
        },
        (error) => {
          const errStr = error?.message || String(error);
          console.warn("Firestore snapshot notice:", errStr);
          if (errStr.toLowerCase().includes("quota")) {
            setDbStatus("quota_exceeded");
          } else {
            setDbStatus("offline");
          }
          // Ensure data remains available via local cache
          setTyres((prev) => (prev && prev.length > 0 ? prev : getStoredTyres()));
        }
      );
    } catch (e) {
      console.warn("Firestore listener initialization:", e);
      setDbStatus("offline");
      setTyres(getStoredTyres());
    }

    return () => {
      try {
        unsubscribe();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  // Toggle Compare
  const handleToggleCompare = (tire: Tire) => {
    setComparisonList((prev) => {
      const exists = prev.some((t) => t.id === tire.id);
      if (exists) {
        return prev.filter((t) => t.id !== tire.id);
      } else {
        if (prev.length >= 4) {
          alert("Had maksimum perbandingan ialah 4 tayar serentak.");
          return prev;
        }
        return [...prev, tire];
      }
    });
  };

  const handleRemoveCompare = (tireId: string) => {
    setComparisonList((prev) => prev.filter((t) => t.id !== tireId));
  };

  const handleClearAllCompare = () => {
    setComparisonList([]);
  };

  // Add to Quotation
  const handleAddToQuotation = (tire: Tire) => {
    setQuotationItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.tireId === tire.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 2; // Default increment 2 tires
        return updated;
      } else {
        return [
          ...prev,
          {
            tireId: tire.id,
            tire: tire,
            quantity: 4, // Default 4 tires for a full set
            unitPrice: tire.marketPrice,
            installationFeePerTire: 10,
            balancingFeePerTire: 10,
          },
        ];
      }
    });
  };

  const handleUpdateQuotationQuantity = (tireId: string, delta: number) => {
    setQuotationItems((prev) => {
      return prev
        .map((item) => {
          if (item.tireId === tireId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as QuotationItem[];
    });
  };

  const handleRemoveQuotationItem = (tireId: string) => {
    setQuotationItems((prev) => prev.filter((item) => item.tireId !== tireId));
  };

  const handleClearQuotation = () => {
    setQuotationItems([]);
  };

  // Import Bulk Tyres from CSV / Excel to Cloud + Local Cache
  const handleImportBulkTyres = async (importedTyres: Tire[]) => {
    const updated = [...tyres];

    importedTyres.forEach((imp) => {
      const existingIdx = updated.findIndex(
        (t) =>
          t.size.replace(/\s+/g, "") === imp.size.replace(/\s+/g, "") &&
          t.brand.toUpperCase() === imp.brand.toUpperCase()
      );
      if (existingIdx > -1) {
        const updatedItem: Tire = {
          ...updated[existingIdx],
          storeStock: imp.storeStock,
          totalStock: imp.totalStock,
          marketPrice: imp.marketPrice > 0 ? imp.marketPrice : updated[existingIdx].marketPrice,
          costPrice: imp.costPrice > 0 ? imp.costPrice : updated[existingIdx].costPrice,
          profit: imp.marketPrice - imp.costPrice,
          status: imp.storeStock <= 0 ? "Out of Stock" : imp.storeStock <= 2 ? "Low Stock" : "In Stock",
        };
        updated[existingIdx] = updatedItem;
      } else {
        updated.unshift(imp);
      }
    });

    setTyres(updated);
    saveStoredTyres(updated);

    try {
      const batch = writeBatch(db);
      importedTyres.forEach((imp) => {
        const target = updated.find((u) => u.id === imp.id || (u.size === imp.size && u.brand === imp.brand));
        if (target) {
          batch.set(doc(db, "tyres", target.id), target);
        }
      });
      await batch.commit();
    } catch (err) {
      console.warn("Cloud write batch notice:", err);
    }
  };

  // Add New Tire record
  const handleAddTyre = async (newTire: Tire) => {
    const updated = [newTire, ...tyres.filter((t) => t.id !== newTire.id)];
    setTyres(updated);
    saveStoredTyres(updated);

    try {
      await setDoc(doc(db, "tyres", newTire.id), newTire);
    } catch (err) {
      console.warn("Cloud add tyre notice:", err);
    }
  };

  // Update Stock
  const handleUpdateStock = async (tireId: string, newStock: number) => {
    const target = tyres.find((t) => t.id === tireId);
    if (!target) return;
    const updatedTire: Tire = {
      ...target,
      storeStock: newStock,
      totalStock: newStock,
      status: newStock <= 0 ? "Out of Stock" : newStock <= 2 ? "Low Stock" : "In Stock",
    };
    const updated = tyres.map((t) => (t.id === tireId ? updatedTire : t));
    setTyres(updated);
    saveStoredTyres(updated);

    try {
      await setDoc(doc(db, "tyres", tireId), updatedTire);
    } catch (err) {
      console.warn("Cloud update stock notice:", err);
    }
  };

  // Sync Master Data Stock
  const handleSyncMasterStock = async (mode: "standard" | "popular" | "reset" | "custom", customQty: number = 10) => {
    const updated = tyres.map((t) => {
      let newStock = t.storeStock;
      if (mode === "reset") {
        const original = INITIAL_TYRES.find((init) => init.id === t.id);
        newStock = original ? original.storeStock : 10;
      } else if (mode === "standard") {
        newStock = 12; // Standard shop baseline stock
      } else if (mode === "popular") {
        if (t.size.includes("205/55") || t.size.includes("185/65") || t.size.includes("215/55") || t.size.includes("195/65")) {
          newStock = 24;
        } else {
          newStock = 8;
        }
      } else if (mode === "custom") {
        newStock = Math.max(0, customQty);
      }
      return {
        ...t,
        storeStock: newStock,
        totalStock: newStock,
        status: newStock <= 0 ? "Out of Stock" : newStock <= 2 ? "Low Stock" : ("In Stock" as const),
      };
    });

    setTyres(updated);
    saveStoredTyres(updated);

    try {
      const batch = writeBatch(db);
      updated.forEach((t) => {
        batch.set(doc(db, "tyres", t.id), t);
      });
      await batch.commit();
    } catch (err) {
      console.warn("Cloud sync master stock notice:", err);
    }
  };

  // Deduct Stock on Payment
  const handleDeductStock = async (itemsToDeduct: { tireId: string; quantity: number }[]) => {
    const updated = tyres.map((t) => {
      const deductItem = itemsToDeduct.find((item) => item.tireId === t.id);
      if (deductItem) {
        const newStock = Math.max(0, t.storeStock - deductItem.quantity);
        return {
          ...t,
          storeStock: newStock,
          totalStock: newStock,
          status: newStock <= 0 ? "Out of Stock" : newStock <= 2 ? "Low Stock" : ("In Stock" as const),
        };
      }
      return t;
    });

    setTyres(updated);
    saveStoredTyres(updated);

    try {
      const batch = writeBatch(db);
      itemsToDeduct.forEach((item) => {
        const target = updated.find((t) => t.id === item.tireId);
        if (target) {
          batch.set(doc(db, "tyres", target.id), target);
        }
      });
      await batch.commit();
    } catch (err) {
      console.warn("Cloud deduct stock notice:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-red-600 selection:text-white flex flex-col">
      {/* Top Navbar */}
      <NavbarHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        persona={persona}
        setPersona={setPersona}
        comparisonCount={comparisonList.length}
        quotationItemCount={quotationItems.length}
        dbStatus={dbStatus}
        quotaUpgradeUrl="https://console.firebase.google.com/project/gen-lang-client-0739778545/firestore/databases/ai-studio-liastyre-9d3f4484-47ba-4b0e-9b9c-2a079c143533/data?openUpgradeDialog=true"
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {activeTab === "smart_search" && (
          <SmartSearchSection
            tyres={tyres}
            persona={persona}
            comparisonList={comparisonList}
            onToggleCompare={handleToggleCompare}
            onAddToQuotation={handleAddToQuotation}
            onViewDetail={(tire) => setSelectedDetailTire(tire)}
            onUpdateStock={handleUpdateStock}
          />
        )}

        {activeTab === "vehicle_matching" && (
          <VehicleMatchingSection
            tyres={tyres}
            persona={persona}
            comparisonList={comparisonList}
            onToggleCompare={handleToggleCompare}
            onAddToQuotation={handleAddToQuotation}
            onViewDetail={(tire) => setSelectedDetailTire(tire)}
            onUpdateStock={handleUpdateStock}
          />
        )}

        {activeTab === "brand_directory" && (
          <BrandDirectorySection
            tyres={tyres}
            persona={persona}
            comparisonList={comparisonList}
            onToggleCompare={handleToggleCompare}
            onAddToQuotation={handleAddToQuotation}
            onViewDetail={(tire) => setSelectedDetailTire(tire)}
            onUpdateStock={handleUpdateStock}
          />
        )}

        {activeTab === "pattern_directory" && (
          <PatternSizeDirectorySection
            tyres={tyres}
            persona={persona}
            comparisonList={comparisonList}
            onToggleCompare={handleToggleCompare}
            onAddToQuotation={handleAddToQuotation}
            onViewDetail={(tire) => setSelectedDetailTire(tire)}
            onUpdateStock={handleUpdateStock}
          />
        )}

        {activeTab === "comparison" && (
          <ProductComparisonSection
            comparisonList={comparisonList}
            persona={persona}
            onRemoveCompare={handleRemoveCompare}
            onClearAllCompare={handleClearAllCompare}
            onAddToQuotation={handleAddToQuotation}
            onSelectMoreFromSearch={() => setActiveTab("smart_search")}
          />
        )}

        {activeTab === "quotation" && (
          <QuotationInvoiceSection
            items={quotationItems}
            persona={persona}
            onUpdateQuantity={handleUpdateQuotationQuantity}
            onRemoveItem={handleRemoveQuotationItem}
            onClearAll={handleClearQuotation}
            onDeductStock={handleDeductStock}
          />
        )}

        {activeTab === "inventory_dashboard" && (
          <InventoryDashboardSection
            tyres={tyres}
            persona={persona}
            onAddTyre={handleAddTyre}
            onUpdateStock={handleUpdateStock}
            onSyncMasterStock={handleSyncMasterStock}
            onImportBulkTyres={handleImportBulkTyres}
          />
        )}

        {activeTab === "ai_advisor" && <AiTyreAdvisorSection />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 text-slate-500 py-6 text-xs text-center mt-auto">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-bold text-slate-800">
            LIAS TYRE PRO By{" "}
            <a
              href="https://wasap.my/60145313756"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 font-bold hover:underline"
            >
              Syncrozz
            </a>
          </p>
        </div>
      </footer>

      {/* Detail Modal */}
      {selectedDetailTire && (
        <TireDetailModal
          tire={selectedDetailTire}
          persona={persona}
          onClose={() => setSelectedDetailTire(null)}
          onAddToQuotation={handleAddToQuotation}
          onToggleCompare={handleToggleCompare}
          isCompared={comparisonList.some((t) => t.id === selectedDetailTire.id)}
          onUpdateStock={handleUpdateStock}
        />
      )}
    </div>
  );
}
