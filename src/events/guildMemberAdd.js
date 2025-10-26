const { EmbedBuilder } = require('discord.js');

const CHANNEL_ID1 = process.env.CHANNEL_ID1;
const ICONURL1 = process.env.ICONURL1;

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    
    async execute(member) { 
        if (!member.guild) return; 

        // ตรวจสอบว่า Channel ID ถูกตั้งค่าไว้หรือไม่
        if (!CHANNEL_ID1) {
            console.error("Missing JOIN_LEAVE_CHANNEL_ID in .env file.");
            return;
        }

        const channel = member.guild.channels.cache.get(CHANNEL_ID1);
        if (!channel) {
            console.error(`ไม่พบ Channel ID: ${CHANNEL_ID1}`);
            return;
        }

        // ... โค้ดส่วนที่เหลือ (ใช้ CHANNEL_ID1 และ ICONURL1 ตามปกติ)
  const name = member.toString(); // ใช้ member.toString() แทน member.mention
  const serverName = member.guild.name;
  const embed = new EmbedBuilder()
    .setTitle("PenguinDynasty")
    .setURL("https://discord.gg/r9bGzAZHMe")
    .setDescription(`***มีคนเข้าร่วม ${serverName} Server !***`)
    .setColor(0x00ff1e)
    .setTimestamp()
    .setAuthor({ name: 'แจ้งเตือน' })
    .addFields({ name: 'ชื่อ', value: name, inline: false })
    .setFooter({
      text: "เวลาที่เข้า",
      iconURL: (ICONURL1),
    })
    .setThumbnail(member.user.avatarURL());

  await channel.send({ embeds: [embed] });
    },
};