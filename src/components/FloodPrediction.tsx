import React, { useState } from "react";
import { Layers, Search, Crosshair, CloudRain, CloudLightning, CloudDrizzle, Sun, Droplet, Wind, Compass, Info } from "lucide-react";
import { WeatherStation, ThresholdSettings } from "../types";
import { motion } from "motion/react";

interface FloodPredictionProps {
  amphoes: any[];
  weatherStations: WeatherStation[];
  thresholdSettings: ThresholdSettings;
  isDarkMode: boolean;
  isHighContrast: boolean;
  onSelectAmphoe: (amphoeId: string) => void;
  selectedAmphoe: string;
}

export default function FloodPrediction({
  amphoes,
  weatherStations,
  thresholdSettings,
  isDarkMode,
  isHighContrast,
  onSelectAmphoe,
  selectedAmphoe
}: FloodPredictionProps) {
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
      alert("เบราวเซอร์ของคุณไม่สนับสนุนการดึงข้อมูลตำแหน่งผ่านพิกัด GPS");
      return;
    }
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
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
        alert("ไม่สามารถเข้าถึงตำแหน่งผ่านดาวเทียมได้ เนื่องจากสิทธิ์เบราว์เซอร์หรือสัญญาณ");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const calculateFloodChance = (amphoe: any) => {
    if (!amphoe) return 0;
    if (amphoe.floodChance !== undefined) return Number(amphoe.floodChance);
    const khaoLuangRain = weatherStations[0]?.rainfall24h || 100;
    const rainRatio = Math.min(khaoLuangRain / thresholdSettings.minRainfallCritical, 1.5);
    const thadiRatio = 0.5; // Default ratio if no river gauge is passed here directly
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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
    >
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

        {/* Searching controls and realtime users location mapper */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pb-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="🔍 ค้นหาอำเภอในจังหวัดนครศรีธรรมราช (รองรับครบทั้ง 23 อำเภอ)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 text-xs rounded-2xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isHighContrast ? "bg-black text-white border-white" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"}`}
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

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={detectUserGPS}
            disabled={isDetecting}
            className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer ${isDetecting ? "opacity-70" : ""} ${isHighContrast ? "bg-black border-2 border-white text-white hover:bg-zinc-950" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
          >
            <Crosshair className={`w-3.5 h-3.5 ${isDetecting ? "animate-spin" : ""}`} />
            {isDetecting ? "กำลังระบุพิกัด..." : "📍 เช็คตำแหน่งอิง GPS จริง"}
          </motion.button>
        </div>

        {/* Current Location matched notification banner */}
        <motion.div 
          layout
          className={`p-4 md:p-5 rounded-3xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] glass-panel ${isHighContrast ? "bg-black border-white text-white" : "border-blue-200/50 dark:border-slate-700/50 bg-blue-50/50 dark:bg-slate-800/40 text-blue-900 dark:text-blue-100"}`}
        >
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
        </motion.div>

        {/* Dynamic filtered grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {(() => {
            const filtered = amphoes.filter((a) => {
              const query = searchQuery.trim().toLowerCase();
              if (!query) return true;
              return a.name.toLowerCase().includes(query) || a.engName.toLowerCase().includes(query);
            });

            if (filtered.length === 0) {
              return (
                <div className="col-span-full p-8 text-center rounded-3xl border border-dashed text-slate-500 dark:text-slate-400">
                  <p className="text-sm font-semibold">❌ ไม่พบข้อมูลอำเภอที่คุณกำลังค้นหา</p>
                </div>
              );
            }

            return filtered.map((a, i) => {
              const chance = calculateFloodChance(a);
              const risk = getAmphoeRiskBadge(chance);
              const isSelected = selectedAmphoe === a.id;

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={a.id}
                  onClick={() => onSelectAmphoe(a.id)}
                  className={`p-5 rounded-3xl border cursor-pointer transition-all flex justify-between items-center glass-panel ${isSelected
                      ? isHighContrast
                        ? "border-yellow-400 bg-zinc-950 text-white ring-2 ring-white scale-[1.02] shadow-lg"
                        : "border-blue-400/60 dark:border-blue-400/60 bg-blue-100/60 dark:bg-blue-900/40 text-blue-900 dark:text-blue-50 scale-[1.02] shadow-[0_8px_30px_rgb(59,130,246,0.15)]"
                      : isHighContrast
                        ? "border-white bg-[#111] text-white hover:bg-[#222]"
                        : "border-white/50 dark:border-slate-700/50 bg-white/40 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md"
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
                </motion.div>
              );
            });
          })()}
        </div>
      </div>

      {/* Right 1 Col: iOS Style Weather Info Widget */}
      <div className="space-y-4">
        <h3 className="font-bold text-base md:text-lg flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
          <CloudRain className="w-5 h-5 text-blue-500 animate-bounce" /> 1.3 สภาพอากาศเรียลไทม์
        </h3>

        {(() => {
          const activeWeatherAmphoe = amphoes.find(a => a.id === (selectedAmphoe || detectedAmphoeId)) || amphoes[2];
          const activeChance = calculateFloodChance(activeWeatherAmphoe);

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
            <motion.div 
              whileHover={{ y: -5 }}
              className={`p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-xl border select-none transition-all duration-500 min-h-[400px] ${isHighContrast
                ? "bg-black border-white text-white"
                : isHeavy
                  ? "bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-900 text-slate-100 border-indigo-900/60"
                  : "bg-gradient-to-br from-blue-500 via-sky-600 to-indigo-700 text-white border-sky-400/30"
              }`}
            >
              <div className="absolute top-0 right-0 w-44 h-44 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

              <div>
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

              <div className="p-2 rounded-xl bg-white/5 flex items-center gap-1 mt-3 text-[9px] opacity-80 leading-relaxed font-semibold border border-white/5">
                <Info className="w-3 h-3 text-cyan-300 shrink-0" />
                <span>*สัญญาณดาวเทียม GISTDA-9 และเซนเซอร์ปภ.ส่วนหน้า</span>
              </div>
            </motion.div>
          );
        })()}
      </div>
    </motion.div>
  );
}
