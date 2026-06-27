import React, { useState } from "react";
import { ListFilter, Search, Clock, ShieldCheck, CheckCircle2, ChevronRight, HelpCircle } from "lucide-react";
import { User, FloodReport, ReportStatus, FloodSeverity, UserRole } from "../types";

interface TrackingPortalProps {
  currentUser: User | null;
  reports: FloodReport[];
  isDarkMode: boolean;
  isHighContrast: boolean;
}

export default function TrackingPortal({
  currentUser,
  reports,
  isDarkMode,
  isHighContrast
}: TrackingPortalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  if (!currentUser) return null;

  // Filters reports. Citizens can list only their custom reported cases (excluding completed ones so they disappear from user app).
  // Admins can see ALL cases (including historical completed ones) in the database tracking portal.
  const ownReports = reports.filter((r) => {
    if (currentUser.role === UserRole.ADMIN) return true; // admin inspect all
    return r.reporterId === currentUser.uid && r.status !== ReportStatus.COMPLETED;
  });

  const filteredReports = ownReports.filter((r) => {
    const matchesSearch =
      r.amphoe.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.tambon.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.landmark.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getSeverityBadgeClass = (sev: FloodSeverity) => {
    switch (sev) {
      case FloodSeverity.CRITICAL: return "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-300 border-red-200";
      case FloodSeverity.HIGH: return "bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-300 border-orange-200";
      case FloodSeverity.MEDIUM: return "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-300 border-yellow-200";
      case FloodSeverity.LOW: return "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-300 border-green-200";
    }
  };

  const getSeverityText = (sev: FloodSeverity) => {
    switch (sev) {
      case FloodSeverity.CRITICAL: return "วิกฤต (ตลิ่งล้นสูง)";
      case FloodSeverity.HIGH: return "สูงมาก (ระดับอก/เดือดร้อน)";
      case FloodSeverity.MEDIUM: return "ปานกลาง (ระดับเข่า)";
      case FloodSeverity.LOW: return "ต่ำ (น้ำนองระบายช้า)";
    }
  };

  // Stepper representation settings
  const steps = [
    { key: ReportStatus.PENDING, label: "รอดำเนินการ", desc: "รับแจ้งเหตุน้ำท่วมในระบบ", color: "bg-red-600" },
    { key: ReportStatus.DISPATCHED, label: "ประสานงานแล้ว", desc: "ส่งประสาน ปภ./กู้ภัยจังหวัด", color: "bg-orange-500" },
    { key: ReportStatus.UNDERWAY, label: "กำลังกู้ภัย", desc: "เจ้าหน้าที่กำลังเร่งเดินทางพื้นที่", color: "bg-blue-600" },
    { key: ReportStatus.COMPLETED, label: "ช่วยเหลือสำเร็จ", desc: "กู้วิกฤตเสร็จสิ้น ประชาชนปลอดภัย", color: "bg-green-600" }
  ];

  const getActiveStepIdx = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.PENDING: return 0;
      case ReportStatus.DISPATCHED: return 1;
      case ReportStatus.UNDERWAY: return 2;
      case ReportStatus.COMPLETED: return 3;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-base md:text-lg flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
          <Clock className="w-5 h-5 text-blue-600" /> ติดตามสถานะช่วยเหลือของประชาชน (My Report Tracking)
        </h3>
        <p className="text-xs opacity-75">
          {currentUser.role === UserRole.ADMIN 
            ? "โหมดแอดมิน: แสดงแฟ้มข้อมูลรายนาวิกแจ้งภัยภัยรวมทั้งหมดในจังหวัดนํานครสีธรรมชาติ" 
            : `แสดงประวัติเคสแจ้งเรื่องทั้งหมดสำหรับเจ้าของบัญชีสายตรง (${currentUser.displayName})`}
        </p>
      </div>

      {/* Filter and search bar */}
      <div className={`p-4 rounded-3xl border flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm ${
        isHighContrast ? "bg-black border-white" : "bg-white dark:bg-slate-800/60"
      }`}>
        <div className="relative w-full md:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-3 opacity-60" />
          <input
            type="text"
            placeholder="ค้นหาตาม อำเภอ, ตำบล, หรือแลนด์มาร์ก..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              isHighContrast ? "bg-black text-white border-white" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            }`}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto font-bold select-none">
          <ListFilter className="w-4 h-4 text-blue-500" />
          <span className="text-xs">กรองสถานะกู้ภัย:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`p-1.5 rounded-xl text-xs font-semibold border ${
              isHighContrast ? "bg-black text-white border-white" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            }`}
          >
            <option value="all">ทั้งหมด</option>
            <option value="pending">🔴 รอดำเนินการ</option>
            <option value="dispatched">🟡 ส่งต่อหน่วยงานแล้ว</option>
            <option value="underway">🔵 กำลังลงพื้นที่ช่วยเหลือ</option>
            <option value="completed">🟢 ช่วยเหลือสำเร็จ</option>
          </select>
        </div>
      </div>

      {/* Grid listing */}
      {filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredReports.map((r) => {
            const isExpanded = selectedReportId === r.id;
            const currentStepIdx = getActiveStepIdx(r.status);

            return (
              <div
                key={r.id}
                className={`rounded-3xl border overflow-hidden transition-all shadow-sm ${
                  isHighContrast ? "bg-black border-white text-white" : "bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-800/80"
                }`}
              >
                {/* Collapsed Header Bar */}
                <div
                  onClick={() => setSelectedReportId(isExpanded ? null : r.id)}
                  className={`p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 select-none ${
                    isExpanded ? "border-b border-dashed border-slate-200 dark:border-slate-800" : ""
                  }`}
                >
                  <div className="flex gap-4 items-start md:items-center">
                    {/* Compact Image */}
                    {r.images && r.images[0] && (
                      <img
                        src={r.images[0]}
                        alt="Case picture"
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-sm">อ.{r.amphoe} ต.{r.tambon}</strong>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${getSeverityBadgeClass(r.severity)}`}>
                          {getSeverityText(r.severity)}
                        </span>
                      </div>
                      <p className="text-xs opacity-75 mt-0.5 truncate max-w-sm md:max-w-lg">แลนด์มาร์ก: {r.landmark}</p>
                      <p className="text-[10px] opacity-60">รหัสเคส: #{r.id.toUpperCase().substring(0, 10)} | แจ้งเมื่อ: {new Date(r.timestamp).toLocaleString("th-TH")}</p>
                    </div>
                  </div>

                  {/* Stepper overview status badge */}
                  <div className="flex items-center gap-1 md:gap-3 shrink-0">
                    <span className={`text-xs px-3 py-1 rounded-full font-bold shadow-inner ${
                      r.status === ReportStatus.COMPLETED
                        ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                        : r.status === ReportStatus.UNDERWAY
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"
                        : r.status === ReportStatus.DISPATCHED
                        ? "bg-orange-100 text-orange-600"
                        : "bg-red-100 text-red-600"
                    }`}>
                      {steps[currentStepIdx].label}
                    </span>
                    <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </div>
                </div>

                {/* Expanded Details and Stepper Graph */}
                {isExpanded && (
                  <div className="p-5 md:p-6 space-y-6">
                    {/* Stepper graphic */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">ขั้นตอนช่วยเหลือทางความก้าวหน้ารายเครื่อง (Live Stepper)</h4>
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative">
                        {/* Connecting line */}
                        <div className="hidden md:block absolute left-6 right-6 top-5 h-0.5 bg-slate-200 dark:bg-slate-700 -z-10 bg-opacity-70">
                          <div
                            style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
                            className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                          />
                        </div>

                        {steps.map((st, idx) => {
                          const achieved = idx <= currentStepIdx;
                          const isCurrent = idx === currentStepIdx;

                          return (
                            <div key={st.key} className="flex md:flex-col items-center gap-3 md:gap-2 md:text-center flex-1 relative z-10 w-full md:w-auto">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all border shrink-0 ${
                                achieved
                                  ? isHighContrast
                                    ? "bg-white text-black border-white font-extrabold"
                                    : st.color + " text-white border-transparent scale-105"
                                  : "bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800"
                              }`}>
                                {idx < currentStepIdx ? "✓" : idx + 1}
                              </div>
                              <div>
                                <p className={`text-xs font-bold leading-none ${achieved ? "text-slate-900 dark:text-slate-100" : "text-slate-400"}`}>
                                  {st.label}
                                </p>
                                <p className="text-[10px] opacity-60 mt-0.5 leading-relaxed hidden md:block">{st.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Meta specifics lists */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-5 border-slate-100 dark:border-slate-800/80 text-xs">
                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 border-b pb-1 dark:border-slate-800">📋 รายละเอียดรายงานแจ้งเหตุของท่าน</h4>
                        <p><strong className="opacity-75">ระดับน้ำ:</strong> {r.waterLevelCm} เซนติเมตร</p>
                        {r.strandedPeopleCount > 0 && (
                          <p className="text-red-600 font-bold"><strong className="opacity-75">จำนวนผู้เดือดร้อนติดค้าง:</strong> {r.strandedPeopleCount} คน</p>
                        )}
                        {r.neededHelp?.length > 0 && (
                          <div>
                            <strong className="opacity-75">ร้องขอช่วยเหลือด่วน:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {r.neededHelp.map((h, idx) => (
                                <span key={idx} className="bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 px-2 py-0.5 rounded text-[10px] font-bold">
                                  {h === "boat" ? "เรืออพยพด่วน" : h === "medicine" ? "ยารักษาโรค" : h === "food" ? "ถุงยังชีพ" : "กองช่วยเหลือ"}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <p className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl italic leading-relaxed text-slate-700 dark:text-slate-300 mt-2">
                          "{r.description || "ไม่มีรายละเอียดภาพรวมระบุเฉพาะเจาะจง"}"
                        </p>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 border-b pb-1 dark:border-slate-800">📡 บันทึกการตรวจสอบของเจ้าหน้าที่กู้ภัย</h4>

                        {r.assignedAgency ? (
                          <div className="space-y-2.5 bg-blue-50/40 dark:bg-blue-950/20 p-4 border border-blue-100 dark:border-blue-900/40 rounded-2xl">
                            <p><strong>หน่วยรับตอบประสานหลัก:</strong><br />
                              <span className="text-blue-600 dark:text-blue-400 font-bold">{r.assignedAgency}</span>
                            </p>
                            <p><strong>บันทึกอัปเดตหน้างานล่าสุด:</strong><br />
                              <span className="italic">"{r.responderNote || "กำลังเข้าตรวจเช็คสภาพสภาวะระดับและช่วยระบายคลองคันพัง..."}"</span>
                            </p>
                            {r.updatedAt && (
                              <p className="text-[10px] opacity-70">อัปเดตตอบกลับเมื่อ: {new Date(r.updatedAt).toLocaleString("th-TH")}</p>
                            )}
                          </div>
                        ) : (
                          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border rounded-2xl flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-slate-400 animate-pulse shrink-0" />
                            <p className="leading-snug opacity-75 text-[11px] font-semibold">
                              เจ้าหน้าที่กู้ภัยส่วนกำลังพล ปภ. จังหวัดกำลังพิจารณาคัดกรองจัดลำดับเรือส่งเข้าช่วยเหลือท่านอย่างเร่งรัด
                            </p>
                          </div>
                        )}

                        {/* Navigation link */}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${r.latitude},${r.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full text-center py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/60 rounded-xl font-bold block"
                        >
                          🌐 เปิดดูระบุพิกัดใน Google Maps ของตัวเคส ({r.latitude.toFixed(2)}, {r.longitude.toFixed(2)})
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-slate-400 mx-auto opacity-70 mb-3" />
          <h4 className="font-bold">ไม่พบเคสรายงานสถิติของท่าน</h4>
          <p className="text-xs opacity-70 mt-1 leading-relaxed">
            ท่านยังไม่ได้ส่งคำรายงานแจ้งเหตุน้ำท่วมในระบบข่าวมือถือ เข้าไปที่เมนู "แจ้งเหตุน้ำท่วม" เพื่อสร้างรายงานด่วนฉบับแรก
          </p>
        </div>
      )}
    </div>
  );
}
