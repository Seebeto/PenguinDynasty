// index.js

const { Client, IntentsBitField, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express'); // 🌐 นำเข้า Express สำหรับ Web Server
require('dotenv').config();

// ----------------------------------------------------------------
// 1. Web Server Setup (สำหรับ Render 24/7 Uptime)
// ----------------------------------------------------------------
const app = express();
// Render จะกำหนด PORT ผ่าน Environment Variable (ถ้าไม่กำหนดเองจะใช้ 3000)
const port = process.env.PORT || 3000;

// Endpoint สำหรับ Uptime Monitor (เช่น UptimeRobot)
app.get('/', (req, res) => {
    // ตอบกลับสถานะ OK เพื่อให้ Render รู้ว่าบอททำงานอยู่
    res.send('Discord Bot is Alive and Well! 🟢'); 
});

// เริ่ม Web Server
app.listen(port, () => {
    console.log(`🌐 Web Server running on port ${port}`);
});

// ----------------------------------------------------------------
// 2. Scheduler และ Client Setup
// ----------------------------------------------------------------
const { startScheduler } = require('./src/scheduler/scheduler'); 

// สร้าง Client และรวม Intents ทั้งหมด
const client = new Client({
    intents: [
        // Intents หลัก (สำหรับ Command, Guilds)
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,      
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        
        // ⭐️ Intents สำหรับ Voice State Update
        IntentsBitField.Flags.GuildVoiceStates,
    ],
});


// ----------------------------------------------------------------
// 3. Event Handler: โหลดไฟล์ Event ทั้งหมดจาก src/events/
// ----------------------------------------------------------------
const eventsPath = path.join(__dirname, 'src/events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);

    // ใช้ Event name ตรงตามมาตรฐาน: 'ready'
    const eventName = event.name; 

    if (event.once) {
        // ใช้ชื่อ event 'ready' ตรงตาม Discord.js
        client.once(eventName, (...args) => event.execute(...args, client));
    } else {
        client.on(eventName, (...args) => event.execute(...args, client));
    }
}
// ----------------------------------------------------------------

// ----------------------------------------------------------------
// 4. Event: Bot Ready (ready) - จุดเรียกใช้ Scheduler
// * ใช้ชื่อ Event 'ready' ตรงตาม Discord.js
// * ถ้าในโฟลเดอร์ src/events มีไฟล์ชื่อ ready.js อยู่แล้ว โค้ดนี้จะไปซ้ำซ้อน
// * แต่ถ้ายังไม่มี ready.js โค้ดนี้จะรับผิดชอบการทำงาน
// ----------------------------------------------------------------
client.once('ready', c => { // ใช้ 'ready' แทน 'clientReady' เพื่อความเข้ากันได้
    console.log(`✅ บอทออนไลน์ในชื่อ ${c.user.tag}`);

    // ⭐️ ตั้งค่า Activity
    c.user.setActivity('แม่มึงอยู่', { 
        type: 0 // ใช้ ActivityType.Listening แทนเลข 0
    });
    // ----------------------------------------------------
    
    // เรียกใช้ Scheduler
    startScheduler(c); 
});
// ----------------------------------------------------------------


// ----------------------------------------------------------------
// 5. Event Handler สำหรับ SIGINT (สำหรับปิดบอทอย่างปลอดภัย)
// ----------------------------------------------------------------
process.on('SIGINT', () => {
    console.log('🤖 ได้รับสัญญาณยุติการทำงาน... กำลังตัดการเชื่อมต่อ');
    client.destroy();
    process.exit(0);
});
// ----------------------------------------------------------------


// 6. สั่งให้บอท Login
client.login(process.env.DISCORD_TOKEN);