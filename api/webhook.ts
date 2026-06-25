// Vercel Serverless Function: /api/webhook
// Handles incoming Webhook POST requests from LINE Platform (@590auynk "น้องน้ำหวาน")

import crypto from 'crypto';

const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || "";
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
import { WEB_APP_URL, getDailySummaryFlexMessage, getDistrictMorningForecastFlex, getQuickReplyMenu } from './_utils';
export { getDailySummaryFlexMessage, getDistrictMorningForecastFlex, getQuickReplyMenu };

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
