export enum UserRole {
  PUBLIC = "public",
  CITIZEN = "citizen",
  RESPONDER = "responder",
  ADMIN = "admin"
}

export interface User {
  uid: string;
  phone: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  role: UserRole;
  agency?: string;
  watchZones: string[]; // List of tambons or amphoes for 3-Hour SMS/LINE alert
}

export enum ReportStatus {
  PENDING = "pending",     // รอดำเนินการ
  DISPATCHED = "dispatched", // ส่งต่อหน่วยงานแล้ว
  UNDERWAY = "underway",   // กำลังลงพื้นที่
  COMPLETED = "completed"   // ช่วยเหลือสำเร็จ
}

export enum FloodSeverity {
  LOW = "low",       // สีเขียว - ระดับต่ำ (น้ำขัง 5-15 cm)
  MEDIUM = "medium", // สีเหลือง - ปานกลาง (น้ำท่วม 15-50 cm รถสัญจรลำบาก)
  HIGH = "high",     // สีส้ม - สูงมาก (น้ำท่วมเกิน 50 cm ขอความช่วยเหลือเร่งด่วน)
  CRITICAL = "critical" // สีแดง - วิกฤต (ชั้นล่างมิด, ต้องอพยพด่วน)
}

export interface FloodReport {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterPhone: string;
  timestamp: string;
  amphoe: string;
  tambon: string;
  landmark: string;
  severity: FloodSeverity;
  latitude: number;
  longitude: number;
  waterLevelCm: number;
  strandedPeopleCount: number;
  neededHelp: string[]; // e.g. ["boat", "medicine", "food", "evac"]
  description: string;
  images: string[]; // base64 or high quality mock image templates
  status: ReportStatus;
  responderNote?: string;
  assignedAgency?: string;
  updatedAt?: string;
}

export interface WeatherStation {
  id: string;
  name: string; // e.g. "ฝนสะสมเทือกเขาหลวง Section-A"
  rainfall24h: number; // in mm
  humidity: number; // in %
  windDirection: string;
  windSpeed: number; // km/h
}

export interface RiverGauge {
  id: string;
  name: string; // คลองท่าดี, แม่น้ำปากพนัง, อ่างเก็บน้ำคลองกระทูน/ดินแดง
  currentLevel: number; // in m
  warningLevel: number; // in m
  criticalLevel: number; // in m
  trend: "rising" | "stable" | "falling";
}

export interface ThresholdSettings {
  minRainfallCritical: number; // เกณฑ์ฝนวิกฤต (e.g. 120mm)
  waterLevelWarningRatio: number; // สัดส่วนระดับน้ำตลิ่ง (e.g. 85%)
  rapidRiseRateCmHr: number; // อัตราการเพิ่มเร็วใน 1 ชม. (e.g. 15cm)
  baseWarningHours: number; // ระยะเวลาเตือนภัยล่วงหน้า (e.g. 3 ชม.)
}

export interface IntegrationAPI {
  id: string;
  name: string; // TMD, HAII, GISTDA
  status: "connected" | "disconnected" | "error";
  latencyMs: number;
  lastSyncTime: string;
}
