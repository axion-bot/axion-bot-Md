const handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Estrazione bersaglio
    let who = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);
    
    // Se non c'è tag/quote, pulisce il testo per vedere se è un numero
    if (!who && text) {
        const cleanNumber = text.replace(/[^0-9]/g, '');
        if (cleanNumber.length >= 10) who = cleanNumber + '@s.whatsapp.net';
    }

    if (!who) {
        return conn.sendMessage(m.chat, { 
            text: `⚠️ Tagga un utente, rispondi a un messaggio o scrivi il numero.\n\nEsempio: ${usedPrefix}${command} @utente` 
        }, { quoted: m });
    }

    const targetNumber = who.split('@')[0];

    if (who === conn.user.jid) {
        return m.reply('❌ Non posso segnalare me stesso.');
    }

    await conn.sendMessage(m.chat, { 
        text: `🚀 Avvio procedura disciplinare contro @${targetNumber}...`, 
        mentions: [who] 
    }, { quoted: m });

    try {
        for (let i = 0; i < 5; i++) {
            // 1. Segnalazione (Report) - Struttura corretta Baileys
            try {
                await conn.query({
                    tag: 'iq',
                    attrs: {
                        to: '@s.whatsapp.net',
                        type: 'set',
                        xmlns: 'w:m',
                    },
                    content: [{
                        tag: 'report',
                        attrs: { 
                            jid: who,
                            spam: 'true' // Specifica il motivo se necessario
                        }
                    }]
                });
            } catch (err) {
                console.log(`[Report ${i+1}] Fallito o non supportato.`);
            }

            // 2. Ciclo Blocco/Sblocco (con controllo errore 400)
            try {
                await conn.updateBlockStatus(who, 'block');
                await new Promise(resolve => setTimeout(resolve, 1500)); // Aumentato a 1.5s per evitare 400 Bad Request
                await conn.updateBlockStatus(who, 'unblock');
                await new Promise(resolve => setTimeout(resolve, 1500));
            } catch (err) {
                console.log(`[BlockCycle ${i+1}] Errore: ${err.message}`);
                // Se riceviamo 400, WhatsApp ci sta dicendo di rallentare
                if (err.message.includes('400')) break; 
            }
        }

        // Blocco definitivo finale
        await conn.updateBlockStatus(who, 'block');

        await conn.sendMessage(m.chat, { 
            text: `✅ Operazione completata.\n\nL'utente @${targetNumber} è stato segnalato e rimosso dai contatti attivi.`, 
            mentions: [who] 
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        await m.reply('❌ Errore critico durante l\'esecuzione. Il server potrebbe aver limitato temporaneamente l\'account del bot.');
    }
}

handler.help = ['segnala']
handler.tags = ['owner']
handler.command = /^(segna|segnala)$/i
handler.owner = true 

export default handler
