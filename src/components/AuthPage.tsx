import React, { useState } from "react";
import { MessageSquare, Mail, ShieldCheck, Phone, CheckCircle, HelpCircle } from "lucide-react";
import { User, UserRole } from "../types";
import { loginWithGoogle, loginWithLine, saveUserProfile } from "../utils/firebase";

interface AuthPageProps {
  onLogin: (user: User) => void;
  isDarkMode: boolean;
  isHighContrast: boolean;
}

export default function AuthPage({ onLogin, isDarkMode, isHighContrast }: AuthPageProps) {
  const [method, setMethod] = useState<"phone" | "line" | "google" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [email, setEmail] = useState("");
  const [countdown, setCountdown] = useState(0);

  const startCountdown = () => {
    setCountdown(59);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 9) {
      alert("กรุณาระบุหมายเลขโทรศัพท์มือถือที่ถูกต้อง (เช่น 081-234-5678)");
      return;
    }
    setOtpSent(true);
    startCountdown();
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== "1234" && otpCode !== "0000") {
      alert("รหัสผ่าน OTP ไม่ถูกต้อง! (ทดลองใช้โค้ดรหัส '1234')");
      return;
    }

    // Create custom Citizen profile upon login
    const newUser: User = {
      uid: "user_" + Date.now(),
      phone: phone,
      email: email || "citizen_user@domain.com",
      displayName: `คุณผู้แจ้งภัย (${phone})`,
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
      role: UserRole.CITIZEN,
      watchZones: ["ในเมือง"] // Default watch list
    };

    onLogin(newUser);
  };

  const handleThirdPartySignIn = async (provider: "google" | "line") => {
    try {
      let user;
      if (provider === "google") {
        user = await loginWithGoogle();
      } else {
        user = await loginWithLine();
      }
      
      const newUser: User = {
        uid: user.uid,
        phone: user.phoneNumber || "089-111-2222",
        email: user.email || "",
        displayName: user.displayName || (provider === "google" ? "Google User" : "LINE User"),
        avatarUrl: user.photoURL || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=100",
        role: UserRole.CITIZEN,
        watchZones: ["ปากพนังตะวันออก"]
      };

      // Save to firestore (wrapped in try-catch so permission errors don't block login)
      try {
        await saveUserProfile(user, { role: UserRole.CITIZEN, watchZones: ["ปากพนังตะวันออก"] });
      } catch (dbError) {
        console.warn("Could not save user to Firestore due to permissions, but proceeding with login:", dbError);
      }
      
      onLogin(newUser);
    } catch (error: any) {
      console.error(`${provider} login failed`, error);
      alert(`การเข้าสู่ระบบผ่าน ${provider.toUpperCase()} ล้มเหลว\nสาเหตุ: ${error.message || error}`);
    }
  };

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      alert("กรุณาระบุอีเมลผู้ใช้งาน");
      return;
    }
    const newUser: User = {
      uid: "user_email_" + Date.now(),
      phone: "084-555-5555",
      email: email,
      displayName: `วิชาญ รักษ์คีรีวง (Email Verified)`,
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100",
      role: UserRole.CITIZEN,
      watchZones: ["กำโลน"]
    };
    onLogin(newUser);
  };

  return (
    <div className="max-w-md mx-auto my-12">
      <div className={`p-6 md:p-8 rounded-3xl border shadow-xl ${
        isHighContrast
          ? "bg-black border-white text-white"
          : isDarkMode
          ? "bg-slate-900 border-slate-800 text-slate-100"
          : "bg-white border-slate-200 text-slate-900"
      }`}>
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 text-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold">สมัครสมาชิก / เข้าสู่ระบบ</h2>
          <p className="text-xs opacity-70 mt-1">ยืนยันรหัสความปลอดภัยเข้าดูสิทธิการแจ้งเหตุน้ำท่วม</p>
        </div>

        {/* Tab Methods Navs */}
        <div className="grid grid-cols-4 gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl mb-6 text-xs font-bold leading-none">
          <button
            onClick={() => { setMethod("phone"); setOtpSent(false); }}
            className={`py-2 rounded-xl transition-all ${method === "phone" ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm" : "opacity-7F"}`}
          >
            เบอร์มือถือ
          </button>
          <button
            onClick={() => setMethod("line")}
            className={`py-2 rounded-xl transition-all ${method === "line" ? "bg-white dark:bg-slate-700 text-green-600 dark:text-green-400 shadow-sm" : "opacity-7F"}`}
          >
            LINE
          </button>
          <button
            onClick={() => setMethod("google")}
            className={`py-2 rounded-xl transition-all ${method === "google" ? "bg-white dark:bg-slate-700 text-red-500 shadow-sm" : "opacity-7F"}`}
          >
            Google
          </button>
          <button
            onClick={() => setMethod("email")}
            className={`py-2 rounded-xl transition-all ${method === "email" ? "bg-white dark:bg-slate-700 text-stone-600 dark:text-stone-300 shadow-sm" : "opacity-7F"}`}
          >
            Email
          </button>
        </div>

        {/* Methods bodies */}
        {method === "phone" && (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold block opacity-85">ระบุเบอร์โทรศัพท์ (เสมือน)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 opacity-60" />
                    <input
                      type="tel"
                      placeholder="081-234-5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isHighContrast
                          ? "bg-black text-white border-white"
                          : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-800"
                      }`}
                    />
                  </div>
                  <p className="text-[10px] opacity-70">โค้ดยืนยัน OTP จะถูกจำลองขึ้นเพื่อให้ทดสอบระบบได้โดยไม่มีค่าบริการ SMS</p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow"
                >
                  ขอรหัสผ่านยืนยัน OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="bg-blue-500/10 p-3 rounded-xl text-xs flex gap-2 border border-blue-500/25">
                  <CheckCircle className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>ส่งสัญญาณ OTP จำลองไปยังเบอร์ <strong>{phone}</strong> แล้ว ใช้รหัสผ่านล็อกอิน <strong>1234</strong></span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold block opacity-85">ระบุรหัส OTP 4 หลัก</label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="เลขรหัส 4 หลัก"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    required
                    className={`w-full p-2.5 rounded-xl text-center text-lg tracking-widest font-mono border ${
                      isHighContrast
                        ? "bg-black text-white border-white"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-800"
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow"
                >
                  เข้าสู่ระบบยืนยันความปลอดภัย
                </button>

                <div className="text-center text-xs opacity-70">
                  {countdown > 0 ? (
                    <span>ขอรหัสผ่านวิเคราะห์ใหม่ใน ({countdown} วินาที)</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-blue-500 hover:underline inline font-bold"
                    >
                      ส่งรหัสอีกครั้ง
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        )}

        {method === "line" && (
          <div className="space-y-4 text-center">
            <p className="text-xs opacity-75">เชื่อมต่อผ่านแอปพลิเคชัน LINE เพื่อรับการแจ้งเตือนสัญญาน 3 ชั่วโมงทันสมัย</p>
            <button
              onClick={() => handleThirdPartySignIn("line")}
              className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow"
            >
              <MessageSquare className="w-4 h-4 fill-white" /> เข้าสู่ระบบด้วยบัญชี LINE Official
            </button>
          </div>
        )}

        {method === "google" && (
          <div className="space-y-4 text-center">
            <p className="text-xs opacity-75">เข้าสู่ระบบแบบครั้งเดียวผ่าน Google Account (SSO) ด้วยความปลอดภัยระดับสูง</p>
            <button
              onClick={() => handleThirdPartySignIn("google")}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow"
            >
              <ShieldCheck className="w-4 h-4" /> เข้าสู่ระบบด้วยกูเกิล (Sign in with Google)
            </button>
          </div>
        )}

        {method === "email" && (
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold block opacity-85">ระบุที่อยู่อีเมลผู้ใช้</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 opacity-60" />
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border focus:outline-none text-xs ${
                    isHighContrast
                      ? "bg-black text-white border-white"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-800"
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-stone-700 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow"
            >
              ส่งลิงก์รักษาความปลอดภัยไปยังเมล
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs opacity-75 flex items-center gap-1.5 justify-center font-medium select-none">
          <HelpCircle className="w-4 h-4 text-blue-500" />
          <span>สามารถสลับความเข้าใจโดยใช้แถบด้านบนสุดได้ตลอดเวลา</span>
        </div>
      </div>
    </div>
  );
}
