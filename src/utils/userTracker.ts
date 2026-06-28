import { collection, addDoc } from "firebase/firestore";
import { User } from "../types";
import { db } from "./firebase";

export interface AccessLog {
  uid: string;
  displayName: string;
  phone?: string;
  email?: string;
  role: string;
  action: "LOGIN" | "LOGOUT" | "VISIT";
  provider: string;
  userAgent: string;
  timestamp: string;
}

// Log user visit or authentication event to Firebase Firestore & LocalStorage
export const logUserAccess = async (user: User, action: "LOGIN" | "LOGOUT" | "VISIT", provider = "LINE / Web") => {
  try {
    const logData: AccessLog = {
      uid: user.uid || "guest_" + Date.now(),
      displayName: user.displayName || "พลเมืองผู้แจ้งภัย",
      phone: user.phone || "-",
      email: user.email || "-",
      role: user.role || "CITIZEN",
      action: action,
      provider: provider,
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "Unknown",
      timestamp: new Date().toISOString()
    };

    // Save locally for Admin Console quick viewing
    if (typeof window !== "undefined") {
      const existingLogs = JSON.parse(localStorage.getItem("user_access_logs") || "[]");
      existingLogs.unshift(logData);
      localStorage.setItem("user_access_logs", JSON.stringify(existingLogs.slice(0, 100)));
    }

    // Try saving to Firebase Firestore
    if (db) {
      const logsRef = collection(db, "user_access_logs");
      await addDoc(logsRef, logData).catch(err => {
        console.log("Simulated Firestore log saved locally:", err.message);
      });
    }
  } catch (err) {
    console.warn("User tracking logger info:", err);
  }
};
