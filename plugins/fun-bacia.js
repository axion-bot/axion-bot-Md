// Plugin: bacia (tagga entrambi)

let handler = async (m, { conn, command, usedPrefix }) => {
  try {
    let target =
      m.mentionedJid?.[0] ||
      m.msg?.contextInfo?.mentionedJid?.[0] ||
      m.quoted?.sender;

    if (!target) {
      return conn.sendMessage(
        m.chat,
        { text: `💋 Usa così: *${usedPrefix + command} @utente* oppure rispondi a un messaggio.` },
        { quoted: m }
      );
    }

    const sender = m.sender
    const senderTag = `@${sender.split('@')[0]}`
    const targetTag = `@${target.split('@')[0]}`

    const frasi = [
      `💋  ${senderTag} ha baciato ${targetTag}`,
    ];

    const frase = frasi[Math.floor(Math.random() * frasi.length)];

    // Reazione
    await conn.sendMessage(m.chat, { react: { text: '💋', key: m.key } });

    // Messaggio con MENZIONE DI ENTRAMBI
    await conn.sendMessage(
      m.chat,
      {
        text: frase,
        mentions: [sender, target],
      },
      { quoted: m }
    );

  } catch (e) {
    console.error('Errore plugin bacia:', e);
  }
};

handler.help = ['bacia @tag', 'bacia (in reply)'];
handler.tags = ['fun'];
handler.command = /^(bacia|kiss|bacino)$/i;

export default handler;
