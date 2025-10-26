// src/scheduler/scheduler.js
require('dotenv').config(); // ต้องเรียกใช้ dotenv เพื่อเข้าถึงตัวแปรใน .env

// 🚨 ตัวแปรสถานะ: ใช้เพื่อป้องกันการส่งข้อความซ้ำหลายครั้งในนาทีเดียวกัน
let lastSentMinute = -1;

// ----------------------------------------------------------------
// 1. ฟังก์ชันหลักสำหรับส่ง DM
// ----------------------------------------------------------------
function sendScheduledDM(client, targetUserId, message) {
    client.users.fetch(targetUserId)
        .then(user => {
            user.send(message)
                .then(() => console.log(`✅ [Scheduler] ส่ง DM ถึง ${user.tag} สำเร็จแล้ว`))
                .catch(error => console.error(`❌ [Scheduler] ไม่สามารถส่ง DM ถึง ${user.tag} ได้:`, error));
        })
        .catch(error => console.error(`❌ [Scheduler] ไม่พบ User ID ที่กำหนด (${targetUserId}):`, error));
}


// ----------------------------------------------------------------
// 2. ฟังก์ชันเริ่มต้น Scheduler
// ----------------------------------------------------------------
module.exports.startScheduler = (client) => {
    // โหลดตัวแปร env 
    const TARGET_USER_IDS = [
        process.env.TARGET_USER_ID1,
        process.env.TARGET_USER_ID2,
        process.env.TARGET_USER_ID3,
        process.env.TARGET_USER_ID4,
        process.env.TARGET_USER_ID5,
    ]
    // ⭐️ เพิ่มการทำความสะอาด ID: ลบ quotes และช่องว่างที่ไม่ต้องการ
    .map(id => {
        if (!id) return null;
        return id.toString().replaceAll("'", "").replaceAll('"', '').trim();
    })
    // กรองค่าที่ไม่ใช่ ID ที่ถูกต้องออกทั้งหมด
    .filter(id => id && id.length > 0);

    const TIME_TO_CHECK = '21:08'; // เวลาที่ตั้งไว้ (HH:MM)
    const INTERVAL_MS = 30000;      // ตรวจสอบทุก 30 วินาที
    
    if (TARGET_USER_IDS.length === 0) {
        console.warn('⚠️ [Scheduler] ไม่พบ TARGET_USER_ID ที่ถูกต้องในไฟล์ .env จึงไม่เริ่ม Scheduler');
        return;
    }

    console.log(`⏱️ [Scheduler] เริ่มตรวจสอบเวลาทุกๆ ${INTERVAL_MS / 1000} วินาที (${TARGET_USER_IDS.length} ผู้ใช้)...`);

    // เริ่ม Scheduler
    setInterval(() => {
        const now = new Date();
        
        // ดึงเวลาปัจจุบันใน Time Zone ของไทย
        const currentTime = now.toLocaleTimeString('th-TH', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'Asia/Bangkok' // รับประกันว่าเป็นเวลาไทย (UTC+7)
        });
        
        const currentMinute = now.getMinutes(); 

        if (currentTime === TIME_TO_CHECK) {
            
            // ⭐️ ตรวจสอบสถานะ: ถ้านาทีปัจจุบันไม่ตรงกับนาทีล่าสุดที่ส่งไป (lastSentMinute)
            if (currentMinute !== lastSentMinute) {
                
                const message = `🚨 เทสระบบแจ้งเตือนกะดึก! ตอนนี้คือ ${TIME_TO_CHECK} น. แล้ว`;
                
                // วนลูปเพื่อส่ง DM ทีละคน
                TARGET_USER_IDS.forEach(userId => {
                    sendScheduledDM(client, userId, message);
                });
                
                // บันทึกนาทีที่ส่งสำเร็จเพื่อป้องกันการส่งซ้ำ
                lastSentMinute = currentMinute; 
                console.log(`✉️ [Scheduler] ส่งข้อความแจ้งเตือนสำเร็จแล้วในนาทีที่ ${lastSentMinute}`);

            }
            // ถ้านาทีเดิม (เช่น 04:27) ถูกส่งไปแล้ว จะข้ามการส่งซ้ำในรอบ 30 วินาทีนี้
            
        } else {
            // ถ้านาทีเปลี่ยนไปแล้ว (เช่น 04:28) ให้รีเซ็ตสถานะ
            lastSentMinute = -1; 
        }
        
    }, INTERVAL_MS);
};