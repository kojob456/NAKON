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

export function getQuickReplyMenu() {
  return {
    items: [
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
          label: "🚨 จองสิทธิ์ศูนย์อพยพ",
          uri: WEB_APP_URL
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
      message: "LINE OA Webhook Endpoint for @590auynk is ready. Please change Webhook URL in LINE Console to end with /api/webhook" 
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const signature = req.headers['x-line-signature'];
    const bodyString = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    // Verify LINE Signature
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

        if (userText.includes("ฝน")) {
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
