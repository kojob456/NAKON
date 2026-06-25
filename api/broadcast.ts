// Vercel Serverless Function: /api/broadcast
// Triggers Daily Morning Automated Push to ALL followers of LINE OA (@590auynk "น้องน้ำหวาน")

import { getDailySummaryFlexMessage, getDistrictMorningForecastFlex, getQuickReplyMenu } from './_utils';

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: "Method not allowed. Use GET or POST to broadcast." });
  }

  const queryCron = req.query?.cron;
  const { title = "รายงานสถานการณ์น้ำท่วมประจำวัน", isEmergency = false, placeName = "อำเภอเมืองนครศรีธรรมราช" } = req.body || {};

  try {
    const isMorningDaily = queryCron === "morning_daily" || req.query?.mode === "morning";
    const flexMsg = isMorningDaily 
      ? getDistrictMorningForecastFlex(req.query?.place || placeName)
      : getDailySummaryFlexMessage("ประชาชนชาวนครฯ ทุกท่าน");

    const broadcastMsg = {
      ...flexMsg,
      quickReply: getQuickReplyMenu()
    };

    if (LINE_CHANNEL_ACCESS_TOKEN) {
      const response = await fetch("https://api.line.me/v2/bot/message/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          messages: [broadcastMsg]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`LINE Broadcast API failed: ${errText}`);
      }

      return res.status(200).json({ 
        success: true, 
        mode: isMorningDaily ? "MORNING_DAILY_CRON_0700" : "MANUAL_BROADCAST",
        deliveredCount: "ALL_FOLLOWERS", 
        timestamp: new Date().toISOString() 
      });
    } else {
      return res.status(200).json({ 
        success: true, 
        simulated: true,
        mode: isMorningDaily ? "MORNING_DAILY_CRON_0700" : "MANUAL_BROADCAST",
        message: "จำลองยิงแจ้งเตือนทุกเช้าอัตโนมัติสำเร็จ (ยังไม่ได้ใส่ LINE_CHANNEL_ACCESS_TOKEN ใน Vercel Environment)", 
        payload: broadcastMsg 
      });
    }
  } catch (err: any) {
    console.error("Broadcast Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
