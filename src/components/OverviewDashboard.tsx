import React, { useState } from "react";
import { AlertTriangle, Check, Info, ArrowRight } from "lucide-react";
import { WeatherStation, RiverGauge, ThresholdSettings } from "../types";
import { motion } from "motion/react";

interface OverviewDashboardProps {
  amphoes: any[];
  weatherStations: WeatherStation[];
  riverGauges: RiverGauge[];
  thresholdSettings: ThresholdSettings;
  isHighContrast: boolean;
  onSelectAmphoe: (amphoeId: string) => void;
  detectedAmphoeId?: string;
  onCheckEvacRights?: () => void;
}

export default function OverviewDashboard({
  amphoes,
  weatherStations,
  riverGauges,
  thresholdSettings,
  isHighContrast,
  onSelectAmphoe,
  detectedAmphoeId = "lansaka",
  onCheckEvacRights
}: OverviewDashboardProps) {

  // Helper: Dynamic Flood Chance calculation per district (Amphoe)
  const calculateFloodChance = (amphoe: any) => {
    if (!amphoe) return 0;
    if (amphoe.floodChance !== undefined) return Number(amphoe.floodChance);
    const khaoLuangRain = weatherStations[0]?.rainfall24h || 100;
    const rainRatio = Math.min(khaoLuangRain / thresholdSettings.minRainfallCritical, 1.5);
    const thadiRiver = riverGauges[0];
    const thadiRatio = thadiRiver ? Math.min(thadiRiver.currentLevel / thadiRiver.warningLevel, 1.5) : 1;
    const weightFactor = (rainRatio * amphoe.rainfallFactor) + (thadiRatio * amphoe.riverFactor) + 0.1;
    const computed = Math.round(amphoe.baseFloodChance * weightFactor);
    return Math.min(Math.max(computed, 5), 99);
  };

  const getAmphoeRiskBadge = (chance: number) => {
    if (chance >= 80) return { label: "วิกฤต (อันตรายสูงสุด)", color: "bg-red-600 text-white font-black shadow-sm ring-2 ring-red-300" };
    if (chance >= 60) return { label: "เสี่ยงภัยสูง (ระดับส้ม)", color: "bg-orange-500 text-white font-black shadow-sm" };
    if (chance >= 40) return { label: "เฝ้าระวัง (ระดับเหลือง)", color: "bg-amber-400 text-slate-950 font-black shadow-sm" };
    return { label: "ปลอดภัยสูง (ระดับเขียว)", color: "bg-green-600 text-white font-black shadow-sm" };
  };

  const criticalRivers = riverGauges.filter(g => g.currentLevel >= g.criticalLevel);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* 1.1 🔴 3-Hour Early Warning Banner */}
      {criticalRivers.length > 0 ? (
        <div className={`p-5 rounded-3xl border animate-pulse flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_8px_30px_rgb(220,38,38,0.2)] select-none glass-panel ${isHighContrast
            ? "border-yellow-400 bg-black text-yellow-400"
            : "border-red-200/50 bg-red-50/80 dark:bg-red-950/40 text-red-900 dark:text-red-200"
          }`}>
          <div className="flex items-start md:items-center gap-3.5 flex-1">
            <div className="p-3 bg-red-600 text-white rounded-2xl shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-red-600 text-white font-extrabold text-[10px] md:text-xs px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
                  แจ้งเตือนภัยวิกฤตด่วนที่สุด (3-HOUR WARNING)
                </span>
              </div>
              <h2 className="text-sm md:text-base font-extrabold mt-1.5 leading-snug flex flex-wrap items-center gap-1.5">
                <span>ชลประทานพบมวลน้ำป่าไหลหลากล้นตลิ่งที่</span>
                <span className="text-yellow-300 underline font-black">{criticalRivers.map(r => r.name.split(" ")[0]).join(" และ ")}</span>
                <span>เตรียมยกกระเป๋าขึ้นที่สูงด่วนภายใน 3 ชม.!</span>
              </h2>
              <p className="text-xs opacity-80 mt-1 leading-relaxed">
                เป้าหมายอพยพหลบภัยหนีขึ้นที่ดอน ตำบลในเมือง, ท่าวัง, ปากนคร, และปากพนังตะวันออก ตรวจสอบพิกัดด้านล่าง
              </p>
            </div>
          </div>
          <button
            onClick={onCheckEvacRights}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-xl shrink-0 flex items-center justify-center gap-1.5 shadow w-full md:w-auto transition-transform active:scale-95"
          >
            <span>เช็คจุดสิทธิ์อพยพ</span> <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      ) : (
        <div className={`p-5 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm transition-all glass-panel ${isHighContrast
            ? "border-white bg-black text-white"
            : "border-green-200/50 bg-green-50/80 dark:bg-green-950/30 text-green-900 dark:text-green-200"
          }`}>
          <div className="flex items-start md:items-center gap-3 flex-1">
            <div className="p-3 bg-green-600 text-white rounded-2xl shrink-0">
              <Check className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-green-600 text-white font-black text-[9px] md:text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  สถานการณ์ภาพรวมปกติ (SAFE STATUS)
                </span>
              </div>
              <h2 className="text-sm md:text-base font-extrabold mt-1 leading-snug flex flex-wrap items-center gap-1.5">
                <span>ไม่มีแม่น้ำล้นตลิ่งระดับวิกฤต หรือปริมาณน้ำฝนเกินเกณฑ์เฝ้าระวัง 3 ชม.</span>
              </h2>
              <p className="text-xs opacity-80 mt-0.5 leading-relaxed">
                ระดับแม่น้ำสายหลักยังอยู่ใต้แนวป้องกันตลิ่ง ขอให้ประชาชนเฝ้าสังเกตการณ์รายงานสภาพอากาศรายชั่วโมงด้านล่าง
              </p>
            </div>
          </div>
          <button
            onClick={onCheckEvacRights}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shrink-0 flex items-center justify-center gap-1.5 shadow w-full md:w-auto transition-transform active:scale-95"
          >
            <span>เช็คจุดสิทธิ์อพยพ</span> <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      )}

      {/* 📊 Citizen High-Visibility Summary Dashboard Section */}
      <div className={`p-6 md:p-8 rounded-3xl border transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] glass-panel ${isHighContrast
          ? "bg-black border-white text-white"
          : "border-white/50 dark:border-slate-800/50"
        }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
          <div className="flex items-start gap-2.5">
            <Info className="w-5 h-5 text-blue-500 animate-pulse shrink-0 mt-0.5" />
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full uppercase">
                  ภาพรวมผู้สูงอายุและประชาชนทั่วไป
                </span>
              </div>
              <h2 className="text-base md:text-lg font-black tracking-tight mt-1 flex flex-wrap items-center gap-1.5 leading-snug">
                หน้าต่างเช็คสถานะน้ำท่วม & โอกาสเสี่ยงพิกัดคุณด่วน
              </h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6">
          <motion.div whileHover={{ scale: 1.02 }} className={`p-5 rounded-2xl border flex flex-col justify-between glass-panel ${isHighContrast ? "bg-black border-white text-white" : "border-white/40 dark:border-slate-700/50 bg-white/40 dark:bg-slate-800/40"}`}>
            <span className="text-sm opacity-80 font-bold flex flex-wrap items-center gap-1">🌊 พื้นที่น้ำท่วมสะสมปัจจุบัน:</span>
            <div className="flex flex-wrap items-baseline gap-1.5 mt-3">
              <span className="text-4xl font-black font-mono text-red-500 drop-shadow-sm">12.5%</span>
              <span className="text-xs opacity-70 font-medium">ของจังหวัด</span>
            </div>
            <p className="text-xs opacity-75 mt-2 font-medium leading-relaxed">เฝ้าระวังพิเศษ 6 อำเภอริมชายฝั่งปากพนัง</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className={`p-5 rounded-2xl border flex flex-col justify-between glass-panel ${isHighContrast ? "bg-black border-white text-white" : "border-white/40 dark:border-slate-700/50 bg-white/40 dark:bg-slate-800/40"}`}>
            <span className="text-sm opacity-80 font-bold flex flex-wrap items-center gap-1">☔ โอกาสฝนท่วมสูงสุดรายอำเภอ:</span>
            <div className="flex flex-wrap items-baseline gap-1.5 mt-3">
              <span className="text-4xl font-black font-mono text-yellow-500 drop-shadow-sm">58%</span>
              <span className="text-xs opacity-70 font-medium">สูงสุดเวลานี้</span>
            </div>
            <p className="text-xs opacity-75 mt-2 font-medium leading-relaxed">ประเมินจากปริมาณน้ำฝนเหนือแนวเขาหลวง</p>
          </motion.div>

          {(() => {
            const userAmp = amphoes.find(a => a.id === detectedAmphoeId) || amphoes[2];
            const userChance = calculateFloodChance(userAmp);
            const userRisk = getAmphoeRiskBadge(userChance);
            return (
              <motion.div whileHover={{ scale: 1.02 }} className={`p-5 rounded-2xl border flex flex-col justify-between transition-all glass-panel ${isHighContrast ? "bg-black border-white text-white shadow-md" : "border-blue-200/50 bg-blue-50/50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200"}`}>
                <span className="text-xs font-bold flex flex-wrap items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-ping shrink-0"></span>
                  <span>📍 พิกัด GPS สัญญาณบ้านคุณ:</span>
                </span>
                <div className="flex flex-wrap justify-between items-baseline gap-2 mt-2">
                  <span className="text-xl font-bold uppercase truncate max-w-[140px]">
                    {userAmp.name}
                  </span>
                  <span className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400 shrink-0">
                    {userChance}%
                  </span>
                </div>
                <div className="text-[10px] opacity-80 mt-1 flex flex-wrap justify-between items-center gap-1">
                  <span>โอกาสท่วมพิกัดจริง</span>
                  <span className="font-extrabold text-[9px] underline shrink-0">{userRisk.label.split(" (")[0]}</span>
                </div>
              </motion.div>
            );
          })()}
        </div>

        <div className="mt-4 p-4 md:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300">
          <h4 className="font-extrabold flex flex-wrap items-center gap-1.5 mb-3 text-sm leading-snug">
            🚨 <span>3 ข้อควรรู้สำหรับเตือนภัยล่วงหน้า 3 ชั่วโมง คุ้มภัยชีวิตพ้นน้ำ</span>
          </h4>
          <ol className="list-decimal list-inside space-y-2.5 opacity-90 leading-relaxed">
            <li className="flex flex-wrap items-baseline gap-1">
              <strong className="text-slate-900 dark:text-amber-200">ระบบจะส่งสัญญาณเตือน 3 ชั่วโมงล่วงหน้า</strong>
              <span>อย่างแม่นยำเมื่อระดับเซนเซอร์เทือกเขาหลวงพุ่งสูง เตรียมยกของและนำอุปกรณ์เครื่องนอนขึ้นที่สูงทันที</span>
            </li>
            <li className="flex flex-wrap items-center gap-1.5">
              <strong className="text-slate-900 dark:text-amber-200">เช็คสีสติ๊กเกอร์บนแผนที่:</strong>
              <div className="flex flex-wrap items-center gap-1.5 my-1 w-full md:w-auto">
                <span className="bg-green-600 text-white font-black px-2 py-0.5 rounded text-[10px] shadow-sm">🟢 เขียว - ปลอดภัยสูง</span>
                <span className="bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded text-[10px] shadow-sm">🟡 เหลือง - เฝ้าระวัง</span>
                <span className="bg-orange-500 text-white font-black px-2 py-0.5 rounded text-[10px] shadow-sm">🟠 ส้ม - เตรียมอพยพ</span>
                <span className="bg-red-600 text-white font-black px-2 py-0.5 rounded text-[10px] shadow-sm">🔴 แดง - อพยพด่วนที่สุด</span>
              </div>
            </li>
            <li className="flex flex-wrap items-baseline gap-1">
              <strong className="text-slate-900 dark:text-amber-200">หากมีเหตุด่วน</strong>
              <span>กดปุ่ม</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-red-600 text-white font-bold rounded text-[10px]">🔴 แจ้งเหตุน้ำท่วม</span>
              <span>ด้านล่างเพื่อขอทีมกู้ภัยอพยพ พร้อมระบบประสานงานศูนย์ภัยได้ทันท่วงที</span>
            </li>
          </ol>
        </div>
      </div>
    </motion.div>
  );
}
