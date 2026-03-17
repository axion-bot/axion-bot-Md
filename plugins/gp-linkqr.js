import QRCode from 'qrcode'

const handler = async (m, { conn }) => {

  if (!m.isGroup) {
    return m.reply('❌ Questo comando funziona solo nei gruppi.');
  }

  // Controllo owner reale
  const sender = m.sender;
  const BOT_OWNERS = global.owner.map(o => o[0] + '@s.whatsapp.net');

  if (!BOT_OWNERS.includes(sender)) {
    return m.reply('❌ Comando riservato al vero Owner del bot.');
  }

  // Il bot deve essere admin
  const metadata = await conn.groupMetadata(m.chat);
  const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
  const botIsAdmin = metadata.participants.find(p => p.jid === botJid)?.admin;

  if (!botIsAdmin) {
    return m.reply('❌ Devo essere admin per ottenere il QR del gruppo.');
  }

  try {
    // Prende codice invito
    const code = await conn.groupInviteCode(m.chat);
    const link = `https://chat.whatsapp.com/${code}`;

    // Genera QR
    const qrBuffer = await QRCode.toBuffer(link, {
      type: 'png',
      width: 900,
      margin: 2,
      errorCorrectionLevel: 'H'
    });

    await conn.sendMessage(m.chat, {
      image: qrBuffer,
      caption: `📌 *QR DEL GRUPPO*\n\n🔗 Link:\n${link}`
    }, { quoted: m });

  } catch (error) {
    console.error(error);
    m.reply('❌ Errore durante la generazione del QR.');
  }
};

handler.command = ['qrgruppo'];
handler.admin = false; // SOLO admin

export default handler;
