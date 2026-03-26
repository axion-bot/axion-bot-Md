const handler = async (m, { conn, text }) => {
  try {
    if (!text) {
      return m.reply('❌ Inserisci la nuova descrizione del gruppo');
    }

    await conn.groupUpdateDescription(m.chat, text);

    await conn.sendMessage(m.chat, {
      text: `✅ *Descrizione aggiornata!*\n\n📌 Nuova bio:\n${text}`
    }, { quoted: m });

  } catch (e) {
    console.error('Errore setbio:', e);
    m.reply('❌ Errore durante la modifica della descrizione');
  }
};

handler.help = ['setbio <testo>'];
handler.tags = ['gruppo'];
handler.command = /^\.setbio$/i;
handler.admin = true;
handler.group = true;

export default handler;