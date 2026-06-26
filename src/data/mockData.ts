import { FloodReport, FloodSeverity, ReportStatus, WeatherStation, RiverGauge, ThresholdSettings, IntegrationAPI } from "../types";

export const initialAmphoes = [
  { id: "mueang", name: "เมืองนครศรีธรรมราช", engName: "Mueang Nakhon Si Thammarat", baseFloodChance: 65, rainfallFactor: 0.3, riverFactor: 0.4 },
  { id: "pakphanang", name: "ปากพนัง", engName: "Pak Phanang", baseFloodChance: 80, rainfallFactor: 0.2, riverFactor: 0.6 },
  { id: "lansaka", name: "ลานสกา", engName: "Lan Saka", baseFloodChance: 40, rainfallFactor: 0.6, riverFactor: 0.2 },
  { id: "phipun", name: "พิปูน", engName: "Phipun", baseFloodChance: 35, rainfallFactor: 0.5, riverFactor: 0.3 },
  { id: "thungsong", name: "ทุ่งสง", engName: "Thung Song", baseFloodChance: 45, rainfallFactor: 0.4, riverFactor: 0.3 },
  { id: "sichon", name: "สิชล", engName: "Sichon", baseFloodChance: 50, rainfallFactor: 0.4, riverFactor: 0.4 },
  { id: "thasala", name: "ท่าศาลา", engName: "Tha Sala", baseFloodChance: 55, rainfallFactor: 0.3, riverFactor: 0.4 },
  { id: "chauat", name: "ชะอวด", engName: "Cha-uat", baseFloodChance: 70, rainfallFactor: 0.3, riverFactor: 0.5 },
  { id: "promkiri", name: "พรหมคีรี", engName: "Prom Kiri", baseFloodChance: 42, rainfallFactor: 0.5, riverFactor: 0.3 },
  { id: "chawang", name: "ฉวาง", engName: "Chawang", baseFloodChance: 48, rainfallFactor: 0.4, riverFactor: 0.4 },
  { id: "chianyai", name: "เชียรใหญ่", engName: "Chian Yai", baseFloodChance: 75, rainfallFactor: 0.2, riverFactor: 0.6 },
  { id: "nabon", name: "นาบอน", engName: "Na Bon", baseFloodChance: 36, rainfallFactor: 0.4, riverFactor: 0.2 },
  { id: "thungyai", name: "ทุ่งใหญ่", engName: "Thung Yai", baseFloodChance: 40, rainfallFactor: 0.4, riverFactor: 0.3 },
  { id: "ronphibun", name: "ร่อนพิบูลย์", engName: "Ron Phibun", baseFloodChance: 46, rainfallFactor: 0.4, riverFactor: 0.3 },
  { id: "khanom", name: "ขนอม", engName: "Khanom", baseFloodChance: 38, rainfallFactor: 0.4, riverFactor: 0.2 },
  { id: "huasai", name: "หัวไทร", engName: "Hua Sai", baseFloodChance: 72, rainfallFactor: 0.2, riverFactor: 0.6 },
  { id: "bangkhan", name: "บางขัน", engName: "Bang Khan", baseFloodChance: 35, rainfallFactor: 0.4, riverFactor: 0.2 },
  { id: "thamphannara", name: "ถ้ำพรรณรา", engName: "Tham Phannara", baseFloodChance: 37, rainfallFactor: 0.4, riverFactor: 0.2 },
  { id: "chulabhorn", name: "จุฬาภรณ์", engName: "Chulabhorn", baseFloodChance: 52, rainfallFactor: 0.4, riverFactor: 0.3 },
  { id: "phraphrom", name: "พระพรหม", engName: "Phra Phrom", baseFloodChance: 58, rainfallFactor: 0.3, riverFactor: 0.4 },
  { id: "nopphitam", name: "นบพิตำ", engName: "Nopphitam", baseFloodChance: 44, rainfallFactor: 0.6, riverFactor: 0.2 },
  { id: "changklang", name: "ช้างกลาง", engName: "Chang Klang", baseFloodChance: 41, rainfallFactor: 0.5, riverFactor: 0.2 },
  { id: "chaloemphrakiat", name: "เฉลิมพระเกียรติ", engName: "Chaloem Phra Kiat", baseFloodChance: 62, rainfallFactor: 0.3, riverFactor: 0.4 }
];

export const initialWeatherStations: WeatherStation[] = [
  {
    id: "station_khao_luang",
    name: "สถานีวัดน้ำฝนอุทยานแห่งชาติเทือกเขาหลวง (ลานสกา)",
    rainfall24h: 135.5, // mm
    humidity: 94,
    windDirection: "ตะวันตกเฉียงใต้ (SW)",
    windSpeed: 22
  },
  {
    id: "station_mueang",
    name: "สถานีอุตุนิยมวิทยานครศรีธรรมราช (เมือง)",
    rainfall24h: 78.2,
    humidity: 88,
    windDirection: "ตะวันตกเฉียงใต้ (SW)",
    windSpeed: 18
  },
  {
    id: "station_pak_phanang",
    name: "สถานีตรวจวัดปากแม่น้ำปากพนัง",
    rainfall24h: 92.4,
    humidity: 91,
    windDirection: "ตะวันออกเฉียงเหนือ (NE)",
    windSpeed: 30
  }
];

export const initialRiverGauges: RiverGauge[] = [
  {
    id: "river_thadi",
    name: "คลองท่าดี (จุดตรวจวัดบ้านคีรีวง)",
    currentLevel: 4.85, // m
    warningLevel: 4.20,
    criticalLevel: 4.70,
    trend: "rising"
  },
  {
    id: "river_pakphanang",
    name: "แม่น้ำปากพนัง (จุดตรวจหน้าเมืองปากพนัง)",
    currentLevel: 3.42,
    warningLevel: 3.00,
    criticalLevel: 3.50,
    trend: "rising"
  },
  {
    id: "river_kathun_res",
    name: "อ่างเก็บน้ำคลองกะทูน (พิปูน - โครงการพระราชดำริ)",
    currentLevel: 62.4, // ล้าน ลบ.ม. (88% ของความจุ)
    warningLevel: 65.0,
    criticalLevel: 70.50,
    trend: "stable"
  },
  {
    id: "river_dindaeng_res",
    name: "อ่างเก็บน้ำคลองดินแดง (พิปูน)",
    currentLevel: 54.6, // ล้าน ลบ.ม. (91% ของความจุ)
    warningLevel: 56.0,
    criticalLevel: 60.00,
    trend: "rising"
  },
  {
    id: "river_huainamsai_res",
    name: "อ่างเก็บน้ำห้วยน้ำใส (ชะอวด)",
    currentLevel: 72.8, // ล้าน ลบ.ม. (91% ของความจุ)
    warningLevel: 75.0,
    criticalLevel: 80.00,
    trend: "rising"
  },
  {
    id: "river_sametchuan_res",
    name: "อ่างเก็บน้ำบ้านเสม็ดจวน (ทุ่งใหญ่ - อ่างขนาดเล็ก)",
    currentLevel: 1.35, // ล้าน ลบ.ม. (79% ของความจุ)
    warningLevel: 1.50,
    criticalLevel: 1.70,
    trend: "falling"
  },
  {
    id: "river_khlongsang_res",
    name: "อ่างเก็บน้ำคลองสังข์ (ทุ่งใหญ่ - โครงการพระราชดำริ)",
    currentLevel: 18.2, // ล้าน ลบ.ม. (50% ของความจุ)
    warningLevel: 32.0,
    criticalLevel: 36.50,
    trend: "stable"
  },
  {
    id: "river_kapang_res",
    name: "อ่างเก็บน้ำคลองกะปาง (ทุ่งสง)",
    currentLevel: 11.2, // ล้าน ลบ.ม. (77% ของความจุ)
    warningLevel: 13.0,
    criticalLevel: 14.50,
    trend: "stable"
  },
  {
    id: "river_khlongtrai_res",
    name: "อ่างเก็บน้ำคลองตราย (พรหมคีรี)",
    currentLevel: 3.1, // ล้าน ลบ.ม. (74% ของความจุ)
    warningLevel: 3.8,
    criticalLevel: 4.20,
    trend: "stable"
  },
  {
    id: "river_khlongkhut_res",
    name: "อ่างเก็บน้ำคลองคุด (สิชล)",
    currentLevel: 2.4, // ล้าน ลบ.ม. (68% ของความจุ)
    warningLevel: 3.0,
    criticalLevel: 3.50,
    trend: "falling"
  }
];

export const initialEvacuationCenters = [
  {
    id: "evac_1",
    name: "ศูนย์พักพิงร่วมใจอุ่นไอรัก ปากพนัง",
    landmark: "ปากพนังหมู่อื่น ใกล้วัดบ่อแดง",
    capacity: 250,
    currentPeople: 120,
    phone: "075-511011",
    latitude: 8.3533,
    longitude: 100.2012
  },
  {
    id: "evac_2",
    name: "ศูนย์ช่วยเหลือผู้ประสบภัย อบต. ลานสกา",
    landmark: "ตรงข้ามที่ว่าการอำเภอลานสกา",
    capacity: 150,
    currentPeople: 45,
    phone: "075-391211",
    latitude: 8.3415,
    longitude: 99.7820
  },
  {
    id: "evac_3",
    name: "อาคารอเนกประสงค์เทศบาลนครนครศรีธรรมราช",
    landmark: "ใกล้สนามกีฬากลางจังหวัด",
    capacity: 400,
    currentPeople: 210,
    phone: "075-342880",
    latitude: 8.4465,
    longitude: 99.9552
  }
];

export const initialFloodReports: FloodReport[] = [
  {
    id: "rpt_1",
    reporterId: "user_citizen_1",
    reporterName: "นาย สมชาย รักบ้านเกิด",
    reporterPhone: "081-234-5678",
    timestamp: "2026-06-22T08:30:00-07:00",
    amphoe: "เมืองนครศรีธรรมราช",
    tambon: "ในเมือง",
    landmark: "หลังวัดพระมหาธาตุวรมหาวิหาร ตรอกมะขาม",
    severity: FloodSeverity.HIGH,
    latitude: 8.4112,
    longitude: 99.9664,
    waterLevelCm: 45,
    strandedPeopleCount: 3,
    neededHelp: ["food", "medicine", "sandbags"],
    description: "น้ำล้นจากคูเมืองทะลักเข้าท่วมชั้นล่างของตัวบ้านแล้ว รถเล็กผ่านไม่ได้ ต้องการทรายไปบล็อกหน้าประตูและยาแก้โรคน้ำกัดเท้าด่วนครับ มีคนแก่ติดค้าง",
    images: [
      "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=400"
    ],
    status: ReportStatus.UNDERWAY,
    assignedAgency: "มูลนิธิประชาร่วมใจ นครศรีธรรมราช",
    responderNote: "สายตรวจกู้ภัยพายเรือท้องแบนนำข้าวกล่องและยาส่งพิกัดด่วนแล้ว กำลังจัดแนวกระสอบทรายเพิ่ม",
    updatedAt: "2026-06-22T09:12:00-07:00"
  },
  {
    id: "rpt_2",
    reporterId: "user_citizen_2",
    reporterName: "นาง สมจิตร ณ ปากพนัง",
    reporterPhone: "089-876-5432",
    timestamp: "2026-06-22T09:15:00-07:00",
    amphoe: "ปากพนัง",
    tambon: "บางพระ",
    landmark: "ริมแม่น้ำปากพนัง ถ.สุขาภิบาล 2",
    severity: FloodSeverity.CRITICAL,
    latitude: 8.3512,
    longitude: 100.1885,
    waterLevelCm: 85,
    strandedPeopleCount: 5,
    neededHelp: ["boat", "evac"],
    description: "แม่น้ำหนุนและน้ำป่าหลากท่วมสูงเกินอกแล้ว กระแสแรงมาก ชั้นล่างอยู่ไม่ได้หนีขึ้นหลังคา บ้านเป็นครึ่งปูนครึ่งไม้สั่นตามแรงน้ำ ต้องการเรือหนีภัยด่วนมาก!",
    images: [
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=400"
    ],
    status: ReportStatus.PENDING,
    assignedAgency: "",
    responderNote: "",
    updatedAt: ""
  },
  {
    id: "rpt_3",
    reporterId: "user_citizen_3",
    reporterName: "นาย อภินันท์ คีรีภูมิ",
    reporterPhone: "085-333-4444",
    timestamp: "2026-06-21T18:00:00-07:00",
    amphoe: "ลานสกา",
    tambon: "กำโลน",
    landmark: "จุดท่องเที่ยวหนานหินท่าหา บ้านคีรีวง",
    severity: FloodSeverity.LOW,
    latitude: 8.4365,
    longitude: 99.7610,
    waterLevelCm: 15,
    strandedPeopleCount: 0,
    neededHelp: [],
    description: "น้ำป่าสีแองข้นไหลหลากลงสู่ลำคลองท่าดีอย่างรวดเร็ว ส่งผลให้น้ำเอ่อข้นท่วมทางเดินหนานหินริมน้ำ เตือนนักท่องเที่ยวห้ามลงเล่นน้ำและขนย้ายของขึ้นที่สูงประเดี่ยวแล้ว",
    images: [
      "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?auto=format&fit=crop&q=80&w=400"
    ],
    status: ReportStatus.COMPLETED,
    assignedAgency: "ปภ. จังหวัดนครศรีธรรมราช แผนกลำน้ำสังเคราะห์",
    responderNote: "ติดตั้งป้ายเตือนห้ามลงเล่นน้ำ คลื่นระเบิดและเปิดประตูน้ำควบคุมความปลอดภัยลงด่านล่างสำเร็จแล้ว",
    updatedAt: "2026-06-21T21:30:00-07:00"
  },
  {
    id: "rpt_4",
    reporterId: "user_citizen_4",
    reporterName: "นาย เกรียงเดช เรืองปัญญา",
    reporterPhone: "086-555-6677",
    timestamp: "2026-06-22T06:40:00-07:00",
    amphoe: "ชะอวด",
    tambon: "ท่าประจะ",
    landmark: "ใตสะพานรถไฟฝั่งตะวันออก",
    severity: FloodSeverity.MEDIUM,
    latitude: 7.9780,
    longitude: 99.9825,
    waterLevelCm: 35,
    strandedPeopleCount: 2,
    neededHelp: ["food", "sandbags"],
    description: "มีน้ำท่วมขังใต้สะพานเส้นเดินรถเล็ก สูงประมาณใต้เข่า รถยนต์ยกสูงวิ่งผ่านได้ แต่มอเตอร์ไซค์เครื่องดับหลายคันแล้ว ต้องการดึงเรือ/กระสอบทรายต้านน้ำล้นร่องระบายน้ำ",
    images: [
      "https://images.unsplash.com/photo-1545048702-79362596cdc9?auto=format&fit=crop&q=80&w=400"
    ],
    status: ReportStatus.DISPATCHED,
    assignedAgency: "กู้ภัยไต้เต็กตึ๊ง นครศรีธรรมราช",
    responderNote: "ทีมกู้ภัยระดมอำนวยความสะดวกการจราจร เลี่ยงจุดระดับน้ำและสูบน้ำออกจากบ่อตลิ่งพังประปา",
    updatedAt: "2026-06-22T08:00:00-07:00"
  }
];

export const defaultThresholdSettings: ThresholdSettings = {
  minRainfallCritical: 100, // 100 mm of accumulated mountain rainfall starts red alert
  waterLevelWarningRatio: 85, // 85% of critical level trigger orange alert
  rapidRiseRateCmHr: 15, // 15 cm/hour level rise is orange warning
  baseWarningHours: 3
};

export const defaultAPIs: IntegrationAPI[] = [
  { id: "api_tmd", name: "กรมอุตุนิยมวิทยา (TMD Weather API Gateway)", status: "connected", latencyMs: 45, lastSyncTime: "2026-06-22T10:45:00-07:00" },
  { id: "api_haii", name: "สถาบันสารสนเทศทรัพยากรน้ำ (HAII Telemetry Hub)", status: "connected", latencyMs: 60, lastSyncTime: "2026-06-22T10:48:00-07:00" },
  { id: "api_gistda", name: "สํานักงานพัฒนาเทคโนโลยีอวกาศและภูมิสารสนเทศ (GISTDA FloodSat)", status: "connected", latencyMs: 125, lastSyncTime: "2026-06-22T10:30:00-07:00" }
];

export const mockUsers = [
  { uid: "user_it_admin", phone: "080-000-0001", email: "admin@nakhonflood.go.th", displayName: "แอดมิน ปภ. นครศรีฯ (IT Admin)", role: "admin", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100", watchZones: ["ในเมือง"] },
  { uid: "user_responder_1", phone: "080-000-0002", email: "officer_taitek@gmail.com", displayName: "พ.อ.ต. นที (สายตรวจสายสายด่วน กู้ภัยไต้เต็กตึ๊ง)", role: "responder", agency: "กู้ภัยไต้เต็กตึ๊ง นครศรีธรรมราช", avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100", watchZones: [] },
  { uid: "user_citizen_1", phone: "081-234-5678", email: "khanesuan2548@gmail.com", displayName: "ประธานชุมชน สมชาย (คีรีวงค้ำคูณ)", role: "citizen", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100", watchZones: ["กำโลน", "ในเมือง"] }
];

// Generates beautiful realistic simulated historical water level / rainfall data for Khao Luang for June
export const generateHistoricalData = (selectedDateString: string) => {
  const seed = selectedDateString.split("-").reduce((acc, val) => acc + parseInt(val || "0", 10), 0);
  const hashVal = (seed % 100) / 100; // float [0, 1)

  const floodChance = Math.floor(20 + hashVal * 75); // 20% to 95%
  const mountainRainfall = +(30 + hashVal * 150).toFixed(1); // 30mm to 180mm
  const waterLevelInM = +(2.5 + hashVal * 2.8).toFixed(2); // 2.5m to 5.3m

  // Weekly comparative pattern
  const trendData = [
    { name: "จันทร์ (Mon)", rainThisWeek: +(40 + hashVal * 20).toFixed(1), rainLastYear: 45, levelThisWeek: 2.8, levelLastYear: 3.1 },
    { name: "อังคาร (Tue)", rainThisWeek: +(50 + hashVal * 40).toFixed(1), rainLastYear: 38, levelThisWeek: 3.1, levelLastYear: 2.9 },
    { name: "พุธ (Wed)", rainThisWeek: +(120 + hashVal * 30).toFixed(1), rainLastYear: 42, levelThisWeek: 4.5, levelLastYear: 3.0 },
    { name: "พฤหัสฯ (Thu)", rainThisWeek: +(90 + hashVal * 10).toFixed(1), rainLastYear: 50, levelThisWeek: 4.8, levelLastYear: 3.3 },
    { name: "ศุกร์ (Fri)", rainThisWeek: +(78 + hashVal * 5).toFixed(1), rainLastYear: 55, levelThisWeek: 4.1, levelLastYear: 3.5 },
    { name: "เสาร์ (Sat)", rainThisWeek: +(135 + hashVal * 15).toFixed(1), rainLastYear: 60, levelThisWeek: 4.9, levelLastYear: 3.6 },
    { name: "อาทิตย์ (Sun)", rainThisWeek: mountainRainfall, rainLastYear: 48, levelThisWeek: waterLevelInM, levelLastYear: 3.2 }
  ];

  return { floodChance, mountainRainfall, waterLevelInM, trendData };
};


export const nakhonDistrictsAndTambons: Record<string, string[]> = {
  "เมืองนครศรีธรรมราช": ["ในเมือง", "ท่าวัง", "คลัง", "ท่าซัก", "ปากพูน", "นาทราย", "ทรัพย์เจริญ", "บางจาก", "ปากนคร", "ท่าเรือ", "มะม่วงสองต้น", "โพธิ์เสด็จ", "ไชยมนตรี", "กำแพงเซา", "นาเคียน"],
  "พรหมคีรี": ["พรหมโลก", "บ้านเกาะ", "อินคีรี", "ทอนหงส์", "นาเรียง"],
  "ลานสกา": ["เขาแก้ว", "ลานสกา", "ท่าดี", "กำโลน", "ขุนทะเล"],
  "ฉวาง": ["ฉวาง", "จันดี", "ไม้เรียง", "กะเปียด", "นากะชะ", "ห้วยปริก", "ละอาย", "นาแว", "นาเขลียง", "ห้วยโก"],
  "พิปูน": ["พิปูน", "กะทูน", "เขาพระ", "ยางค้อม", "ควนกลาง"],
  "เชียรใหญ่": ["เชียรใหญ่", "ท่าขนาน", "บ้านกลาง", "บ้านเนิน", "ไทรทอง", "การะเกด", "เขาพระบาท", "แม่เจ้าอยู่หัว", "เสือหึง", "ท้องลำ"],
  "ชะอวด": ["ชะอวด", "ท่าประจะ", "ท่าเสม็ด", "นางหลง", "ท่าซอม", "ควนหนองหงษ์", "เขาพระทอง", "วังอ่าง", "บ้านตูล", "ขอนหาด", "เกาะขันธ์"],
  "ท่าศาลา": ["ท่าศาลา", "กลาย", "ท่าขึ้น", "หัวตะพาน", "สระแก้ว", "โมคลาน", "ไทยบุรี", "ดอนตะโก", "ตลิ่งชัน", "โพธิ์ทอง"],
  "ทุ่งสง": ["ปากแพรก", "ชะมาย", "หนองหงส์", "ควนกรด", "นาไม้ไผ่", "นาหลวงเสน", "เขาโร", "กะปาง", "ที่วัง", "น้ำตก", "ถ้ำใหญ่", "นาโพธิ์", "เขาขาว"],
  "นาบอน": ["นาบอน", "ทุ่งสง", "แก้วแสน"],
  "ทุ่งใหญ่": ["ท่ายาง", "ทุ่งสัง", "ทุ่งใหญ่", "กุแหระ", "ปริก", "บางรูป", "กรุงหยัน"],
  "ปากพนัง": ["ปากพนัง", "คลองน้อย", "ป่าระกำ", "ชะเมา", "คลองกระบือ", "เกาะทวด", "บ้านใหม่", "หูล่อง", "แหลมตะลุมพุก", "ปากพนังฝั่งตะวันตก", "ปากพนังฝั่งตะวันออก", "บางพระ", "บางตะพง", "ปากแพรก", "บ้านเพิง", "ท่าพยา", "บางศาลา"],
  "ร่อนพิบูลย์": ["ร่อนพิบูลย์", "หินตก", "เสาธง", "ควนเกย", "ควนพัง", "ควนชุม"],
  "สิชล": ["สิชล", "ทุ่งปรัง", "ฉลอง", "เสาเภา", "เปลี่ยน", "สี่ขีด", "เขาน้อย", "ทุ่งใส"],
  "ขนอม": ["ขนอม", "ควนทอง", "ท้องเนียน"],
  "หัวไทร": ["หัวไทร", "หน้าสตน", "ทรายขาว", "แหลม", "เขาพังไกร", "บ้านราม", "บางนบ", "ท่าซอม", "ควนชะลิก", "รามแก้ว", "เกาะเพชร"],
  "บางขัน": ["บางขัน", "บ้านลำนาว", "วังหิน", "บ้านนิคม"],
  "ถ้ำพรรณรา": ["ถ้ำพรรณรา", "คลองเส", "ดุสิต"],
  "จุฬาภรณ์": ["บ้านควนมุด", "บ้านชะอวด", "ควนหนองคว้า", "ทุ่งโพธิ์", "นาหมอบุญ", "สามตำบล"],
  "พระพรหม": ["นาพรุ", "นาสาร", "ท้ายสำเภา", "ช้างซ้าย"],
  "นบพิตำ": ["นบพิตำ", "กรุงชิง", "กะหรอ", "นาเหรง"],
  "ช้างกลาง": ["ช้างกลาง", "หลักช้าง", "สวนขัน"],
  "เฉลิมพระเกียรติ": ["เชียรเขา", "ดอนตรอ", "สวนหลวง", "ทางพูน"]
};
