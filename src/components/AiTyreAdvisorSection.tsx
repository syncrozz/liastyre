import React, { useState } from "react";
import { Bot, Send, Sparkles, User, MessageSquare, AlertCircle, RefreshCw } from "lucide-react";

export const AiTyreAdvisorSection: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "Selamat datang! Saya ialah **Pakar AI Pakar Tayar Pro**.\n\nBoleh saya bantu anda mencari tayar paling sesuai mengikut jenis kenderaan, bajet, saiz, atau corak pemanduan anda hari ini? Sila pilih prompt cadangan di bawah atau taip soalan anda sendiri!"
    }
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const SAMPLE_PROMPTS = [
    "Apakah tayar paling senyap untuk Honda Civic 215/50R17 bawah RM350?",
    "Cadangkan tayar cengkaman basah terbaik untuk Perodua Myvi 185/55R15.",
    "Apakah beza Michelin Primacy 5 dan Goodyear AMG SUV?",
    "Apakah saiz tayar standard dan tekanan angin ideal untuk Toyota Vios 2022?"
  ];

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputQuery.trim();
    if (!textToSend || loading) return;

    setMessages((prev) => [...prev, { sender: "user", text: textToSend }]);
    if (!customPrompt) setInputQuery("");
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/gemini/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userQuery: textToSend })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mendapatkan maklum balas dari AI Server.");
      }

      setMessages((prev) => [...prev, { sender: "ai", text: data.result }]);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Ralat pelayan AI.");
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `⚠️ Maaf, ralat berlaku: ${err.message || "Pastikan GEMINI_API_KEY disediakan di persekitaran anda."}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 mb-2">
            <Bot className="w-3.5 h-3.5 text-red-600" /> AI Smart Tyre Advisor (Gemini Powered)
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Pakar AI Penasihat & Soal Jawab Tayar
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Dapatkan cadangan pintar berasaskan kecerdasan buatan (Gemini 2.5 Flash) untuk membantu pelanggan memilih tayar mengikut kriteria pemanduan harian.
          </p>
        </div>
      </div>

      {/* Main Chat Box Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-[600px] overflow-hidden">
        {/* Messages List Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                msg.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-sm ${
                  msg.sender === "user"
                    ? "bg-red-600 text-white"
                    : "bg-red-50 text-red-600 border border-red-200"
                }`}
              >
                {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed whitespace-pre-wrap shadow-sm ${
                  msg.sender === "user"
                    ? "bg-red-600 text-white font-medium"
                    : "bg-slate-50 text-slate-800 border border-slate-200"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 animate-spin">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 text-slate-600 border border-slate-200 px-4 py-2 rounded-2xl text-xs flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                <span>AI Pakar Tayar sedang menganalisis spesifikasi & cadangan...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Prompts Pill Row */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 overflow-x-auto flex items-center gap-2 text-xs scrollbar-none">
          <span className="text-slate-500 font-bold whitespace-nowrap">Cadangan Soalan:</span>
          {SAMPLE_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              disabled={loading}
              onClick={() => handleSend(p)}
              className="px-3 py-1 bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 rounded-lg border border-slate-200 whitespace-nowrap transition-colors text-xs font-medium shadow-sm"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Text Box */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Tanyakan soalan berkenaan tayar, kenderaan, bajet..."
            className="flex-1 bg-slate-50 border border-slate-200 focus:border-red-500 focus:bg-white rounded-xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !inputQuery.trim()}
            className="px-5 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 text-xs"
          >
            <Send className="w-4 h-4" /> Hantar
          </button>
        </div>
      </div>
    </div>
  );
};
