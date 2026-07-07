import React, { useEffect, useState } from "react";
import { Compass, Navigation, Crosshair, MapPin, ExternalLink } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { FloodReport, FloodSeverity, ReportStatus } from "../types";
import { ImageLightboxModal } from "./ImageLightboxModal";

// Setup default marker icons (in case custom ones fail)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface InteractiveMapProps {
  reports: FloodReport[];
  evacCenters: any[];
  selectedAmphoe: string;
  onSelectAmphoe: (amphoeId: string) => void;
  isDarkMode: boolean;
  isHighContrast: boolean;
  onMapClick?: (lat: number, lng: number) => void;
  interactiveMode?: boolean; // If true, allows pinning
  tempPin?: { latitude: number; longitude: number } | null;
}

// Helper: Haversine distance formula in meters
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function formatDist(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} เมตร`;
  }
  const km = (meters / 1000).toFixed(2);
  return `${km} กม. (${Math.round(meters).toLocaleString()} ม.)`;
}

// Custom hook to listen to map clicks
function MapClickObserver({ onMapClick, interactiveMode }: { onMapClick?: (lat: number, lng: number) => void, interactiveMode: boolean }) {
  useMapEvents({
    click(e) {
      if (interactiveMode && onMapClick) {
        onMapClick(+e.latlng.lat.toFixed(5), +e.latlng.lng.toFixed(5));
      }
    },
  });
  return null;
}

export default function InteractiveMap({
  reports,
  evacCenters,
  selectedAmphoe,
  onSelectAmphoe,
  isDarkMode,
  isHighContrast,
  onMapClick,
  interactiveMode = false,
  tempPin = null
}: InteractiveMapProps) {

  // Live user location state (defaults to Mueang Nakhon Si Thammarat city center)
  const [userPos, setUserPos] = useState<{ lat: number; lng: number }>({
    lat: 8.4325,
    lng: 99.9631
  });
  const [isLocating, setIsLocating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert("เบราว์เซอร์ของคุณไม่รองรับการระบุตำแหน่ง GPS");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
      },
      (err) => {
        console.error(err);
        setIsLocating(false);
        alert("ไม่สามารถดึงตำแหน่ง GPS ได้ โปรดตรวจสอบการอนุญาตสิทธิ์ในเบราว์เซอร์");
      },
      { enableHighAccuracy: true }
    );
  };

  // กรองเฉพาะเคสที่ยังช่วยเหลือไม่เสร็จ (active cases) มาแสดงบนแผนที่สำหรับประชาชนทั่วไป
  const activeReports = reports.filter((r) => r.status !== ReportStatus.COMPLETED);

  // คำนวณหาจุดน้ำท่วมใกล้ที่สุด (เฉพาะจุดที่ยังไม่ช่วยเหลือเสร็จสิ้น)
  let minFloodDist = Infinity;
  let nearestFlood: FloodReport | null = null;
  activeReports.forEach((r) => {
    const d = calculateDistanceMeters(userPos.lat, userPos.lng, r.latitude, r.longitude);
    if (d < minFloodDist) {
      minFloodDist = d;
      nearestFlood = r;
    }
  });

  // คำนวณหาศูนย์อพยพใกล้ที่สุด
  let minEvacDist = Infinity;
  let nearestEvac: any | null = null;
  evacCenters.forEach((e) => {
    const d = calculateDistanceMeters(userPos.lat, userPos.lng, e.latitude, e.longitude);
    if (d < minEvacDist) {
      minEvacDist = d;
      nearestEvac = e;
    }
  });

  // Custom Div Icons for visual fidelity with Water Wave Theme & Radar Warnings
  const getSeverityIcon = (sev: FloodSeverity) => {
    let colorClass = "bg-gradient-to-br from-emerald-500 to-green-600 border-emerald-300";
    let extra = "shadow-[0_0_15px_rgba(16,185,129,0.8)]";
    if (sev === FloodSeverity.CRITICAL) { 
      colorClass = "bg-gradient-to-br from-red-600 to-rose-700 border-red-200"; 
      extra = "ring-4 ring-red-400 animate-bounce shadow-[0_0_25px_rgba(220,38,38,0.9)]"; 
    }
    else if (sev === FloodSeverity.HIGH) { 
      colorClass = "bg-gradient-to-br from-orange-500 to-amber-600 border-orange-200"; 
      extra = "ring-4 ring-orange-300 animate-pulse shadow-[0_0_20px_rgba(234,88,12,0.8)]"; 
    }
    else if (sev === FloodSeverity.MEDIUM) { 
      colorClass = "bg-gradient-to-br from-yellow-400 to-amber-500 border-yellow-100"; 
      extra = "ring-2 ring-yellow-200 shadow-[0_0_15px_rgba(234,179,8,0.7)]"; 
    }
    
    return L.divIcon({
      className: "custom-pin",
      html: `<div class="w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-2xl text-white ${colorClass} ${extra}" style="font-size: 20px;">🌊</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
    });
  };

  const evacIcon = L.divIcon({
    className: "custom-evac-pin",
    html: `<div class="w-8 h-8 rounded-full bg-blue-600 text-white border-2 border-white shadow-xl flex items-center justify-center" style="font-size: 14px;">🏠</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });

  const tempIcon = L.divIcon({
    className: "custom-temp-pin",
    html: `<div class="w-8 h-8 rounded-full bg-yellow-400 text-black border-4 border-black animate-pulse shadow-2xl flex items-center justify-center font-bold">📍</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  const userLiveIcon = L.divIcon({
    className: "custom-user-live-pin",
    html: `<div class="w-10 h-10 rounded-full bg-blue-600 text-white border-2 border-white shadow-[0_0_20px_rgba(37,99,235,0.8)] animate-pulse flex items-center justify-center cursor-grab" style="font-size: 18px;">🙋‍♂️</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });

  const getThaiSeverity = (sev: FloodSeverity) => {
    switch (sev) {
      case FloodSeverity.CRITICAL: return "วิกฤต (แดงด่วน)";
      case FloodSeverity.HIGH: return "สูงมาก (ส้มระวัง)";
      case FloodSeverity.MEDIUM: return "ปานกลาง (เหลืองขัง)";
      case FloodSeverity.LOW: return "ต่ำ (เขียวเบา)";
    }
  };

  const getThaiStatus = (st: ReportStatus) => {
    switch (st) {
      case ReportStatus.PENDING: return "🔴 รอดำเนินการ";
      case ReportStatus.DISPATCHED: return "🟡 ส่งต่อหน่วยงานแล้ว";
      case ReportStatus.UNDERWAY: return "🔵 กำลังลงพื้นที่ช่วยเหลือ";
      case ReportStatus.COMPLETED: return "🟢 ช่วยเหลือสำเร็จ";
    }
  };

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden border p-3 md:p-6 flex flex-col gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] glass-panel ${
      isHighContrast
        ? "bg-black border-white text-white"
        : "border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/40"
    }`}>
      
      {/* 📱 Sleek Universal Responsive Navigation Dashboard Bar (Non-Clutter) */}
      <div className={`w-full p-4 md:p-5 rounded-2xl border transition-all ${
        isHighContrast
          ? "bg-black border-white text-white"
          : "bg-slate-50/90 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 shadow-sm"
      }`}>
        {/* Top Header & GPS Update Trigger */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
            </span>
            <div>
              <h3 className="text-sm md:text-base font-black tracking-tight text-slate-800 dark:text-white leading-none">
                ระบบติดตามพิกัดเตือนภัย & นำทางอพยพใกล้ตัวคุณ (Live GPS)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                ออกแบบให้รองรับทั้งมือถือ ไอแพด และคอมพิวเตอร์ แผนที่ไม่บังสายตา 100%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-[10px] font-mono font-medium text-slate-400 hidden lg:inline bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border">
              GPS: {userPos.lat.toFixed(4)}, {userPos.lng.toFixed(4)}
            </span>
            <button 
              onClick={handleLocateUser} 
              disabled={isLocating}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 text-xs font-black rounded-xl text-white transition-all flex items-center justify-center gap-1.5 shadow"
            >
              {isLocating ? "⏳ กำลังดึงพิกัด..." : "📍 อัปเดตตำแหน่งปัจจุบันของฉัน"}
            </button>
          </div>
        </div>

        {/* Responsive Grid Cards: Nearest Evac & Nearest Flood */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-3.5">
          
          {/* Card 1: ศูนย์อพยพใกล้ที่สุด */}
          {nearestEvac && (
            <div className="p-3.5 rounded-xl bg-green-500/10 dark:bg-green-950/40 border border-green-500/30 flex flex-col justify-between gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-9 h-9 rounded-xl bg-green-600 text-white flex items-center justify-center shrink-0 shadow">
                    🏠
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] font-extrabold text-green-700 dark:text-green-400 block tracking-wider uppercase">จุดอพยพปลอดภัยใกล้ที่สุด</span>
                    <h4 className="text-xs md:text-sm font-black truncate text-slate-900 dark:text-white mt-0.5">{nearestEvac.name}</h4>
                  </div>
                </div>
                <span className="text-xs md:text-sm font-mono font-black text-green-700 dark:text-green-300 shrink-0 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg shadow-sm border border-green-200 dark:border-green-800">
                  {formatDist(minEvacDist)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-green-500/20 text-xs">
                <span className="text-slate-600 dark:text-slate-300 truncate font-medium">📞 เบอร์โทร: <strong className="text-slate-900 dark:text-white font-mono">{nearestEvac.phone}</strong></span>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${userPos.lat},${userPos.lng}&destination=${nearestEvac.latitude},${nearestEvac.longitude}&travelmode=driving`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 active:scale-95 text-white font-extrabold rounded-lg text-[11px] shrink-0 flex items-center gap-1 shadow transition-transform"
                >
                  🧭 นำทาง Google Maps
                </a>
              </div>
            </div>
          )}

          {/* Card 2: จุดน้ำท่วมใกล้ที่สุด */}
          {nearestFlood && (
            <div className="p-3.5 rounded-xl bg-red-500/10 dark:bg-red-950/40 border border-red-500/30 flex flex-col justify-between gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow animate-pulse">
                    🚨
                  </div>
                  <div className="truncate">
                    <span className="text-[10px] font-extrabold text-red-700 dark:text-red-400 block tracking-wider uppercase">จุดน้ำท่วมอันตรายใกล้ที่สุด</span>
                    <h4 className="text-xs md:text-sm font-black truncate text-slate-900 dark:text-white mt-0.5">ต.{nearestFlood.tambon} อ.{nearestFlood.amphoe} (ลึก {nearestFlood.waterLevelCm} ซม.)</h4>
                  </div>
                </div>
                <span className="text-xs md:text-sm font-mono font-black text-red-700 dark:text-red-300 shrink-0 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg shadow-sm border border-red-200 dark:border-red-800">
                  {formatDist(minFloodDist)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-red-500/20 text-xs">
                <span className="text-slate-600 dark:text-slate-300 truncate font-medium">💬 "{nearestFlood.description.substring(0, 26)}..."</span>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${userPos.lat},${userPos.lng}&destination=${nearestFlood.latitude},${nearestFlood.longitude}&travelmode=driving`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold rounded-lg text-[11px] shrink-0 flex items-center gap-1 shadow transition-transform"
                >
                  🗺️ ดูเส้นทางเลี่ยงภัย
                </a>
              </div>
            </div>
          )}

        </div>

        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1 pt-1 gap-1">
          <span className="flex items-center gap-1">👆 <strong>Tip:</strong> สามารถคลิกลากหมุด 🙋‍♂️ พิกัดคุณบนแผนที่เพื่อจำลองเปลี่ยนตำแหน่งได้ครับ</span>
          <span className="hidden md:inline font-mono text-[10px]">🔴 เส้นตรงแดง = ทิศทางน้ำท่วม | 🟢 เส้นตรงเขียว = ทิศทางศูนย์อพยพ</span>
        </div>
      </div>

      {/* Leaflet Map Container */}
      <div className="relative w-full h-[50vh] md:h-[580px] rounded-2xl overflow-hidden shadow-inner border border-slate-200/80 dark:border-slate-800/80 z-0">
        
        {/* Map Control Info bar overlay */}
        <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2 max-w-xs pointer-events-none">
          <div className={`p-2.5 md:p-3 rounded-2xl border text-[10px] md:text-xs shadow-xl flex items-center gap-2 pointer-events-auto leading-relaxed ${
            isHighContrast
              ? "bg-black border-white text-white"
              : "bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 backdrop-blur"
          }`}>
            <Compass className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
            <div>
              <p className="font-bold">ศูนย์พิกัดภูมิสารสนเทศภัยพิบัติ (GIS)</p>
              <p className="opacity-75 text-[10px]">OpenStreetMap Live Data</p>
            </div>
          </div>

          {interactiveMode && (
            <div className="p-2.5 md:p-3 rounded-2xl bg-blue-600 text-white text-[10px] md:text-xs shadow-xl flex items-center gap-2 pointer-events-auto font-semibold">
              <Crosshair className="w-4 h-4 animate-pulse text-yellow-300 shrink-0" />
              <span>โหมดระบุพิกัด: คลิกที่ใดก็ได้บนแผนที่</span>
            </div>
          )}
        </div>

        <MapContainer 
          center={[8.4325, 99.9631]} // Nakhon Si Thammarat Center
          zoom={9} 
          scrollWheelZoom={true} 
          style={{ width: "100%", height: "100%", zIndex: 0 }}
        >
          {/* Base Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={
              isDarkMode 
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            }
          />

          <MapClickObserver onMapClick={onMapClick} interactiveMode={interactiveMode} />

          {/* Draggable User Live Marker */}
          <Marker 
            position={[userPos.lat, userPos.lng]} 
            icon={userLiveIcon} 
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const pos = marker.getLatLng();
                setUserPos({ lat: pos.lat, lng: pos.lng });
              }
            }}
          >
            <Popup className="custom-popup">
              <div className="text-center font-sans p-1">
                <span className="text-lg">🙋‍♂️</span><br/>
                <strong className="text-xs text-blue-600">ตำแหน่งปัจจุบันของคุณ</strong><br/>
                <span className="text-[11px] font-mono block my-0.5">({userPos.lat.toFixed(5)}, {userPos.lng.toFixed(5)})</span>
                <span className="text-[10px] text-slate-400 block">ลากหมุดนี้เพื่อเปลี่ยนจุดคำนวณระยะทาง</span>
              </div>
            </Popup>
          </Marker>

          {/* Real-time Straight Line to Nearest Flood Spot */}
          {nearestFlood && (
            <Polyline
              positions={[
                [userPos.lat, userPos.lng],
                [nearestFlood.latitude, nearestFlood.longitude]
              ]}
              pathOptions={{ color: "#ef4444", weight: 3, dashArray: "6, 8" }}
            />
          )}

          {/* Real-time Straight Line to Nearest Evacuation Center */}
          {nearestEvac && (
            <Polyline
              positions={[
                [userPos.lat, userPos.lng],
                [nearestEvac.latitude, nearestEvac.longitude]
              ]}
              pathOptions={{ color: "#10b981", weight: 4, dashArray: "8, 8" }}
            />
          )}

          {/* Reports Markers & Ship Radar Warning Rings (วงเรดาร์เตือนภัยรอบจุดเกิดเหตุ) */}
          {activeReports.map((r) => {
            const isCrit = r.severity === FloodSeverity.CRITICAL;
            const isHigh = r.severity === FloodSeverity.HIGH;
            const isMed = r.severity === FloodSeverity.MEDIUM;
            
            const radarColor = isCrit ? "#dc2626" : isHigh ? "#ea580c" : isMed ? "#eab308" : "#10b981";
            const outerRadius = isCrit ? 5000 : isHigh ? 3500 : isMed ? 2000 : 1000;
            const midRadius = isCrit ? 3000 : isHigh ? 2000 : isMed ? 1200 : 600;
            const innerRadius = isCrit ? 1500 : isHigh ? 1000 : isMed ? 600 : 300;

            return (
              <React.Fragment key={r.id}>
                {/* 📡 1. Outer Radar Reach Ring (ตีกรอบรัศมีเฝ้าระวังรอบนอก) */}
                <Circle
                  center={[r.latitude, r.longitude]}
                  radius={outerRadius}
                  pathOptions={{ color: radarColor, fillColor: radarColor, fillOpacity: 0.08, weight: 1.5, dashArray: "8, 10" }}
                />
                {/* 📡 2. Middle Radar Warning Ring (วงเรดาร์เตือนภัยชั้นกลาง) */}
                <Circle
                  center={[r.latitude, r.longitude]}
                  radius={midRadius}
                  pathOptions={{ color: radarColor, fillColor: radarColor, fillOpacity: 0.15, weight: 2, dashArray: "4, 6" }}
                />
                {/* 📡 3. Inner Risk Core Ring (จุดศูนย์กลางน้ำท่วม) */}
                <Circle
                  center={[r.latitude, r.longitude]}
                  radius={innerRadius}
                  pathOptions={{ color: radarColor, fillColor: radarColor, fillOpacity: 0.25, weight: 2.5 }}
                />

                {/* 🌊 4. Water Wave Severity Marker */}
                <Marker position={[r.latitude, r.longitude]} icon={getSeverityIcon(r.severity)}>
                  <Popup className="custom-popup">
                    <div className="w-64 font-sans">
                      {r.images && r.images[0] && (
                        <button
                          type="button"
                          onClick={() => setPreviewImage(r.images[0])}
                          className="w-full block overflow-hidden rounded-xl mb-2 shadow hover:opacity-90 relative group cursor-pointer"
                        >
                          <img src={r.images[0]} alt="ภาพหน้างาน" className="w-full h-32 object-cover pointer-events-none" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                            🔍 คลิกขยายดูรูป
                          </div>
                        </button>
                      )}
                      
                      {/* 1. ระดับไหน (Severity / Wave Status) */}
                      <div className="mb-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span className="text-[10px] font-bold text-slate-500 block">🌊 ระดับคลื่นน้ำ / ความหนัก:</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">
                          {r.severity === FloodSeverity.CRITICAL && "🔴 คลื่นแดง: วิกฤตน้ำป่าหลากเชี่ยวแรง"}
                          {r.severity === FloodSeverity.HIGH && "🟠 คลื่นส้ม: เสี่ยงภัยสูงน้ำขึ้นรวดเร็ว"}
                          {r.severity === FloodSeverity.MEDIUM && "🟡 คลื่นเหลือง: เฝ้าระวังน้ำท่วมขัง"}
                          {r.severity === FloodSeverity.LOW && "🟢 คลื่นเขียว: สถานการณ์ปกติ/ปลอดภัย"}
                        </span>
                      </div>

                      {/* 2. เหตุที่ไหน (Location) */}
                      <div className="mb-2">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block">📍 เหตุเกิดที่ไหน:</span>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
                          ต.{r.tambon}, อ.{r.amphoe} (จ.นครศรีธรรมราช)
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                          "<strong>{r.description}</strong>"
                        </p>
                      </div>

                      {/* 3. เวลาเท่าไหร่ & รัศมีเรดาร์ & ระยะเวลาท่วมขัง */}
                      <div className="border-t border-b py-2.5 my-2.5 text-xs space-y-2 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/30">
                        <p className="text-[11px] font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1">
                          🕒 <span>เวลาแจ้งเหตุ: {new Date(r.timestamp).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น. ({new Date(r.timestamp).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })})</span>
                        </p>
                        
                        <div className="bg-white/95 dark:bg-black/70 p-2.5 rounded-xl border border-amber-500/30 shadow-sm space-y-1.5">
                          <p className="text-xs text-slate-900 dark:text-white font-black flex items-center justify-between">
                            <span className="flex items-center gap-1">📡 รัศมีท่วมล้อมรอบ:</span>
                            <span className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-800">
                              {r.severity === FloodSeverity.CRITICAL ? "ล้อมรอบ 5.0 กิโลเมตร" : r.severity === FloodSeverity.HIGH ? "ล้อมรอบ 3.5 กิโลเมตร" : r.severity === FloodSeverity.MEDIUM ? "ล้อมรอบ 2.0 กิโลเมตร" : "ล้อมรอบ 1.0 กิโลเมตร"}
                            </span>
                          </p>
                          <p className="text-xs text-slate-900 dark:text-white font-black flex items-center justify-between">
                            <span className="flex items-center gap-1">⏳ คาดการณ์ท่วมนาน:</span>
                            <span className="text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 px-2 py-0.5 rounded-md border border-orange-200 dark:border-orange-800">
                              {r.severity === FloodSeverity.CRITICAL ? "ประมาณ 24 - 48 ชม. (1-2 วัน)" : r.severity === FloodSeverity.HIGH ? "ประมาณ 12 - 24 ชม." : r.severity === FloodSeverity.MEDIUM ? "ประมาณ 4 - 8 ชม. (รอระบาย)" : "ประมาณ 1 - 2 ชม. (ปกติ)"}
                            </span>
                          </p>
                        </div>

                        <div className="flex justify-between items-center text-[11px] pt-1">
                          <span><strong>ระดับน้ำปัจจุบัน:</strong> ลึก {r.waterLevelCm} ซม.</span>
                          {r.strandedPeopleCount > 0 && <span className="text-red-600 font-black bg-red-100 dark:bg-red-900/50 px-2 py-0.5 rounded">🚨 ติดค้าง {r.strandedPeopleCount} คน</span>}
                        </div>
                      </div>
                      
                      <p className="text-xs font-bold text-blue-600 text-center my-1">{getThaiStatus(r.status)}</p>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${userPos.lat},${userPos.lng}&destination=${r.latitude},${r.longitude}&travelmode=driving`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 block text-center py-2 bg-blue-600 text-white rounded-xl text-xs font-black hover:bg-blue-700 shadow"
                      >
                        🧭 นำทางเลี่ยงจุดเสี่ยงนี้ (Google Maps)
                      </a>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}

          {/* Evacuation Centers Markers */}
          {evacCenters.map((e) => (
            <Marker key={e.id} position={[e.latitude, e.longitude]} icon={evacIcon}>
              <Popup>
                <div className="w-56 font-sans">
                  <h4 className="font-bold text-sm text-blue-600">{e.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{e.landmark}</p>
                  <div className="border-t py-2 my-2 text-xs">
                    <p>รับได้สูงสุด: <strong>{e.capacity} คน</strong></p>
                    <p>ปัจจุบัน: <strong className="text-blue-600">{e.currentPeople} คน</strong></p>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1">
                      <div style={{ width: `${(e.currentPeople / e.capacity) * 100}%` }} className="bg-blue-500 h-full rounded-full"></div>
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${userPos.lat},${userPos.lng}&destination=${e.latitude},${e.longitude}&travelmode=driving`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block text-center py-1.5 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700"
                  >
                    🧭 นำทางไปศูนย์อพยพนี้ (Google Maps)
                  </a>
                  <p className="font-bold text-blue-600 text-xs text-center border p-1 rounded-lg mt-1.5">📞 {e.phone}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Temporary Marker from map click */}
          {tempPin && (
            <Marker position={[tempPin.latitude, tempPin.longitude]} icon={tempIcon}>
              <Popup>พิกัดที่คุณเลือก <br/> ({tempPin.latitude}, {tempPin.longitude})</Popup>
            </Marker>
          )}

        </MapContainer>
      </div>

      <ImageLightboxModal
        isOpen={!!previewImage}
        imageUrl={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </div>
  );
}


