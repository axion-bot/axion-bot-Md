const handler = async (m, { conn, participants, groupMetadata, args, isOwner, isAdmin }) => {//non dimenticarti di pregare

    const cooldownInMilliseconds = 18 * 60 * 60 * 1000;

    if (!isOwner && !isAdmin) {
        const lastUsed = handler.cooldowns.get(m.sender) || 0;
        const now = Date.now();

        if (now - lastUsed < cooldownInMilliseconds) {
            const timeLeft = cooldownInMilliseconds - (now - lastUsed);
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

            const timeString = `${hours > 0 ? `${hours} ore, ` : ''}${minutes > 0 ? `${minutes} minuti e ` : ''}${seconds} secondi`;

            await m.reply(`⏳ Hai già chiamato gli admin.\nRiprova tra *${timeString}*.`);
            return;
        }

        handler.cooldowns.set(m.sender, now);
    }

    const foto = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || './media/menu/varebotcoc.jpg';

    const adminGruppo = participants.filter(p => p.admin);
    const mentionList = adminGruppo.map(p => p.id);

    const messaggioUtente = args.join(' ');

    const testo = `
╭─〔 🔔 RICHIESTA ADMIN 〕─╮

👤 Utente: @${m.sender.split('@')[0]}

📢 Admin del gruppo:
${mentionList.map((jid, i) => `➤ ${i + 1}. @${jid.split('@')[0]}`).join('\n')}

━━━━━━━━━━━━━━━━━━

💬 Messaggio:
${messaggioUtente || 'Nessuna Messaggio'}

╰────────────────╯
`.trim();

    await conn.sendMessage(m.chat, {
        text: testo,
        contextInfo: {
            mentionedJid: [...mentionList, m.sender],
            externalAdReply: {
                title: groupMetadata.subject,
                body: "🔔 Richiesta agli admin",
                thumbnailUrl: foto,
                mediaType: 1,
                renderLargerThumbnail: false
            }
        }
    }, { quoted: m });

};

handler.cooldowns = new Map();

handler.help = ['admins <messaggio>'];
handler.tags = ['gruppo'];
handler.command = /^(admins)$/i;
handler.group = true;

handler.cooldown = 18 * 60 * 60 * 1000; // 18 ore

export default handler;