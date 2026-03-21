let handler = async (m, { conn, args }) => {
  if (!args[0]) {
    return m.reply('❌ Usa il comando così:\n*.fp 393xxxxxxxxx*');
  }

  // Unisce gli argomenti e rimuove tutto ciò che non è numero
  let number = args.join('').replace(/\D/g, '');

  // Controllo minimo di validità
  if (number.length < 8) {
    return m.reply('❌ Numero non valido');
  }

  let jid = number + '@s.whatsapp.net';

  try {
    const url = await conn.profilePictureUrl(jid, 'image');
    await conn.sendMessage(
      m.chat,
      {
        image: { url },
        caption: `🖼 Foto profilo di *@${number}*`,
        mentions: [jid]
      },
      { quoted: m }
    );
  } catch (e) {
    const defaultImg =
      'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

    await conn.sendMessage(
      m.chat,
      {
        image: { url: defaultImg },
        caption: `❌ Non è stato possibile recuperare la foto profilo di *@${number}*.\nMostro immagine di default.`,
        mentions: [jid]
      },
      { quoted: m }
    );
  }
};

handler.help = ['fp <numero>'];
handler.tags = ['tools'];
handler.command = /^fp$/i;

export default handler;