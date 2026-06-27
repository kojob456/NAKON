import React, { useState } from "react";
import { Calendar, TrendingUp } from "lucide-react";
import { RiverGauge } from "../types";
import { generateHistoricalData } from "../data/mockData";
import { motion } from "motion/react";

interface WaterTrackingDashboardProps {
  riverGauges: RiverGauge[];
  isDarkMode: boolean;
  isHighContrast: boolean;
}

export default function WaterTrackingDashboard({
  riverGauges,
  isDarkMode,
  isHighContrast
}: WaterTrackingDashboardProps) {
  const [selectedDate, setSelectedDate] = useState("2026-06-22");
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);

  const { floodChance, mountainRainfall, waterLevelInM, trendData } = generateHistoricalData(selectedDate);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`p-6 rounded-3xl border shadow-md ${isHighContrast
        ? "bg-black border-white text-white"
        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-800"
      }`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-4 mb-6 border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="font-bold text-base md:text-lg flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
            <Calendar className="w-5 h-5 text-blue-600" /> ศูนย์ติดตามทางน้ำสายหลัก & วิเคราะห์ข้อมูลปฏิทินย้อนหลัง
          </h3>
          <p className="text-xs opacity-75 mt-0.5">เลือกวันที่ต้องการประมวลเทียบเคียงกับปริมาณน้ําฝนสถิติก่อนหน้าสะสม</p>
        </div>

        {/* 2.1 📅 Calendar Selector */}
        <div className="flex items-center gap-2 select-none">
          <span className="text-xs font-bold opacity-80">วันที่เลือก:</span>
          <input
            type="date"
            value={selectedDate}
            min="2026-06-01"
            max="2026-06-30"
            onChange={(e) => setSelectedDate(e.target.value)}
            className={`p-2 rounded-xl text-xs font-extrabold border outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isHighContrast
                ? "bg-black text-white border-white"
                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              }`}
          />
        </div>
      </div>

      {/* Historical quick status on that day */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div whileHover={{ scale: 1.02 }} className={`p-4 rounded-2xl border text-center transition-all shadow-sm hover:shadow-md ${isHighContrast ? "border-white bg-[#111]" : "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800"}`}>
          <span className="text-xs opacity-70 font-semibold">โอกาสน้ำท่วมวันระบาย ({selectedDate})</span>
          <span className="block text-2xl font-black font-mono mt-1 text-blue-600 dark:text-blue-400">{floodChance}%</span>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className={`p-4 rounded-2xl border text-center transition-all shadow-sm hover:shadow-md ${isHighContrast ? "border-white bg-[#111]" : "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800"}`}>
          <span className="text-xs opacity-70 font-semibold">สถิติน้ําฝนเทือกเขาหลวงรวมในวันนั้น</span>
          <span className="block text-2xl font-black font-mono mt-1 text-slate-800 dark:text-slate-300">{mountainRainfall} มม.</span>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className={`p-4 rounded-2xl border text-center transition-all shadow-sm hover:shadow-md ${isHighContrast ? "border-white bg-[#111]" : "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800"}`}>
          <span className="text-xs opacity-70 font-semibold">เฉลี่ยระบายหน้าตลิ่งคลองท่าดี</span>
          <span className="block text-2xl font-black font-mono mt-1 text-cyan-600 dark:text-cyan-400">{waterLevelInM} เมตร</span>
        </motion.div>
      </div>

      {/* 2.2 🌊 ศูนย์ติดตามทางน้ำสายหลัก (คลองท่าดี, แม่น้ำปากพนัง, อ่างเก็บน้ำคลองกระทูน/ดินแดง) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        {riverGauges.map((g, i) => {
          const isRes = g.name.includes("อ่างเก็บน้ำ");
          const filledPct = isRes
            ? Math.min(Math.round((g.currentLevel / g.criticalLevel) * 100), 100)
            : Math.min(Math.round((g.currentLevel / g.warningLevel) * 100), 100);

          const isWarning = g.currentLevel >= g.warningLevel;
          const isCritical = g.currentLevel >= g.criticalLevel;

          let waveColor = "bg-blue-500/30";
          let strokeColor = "border-blue-500";
          let textColor = "text-blue-600 dark:text-blue-400";

          if (isCritical) {
            waveColor = "bg-red-500/35 animate-pulse";
            strokeColor = "border-red-600 ring-2 ring-red-400";
            textColor = "text-red-600 dark:text-red-400";
          } else if (isWarning) {
            waveColor = "bg-orange-500/30";
            strokeColor = "border-orange-500";
            textColor = "text-orange-600 dark:text-orange-400";
          }

          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              key={g.id}
              className={`p-4 rounded-3xl border flex flex-col justify-between overflow-hidden relative min-h-[160px] hover:shadow-lg transition-all ${isHighContrast ? "border-white bg-[#111]" : "bg-slate-50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800"
                }`}
            >
              {/* Simulated Wave Vector Background */}
              <div
                style={{ height: `${filledPct}%` }}
                className={`absolute bottom-0 left-0 right-0 z-0 transition-all duration-1000 ${waveColor}`}
              >
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-t from-transparent to-white/10 dark:to-black/10"></div>
              </div>

              <div className="relative z-10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wide">
                  {isRes ? "🗳️ อ่างกักเก็บน้ํา" : "🌊 ทะเล/ลำน้ำ"}
                </span>
                <h4 className="font-bold text-xs md:text-sm truncate">{g.name.split(" (")[0]}</h4>
              </div>

              <div className="relative z-10 py-2.5">
                <span className={`text-xl md:text-2xl font-black font-mono block ${textColor}`}>
                  {g.currentLevel}
                  <span className="text-xs font-bold ml-1 opacity-75">{isRes ? "ล้าน ลบ.ม." : "ม."}</span>
                </span>
                <span className="text-[10px] opacity-75 block font-semibold mt-0.5">
                  จุเฉลี่ย {filledPct}% {g.trend === "rising" ? "📈 สูงขึ้น" : g.trend === "falling" ? "📉 ลดลง" : "⚖️ ทรงตัว"}
                </span>
              </div>

              <div className="relative z-10 text-[10px] opacity-75 border-t border-slate-200/30 pt-1.5 flex justify-between">
                <span>เกณฑ์ระวัง: {g.warningLevel}</span>
                <span className="text-red-500 font-bold">วิกฤต: {g.criticalLevel}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 2.3 📉 กราฟเปรียบเทียบแนวโน้มปริมาณน้ำฝนและระดับน้ำ */}
      <div>
        <div className="flex items-center gap-1.5 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <h4 className="font-bold text-sm">เปรียบเทียบปริมาณน้ำฝนสะสมเทือกเขาหลวง (สัปดาห์นี้ VS ปีก่อนหน้า)</h4>
        </div>

        {/* Premium high-fidelity custom SVG line/area chart */}
        <div className={`p-4 rounded-2xl border ${isHighContrast ? "border-white bg-[#0a0a0a]" : "bg-slate-50 dark:bg-slate-900 border-slate-200/60 dark:border-slate-800"}`}>
          <div className="relative w-full h-64">
            <svg viewBox="0 0 700 240" className="w-full h-full overflow-visible">
              {/* Horizontal gridlines */}
              {[0, 60, 120, 180, 240].map((h, idx) => (
                <line
                  key={idx}
                  x1="40"
                  y1={h}
                  x2="680"
                  y2={h}
                  stroke={isDarkMode ? "#334155" : "#e2e8f0"}
                  strokeDasharray="4 4"
                />
              ))}

              {/* Left (Precipitation Rain in mm) Label */}
              <text x="5" y="15" fontSize="9" fontWeight="bold" fill="#3b82f6" transform="rotate(-90, 12, 12)">มม.</text>
              <text x="15" y="62" fontSize="9" fill="#94a3b8" textAnchor="end">180</text>
              <text x="15" y="122" fontSize="9" fill="#94a3b8" textAnchor="end">120</text>
              <text x="15" y="182" fontSize="9" fill="#94a3b8" textAnchor="end">60</text>
              <text x="15" y="235" fontSize="9" fill="#94a3b8" textAnchor="end">0</text>

              {/* Draw Year 2025 Area + Line (Slight opacity) */}
              <path
                d={`M 40,240 
                L 40,${240 - trendData[0].rainLastYear} 
                L 140,${240 - trendData[1].rainLastYear} 
                L 240,${240 - trendData[2].rainLastYear} 
                L 340,${240 - trendData[3].rainLastYear} 
                L 440,${240 - trendData[4].rainLastYear} 
                L 540,${240 - trendData[5].rainLastYear} 
                L 640,${240 - trendData[6].rainLastYear} 
                L 640,240 Z`}
                fill="url(#areaLastYear)"
                opacity="0.15"
              />
              <path
                d={`M 40,${240 - trendData[0].rainLastYear} 
                L 140,${240 - trendData[1].rainLastYear} 
                L 240,${240 - trendData[2].rainLastYear} 
                L 340,${240 - trendData[3].rainLastYear} 
                L 440,${240 - trendData[4].rainLastYear} 
                L 540,${240 - trendData[5].rainLastYear} 
                L 640,${240 - trendData[6].rainLastYear}`}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2.5"
                strokeDasharray="4 4"
              />

              {/* Draw Year 2026 Active Rain Area (Blue) */}
              <path
                d={`M 40,240 
                L 40,${240 - trendData[0].rainThisWeek} 
                L 140,${240 - trendData[1].rainThisWeek} 
                L 240,${240 - trendData[2].rainThisWeek} 
                L 340,${240 - trendData[3].rainThisWeek} 
                L 440,${240 - trendData[4].rainThisWeek} 
                L 540,${240 - trendData[5].rainThisWeek} 
                L 640,${240 - trendData[6].rainThisWeek} 
                L 640,240 Z`}
                fill="url(#areaThisWeek)"
                opacity="0.25"
              />
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                d={`M 40,${240 - trendData[0].rainThisWeek} 
                L 140,${240 - trendData[1].rainThisWeek} 
                L 240,${240 - trendData[2].rainThisWeek} 
                L 340,${240 - trendData[3].rainThisWeek} 
                L 440,${240 - trendData[4].rainThisWeek} 
                L 540,${240 - trendData[5].rainThisWeek} 
                L 640,${240 - trendData[6].rainThisWeek}`}
                fill="none"
                stroke="#2563eb"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Scatter Interaction nodes */}
              {trendData.map((d, idx) => {
                const plotX = 40 + idx * 100;
                const plotY = 240 - d.rainThisWeek;
                const isHovered = hoveredDataIndex === idx;

                return (
                  <g
                    key={idx}
                    onMouseEnter={() => setHoveredDataIndex(idx)}
                    onMouseLeave={() => setHoveredDataIndex(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={plotX}
                      cy={plotY}
                      r={isHovered ? 7 : 4.5}
                      fill="#2563eb"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    {/* X Labels */}
                    <text
                      x={plotX}
                      y="235"
                      fontSize="9"
                      textAnchor="middle"
                      fill={isDarkMode ? "#94a3b8" : "#475569"}
                      fontWeight={isHovered ? "bold" : "normal"}
                    >
                      {d.name.split(" ")[0]}
                    </text>
                  </g>
                );
              })}

              {/* SVG Definitions for coloring gradients */}
              <defs>
                <linearGradient id="areaThisWeek" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="areaLastYear" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Hover node popup indicators details box */}
            {hoveredDataIndex !== null && (
              <div
                style={{
                  position: "absolute",
                  left: `${40 + hoveredDataIndex * 14.2}%`,
                  top: `20px`
                }}
                className={`p-2 rounded-lg border text-[10px] shadow-lg pointer-events-none transform -translate-x-1/2 z-30 transition-all ${isHighContrast
                    ? "bg-black border-white text-white"
                    : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200"
                  }`}
              >
                <p className="font-bold border-b pb-0.5 mb-1 text-blue-600 dark:text-blue-400">
                  {trendData[hoveredDataIndex].name}
                </p>
                <p>ฝนเฉลี่ยสัปดาห์นี้: <strong>{trendData[hoveredDataIndex].rainThisWeek} มม.</strong></p>
                <p className="opacity-75">ปีที่แล้ว: {trendData[hoveredDataIndex].rainLastYear} มม.</p>
              </div>
            )}
          </div>

          {/* Custom chart legend */}
          <div className="flex justify-center items-center gap-6 mt-4 text-xs font-semibold select-none">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1.5 bg-blue-600 rounded-full"></span>
              <span>ปริมาณน้ำฝนสัปดาห์ปัจจุบัน (2026)</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-60">
              <span className="w-3.5 h-1.5 bg-slate-400 rounded-full border-dashed border"></span>
              <span>ปีก่อนหน้าเปรียบเทียบสะสม (2025)</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
