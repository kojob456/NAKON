import React, { useState, useRef } from "react";
import { Camera, Image as ImageIcon, MapPin, Check, Plus, Trash2, Shield, Info, Compass } from "lucide-react";
import { User, FloodReport, FloodSeverity, ReportStatus } from "../types";
import InteractiveMap from "./InteractiveMap";
import { nakhonDistrictsAndTambons } from "../data/mockData";

interface ReportPortalProps {
  currentUser: User | null;
  onAddReport: (report: FloodReport) => void;
  isDarkMode: boolean;
  isHighContrast: boolean;
  onOpenAuth?: () => void;
}

// Preset flood photos for easy demo uploads
const demoFloodPhotos = [
  "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1545048702-79362596cdc9?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?auto=format&fit=crop&q=80&w=400"
];

export default function ReportPortal({
  currentUser,
  onAddReport,
  isDarkMode,
  isHighContrast,
  onOpenAuth
}: ReportPortalProps) {
  const [amphoe, setAmphoe] = useState("เมืองนครศรีธรรมราช");
  const [tambon, setTambon] = useState("");
  const [landmark, setLandmark] = useState("");
  const [severity, setSeverity] = useState<FloodSeverity>(FloodSeverity.MEDIUM);
  const [waterLevelCm, setWaterLevelCm] = useState(30);
  const [strandedPeopleCount, setStrandedPeopleCount] = useState(0);
  const [neededHelp, setNeededHelp] = useState<string[]>([]);
  const [otherHelpText, setOtherHelpText] = useState("");
  const [description, setDescription] = useState("");

  const [images, setImages] = useState<string[]>([]);
  const [showCameraMode, setShowCameraMode] = useState(false);
  const [useRealCamera, setUseRealCamera] = useState(false);

  // Default coordinate centered at Nakhon Si Thammarat
  const [latitude, setLatitude] = useState(8.4325);
  const [longitude, setLongitude] = useState(99.9631);
  const [gpsLoading, setGpsLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);


  // 1. Get Auto GPS location coordinate
  const handleAutoGPS = () => {
    setGpsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(+pos.coords.latitude.toFixed(5));
          setLongitude(+pos.coords.longitude.toFixed(5));
          setGpsLoading(false);
        },
        (error) => {
          // Fallback coordinate randomized slightly around Nakhon Si Thammarat
          const randomFactorLat = (Math.random() - 0.5) * 0.1;
          const randomFactorLng = (Math.random() - 0.5) * 0.1;
          setLatitude(+(8.432 + randomFactorLat).toFixed(4));
          setLongitude(+(99.963 + randomFactorLng).toFixed(4));
          setGpsLoading(false);
          alert("สิทธิการดึงพิกัดในเบราว์เซอร์ถูกปฏิเสธ: ระบบทำการจำลองพิกัดบริเวณนครศรีธรรมราชของเครื่องท่านอัตโนมัติ");
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setGpsLoading(false);
      alert("เบราว์เซอร์นี้ไม่รองรับพาร์ตเนอร์ GPS: ระบบออฟไลน์ชั่วคราว");
    }
  };

  React.useEffect(() => {
    handleAutoGPS();
  }, []);

  // 2. Map Tapping Selector
  const handleMapTapPlacement = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  // 3. Toggle Camera stream (HTML5)
  const startCameraStream = async () => {
    setShowCameraMode(true);
    setUseRealCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      // Stream failed due to lack of camera permissions
      setUseRealCamera(false); // Enable preset camera mockup
    }
  };

  const captureCameraPhoto = () => {
    if (useRealCamera && videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth || 640;
        canvasRef.current.height = videoRef.current.videoHeight || 480;
        ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const dataUrl = canvasRef.current.toDataURL("image/jpeg");
        if (images.length < 5) {
          setImages([...images, dataUrl]);
        }
        stopCameraStream();
      }
    } else {
      // Mock capture preset picture
      const pickedDemo = demoFloodPhotos[Math.floor(Math.random() * demoFloodPhotos.length)];
      if (images.length < 5) {
        setImages([...images, pickedDemo]);
      }
      setShowCameraMode(false);
    }
  };

  const stopCameraStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setShowCameraMode(false);
  };

  // Simple Base64 File Uploader simulator
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (images.length >= 5) {
        alert("อัปโหลดหลักฐานรูปถ่ายได้สูงสุด 5 ใบ");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file as any);
    });
  };

  const removePhoto = (idxToRemove: number) => {
    setImages(images.filter((_, idx) => idx !== idxToRemove));
  };

  const selectDemoPhoto = (photoUrl: string) => {
    if (images.length >= 5) {
      alert("อัปโหลดหลักฐานรูปถ่ายได้สูงสุด 5 ใบ");
      return;
    }
    setImages([...images, photoUrl]);
  };

  const handleHelpToggle = (helpKey: string) => {
    if (neededHelp.includes(helpKey)) {
      setNeededHelp(neededHelp.filter((h) => h !== helpKey));
    } else {
      setNeededHelp([...neededHelp, helpKey]);
    }
  };

  // Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!tambon || !landmark) {
      alert("กรุณาระบุข้อมูลตำบล และจุดสังเกตพิกัดให้เรียบร้อย");
      return;
    }

    const finalNeededHelp = neededHelp.filter(h => h !== "other");
    if (neededHelp.includes("other") && otherHelpText.trim()) {
      finalNeededHelp.push(`อื่นๆ: ${otherHelpText}`);
    }

    const reportPayload: FloodReport = {
      id: "rpt_" + Date.now(),
      reporterId: currentUser.uid,
      reporterName: currentUser.displayName,
      reporterPhone: currentUser.phone || "08X-XXX-XXXX",
      timestamp: new Date().toISOString(),
      amphoe,
      tambon,
      landmark,
      severity,
      latitude,
      longitude,
      waterLevelCm,
      strandedPeopleCount,
      neededHelp: finalNeededHelp,
      description,
      images: images.length > 0 ? images : [demoFloodPhotos[0]], // fallback picture
      status: ReportStatus.PENDING,
      assignedAgency: ""
    };

    onAddReport(reportPayload);

    // Reset form after submission
    setAmphoe("เมืองนครศรีธรรมราช");
    setTambon("");
    setLandmark("");
    setSeverity(FloodSeverity.MEDIUM);
    setWaterLevelCm(30);
    setStrandedPeopleCount(0);
    setNeededHelp([]);
    setDescription("");
    setImages([]);
    alert("ส่งข้อมูลแจ้งเหตุน้ำท่วมเข้าสู่ระบบสำเร็จ! เจ้าหน้าที่ศูนย์บัญชาการกำลังเร่งตรวจสอบและประสานงานความช่วยเหลือครับ");
  };

  if (!currentUser) {
    return (
      <div className="w-full flex items-center justify-center py-12 select-none">
        <div className={`p-8 text-center max-w-md rounded-3xl border shadow-2xl space-y-4 ${
          isHighContrast ? "bg-black border-white text-white" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
        }`}>
          <Shield className="w-14 h-14 text-red-500 mx-auto animate-pulse" />
          <h3 className="font-extrabold text-base md:text-lg">กรุณาล็อกอินก่อนเปิดแบบฟอร์มแจ้งเหตุ</h3>
          <p className="text-xs opacity-75 leading-relaxed">
            เพื่อความปลอดภัย ป้องกันข้อมูลเท็จ และช่วยให้เจ้าหน้าที่กู้ภัยสามารถยืนยันพิกัดและติดต่อกลับตามเบอร์โทรศัพท์ของคุณได้ทันทีเมื่อรับแจ้งเหตุครับ
          </p>
          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="w-full py-3.5 bg-gradient-to-r from-red-600 to-orange-600 text-white font-extrabold rounded-2xl shadow-lg hover:opacity-95 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              🔓 ล็อกอินเพื่อแจ้งเหตุกู้ภัยด่วนทันที
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left 3 cols: Detailed entry Form */}
      <div className="lg:col-span-3 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-base md:text-lg flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
              <Camera className="w-5 h-5 text-blue-500" /> ฟอร์มส่งรายงานกู้ภัยภัยพิบัติน้ำท่วมส่วนบุคคล
            </h3>
            <p className="text-xs opacity-75">กรุณากรอกข้อมูลระดับน้ำและคำขอพิเศษเพื่อกู้วิกฤตฉุกเฉิน</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={`p-6 rounded-3xl border space-y-5 shadow ${
          isHighContrast ? "bg-black border-white" : "bg-white dark:bg-slate-800/60"
        }`}>
          {/* Location details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1.5">อำเภอเกิดเหตุ</label>
              <select
                value={amphoe}
                onChange={(e) => {
                  setAmphoe(e.target.value);
                  setTambon(""); // Reset tambon when amphoe changes
                }}
                className={`w-full p-2.5 rounded-xl text-xs border font-bold ${
                  isHighContrast ? "bg-black text-white border-white" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                }`}
              >
                {Object.keys(nakhonDistrictsAndTambons).map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold block mb-1.5">ตำบลที่อยู่อาศัย</label>
              <select
                value={tambon}
                onChange={(e) => setTambon(e.target.value)}
                required
                className={`w-full p-2.5 rounded-xl text-xs border font-bold focus:outline-none ${
                  isHighContrast ? "bg-black text-white border-white" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                }`}
              >
                <option value="" disabled>-- เลือกตำบล --</option>
                {(nakhonDistrictsAndTambons[amphoe] || []).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold block mb-1.5">จุดสังเกตเด่น / ซอยบ้าน</label>
              <input
                type="text"
                placeholder="เช่น ซอย 3 ตรงข้ามร้านชำ"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                required
                className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none ${
                  isHighContrast ? "bg-black text-white border-white" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                }`}
              />
            </div>
          </div>

          {/* Severity & Metrics fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 border-slate-100 dark:border-slate-800/80">
            <div>
              <label className="text-xs font-bold block mb-1.5">พิจารณารวมความรุนแรง</label>
              <div className="grid grid-cols-4 gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-center font-bold">
                {[
                  { key: FloodSeverity.LOW, label: "ต่ำ", text: "text-green-500", bg: "hover:bg-green-50" },
                  { key: FloodSeverity.MEDIUM, label: "ปานกลาง", text: "text-yellow-600 dark:text-yellow-400", bg: "hover:bg-yellow-50" },
                  { key: FloodSeverity.HIGH, label: "สูงมาก", text: "text-orange-500", bg: "hover:bg-orange-50" },
                  { key: FloodSeverity.CRITICAL, label: "วิกฤต", text: "text-red-600", bg: "hover:bg-red-100" }
                ].map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSeverity(s.key)}
                    className={`py-1.5 rounded-lg text-xs leading-none transition-all ${
                      severity === s.key
                        ? isHighContrast
                          ? "bg-white text-black font-extrabold"
                          : "bg-blue-600 text-white shadow-sm"
                        : `${s.text} ${s.bg} bg-transparent`
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <label className="text-xs font-bold block mb-1.5">ระดับน้ําประมาณการ ({waterLevelCm} ซม.)</label>
                <input
                  type="range"
                  min={5}
                  max={250}
                  step={5}
                  value={waterLevelCm}
                  onChange={(e) => setWaterLevelCm(Number(e.target.value))}
                  className="w-full accent-blue-605 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] opacity-65 mt-0.5 font-bold">
                  <span>ตาตุ่ม</span>
                  <span>หัวเข่า</span>
                  <span>เอว</span>
                  <span>ท่วมหัว</span>
                </div>
              </div>

              <div className="w-24 shrink-0">
                <label className="text-xs font-bold block mb-1.5">คนติดค้าง (คน)</label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={strandedPeopleCount}
                  onChange={(e) => setStrandedPeopleCount(Math.max(0, parseInt(e.target.value || "0", 10)))}
                  className={`w-full p-2 rounded-xl text-center border font-bold ${
                    isHighContrast ? "bg-black text-white border-white" : "bg-slate-50 dark:bg-slate-800 border-slate-200"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Urgent helps */}
          <div className="border-t pt-4 border-slate-100 dark:border-slate-800/80">
            <label className="text-xs font-bold block mb-2 text-red-600 dark:text-red-400">
              📌 การขอความช่วยเหลือด่วนเร่งรัด (เลือกได้มากกว่า 1 ข้อ)
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "boat", label: "🚣 ต้องการเรืออพยพด่วน" },
                { key: "medicine", label: "💊 ยารักษาโรค / ยาน้ํากัดเท้า" },
                { key: "food", label: "🍱 ข้าวกล่องถุงยังชีพประทาน" },
                { key: "evac", label: "🏠 อพยพคนชราไปจุดปลอดภัย" },
                { key: "other", label: "อื่นๆ (โปรดระบุ)" }
              ].map((h) => {
                const active = neededHelp.includes(h.key);
                return (
                  <button
                    key={h.key}
                    type="button"
                    onClick={() => handleHelpToggle(h.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      active
                        ? isHighContrast
                          ? "bg-yellow-405 text-black border-white"
                          : "bg-red-50 text-red-700 border-red-500 dark:bg-red-950/30 dark:text-red-300"
                        : "bg-transparent text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800/80 hover:bg-slate-50"
                    }`}
                  >
                    {active && <Check className="w-3.5 h-3.5" />}
                    {h.label}
                  </button>
                );
              })}
            </div>
            {neededHelp.includes("other") && (
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="ระบุสิ่งที่ต้องการความช่วยเหลืออื่นๆ (เช่น น้ำดื่ม ผ้าห่ม)..."
                  value={otherHelpText}
                  onChange={(e) => setOtherHelpText(e.target.value)}
                  className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none ${
                    isHighContrast ? "bg-black text-white border-white" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                  }`}
                />
              </div>
            )}
          </div>

          {/* Coordinates area & Uploader */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 border-slate-100 dark:border-slate-800/80">
            <div className="space-y-1.5">
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleAutoGPS}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow transition-all active:scale-95"
                >
                  <MapPin className="w-4 h-4 animate-bounce" /> 📍 แชร์พิกัด GPS เรียลไทม์จุดที่น้ำท่วม (Real-time Location)
                </button>
                <label className="text-xs font-bold flex justify-between items-center opacity-75">
                  <span>📍 พิกัดดาวเทียมปัจจุบัน</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(Number(e.target.value))}
                  placeholder="ละติจูด"
                  className={`p-2 rounded-xl text-center border ${
                    isHighContrast ? "bg-black text-white border-white" : "bg-slate-100 dark:bg-slate-800 border-slate-200"
                  }`}
                />
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(Number(e.target.value))}
                  placeholder="ลองจิจูด"
                  className={`p-2 rounded-xl text-center border ${
                    isHighContrast ? "bg-black text-white border-white" : "bg-slate-100 dark:bg-slate-800 border-slate-200"
                  }`}
                />
              </div>

              {gpsLoading && <p className="text-[10px] text-orange-500 animate-pulse font-bold">📡 กำลังเชื่อมต่อเสาสัญญาณพิกัด...</p>}
            </div>

            {/* Photo upload */}
            <div className="space-y-2">
              <label className="text-xs font-bold block">📸 ถ่ายภาพน้ำท่วมจากกล้องใน LINE OA หรืออัปโหลดรูป (สูงสุด 5 ใบ)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="py-3 px-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-95">
                  <Camera className="w-5 h-5 shrink-0" />
                  <span>📲 เปิดกล้องถ่ายรูปน้ำท่วมส่งทันที (LINE OA Camera)</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={startCameraStream}
                  className="py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow transition-all active:scale-95"
                >
                  <Camera className="w-5 h-5 shrink-0" /> ถ่ายภาพจากเว็บแคม (Live Webcam)
                </button>
              </div>
              
              {images.length > 0 && (
                <div className="flex gap-2 items-center flex-wrap pt-2">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">✅ แนบรูปแล้ว {images.length} ใบ:</span>
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img src={img} alt="preview" className="w-12 h-12 rounded-lg object-cover border border-slate-300" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shadow"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Preset Flood photo choices for desk preview */}
          <div className="space-y-1">
            <span className="text-[10px] opacity-75 font-semibold">ต้องการความเร็วในการพิจารณา? คลิกเลือกภาพตัวอย่างน้ำท่วม:</span>
            <div className="flex gap-2">
              {demoFloodPhotos.map((ph, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectDemoPhoto(ph)}
                  className="w-12 h-12 rounded-lg overflow-hidden border hover:border-blue-500 hover:scale-105 transition-all shrink-0"
                >
                  <img src={ph} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          {/* Chosen photos listing */}
          {images.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap bg-slate-50 dark:bg-slate-800/40 p-2 rounded-2xl">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden border select-none">
                  <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-0 right-0 bg-red-600 text-white p-0.5 rounded-full hover:bg-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold block opacity-85">เขียนเล่าข้อมูลเพิ่มเติม</label>
            <textarea
              rows={3}
              placeholder="เช่น บ้านเลขที่เท่าไหร่ มีเด็กเล็กหรือคนพิการหรือไม่ น้ำไหลเชี่ยวแรงแค่ไหน..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full p-2.5 rounded-xl text-xs border focus:outline-none ${
                isHighContrast ? "bg-black text-white border-white" : "bg-slate-50 dark:bg-slate-800 border-slate-200"
              }`}
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white rounded-xl text-sm font-extrabold transition-all shadow-md active:scale-[0.99]"
          >
            🔊 ยืนยันการส่งรายงานกู้ภัย (Dispatch Report)
          </button>
        </form>
      </div>

      {/* Right 2 cols: Interactive map locator helpers */}
      <div className="lg:col-span-2 space-y-4">
        <div>
          <h3 className="font-bold text-base md:text-lg flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
            <Compass className="w-5 h-5 text-blue-500" /> ระบบดึงแลนด์มาร์ก & แผนที่สัมผัส
          </h3>
          <p className="text-xs opacity-75">คลิกบนพื้นที่ของข่ายแมปเพื่อดึงละติจูด/ลองจิจูดอัพเดตฟอร์มอัตโนมัติ</p>
        </div>

        <div className="h-[calc(100%-2.5rem)] flex flex-col justify-between">
          <InteractiveMap
            reports={[]}
            evacCenters={[]}
            selectedAmphoe=""
            onSelectAmphoe={() => {}}
            isDarkMode={isDarkMode}
            isHighContrast={isHighContrast}
            onMapClick={handleMapTapPlacement}
            interactiveMode={true}
            tempPin={{ latitude, longitude }}
          />

          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl text-[10px] md:text-xs text-blue-800 dark:text-blue-300 flex gap-2 font-semibold mt-3 h-fit leading-relaxed">
            <Info className="w-5 h-5 text-blue-500 shrink-0" />
            <span>
              <strong>วิธีการปักปัน:</strong> แตะตอกบนแผ่นที่ทางกายภาพ แถบกากบาทสีเหลืองจะสลักพิกัดบ้านคุณ และส่งต่อหน่วยตอบกู้ภัยอย่างแม่นยำทีเดียว
            </span>
          </div>
        </div>
      </div>

      {/* Camera Live Stream Dialog Viewfinder Modal */}
      {showCameraMode && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 text-white space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-sm">📷 Live Camera Capture Viewfinder</h4>
              <button
                onClick={stopCameraStream}
                className="text-xs opacity-70 hover:opacity-100 bg-slate-800 px-2 py-1 rounded"
              >
                ปิดหน้ากล้อง ✕
              </button>
            </div>

            {/* Video or preset Viewfinder */}
            <div className="aspect-video relative rounded-2xl bg-black overflow-hidden border border-slate-700 flex items-center justify-center shadow-inner">
              {useRealCamera ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4 space-y-3">
                  <img
                    src={demoFloodPhotos[1]}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
                  />
                  <div className="relative z-10 space-y-2">
                    <p className="text-xs font-bold bg-black/60 py-1 px-3.5 rounded-full inline-block text-red-400 border border-red-500 animate-pulse">
                      VIEWFINDER SIMULATOR (โหมดจำลองกล้องสด)
                    </p>
                    <p className="text-[10px] opacity-80 bg-black/50 p-2 rounded-xl">
                      เบราว์เซอร์อยู่ในเซฟบ็อกซ์ไอเฟรม / ไม่พบสิทธิ์กล้อง: ระบบสลับมาเป็นโหมดถ่ายทอดพิกัดจำลอง ปล่อยเพื่อกดแชะภาพสภาพแวดล้อมได้ปกติ
                    </p>
                  </div>
                </div>
              )}

              {/* Viewfinder brackets */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-lg"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-lg"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-lg"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-lg"></div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={captureCameraPhoto}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-xs flex items-center gap-1.5 animate-pulse shadow-lg"
              >
                📸 [ กดถ่ายภาพช็อตนี้ / Snap Shot ]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invisible Canvas for extraction and resizing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
