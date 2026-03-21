let handler = async (m) => {
  global.db.data.chats[m.chat].isBanned = false;
  let message = '𝐌𝐨𝐝𝐚𝐥𝐢𝐭à 𝐀𝐅𝐊 𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐚';
  await conn.sendMessage(m.chat, { 
      text: message,
      contextInfo: {
          forwardingScore: 99,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
              newsletterJid: '120363424041538498@newsletter',
              serverMessageId: '',
              newsletterName: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
          }
      }
  }, { quoted: m });
};

handler.help = ['unbanchat'];
handler.tags = ['owner'];
handler.command = /^wakeywakey$/i;
handler.rowner = true;
export default handler;