// Vercel Serverless Function: /api/webhook
// Handles incoming Webhook POST requests from LINE Platform (@590auynk "น้องน้ำหวาน")

import crypto from 'crypto';

const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || "";
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
const WEB_APP_URL = "https://nakon-seven.vercel.app/";

function getWaterWaveStatusFlex(queryText: string = "ทั่วไป", customTitle?: string) {
  const dateStr = new Date().toLocaleDateString('th-TH', { 
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Bangkok' 
  });
  const timeStr = new Date().toLocaleTimeString('th-TH', { 
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok' 
  });

  let waveLevel = "🟢 ระดับปกติ / ปลอดภัย (สีเขียว)";
  let waveColor = "#059669"; // Green
  let waveBgColor = "#065F46";
  let waveBanner = "🌊 คลื่นน้ำระดับปกติ/ปลอดภัย (สีเขียว) 🌊";
  let waveDesc = "ระดับน้ำในลำคลองต่ำกว่าตลิ่ง กระแสน้ำไหลสงบ ไม่มีคลื่นน้ำป่าหลาก";
  let locationText = "ทั่วเขตเทศบาลนครนครศรีธรรมราช และคลองสายหลัก";
  let timeText = `เวลา ${timeStr} น. (ประจำวันที่ ${dateStr})`;
  let adviceText = "• สถานการณ์ทั่วไปปลอดภัย สามารถใช้ชีวิตประจำวันได้ตามปกติ\n• ติดตามการแจ้งเตือนจากศูนย์บรรเทาภัยอย่างต่อเนื่อง";

  const q = queryText.toLowerCase();

  // 1. ระดับวิกฤต (สีแดง)
  if (
    q.includes("วิกฤต") || q.includes("หนัก") || q.includes("ท่วม") || q.includes("ล้นตลิ่ง") || 
    q.includes("ฝน") || q.includes("เขาหลวง") || q.includes("คลองท่าดี") || q.includes("ลานสะกา") || 
    q.includes("คีรีวง") || q.includes("ปากพนัง") || q.includes("แดง") || q.includes("ด่วน") || q.includes("อพยพ") ||
    q.includes("เมือง") || q.includes("ท่าวัง") || q.includes("ปากนคร") || q.includes("เชียรใหญ่")
  ) {
    waveLevel = "🚨 ระดับวิกฤตคลื่นน้ำหลาก (สีแดง)";
    waveColor = "#DC2626"; // Red
    waveBgColor = "#991B1B";
    waveBanner = "🌊🌊🌊 คลื่นน้ำระดับวิกฤต (สีแดง) 🌊🌊🌊";
    waveDesc = "คลื่นน้ำป่าหลากเชี่ยวแรงจากเทือกเขาหลวง ระดับน้ำคลองท่าดี +4.85 ม. (ล้นตลิ่ง) ฝนสะสม 145.2 มม.";
    
    if (q.includes("ปากพนัง") || q.includes("เชียรใหญ่")) {
      locationText = "อ.ปากพนัง / ลุ่มน้ำปากพนัง (รับมวลน้ำเหนือหลากรวมน้ำทะเลหนุน)";
    } else if (q.includes("ลานสะกา") || q.includes("คีรีวง") || q.includes("เขาหลวง") || q.includes("คลองท่าดี")) {
      locationText = "ต้นน้ำคลองท่าดี (บ้านลานสะกา / คีรีวง) อ.ลานสะกา";
    } else {
      locationText = "คลองท่าดี ไหลบ่าเข้าท่วม เขตเทศบาลนครนครศรีธรรมราช (โซนตัวเมือง)";
    }
    
    timeText = `เวลา ${timeStr} น. (มวลน้ำหลากถึงตัวเมืองใน 2-3 ชั่วโมง)`;
    adviceText = "• ห้ามขับขี่หรือเดินลุยผ่านกระแสน้ำเชี่ยวเด็ดขาด!\n• ยกสิ่งของขึ้นที่สูงพ้นระดับน้ำล้นตลิ่งทันที\n• พร้อมอพยพไปที่ศูนย์พักพิง รร.เทศบาลวัดมเหยงคณ์";
  } 
  // 2. ระดับเฝ้าระวัง (สีส้ม/เหลือง)
  else if (
    q.includes("เตือนภัย") || q.includes("เฝ้าระวัง") || q.includes("เพิ่ม") || q.includes("ทุ่งสง") || 
    q.includes("ฉวาง") || q.includes("ร่อนพิบูลย์") || q.includes("ส้ม") || q.includes("เหลือง") || 
    q.includes("ท่าศาลา") || q.includes("สิชล") || q.includes("ขนอม")
  ) {
    waveLevel = "⚠️ ระดับเฝ้าระวังคลื่นน้ำหลาก (สีส้ม)";
    waveColor = "#EA580C"; // Orange
    waveBgColor = "#C2410C";
    waveBanner = "🌊🌊 คลื่นน้ำระดับเฝ้าระวัง (สีส้ม) 🌊🌊";
    waveDesc = "ระดับน้ำในลำคลองเพิ่มขึ้นอย่างรวดเร็ว (+15 ซม./ชม.) เริ่มมีคลื่นกระแสน้ำไหลแรงบริเวณที่ลุ่มต่ำ";
    
    if (q.includes("ทุ่งสง")) locationText = "ลุ่มน้ำตรัง / เขตเทศบาลเมืองทุ่งสง อ.ทุ่งสง";
    else if (q.includes("ท่าศาลา") || q.includes("สิชล")) locationText = "ลำคลองสายสั้นริมฝั่งทะเล อ.ท่าศาลา / อ.สิชล";
    else locationText = "คลองสายรอง และพื้นที่ลุ่มต่ำริมตลิ่งรอบนอกตัวเมือง";
    
    timeText = `เวลา ${timeStr} น. (คาดการณ์ระดับน้ำเพิ่มขึ้นต่อเนื่อง)`;
    adviceText = "• ติดตามระดับน้ำและกราฟคลื่นน้ำอย่างใกล้ชิดทุก 1 ชั่วโมง\n• เตรียมความพร้อมเก็บของมีค่าและเอกสารสำคัญ";
  }

  return {
    type: "flex",
    altText: `🌊 แจ้งเตือนคลื่นน้ำ: ${waveLevel} - ${locationText}`,
    contents: {
      type: "bubble",
      size: "giga",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: waveBgColor,
        paddingAll: "lg",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: waveBanner, color: "#FFFFFF", size: "xs", weight: "bold", flex: 8 },
              { type: "text", text: "LIVE 🔴", color: "#FEF08A", size: "xxs", weight: "bold", align: "end", flex: 2 }
            ]
          },
          {
            type: "text",
            text: customTitle || `รายงานสถานการณ์คลื่นน้ำ & ระดับน้ำ`,
            color: "#FFFFFF",
            size: "xl",
            weight: "bold",
            margin: "sm",
            wrap: true
          },
          {
            type: "text",
            text: `🕒 ${timeText}`,
            color: "#E2E8F0",
            size: "xxs",
            margin: "xs"
          }
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
            layout: "vertical",
            backgroundColor: "#F8FAFC",
            paddingAll: "md",
            cornerRadius: "lg",
            borderColor: waveColor,
            borderWidth: "semi-bold",
            contents: [
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  { type: "text", text: "📊 ระดับคลื่นน้ำ / ความหนัก:", size: "xs", color: "#64748B", weight: "bold", flex: 4 },
                  { type: "text", text: waveLevel, size: "xs", color: waveColor, weight: "bold", align: "end", flex: 6 }
                ]
              },
              {
                type: "text",
                text: waveDesc,
                size: "xxs",
                color: "#334155",
                margin: "sm",
                wrap: true
              }
            ]
          },
          {
            type: "box",
            layout: "horizontal",
            backgroundColor: "#EFF6FF",
            paddingAll: "md",
            cornerRadius: "md",
            contents: [
              { type: "text", text: "📍 เหตุที่ไหน:", size: "xs", color: "#1D4ED8", weight: "bold", flex: 3 },
              { type: "text", text: locationText, size: "xs", color: "#1E3A8A", weight: "bold", wrap: true, flex: 7 }
            ]
          },
          {
            type: "box",
            layout: "horizontal",
            backgroundColor: "#F1F5F9",
            paddingAll: "md",
            cornerRadius: "md",
            contents: [
              { type: "text", text: "🕒 เวลาเท่าไหร่:", size: "xs", color: "#475569", weight: "bold", flex: 3 },
              { type: "text", text: timeText, size: "xs", color: "#0F172A", weight: "bold", wrap: true, flex: 7 }
            ]
          },
          { type: "separator", margin: "md", color: "#E2E8F0" },
          {
            type: "box",
            layout: "vertical",
            spacing: "xs",
            contents: [
              { type: "text", text: "💡 คำแนะนำการปฏิบัติตน:", size: "xs", color: "#0F172A", weight: "bold" },
              { type: "text", text: adviceText, size: "xxs", color: "#475569", wrap: true }
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
            color: waveColor,
            height: "sm",
            action: {
              type: "uri",
              label: "🔍 กดดูระดับคลื่นน้ำ & กราฟสดบนเว็บ",
              uri: WEB_APP_URL
            }
          },
          {
            type: "button",
            style: "secondary",
            color: "#2563EB",
            height: "sm",
            action: {
              type: "uri",
              label: "🚨 แจ้งเหตุน้ำท่วม/คลื่นน้ำเชี่ยว (ถ่ายรูป)",
              uri: `${WEB_APP_URL}?mode=report&source=line`
            }
          },
          {
            type: "button",
            style: "secondary",
            color: "#10B981",
            height: "sm",
            action: {
              type: "uri",
              label: "🧭 นำทางไปศูนย์อพยพปลอดภัย",
              uri: "https://www.google.com/maps/dir/?api=1&destination=8.442,99.962&travelmode=driving"
            }
          }
        ]
      }
    }
  };
}

function getDailySummaryFlexMessage(userName: string = "ประชาชน") {
  return getWaterWaveStatusFlex("วิกฤต ฝนตกหนัก คลองท่าดี", `🚨 รายงานสถานการณ์คลื่นน้ำ & น้ำท่วมนครฯ`);
}

function getDistrictMorningForecastFlex(placeName = "อำเภอเมืองนครศรีธรรมราช") {
  return getWaterWaveStatusFlex(placeName, `🌅 พยากรณ์คลื่นน้ำ & โอกาสน้ำท่วม: ${placeName}`);
}

function getQuickReplyMenu() {
  return {
    items: [
      {
        type: "action",
        action: {
          type: "uri",
          label: "🚨 แจ้งเหตุน้ำท่วมด่วน",
          uri: `${WEB_APP_URL}?mode=report&source=line`
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

    for (const event of events) {
      if (event.type === 'message') {
        const replyToken = event.replyToken;
        const msgType = event.message?.type;
        const userText = (event.message?.text || "").trim();

        let replyMessages: any[] = [];

        if (msgType === 'location') {
          const { address = "จ.นครศรีธรรมราช", latitude, longitude } = event.message;
          let districtFlex = getDistrictMorningForecastFlex(address);
          replyMessages.push({
            type: "text",
            text: `📍 ได้รับพิกัด GPS (${latitude || ""}, ${longitude || ""}) ของท่านแล้ว! กรุณากดปุ่มสีแดง 🚨 "แจ้งเหตุน้ำท่วมด่วน" ด้านล่าง เพื่อแนบรูปถ่ายสถานที่จริงส่งขึ้นฐานข้อมูล Admin ทันทีครับ`,
            quickReply: getQuickReplyMenu()
          });
          replyMessages.push({
            ...districtFlex,
            quickReply: getQuickReplyMenu()
          });
        } else if (msgType === 'text') {
          if (userText.includes("แจ้งเหตุ") || userText.includes("แจ้งน้ำท่วม") || userText.includes("ถ่ายรูป") || userText.includes("ช่วยด้วย") || userText.includes("รายงาน")) {
            replyMessages.push({
              type: "text",
              text: "🚨 ระบบรับแจ้งเหตุน้ำท่วมฉุกเฉิน (เรียลไทม์)\nกรุณากดปุ่มสีแดงด้านล่าง **[ 🚨 แจ้งเหตุน้ำท่วมด่วน ]** เพื่อเปิดกล้องมือถือถ่ายรูปหลักฐาน และแชร์พิกัด GPS อัตโนมัติ ข้อมูลจะถูกส่งขึ้นระบบ Admin ในทันทีครับ!",
              quickReply: getQuickReplyMenu()
            });
          } else if (userText.includes("ขอบคุณ") || userText.includes("ดีมาก") || userText.includes("เจ๋ง")) {
            replyMessages.push({
              type: "text",
              text: "ด้วยความยินดีครับ! น้องน้ำหวานและทีมศูนย์บรรเทาภัยเทศบาลนครนครศรีธรรมราช พร้อมเคียงข้างและแจ้งเตือนคุณตลอด 24 ชั่วโมงครับ ขอให้ปลอดภัยนะครับ ❤️🌊",
              quickReply: getQuickReplyMenu()
            });
          } else if (userText.includes("วิธีเสิร์ช") || userText.includes("ค้นหา")) {
            replyMessages.push({
              type: "text",
              text: "💡 วิธีเช็คโอกาสน้ำท่วมรายอำเภอ:\nให้พิมพ์คำว่า **เช็ค ตามด้วยชื่ออำเภอหรือสถานที่** ได้เลยครับ เช่น:\n👉 เช็ค ปากพนัง\n👉 เช็ค ทุ่งสง\n👉 เช็ค ลานสะกา\n👉 เช็ค คีรีวง\n\nระบบจะส่งการ์ดพยากรณ์น้ำท่วมของพื้นที่นั้นๆ ให้ทันทีครับ!",
              quickReply: getQuickReplyMenu()
            });
          } else {
            const amphoeKeywords = ["เมือง", "ใกล้ๆเมือง", "ปากพนัง", "ลานสะกา", "ลานสกา", "คีรีวง", "ทุ่งสง", "ท่าศาลา", "สิชล", "ชะอวด", "ร่อนพิบูลย์", "หัวไทร", "ทุ่งใหญ่", "นาบอน", "ขนอม", "พรหมคีรี", "เชียรใหญ่", "บางขัน", "ถ้ำพรรณรา", "จุฬาภรณ์", "พระพรหม", "นบพิตำ", "ช้างกลาง", "เฉลิมพระเกียรติ", "เขาหลวง", "คลองท่าดี", "ท่าวัง", "ปากนคร", "ท่าซัก", "เช็ค", "ดู", "ถาม", "อำเภอ", "ที่", "ท่วม", "หนัก", "วิกฤต", "เตือนภัย", "เฝ้าระวัง", "ปกติ", "ปลอดภัย", "คลื่น", "ระดับ", "สถานการณ์", "ฝน", "น้ำ"];
            const isPlaceQuery = amphoeKeywords.some(kw => userText.includes(kw));

            if (isPlaceQuery) {
              if (userText.includes("ฝน") && !userText.includes("อำเภอ")) {
                replyMessages.push({
                  ...getWaterWaveStatusFlex(userText, "🌧️ รายงานคลื่นน้ำ & ฝนเขาหลวง"),
                  quickReply: getQuickReplyMenu()
                });
              } else if (userText.includes("คลองท่าดี") && !userText.includes("อำเภอ") && !userText.includes("เช็ค")) {
                replyMessages.push({
                  ...getWaterWaveStatusFlex(userText, "🌊 รายงานคลื่นน้ำ & ระดับน้ำคลองท่าดี"),
                  quickReply: getQuickReplyMenu()
                });
              } else if (userText.includes("อพยพ") || userText.includes("พักพิง")) {
                replyMessages.push({
                  ...getWaterWaveStatusFlex("อพยพด่วน วิกฤต", "🏃 แจ้งเตือนคลื่นน้ำ & ศูนย์พักพิงอพยพ"),
                  quickReply: getQuickReplyMenu()
                });
              } else {
                const placeMatch = userText.replace(/^เช็ค/, "").replace(/^ดู/, "").replace(/^ถาม/, "").trim();
                const queryPlace = placeMatch || userText;
                replyMessages.push({
                  ...getWaterWaveStatusFlex(queryPlace, `📍 รายงานคลื่นน้ำพื้นที่: ${queryPlace}`),
                  quickReply: getQuickReplyMenu()
                });
              }
            } else {
              replyMessages.push({
                ...getWaterWaveStatusFlex(userText, "🌊 รายงานสถานการณ์คลื่นน้ำ & น้ำท่วมเรียลไทม์"),
                quickReply: getQuickReplyMenu()
              });
            }
          }
        } else {
          replyMessages.push({
            type: "text",
            text: "📸 ได้รับไฟล์ข้อมูลเบื้องต้นแล้ว! กรุณากดปุ่มสีแดงด้านล่าง **[ 🚨 แจ้งเหตุน้ำท่วมด่วน ]** เพื่อยืนยันพิกัด GPS เรียลไทม์ และส่งรูปภาพขึ้นสู่ฐานข้อมูล Admin เว็บหลักครับ!",
            quickReply: getQuickReplyMenu()
          });
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
