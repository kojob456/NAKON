import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB1fwWlX9j2WexGexUxmk8z8aV9-4y01Dc",
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
  db = getFirestore(app);
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
    console.error(`Error fetching ${colName} from Firestore:`, error);
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

export { auth, db };
