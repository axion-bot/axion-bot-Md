let handler = async (m, { conn, command, usedPrefix }) => {
    let staff = `
ㅤㅤ⋆｡˚『 ╭ \`STAFF 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓\` ╯ 』˚｡⋆\n╭\n│
│ 『 🤖 』 \`Bot:\` *${global.nomebot}*
│ 『 🍥 』 \`Versione:\` *${global.versione}*
│
│⭒─ׄ─『 👑 \`Sviluppatore\` 』 ─ׄ─⭒
│
│ • \`Nome:\` *Deadly*
│ • \`Ruolo:\` *Creatore / dev*
│ • \`Contatto:\` @212778494602
│
│⭒─ׄ─『 🛡️ \`Moderatori\` 』 ─ׄ─⭒
│
│ • \`Nome:\` *Luxifer*
│ • \`Ruolo:\` *Moderatore*
│ • \`Contatto:\` @212781816909
│
│ • \`Nome:\` *Bonzino*
│ • \`Ruolo:\` *Moderatore*
│ • \`Contatto:\` @639350468907
│
│─ׄ─『 📌 \`Info Utili\` 』 ─ׄ─⭒
│
│ • \`GitHub:\` *github.com/realvare*
│ • \`Supporto:\` @393509594333
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;
    await conn.reply(
        m.chat, 
        staff.trim(), 
        m, 
        { 
            ...global.fake,
            contextInfo: {
                ...global.fake,
                mentionedJid: ['212778494602@s.whatsapp.net', '212781816909@s.whatsapp.net', '639350468907@s.whatsapp.net'],
                externalAdReply: {
                    renderLargerThumbnail: true,
                    title: 'STAFF - UFFICIALE',
                    body: 'Supporto e Moderazione',
                    mediaType: 1,
                    sourceUrl: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
                    thumbnailUrl: 'https://i.ibb.co/rfXDzMNQ/aizenginnigga.jpg'
                }
            }
        }
    );

    await conn.sendMessage(m.chat, {
        contacts: {
            contacts: [
                {
                    vcard: `BEGIN:VCARD
VERSION:3.0
FN:Deadly
ORG:𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 - Creatore
TEL;type=CELL;type=VOICE;waid=212778494602:212778494602
END:VCARD`
                },
                {
                    vcard: `BEGIN:VCARD
VERSION:3.0
FN:Luxifer
ORG:𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 - Moderatore
TEL;type=CELL;type=VOICE;waid=212781816909:+212781816909
END:VCARD`
                },
                {
                    vcard: `BEGIN:VCARD
VERSION:3.0
FN:Bonzino
ORG:𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 - Moderatore
TEL;type=CELL;type=VOICE;waid=639350468907:+639350468907
END:VCARD`
                }
            ]
        }
    }, { quoted: m });

    m.react('🉐');
};

handler.help = ['staff'];
handler.tags = ['main'];
handler.command = ['staff', 'moderatori', 'collaboratori'];

export default handler;
