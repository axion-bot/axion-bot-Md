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
    return m.reply('❌ Devo essere admin per reimpostare il link del gruppo.');
  }

  try {
    // Revoca link attuale
    await conn.groupRevokeInvite(m.chat);

    // Genera nuovo codice
    const newCode = await conn.groupInviteCode(m.chat);
    const newLink = `https://chat.whatsapp.com/${newCode}`;

    await conn.sendMessage(m.chat, {
      text: `👑 *LINK REIMPOSTATO DALL'OWNER*\n\n🔄 Il vecchio link è stato revocato.\n\n🔗 Nuovo link:\n${newLink}`
    });

  } catch (error) {
    console.error(error);
    m.reply('❌ Errore durante la reimpostazione del link.');
  }
};

handler.command = ['reimpostagp'];
handler.rowner = true; // SOLO owner reale

export default handler;
