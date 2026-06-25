// Vercel Serverless Function: /api/broadcast
// Triggers Daily Broadcast Push to ALL followers of LINE OA (@590auynk "น้องน้ำหวาน")

import { getDailySummaryFlexMessage } from './webhook';

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || "BexUjB5P0eLKE6hQfKypwO8159pKbKSAICWPz5ntGiNTTInrVwfDmzGh3YbVw7fEKWu11dezORP/DKKebTJEAMaF/9UOTpdnFj5MKG89KMVvsxqcZ7PT790Rj6IdwYvRjqCkHHiZ0QzUE5eHxWeFmQdB04t89/1O/w1cDnyilFU=";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed. Use POST to broadcast." });
  }

  const { title = "รายงานสถานการณ์น้ำท่วมประจำวัน", isEmergency = false } = req.body || {};

  try {
    const flexMsg = getDailySummaryFlexMessage("ประชาชนชาวนครฯ ทุกท่าน");

    if (LINE_CHANNEL_ACCESS_TOKEN && LINE_CHANNEL_ACCESS_TOKEN !== "YOUR_LINE_CHANNEL_ACCESS_TOKEN_HERE") {
      const response = await fetch("https://api.line.me/v2/bot/message/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          messages: [flexMsg]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`LINE Broadcast API failed: ${errText}`);
      }

      return res.status(200).json({ 
        success: true, 
        deliveredCount: "ALL_FOLLOWERS", 
        timestamp: new Date().toISOString() 
      });
    } else {
      // Simulation mode for local/preview
      return res.status(200).json({ 
        success: true, 
        simulated: true,
        message: "จำลองยิงบรอดแคสต์สำเร็จ (ยังไม่ได้ใส่ LINE_CHANNEL_ACCESS_TOKEN ใน .env)", 
        payload: flexMsg 
      });
    }
  } catch (err: any) {
    console.error("Broadcast Error:", err);
    return res.status(500).json({ error: err.message });
  }
}
