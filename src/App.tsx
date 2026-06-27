import React, { useState, useEffect } from "react";
import { Shield, HelpCircle, Phone, MapPin, Check, Plus, AlertCircle, Volume2, HelpCircle as HelpIcon, Accessibility, Camera } from "lucide-react";
import { User, UserRole, FloodReport, ReportStatus, FloodSeverity, WeatherStation, RiverGauge, ThresholdSettings, IntegrationAPI } from "./types";
import {
  initialAmphoes,
  initialWeatherStations,
  initialRiverGauges,
  initialEvacuationCenters,
  initialFloodReports,
  defaultThresholdSettings,
  defaultAPIs,
  mockUsers
} from "./data/mockData";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import OverviewDashboard from "./components/OverviewDashboard";
import FloodPrediction from "./components/FloodPrediction";
import WaterTrackingDashboard from "./components/WaterTrackingDashboard";
import InteractiveMap from "./components/InteractiveMap";
import AuthPage from "./components/AuthPage";
import ReportPortal from "./components/ReportPortal";
import TrackingPortal from "./components/TrackingPortal";
import ResponderDashboard from "./components/ResponderDashboard";
import AdminConsole from "./components/AdminConsole";
import EvacuationPortalModal from "./components/EvacuationPortalModal";
import { getThemeStyle, AppThemeType } from "./utils/theme";
import { logUserAccess } from "./utils/userTracker";

export default function App() {
  // Global States loaded from LocalStorage if available
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem("activeTab") || "dashboard";
  });

  const [dashboardMode, setDashboardMode] = useState<"map" | "report">(() => {
    return localStorage.getItem("activeTab") === "report" ? "report" : "map";
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });

  const [reports, setReports] = useState<FloodReport[]>(() => {
    if (localStorage.getItem("reports_real_gps_v1") !== "true") {
      localStorage.setItem("reports_real_gps_v1", "true");
      localStorage.removeItem("reports");
      return initialFloodReports;
    }
    const saved = localStorage.getItem("reports");
    return saved ? JSON.parse(saved) : initialFloodReports;
  });

  const [weatherStations, setWeatherStations] = useState<WeatherStation[]>(() => {
    const saved = localStorage.getItem("weatherStations");
    return saved ? JSON.parse(saved) : initialWeatherStations;
  });

  const [riverGauges, setRiverGauges] = useState<RiverGauge[]>(() => {
    const upgradedVer = localStorage.getItem("res_v2_royal");
    if (!upgradedVer) {
      localStorage.setItem("res_v2_royal", "true");
      return initialRiverGauges;
    }
    const saved = localStorage.getItem("riverGauges");
    if (saved) {
      try {
        const parsed: RiverGauge[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length < initialRiverGauges.length) {
          return initialRiverGauges;
        }
        return parsed;
      } catch (e) {
        return initialRiverGauges;
      }
    }
    return initialRiverGauges;
  });

  const [thresholdSettings, setThresholdSettings] = useState<ThresholdSettings>(() => {
    const saved = localStorage.getItem("thresholdSettings");
    return saved ? JSON.parse(saved) : defaultThresholdSettings;
  });

  const [apis, setApis] = useState<IntegrationAPI[]>(() => {
    const saved = localStorage.getItem("apis");
    return saved ? JSON.parse(saved) : defaultAPIs;
  });

  const [usersList, setUsersList] = useState<User[]>(() => {
    const cleanVer = localStorage.getItem("users_clean_v4_admin");
    if (!cleanVer) {
      localStorage.setItem("users_clean_v4_admin", "true");
      return mockUsers;
    }
    const saved = localStorage.getItem("usersList");
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        const seen = new Set();
        const cleaned: User[] = [];
        for (const usr of parsed) {
          if (usr.uid === "user_it_admin") usr.role = UserRole.ADMIN;
          if (usr.uid === "user_responder_1") usr.role = UserRole.RESPONDER;
          const key = usr.uid || usr.displayName;
          if (!seen.has(key)) {
            seen.add(key);
            cleaned.push(usr);
          }
        }
        return cleaned.length > 0 ? cleaned : mockUsers;
      } catch (e) {
        return mockUsers;
      }
    }
    return mockUsers;
  });

  const [selectedAmphoe, setSelectedAmphoe] = useState<string>("");
  const [amphoesList, setAmphoesList] = useState<any[]>(initialAmphoes);
  const [isEvacPortalOpen, setIsEvacPortalOpen] = useState(false);

  useEffect(() => {
    const fetchRemoteFloodData = async () => {
      try {
        const { fetchCollectionData } = await import("./utils/firebase");
        const [locList, floodList] = await Promise.all([
          fetchCollectionData("location"),
          fetchCollectionData("flooddata")
        ]);
        const remoteList = [...locList, ...floodList];
        if (remoteList && remoteList.length > 0) {
          const matchedIds = new Set();
          const updated: any[] = initialAmphoes.map((amp) => {
            const match = remoteList.find((r: any) => 
              r.id === amp.id ||
              r.districtNameEn?.toLowerCase().replace(/\s+/g, "") === amp.engName?.toLowerCase().replace(/\s+/g, "") ||
              r.districtNameTh === amp.name ||
              amp.engName?.toLowerCase().replace(/\s+/g, "-") === r.id ||
              r.name === amp.name || r.name === amp.engName
            );
            if (match) {
              matchedIds.add(match.id);
              return {
                ...amp,
                baseFloodChance: match.floodChance !== undefined ? Number(match.floodChance) : amp.baseFloodChance,
                floodChance: match.floodChance !== undefined ? Number(match.floodChance) : undefined,
                firestoreStatus: match.status,
                firestoreLevel: match.level
              };
            }
            return amp;
          });

          // Also append any new locations added directly in Firestore
          remoteList.forEach((r: any) => {
            if (!matchedIds.has(r.id)) {
              updated.push({
                id: r.id || `loc_${Math.random()}`,
                name: r.districtNameTh || r.name || r.id,
                engName: r.districtNameEn || r.engName || r.id,
                baseFloodChance: r.floodChance !== undefined ? Number(r.floodChance) : 50,
                floodChance: r.floodChance !== undefined ? Number(r.floodChance) : undefined,
                rainfallFactor: 0.4,
                riverFactor: 0.4,
                firestoreStatus: r.status,
                firestoreLevel: r.level
              });
            }
          });

          setAmphoesList(updated);
        }
      } catch (err) {
        console.warn("Using local seed flood reports (Firestore permission fallback)");
      }
    };
    fetchRemoteFloodData();
  }, []);

  // Accessibility State Setup & Theme Selector
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("isDarkMode") === "true";
  });

  const [appTheme, setAppTheme] = useState<AppThemeType>(() => {
    return (localStorage.getItem("appTheme") as AppThemeType) || "white";
  });

  const [fontSizeScale, setFontSizeScale] = useState<number>(() => {
    const saved = localStorage.getItem("fontSizeScale");
    return saved ? Number(saved) : 100;
  });

  const [isHighContrast, setIsHighContrast] = useState<boolean>(() => {
    return localStorage.getItem("isHighContrast") === "true";
  });

  const [isBoldText, setIsBoldText] = useState<boolean>(() => {
    return localStorage.getItem("isBoldText") === "true";
  });

  // Watch zones add drawer helper
  const [tempWatchZoneInput, setTempWatchZoneInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Persists states in localstorage to have pristine recovery
  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("reports", JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem("weatherStations", JSON.stringify(weatherStations));
  }, [weatherStations]);

  useEffect(() => {
    localStorage.setItem("riverGauges", JSON.stringify(riverGauges));
  }, [riverGauges]);

  useEffect(() => {
    localStorage.setItem("thresholdSettings", JSON.stringify(thresholdSettings));
  }, [thresholdSettings]);

  useEffect(() => {
    localStorage.setItem("apis", JSON.stringify(apis));
  }, [apis]);

  useEffect(() => {
    localStorage.setItem("usersList", JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    localStorage.setItem("isDarkMode", String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      setAppTheme("black");
    } else {
      document.documentElement.classList.remove("dark");
      setAppTheme("white");
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem("appTheme", appTheme);
  }, [appTheme]);

  useEffect(() => {
    localStorage.setItem("fontSizeScale", String(fontSizeScale));
  }, [fontSizeScale]);

  useEffect(() => {
    localStorage.setItem("isHighContrast", String(isHighContrast));
  }, [isHighContrast]);

  useEffect(() => {
    localStorage.setItem("isBoldText", String(isBoldText));
  }, [isBoldText]);


  // Handler 1: Simulator Quick switcher
  const handleSelectSimulatedUser = async (userUid: string | null) => {
    if (userUid === null) {
      if (currentUser) {
        logUserAccess(currentUser, "LOGOUT", "System Logout");
      }
      setCurrentUser(null);
      setActiveTab("dashboard");
      try {
        const { logout } = await import("./utils/firebase");
        await logout();
      } catch(e) {}
    } else {
      const u = usersList.find((usr) => usr.uid === userUid);
      if (u) {
        if (u.uid === "user_it_admin") u.role = UserRole.ADMIN;
        if (u.uid === "user_responder_1") u.role = UserRole.RESPONDER;
        setCurrentUser(u);
        // Automatically switch page tabs corresponding to role to guide reviewers nicely!
        if (u.role === UserRole.ADMIN) {
          setActiveTab("admin");
        } else if (u.role === UserRole.RESPONDER) {
          setActiveTab("responder");
        } else {
          setActiveTab("report");
          setDashboardMode("report");
        }
      }
    }
  };

  // Handler 2: Modify User Roles in admin panel
  const handleUpdateUserRole = (uid: string, newRole: UserRole, agency?: string) => {
    const updated = usersList.map((usr) => {
      if (usr.uid === uid) {
        return { ...usr, role: newRole, agency: agency || "" };
      }
      return usr;
    });
    setUsersList(updated);

    // Sync session user if current
    if (currentUser?.uid === uid) {
      setCurrentUser({ ...currentUser, role: newRole, agency: agency || "" });
    }
  };

  const handleNavigationTabChange = (tab: string) => {
    if (tab === "report") {
      setActiveTab("report");
      setDashboardMode("report");
    } else if (tab === "dashboard") {
      setActiveTab("dashboard");
      setDashboardMode("map");
    } else {
      setActiveTab(tab);
    }
  };

  // Handler 3: Add new user submitted flood report case
  const handleAddReportCase = (newReport: FloodReport) => {
    setReports((prev) => [newReport, ...prev]);
    setDashboardMode("map");
    setActiveTab("dashboard");

    // Fast-trigger automatic notification simulated SMS/LINE alert to matched Sentinel Watch zones
    // Search active users that subscribed to this tambon watchZone
    const matchedSubscribedUsers = usersList.filter((u) => 
      u.watchZones && u.watchZones.some((z) => z.toLowerCase().includes(newReport.tambon.toLowerCase()))
    );

    if (matchedSubscribedUsers.length > 0) {
      setTimeout(() => {
        alert(
          `📢 [SMS / LINE BROADCAST ALERT] : ตรวจพบคดีวิกฤตน้ำป่าระดับสูง ต.${newReport.tambon}! เจ้าหน้าที่สังเกตการณ์ส่งสัญญาณเตือนภัยเร่งด่วน 3 ชม. ไปยังพิกัดประชาชนจำนวน ${matchedSubscribedUsers.length} รายเรียบร้อยแล้ว`
        );
      }, 1200);
    }

    setActiveTab("tracking");
  };

  // Handler 4: Responder Dispatch update case action
  const handleUpdateReportStatus = (
    reportId: string,
    status: ReportStatus,
    assignedAgency: string,
    note: string
  ) => {
    const updated = reports.map((r) => {
      if (r.id === reportId) {
        return {
          ...r,
          status,
          assignedAgency,
          responderNote: note,
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });
    setReports(updated);
  };

  // Handler 5: Custom alert zones subscriptions (Section 3.2.1)
  const handleAddWatchZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempWatchZoneInput || !currentUser) return;

    if (currentUser.watchZones.includes(tempWatchZoneInput)) {
      alert("มีตําบลนี้ในรายการเฝ้าระวังพิเศษอยู่แล้ว");
      return;
    }

    const updatedUser = {
      ...currentUser,
      watchZones: [...currentUser.watchZones, tempWatchZoneInput]
    };

    setCurrentUser(updatedUser);

    // Update usersList list copy too
    const updatedUsersList = usersList.map((u) => {
      if (u.uid === currentUser.uid) {
        return updatedUser;
      }
      return u;
    });
    setUsersList(updatedUsersList);
    setTempWatchZoneInput("");
    alert(`📌 บันทึกตำบลเฝ้าระวังพิเศษ "${tempWatchZoneInput}" เพื่อรับข้อมูล SMS/LINE 3 ชม. ด่วน ล้นตลิ่งคีรีวง ลุล่วงแล้วครับ`);
  };

  const handleRemoveWatchZone = (zone: string) => {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      watchZones: currentUser.watchZones.filter(z => z !== zone)
    };
    setCurrentUser(updatedUser);

    const updatedUsersList = usersList.map((u) => {
      if (u.uid === currentUser.uid) {
        return updatedUser;
      }
      return u;
    });
    setUsersList(updatedUsersList);
  };

  // Handler 6: Toggle API connectors statuses
  const handleToggleAPIStatus = (apiId: string) => {
    const updated = apis.map((a) => {
      if (a.id === apiId) {
        return {
          ...a,
          status: a.status === "connected" ? "disconnected" : "connected",
          lastSyncTime: new Date().toISOString()
        };
      }
      return a;
    });
    setApis(updated as any);
  };

  const getBoldClass = () => {
    return isBoldText ? "font-bold" : "";
  };

  const themeStyle = getThemeStyle(appTheme, isHighContrast);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4 selection:bg-blue-500 font-sans dark">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-center">
            <h2 className="font-bold text-lg text-white">🌊 ศูนย์สารสนเทศเตือนภัยน้ำท่วมนครศรีธรรมราช</h2>
            <p className="text-xs text-blue-100 mt-1">กรุณาเข้าสู่ระบบเพื่อยืนยันตัวตนก่อนเข้าใช้งานระบบเรียลไทม์</p>
          </div>
          <div className="p-4">
            <AuthPage
              onLogin={(user) => {
                setCurrentUser(user);
                logUserAccess(user, "LOGIN", "Web Login Portal");
                if (!usersList.some((usr) => usr.uid === user.uid || usr.displayName === user.displayName)) {
                  setUsersList((prev) => [...prev, user]);
                }
                setActiveTab("dashboard");
              }}
              isDarkMode={true}
              isHighContrast={false}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{ '--font-scale': fontSizeScale / 100 } as React.CSSProperties}
      className={`min-h-screen flex flex-col font-sans transition-all selection:bg-blue-500 selection:text-white overflow-x-hidden w-full max-w-full ${themeStyle.bg} ${themeStyle.text} ${getBoldClass()}`}
    >
      
      {/* Dynamic Header Component */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(true)}
        currentUser={currentUser}
        onSelectUser={handleSelectSimulatedUser}
        mockUsers={usersList}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        fontSizeScale={fontSizeScale}
        onChangeFontSizeScale={setFontSizeScale}
        isHighContrast={isHighContrast}
        onToggleHighContrast={() => setIsHighContrast(!isHighContrast)}
        isBoldText={isBoldText}
        onToggleBoldText={() => setIsBoldText(!isBoldText)}
        activeTab={activeTab}
        onChangeTab={handleNavigationTabChange}
        appTheme={appTheme}
        onChangeAppTheme={setAppTheme}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentUser={currentUser}
        activeTab={activeTab}
        onChangeTab={handleNavigationTabChange}
        appTheme={appTheme}
        isHighContrast={isHighContrast}
      />

      {/* Main Core Content Stage Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 md:py-8 space-y-6 md:space-y-8 overflow-x-hidden">
        
        {/* Render Tab Content based on active state */}
        {(activeTab === "dashboard" || activeTab === "report") && (
          <div className="space-y-6 md:space-y-8">
            {/* Main Section Mode Switcher (Combined Dashboard & Report) - Moved to TOP */}
            <div className={`p-3 sm:p-4 rounded-3xl border shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 transition-all ${
              isHighContrast ? "bg-black border-white" : "bg-gradient-to-r from-blue-50/80 via-white to-slate-50 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-900 border-blue-200/60 dark:border-slate-700"
            }`}>
              <div className="flex items-center gap-2 px-2 text-center sm:text-left">
                <span className="text-sm md:text-base font-extrabold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  📌 เลือกเมนูหลัก: หน้าหลัก & แจ้งเหตุด่วน
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full sm:w-auto min-w-[300px]">
                <button
                  onClick={() => { setDashboardMode("map"); setActiveTab("dashboard"); }}
                  className={`py-3 px-4 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
                    (dashboardMode === "map" && activeTab !== "report")
                      ? isHighContrast ? "bg-white text-black font-black ring-2 ring-white" : "bg-blue-600 text-white shadow-md scale-[1.02]"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <MapPin className="w-4 h-4 shrink-0 text-blue-500" />
                  <span>🗺️ แผนที่สถานการณ์</span>
                </button>
                <button
                  onClick={() => { setDashboardMode("report"); setActiveTab("report"); }}
                  className={`py-3 px-4 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
                    (dashboardMode === "report" || activeTab === "report")
                      ? isHighContrast ? "bg-white text-black font-black ring-2 ring-white" : "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md scale-[1.02] animate-pulse"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <Camera className="w-4 h-4 shrink-0 text-red-500" />
                  <span>🔊 แจ้งเหตุกู้ภัยด่วน</span>
                </button>
              </div>
            </div>

            <FloodPrediction
              amphoes={amphoesList}
              weatherStations={weatherStations}
              thresholdSettings={thresholdSettings}
              isDarkMode={isDarkMode}
              isHighContrast={isHighContrast}
              onSelectAmphoe={setSelectedAmphoe}
              selectedAmphoe={selectedAmphoe}
            />

            {/* Subview 1: Interactive Map Mode */}
            {(dashboardMode === "map" && activeTab !== "report") && (
              <div className="space-y-8">
                {/* Map and Sentinel Watch Setup */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Map Column (Spans 2 on desktop) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-2 select-none">
                  <div className="w-full md:w-auto">
                    <h2 className="text-base md:text-lg font-extrabold flex flex-wrap items-center gap-1.5 leading-snug">
                      <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                      <span>แผนที่สถานการณ์น้ำท่วมจังหวัด และจุดความช่วยเหลือปัจจุบัน (Interactive Flood Map)</span>
                    </h2>
                    <p className="text-xs opacity-75 mt-0.5 leading-relaxed">คลิกพินหรือหัวเมืองย่อยบนแผนผังจำลองเพื่อโหลดรายละเอียดเชิงสืบค้น</p>
                  </div>
                </div>

                <InteractiveMap
                  reports={reports}
                  evacCenters={initialEvacuationCenters}
                  selectedAmphoe={selectedAmphoe}
                  onSelectAmphoe={setSelectedAmphoe}
                  isDarkMode={isDarkMode}
                  isHighContrast={isHighContrast}
                />
              </div>

              {/* Sidebar: Profile Zone Subscriptions or Welcome (Section 3.2.1) */}
              <div className="space-y-4">
                <h3 className="font-bold text-base md:text-lg">🎯 ตั้งค่าแจ้งเตือนภัยน้ำท่วมล่วงหน้า 3 ชั่วโมงประจำอำเภอของคุณ</h3>
                {currentUser ? (
                  <div className={`p-5 rounded-3xl border space-y-4 ${
                    isHighContrast ? "bg-black border-white" : "bg-white dark:bg-slate-800 border-slate-200"
                  }`}>
                    <div className="flex items-center gap-3">
                      <img src={currentUser.avatarUrl} className="w-10 h-10 rounded-full border shadow" referrerPolicy="no-referrer" />
                      <div>
                        <h4 className="font-bold text-sm leading-none">{currentUser.displayName.split(" ")[0]}</h4>
                        <p className="text-[10px] opacity-70 mt-1">{currentUser.phone}</p>
                      </div>
                    </div>

                    <form onSubmit={handleAddWatchZone} className="space-y-2 border-t pt-3 border-slate-100 dark:border-slate-800">
                      <label className="text-[11px] font-bold block opacity-80 mb-1">
                        ➕ ระบุชื่อตำบลเพื่อสมัครรับ SMS/LINE เตือนภัย 3ชม. ด่วน :
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder="เช่น ต.กำโลน หรือ ต.ในเมือง"
                          value={tempWatchZoneInput}
                          onChange={(e) => setTempWatchZoneInput(e.target.value)}
                          className={`flex-1 p-2 rounded-xl text-xs border focus:outline-none ${
                            isHighContrast ? "bg-black text-white border-white" : "bg-slate-50 dark:bg-slate-800 border-slate-200"
                          }`}
                        />
                        <button
                          type="submit"
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow"
                        >
                          บันทึก
                        </button>
                      </div>
                    </form>

                    <div className="space-y-1 pt-2">
                      <span className="text-[10px] font-bold block opacity-70">พื้นที่เฝ้าระวังของคุณปัจจุบัน:</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {currentUser.watchZones.length > 0 ? (
                          currentUser.watchZones.map((z, i) => (
                            <span
                              key={i}
                              className="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5"
                            >
                              ต. {z}
                              <button
                                type="button"
                                onClick={() => handleRemoveWatchZone(z)}
                                className="text-[10px] font-bold text-red-500 hover:text-red-700"
                              >
                                ✕
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-xs opacity-60 italic">ยังไม่ได้ลงทะเบียนพื้นที่เฝ้าระวัง</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`p-5 rounded-3xl border text-xs text-center space-y-4 ${
                    isHighContrast ? "bg-black border-white" : "bg-white dark:bg-slate-800/60 border-slate-200"
                  }`}>
                    <Accessibility className="w-10 h-10 text-blue-500 mx-auto opacity-70 mb-2" />
                    <div>
                      <h4 className="font-bold text-sm">ต้องการรับ SMS / LINE แจ้งเตือนด่วนของตำบล?</h4>
                      <p className="opacity-75 leading-relaxed mt-1.5">
                        ระบบคำนวนประสานงาน SMS เฝ้าระวังพิเศษ 3 ชม. อุปกรณ์เครื่องใช้วิทยุดาวเทียม ต้องการให้ท่านล็อกอินเพื่อระบุข้อมูลสายด่วนสัญญาน
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab("auth")}
                      className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-md text-xs hover:from-blue-700"
                    >
                      🔓 ปลดล็อกเข้าสู่ระบบทีเดียว
                    </button>
                  </div>
                )}
              </div>
            </div>

            <OverviewDashboard
              amphoes={amphoesList}
              weatherStations={weatherStations}
              riverGauges={riverGauges}
              thresholdSettings={thresholdSettings}
              isHighContrast={isHighContrast}
              onSelectAmphoe={setSelectedAmphoe}
              detectedAmphoeId={selectedAmphoe}
              onCheckEvacRights={() => setIsEvacPortalOpen(true)}
            />
              </div>
            )}

            {/* Subview 2: Report Flooding Portal Mode */}
            {(dashboardMode === "report" || activeTab === "report") && (
              <ReportPortal
                currentUser={currentUser}
                onAddReport={handleAddReportCase}
                isDarkMode={isDarkMode}
                isHighContrast={isHighContrast}
              />
            )}
          </div>
        )}

        {/* 2.0 Water Analytics dashboard */}
        {activeTab === "analytics" && (
          <WaterTrackingDashboard
            riverGauges={riverGauges}
            isDarkMode={isDarkMode}
            isHighContrast={isHighContrast}
          />
        )}

        {activeTab === "auth" && (
          <AuthPage
            onLogin={(user) => {
              setCurrentUser(user);
              // Save to list
              if (!usersList.some((usr) => usr.uid === user.uid || usr.displayName === user.displayName)) {
                setUsersList((prev) => [...prev, user]);
              }
              setActiveTab("dashboard");
            }}
            isDarkMode={isDarkMode}
            isHighContrast={isHighContrast}
          />
        )}

        {/* 5.0 Citizens status tracer tracking */}
        {activeTab === "tracking" && (
          <TrackingPortal
            currentUser={currentUser}
            reports={reports}
            isDarkMode={isDarkMode}
            isHighContrast={isHighContrast}
          />
        )}

        {/* 6.0 Responders Action Grid Command */}
        {activeTab === "responder" && (
          <ResponderDashboard
            currentUser={currentUser}
            reports={reports}
            onUpdateReportStatus={handleUpdateReportStatus}
            isDarkMode={isDarkMode}
            isHighContrast={isHighContrast}
          />
        )}

        {/* 7.0 Admin risk threshold configs */}
        {activeTab === "admin" && (
          <AdminConsole
            currentUser={currentUser}
            usersList={usersList}
            onUpdateUserRole={handleUpdateUserRole}
            apisList={apis}
            onToggleAPIStatus={handleToggleAPIStatus}
            thresholdSettings={thresholdSettings}
            onUpdateThresholds={setThresholdSettings}
            isHighContrast={isHighContrast}
            isDarkMode={isDarkMode}
            onAddReport={handleAddReportCase}
          />
        )}
      </main>

      <EvacuationPortalModal 
        isOpen={isEvacPortalOpen} 
        onClose={() => setIsEvacPortalOpen(false)} 
        userPos={{ lat: 8.432, lng: 99.963 }} 
      />

      {/* Dynamic humble global footer */}
      <footer className={`py-6 border-t font-semibold text-xs mt-12 text-center select-none ${
        isHighContrast
          ? "bg-black border-white text-white"
          : "bg-slate-100 dark:bg-slate-900 border-slate-200 text-slate-500"
      }`}>
        <p className="opacity-80">
          © 2026 สำนักงานป้องกันและบรรเทาสาธารณภัย มหาวิทยาลัยนครศรีธรรมราชร่วมสากล
        </p>
        <p className="text-[10px] opacity-65 mt-1 font-normal uppercase">
          Nakhon Si Thammarat Hydro-Meteorological Disaster Alleviation Control Suite (Ver 4.10)
        </p>
      </footer>
    </div>
  );
}
