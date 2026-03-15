import { sticker } from '../lib/sticker.js';
import uploadFile from '../lib/uploadFile.js';
import uploadImage from '../lib/uploadImage.js';

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let stiker = false;
    const MY_SIGN = "𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓";

    try {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || q.mediaType || '';

        if (/webp|image|video/g.test(mime)) {
            if (/video/g.test(mime) && (q.msg || q).seconds > 10) {
                return m.reply(`『 ⏰ 』- *Il video deve durare meno di 10 secondi.*\n\n${MY_SIGN}`);
            }

            await m.react('⏳');
            let img = await q.download?.();
            if (!img) return m.reply(`『 📸 』- *Errore nel download del media.*`);

            try {
                // Tenta la creazione locale
                stiker = await sticker(img, false, MY_SIGN, MY_SIGN);
            } catch (e) {
                console.error('Creazione locale fallita (controlla ffmpeg):', e);
                
                // Se fallisce, usiamo l'upload (evitando di concatenare 'undefined')
                let out = await (/image/.test(mime) ? uploadImage(img) : uploadFile(img));
                
                if (out && typeof out === 'string' && !out.includes('undefined')) {
                    stiker = await sticker(false, out, MY_SIGN, MY_SIGN);
                } else {
                    throw new Error('Upload fallito o URL corrotto');
                }
            }
        } else if (args[0] && isUrl(args[0])) {
            await m.react('🌐');
            stiker = await sticker(false, args[0], MY_SIGN, MY_SIGN);
        } else {
            return m.reply(`『 📱 』- *Rispondi a un'immagine/video o invia un link valido.*\n\n${MY_SIGN}`);
        }
    } catch (e) {
        console.error('Errore nel processo sticker:', e);
        m.reply(`『 ❌ 』- *Errore durante la creazione dello sticker.*\nAssicurati che ffmpeg sia installato in Termux.`);
        return;
    }

    if (stiker) {
        await m.react('✅');
        await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m);
    }
};

handler.help = ['s', 'sticker'];
handler.tags = ['sticker'];
handler.command = ['s', 'sticker', 'stiker'];

export default handler;

const isUrl = (text) => {
    return text.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b/gi);
};
