import React, { useState } from "react";
import {
  AlertTriangle,
  Droplet,
  CloudRain,
  Wind,
  Compass,
  Calendar,
  Waves,
  TrendingUp,
  TrendingDown,
  Info,
  Layers,
  ArrowRight,
  Search,
  Crosshair,
  CloudDrizzle,
  CloudLightning,
  Sun,
  Check
} from "lucide-react";
import { WeatherStation, RiverGauge, ThresholdSettings } from "../types";
import { generateHistoricalData } from "../data/mockData";

interface DashboardProps {
  amphoes: any[];
  weatherStations: WeatherStation[];
  riverGauges: RiverGauge[];
  thresholdSettings: ThresholdSettings;
  isDarkMode: boolean;
  isHighContrast: boolean;
  onSelectAmphoe: (amphoeId: string) => void;
  selectedAmphoe: string;
}

export default function Dashboard({
  amphoes,
  weatherStations,
  riverGauges,
  thresholdSettings,
  isDarkMode,
  isHighContrast,
  onSelectAmphoe,
  selectedAmphoe
}: DashboardProps) {
  const [selectedDate, setSelectedDate] = useState("2026-06-22");
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);

  // Custom interactive search and matched current location state
  const [searchQuery, setSearchQuery] = useState("");
  const [detectedAmphoeId, setDetectedAmphoeId] = useState<string>("lansaka");
  const [isDetecting, setIsDetecting] = useState(false);

  const amphoeCoordinates: Record<string, { lat: number; lng: number }> = {
    mueang: { lat: 8.43, lng: 99.96 },
    pakphanang: { lat: 8.35, lng: 100.13 },
    lansaka: { lat: 8.43, lng: 99.78 },
    phipun: { lat: 8.57, lng: 99.63 },
    thungsong: { lat: 8.17, lng: 99.67 },
    sichon: { lat: 9.00, lng: 99.90 },
    thasala: { lat: 8.67, lng: 99.90 },
    chauat: { lat: 7.97, lng: 100.00 },
    promkiri: { lat: 8.55, lng: 99.85 },
    chawang: { lat: 8.47, lng: 99.50 },
    chianyai: { lat: 8.18, lng: 100.13 },
    nabon: { lat: 8.27, lng: 99.60 },
    thungyai: { lat: 8.30, lng: 99.38 },
    ronphibun: { lat: 8.23, lng: 99.85 },
    khanom: { lat: 9.20, lng: 99.87 },
    huasai: { lat: 8.05, lng: 100.30 },
    bangkhan: { lat: 8.02, lng: 99.45 },
    thamphannara: { lat: 8.42, lng: 99.40 },
    chulabhorn: { lat: 8.08, lng: 99.87 },
    phraphrom: { lat: 8.37, lng: 99.90 },
    nopphitam: { lat: 8.72, lng: 99.75 },
    changklang: { lat: 8.35, lng: 99.57 },
    chaloemphrakiat: { lat: 8.15, lng: 100.07 }
  };

  const detectUserGPS = () => {
    if (!navigator.geolocation) {
      alert("เบราวเซอร์ของคุณไม่สนับสนุนการดึงข้อมูลตำแหน่งผ่านพิกัด GPS ประชาชน");
      return;
    }
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        // Find closest
        let closestId = "lansaka";
        let minDistance = Infinity;
        Object.entries(amphoeCoordinates).forEach(([ampId, coords]) => {
          const d = Math.hypot(userLat - coords.lat, userLng - coords.lng);
          if (d < minDistance) {
            minDistance = d;
            closestId = ampId;
          }
        });
        setDetectedAmphoeId(closestId);
        onSelectAmphoe(closestId);
        setIsDetecting(false);
      },
      (err) => {
        setIsDetecting(false);
        alert("ไม่สามารถเข้าถึงตำแหน่งผ่านดาวเทียมได้ เนื่องจากสิทธิ์เบราว์เซอร์หรือสัญญาณ คัดเลือกพิกัดจำลอง อำเภอลานสกา ให้เรียบร้อยครับ");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // Generate historical data based on calendar date select
  const { floodChance, mountainRainfall, waterLevelInM, trendData } = generateHistoricalData(selectedDate);

  // Helper: Dynamic Flood Chance calculation per district (Amphoe)
  // Integrates rainfall data and river gauge inputs with admin risk thresholds
  const calculateFloodChance = (amphoe: any) => {
    // Khao Luang rainfall compared to warning threshold
    const khaoLuangRain = weatherStations[0]?.rainfall24h || 100;
    const rainRatio = Math.min(khaoLuangRain / thresholdSettings.minRainfallCritical, 1.5);

    // River levels relative to critical threshold water levels
    const thadiRiver = riverGauges[0];
    const thadiRatio = thadiRiver ? Math.min(thadiRiver.currentLevel / thadiRiver.warningLevel, 1.5) : 1;

    // Combine factors with amphoe base weighting factors
    const weightFactor = (rainRatio * amphoe.rainfallFactor) + (thadiRatio * amphoe.riverFactor) + 0.1;
    const computed = Math.round(amphoe.baseFloodChance * weightFactor);

    return Math.min(Math.max(computed, 5), 99); // Bound 5% to 99%
  };

  const getAmphoeRiskBadge = (chance: number) => {
    if (chance >= 80) return { label: "วิกฤต (อันตรายสูงสุด)", color: "bg-red-500 text-white ring-red-400" };
    if (chance >= 60) return { label: "เสี่ยงภัยสูง (ระดับส้ม)", color: "bg-orange-500 text-white" };
    if (chance >= 40) return { label: "เฝ้าระวัง (ระดับเหลือง)", color: "bg-yellow-450 text-black" };
    return { label: "ปลอดภัยต่ำ (ระดับเขียว)", color: "bg-green-500 text-white" };
  };

  // Active Critical Warnings count based on river level
  const criticalRivers = riverGauges.filter(g => g.currentLevel >= g.criticalLevel);

  return (
    <div className="space-y-6">
      {/* 1.1 🔴 3-Hour Early Warning Banner */}
      {criticalRivers.length > 0 ? (
        <div className={`p-4 rounded-3xl border animate-pulse flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl select-none ${
          isHighContrast
            ? "border-yellow-400 bg-black text-yellow-400"
            : "border-red-200 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-200"
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
        <div className={`p-4 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm transition-all ${
          isHighContrast
            ? "border-white bg-black text-white"
            : "border-green-200 bg-green-50/70 dark:bg-green-950/20 text-green-900 dark:text-green-200"
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
      <div className={`p-6 rounded-3xl border transition-all ${
        isHighContrast 
          ? "bg-black border-white text-white" 
          : "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800"
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Quick Stat 1: Flooded % of entire province */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
            isHighContrast ? "bg-black border-white text-white" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800"
          }`}>
            <span className="text-xs opacity-75 font-semibold">🌊 พื้นที่น้ำท่วมสะสมปัจจุบัน:</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-3xl font-black font-mono text-red-500">12.5%</span>
              <span className="text-[10px] opacity-70">ของจังหวัด</span>
            </div>
            <p className="text-[10px] opacity-70 mt-1 italic">เฝ้าระวังพิเศษ 6 อำเภอริมชายฝั่งปากพนัง</p>
          </div>

          {/* Quick Stat 2: Province Average Flood Chance */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
            isHighContrast ? "bg-black border-white text-white" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800"
          }`}>
            <span className="text-xs opacity-75 font-semibold">☔ โอกาสฝนท่วมสูงสุดรายอำเภอ:</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-3xl font-black font-mono text-yellow-500">58%</span>
              <span className="text-[10px] opacity-70">สูงสุดเวลานี้</span>
            </div>
            <p className="text-[10px] opacity-70 mt-1 italic">ประเมินจากปริมาณน้ำฝนเหนือแนวเขาหลวง</p>
          </div>

          {/* Quick Stat 3: Auto Location GPS details */}
          {(() => {
            const userAmp = amphoes.find(a => a.id === detectedAmphoeId) || amphoes[2];
            const userChance = calculateFloodChance(userAmp);
            const userRisk = getAmphoeRiskBadge(userChance);
            return (
              <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                isHighContrast ? "bg-black border-white text-white shadow-md" : "bg-blue-50/40 dark:bg-blue-950/20 border-blue-100/30 text-blue-900 dark:text-blue-200"
              }`}>
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
              </div>
            );
          })()}
        </div>

        {/* 📚 Concise Elderly action warning instructions guidelines (Requirement: Concise instruction with NO fatigue) */}
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

      {/* Grid containing Weather stations & Amphoes Overview Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Amphoe Cards summarize % chances */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            <div>
              <h3 className="font-bold text-base md:text-lg flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
                <Layers className="w-5 h-5 text-blue-500" /> 1.2 เปอร์เซ็นต์ (%) โอกาสเกิดน้ำท่วมประจำวันนี้
              </h3>
              <p className="text-xs opacity-75 mt-0.5">คำนวณอัตโนมัติสัมพันธ์กับปริมาณฝนสะสมเทือกเขาหลวง ({thresholdSettings.minRainfallCritical}mm เกณฑ์ตรวจวัด)</p>
            </div>
          </div>

          {/* Granular searching controls and realtime users location mapper (Requirement 1.2 / Location search) */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pb-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="🔍 ค้นหาอำเภอในจังหวัดนครศรีธรรมราช (รองรับครบทั้ง 23 อำเภอ)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 text-xs rounded-2xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isHighContrast ? "bg-black text-white border-white" : "bg-white dark:bg-slate-800 border-slate-250 dark:border-slate-800 text-slate-900 dark:text-slate-100"
                }`}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")} 
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 hover:text-red-500 transition-colors"
                >
                  ล้างข้อมูล
                </button>
              )}
            </div>

            <button
              onClick={detectUserGPS}
              disabled={isDetecting}
              className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer ${
                isDetecting ? "animate-pulse opacity-70" : ""
              } ${
                isHighContrast 
                  ? "bg-black border-2 border-white text-white hover:bg-zinc-950" 
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              <Crosshair className={`w-3.5 h-3.5 ${isDetecting ? "animate-spin" : ""}`} />
              {isDetecting ? "กำลังระบุพิกัด..." : "📍 เช็คตำแหน่งอิง GPS จริง"}
            </button>
          </div>

          {/* Current Location matched notification banner */}
          <div className={`p-4 rounded-3xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isHighContrast ? "bg-black border-white text-white" : "bg-blue-50/50 dark:bg-slate-800/20 border-blue-100/30 dark:border-slate-700/50"
          }`}>
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping"></span>
              ตำแหน่งผู้ใช้ปัจจุบัน: 
              <strong className="text-blue-600 dark:text-blue-400 text-sm ml-1">
                อ.{amphoes.find(a => a.id === detectedAmphoeId)?.name || "ลานสกา"}
              </strong>
            </span>
            <span className="text-[11px] opacity-90">
              โอกาสน้ำท่วมพิกัดคุณเฉลี่ยวันนี้: 
              <strong className="text-red-500 text-sm ml-1.5 font-mono font-black">
                {calculateFloodChance(amphoes.find(a => a.id === detectedAmphoeId) || amphoes[2])}%
              </strong>
            </span>
          </div>

          {/* Dynamic filtered grid representing complete districts list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(() => {
              const filtered = amphoes.filter((a) => {
                const query = searchQuery.trim().toLowerCase();
                if (!query) return true;
                return a.name.toLowerCase().includes(query) || 
                       a.engName.toLowerCase().includes(query) ||
                       query.includes(a.name.toLowerCase());
              });

              if (filtered.length === 0) {
                return (
                  <div className="col-span-full p-8 text-center rounded-3xl border border-dashed text-slate-500 dark:text-slate-400">
                    <p className="text-sm font-semibold">❌ ไม่พบข้อมูลอำเภอที่คุณกำลังค้นหา</p>
                  </div>
                );
              }

              return filtered.map((a) => {
                const chance = calculateFloodChance(a);
                const risk = getAmphoeRiskBadge(chance);
                const isSelected = selectedAmphoe === a.id;

                return (
                  <div
                    key={a.id}
                    onClick={() => onSelectAmphoe(a.id)}
                    className={`p-4 rounded-3xl border shadow-sm cursor-pointer transition-all flex justify-between items-center ${
                      isSelected
                        ? isHighContrast
                          ? "border-yellow-400 bg-zinc-950 text-white ring-2 ring-white"
                          : "border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-105"
                        : isHighContrast
                          ? "border-white bg-[#111] text-white hover:bg-[#222]"
                          : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                        {a.name}
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 font-bold"></span>}
                      </h4>
                      <p className="text-[10px] opacity-75 mt-0.5">{a.engName}</p>
                      <span className={`inline-block text-[10px] px-2 py-0.5 mt-2 rounded-full font-bold ${risk.color}`}>
                        {risk.label}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="block text-2xl font-black font-mono tracking-tighter select-none">{chance}%</span>
                      <span className="text-[9px] opacity-75 font-semibold mt-0.5 block">โอกาสน้ำท่วม</span>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Right 1 Col: iPhone-Style iOS Weather Info Widget */}
        <div className="space-y-4">
          <h3 className="font-bold text-base md:text-lg flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
            <CloudRain className="w-5 h-5 text-blue-500 animate-bounce" /> 1.4 สภาพอากาศเรียลไทม์ (iOS Style Weather Widget)
          </h3>

          {/* Apple Weather inspired premium glassy layout card */}
          {(() => {
            const activeWeatherAmphoe = amphoes.find(a => a.id === (selectedAmphoe || detectedAmphoeId)) || amphoes[2];
            const activeChance = calculateFloodChance(activeWeatherAmphoe);
            
            // Derive weather parameters dynamically
            let weatherCondition = "มีเมฆส่วนใหญ่ ฝนฟ้าคะนอง";
            let tempVal = 26;
            let isHeavy = activeChance >= 75;
            let iconComponent = <CloudLightning className="w-14 h-14 text-yellow-350 animate-pulse drop-shadow-lg" />;

            if (isHeavy) {
              weatherCondition = "พายุฝนฟ้าคะนอง ตกหนักสะสม";
              tempVal = 24;
              iconComponent = <CloudLightning className="w-14 h-14 text-yellow-505 animate-bounce drop-shadow" />;
            } else if (activeChance >= 40) {
              weatherCondition = "ท้องฟ้าครึ้ม ฝนโปรยปรายทั่วไป";
              tempVal = 26;
              iconComponent = <CloudDrizzle className="w-14 h-14 text-blue-350 animate-pulse drop-shadow" />;
            } else {
              weatherCondition = "มีเมฆบางส่วน อากาศค่อนข้างร้อน";
              tempVal = 29;
              iconComponent = <Sun className="w-14 h-14 text-amber-400 rotate-180 animate-spin-slow" />;
            }

            return (
              <div className={`p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-xl border select-none transition-all duration-500 ${
                isHighContrast
                  ? "bg-black border-white text-white"
                  : isHeavy
                    ? "bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-900 text-slate-100 border-indigo-900/60"
                    : "bg-gradient-to-br from-blue-500 via-sky-600 to-indigo-700 text-white border-sky-400/30"
              }`}>
                {/* Visual subtle atmosphere ring element */}
                <div className="absolute top-0 right-0 w-44 h-44 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

                <div>
                  {/* Location Header representation */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest bg-white/10 dark:bg-black/20 px-2 py-0.5 rounded-full font-bold">
                        ตำแหน่งภัยพิบัติเรียลไทม์
                      </span>
                      <h4 className="font-extrabold text-lg md:text-xl mt-1 flex items-center gap-1.5">
                        📍 อ.{activeWeatherAmphoe.name}
                      </h4>
                      <p className="text-[10px] opacity-80">นครศรีธรรมราช, ประเทศไทย</p>
                    </div>

                    <div className="text-right">
                      <span className="text-4xl md:text-5xl font-mono font-black select-none tracking-tighter">
                        {tempVal}°
                      </span>
                      <p className="text-[9px] font-bold opacity-80 mt-1 font-mono">H: 32° L: 23°</p>
                    </div>
                  </div>

                  {/* Main State Weather Visual info */}
                  <div className="flex items-center gap-4 py-5 border-b border-white/15 dark:border-slate-800/80 my-2">
                    {iconComponent}
                    <div>
                      <p className="text-sm font-black leading-tight">{weatherCondition}</p>
                      <p className="text-xs opacity-95 mt-0.5 flex items-center gap-1">
                        🌧️ โอกาสเกิดฝนตก: <strong>{activeChance}%</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* iPhone style hourly horizontal visual slider list */}
                <div className="space-y-2 pt-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">พยากรณ์รายชั่วโมง (Hourly Forecast)</p>
                  <div className="flex justify-between gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {[
                      { hour: "ตอนนี้", temp: tempVal, prob: `${activeChance}%`, icon: isHeavy ? <CloudLightning className="w-5 h-5 text-yellow-355" /> : <CloudDrizzle className="w-5 h-5 text-blue-255" /> },
                      { hour: "14:00", temp: tempVal, prob: `${Math.min(activeChance + 5, 99)}%`, icon: <CloudLightning className="w-5 h-5 text-yellow-355" /> },
                      { hour: "15:00", temp: tempVal - 1, prob: `${Math.min(activeChance + 10, 99)}%`, icon: <CloudLightning className="w-5 h-5 text-red-405" /> },
                      { hour: "16:00", temp: tempVal, prob: `${Math.max(activeChance - 10, 10)}%`, icon: <CloudDrizzle className="w-5 h-5 text-slate-355" /> },
                      { hour: "17:00", temp: tempVal + 1, prob: "20%", icon: <Sun className="w-5 h-5 text-amber-355 animate-spin" /> }
                    ].map((hr, idx) => (
                      <div key={idx} className="flex flex-col items-center bg-white/5 dark:bg-black/10 px-2.5 py-2 rounded-2xl min-w-[56px] text-center shrink-0 border border-white/5">
                        <span className="text-[10px] font-medium opacity-85">{hr.hour}</span>
                        <div className="my-1.5">{hr.icon}</div>
                        <span className="text-[9px] font-bold text-cyan-200">{hr.prob}</span>
                        <span className="text-xs font-bold mt-0.5 font-mono">{hr.temp}°</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Auxiliary quick stats details row */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/10 dark:border-slate-800/60 text-[10px] opacity-90 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-blue-300" />
                    <span>ความชื้น: {weatherStations[0]?.humidity || 94}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5 text-teal-300" />
                    <span>ทิศลม: {weatherStations[0]?.windDirection || "SW"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <Compass className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                    <span>ความเร็วลม: {weatherStations[0]?.windSpeed || 22} กม./ชม.</span>
                  </div>
                </div>

                {/* Simulated Live status check */}
                <div className="p-2 rounded-xl bg-white/5 flex items-center gap-1 mt-3 text-[9px] opacity-80 leading-relaxed font-semibold border border-white/5">
                  <Info className="w-3 h-3 text-cyan-300 shrink-0" />
                  <span>*สัญญาณดาวเทียม GISTDA-9 และเซนเซอร์ปภ.ส่วนหน้า</span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* 2.0 Weather & Historical Water Analytics dashboard */}
      <div className={`p-6 rounded-3xl border shadow-md ${
        isHighContrast
          ? "bg-black border-white text-white"
          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-800"
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-4 mb-6 border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-base md:text-lg flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
              <Calendar className="w-5 h-5 text-blue-600" /> 2.0 ศูนย์ติดตามทางน้ำสายหลัก & วิเคราะห์ข้อมูลปฏิทินย้อนหลัง
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
              className={`p-2 rounded-xl text-xs font-extrabold border ${
                isHighContrast
                  ? "bg-black text-white border-white"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              }`}
            />
          </div>
        </div>

        {/* Historical quick status on that day */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-2xl border text-center ${isHighContrast ? "border-white bg-[#111]" : "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800"}`}>
            <span className="text-xs opacity-70 font-semibold">โอกาสน้ำท่วมวันระบาย ({selectedDate})</span>
            <span className="block text-2xl font-black font-mono mt-1 text-blue-600 dark:text-blue-400">{floodChance}%</span>
          </div>
          <div className={`p-4 rounded-2xl border text-center ${isHighContrast ? "border-white bg-[#111]" : "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800"}`}>
            <span className="text-xs opacity-70 font-semibold">สถิติน้ําฝนเทือกเขาหลวงรวมในวันนั้น</span>
            <span className="block text-2xl font-black font-mono mt-1 text-slate-800 dark:text-slate-300">{mountainRainfall} มม.</span>
          </div>
          <div className={`p-4 rounded-2xl border text-center ${isHighContrast ? "border-white bg-[#111]" : "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800"}`}>
            <span className="text-xs opacity-70 font-semibold">เฉลี่ยระบายหน้าตลิ่งคลองท่าดี</span>
            <span className="block text-2xl font-black font-mono mt-1 text-cyan-600 dark:text-cyan-400">{waterLevelInM} เมตร</span>
          </div>
        </div>

        {/* 2.2 🌊 ศูนย์ติดตามทางน้ำสายหลัก (คลองท่าดี, แม่น้ำปากพนัง, อ่างเก็บน้ำคลองกระทูน/ดินแดง) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          {riverGauges.map((g) => {
            const isRes = g.name.includes("อ่างเก็บน้ำ");
            // Compute percentage fullness relative to critical level (or just warning ratio)
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
              <div
                key={g.id}
                className={`p-4 rounded-3xl border flex flex-col justify-between overflow-hidden relative min-h-[160px] ${
                  isHighContrast ? "border-white bg-[#111]" : "bg-slate-50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800"
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
              </div>
            );
          })}
        </div>

        {/* 2.3 📉 กราฟเปรียบเทียบแนวโน้มปริมาณน้ำฝนและระดับน้ำ (สัปดาห์นี้ VS สถิติปีก่อน) */}
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
                <path
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
                  className={`p-2 rounded-lg border text-[10px] shadow-lg pointer-events-none transform -translate-x-1/2 z-30 transition-all ${
                    isHighContrast
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
      </div>
    </div>
  );
}
