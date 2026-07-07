import React, { useState } from "react";
import { AlertTriangle, Check, Info, ArrowRight, Waves, TrendingUp, TrendingDown, Minus } from "lucide-react";
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

  const [isWaveDetailOpen, setIsWaveDetailOpen] = useState(false);
  const criticalRivers = riverGauges.filter(g => g.currentLevel >= g.criticalLevel);
  const warningRivers = riverGauges.filter(g => g.currentLevel >= g.warningLevel && g.currentLevel < g.criticalLevel);
  const maxRain = Math.max(...weatherStations.map(s => s.rainfall24h || 0), 0);

  let waveTheme = {
    levelText: "🟢 ระดับปกติ / ปลอดภัย (GREEN WAVE)",
    badgeText: "🌊 คลื่นน้ำระดับปกติ/ปลอดภัย (สีเขียว)",
    colorScheme: "from-emerald-600 via-teal-600 to-green-600 text-white border-emerald-400 shadow-emerald-500/20",
    bgCard: "bg-emerald-50/95 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100",
    iconColor: "bg-emerald-600 text-white",
    severityLabel: "ระดับ 1: ปกติ / ปลอดภัย (สีเขียว)",
    title: "สถานการณ์คลื่นน้ำและลำคลองสายหลักอยู่ในเกณฑ์ปลอดภัย",
    desc: "ระดับน้ำในลำคลองต่ำกว่าตลิ่ง กระแสน้ำไหลสงบ ไม่มีคลื่นน้ำป่าหลาก สามารถใช้ชีวิตประจำวันได้ตามปกติ",
    location: "ทั่วเขตเทศบาลนครนครศรีธรรมราช และคลองสายหลัก (คลองท่าดี, คลองท่าวัง, ปากนคร)",
    timeText: `เวลา ${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น. (${new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })})`,
    advice: "• สถานการณ์ทั่วไปปลอดภัย สามารถใช้ชีวิตประจำวันได้ตามปกติ\n• ติดตามการแจ้งเตือนจากศูนย์บรรเทาภัยอย่างต่อเนื่อง",
    isCritical: false,
    waveIcon: "🌊",
    btnColor: "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500"
  };

  if (criticalRivers.length > 0 || maxRain >= thresholdSettings.minRainfallCritical) {
    const names = criticalRivers.map(r => r.name).join(", ") || "คลองท่าดี (ต้นน้ำเขาหลวง)";
    waveTheme = {
      levelText: "🚨 ระดับวิกฤตคลื่นน้ำหลาก (RED WAVE)",
      badgeText: "🌊🌊🌊 คลื่นน้ำระดับวิกฤตด่วนที่สุด (RED WAVE 3-HR WARNING)",
      colorScheme: "from-red-700 via-rose-600 to-red-800 text-white border-red-500 shadow-red-600/40 animate-pulse",
      bgCard: "bg-red-50/95 dark:bg-red-950/60 border-red-400 dark:border-red-700 text-red-950 dark:text-red-100 shadow-[0_8px_30px_rgb(220,38,38,0.25)]",
      iconColor: "bg-red-600 text-white ring-4 ring-red-400/50 animate-bounce",
      severityLabel: "ระดับ 3: วิกฤตสูงสุด (สีแดง #DC2626) - คลื่นน้ำป่าหลากเชี่ยวแรง",
      title: `พบคลื่นมวลน้ำป่าหลากเชี่ยวแรงล้นตลิ่งที่ ${names} เตรียมยกกระเป๋าขึ้นที่สูงด่วน!`,
      desc: `ปริมาณฝนสะสมเขาหลวง ${maxRain} มม. (เกณฑ์สีแดงวิกฤตมาก) กระแสน้ำป่าไหลหลากลงสู่คลองสายหลัก มีความเร็วและแรงคลื่นสูงล้นตลิ่งแล้ว มวลน้ำกำลังเดินทางถึงเขตเมืองในอีก 3 ชั่วโมง!`,
      location: `ต้นน้ำเทือกเขาหลวง & ${names} -> ไหลบ่าเข้าท่วม เขตเทศบาลนครนครศรีธรรมราช (โซนตัวเมือง, ท่าวัง, ปากนคร, ปากพนัง)`,
      timeText: `เวลาเกิดเหตุ: ${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น. (${new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}) - มวลน้ำถึงเขตเมืองใน 3 ชม.!`,
      advice: "• ห้ามขับขี่หรือเดินลุยผ่านกระแสน้ำเชี่ยวเด็ดขาด!\n• ขนย้ายสิ่งของขึ้นที่สูงพ้นระดับน้ำล้นตลิ่งทันที\n• พร้อมอพยพไปที่ศูนย์พักพิง รร.เทศบาลวัดมเหยงคณ์ หรือจุดพักพิงใกล้บ้าน",
      isCritical: true,
      waveIcon: "🌊🌊🌊",
      btnColor: "bg-red-600 hover:bg-red-700 text-white border-red-500"
    };
  } else if (warningRivers.length > 0 || maxRain >= thresholdSettings.minRainfallWarning) {
    const names = warningRivers.map(r => r.name).join(", ") || "ลำคลองสายรอง";
    waveTheme = {
      levelText: "⚠️ ระดับเฝ้าระวังคลื่นน้ำหลาก (ORANGE WAVE)",
      badgeText: "🌊🌊 คลื่นน้ำระดับเฝ้าระวัง (ORANGE WAVE WATCH)",
      colorScheme: "from-orange-600 via-amber-600 to-yellow-600 text-white border-orange-400 shadow-orange-500/30",
      bgCard: "bg-orange-50/95 dark:bg-orange-950/50 border-orange-300 dark:border-orange-700 text-orange-950 dark:text-orange-100",
      iconColor: "bg-orange-500 text-white ring-4 ring-orange-300/50 animate-pulse",
      severityLabel: "ระดับ 2: เฝ้าระวัง (สีส้ม #EA580C) - ระดับน้ำเพิ่มขึ้นรวดเร็ว",
      title: `ระดับน้ำในลำคลองเพิ่มขึ้นอย่างรวดเร็ว เริ่มมีคลื่นกระแสน้ำไหลแรงที่ ${names}`,
      desc: `ปริมาณฝนสะสม ${maxRain} มม. ระดับน้ำในลำคลองมีอัตราเพิ่มขึ้น +15 ซม./ชม. เริ่มมีคลื่นกระแสน้ำเชี่ยวบริเวณที่ลุ่มต่ำและเชิงเขา`,
      location: `ลำคลองสายหลัก ${names} และพื้นที่ลุ่มต่ำริมตลิ่งรอบนอกตัวเมือง`,
      timeText: `เวลาตรวจสอบ: ${new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น. (${new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}) - แนวโน้มน้ำเพิ่มขึ้น`,
      advice: "• ติดตามระดับน้ำและกราฟคลื่นน้ำอย่างใกล้ชิดทุก 1 ชั่วโมง\n• เตรียมความพร้อมเก็บของมีค่าและเอกสารสำคัญขึ้นที่สูง",
      isCritical: false,
      waveIcon: "🌊🌊",
      btnColor: "bg-orange-600 hover:bg-orange-700 text-white border-orange-500"
    };
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* 🌊 1.1 Dynamic Water Wave Theme Banner & Interactive Status */}
      <div className={`p-6 rounded-3xl border transition-all duration-300 select-none glass-panel shadow-lg ${
        isHighContrast
          ? "border-yellow-400 bg-black text-yellow-400"
          : waveTheme.bgCard
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center gap-4 flex-1">
            <div className={`p-4 rounded-2xl shrink-0 flex items-center justify-center shadow-md ${waveTheme.iconColor}`}>
              <Waves className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`font-extrabold text-[11px] md:text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5 ${
                  isHighContrast ? "bg-yellow-400 text-black" : "bg-gradient-to-r " + waveTheme.colorScheme
                }`}>
                  <span>{waveTheme.badgeText}</span>
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-black/10 dark:bg-white/10">
                  LIVE 🔴
                </span>
              </div>
              <h2 className="text-base md:text-lg font-black mt-2 leading-snug flex flex-wrap items-center gap-1.5">
                <span>{waveTheme.title}</span>
              </h2>
              <p className="text-xs md:text-sm opacity-90 mt-1 font-medium leading-relaxed">
                {waveTheme.desc}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={() => setIsWaveDetailOpen(!isWaveDetailOpen)}
              className={`px-4 py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 border ${
                isWaveDetailOpen 
                  ? "bg-slate-900 text-white border-slate-700 dark:bg-white dark:text-slate-900" 
                  : "bg-white/80 hover:bg-white text-slate-900 border-slate-200 dark:bg-slate-800 dark:text-white dark:border-slate-700"
              }`}
            >
              <Info className="w-4 h-4 shrink-0 text-blue-500" />
              <span>{isWaveDetailOpen ? "ซ่อนข้อมูลระดับ/สถานที่" : "🔍 กดดูระดับไหน & เหตุที่ไหน"}</span>
            </button>

            <button
              onClick={onCheckEvacRights}
              className={`px-5 py-3 text-white text-xs font-extrabold rounded-xl shrink-0 flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 ${
                waveTheme.btnColor
              }`}
            >
              <span>เช็คจุดสิทธิ์อพยพ</span> <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>

        {/* 📋 Interactive Expandable Details: ระดับไหน - เหตุที่ไหน - เวลาเท่าไหร่ */}
        {(isWaveDetailOpen || waveTheme.isCritical) && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="mt-5 pt-5 border-t border-black/10 dark:border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* 1. ระดับไหน */}
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-black/40 border border-black/5 dark:border-white/5 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <span>📊 ระดับคลื่นน้ำ / ความหนัก</span>
                </div>
                <div className="text-sm md:text-base font-black text-slate-900 dark:text-white">
                  {waveTheme.severityLabel}
                </div>
              </div>
              <div className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                กระแสน้ำไหลบ่าเชี่ยวแรงตามสภาพพื้นที่
              </div>
            </div>

            {/* 2. เหตุที่ไหน */}
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-black/40 border border-black/5 dark:border-white/5 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <span>📍 เหตุที่ไหน (สถานที่เกิดเหตุ)</span>
                </div>
                <div className="text-sm font-extrabold text-blue-950 dark:text-blue-100 leading-snug">
                  {waveTheme.location}
                </div>
              </div>
              <div className="mt-2 text-[11px] font-semibold text-blue-600 dark:text-blue-300">
                พื้นที่รับน้ำเหนือและจุดลุ่มต่ำริมคลอง
              </div>
            </div>

            {/* 3. เวลาเท่าไหร่ */}
            <div className="p-4 rounded-2xl bg-white/60 dark:bg-black/40 border border-black/5 dark:border-white/5 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <span>🕒 เวลาเท่าไหร่ & คำแนะนำ</span>
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  {waveTheme.timeText}
                </div>
              </div>
              <div className="mt-2 text-[11px] font-medium text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {waveTheme.advice}
              </div>
            </div>
          </motion.div>
        )}
      </div>

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
                ตรวจสอบสถานการณ์น้ำท่วมและระดับความเสี่ยงในพื้นที่ของคุณ
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

      {/* 🌊 แดชบอร์ดติดตามปริมาณน้ำอ่างเก็บน้ำสำคัญจังหวัดนครศรีธรรมราช (Reservoirs Live Storage Board) */}
      <div className={`p-6 md:p-8 rounded-3xl border transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] glass-panel ${
        isHighContrast
          ? "bg-black border-white text-white"
          : "bg-gradient-to-br from-blue-900/10 via-slate-900/5 to-cyan-900/10 dark:from-blue-950/30 dark:via-slate-900 dark:to-cyan-950/30 border-blue-200/60 dark:border-blue-800/60"
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-6 border-b pb-4 border-blue-200/40 dark:border-blue-800/40">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-md shrink-0 mt-0.5">
              <Waves className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-extrabold text-white bg-blue-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  RESERVOIR LIVE TELEMETRY
                </span>
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                  อัปเดตเรียลไทม์
                </span>
              </div>
              <h2 className="text-base md:text-lg font-black tracking-tight text-slate-900 dark:text-white mt-1.5 leading-snug">
                🌊 แดชบอร์ดบอกระดับปริมาณน้ำอ่างเก็บน้ำสำคัญจังหวัดนครศรีธรรมราช
              </h2>
              <p className="text-xs opacity-75 mt-0.5 leading-relaxed">
                ติดตามเปอร์เซ็นต์ความจุเขื่อนสำคัญแบบเรียลไทม์ เพื่อประเมินมวลน้ำป่าหลากเหนือเขื่อน และสัญญาณเตือนการพร่องน้ำลงสู่ลำน้ำสายหลัก
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-extrabold px-3.5 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300 shrink-0 select-none">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            <span>สถานีโทรมาตรชลประทาน ปภ.</span>
          </div>
        </div>

        {/* Reservoir Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {riverGauges
            .filter((g) => g.name.includes("อ่างเก็บน้ำ"))
            .map((res) => {
              const capPct = Math.min(Math.round((res.currentLevel / res.criticalLevel) * 100), 100);
              const isCrit = capPct >= 90;
              const isWarn = capPct >= 80 && !isCrit;

              return (
                <motion.div
                  whileHover={{ y: -4, scale: 1.01 }}
                  key={res.id}
                  className={`p-4 md:p-5 rounded-2xl border flex flex-col justify-between relative overflow-hidden transition-all shadow-sm hover:shadow-md ${
                    isHighContrast
                      ? "bg-[#111] border-white text-white"
                      : isCrit
                      ? "bg-red-50/90 dark:bg-red-950/40 border-red-400 dark:border-red-600 ring-2 ring-red-500/20"
                      : isWarn
                      ? "bg-orange-50/90 dark:bg-orange-950/30 border-orange-400 dark:border-orange-600"
                      : "bg-white/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 truncate">
                        {res.name.includes("(") ? res.name.split("(")[1].replace(")", "") : "นครศรีฯ"}
                      </span>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-black leading-none shrink-0 ${
                          isCrit
                            ? "bg-red-600 text-white animate-pulse shadow-sm"
                            : isWarn
                            ? "bg-orange-500 text-white shadow-sm"
                            : "bg-green-600 text-white shadow-sm"
                        }`}
                      >
                        {isCrit ? "🔴 ใกล้เต็มวิกฤต!" : isWarn ? "🟠 พร่องน้ำเฝ้าระวัง" : "🟢 รับมวลน้ำได้มาก"}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm md:text-base text-slate-900 dark:text-white mt-1.5 leading-snug truncate">
                      {res.name.split(" ")[0]}
                    </h4>
                  </div>

                  {/* Big Number Storage */}
                  <div className="my-4">
                    <div className="flex items-baseline gap-1.5">
                      <span
                        className={`text-3xl md:text-4xl font-black font-mono tracking-tighter ${
                          isCrit ? "text-red-600 dark:text-red-400" : isWarn ? "text-orange-600 dark:text-orange-400" : "text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {res.currentLevel}
                      </span>
                      <span className="text-xs font-bold opacity-75">ล้าน ลบ.ม.</span>
                    </div>

                    {/* Progress Capacity Bar */}
                    <div className="space-y-1.5 mt-3">
                      <div className="flex justify-between text-[10px] font-extrabold opacity-80">
                        <span>ระดับความจุเขื่อน</span>
                        <span className="font-mono">{capPct}% ({res.criticalLevel} ลบ.ม.)</span>
                      </div>
                      <div className="w-full h-3 bg-slate-200 dark:bg-slate-700/80 rounded-full overflow-hidden p-0.5 border border-slate-300/60 dark:border-slate-600/60">
                        <div
                          style={{ width: `${capPct}%` }}
                          className={`h-full rounded-full transition-all duration-1000 ${
                            isCrit
                              ? "bg-gradient-to-r from-red-500 to-rose-600 animate-pulse"
                              : isWarn
                              ? "bg-gradient-to-r from-amber-400 to-orange-500"
                              : "bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500"
                          }`}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Stats & Trend */}
                  <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700/80 flex justify-between items-center text-[10px] font-bold">
                    <span className="flex items-center gap-1">
                      <span>แนวโน้ม:</span>
                      <span className={`flex items-center gap-0.5 ${res.trend === "rising" ? "text-red-500" : res.trend === "falling" ? "text-green-600 dark:text-green-400" : "text-blue-500"}`}>
                        {res.trend === "rising" ? (
                          <>
                            <TrendingUp className="w-3 h-3" /> เพิ่มขึ้น
                          </>
                        ) : res.trend === "falling" ? (
                          <>
                            <TrendingDown className="w-3 h-3" /> ลดลง
                          </>
                        ) : (
                          <>
                            <Minus className="w-3 h-3" /> ทรงตัว
                          </>
                        )}
                      </span>
                    </span>
                    <span className="opacity-65 font-mono">เตือนที่ {res.warningLevel}</span>
                  </div>
                </motion.div>
              );
            })}
        </div>

        {/* Impact Analysis Banner */}
        <div className="mt-5 p-4 rounded-2xl bg-blue-600/10 dark:bg-blue-900/30 border border-blue-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs leading-relaxed text-blue-950 dark:text-blue-200">
          <div className="flex items-start md:items-center gap-2.5">
            <span className="text-lg shrink-0">📊</span>
            <span>
              <strong>สรุปสถานการณ์บริหารจัดการน้ำอ่างเก็บน้ำ (4 อ่างเก็บน้ำหลักโครงการพระราชดำริ/ชลประทาน และ 4 แหล่งน้ำเสริมในจังหวัด):</strong> อ่างเก็บน้ำคลองกะทูน (จุ 70.50 ล้าน ลบ.ม.) และอ่างเก็บน้ำคลองดินแดง (จุ 60.00 ล้าน ลบ.ม.) อ.พิปูน รวมถึงอ่างเก็บน้ำห้วยน้ำใส อ.ชะอวด (จุ 80.00 ล้าน ลบ.ม.) มีปริมาณน้ำรับมวลน้ำหลากเกือบ 90% ชลประทานได้เร่งระบายน้ำผ่านระบบทางน้ำล้น ส่วนอ่างเก็บน้ำขนาดเล็กบ้านเสม็ดจวน อ.ทุ่งใหญ่ (จุ 1.70 ล้าน ลบ.ม.) และอ่างเสริมในจังหวัดยังอยู่ในเกณฑ์ปลอดภัย
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
