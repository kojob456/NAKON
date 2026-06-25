import React, { useEffect, useState } from "react";
import { X, Users, Phone, MapPin, CheckCircle2, AlertCircle, UserPlus, Navigation, ShieldCheck } from "lucide-react";
import { EvacCenter, fetchEvacCentersFromFirebase, registerEvacCenterBooking } from "../utils/firebase";

interface EvacuationPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  userPos: { lat: number; lng: number };
}

export default function EvacuationPortalModal({ isOpen, onClose, userPos }: EvacuationPortalModalProps) {
  const [centers, setCenters] = useState<EvacCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState<EvacCenter | null>(null);

  // Booking Form State
  const [citizenName, setCitizenName] = useState("");
  const [phone, setPhone] = useState("");
  const [headcount, setHeadcount] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetchEvacCentersFromFirebase()
      .then((res) => {
        setCenters(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const totalCapacity = centers.reduce((acc, c) => acc + c.capacity, 0);
  const totalOccupied = centers.reduce((acc, c) => acc + c.currentPeople, 0);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCenter) return;
    if (!citizenName.trim() || !phone.trim()) {
      setErrorMsg("กรุณากรอกชื่อและเบอร์โทรศัพท์ติดต่อให้ครบถ้วน");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const updated = await registerEvacCenterBooking(selectedCenter.id, citizenName, phone, headcount);
      if (updated) {
        setSelectedCenter(updated);
        setCenters((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        setSuccessMsg(`บันทึกสิทธิ์เข้าพักพิงสำเร็จ! เพิ่มยอดคน +${headcount} ลงระบบ Firebase แล้ว`);
        setCitizenName("");
        setPhone("");
        setHeadcount(1);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการบันทึกสิทธิ์");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto backdrop-blur-md bg-slate-900/80 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] font-sans">
        
        {/* Top Header */}
        <div className="px-5 py-4 md:px-6 md:py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur">
              <ShieldCheck className="w-6 h-6 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200 bg-white/10 px-2.5 py-0.5 rounded-full">
                Firebase Realtime Registry
              </span>
              <h2 className="text-base md:text-xl font-black tracking-tight mt-0.5">
                {selectedCenter ? `เจาะลึกสิทธิ์พักพิง: ${selectedCenter.name}` : "ระบบตรวจสอบสิทธิ์ & จองศูนย์อพยพจังหวัดนครศรีธรรมราช"}
              </h2>
            </div>
          </div>
          <button 
            onClick={() => {
              if (selectedCenter) {
                setSelectedCenter(null);
                setErrorMsg(null);
                setSuccessMsg(null);
              } else {
                onClose();
              }
            }}
            className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-6 flex-1">
          
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm font-bold text-slate-500">⏳ กำลังเชื่อมต่อฐานข้อมูล Firebase Firestore...</p>
            </div>
          ) : selectedCenter ? (
            /* =========================================================
               PART 2: CENTER DETAIL VIEW & BOOKING FORM
               ========================================================= */
            <div className="space-y-6 animate-in slide-in-from-right duration-200">
              
              {/* Center Info Banner */}
              <div className="p-4 md:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {selectedCenter.landmark}
                  </span>
                  <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white">{selectedCenter.name}</h3>
                  <p className="text-xs text-slate-500">📞 ติดต่อเจ้าหน้าที่ศูนย์: <strong className="font-mono text-slate-800 dark:text-slate-200">{selectedCenter.phone}</strong></p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${userPos.lat},${userPos.lng}&destination=${selectedCenter.latitude},${selectedCenter.longitude}&travelmode=walking`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow flex items-center gap-1.5 transition-transform active:scale-95"
                  >
                    🚶 นำทางเดินเท้าไปศูนย์นี้
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${userPos.lat},${userPos.lng}&destination=${selectedCenter.latitude},${selectedCenter.longitude}&travelmode=driving`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs shadow flex items-center gap-1.5 transition-transform active:scale-95"
                  >
                    🚗 นำทางรถยนต์
                  </a>
                </div>
              </div>

              {/* Capacity Progress Stats */}
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-slate-800/50 border border-blue-200 dark:border-slate-700">
                <div className="flex justify-between items-center text-xs md:text-sm mb-1.5">
                  <span className="font-bold text-slate-700 dark:text-slate-200">📊 ยอดผู้เข้าพักพิงจริงในปัจจุบัน:</span>
                  <span className="font-mono font-black text-blue-600 dark:text-blue-400">
                    {selectedCenter.currentPeople} / {selectedCenter.capacity} คน ({selectedCenter.currentPeople >= selectedCenter.capacity ? "เต็มแล้ว" : `เหลือที่ว่าง ${selectedCenter.capacity - selectedCenter.currentPeople}`})
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden p-0.5">
                  <div 
                    style={{ width: `${Math.min(100, (selectedCenter.currentPeople / selectedCenter.capacity) * 100)}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      selectedCenter.currentPeople >= selectedCenter.capacity ? "bg-red-500 animate-pulse" : selectedCenter.currentPeople > selectedCenter.capacity * 0.8 ? "bg-amber-500" : "bg-blue-600"
                    }`}
                  ></div>
                </div>
              </div>

              {/* Grid: Left = Booking Form | Right = Citizen Registry List */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                
                {/* Booking Form (2 cols) */}
                <div className="md:col-span-2 p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                  <div className="flex items-center gap-2 border-b dark:border-slate-700 pb-2.5">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">แจ้งขอใช้สิทธิ์พักพิงด่วน</h4>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" /> {successMsg}
                    </div>
                  )}

                  <form onSubmit={handleBookingSubmit} className="space-y-3.5 text-xs">
                    <div>
                      <label className="font-bold block text-slate-700 dark:text-slate-300 mb-1">ชื่อ - นามสกุล ประชาชน:</label>
                      <input 
                        type="text"
                        required
                        placeholder="เช่น นาย สมชาย รักบ้านเกิด"
                        value={citizenName}
                        onChange={(e) => setCitizenName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="font-bold block text-slate-700 dark:text-slate-300 mb-1">เบอร์โทรศัพท์มือถือ:</label>
                      <input 
                        type="tel"
                        required
                        placeholder="081-xxx-xxxx"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-bold block text-slate-700 dark:text-slate-300 mb-1">จำนวนคนในครอบครัว (รวมผู้อพยพ):</label>
                      <select
                        value={headcount}
                        onChange={(e) => setHeadcount(+e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                          <option key={n} value={n}>{n} คน</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || selectedCenter.currentPeople >= selectedCenter.capacity}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-black rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 mt-2"
                    >
                      {submitting ? "⏳ กำลังบันทึกลง Firebase..." : selectedCenter.currentPeople >= selectedCenter.capacity ? "🔴 สถานที่เต็มแล้ว" : "✅ บันทึกยืนยันสิทธิ์อพยพด่วน"}
                    </button>
                  </form>
                </div>

                {/* Registered List (3 cols) */}
                <div className="md:col-span-3 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col max-h-[420px]">
                  <div className="flex items-center justify-between border-b dark:border-slate-800 pb-2.5">
                    <span className="font-black text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-500" /> รายชื่อประชาชนที่ลงทะเบียนพักพิงอยู่จริง
                    </span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-bold text-slate-500">
                      รวม {selectedCenter.registrations?.length || 0} ครอบครัว
                    </span>
                  </div>

                  <div className="overflow-y-auto flex-1 divide-y dark:divide-slate-800 pr-1 text-xs">
                    {(!selectedCenter.registrations || selectedCenter.registrations.length === 0) ? (
                      <p className="py-10 text-center text-slate-400 italic">ยังไม่มีรายชื่อลงทะเบียนในระบบ Firebase</p>
                    ) : (
                      selectedCenter.registrations.map((reg) => (
                        <div key={reg.id} className="py-2.5 flex items-center justify-between gap-2">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{reg.citizenName}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">📞 {reg.phone} | บันทึกเมื่อ {new Date(reg.timestamp).toLocaleTimeString("th-TH")}</p>
                          </div>
                          <span className="px-2 py-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 font-black rounded-lg text-[11px] shrink-0">
                            +{reg.headcount} คน
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              <div className="text-center pt-2">
                <button 
                  onClick={() => setSelectedCenter(null)}
                  className="px-6 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 font-bold text-xs text-slate-700 dark:text-slate-300 transition-colors"
                >
                  ⬅️ ย้อนกลับไปหน้ารายการศูนย์อพยพทั้งหมด
                </button>
              </div>
            </div>
          ) : (
            /* =========================================================
               PART 1: CENTERS LIST VIEW
               ========================================================= */
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Summary Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-extrabold text-blue-600 dark:text-blue-400">ศูนย์อพยพทั้งหมด</span>
                  <h4 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1">{centers.length} แห่ง</h4>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
                  <span className="text-[10px] uppercase font-extrabold text-emerald-600 dark:text-emerald-400">ความจุรองรับรวม</span>
                  <h4 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1">{totalCapacity.toLocaleString()} คน</h4>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                  <span className="text-[10px] uppercase font-extrabold text-amber-600 dark:text-amber-400">เข้าพักพิงอยู่แล้ว</span>
                  <h4 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-1">{totalOccupied.toLocaleString()} คน</h4>
                </div>
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50">
                  <span className="text-[10px] uppercase font-extrabold text-purple-600 dark:text-purple-400">ที่ว่างรับเพิ่มได้</span>
                  <h4 className="text-xl md:text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{(totalCapacity - totalOccupied).toLocaleString()} คน</h4>
                </div>
              </div>

              <div className="border-b dark:border-slate-800 pb-2">
                <h3 className="font-black text-base md:text-lg text-slate-900 dark:text-white">
                  เลือกสถานที่อพยพเพื่อเช็คสิทธิ์ ดูรายชื่อ หรือนำทางเดินเท้า:
                </h3>
              </div>

              {/* Grid Cards of Centers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {centers.map((c) => {
                  const isFull = c.currentPeople >= c.capacity;
                  const isNearFull = c.currentPeople > c.capacity * 0.85;
                  const pct = Math.min(100, Math.round((c.currentPeople / c.capacity) * 100));

                  return (
                    <div 
                      key={c.id}
                      onClick={() => setSelectedCenter(c)}
                      className={`p-5 rounded-3xl border transition-all cursor-pointer hover:shadow-xl active:scale-[0.99] flex flex-col justify-between gap-4 ${
                        isFull 
                          ? "bg-red-50/60 dark:bg-red-950/20 border-red-300 dark:border-red-800/60"
                          : isNearFull
                          ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60"
                          : "bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-blue-500"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-black text-sm md:text-base text-slate-900 dark:text-white leading-snug group-hover:text-blue-600">
                            {c.name}
                          </h4>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase shrink-0 ${
                            isFull ? "bg-red-500 text-white" : isNearFull ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
                          }`}>
                            {isFull ? "🔴 เต็มแล้ว" : isNearFull ? "🟡 ใกล้เต็ม" : "🟢 ว่างรับเพิ่ม"}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-blue-500" /> {c.landmark}
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">ความจุคน:</span>
                          <span className="font-mono font-black text-slate-800 dark:text-slate-200">
                            {c.currentPeople} / {c.capacity} คน ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${pct}%` }}
                            className={`h-full rounded-full ${
                              isFull ? "bg-red-500" : isNearFull ? "bg-amber-500" : "bg-blue-600"
                            }`}
                          ></div>
                        </div>
                      </div>

                      <div className="pt-2 border-t dark:border-slate-700/80 flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-mono">📞 {c.phone}</span>
                        <span className="text-blue-600 dark:text-blue-400 font-black flex items-center gap-1">
                          กดเช็คสิทธิ์ & ดูแมพ ➔
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
