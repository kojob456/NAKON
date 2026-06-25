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

        const flexMsg = getDailySummaryFlexMessage("เพื่อนสมาชิก");

        if (LINE_CHANNEL_ACCESS_TOKEN) {
          await fetch("https://api.line.me/v2/bot/message/reply", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
            },
            body: JSON.stringify({
              replyToken: replyToken,
              messages: [flexMsg]
            })
          }).catch(err => console.error("LINE API Reply Error:", err));
        } else {
          console.log("Mock reply generated (No Access Token):", JSON.stringify(flexMsg));
        }
      }
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("Webhook Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
