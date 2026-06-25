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
}

export default function OverviewDashboard({
  amphoes,
  weatherStations,
  riverGauges,
  thresholdSettings,
  isHighContrast,
  onSelectAmphoe,
  detectedAmphoeId = "lansaka"
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
    if (chance >= 80) return { label: "วิกฤต (อันตรายสูงสุด)", color: "bg-red-500 text-white ring-red-400" };
    if (chance >= 60) return { label: "เสี่ยงภัยสูง (ระดับส้ม)", color: "bg-orange-500 text-white" };
    if (chance >= 40) return { label: "เฝ้าระวัง (ระดับเหลือง)", color: "bg-yellow-450 text-black" };
    return { label: "ปลอดภัยต่ำ (ระดับเขียว)", color: "bg-green-500 text-white" };
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
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-red-600 text-white rounded-2xl">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <span className="bg-red-600 text-white font-extrabold text-[10px] md:text-xs px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
                แจ้งเตือนภัยวิกฤตด่วนที่สุด (3-HOUR WARNING)
              </span>
              <h2 className="text-sm md:text-base font-extrabold mt-1.5 leading-snug">
                ชลประทานพบมวลน้ำป่าไหลหลากล้นตลิ่งที่{" "}
                {criticalRivers.map(r => r.name.split(" ")[0]).join(" และ ")} เตรียมยกกระเป๋าขึ้นที่สูงด่วนภายใน 3 ชม.!
              </h2>
              <p className="text-xs opacity-80 mt-1">
                เป้าหมายอพยพหลบภัยหนีขึ้นที่ดอนดอน ตำบลในเมือง, ท่าวัง, ปากนคร, และปากพนังตะวันออก ตรวจสอบพิกัดด้านล่าง
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectAmphoe("mueang")}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-xl shrink-0 flex items-center gap-1.5 shadow"
          >
            เช็คจุดสิทธิ์อพยพ <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className={`p-5 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm transition-all glass-panel ${isHighContrast
            ? "border-white bg-black text-white"
            : "border-green-200/50 bg-green-50/80 dark:bg-green-950/30 text-green-900 dark:text-green-200"
          }`}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-600 text-white rounded-2xl shrink-0">
              <Check className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="bg-green-650 text-white font-black text-[9px] md:text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                สถานการณ์ภาพรวมปกติ (SAFE STATUS)
              </span>
              <h2 className="text-sm md:text-base font-extrabold mt-1 leading-snug">
                ไม่มีแม่น้ำล้นตลิ่งระดับวิกฤต หรือปริมาณน้ำฝนเกินเกณฑ์เฝ้าระวัง 3 ชม.
              </h2>
              <p className="text-xs opacity-80 mt-0.5">
                ระดับแม่น้ำสายหลักยังอยู่ใต้แนวป้องกันตลิ่ง ขอให้ประชาชนเฝ้าสังเกตการณ์รายงานสภาพอากาศรายชั่วโมงด้านล่าง
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 📊 Citizen High-Visibility Summary Dashboard Section */}
      <div className={`p-6 md:p-8 rounded-3xl border transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] glass-panel ${isHighContrast
          ? "bg-black border-white text-white"
          : "border-white/50 dark:border-slate-800/50"
        }`}>
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-blue-500 animate-pulse" />
          <div>
            <span className="text-[10px] font-bold text-blue-650 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full uppercase">
              ภาพรวมผู้สูงอายุและประชาชนทั่วไป
            </span>
            <h2 className="text-base md:text-lg font-black tracking-tight mt-0.5">
              หน้าต่างเช็คสถานะน้ำท่วม & โอกาสเสี่ยงพิกัดคุณด่วน
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6">
          <motion.div whileHover={{ scale: 1.02 }} className={`p-5 rounded-2xl border flex flex-col justify-between glass-panel ${isHighContrast ? "bg-black border-white text-white" : "border-white/40 dark:border-slate-700/50 bg-white/40 dark:bg-slate-800/40"}`}>
            <span className="text-sm opacity-80 font-bold">🌊 พื้นที่น้ำท่วมสะสมปัจจุบัน:</span>
            <div className="flex items-baseline gap-1.5 mt-3">
              <span className="text-4xl font-black font-mono text-red-500 drop-shadow-sm">12.5%</span>
              <span className="text-xs opacity-70 font-medium">ของจังหวัด</span>
            </div>
            <p className="text-xs opacity-75 mt-2 font-medium">เฝ้าระวังพิเศษ 6 อำเภอริมชายฝั่งปากพนัง</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className={`p-5 rounded-2xl border flex flex-col justify-between glass-panel ${isHighContrast ? "bg-black border-white text-white" : "border-white/40 dark:border-slate-700/50 bg-white/40 dark:bg-slate-800/40"}`}>
            <span className="text-sm opacity-80 font-bold">☔ โอกาสฝนท่วมสูงสุดรายอำเภอ:</span>
            <div className="flex items-baseline gap-1.5 mt-3">
              <span className="text-4xl font-black font-mono text-yellow-500 drop-shadow-sm">58%</span>
              <span className="text-xs opacity-70 font-medium">สูงสุดเวลานี้</span>
            </div>
            <p className="text-xs opacity-75 mt-2 font-medium">ประเมินจากปริมาณน้ำฝนเหนือแนวเขาหลวง</p>
          </motion.div>

          {(() => {
            const userAmp = amphoes.find(a => a.id === detectedAmphoeId) || amphoes[2];
            const userChance = calculateFloodChance(userAmp);
            const userRisk = getAmphoeRiskBadge(userChance);
            return (
              <motion.div whileHover={{ scale: 1.02 }} className={`p-5 rounded-2xl border flex flex-col justify-between transition-all glass-panel ${isHighContrast ? "bg-black border-white text-white shadow-md" : "border-blue-200/50 bg-blue-50/50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200"}`}>
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                  📍 พิกัด GPS สัญญาณบ้านคุณ:
                </span>
                <div className="flex justify-between items-baseline mt-2">
                  <span className="text-xl font-bold uppercase truncate max-w-[120px]">
                    {userAmp.name}
                  </span>
                  <span className="text-2xl font-black font-mono text-blue-600 dark:text-blue-400">
                    {userChance}%
                  </span>
                </div>
                <p className="text-[10px] opacity-80 mt-1 flex justify-between items-center">
                  <span>โอกาสท่วมพิกัดจริง</span>
                  <span className="font-extrabold text-[9px] underline">{userRisk.label.split(" (")[0]}</span>
                </p>
              </motion.div>
            );
          })()}
        </div>

        <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300">
          <h4 className="font-extrabold flex items-center gap-1.5 mb-2 text-sm">
            🚨 3 ข้อควรรู้สำหรับเตือนภัยล่วงหน้า 3 ชั่วโมง คุ้มภัยชีวิตพ้นน้ำ
          </h4>
          <ol className="list-decimal list-inside space-y-1.5 opacity-90 leading-relaxed">
            <li>
              <strong>ระบบจะส่งสัญญาณเตือน 3 ชั่วโมงล่วงหน้า</strong> อย่างแม่นยำเมื่อระดับเซนเซอร์เทือกเขาหลวงพุ่งสูง เตรียมยกของและนำอุปกรณ์เครื่องนอนขึ้นที่สูงทันที
            </li>
            <li>
              <strong>เช็คสีสติ๊กเกอร์บนแผนที่</strong>: <span className="bg-green-500 text-white px-1 py-0.5 rounded text-[10px]">เขียว - ปลอดภัย</span> / <span className="bg-yellow-450 text-black px-1 py-0.5 rounded text-[10px]">เหลือง - ระแวดระวัง</span> / <span className="bg-orange-500 text-white px-1 py-0.5 rounded text-[10px]">ส้ม - เตรียมอพยพ</span> / <span className="bg-red-500 text-white px-1 py-0.5 rounded text-[10px]">แดง - อพยพด่วนที่สุด</span>
            </li>
            <li>
              <strong>หากมีเหตุด่วน</strong> กดปุ่ม 🔴 <strong>"แจ้งภัยพิบัติ"</strong> ด้านล่างเพื่อขอทีมกู้ภัยอพยพ พร้อมระบบประสานงานแจ้งคูปองและสถานบริการศูนย์ภัยได้ทันท่วงที
            </li>
          </ol>
        </div>
      </div>
    </motion.div>
  );
}
