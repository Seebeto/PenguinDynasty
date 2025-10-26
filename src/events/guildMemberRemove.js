const { EmbedBuilder } = require('discord.js');

const CHANNEL_ID1 = process.env.CHANNEL_ID1;
const ICONURL1 = process.env.ICONURL1;


module.exports = {
    name: 'guildMemberRemove',
    once: false,
    
    async execute(member) {
        if (!member.guild) return; 
        
        // 🚨 แก้ไขการตรวจสอบ: ตรวจสอบ member.partial เพื่อดึงข้อมูลหากจำเป็น
        // ถ้า member.user เป็น partial และเราต้องการ avatarURL/tag ต้องดึงข้อมูล user
        if (member.user.partial) {
            try {
                await member.user.fetch(); // ดึงข้อมูล user หากเป็น Partial
            } catch (error) {
                console.error('ไม่สามารถดึงข้อมูล User สำหรับ guildMemberRemove ได้:', error);
                return; // ออกจากการทำงาน
            }
        }
        
        // ตรวจสอบ Channel ID
        if (!CHANNEL_ID1) {
            console.error("Missing Channel ID in .env file.");
            return;
        }

        const channel = member.guild.channels.cache.get(CHANNEL_ID1);
        if (!channel) {
            console.error(`ไม่พบ Channel ID: ${CHANNEL_ID1}`);
            return;
        }

        // โค้ด Embed
        const name = member.toString(); // หรือใช้ member.user.tag หากต้องการชื่อที่ชัดเจน
        const serverName = member.guild.name;
        const embed = new EmbedBuilder()
            .setTitle("PenguinDynasty")
            .setURL("https://discord.gg/r9bGzAZHMe")
            .setDescription(`***มีคนออกจาก ${serverName} Server !***`)
            .setColor(0xff0000)
            .setTimestamp()
            .setAuthor({ name: 'แจ้งเตือน' })
            .addFields({ name: 'ชื่อ', value: name, inline: false })
            .setFooter({
              text: "เวลาที่ออก",
              iconURL: (ICONURL1),
    })
            .setThumbnail(member.user.avatarURL()); // ตรงนี้ต้องการข้อมูล user ที่สมบูรณ์

        await channel.send({ embeds: [embed] });
    },
};