import { sticker } from '../lib/sticker.js';
import uploadFile from '../lib/uploadFile.js';
import uploadImage from '../lib/uploadImage.js';

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let stiker = false;
  
  // Firma personalizzata
  const MY_SIGN = "𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓";

  try {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || q.mediaType || '';

    if (/webp|image|video/g.test(mime)) {
      if (/video/g.test(mime) && (q.msg || q).seconds > 10) {
        return m.reply(`『 ⏰ 』- *Il video deve durare meno di 10 secondi.*\n\n${MY_SIGN}`);
      }

      // Reazione e messaggio di attesa "Figo"
      await m.react('⏳');
      let processingMsg = await conn.reply(m.chat, `『 ⚙️ 』- *Sto eseguendo la conversione...*\n\n${MY_SIGN}`, m);

      let img = await q.download?.();
      if (!img) return conn.reply(m.chat, `『 📸 』- *Errore nel download del media.*`, m);

      try {
        // Usiamo la tua firma per il pacchetto e l'autore
        stiker = await sticker(img, false, MY_SIGN, MY_SIGN);
      } catch (e) {
        console.error('Creazione sticker diretta fallita:', e);
        try {
          let out;
          if (/image/g.test(mime)) {
            out = await uploadImage(img);
          } else if (/video/g.test(mime)) {
            out = await uploadFile(img);
          } else {
            out = await uploadImage(img);
          }

          if (typeof out === 'string') {
            stiker = await sticker(false, out, MY_SIGN, MY_SIGN);
          }
        } catch (uploadError) {
          console.error('Caricamento fallito:', uploadError);
          stiker = false;
        }
      }
      
      // Rimuoviamo il messaggio di caricamento dopo aver finito
      await conn.sendMessage(m.chat, { delete: processingMsg.key }).catch(e => {});

    } else if (args[0]) {
      if (isUrl(args[0])) {
        await m.react('🌐');
        stiker = await sticker(false, args[0], MY_SIGN, MY_SIGN);
      } else {
        return m.reply(`『 🔗 』- *URL non valido.*\n\n${MY_SIGN}`);
      }
    }
  } catch (e) {
    console.error('Errore generale:', e);
    stiker = false;
  }

  if (stiker) {
    await m.react('✅');
    await conn.sendFile(
      m.chat,
      stiker,
      'sticker.webp',
      '',
      m,
      true,
      { quoted: m }
    );
  } else {
    return conn.reply(
      m.chat,
      `『 📱 』- *Rispondi a un'immagine o un video per creare lo sticker.*\n\n${MY_SIGN}`,
      m
    );
  }
};

handler.help = ['s', 'sticker', 'stiker'];
handler.tags = ['sticker', 'strumenti'];
handler.command = ['s', 'sticker', 'stiker'];

export default handler;

const isUrl = (text) => {
  return text.match(
    new RegExp(
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png)/,
      'gi'
    )
  );
};
