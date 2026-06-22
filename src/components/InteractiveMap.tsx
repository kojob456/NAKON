import React, { useEffect } from "react";
import { Compass, Navigation, Crosshair, MapPin } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { FloodReport, FloodSeverity, ReportStatus } from "../types";

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

  // Custom Div Icons for visual fidelity with previous design
  const getSeverityIcon = (sev: FloodSeverity) => {
    let colorClass = "bg-green-500 border-green-700";
    let textCol = "text-white";
    let extra = "";
    if (sev === FloodSeverity.CRITICAL) { colorClass = "bg-red-600 border-red-800"; textCol = "text-white"; extra = "ring-4 ring-red-400 animate-ping"; }
    else if (sev === FloodSeverity.HIGH) { colorClass = "bg-orange-500 border-orange-700"; textCol = "text-white"; extra = "ring-2 ring-orange-300"; }
    else if (sev === FloodSeverity.MEDIUM) { colorClass = "bg-[#facc15] border-yellow-700"; textCol = "text-black"; extra = "ring-2 ring-yellow-200"; }
    
    return L.divIcon({
      className: "custom-pin",
      html: `<div class="w-8 h-8 rounded-full flex items-center justify-center border shadow-xl ${colorClass} ${textCol} ${extra}" style="font-size: 14px; font-weight: bold;">!</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
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
    html: `<div class="w-8 h-8 rounded-full bg-yellow-400 text-black border-4 border-black animate-bounce shadow-2xl flex items-center justify-center font-bold">📍</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
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
    <div className={`relative w-full rounded-3xl overflow-hidden border p-1 md:p-2 flex flex-col ${
      isHighContrast
        ? "bg-black border-white text-white"
        : isDarkMode
        ? "bg-slate-900 border-slate-800 text-slate-100"
        : "bg-slate-50 border-slate-200 text-slate-900"
    }`}>
      {/* Map Control Info bar */}
      <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2 max-w-xs pointer-events-none">
        <div className={`p-2 md:p-3 rounded-2xl border text-[10px] md:text-xs shadow-xl flex items-center gap-2 pointer-events-auto leading-relaxed ${
          isHighContrast
            ? "bg-black border-white text-white"
            : "bg-white/95 dark:bg-slate-800/95 text-slate-800 dark:text-slate-200"
        }`}>
          <Compass className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
          <div>
            <p className="font-bold">ศูนย์พิกัดภูมิสารสนเทศภัยพิบัติ (GIS)</p>
            <p className="opacity-75">แผนที่ข้อมูลจริงจาก OpenStreetMap</p>
          </div>
        </div>

        {interactiveMode && (
          <div className="p-2 md:p-3 rounded-2xl bg-blue-600 border border-transparent text-white text-[10px] md:text-xs shadow-xl flex items-center gap-2 pointer-events-auto font-semibold">
            <Crosshair className="w-4 h-4 animate-pulse text-yellow-300 shrink-0" />
            <span>โหมดระบุพิกัด: คลิก/แตะที่ใดก็ได้บนแผนที่เพื่อเลือกตำแหน่งบ้านคุณ</span>
          </div>
        )}
      </div>

      {/* Leaflet Map Container */}
      <div className="w-full h-[50vh] md:h-[600px] rounded-2xl overflow-hidden shadow-inner border border-slate-200/50 dark:border-slate-800/50 z-0">
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

          {/* Reports Markers */}
          {reports.map((r) => (
            <Marker key={r.id} position={[r.latitude, r.longitude]} icon={getSeverityIcon(r.severity)}>
              <Popup className="custom-popup">
                <div className="w-64 font-sans">
                  {r.images && r.images[0] && (
                    <img src={r.images[0]} alt="ภาพหน้างาน" className="w-full h-32 object-cover rounded-xl mb-2 shadow" />
                  )}
                  <h4 className="font-bold text-sm">ต.{r.tambon}, อ.{r.amphoe}</h4>
                  <p className="text-xs text-slate-500 mt-1">เวลาแจ้ง: {new Date(r.timestamp).toLocaleString("th-TH")}</p>
                  
                  <div className="border-t border-b py-2 my-2 text-xs space-y-1">
                    <p><strong>ระดับน้ำ:</strong> {r.waterLevelCm} ซม. ({getThaiSeverity(r.severity)})</p>
                    {r.strandedPeopleCount > 0 && <p className="text-red-600 font-bold">ติดค้าง: {r.strandedPeopleCount} คน</p>}
                    <p className="italic text-slate-600">"{r.description}"</p>
                  </div>
                  
                  <p className="text-xs font-bold text-blue-600">{getThaiStatus(r.status)}</p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${r.latitude},${r.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block text-center py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700"
                  >
                    นำทางกู้ภัยผ่าน Google Maps
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}

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
                  <p className="font-bold text-blue-600 text-xs text-center border p-1 rounded-lg">📞 {e.phone}</p>
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
    </div>
  );
}
