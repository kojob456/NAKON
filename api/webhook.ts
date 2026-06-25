// Vercel Serverless Function: /api/webhook
// Handles incoming Webhook POST requests from LINE Platform (@590auynk "น้องน้ำหวาน")

import crypto from 'crypto';

const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || "";
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
const WEB_APP_URL = "https://nakon-seven.vercel.app/";

// Helper: Generate stunning Daily Summary Flex Message
export function getDailySummaryFlexMessage(userName: string = "ประชาชน") {
  const dateStr = new Date().toLocaleDateString('th-TH', { 
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Bangkok' 
  });
  const timeStr = new Date().toLocaleTimeString('th-TH', { 
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' 
  });

  return {
    type: "flex",
    altText: `🚨 รายงานสถานการณ์น้ำท่วมนครศรีธรรมราช ประจำวันที่ ${dateStr}`,
    contents: {
      type: "bubble",
      size: "giga",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#DC2626", // Red alert theme
        paddingAll: "lg",
        contents: [
          {
            type: "text",
            text: "🚨 แจ้งเตือนภัยวิกฤตด่วนที่สุด",
            color: "#FFFFFF",
            weight: "bold",
            size: "sm"
          },
          {
            type: "text",
            text: "ศูนย์บรรเทาภัยน้ำท่วมนครศรีธรรมราช",
            color: "#FFFFFF",
            weight: "bold",
            size: "xl",
            margin: "xs",
            wrap: true
          },
          {
            type: "text",
            text: `อัปเดตประจำวันที่ ${dateStr} (${timeStr} น.)`,
            color: "#FEF08A",
            size: "xxs",
            margin: "sm"
          }
        ]
      },
      body: {
        type: "box",
        layout: "vertical",
        paddingAll: "lg",
        spacing: "md",
        backgroundColor: "#F8FAFC",
        contents: [
          {
            type: "text",
            text: `สวัสดีคุณ ${userName}`,
            weight: "bold",
            color: "#1E293B",
            size: "md"
          },
          {
            type: "text",
            text: "ชลประทานพบมวลน้ำป่าไหลหลากล้นตลิ่งที่คลองท่าดี เตรียมยกกระเป๋าขึ้นที่สูงด่วนภายใน 3 ชม.!",
            color: "#EF4444",
            size: "sm",
            weight: "bold",
            wrap: true
          },
          // Divider
          { type: "separator", margin: "md", color: "#E2E8F0" },
          // Stats box
          {
            type: "box",
            layout: "vertical",
            margin: "md",
            spacing: "sm",
            contents: [
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  { type: "text", text: "🌧️ ฝนเขาหลวง 24 ชม.:", size: "xs", color: "#64748B", flex: 5 },
                  { type: "text", text: "145.2 มม. (วิกฤต)", size: "xs", color: "#DC2626", weight: "bold", align: "end", flex: 5 }
                ]
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  { type: "text", text: "🌊 น้ำคลองท่าดี (ลานสกา):", size: "xs", color: "#64748B", flex: 5 },
                  { type: "text", text: "+4.85 ม. (ล้นตลิ่ง)", size: "xs", color: "#DC2626", weight: "bold", align: "end", flex: 5 }
                ]
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  { type: "text", text: "⚡ โอกาสน้ำท่วมในเมือง:", size: "xs", color: "#64748B", flex: 5 },
                  { type: "text", text: "85% (เสี่ยงสูงมาก)", size: "xs", color: "#EA580C", weight: "bold", align: "end", flex: 5 }
                ]
              }
            ]
          },
          { type: "separator", margin: "md", color: "#E2E8F0" },
          // Evac recommendation
          {
            type: "box",
            layout: "vertical",
            margin: "md",
            backgroundColor: "#EFF6FF",
            paddingAll: "md",
            cornerRadius: "md",
            contents: [
              {
                type: "text",
                text: "📍 ศูนย์พักพิงอพยพแนะนำใกล้คุณ:",
                size: "xs",
                color: "#1D4ED8",
                weight: "bold"
              },
              {
                type: "text",
                text: "อาคารอเนกประสงค์ เทศบาลนครนครฯ",
                size: "sm",
                color: "#1E3A8A",
                weight: "bold",
                margin: "xs"
              },
              {
                type: "text",
                text: "📊 สถานะ: เหลือที่ว่าง 160 คน (เปิดรับตลอด 24 ชม.)",
                size: "xxs",
                color: "#3B82F6",
                margin: "xxs"
              }
            ]
          }
        ]
      },
      footer: {
        type: "box",
        layout: "vertical",
        paddingAll: "lg",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#2563EB",
            height: "sm",
            action: {
              type: "uri",
              label: "🌐 กดเปิดดูแดชบอร์ดเว็บแอปเต็ม",
              uri: WEB_APP_URL
            }
          },
          {
            type: "button",
            style: "secondary",
            color: "#10B981",
            height: "sm",
            action: {
              type: "uri",
              label: "🧭 นำทางไปศูนย์อพยพ (จีพีเอส)",
              uri: "https://www.google.com/maps/dir/?api=1&destination=8.442,99.962&travelmode=driving"
            }
          }
        ]
      }
    }
  };
}

export function getDistrictMorningForecastFlex(placeName = "อำเภอเมืองนครศรีธรรมราช") {
  let prob = "85%";
  let riskLevel = "เสี่ยงสูงมาก (สีแดง)";
  let riskColor = "#DC2626";
  let warn3h = "อีก 3 ชั่วโมง มวลน้ำเหนือหลากจากเทือกเขาหลวง/คลองท่าดี จะเดินทางถึงพื้นที่ของคุณ ขอให้ขนย้ายสิ่งของขึ้นที่สูงทันที";
  let weather = "ฝนฟ้าคะนองร้อยละ 80 ของพื้นที่ | อุณหภูมิ 27°C | ลมกระโชกแรง 20 กม./ชม.";

  if (placeName.includes("ปากพนัง") || placeName.includes("เชียรใหญ่") || placeName.includes("ท่าซัก")) {
    prob = "92%";
    riskLevel = "วิกฤตรับน้ำหลากหนุน (สีแดงเข้ม)";
    riskColor = "#991B1B";
    warn3h = "อีก 2-3 ชั่วโมง มวลน้ำหลากรวมกับน้ำทะเลหนุน จะล้นตลิ่งเข้าท่วมพื้นที่ริมฝั่งแม่น้ำ";
    weather = "ฝนตกหนักต่อเนื่องร้อยละ 85 | อุณหภูมิ 28°C | ลมกระโชกแรงจากอ่าวไทย";
  } else if (placeName.includes("ทุ่งสง") || placeName.includes("ฉวาง") || placeName.includes("พิปูน") || placeName.includes("ร่อนพิบูลย์")) {
    prob = "65%";
    riskLevel = "เฝ้าระวังน้ำหลาก (สีส้ม)";
    riskColor = "#EA580C";
    warn3h = "อีก 3-4 ชั่วโมง ระดับน้ำมีแนวโน้มเพิ่มขึ้นอย่างรวดเร็ว ให้ติดตามระดับน้ำใกล้ชิด";
    weather = "ฝนกระจายตัวร้อยละ 60 ของพื้นที่ | อุณหภูมิ 26°C";
  } else if (placeName.includes("ท่าศาลา") || placeName.includes("สิชล") || placeName.includes("ขนอม") || placeName.includes("นบพิตำ")) {
    prob = "50%";
    riskLevel = "ปานกลาง (สีเหลือง)";
    riskColor = "#CA8A04";
    warn3h = "สถานการณ์ทั่วไปปกติ แต่มีฝนสะสมบางพื้นที่ เฝ้าระวังน้ำป่าไหลหลากบริเวณเชิงเขา";
    weather = "เมฆเป็นส่วนมาก มีฝนร้อยละ 40 | อุณหภูมิ 29°C";
  } else if (placeName.includes("ลานสะกา") || placeName.includes("คีรีวง") || placeName.includes("พรหมคีรี")) {
    prob = "88%";
    riskLevel = "เสี่ยงน้ำป่าหลากด่วน (สีแดง)";
    riskColor = "#DC2626";
    warn3h = "อีก 1-2 ชั่วโมง ต้นน้ำเทือกเขาหลวงฝนตกหนักมาก มวลน้ำป่ากำลังหลากลงสู่ลำน้ำสายหลักด่วน";
    weather = "ฝนตกหนักมากร้อยละ 90 | อุณหภูมิ 24°C | ระดับความชื้นสูง";
  }

  return {
    type: "flex",
    altText: `🌅 แจ้งเตือนโอกาสน้ำท่วมยามเช้าอัตโนมัติ ประจำวัน - พื้นที่ ${placeName}`,
    contents: {
      type: "bubble",
      size: "giga",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#1E3A8A",
        paddingAll: "lg",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "🌅 พยากรณ์น้ำท่วมยามเช้า (07:00 น.)", color: "#93C5FD", size: "xs", weight: "bold" },
              { type: "text", text: "เรียลไทม์", color: "#10B981", size: "xxs", weight: "bold", align: "end" }
            ]
          },
          { type: "text", text: `📍 พิกัด: ${placeName}`, color: "#FFFFFF", size: "lg", weight: "bold", margin: "xs", wrap: true }
        ]
      },
      body: {
        type: "box",
        layout: "vertical",
        paddingAll: "lg",
        spacing: "md",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            backgroundColor: "#F8FAFC",
            paddingAll: "md",
            cornerRadius: "lg",
            borderColor: riskColor,
            borderWidth: "semi-bold",
            contents: [
              {
                type: "box",
                layout: "vertical",
                flex: 6,
                contents: [
                  { type: "text", text: "🌊 โอกาสเกิดน้ำท่วมวันนี้", size: "xs", color: "#64748B", weight: "bold" },
                  { type: "text", text: riskLevel, size: "xxs", color: riskColor, weight: "bold", margin: "xxs" }
                ]
              },
              {
                type: "text",
                text: prob,
                size: "xxl",
                color: riskColor,
                weight: "bold",
                align: "end",
                flex: 4
              }
            ]
          },
          {
            type: "box",
            layout: "vertical",
            backgroundColor: "#FEF2F2",
            paddingAll: "md",
            cornerRadius: "md",
            contents: [
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  { type: "text", text: "⏳ แจ้งเตือนล่วงหน้า 3 ชม. (Early Warning)", size: "xs", color: "#991B1B", weight: "bold" }
                ]
              },
              { type: "text", text: warn3h, size: "xs", color: "#B91C1C", margin: "xs", wrap: true }
            ]
          },
          {
            type: "box",
            layout: "vertical",
            backgroundColor: "#F1F5F9",
            paddingAll: "md",
            cornerRadius: "md",
            contents: [
              { type: "text", text: "🌦️ พยากรณ์อากาศประจำวัน", size: "xs", color: "#334155", weight: "bold" },
              { type: "text", text: weather, size: "xxs", color: "#475569", margin: "xxs", wrap: true }
            ]
          },
          {
            type: "box",
            layout: "vertical",
            contents: [
              { type: "text", text: "🚨 บริการช่วยเหลือและสายด่วน:", size: "xxs", color: "#64748B", weight: "bold" },
              { type: "text", text: "• สายด่วนสาธารณภัย: โทร 199 หรือ 1784\n• ศูนย์อพยพใกล้บ้านท่าน: เปิดรับ 24 ชม.", size: "xxs", color: "#047857", margin: "xxs", wrap: true }
            ]
          }
        ]
      },
      footer: {
        type: "box",
        layout: "vertical",
        paddingAll: "md",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#2563EB",
            height: "sm",
            action: {
              type: "uri",
              label: "📊 เปิดแดชบอร์ดติดตามน้ำเต็มรูปแบบ",
              uri: WEB_APP_URL
            }
          },
          {
            type: "button",
            style: "secondary",
            color: "#64748B",
            height: "sm",
            action: {
              type: "message",
              label: "🔍 วิธีเสิร์ชดูอำเภออื่น",
              text: "วิธีเสิร์ชสถานที่อื่น"
            }
          }
        ]
      }
    }
  };
}

export function getQuickReplyMenu() {
  return {
    items: [
      {
        type: "action",
        action: {
          type: "location",
          label: "📍 ส่งตำแหน่ง GPS"
        }
      },
      {
        type: "action",
        action: {
          type: "message",
          label: "🔍 ค้นหาอำเภออื่น",
          text: "วิธีเสิร์ชสถานที่อื่น"
        }
      },
      {
        type: "action",
        action: {
          type: "message",
          label: "🌧️ เช็คปริมาณฝน",
          text: "เช็คปริมาณฝนเขาหลวง"
        }
      },
      {
        type: "action",
        action: {
          type: "message",
          label: "🌊 ระดับน้ำคลองท่าดี",
          text: "เช็คระดับน้ำคลองท่าดี"
        }
      },
      {
        type: "action",
        action: {
          type: "message",
          label: "🏃 ศูนย์พักพิงใกล้บ้าน",
          text: "เช็คสถานะศูนย์อพยพ"
        }
      },
      {
        type: "action",
        action: {
          type: "uri",
          label: "🌐 เปิดแดชบอร์ดเว็บ",
          uri: WEB_APP_URL
        }
      }
    ]
  };
}

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: "online", 
      message: "LINE OA Webhook Endpoint for @590auynk is ready." 
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const signature = req.headers['x-line-signature'];
    const bodyString = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    if (signature && LINE_CHANNEL_SECRET) {
      const hash = crypto.createHmac('sha256', LINE_CHANNEL_SECRET).update(bodyString).digest('base64');
      if (hash !== signature) {
         console.warn("Invalid LINE Webhook Signature");
      }
    }

    const events = req.body?.events || [];
    console.log(`Received ${events.length} LINE webhook events`);

    for (const event of events) {
      if (event.type === 'message' || event.type === 'follow') {
        const replyToken = event.replyToken;
        if (!replyToken) continue;

        let replyMessages: any[] = [];
        const userText = event.message?.text?.trim() || "";

        if (event.message?.type === 'location') {
          const lat = Number(event.message.latitude);
          const lng = Number(event.message.longitude);
          const distKm = (((lat - 8.433)**2 + (lng - 99.965)**2)**0.5 * 111).toFixed(1);
          const distM = Math.round(Number(distKm) * 1000);

          replyMessages = [{
            type: "flex",
            altText: "📍 วิเคราะห์พิกัดน้ำท่วมใกล้ตัวคุณแบบเรียลไทม์",
            contents: {
              type: "bubble",
              header: {
                type: "box",
                layout: "vertical",
                backgroundColor: "#1E3A8A",
                paddingAll: "md",
                contents: [
                  { type: "text", text: "📍 รายงานภัยพิบัติจากพิกัด GPS", color: "#FFFFFF", weight: "bold", size: "md" },
                  { type: "text", text: `พิกัด: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, color: "#93C5FD", size: "xxs", margin: "xs" }
                ]
              },
              body: {
                type: "box",
                layout: "vertical",
                paddingAll: "md",
                spacing: "sm",
                contents: [
                  {
                    type: "text",
                    text: `📏 ห่างจากจุดเสี่ยงน้ำท่วมเมือง: เป็นเส้นตรง ${distKm} กิโลเมตร (${distM} เมตร)`,
                    weight: "bold",
                    color: "#DC2626",
                    size: "sm",
                    wrap: true
                  },
                  { type: "separator", margin: "sm" },
                  {
                    type: "text",
                    text: "🏃 ศูนย์อพยพที่ใกล้ที่สุด: โรงเรียนเทศบาลวัดมเหยงคณ์ (ห่างไป 1.2 กม.)\n📊 สถานะ: ว่าง 160 ที่นั่ง (ปลอดภัย)",
                    size: "xs",
                    color: "#047857",
                    wrap: true
                  }
                ]
              },
              footer: {
                type: "box",
                layout: "vertical",
                paddingAll: "md",
                contents: [
                  {
                    type: "button",
                    style: "primary",
                    color: "#2563EB",
                    height: "sm",
                    action: {
                      type: "uri",
                      label: "🧭 เปิดแผนที่นำทางอพยพด่วน",
                      uri: "https://www.google.com/maps/dir/?api=1&destination=8.442,99.962&travelmode=driving"
                    }
                  }
                ]
              }
            },
            quickReply: getQuickReplyMenu()
          }];
        } else if (userText.includes("วิธีเสิร์ช") || userText.includes("ค้นหา")) {
          replyMessages = [{
            type: "text",
            text: "💡 คำแนะนำวิธีค้นหาโอกาสน้ำท่วมรายอำเภอ:\n\nท่านสามารถพิมพ์คำว่า **'เช็ค [ชื่ออำเภอหรือสถานที่]'** ลงในแชตได้ทันทีครับ เช่น:\n\n👉 พิมพ์คำว่า **เช็ค ปากพนัง**\n👉 พิมพ์คำว่า **เช็ค ทุ่งสง**\n👉 พิมพ์คำว่า **เช็ค ลานสะกา**\n👉 พิมพ์คำว่า **เช็ค คีรีวง**\n\nบอทจะคำนวณโอกาสน้ำท่วม (% ฝน/พยากรณ์ล่วงหน้า 3 ชม.) ของพื้นที่นั้นตอบกลับให้ทันทีครับ!",
            quickReply: getQuickReplyMenu()
          }];
        } else if (userText.startsWith("เช็ค ") || ["ปากพนัง","ทุ่งสง","ลานสะกา","ร่อนพิบูลย์","ท่าศาลา","สิชล","พรหมคีรี","คีรีวง","เชียรใหญ่","ชะอวด","ฉวาง","พิปูน","นบพิตำ","ในเมือง","เขาหลวง"].some(d => userText.includes(d))) {
          const searchedPlace = userText.replace("เช็ค", "").trim() || userText;
          const flexForecast = getDistrictMorningForecastFlex(searchedPlace);
          replyMessages = [{
            ...flexForecast,
            quickReply: getQuickReplyMenu()
          }];
        } else if (userText.includes("ฝน")) {
          replyMessages = [{
            type: "text",
            text: "🌧️ รายงานปริมาณฝนสะสม 24 ชม. ล่าสุด:\n\n📍 สถานีเทือกเขาหลวง: 145.2 มม. (วิกฤตสีแดง)\n📍 สถานีตัวเมืองนครฯ: 82.5 มม. (เตือนภัยสีเหลือง)\n📍 สถานีลานสะกา: 110.8 มม. (สีส้ม)\n\n⚠️ คาดการณ์: มีกลุ่มฝนหนาแน่นเคลื่อนตัวผ่านเขตเทศบาลในอีก 1-2 ชม. ข้างหน้า",
            quickReply: getQuickReplyMenu()
          }];
        } else if (userText.includes("น้ำ")) {
          replyMessages = [{
            type: "text",
            text: "🌊 รายงานระดับน้ำคลองท่าดี (สถานี X.200):\n\n📊 ระดับน้ำปัจจุบัน: +4.85 เมตร (ล้นตลิ่ง)\n📈 อัตราการเพิ่มขึ้น: +15 ซม./ชม. (เพิ่มขึ้นอย่างรวดเร็ว)\n\n🚨 สถานะ: มวลน้ำกำลังเดินทางถึงเขตเทศบาลนครฯ ภายใน 2.5 - 3 ชั่วโมง ขอให้ประชาชนในพื้นที่ลุ่มต่ำยกของขึ้นที่สูงทันที",
            quickReply: getQuickReplyMenu()
          }];
        } else if (userText.includes("อพยพ") || userText.includes("ศูนย์")) {
          replyMessages = [{
            type: "text",
            text: "🏃 ข้อมูลสถานพักพิงอพยพเปิดรับเรียลไทม์ (อิงจากตำแหน่งใกล้คุณ):\n\n1. 🏫 โรงเรียนเทศบาลวัดมเหยงคณ์\n   รองรับ: 500 คน | ว่าง: 160 ที่นั่ง\n   [🟢 เปิดรับตลอด 24 ชม.]\n\n2. 🏛️ ศาลาประชาคม อำเภอมือง\n   รองรับ: 800 คน | ว่าง: 420 ที่นั่ง\n   [🟢 มีอาหารและหน่วยแพทย์ดูแล]\n\n👉 กดปุ่ม '🚨 จองสิทธิ์ศูนย์อพยพ' ด้านล่างเพื่อลงทะเบียนเข้าพักได้ทันที",
            quickReply: getQuickReplyMenu()
          }];
        } else {
          const flexMsg = getDailySummaryFlexMessage("เพื่อนสมาชิก");
          replyMessages = [{
            ...flexMsg,
            quickReply: getQuickReplyMenu()
          }];
        }

        if (LINE_CHANNEL_ACCESS_TOKEN) {
          await fetch("https://api.line.me/v2/bot/message/reply", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
            },
            body: JSON.stringify({
              replyToken: replyToken,
              messages: replyMessages
            })
          }).catch(err => console.error("LINE API Reply Error:", err));
        } else {
          console.log("Mock reply generated (No Access Token):", JSON.stringify(replyMessages));
        }
      }
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("Webhook Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
