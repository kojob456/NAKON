import React, { useState } from "react";
import { AlertCircle, Phone, Navigation, Landmark, Plus, Save, Clock, ArrowRight, CheckCircle } from "lucide-react";
import { User, FloodReport, ReportStatus, FloodSeverity } from "../types";

interface ResponderDashboardProps {
  currentUser: User | null;
  reports: FloodReport[];
  onUpdateReportStatus: (reportId: string, status: ReportStatus, assignedAgency: string, note: string) => void;
  isDarkMode: boolean;
  isHighContrast: boolean;
}

export default function ResponderDashboard({
  currentUser,
  reports,
  onUpdateReportStatus,
  isDarkMode,
  isHighContrast
}: ResponderDashboardProps) {
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(reports[0]?.id || null);
  const [agencyInput, setAgencyInput] = useState("");
  const [noteInput, setNoteInput] = useState("");

  const selectedCase = reports.find((r) => r.id === selectedCaseId);

  // Sorting: Critical severity first, then high, then medium, then low.
  // Secondary sorting: newer alerts first
  const getSeverityWeight = (sev: FloodSeverity) => {
    switch (sev) {
      case FloodSeverity.CRITICAL: return 4;
      case FloodSeverity.HIGH: return 3;
      case FloodSeverity.MEDIUM: return 2;
      case FloodSeverity.LOW: return 1;
    }
  };

  const sortedReports = [...reports].sort((a, b) => {
    // Put pending reports first, then sort by severity weight, then by newest
    if (a.status !== ReportStatus.COMPLETED && b.status === ReportStatus.COMPLETED) return -1;
    if (a.status === ReportStatus.COMPLETED && b.status !== ReportStatus.COMPLETED) return 1;

    const diff = getSeverityWeight(b.severity) - getSeverityWeight(a.severity);
    if (diff !== 0) return diff;

    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const getSeverityCircleClass = (sev: FloodSeverity) => {
    switch (sev) {
      case FloodSeverity.CRITICAL: return "bg-red-500 animate-ping";
      case FloodSeverity.HIGH: return "bg-orange-500";
      case FloodSeverity.MEDIUM: return "bg-yellow-500";
      case FloodSeverity.LOW: return "bg-green-500";
    }
  };

  const getThaiSeverity = (sev: FloodSeverity) => {
    switch (sev) {
      case FloodSeverity.CRITICAL: return "วิกฤตสูงสุด (ชั้นล่างท่วมหมด)";
      case FloodSeverity.HIGH: return "สูงมาก (ระดับพ้นอก)";
      case FloodSeverity.MEDIUM: return "ปานกลาง (ท่วมตาตุ่ม-เอว)";
      case FloodSeverity.LOW: return "ระดับระบายช้า";
    }
  };

  const handleApplyForward = (agencyName: string) => {
    setAgencyInput(agencyName);
  };

  const handleUpdate = (status: ReportStatus, targetObj?: FloodReport) => {
    const activeObj = targetObj || selectedCase;
    if (!activeObj) return;
    onUpdateReportStatus(
      activeObj.id,
      status,
      agencyInput || activeObj.assignedAgency || "ปภ. ส่วนกลาง",
      noteInput || `รับปฏิบัติกู้ภัยแล้วโดย ${currentUser?.displayName}`
    );
    alert(`อัปเดตแฟ้มงานคดี #${activeObj.id.substring(0, 8)} สู่สถานะใหม่เรียบร้อย`);
  };

  // Set inputs appropriately when selecting a new case
  const selectCaseAndLoad = (caseId: string) => {
    setSelectedCaseId(caseId);
    const r = reports.find(x => x.id === caseId);
    if (r) {
      setAgencyInput(r.assignedAgency || "");
      setNoteInput(r.responderNote || "");
    }
  };

  const rescueAgencies = [
    "มูลนิธิไต้เต็กตึ๊ง นครศรีธรรมราช",
    "มูลนิธิประชาร่วมใจ นครศรีธรรมราช",
    "ศูนย์เฉพาะกิจภัยพิบัติ ปภ. นครศรีธรรมราช",
    "สถานีตำรวจภูธรนครศรีธรรมราช (หน่วยสายตรวจกู้น้ำ)",
    "หน่วยเฉพาะกิจทหารราบที่ 5 มณฑลทหารบกที่ 41"
  ];

  const renderInspectionConsole = (caseObj: FloodReport | null) => {
    if (!caseObj) {
      return (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 border rounded-3xl opacity-80">
          <CheckCircle className="w-12 h-12 text-slate-400 mx-auto opacity-70 mb-3" />
          <h4 className="font-bold">ไม่มีเคสค้างคิวในแดชบอร์ดกู้ภัย</h4>
          <p className="text-xs opacity-70 mt-1">คดีทั้งหมดถูกดูแลจัดส่งเรียบร้อย ตลิ่งจังหวัดระบายพ้นวิกฤต</p>
        </div>
      );
    }

    return (
      <div className={`p-5 md:p-6 rounded-3xl border shadow-lg space-y-5 ${
        isHighContrast ? "bg-black border-white text-white" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-800"
      }`}>
        {/* Header */}
        <div className="border-b pb-4 border-slate-100 dark:border-slate-800 flex justify-between items-start gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              🔍 6.2 รายละเอียดตรวจสอบหลักฐานภาพถ่าย และพิกัดเคส
            </span>
            <h3 className="font-extrabold text-base md:text-lg mt-1 text-slate-800 dark:text-slate-100">
              ต.{caseObj.tambon}, อ.{caseObj.amphoe}
            </h3>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-bold ${
            caseObj.status === ReportStatus.COMPLETED
              ? "bg-green-100 text-green-700"
              : "bg-red-50 text-red-600"
          }`}>
            ระดับเสี่ยง: {getThaiSeverity(caseObj.severity).split(" (")[0]}
          </span>
        </div>

        {/* 6.2.1 Photo evidence */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <h4 className="text-xs font-bold text-slate-500 block">ภาพถ่ายหลักฐานผู้ประสบภัยส่งเข้ามาจริง :</h4>
            <div className="aspect-video rounded-2xl overflow-hidden bg-black border border-slate-200 dark:border-slate-800 relative shadow-inner">
              <img
                src={caseObj.images[0]}
                alt="ภัยพิบัติหน้างานสัมผัส"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-2 left-2 bg-black/60 text-[9px] text-white px-2 py-0.5 rounded">
                ระดับนํ้าในภาพประมาณ {caseObj.waterLevelCm} ซม.
              </div>
            </div>
          </div>

          {/* Reporter profile details */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border text-xs">
            <h4 className="font-bold text-blue-600 dark:text-blue-400">👤 ข้อมูลผู้ประสบภัยแจ้งเร่งด่วน</h4>
            <p><strong>ชื่อผู้รับแจ้ง:</strong><br /> {caseObj.reporterName}</p>
            <p><strong>จุดสังเกตเด่น:</strong><br /> {caseObj.landmark}</p>
            <p className="border-t border-dashed border-slate-200 py-1.5 opacity-80">
              *เบอร์ติดต่อสายกู้ภัยส่งกลับทันควัน
            </p>

            <a
              href={`tel:${caseObj.reporterPhone}`}
              className="w-full text-center py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow"
            >
              <Phone className="w-3.5 h-3.5" /> โทรหาศูนย์ผู้แจ้งด่วน
            </a>
          </div>
        </div>

        {/* Coordinates and routing gps */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/30 border rounded-2xl text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-semibold">
          <div className="space-y-1">
            <p className="flex items-center gap-1 opacity-80"><Navigation className="w-4 h-4 text-blue-500 animate-pulse" /> พิกัดดาวเทียมคดีแจ้งภัย (GPS Coordinates)</p>
            <p className="font-mono text-slate-700 dark:text-slate-300">
              ละติจูด: {caseObj.latitude.toFixed(5)} , ลองจิจูด: {caseObj.longitude.toFixed(5)}
            </p>
          </div>

          {/* 6.2.2 Google maps navigator logic */}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${caseObj.latitude},${caseObj.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl font-extrabold flex items-center gap-1.5 shadow"
          >
            🗺️ ส่งออกนำทางผ่าน Google Maps
          </a>
        </div>

        {/* 6.3 🔄 Dispatch and State updates Controller */}
        <div className="border-t pt-5 border-slate-100 dark:border-slate-800 space-y-4 text-xs font-semibold">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest block">
            🔄 6.3 ระบบส่งต่อพิกัดงาน & อัปเดตข้อมูลกู้หน้าตลิ่ง (Dispatch Status)
          </h4>

          {/* Fast forwarding preset clicks */}
          <div className="space-y-2">
            <label className="text-xs font-bold opacity-80 block">ประสานกระจายงานต่อหน่วยกู้ภัยข้ามจังหวัด :</label>
            <div className="flex flex-wrap gap-1.5">
              {rescueAgencies.map((agency, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyForward(agency)}
                  className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold tracking-wide transition-all ${
                    agencyInput === agency
                      ? "bg-blue-600 text-white border-transparent"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border-slate-200 dark:border-slate-800"
                  }`}
                >
                  {agency.replace("นครศรีธรรมราช", "")}
                </button>
              ))}
            </div>
          </div>

          {/* Custom input forms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="text-xs font-bold opacity-80 block mb-1">หรือกรอกชื่อหน่วยรับงานเฉพาะกิจ :</label>
              <input
                type="text"
                placeholder="เช่น กู้ภัยใต้เต็กคึ๊งทุ่งสง..."
                value={agencyInput}
                onChange={(e) => setAgencyInput(e.target.value)}
                className={`w-full p-2 rounded-xl text-xs border ${
                  isHighContrast ? "bg-black text-white border-white" : "bg-slate-50 dark:bg-slate-800 border-slate-200"
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-bold opacity-80 block mb-1">เขียนบันทึกกำกับงานให้ประชาชนติดตาม :</label>
              <input
                type="text"
                placeholder="เช่น จัดส่งอาหารแห้งชุดแรกด้วยกู้เรือด่วนแล้ว..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className={`w-full p-2 rounded-xl text-xs border ${
                  isHighContrast ? "bg-black text-white border-white" : "bg-slate-50 dark:bg-slate-800 border-slate-200"
                }`}
              />
            </div>
          </div>

          {/* Active dispatcher status dropdown selector */}
          <div className="pt-3 border-t dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
              🔄 เลือกเปลี่ยนสถานะการช่วยเหลือ (เปลี่ยนและบันทึกทันทีเมื่อกดเลือก):
            </label>
            <select
              value={caseObj.status}
              onChange={(e) => handleUpdate(e.target.value as ReportStatus, caseObj)}
              className="w-full py-3 px-4 rounded-2xl text-sm font-extrabold border-2 border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 shadow-md transition-all cursor-pointer select-none"
            >
              <option value={ReportStatus.PENDING}>🔴 รอดำเนินการ (Pending)</option>
              <option value={ReportStatus.DISPATCHED}>🟡 ประสานงานแล้ว / ส่งต่อหน่วยงาน (Dispatched)</option>
              <option value={ReportStatus.UNDERWAY}>🔵 กำลังลงพื้นที่ช่วยเหลือเร่งด่วน (Underway)</option>
              <option value={ReportStatus.COMPLETED}>🟢 ช่วยเหลือสำเร็จปลอดภัย (Completed)</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-base md:text-lg flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
          <AlertCircle className="w-5 h-5 text-red-600" /> 6.0 แดชบอร์ดหน่วยงานกู้ภัยจังหวัด (Responder Command Center)
        </h3>
        <p className="text-xs opacity-75">
          ศูนย์บัญชาการสถานการณ์กองอำนวยการร่วม ปภ. ตำรวจภูธรภาค 8 และกู้ภัยการกุศลร่วมใจ
        </p>
      </div>

      <div className="w-full max-w-4xl mx-auto space-y-4">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
          🚨 6.1 รายการแจ้งเหตุฉุกเฉินล่าสุด ({sortedReports.length} รายการจริง) — กดที่รายการเพื่อดูรายละเอียดและเปลี่ยนสถานะงาน
        </h4>

        <div className="space-y-4 pr-1">
          {sortedReports.map((r) => {
            const isSelected = selectedCaseId === r.id;
            const pending = r.status === ReportStatus.PENDING;

            return (
              <div
                key={r.id}
                className={`rounded-2xl border transition-all relative overflow-hidden ${
                  isSelected
                    ? isHighContrast
                      ? "bg-zinc-900 border-yellow-400 border-2 text-white shadow-xl"
                      : "bg-blue-50/40 dark:bg-blue-950/30 border-blue-500 dark:border-blue-600 shadow-md ring-1 ring-blue-500/20"
                    : isHighContrast
                    ? "bg-black border-white text-white hover:border-slate-400 cursor-pointer"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-800/80 hover:border-slate-400 hover:shadow cursor-pointer"
                }`}
              >
                {/* Header Button Card */}
                <div
                  onClick={() => selectCaseAndLoad(r.id)}
                  className={`p-4 ${isSelected ? "cursor-pointer border-b border-blue-200 dark:border-blue-800/60 bg-blue-100/40 dark:bg-blue-900/30" : ""}`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] opacity-75 font-bold">แจ้งเมื่อ: {new Date(r.timestamp).toLocaleTimeString("th-TH")} น.</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold leading-none ${
                      r.status === ReportStatus.COMPLETED
                        ? "bg-green-100 text-green-700"
                        : r.status === ReportStatus.UNDERWAY
                        ? "bg-blue-100 text-blue-600"
                        : "bg-red-100 text-red-600"
                    }`}>
                      {r.status === ReportStatus.COMPLETED ? "กู้ภัยสำเร็จ" : r.status === ReportStatus.UNDERWAY ? "กำลังลุยฟื้น" : "รอดำเนินการ"}
                    </span>
                  </div>

                  <div className="flex gap-3 items-center mt-2.5">
                    {/* Blink indicator circle */}
                    <span className="relative flex h-3 w-3 shrink-0">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${getSeverityCircleClass(r.severity)}`}></span>
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${getSeverityCircleClass(r.severity).split(" ")[0]}`}></span>
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs md:text-sm truncate leading-none">
                        ต.{r.tambon}, อ.{r.amphoe}
                      </p>
                      <p className="text-[11px] opacity-75 mt-1 truncate">{r.landmark}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/50 text-[10px] flex justify-between opacity-75 font-semibold">
                    <span>ระดับน้ำ: {r.waterLevelCm} ซม.</span>
                    {r.strandedPeopleCount > 0 && <span className="text-red-500">ติดค้าง {r.strandedPeopleCount} คน!</span>}
                  </div>
                </div>

                {/* 🔽 แผงรายละเอียดและเปลี่ยนสถานะงานกู้ภัย (เปิดขึ้นติดกันไปเลยกับปุ่ม) */}
                {isSelected && (
                  <div className="p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {renderInspectionConsole(r)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
