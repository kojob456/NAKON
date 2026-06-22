import React, { useState } from "react";
import { Shield, Eye, Sun, Moon, Type, AlertCircle, Settings, UserCheck, Accessibility, Palette, Check, ZoomIn, ZoomOut } from "lucide-react";
import { User, UserRole } from "../types";
import { getThemeStyle, AppThemeType, themes } from "../utils/theme";

interface HeaderProps {
  currentUser: User | null;
  onSelectUser: (userUid: string | null) => void;
  mockUsers: User[];
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  fontSizeScale: number;
  onChangeFontSizeScale: (scale: number) => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  isBoldText: boolean;
  onToggleBoldText: () => void;
  activeTab: string;
  onChangeTab: (tab: string) => void;
  appTheme: AppThemeType;
  onChangeAppTheme: (theme: AppThemeType) => void;
}

export default function Header({
  currentUser,
  onSelectUser,
  mockUsers,
  isDarkMode,
  onToggleDarkMode,
  fontSizeScale,
  onChangeFontSizeScale,
  isHighContrast,
  onToggleHighContrast,
  isBoldText,
  onToggleBoldText,
  activeTab,
  onChangeTab,
  appTheme,
  onChangeAppTheme
}: HeaderProps) {
  const [showAccessMenu, setShowAccessMenu] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);

  const theme = getThemeStyle(appTheme, isHighContrast);


  return (
    <header className={`border-b sticky top-0 z-50 transition-all ${theme.card} ${theme.border}`}>
      {/* 🛠️ Top Simulator Bar */}
      <div className={`text-xs px-4 py-2 border-b flex flex-wrap gap-2 items-center justify-between ${
        isHighContrast
          ? "border-white bg-zinc-900 text-yellow-400"
          : "bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40 text-amber-900 dark:text-amber-200"
      }`}>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span>สลับบทบาททดลองระบบ (Quick Role Switcher) :</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => onSelectUser(null)}
            className={`px-2.5 py-1 rounded transition-all font-semibold border ${
              !currentUser
                ? isHighContrast
                  ? "bg-yellow-400 text-black border-white font-bold"
                  : "bg-slate-800 text-white dark:bg-amber-400 dark:text-black border-transparent"
                : "bg-transparent text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            🌐 ประชาชนทั่วไป
          </button>
          {mockUsers.map((u) => {
            const isSelected = currentUser?.uid === u.uid;
            return (
              <button
                key={u.uid}
                onClick={() => onSelectUser(u.uid)}
                className={`px-2.5 py-1 rounded text-xs transition-all font-semibold border flex items-center gap-1 ${
                  isSelected
                    ? isHighContrast
                      ? "bg-yellow-400 text-black border-white font-bold"
                      : "bg-blue-600 text-white dark:bg-blue-500 border-transparent"
                    : "bg-transparent text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {u.role === UserRole.ADMIN ? "⚙️" : u.role === UserRole.RESPONDER ? "🚨" : "👤"} {u.displayName.split(" ")[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onChangeTab("dashboard")}>
          <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md flex items-center justify-center animate-bounce">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight leading-none">
              Nakhon<span className="text-blue-500">Flood</span> Alert
            </h1>
            <p className="text-[10px] md:text-xs opacity-70 mt-0.5">
              ระบบแจ้งเตือนภัยน้ำท่วมล่วงหน้า & จัดการกู้ภัย จ.นครศรีธรรมราช
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onChangeTab("dashboard")}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "dashboard"
                ? isHighContrast
                  ? "bg-white text-black font-extrabold"
                  : "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            📊 วันนี้ & ย้อนหลัง
          </button>

          {/* Report tab is public, but login is triggered upon entry if not authorized */}
          <button
            onClick={() => onChangeTab("report")}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "report"
                ? isHighContrast
                  ? "bg-white text-black font-extrabold"
                  : "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            }`}
          >
            📸 แจ้งเหตุน้ำท่วม
          </button>

          {currentUser && (
            <button
              onClick={() => onChangeTab("tracking")}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "tracking"
                  ? isHighContrast
                    ? "bg-white text-black font-extrabold"
                    : "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              📋 ติดตามสถานะ ({currentUser.role === UserRole.ADMIN ? "รวม" : "ของฉัน"})
            </button>
          )}

          {currentUser && (currentUser.role === UserRole.RESPONDER || currentUser.role === UserRole.ADMIN) && (
            <button
              onClick={() => onChangeTab("responder")}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "responder"
                  ? isHighContrast
                    ? "bg-white text-black font-extrabold"
                    : "bg-red-50 text-red-650 dark:bg-red-950/20 dark:text-red-400"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              🚨 ห้องควบคุมภัย (Responder)
            </button>
          )}

          {currentUser && currentUser.role === UserRole.ADMIN && (
            <button
              onClick={() => onChangeTab("admin")}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "admin"
                  ? isHighContrast
                    ? "bg-white text-black font-extrabold"
                    : "bg-violet-50 text-violet-600 dark:bg-violet-950/20 dark:text-violet-400"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              ⚙️ จัดการระบบ (Admin)
            </button>
          )}

          {!currentUser && (
            <button
              onClick={() => onChangeTab("auth")}
              className={`px-4.5 py-2 rounded-lg text-sm font-semibold transition-all bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow`}
            >
              🔓 เข้าสู่ระบบ
            </button>
          )}
        </nav>

        {/* Global Controls & Accessibility */}
        <div className="flex items-center gap-1.5 md:gap-3">
          {/* Accessibility Toggle Menu */}
          <div className="relative">
            <button
              onClick={() => setShowAccessMenu(!showAccessMenu)}
              title="ตั้งค่าการเข้าถึง (Accessibility)"
              className={`p-2 rounded-xl transition-all border ${
                showAccessMenu
                  ? "bg-blue-50 dark:bg-slate-800"
                  : "hover:bg-slate-50 dark:hover:bg-slate-850"
              } ${isHighContrast ? "border-white" : "border-slate-200 dark:border-slate-800"}`}
            >
              <Accessibility className="w-5 h-5 text-blue-500 animate-pulse" />
            </button>

            {showAccessMenu && (
              <div className={`absolute right-0 mt-2 w-80 rounded-2xl p-4 shadow-2xl border transition-all z-50 ${
                isHighContrast
                  ? "bg-black border-white text-white shadow-[0_0_20px_2px_rgba(255,255,255,0.1)]"
                  : isDarkMode
                  ? "bg-slate-900 border-slate-800 text-slate-100"
                  : "bg-white border-slate-200 text-slate-800"
              }`}>
                <h3 className="font-bold text-sm mb-3 flex items-center gap-1.5 border-b pb-2 border-slate-100 dark:border-slate-800">
                  <Accessibility className="w-4 h-4 text-blue-500" /> 
                  <span>ตั้งค่าการแสดงผล & การเข้าถึง</span>
                </h3>

                {/* 1. Fine-grained FontSize Scaler */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold opacity-90 flex items-center gap-1">
                      <Type className="w-3.5 h-3.5 text-blue-500" />
                      ปรับขนาดตัวอักษรละเอียด (สำหรับผู้สูงอายุ)
                    </span>
                    <span className="text-xs font-mono font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 px-1.5 py-0.5 rounded">
                      {fontSizeScale}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onChangeFontSizeScale(Math.max(90, fontSizeScale - 5))}
                      title="ลดขนาดตัวหนังสือ"
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm font-bold"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <input
                      type="range"
                      min="90"
                      max="180"
                      step="5"
                      value={fontSizeScale}
                      onChange={(e) => onChangeFontSizeScale(Number(e.target.value))}
                      className="flex-1 accent-blue-600 cursor-pointer h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => onChangeFontSizeScale(Math.min(180, fontSizeScale + 5))}
                      title="เพิ่มขนาดตัวหนังสือ"
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm font-bold"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] opacity-70 mt-1.5 text-center italic">
                    {fontSizeScale >= 145 ? "🔥 ขนาดตัวอักษาใหญ่พิเศษ อ่านสบายตาเหมาะสมกับวัยผู้สูงอายุ" : "ปรับสเกลขนาดทั้งหมดของหน้าเว็บได้ตั้งแต่ 90% - 180%"}
                  </p>
                </div>



                {/* 3. Bold Text Toggle */}
                <div className="mb-3 flex items-center justify-between border-t border-slate-150 dark:border-slate-800/80 pt-3">
                  <div className="flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold">ตัวพิมพ์หนาพิเศษ (Bold)</span>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleBoldText}
                    className={`w-10 h-6 rounded-full transition-all relative ${
                      isBoldText ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all ${
                      isBoldText ? "translate-x-4" : ""
                    }`} />
                  </button>
                </div>

                {/* 4. High Contrast Mode */}
                <div className="flex items-center justify-between border-t border-slate-150 dark:border-slate-800/80 pt-3">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-bold">ความต่างสีสูงปรี๊ด (High Contrast)</span>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleHighContrast}
                    className={`w-10 h-6 rounded-full transition-all relative ${
                      isHighContrast ? "bg-yellow-400 border border-black" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all ${
                      isHighContrast ? "translate-x-4 bg-black" : ""
                    }`} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Light/Dark mode */}
          <button
            onClick={onToggleDarkMode}
            title={isDarkMode ? "เปิดโหมดสว่าง" : "เปิดโหมดมืด"}
            className={`p-2 rounded-xl transition-all border ${
              isHighContrast ? "border-white" : "border-slate-200 dark:border-slate-800"
            } hover:bg-slate-100 dark:hover:bg-slate-800/50`}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* User Profile / Settings Area */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileSettings(!showProfileSettings)}
                className={`flex items-center gap-1.5 p-1 rounded-xl transition-all border hover:bg-slate-100 dark:hover:bg-slate-800 bg-slate-50 dark:bg-slate-800/40 ${
                  isHighContrast ? "border-white" : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.displayName}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <span className="hidden md:inline text-xs font-bold truncate max-w-28 text-left leading-none">
                  {currentUser.displayName.split(" ")[0]}
                  <p className="text-[9px] opacity-70 font-normal mt-0.5 uppercase">{currentUser.role}</p>
                </span>
                <Settings className="w-4 h-4 opacity-60 ml-0.5" />
              </button>

              {showProfileSettings && (
                <div className={`absolute right-0 mt-2 w-72 rounded-2xl p-4 shadow-2xl border transition-all z-50 ${
                  isHighContrast
                    ? "bg-black border-white text-white"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                }`}>
                  <div className="flex items-center gap-3 border-b pb-3 mb-3 border-slate-100 dark:border-slate-700">
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.displayName}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                    <div>
                      <h4 className="font-bold text-sm leading-none">{currentUser.displayName}</h4>
                      <p className="text-xs opacity-70 mt-1">{currentUser.email}</p>
                    </div>
                  </div>

                  {/* Watch Zones (พื้นที่เฝ้าระวังพิเศษ 3 ชม.) */}
                  <div className="mb-4">
                    <h5 className="text-xs font-bold flex items-center gap-1 text-blue-600 dark:text-blue-400 mb-2">
                      📌 พื้นที่เฝ้าระวังพิเศษของคุณ
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {currentUser.watchZones.length > 0 ? (
                        currentUser.watchZones.map((z, idx) => (
                          <span
                            key={idx}
                            className="bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 text-[10px] md:text-xs px-2 py-0.5 rounded font-semibold"
                          >
                            ต. {z}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs opacity-60 italic">ยังไม่ได้เลือกพื้นที่เฝ้าระวังพิเศษ</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <button
                      onClick={() => {
                        setShowProfileSettings(false);
                        onChangeTab("tracking");
                      }}
                      className="w-full text-left py-1.5 px-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-medium flex items-center gap-1.5"
                    >
                      📋 รายนาวิกแจ้งเหตุสถานะเคส
                    </button>
                    {currentUser.role === UserRole.ADMIN && (
                      <button
                        onClick={() => {
                          setShowProfileSettings(false);
                          onChangeTab("admin");
                        }}
                        className="w-full text-left py-1.5 px-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-medium flex items-center gap-1.5"
                      >
                        ⚙️ แผงควบคุมผู้ดูแลระบบ
                      </button>
                    )}
                    <button
                      onClick={() => onSelectUser(null)}
                      className="w-full text-left py-1.5 px-2.5 hover:bg-red-50 text-red-600 dark:hover:bg-red-950/20 rounded-lg text-xs font-bold flex items-center gap-1.5"
                    >
                      🔒 ออกจากระบบ
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onChangeTab("auth")}
              className="md:hidden p-2 rounded-xl text-blue-500 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
            >
              <UserCheck className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className={`md:hidden border-t py-1.5 px-2 grid grid-cols-4 md:grid-cols-5 text-center text-[10px] font-bold ${
        isHighContrast ? "bg-black text-white" : "bg-slate-50 dark:bg-slate-900/60"
      }`}>
        <button
          onClick={() => onChangeTab("dashboard")}
          className={`py-1 rounded-lg ${activeTab === "dashboard" ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20" : "text-slate-500"}`}
        >
          📊 แดชบอร์ด
        </button>
        <button
          onClick={() => onChangeTab("report")}
          className={`py-1 rounded-lg ${activeTab === "report" ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20" : "text-slate-500"}`}
        >
          📸 แจ้งภัยพิบัติน้ำ
        </button>
        <button
          onClick={() => {
            if (currentUser) onChangeTab("tracking");
            else onChangeTab("auth");
          }}
          className={`py-1 rounded-lg ${activeTab === "tracking" ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20" : "text-slate-500"}`}
        >
          📋 ติดตามสถานะ
        </button>

        {currentUser && (currentUser.role === UserRole.RESPONDER || currentUser.role === UserRole.ADMIN) ? (
          <button
            onClick={() => onChangeTab("responder")}
            className={`py-1 rounded-lg ${activeTab === "responder" ? "text-red-500 bg-red-50/50 dark:bg-red-950/20" : "text-slate-500"}`}
          >
            🚨 ศูนย์กู้ภัย
          </button>
        ) : currentUser && currentUser.role === UserRole.ADMIN ? (
          <button
            onClick={() => onChangeTab("admin")}
            className={`py-1 rounded-lg ${activeTab === "admin" ? "text-violet-500 bg-violet-50/50 dark:bg-violet-950/20" : "text-slate-500"}`}
          >
            ⚙️ แอดมิน
          </button>
        ) : (
          <button
            onClick={() => onChangeTab("auth")}
            className="py-1 text-slate-500 rounded-lg"
          >
            🔓 ล็อกอิน
          </button>
        )}
      </div>
    </header>
  );
}
