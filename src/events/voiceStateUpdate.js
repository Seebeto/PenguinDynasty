// src/events/voiceStateUpdate.js

const { EmbedBuilder } = require('discord.js');
require('dotenv').config(); // เพื่อให้เข้าถึง process.env ได้

// 🚨 ดึงค่า ID ช่องจาก .env
const CHANNEL_ID2 = process.env.CHANNEL_ID2;
const CHANNEL_ID3 = process.env.CHANNEL_ID3;

module.exports = {
    name: 'voiceStateUpdate', // ชื่อ Event ที่ Discord.js จะตรวจจับ
    once: false, // Event นี้เกิดขึ้นหลายครั้ง
    
    /**
     * @param {VoiceState} oldState สถานะเสียงก่อนหน้า
     * @param {VoiceState} newState สถานะเสียงปัจจุบัน
     * @param {Client} client อ็อบเจกต์ Client (ถูกส่งมาจาก index.js)
     */
    async execute(oldState, newState, client) {
        
        // 1. ตรวจสอบและค้นหา Channel
        const channel = client.channels.cache.get(CHANNEL_ID2);
        const channellog = client.channels.cache.get(CHANNEL_ID3);
        
        // ตรวจสอบว่ามี Channel ID หรือไม่
        if (!CHANNEL_ID2 || !CHANNEL_ID3) {
            console.error('❌ Missing VOICE_STATUS_CHANNEL_ID or VOICE_LOG_CHANNEL_ID in .env');
            return;
        }

        // ตรวจสอบว่าพบ Channel ใน Discord หรือไม่
        if (!channel || !channellog) {
            console.error(`❌ Channel not found! (Announcement: ${CHANNEL_ID2}, Log: ${CHANNEL_ID3})`);
            return;
        }

        // 2. ตรวจสอบว่ามีการเปลี่ยนแปลงช่องเสียงจริง ๆ
        if (oldState.channelId !== newState.channelId) {
            
            // ------------------------------------
            // A) ถ้าออกจากห้อง (newState ไม่มี channelId)
            // ------------------------------------
            if (!newState.channelId) { 
                // ใช้ oldState.channel.name เพราะ newState.channel เป็น null
                const channelName = oldState.channel ? oldState.channel.name : 'Unknown Channel'; 
                
                const embed = new EmbedBuilder()
                    .setTitle(`${newState.member.user.tag}\nออกจาก\n${channelName}`)
                    .setColor(0xFF7373) // สีแดง
                    .setThumbnail(newState.member.user.avatarURL())
                    .setAuthor({ name: newState.member.user.tag, iconURL: newState.member.user.avatarURL() });
                
                channel.send({ embeds: [embed] });
                console.log(`${newState.member.user.tag} ออกจาก [${channelName}]`);
                channellog.send(`\`${newState.member.user.tag} ออกจาก [${channelName}]\``);

            // ------------------------------------
            // B) ถ้าเข้าห้องใหม่ (oldState ไม่มี channelId)
            // ------------------------------------
            } else if (!oldState.channelId) { 
                const channelName = newState.channel.name;

                const embed = new EmbedBuilder()
                    .setTitle(`${newState.member.user.tag}\nเข้าร่วม\n${channelName}`)
                    .setColor(0xc7ffab) // สีเขียว
                    .setThumbnail(newState.member.user.avatarURL())
                    .setAuthor({ name: newState.member.user.tag, iconURL: newState.member.user.avatarURL() });
                
                channel.send({ embeds: [embed] });
                console.log(`${newState.member.user.tag} เข้าร่วม [${channelName}]`);
                channellog.send(`\`${newState.member.user.tag} เข้าร่วม [${channelName}]\``);

            // ------------------------------------
            // C) ถ้าย้ายห้อง (ย้ายจาก oldState ไป newState)
            // ------------------------------------
            } else { 
                const oldChannelName = oldState.channel.name;
                const newChannelName = newState.channel.name;

                const embed = new EmbedBuilder()
                    .setTitle(`${newState.member.user.username}\nย้ายจาก\n${oldChannelName}\nไปยัง\n${newChannelName}`)
                    .setColor(0x7da8ff) // สีน้ำเงิน
                    .setThumbnail(newState.member.user.avatarURL())
                    .setAuthor({ name: newState.member.user.tag, iconURL: newState.member.user.avatarURL() });
                
                channel.send({ embeds: [embed] });
                console.log(`${newState.member.user.tag} ย้ายจาก [${oldChannelName}] ไปยัง [${newChannelName}]`);
                channellog.send(`\`${newState.member.user.tag} ย้ายจาก [${oldChannelName}] ไปยัง [${newChannelName}]\``);
            }
        }
        
        // 3. (ไม่จำเป็นต้องทำอะไร) ถ้ามีการเปลี่ยนแปลงสถานะอื่น ๆ เช่น ปิด/เปิดไมค์ (Mute/Deaf)
    },
};