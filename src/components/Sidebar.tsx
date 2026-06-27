import React from "react";
import { User, UserRole } from "../types";
import { getThemeStyle, AppThemeType } from "../utils/theme";
import { X, Home, Activity, MessageCircle, Bot, User as UserIcon } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  activeTab: string;
  onChangeTab: (tab: string) => void;
  appTheme: AppThemeType;
  isHighContrast: boolean;
}

export default function Sidebar({
  isOpen,
  onClose,
  currentUser,
  activeTab,
  onChangeTab,
  appTheme,
  isHighContrast,
}: SidebarProps) {
  const theme = getThemeStyle(appTheme, isHighContrast);

  // Overlay classes
  const overlayClass = isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none";
  // Sidebar container classes
  const sidebarClass = isOpen ? "translate-x-0" : "-translate-x-full";

  const handleNavClick = (tab: string) => {
    onChangeTab(tab);
    onClose();
  };

  const navButtonBaseClass = "w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-3 text-sm md:text-base";

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300 ${overlayClass}`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-[85vw] sm:w-80 shadow-2xl z-[70] transition-transform duration-300 ease-in-out flex flex-col glass-panel ${
          isHighContrast ? "bg-black border-r-4 border-white text-white" : ""
        } ${sidebarClass}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-extrabold text-lg flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400">NakhonFlood</span> Menu
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-all ${
              isHighContrast ? "hover:bg-zinc-800 border-2 border-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
            title="ปิดเมนู"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Main App Features */}
          <button
            onClick={() => handleNavClick("dashboard")}
            className={`${navButtonBaseClass} ${
              activeTab === "dashboard" || activeTab === "report"
                ? isHighContrast ? "bg-white text-black" : "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                : isHighContrast ? "hover:bg-zinc-800 text-white" : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            <Home className="w-5 h-5" /> 📊 หน้าหลัก & แจ้งเหตุด่วน
          </button>

          <button
            onClick={() => handleNavClick("analytics")}
            className={`${navButtonBaseClass} ${
              activeTab === "analytics"
                ? isHighContrast ? "bg-white text-black" : "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                : isHighContrast ? "hover:bg-zinc-800 text-white" : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            }`}
          >
            <Activity className="w-5 h-5" /> 📈 ศูนย์ติดตามทางน้ำ
          </button>

          {currentUser && (
            <button
              onClick={() => handleNavClick("tracking")}
              className={`${navButtonBaseClass} ${
                activeTab === "tracking"
                  ? isHighContrast ? "bg-white text-black" : "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                  : isHighContrast ? "hover:bg-zinc-800 text-white" : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              <Activity className="w-5 h-5" /> 📋 ติดตามสถานะ ({currentUser.role === UserRole.ADMIN ? "รวม" : "ของฉัน"})
            </button>
          )}

          <div className="my-6 border-t border-slate-200 dark:border-slate-800" />

          {/* Special Requests */}
          <h3 className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">บริการเพิ่มเติม (Services)</h3>


          <button
            onClick={() => {
              alert("เปิดระบบช่วยเหลือ (AI Assistant) เนตรนภา");
              onClose();
            }}
            className={`${navButtonBaseClass} text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/20 hover:bg-violet-100 dark:hover:bg-violet-900/40 border border-violet-200 dark:border-violet-900`}
          >
            <Bot className="w-5 h-5" /> 🤖 เนตรนภา
          </button>

          <button
            onClick={() => handleNavClick("auth")}
            className={`${navButtonBaseClass} text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700`}
          >
            <UserIcon className="w-5 h-5" /> 👤 CITIZEN
          </button>
        </div>
      </div>
    </>
  );
}
