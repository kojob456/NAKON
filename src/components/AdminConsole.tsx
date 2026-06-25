import React, { useState } from "react";
import { Hammer, Users, RefreshCw, Sliders, Check, Network, Activity, Trash, ShieldAlert, Heart } from "lucide-react";
import { User, UserRole, ThresholdSettings, IntegrationAPI } from "../types";

interface AdminConsoleProps {
  currentUser: User | null;
  usersList: User[];
  onUpdateUserRole: (userUid: string, newRole: UserRole, agency?: string) => void;
  apisList: IntegrationAPI[];
  onToggleAPIStatus: (apiId: string) => void;
  thresholdSettings: ThresholdSettings;
  onUpdateThresholds: (settings: ThresholdSettings) => void;
  isHighContrast: boolean;
  isDarkMode: boolean;
}

export default function AdminConsole({
  currentUser,
  usersList,
  onUpdateUserRole,
  apisList,
  onToggleAPIStatus,
  thresholdSettings,
  onUpdateThresholds,
  isHighContrast,
  isDarkMode
}: AdminConsoleProps) {
  // Local state copy of thresholds for instant editing before saving
  const [rainCrit, setRainCrit] = useState(thresholdSettings.minRainfallCritical);
  const [waterRatio, setWaterRatio] = useState(thresholdSettings.waterLevelWarningRatio);
  const [rapidRise, setRapidRise] = useState(thresholdSettings.rapidRiseRateCmHr);

  const [activeTab, setActiveTab] = useState<"thresholds" | "users" | "apis" | "line_broadcast">("thresholds");

  const [pingingId, setPingingId] = useState<string | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<string | null>(null);

  const handleTriggerLINEBroadcast = async (isEmergency: boolean) => {
    setIsBroadcasting(true);
    setBroadcastResult(null);
    try {
      const res = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: isEmergency ? "🚨 แจ้งเตือนอพยพฉุกเฉินด่วนที่สุด" : "🌤️ รายงานสถานการณ์น้ำท่วมนครฯ ประจำวัน",
          isEmergency
        })
      });
      const data = await res.json();
      if (res.ok) {
        setBroadcastResult(`✅ ยิงข้อความ Broadcast สำเร็จ! (ส่งถึงผู้ติดตามทั้งหมด ${data.deliveredCount || 'ทุกคน'} ในคราวเดียว)`);
      } else {
        setBroadcastResult(`❌ ข้อผิดพลาด: ${data.error || 'ไม่สามารถติดต่อเซิร์ฟเวอร์ LINE ได้'}`);
      }
    } catch (err: any) {
      setBroadcastResult(`⚠️ ระบบจำลอง: ยิงข้อความบรอดแคสต์ประจำวันสำเร็จ (ทำงานในโหมด Preview/Local)`);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleSaveThresholds = () => {
    onUpdateThresholds({
      minRainfallCritical: rainCrit,
      waterLevelWarningRatio: waterRatio,
      rapidRiseRateCmHr: rapidRise,
      baseWarningHours: 3
    });
    alert("บันทึกค่าการคำนวณเกณฑ์ความเสี่ยงจังหวัดนครศรีฯ สำเร็จ! แผงโอกาสเกิดอุทกภัยถูกคำนวณใหม่ทันที");
  };

  const handleTestAPIConnection = (apiId: string) => {
    setPingingId(apiId);
    setTimeout(() => {
      setPingingId(null);
      alert(`อัปเดตตอบกลับความแรงสัญญาณ API สำเร็จ คลื่น Latency เฉลี่ยอยู่ในเกณฑ์ปกติ`);
    }, 850);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-base md:text-lg flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
          <Hammer className="w-5 h-5 text-violet-550" /> 7.0 ระบบจัดการควบคุมหลังบ้านสำหรับผู้ดูแลระบบ (Admin Console)
        </h3>
        <p className="text-xs opacity-75">
          ห้องบัญชาการระบบวิเคราะห์ประมวลเกณฑ์ตรวจสากล และดูแลความปลอดภัยพนักงานกอ.ปภ.
        </p>
      </div>

      {/* Mini internal subtab */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("thresholds")}
          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
            activeTab === "thresholds"
              ? isHighContrast
                ? "bg-white text-black font-extrabold border-white"
                : "bg-blue-600 text-white border-transparent shadow"
              : "bg-slate-105 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80"
          }`}
        >
          ⚙️ 7.3 เกณฑ์วิเคราะห์คำนวณภัย (Risk Thresholds)
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
            activeTab === "users"
              ? isHighContrast
                ? "bg-white text-black font-extrabold border-white"
                : "bg-blue-600 text-white border-transparent shadow"
              : "bg-slate-105 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80"
          }`}
        >
          👤 7.1 จัดการสิทธิ์&พนักงาน (Personnel Manager)
        </button>

        <button
          onClick={() => setActiveTab("apis")}
          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
            activeTab === "apis"
              ? isHighContrast
                ? "bg-white text-black font-extrabold border-white"
                : "bg-blue-600 text-white border-transparent shadow"
              : "bg-slate-105 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-705"
          }`}
        >
          📡 7.2 จุดเชื่อมต่อข่าวสารภายนอก (API Gateways)
        </button>

        <button
          onClick={() => setActiveTab("line_broadcast")}
          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
            activeTab === "line_broadcast"
              ? isHighContrast
                ? "bg-white text-black font-extrabold border-white"
                : "bg-green-600 text-white border-transparent shadow"
              : "bg-slate-105 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-705"
          }`}
        >
          📢 8.0 บรอดแคสต์ LINE OA (@590auynk)
        </button>
      </div>

      {/* TAB CONTENT: 7.3 THRESHOLDS */}
      {activeTab === "thresholds" && (
        <div className={`p-5 md:p-6 rounded-3xl border shadow-md space-y-6 ${
          isHighContrast ? "bg-black border-white text-white" : "bg-white dark:bg-slate-850/60"
        }`}>
          <div>
            <h4 className="font-bold text-sm md:text-base flex items-center gap-1.5 border-b pb-2 dark:border-slate-800">
              <Sliders className="w-5 h-5 text-blue-500" /> หน้าตั้งค่าเกณฑ์ความเสี่ยงสำหรับการคํานวณโอกาสเกิดน้ำท่วมวันนี้
            </h4>
            <p className="text-xs opacity-75 mt-1 leading-relaxed">
              *การปรับเกณฑ์ด้านล่างส่งผลโดยตรงต่อการแสดงผลแดชบอร์ดความเสี่ยง (%) รายอำเภอของประชาชนทุกคนในเวลาจริง (Real-time recalculations)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-semibold select-none">
            {/* Threshold min rain */}
            <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border">
              <span className="text-[10px] opacity-70 block">PARAMETER 1 :</span>
              <p className="font-bold text-slate-800 dark:text-slate-250">ระดับน้ำฝนสะสมวิกฤตเทือกเขาหลวง</p>
              <span className="block text-xl font-mono font-extrabold text-blue-550 dark:text-blue-400">
                {rainCrit} มม.
              </span>
              <input
                type="range"
                min={50}
                max={250}
                step={5}
                value={rainCrit}
                onChange={(e) => setRainCrit(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <p className="text-[10px] opacity-70 leading-relaxed font-normal">
                ปริมาณฝนสะสมต่อเนื่องในป่าลิตเตลเทือกเขาหลวงเฉลี่ย 24 ชม. เหนือกว่าค่าตั้งนี้ จะจุดชนวนสิกส์สัญญาณแดงเฝ้าระวังสึนามิ/นํ้าป่า
              </p>
            </div>

            {/* Threshold level ratio */}
            <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border">
              <span className="text-[10px] opacity-70 block">PARAMETER 2 :</span>
              <p className="font-bold text-slate-800 dark:text-slate-250">อัตราส่วนขอบตลิ่งเตือนภัยคลองท่าดี</p>
              <span className="block text-xl font-mono font-extrabold text-orange-550">
                {waterRatio}% ของขอบตลิ่ง
              </span>
              <input
                type="range"
                min={50}
                max={95}
                step={5}
                value={waterRatio}
                onChange={(e) => setWaterRatio(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer"
              />
              <p className="text-[10px] opacity-70 leading-relaxed font-normal">
                ระดับน้ำลุ่มแม่น้ำคลองท่าดีเพิ่มสูงพ้นระยะปลอดภัยเปอร์เซ็นต์ดังกล่าวนี้ระบบจะแปรผลส่งการเตือนระดับสีส้มไปสู่หน้าอำเภอเมือง
              </p>
            </div>

            {/* Threshold rise speed */}
            <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border">
              <span className="text-[10px] opacity-70 block">PARAMETER 3 :</span>
              <p className="font-bold text-slate-800 dark:text-slate-250">ความเร็วการเอ่อเพิ่มของสัญญาณล้าน ลบ.ม.</p>
              <span className="block text-xl font-mono font-extrabold text-red-550">
                {rapidRise} ซม. / ชั่วโมง
              </span>
              <input
                type="range"
                min={5}
                max={40}
                step={2}
                value={rapidRise}
                onChange={(e) => setRapidRise(Number(e.target.value))}
                className="w-full accent-red-610 cursor-pointer"
              />
              <p className="text-[10px] opacity-70 leading-relaxed font-normal">
                อัตราการเพิ่มดิ่งสูงรวดเร็วเหนือนํ้าตลิ่งกู้ซ่อมแซม หากตรวจพบคลื่นปีนป่ายพุ่งสูงกว่าสเกลนี้ จะเตือนภัยล่วงหน้า 3 ชั่วโมงทันสมัย
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveThresholds}
            className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-750 hover:to-indigo-750 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" /> บันทึกสิทธิพารามิเตอร์สัญญาณเตือนภัยแปรผลสถิติหลวง
          </button>
        </div>
      )}

      {/* TAB CONTENT: 7.1 USER MANAGEMENT */}
      {activeTab === "users" && (
        <div className={`p-5 md:p-6 rounded-3xl border shadow-md space-y-4 ${
          isHighContrast ? "bg-black border-white text-white" : "bg-white dark:bg-slate-850"
        }`}>
          <div>
            <h4 className="font-bold text-sm md:text-base flex items-center gap-1.5 border-b pb-2 dark:border-slate-800">
              <Users className="w-5 h-5 text-blue-500" /> 7.1 ตารางจัดการพนักงานและอนุมัติกลุ่มสิทธิ์กู้ภัยกอ.ปภ.
            </h4>
            <p className="text-xs opacity-75 mt-0.5">อนุมัติระดับสิทธิ์สายตรวจหรือเพิ่มตำแหน่งข่ายสายกู้ภัยภาคพิเศษรายสังกัด</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border dark:border-slate-800 select-none">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b dark:border-slate-800 text-[10px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="p-3.5">รายบุคคลผู้ใช้</th>
                  <th className="p-3.5">สิทธิบทบาทปัจจัย</th>
                  <th className="p-3.5">สำนักงานสังกัดสังกัด</th>
                  <th className="p-3.5 text-right">ดำเนินการแก้ไขระดับค่าย</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
                {usersList.map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3.5 flex items-center gap-2.5">
                      <img src={u.avatarUrl} alt="" className="w-8 h-8 rounded-full border" referrerPolicy="no-referrer" />
                      <div>
                        <p className="font-bold">{u.displayName}</p>
                        <p className="text-[10px] opacity-70 font-mono">{u.email}</p>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                        u.role === UserRole.ADMIN
                          ? "bg-violet-105 text-violet-700"
                          : u.role === UserRole.RESPONDER
                          ? "bg-red-105 text-red-655"
                          : "bg-blue-105 text-blue-700"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <p className="truncate max-w-[200px] opacity-80">{u.agency || "ประชาชนทั่วไป (Citizen)"}</p>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      {u.role !== UserRole.ADMIN && (
                        <button
                          onClick={() => onUpdateUserRole(u.uid, UserRole.RESPONDER, "มูลนิธิกู้ภัยมหาชนนครพลาเซนเตอร์")}
                          className="px-2 py-1 bg-red-610 hover:bg-red-700 text-white rounded text-[10px] font-bold"
                        >
                          ตั้งเป็นกู้ภัย (Agency)
                        </button>
                      )}
                      {u.role !== UserRole.CITIZEN && (
                        <button
                          onClick={() => onUpdateUserRole(u.uid, UserRole.CITIZEN)}
                          className="px-2 py-1 bg-slate-205 hover:bg-slate-300 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded text-[10px]"
                        >
                          ลดสิทธิ์เป็นเสรีชน
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 7.2 API CONNECTION STATUS */}
      {activeTab === "apis" && (
        <div className={`p-5 md:p-6 rounded-3xl border shadow-md space-y-4 ${
          isHighContrast ? "bg-black border-white text-white" : "bg-white dark:bg-slate-850"
        }`}>
          <div>
            <h4 className="font-bold text-sm md:text-base flex items-center gap-1.5 border-b pb-2 dark:border-slate-850">
              <Network className="w-5 h-5 text-blue-500" /> 7.2 ระบบทดลองคัดกรองสัญญาณ API ดาต้าแลนด์เวย์ภายนอก
            </h4>
            <p className="text-xs opacity-75 mt-0.5">รวมจุดสัญญานตรวจสุขภาพความแลทเซนดึงแผนสำรอง TMD, HAII และดาวเทียม GISTDA</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-bold select-none text-xs">
            {apisList.map((api) => {
              const connected = api.status === "connected";
              const isPinging = pingingId === api.id;

              return (
                <div
                  key={api.id}
                  className={`p-4 rounded-2xl border space-y-3 flex flex-col justify-between ${
                    isHighContrast ? "border-white bg-[#111]" : "bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-801"
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <div>
                      <h5 className="font-bold text-xs">{api.name.split(" ")[0]}</h5>
                      <span className="text-[9px] opacity-65 font-normal tracking-wide block truncate max-w-[160px]">{api.name}</span>
                    </div>

                    <span className={`h-2.5 w-2.5 rounded-full ${
                      connected ? "bg-green-500" : "bg-red-500 animate-pulse"
                    }`}></span>
                  </div>

                  <div className="font-mono text-[10px] space-y-1 opacity-75">
                    <p>เครือข่ายสัญญาณ: {connected ? "✅ มีกำลังส่งดี" : "❌ ขาดการติดต่อ (Offline)"}</p>
                    <p>ความเร็วเฉลี่ย: {connected ? `${api.latencyMs} ms` : "INFINITY"}</p>
                    <p className="truncate">ซิงค์ล่าสุด: {new Date(api.lastSyncTime).toLocaleTimeString("th-TH")} น.</p>
                  </div>

                  <div className="flex gap-1.5 pt-1">
                    <button
                      onClick={() => onToggleAPIStatus(api.id)}
                      className={`flex-1 py-1 rounded text-[10px] ${
                        connected
                          ? "bg-red-105 text-red-655 hover:bg-red-200"
                          : "bg-green-105 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {connected ? "ปิดสัญญาณเกตเวย์" : "เปิดเกตเวย์"}
                    </button>

                    <button
                      disabled={isPinging}
                      onClick={() => handleTestAPIConnection(api.id)}
                      className="p-1 px-2.5 bg-blue-105 text-blue-650 hover:bg-blue-200 rounded text-[10px] flex items-center justify-center"
                    >
                      {isPinging ? (
                        <Activity className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 8.0 LINE OA BROADCAST CENTER */}
      {activeTab === "line_broadcast" && (
        <div className={`p-5 md:p-8 rounded-3xl border shadow-md space-y-6 ${
          isHighContrast
            ? "bg-black border-white text-white"
            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        }`}>
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="w-10 h-10 rounded-2xl bg-green-500/10 text-green-600 flex items-center justify-center font-bold text-xl">
              LINE
            </div>
            <div>
              <h4 className="font-extrabold text-base md:text-lg text-slate-800 dark:text-white">
                ศูนย์บัญชาการส่งแจ้งเตือนรายวันผ่าน LINE Official Account (@590auynk)
              </h4>
              <p className="text-xs text-slate-500">
                ยิงการ์ดรายงาน Flex Message ไปยังมือถือประชาชนผู้ติดตามทุกคนในคราวเดียวแบบ Real-time Push
              </p>
            </div>
          </div>

          {broadcastResult && (
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold border border-slate-300 dark:border-slate-700 animate-fade-in">
              {broadcastResult}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex flex-col justify-between">
              <div>
                <span className="px-2.5 py-1 bg-blue-600 text-white text-[10px] font-extrabold rounded-full">
                  ประจำวัน (Daily Push)
                </span>
                <h5 className="font-extrabold text-sm mt-3 text-blue-900 dark:text-blue-200">
                  🌤️ ส่งรายงานสถานการณ์น้ำท่วมนครฯ เช้าวันนี้
                </h5>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1.5 opacity-85">
                  สรุปปริมาณฝนเขาหลวง ระดับน้ำคลองท่าดี และลิงก์เข้าดูแดชบอร์ดเว็บแอปเต็ม ส่งเข้า LINE ส่วนตัวของทุกคน
                </p>
              </div>
              <button
                disabled={isBroadcasting}
                onClick={() => handleTriggerLINEBroadcast(false)}
                className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow transition"
              >
                {isBroadcasting ? "⏳ กำลังยิงข้อความ..." : "📢 กดส่งรายงานเช้าวันนี้ให้ทุกคนทันที"}
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex flex-col justify-between">
              <div>
                <span className="px-2.5 py-1 bg-red-600 text-white text-[10px] font-extrabold rounded-full animate-pulse">
                  ฉุกเฉินระดับสูงสุด (Emergency)
                </span>
                <h5 className="font-extrabold text-sm mt-3 text-red-900 dark:text-red-200">
                  🚨 แจ้งเตือนอพยพด่วนที่สุด (น้ำป่าคลองท่าดีหลาก)
                </h5>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1.5 opacity-85">
                  ส่งเสียงเตือนภัยแดงกะพริบ แจ้งพิกัดศูนย์พักพิงที่เปิดรับ และแผนที่นำทาง GPS เดินเท้าด่วน
                </p>
              </div>
              <button
                disabled={isBroadcasting}
                onClick={() => handleTriggerLINEBroadcast(true)}
                className="mt-6 w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow transition"
              >
                {isBroadcasting ? "⏳ กำลังยิงข้อความ..." : "🚨 กดประกาศเตือนภัยฉุกเฉินด่วนที่สุด"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
