import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, initializeFirestore, collection, addDoc, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || "",
  authDomain: "khanesuan.firebaseapp.com",
  projectId: "khanesuan",
  storageBucket: "khanesuan.firebasestorage.app",
  messagingSenderId: "565773662342",
  appId: "1:565773662342:web:e8829adf44da9ec258f907",
  measurementId: "G-SBVTB782P9"
};

// Initialize Firebase
let app;
let auth: ReturnType<typeof getAuth>;
let db: ReturnType<typeof getFirestore>;
let analytics;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true
  });
  if (typeof window !== "undefined") {
    analytics = getAnalytics(app);
  }
} catch (error) {
  console.error("Firebase initialization error", error);
}

export const fetchCollectionData = async (colName: string) => {
  if (!db) return [];
  try {
    const querySnapshot = await getDocs(collection(db, colName));
    const data: any[] = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    return data;
  } catch (error) {
    console.warn(`Fallback local seed for ${colName} (Firestore permission/not setup)`);
    return [];
  }
};

export const fetchFloodData = async () => {
  return fetchCollectionData("flooddata");
};

const googleProvider = new GoogleAuthProvider();
const lineProvider = new OAuthProvider('oidc.line'); // LINE OIDC Provider

export const loginWithGoogle = async () => {
  if (!auth) throw new Error("Firebase not initialized");
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const loginWithLine = async () => {
  if (!auth) throw new Error("Firebase not initialized");
  try {
    // Note: This requires 'oidc.line' configured in Firebase Authentication -> Sign-in method -> OpenID Connect
    const result = await signInWithPopup(auth, lineProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with LINE", error);
    throw error;
  }
};

export const logout = async () => {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};

// Helper for saving user profile
export const saveUserProfile = async (user: any, additionalData: any = {}) => {
  if (!db) return;
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      role: 'citizen',
      watchZones: [],
      createdAt: new Date().toISOString(),
      ...additionalData
    });
  } else {
    // Only update certain fields if they already exist
    await setDoc(userRef, {
      lastLogin: new Date().toISOString(),
      ...additionalData
    }, { merge: true });
  }
};

export interface EvacCenter {
  id: string;
  name: string;
  landmark: string;
  capacity: number;
  currentPeople: number;
  phone: string;
  latitude: number;
  longitude: number;
  registrations: {
    id: string;
    citizenName: string;
    phone: string;
    headcount: number;
    timestamp: string;
  }[];
}

const defaultSeedCenters: EvacCenter[] = [
  {
    id: "evac_center_1",
    name: "ศูนย์พักพิงร่วมใจอุ่นไอรัก เทศบาลเมืองปากพนัง",
    landmark: "ใกล้วัดบ่อแดง ถนนเฉลิมพระเกียรติ",
    capacity: 500,
    currentPeople: 320,
    phone: "075-511011",
    latitude: 8.3533,
    longitude: 100.2012,
    registrations: [
      { id: "reg_1", citizenName: "นาย สมชาย รักบ้านเกิด", phone: "081-234-5678", headcount: 4, timestamp: "2026-06-24T10:30:00Z" },
      { id: "reg_2", citizenName: "นาง สมศรี มั่งมีศรีสุข", phone: "089-876-5432", headcount: 3, timestamp: "2026-06-24T11:15:00Z" },
      { id: "reg_3", citizenName: "นาย ประเสริฐ กอ.ปภ.", phone: "082-333-4444", headcount: 2, timestamp: "2026-06-25T08:00:00Z" }
    ]
  },
  {
    id: "evac_center_2",
    name: "อาคารอเนกประสงค์ เทศบาลนครนครศรีธรรมราช",
    landmark: "ตรงข้ามสนามกีฬากลางจังหวัด",
    capacity: 1000,
    currentPeople: 840,
    phone: "075-342880",
    latitude: 8.4465,
    longitude: 99.9552,
    registrations: [
      { id: "reg_4", citizenName: "คุณ วิชัย น้ำใจงาม", phone: "083-111-2222", headcount: 5, timestamp: "2026-06-23T14:20:00Z" },
      { id: "reg_5", citizenName: "นางสาว มาลี ศรีนคร", phone: "084-555-6666", headcount: 2, timestamp: "2026-06-24T09:10:00Z" }
    ]
  },
  {
    id: "evac_center_3",
    name: "ศูนย์ช่วยเหลือผู้ประสบภัย อบต. ลานสกา",
    landmark: "ติดโรงเรียนบ้านลานสกา",
    capacity: 250,
    currentPeople: 245, // เกือบเต็ม
    phone: "075-391211",
    latitude: 8.3415,
    longitude: 99.7820,
    registrations: [
      { id: "reg_6", citizenName: "นาย บุญมี พิทักษ์ป่า", phone: "085-999-8888", headcount: 6, timestamp: "2026-06-24T16:00:00Z" }
    ]
  },
  {
    id: "evac_center_4",
    name: "ศูนย์พักพิงชั่วคราวมหาวิทยาลัยวลัยลักษณ์ (ท่าศาลา)",
    landmark: "อาคารไทยบุรี มหาวิทยาลัยวลัยลักษณ์",
    capacity: 800,
    currentPeople: 150, // ว่างเยอะ
    phone: "075-673000",
    latitude: 8.6432,
    longitude: 99.8970,
    registrations: [
      { id: "reg_7", citizenName: "อาจารย์ มนัส ท่าศาลา", phone: "086-777-1111", headcount: 3, timestamp: "2026-06-25T07:30:00Z" }
    ]
  }
];

export const fetchEvacCentersFromFirebase = async (): Promise<EvacCenter[]> => {
  if (!db) return defaultSeedCenters;
  try {
    const colRef = collection(db, "evacuation_centers");
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      // Auto seed default centers into Firestore
      for (const center of defaultSeedCenters) {
        await setDoc(doc(db, "evacuation_centers", center.id), center);
      }
      return defaultSeedCenters;
    }
    const list: EvacCenter[] = [];
    snapshot.forEach((d) => list.push({ id: d.id, ...d.data() } as EvacCenter));
    return list;
  } catch (err) {
    console.warn("Using local seed evacuation centers (Firestore permission fallback)");
    return defaultSeedCenters;
  }
};

export const registerEvacCenterBooking = async (
  centerId: string, 
  citizenName: string, 
  phone: string, 
  headcount: number
): Promise<EvacCenter | null> => {
  if (!db) {
    // Local fallback update for demo
    const c = defaultSeedCenters.find(x => x.id === centerId);
    if (!c) return null;
    if (c.currentPeople + headcount > c.capacity) {
      throw new Error("ศูนย์อพยพนี้เต็มแล้ว ไม่สามารถรับยอดคนเพิ่มได้");
    }
    c.currentPeople += headcount;
    c.registrations.unshift({
      id: `reg_${Date.now()}`,
      citizenName,
      phone,
      headcount,
      timestamp: new Date().toISOString()
    });
    return { ...c };
  }

  try {
    const centerRef = doc(db, "evacuation_centers", centerId);
    const snap = await getDoc(centerRef);
    if (!snap.exists()) {
      // Local fallback if doc missing
      const c = defaultSeedCenters.find(x => x.id === centerId);
      if (!c) return null;
      if (c.currentPeople + headcount > c.capacity) throw new Error("ศูนย์อพยพเต็มแล้ว");
      c.currentPeople += headcount;
      c.registrations.unshift({ id: `reg_${Date.now()}`, citizenName, phone, headcount, timestamp: new Date().toISOString() });
      await setDoc(centerRef, c);
      return { ...c };
    }

    const data = snap.data() as EvacCenter;
    if (data.currentPeople + headcount > data.capacity) {
      throw new Error("ศูนย์อพยพนี้เต็มแล้ว ไม่สามารถรับยอดคนเพิ่มได้");
    }

    const newReg = {
      id: `reg_${Date.now()}`,
      citizenName,
      phone,
      headcount,
      timestamp: new Date().toISOString()
    };

    const updatedRegistrations = [newReg, ...(data.registrations || [])];
    const updatedCurrentPeople = data.currentPeople + headcount;

    await setDoc(centerRef, {
      currentPeople: updatedCurrentPeople,
      registrations: updatedRegistrations
    }, { merge: true });

    return {
      ...data,
      currentPeople: updatedCurrentPeople,
      registrations: updatedRegistrations
    };
  } catch (err) {
    console.error("Error registering booking:", err);
    throw err;
  }
};

export { auth, db };

