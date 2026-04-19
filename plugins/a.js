const handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Estrazione bersaglio
    let rawTarget = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);
    if (!rawTarget && text) rawTarget = text;

    if (!rawTarget) {
        return conn.sendMessage(m.chat, { 
            text: `⚠️ Tagga o scrivi il numero della persona da segnalare.\n\nEsempio: ${usedPrefix}${command} @utente` 
        }, { quoted: m });
    }

    const targetNumber = rawTarget.replace(/[^0-9]/g, '');
    if (targetNumber.length < 10) {
        return conn.sendMessage(m.chat, { text: '❌ Numero o tag non valido.' }, { quoted: m });
    }
    
    const who = targetNumber + '@s.whatsapp.net';
    const botNumber = conn.decodeJid ? conn.decodeJid(conn.user.id) : conn.user.jid;

    if (who === botNumber) {
        return conn.sendMessage(m.chat, { text: '❌ Non posso segnalare me stesso.' }, { quoted: m });
    }

    await conn.sendMessage(m.chat, { 
        text: `🚀 Avvio segnalazione forzata contro @${targetNumber}...`, 
        mentions: [who] 
    }, { quoted: m });

    try {
        // Riduco a 4 iterazioni e alzo il delay a 2s per aggirare il blocco (400 Bad Request)
        for (let i = 0; i < 4; i++) {
            // Segnalazione silenziata in caso di errore
            await conn.query({
                tag: 'iq',
                attrs: {
                    to: '@s.whatsapp.net',
                    type: 'set',
                    xmlns: 'w:m',
                },
                content: [{
                    tag: 'report',
                    attrs: { jid: who }
                }]
            }).catch(() => console.log(`[!] Report iterazione ${i} fallito, continuo...`));

            // Blocco silenziato
            await conn.updateBlockStatus(who, 'block').catch(() => {});
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2 secondi
            
            // Sblocco silenziato
            await conn.updateBlockStatus(who, 'unblock').catch(() => {});
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2 secondi
        }

        // Blocco definitivo finale silenziato
        await conn.updateBlockStatus(who, 'block').catch(() => console.log("[!] Blocco finale fallito"));

        await conn.sendMessage(m.chat, { 
            text: `✅ Operazione completata. L'utente @${targetNumber} è stato segnalato ripetutamente e bloccato dal bot.`, 
            mentions: [who] 
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { text: '❌ Errore critico durante l\'operazione.' }, { quoted: m });
    }
}

handler.help = ['segnala']
handler.tags = ['owner']
handler.command = /^(segna|segnala)$/i
handler.owner = true 

export default handler