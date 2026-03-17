const handler = async (m, { conn, usedPrefix, command }) => {
  // --- CONFIGURAZIONE DATI ---
  const botName = "𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓";
  const creator = "Deadly, luxifer, bonzino"; // Inserisci il tuo nome
  const owners = [
    { name: "Deadly", number: "212778494602" }, // Sostituisci con i numeri reali
    { name: "Luxifer", number: "212781816909" }, 
    { name: "Bonzino", number: "639350468907"} 
  ];

  // --- COSTRUZIONE MESSAGGIO ---
  let caption = `*─── 「 ${botName} 」 ───*\n\n`;
  caption += `*🧱 𝐂𝐑𝐄𝐀𝐓𝐎𝐑𝐄:* ${creator}\n`;
  caption += `*👑 𝐎𝐖𝐍𝐄𝐑𝐒:* \n`;
  
  owners.forEach((owner, index) => {
    caption += `  ◦  @${owner.number} (${owner.name})\n`;
  });

  caption += `\n*𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓* - _Sempre al tuo servizio._`;

  // --- INVIO ---
  await conn.sendMessage(m.chat, {
    text: caption,
    mentions: owners.map(o => o.number + '@s.whatsapp.net')
  }, { quoted: m });
};

handler.help = ['staff'];
handler.tags = ['main'];
handler.command = /^(staff)$/i;

export default handler;
